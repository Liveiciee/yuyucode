import { CEREBRAS_KEY, GROQ_KEY, YUYU_SERVER, WS_SERVER, MODELS, FALLBACK_MODEL } from './constants.js';

// ── SHARED SSE STREAM READER ───────────────────────────────────────────────────
export async function readSSEStream(resp, onChunk, signal) {
  const reader  = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = '', buffer = '';
  try {
    while (true) {
      let done, value;
      try { ({ done, value } = await reader.read()); }
      catch (_readErr) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        break;
      }
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        try {
          const content = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content || '';
          full += content;
          onChunk(full);
        } catch (_e) { }
      }
    }
    // flush
    if (buffer.startsWith('data: ') && buffer !== 'data: [DONE]') {
      try {
        const content = JSON.parse(buffer.slice(6)).choices?.[0]?.delta?.content || '';
        full += content; onChunk(full);
      } catch (_e) { }
    }
  } finally {
    try { reader.releaseLock(); } catch (_e) { }
  }
  return full;
}

// ── INJECT VISION IMAGE ────────────────────────────────────────────────────────
function injectVision(messages, imageBase64) {
  if (!imageBase64) return messages;
  return messages.map((m, i) => {
    if (i !== messages.length - 1 || m.role !== 'user') return m;
    const text = typeof m.content === 'string' ? m.content
      : Array.isArray(m.content) ? m.content.filter(c=>c.type==='text').map(c=>c.text).join(' ') : '';
    return { ...m, content: [
      { type: 'text', text },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageBase64 } },
    ]};
  });
}

// ── CEREBRAS STREAMING ─────────────────────────────────────────────────────────
async function _cerebrasOnce(messages, model, onChunk, signal, options) {
  const resp = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CEREBRAS_KEY },
    body: JSON.stringify({
      model,
      messages: injectVision(messages, options.imageBase64),
      max_tokens: options.maxTokens || 4096,
      stream: true,
      temperature: options.temperature || 0.3,
    }),
  });
  if (resp.status === 429) {
    const retry = parseInt(resp.headers.get('retry-after') || '60', 10);
    throw new Error(`RATE_LIMIT:${retry}`);
  }
  if (resp.status >= 500) throw new Error(`CEREBRAS_SERVER:${resp.status}`);
  if (!resp.ok) throw new Error(`Cerebras error: HTTP ${resp.status}`);
  return readSSEStream(resp, onChunk, signal);
}

