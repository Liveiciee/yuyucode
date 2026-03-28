// ============================================================
// FILE: src/api.js
// Refactored AI Orchestration Layer
// ============================================================

import { 
  CEREBRAS_KEY, 
  GROQ_KEY, 
  YUYU_SERVER,   
  WS_SERVER,
  MODELS,
  FALLBACK_MODEL
} from './constants.js';
import { 
  getRuntimeCerebrasKey, 
  getRuntimeGroqKey 
} from './runtimeKeys.js';

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
  MAX_TOKENS: 4096,
  DEFAULT_TEMPERATURE: 0.3,
  MAX_RETRIES: 2,
  RETRY_DELAY_BASE: 2000,
  RATE_LIMIT_RETRY_DEFAULT: 60,
  CEREBRAS_URL: 'https://api.cerebras.ai/v1/chat/completions',
  GROQ_URL: 'https://api.groq.com/openai/v1/chat/completions',
  GROQ_FALLBACK_CHAIN: [
    'moonshotai/kimi-k2-instruct-0905',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ],
});


// ──────────────────────────────────────────────────────────────────────────────
// ERROR CLASSES
// ──────────────────────────────────────────────────────────────────────────────
class AIError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.details = details;
  }
}

class RateLimitError extends AIError {
  constructor(retryAfter) {
    super(`RATE_LIMIT:${retryAfter}`, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

class ServerError extends AIError {
  constructor(provider, statusCode, details) {
    super(`${provider} server error: ${statusCode}`, 'SERVER_ERROR', { provider, statusCode, details });
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AIError {
  constructor(field, message) {
    super(`Validation failed: ${field} - ${message}`, 'VALIDATION_ERROR');
    this.field = field;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// KEY MANAGEMENT
// ──────────────────────────────────────────────────────────────────────────────
function getCerebrasKey() {
  return getRuntimeCerebrasKey() || CEREBRAS_KEY;
}

function getGroqKey() {
  return getRuntimeGroqKey() || GROQ_KEY;
}

// ──────────────────────────────────────────────────────────────────────────────
// VALIDATORS
// ──────────────────────────────────────────────────────────────────────────────
function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new ValidationError('messages', 'Must be an array');
  }
  if (messages.length === 0) {
    throw new ValidationError('messages', 'Cannot be empty');
  }
  for (const [idx, msg] of messages.entries()) {
    if (!msg.role || !msg.content) {
      throw new ValidationError(`messages[${idx}]`, 'Missing role or content');
    }
  }
  return true;
}

function validateApiKey(key, provider) {
  if (!key || key.trim() === '') {
    throw new ValidationError('apiKey', `${provider} API key is required`);
  }
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// VISION SUPPORT
// ──────────────────────────────────────────────────────────────────────────────
function injectVisionImage(messages, imageBase64) {
  if (!imageBase64) return messages;
  
  return messages.map((msg, idx) => {
    if (idx !== messages.length - 1 || msg.role !== 'user') {
      return msg;
    }
    
    const text = typeof msg.content === 'string' 
      ? msg.content
      : Array.isArray(msg.content)
        ? msg.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
        : '';
    
    return {
      ...msg,
      content: [
        { type: 'text', text },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    };
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// SSE STREAM READER
// ──────────────────────────────────────────────────────────────────────────────
async function readSSEStream(response, onChunk, signal) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  
  try {
    while (true) {
      let done, value;
      
      try {
        ({ done, value } = await reader.read());
      } catch (readError) {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        break;
      }
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        if (line === 'data: [DONE]') continue;
        
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices?.[0]?.delta?.content || '';
          fullContent += content;
          onChunk?.(fullContent);
        } catch (parseError) {
          console.warn('[SSE Parse Warning]', parseError.message);
        }
      }
    }
    
    // Handle remaining buffer
    if (buffer.startsWith('data: ') && buffer !== 'data: [DONE]') {
      try {
        const json = JSON.parse(buffer.slice(6));
        const content = json.choices?.[0]?.delta?.content || '';
        fullContent += content;
        onChunk?.(fullContent);
      } catch (parseError) {
        console.warn('[SSE Parse Warning]', parseError.message);
      }
    }
  } finally {
    try { reader.releaseLock(); } catch (e) { /* ignore */ }
  }
  
  return fullContent;
}

// ──────────────────────────────────────────────────────────────────────────────
// BASE AI REQUEST HANDLER
// ──────────────────────────────────────────────────────────────────────────────
async function makeAIRequest({
  url,
  apiKey,
  provider,
  messages,
  model,
  onChunk,
  signal,
  options = {},
}) {
  validateMessages(messages);
  validateApiKey(apiKey, provider);
  
  const requestBody = {
    model,
    messages,
    max_tokens: options.maxTokens ?? CONFIG.MAX_TOKENS,
    stream: true,
    temperature: options.temperature ?? CONFIG.DEFAULT_TEMPERATURE,
  };
  
  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('retry-after') || String(CONFIG.RATE_LIMIT_RETRY_DEFAULT), 10);
    throw new RateLimitError(retryAfter);
  }
  
  if (response.status >= 500) {
    throw new ServerError(provider, response.status);
  }
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new AIError(`${provider} error: HTTP ${response.status}`, 'HTTP_ERROR', {
      statusCode: response.status,
      details: errorText.slice(0, 200),
    });
  }
  
  return readSSEStream(response, onChunk, signal);
}

// ──────────────────────────────────────────────────────────────────────────────
// CEREBRAS PROVIDER
// ──────────────────────────────────────────────────────────────────────────────
async function cerebrasRequest(messages, model, onChunk, signal, options) {
  const apiKey = getCerebrasKey();
  const processedMessages = injectVisionImage(messages, options?.imageBase64);
  
  return makeAIRequest({
    url: CONFIG.CEREBRAS_URL,  // ✅ Now exists in CONFIG
    apiKey,
    provider: 'Cerebras',
    messages: processedMessages,
    model,
    onChunk,
    signal,
    options,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// GROQ PROVIDER
// ──────────────────────────────────────────────────────────────────────────────
async function groqRequest(messages, model, onChunk, signal, options) {
  const apiKey = getGroqKey();
  const processedMessages = injectVisionImage(messages, options?.imageBase64);
  
  return makeAIRequest({
    url: CONFIG.GROQ_URL,  // ✅ Now exists in CONFIG
    apiKey,
    provider: 'Groq',
    messages: processedMessages,
    model,
    onChunk,
    signal,
    options,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// FALLBACK LOGIC
// ──────────────────────────────────────────────────────────────────────────────
async function tryGroqFallbackChain(messages, onChunk, signal, options) {
  for (const fallbackModel of CONFIG.GROQ_FALLBACK_CHAIN) {
    try {
      options?.onFallback?.(fallbackModel);
      return await groqRequest(messages, fallbackModel, onChunk, signal, options);
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      if (error.code === 'RATE_LIMIT' || error.code === 'SERVER_ERROR') continue;
      throw error;
    }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATION FUNCTION
// ──────────────────────────────────────────────────────────────────────────────
export async function askAIStream(messages, model, onChunk, signal, options = {}) {
  validateMessages(messages);
  
  const modelDef = MODELS.find(m => m.id === model);
  const provider = modelDef?.provider || 'cerebras';
  
  if (provider === 'groq') {
    try {
      return await groqRequest(messages, model, onChunk, signal, options);
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'RATE_LIMIT') {
        throw error;
      }
      if (error.code === 'SERVER_ERROR' && (options._attempt ?? 0) < CONFIG.MAX_RETRIES) {
        const attempt = options._attempt ?? 0;
        const delay = (attempt + 1) * CONFIG.RETRY_DELAY_BASE;
        await new Promise(resolve => setTimeout(resolve, delay));
        return askAIStream(messages, model, onChunk, signal, { ...options, _attempt: attempt + 1 });
      }
      throw error;
    }
  }
  
  // Cerebras provider with fallback
  try {
    return await cerebrasRequest(messages, model, onChunk, signal, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    
    if (error.code === 'RATE_LIMIT' && getGroqKey()) {
      const fallbackResult = await tryGroqFallbackChain(messages, onChunk, signal, options);
      if (fallbackResult !== null) return fallbackResult;
      throw error;
    }
    
    if (error.code === 'SERVER_ERROR' || error.code === 'HTTP_ERROR') {
      if ((options._attempt ?? 0) < CONFIG.MAX_RETRIES) {
        const attempt = options._attempt ?? 0;
        const delay = (attempt + 1) * CONFIG.RETRY_DELAY_BASE;
        await new Promise(resolve => setTimeout(resolve, delay));
        return askAIStream(messages, model, onChunk, signal, { ...options, _attempt: attempt + 1 });
      }
    }
    
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// SERVER COMMUNICATION (HTTP)
// ──────────────────────────────────────────────────────────────────────────────
export async function callServer(payload) {
  try {
    const response = await fetch(YUYU_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return { ok: false, data: `Server error: ${response.status} — ${errorText.slice(0, 200)}` };
    }
    
    return await response.json();
  } catch (error) {
    return { 
      ok: false, 
      data: 'YuyuServer tidak dapat dihubungi. Jalankan: node yuyu-server.cjs &' 
    };
  }
}

export async function callServerBatch(payloads) {
  return Promise.all(payloads.map(payload => callServer(payload)));
}

// ──────────────────────────────────────────────────────────────────────────────
// WEBSOCKET EXECUTION STREAM
// ──────────────────────────────────────────────────────────────────────────────
export function execStream(command, cwd, onLine, signal) {
  return new Promise((resolve, reject) => {
    let ws;
    
    try {
      ws = new WebSocket(WS_SERVER);
    } catch (error) {
      reject(new Error('WebSocket tidak tersedia'));
      return;
    }
    
    const id = `exec_${Date.now()}`;
    let output = '';
    let settled = false;
    
    const cleanup = () => {
      try { ws.close(); } catch (e) { /* ignore */ }
    };
    
    const done = (exitCode) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ exitCode, output });
    };
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'exec_stream', id, command, cwd }));
    };
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id !== id) return;
        
        if (msg.type === 'stdout' || msg.type === 'stderr') {
          output += msg.data;
          onLine?.(msg.data, msg.type);
        } else if (msg.type === 'exit') {
          onLine?.(`\n[exit ${msg.code}]`, 'exit');
          done(msg.code);
        } else if (msg.type === 'error') {
          onLine?.(`\n[error: ${msg.data}]`, 'stderr');
          done(-1);
        }
      } catch (parseError) {
        console.warn('[WebSocket Parse Warning]', parseError.message);
      }
    };
    
    ws.onerror = () => {
      if (!settled) {
        settled = true;
        reject(new Error('WebSocket error'));
      }
    };
    
    ws.onclose = () => {
      if (!settled) done(-1);
    };
    
    if (signal) {
      signal.addEventListener('abort', () => {
        try {
          ws.send(JSON.stringify({ type: 'kill', id }));
        } catch (e) { /* ignore */ }
        cleanup();
        if (!settled) {
          settled = true;
          reject(new DOMException('Aborted', 'AbortError'));
        }
      }, { once: true });
    }
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILITY EXPORTS
// ──────────────────────────────────────────────────────────────────────────────
export { 
  AIError, 
  RateLimitError, 
  ServerError, 
  ValidationError,
  CONFIG,
  MODELS,
  FALLBACK_MODEL,
};
export { askAIStream as askCerebrasStream };