// ── GROQ STREAMING ─────────────────────────────────────────────────────────────
async function _groqOnce(messages, model, onChunk, signal, options) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
    body: JSON.stringify({
      model,
      messages: injectVision(messages, options.imageBase64),
      max_tokens: options.maxTokens || 4096,
      stream: true,
      temperature: options.temperature || 0.3,
    }),
  });
  if (resp.status === 429) {
    const retry = parseInt(resp.headers.get('retry-after') || '30', 10);
    throw new Error(`RATE_LIMIT:${retry}`);
  }
  if (resp.status >= 500) throw new Error(`GROQ_SERVER:${resp.status}`);
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Groq error: HTTP ${resp.status} — ${err.slice(0, 100)}`);
  }
  return readSSEStream(resp, onChunk, signal);
}

// ── UNIFIED AI CALL — auto-fallback Cerebras → Groq ───────────────────────────
// - Cerebras model → tries Cerebras, jika rate limit → fallback ke Groq (kimi-k2)
// - Groq model → langsung ke Groq
export async function askCerebrasStream(messages, model, onChunk, signal, options = {}, _attempt = 0) {
  if (!Array.isArray(messages) || messages.length === 0)
    throw new Error('Messages must be a non-empty array');

  const modelDef  = MODELS.find(m => m.id === model);
  const provider  = modelDef?.provider || 'cerebras';

  // ── Groq model: langsung ke Groq ──
  if (provider === 'groq') {
    try {
      return await _groqOnce(messages, model, onChunk, signal, options);
    } catch (e) {
      if (e.name === 'AbortError' || e.message.startsWith('RATE_LIMIT:')) throw e;
      if (_attempt < 2 && e.message.startsWith('GROQ_SERVER:')) {
        await new Promise(r => setTimeout(r, (_attempt + 1) * 2000));
        return askCerebrasStream(messages, model, onChunk, signal, options, _attempt + 1);
      }
      throw e;
    }
  }

  // ── Cerebras model: try Cerebras, fallback Groq on rate limit ──
  try {
    return await _cerebrasOnce(messages, model, onChunk, signal, options);
  } catch (e) {
    if (e.name === 'AbortError') throw e;

    // Rate limit → auto-switch ke Groq
    if (e.message.startsWith('RATE_LIMIT:') && GROQ_KEY) {
      const fallbackModel = FALLBACK_MODEL;
      try {
        return await _groqOnce(messages, fallbackModel, onChunk, signal, options);
      } catch (ge) {
        if (ge.name === 'AbortError') throw ge;
        // Groq juga rate limit? lempar error asli biar timer tetap jalan
        throw e;
      }
    }

    // Server error → retry
    if (_attempt < 2 && (e.message.startsWith('CEREBRAS_SERVER:') || e.message.includes('fetch'))) {
      await new Promise(r => setTimeout(r, (_attempt + 1) * 2000));
      return askCerebrasStream(messages, model, onChunk, signal, options, _attempt + 1);
    }

    throw e;
  }
}

// ── CALL SERVER (HTTP) ─────────────────────────────────────────────────────────
export async function callServer(payload) {
  try {
    const resp = await fetch(YUYU_SERVER, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.text();
      return { ok: false, data: `Server error: ${resp.status} — ${err.slice(0, 200)}` };
    }
    return await resp.json();
  } catch(_e) {
    return { ok: false, data: 'YuyuServer tidak dapat dihubungi. Jalankan: node ~/yuyu-server.js &' };
  }
}

// ── EXEC STREAM via WebSocket ──────────────────────────────────────────────────
export function execStream(command, cwd, onLine, signal) {
  return new Promise((resolve, reject) => {
    let ws;
    try { ws = new WebSocket(WS_SERVER); }
    catch(_e) { reject(new Error('WebSocket tidak tersedia')); return; }

    const id = 'exec_' + Date.now();
    let output = '', settled = false;

    const cleanup = () => { try { ws.close(); } catch (_e) { } };
    const done = (exitCode) => {
      if (settled) return;
      settled = true; cleanup(); resolve({ exitCode, output });
    };

    ws.onopen = () => ws.send(JSON.stringify({ type: 'exec_stream', id, command, cwd }));
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.id !== id) return;
        if (msg.type === 'stdout' || msg.type === 'stderr') {
          output += msg.data; onLine?.(msg.data, msg.type);
        } else if (msg.type === 'exit') {
          onLine?.('\n[exit ' + msg.code + ']', 'exit'); done(msg.code);
        } else if (msg.type === 'error') {
          onLine?.('\n[error: ' + msg.data + ']', 'stderr'); done(-1);
        }
      } catch (_e) { }
    };
    ws.onerror = () => { if (!settled) { settled = true; reject(new Error('WebSocket error')); } };
    ws.onclose = () => { if (!settled) done(-1); };

    if (signal) {
      signal.addEventListener('abort', () => {
        try { ws.send(JSON.stringify({ type: 'kill', id })); } catch (_e) { }
        cleanup();
        if (!settled) { settled = true; reject(new DOMException('Aborted', 'AbortError')); }
      }, { once: true });
    }
  });
}

// ── CALL SERVER BATCH ──────────────────────────────────────────────────────────
export async function callServerBatch(payloads) {
  return Promise.all(payloads.map(p => callServer(p)));
}
