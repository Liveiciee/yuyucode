/**
 * YuyuCode API Layer - Integrated Version
 * Combines best features from both codebases
 * @module api
 */

import { logger } from './utils.js'
import { CEREBRAS_KEY, GROQ_KEY, YUYU_SERVER, WS_SERVER, MODELS, FALLBACK_MODEL } from './constants.js'
import { getRuntimeCerebrasKey, getRuntimeGroqKey } from './runtimeKeys.js'

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
  // Server Configuration
  SERVER: {
    PORT: 8765,
    WS_PORT: 8766,
    HEALTH_TIMEOUT: 2000,
    REQUEST_TIMEOUT: 30000,
    WS_RECONNECT_MAX: 3,
    WS_RECONNECT_DELAY_BASE: 1000,
  },

  // AI Request Configuration
  AI: {
    REQUEST_TIMEOUT: 60000,
    MAX_TOKENS: 4096,
    DEFAULT_TEMPERATURE: 0.3,
  },

  // Retry Configuration (from old code)
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
  },

  // API Endpoints
  API: {
    CEREBRAS_URL: 'https://api.cerebras.ai/v1/chat/completions',
    GROQ_URL: 'https://api.groq.com/openai/v1/chat/completions',
  },

  // Groq Fallback Chain (from new code)
  GROQ_FALLBACK_CHAIN: [
    'moonshotai/kimi-k2-instruct-0905',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
  ],
})

// Server URLs (can be overridden by imports)
const YUYU_SERVER = `http://127.0.0.1:${CONFIG.SERVER.PORT}`
const WS_SERVER = `ws://127.0.0.1:${CONFIG.SERVER.WS_PORT}`

// API Keys (can be overridden by imports)
// const CEREBRAS_KEY = process.env.CEREBRAS_KEY || ''
const CEREBRAS_KEY = ''
// const GROQ_KEY = process.env.GROQ_KEY || ''
const GROQ_KEY = ''

// Models configuration (from new code)
const MODELS = [
  { id: 'llama3.1-8b', provider: 'cerebras', name: 'Llama 3.1 8B' },
  { id: 'qwen-32b', provider: 'cerebras', name: 'Qwen 2.5 32B' },
  { id: 'qwen-72b', provider: 'cerebras', name: 'Qwen 2.5 72B' },
  { id: 'llama-3.3-70b-versatile', provider: 'groq', name: 'Llama 3.3 70B' },
  { id: 'llama-3.1-8b-instant', provider: 'groq', name: 'Llama 3.1 8B' },
  { id: 'mixtral-8x7b-32768', provider: 'groq', name: 'Mixtral 8x7B' },
]

// ──────────────────────────────────────────────────────────────────────────────
// LOGGING (from old code - using console as fallback)
// ──────────────────────────────────────────────────────────────────────────────
const logger = {
  debug: (...args) => console.debug('[DEBUG]', ...args),
  info: (...args) => console.info('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
}

// ──────────────────────────────────────────────────────────────────────────────
// ERROR CLASSES (from new code - enhanced)
// ──────────────────────────────────────────────────────────────────────────────
class AIError extends Error {
  constructor(message, code, details = {}) {
    super(message)
    this.name = 'AIError'
    this.code = code
    this.details = details
  }
}

class RateLimitError extends AIError {
  constructor(retryAfter = 60) {
    super(`Rate limit exceeded. Retry after ${retryAfter}s`, 'RATE_LIMIT')
    this.retryAfter = retryAfter
  }
}

class ServerError extends AIError {
  constructor(provider, statusCode, details = {}) {
    super(`${provider} server error: ${statusCode}`, 'SERVER_ERROR', { provider, statusCode, ...details })
    this.provider = provider
    this.statusCode = statusCode
  }
}

class ValidationError extends AIError {
  constructor(field, message) {
    super(`Validation failed: ${field} - ${message}`, 'VALIDATION_ERROR')
    this.field = field
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS (from old code)
// ──────────────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Calculate exponential backoff delay (from old code)
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number}
 */
const getBackoffDelay = (attempt) => {
  const delay = CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt)
  return Math.min(delay, CONFIG.RETRY.MAX_DELAY_MS)
}

/**
 * Check if error is retryable (from old code)
 * @param {Error} error - Error object
 * @returns {boolean}
 */
const isRetryableError = (error) => {
  if (error instanceof AIError) {
    return error.code === 'NETWORK_ERROR' || error.code === 'SERVER_ERROR'
  }
  if (error.message?.includes('network') || error.message?.includes('timeout')) {
    return true
  }
  return false
}

/**
 * Check if status code is retryable server error (from new code)
 * @param {number} statusCode - HTTP status code
 * @returns {boolean}
 */
const isRetryableStatus = (statusCode) => {
  return statusCode === 502 || statusCode === 503 || statusCode === 504
}

// ──────────────────────────────────────────────────────────────────────────────
// KEY MANAGEMENT (from new code)
// ──────────────────────────────────────────────────────────────────────────────
function getCerebrasKey() {
  // return getRuntimeCerebrasKey?.() || CEREBRAS_KEY || ''
  return CEREBRAS_KEY
}

function getGroqKey() {
  // return getRuntimeGroqKey?.() || GROQ_KEY || ''
  return GROQ_KEY
}

// ──────────────────────────────────────────────────────────────────────────────
// VALIDATORS (from new code)
// ──────────────────────────────────────────────────────────────────────────────
function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new ValidationError('messages', 'Must be an array')
  }
  if (messages.length === 0) {
    throw new ValidationError('messages', 'Cannot be empty')
  }
  for (const [idx, msg] of messages.entries()) {
    if (!msg.role || !msg.content) {
      throw new ValidationError(`messages[${idx}]`, 'Missing role or content')
    }
  }
  return true
}

function validateApiKey(key, provider) {
  const normalized = typeof key === 'string' ? key.trim() : ''
  if (!normalized) {
    throw new ValidationError('apiKey', `${provider} API key is required`)
  }
  if (/^your[_-\s]/i.test(normalized) || /placeholder|example/i.test(normalized)) {
    throw new ValidationError('apiKey', `${provider} API key is not configured`)
  }
  return true
}

function hasUsableApiKey(key) {
  if (typeof key !== 'string') return false
  const normalized = key.trim()
  return !!normalized && !/^your[_-\s]/i.test(normalized) && !/placeholder|example/i.test(normalized)
}

// ──────────────────────────────────────────────────────────────────────────────
// VISION SUPPORT (from new code)
// ──────────────────────────────────────────────────────────────────────────────
function injectVisionImage(messages, imageBase64) {
  if (!imageBase64) return messages

  return messages.map((msg, idx) => {
    if (idx !== messages.length - 1 || msg.role !== 'user') {
      return msg
    }

    const text = typeof msg.content === 'string'
      ? msg.content
      : Array.isArray(msg.content)
        ? msg.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
        : ''

    return {
      ...msg,
      content: [
        { type: 'text', text },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    }
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// SSE STREAM READER (from new code - enhanced)
// ──────────────────────────────────────────────────────────────────────────────
async function readSSEStream(response, onChunk, signal) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  try {
    while (true) {
      let done, value

      try {
        ({ done, value } = await reader.read())
      } catch (readError) {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError')
        }
        break
      }

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const rawLine of lines) {
        const line = rawLine.trimEnd()
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trimStart()
        if (payload === '[DONE]') continue

        try {
          const json = JSON.parse(payload)
          const content = json.choices?.[0]?.delta?.content || ''
          fullContent += content
          onChunk?.(fullContent)
        } catch (parseError) {
          logger.debug('SSE parse error:', parseError.message)
        }
      }
    }

    // Handle remaining buffer
    const finalLine = buffer.trimEnd()
    if (finalLine.startsWith('data:')) {
      const payload = finalLine.slice(5).trimStart()
      if (payload !== '[DONE]') {
        try {
          const json = JSON.parse(payload)
          const content = json.choices?.[0]?.delta?.content || ''
          fullContent += content
          onChunk?.(fullContent)
        } catch (parseError) {
          logger.debug('SSE final parse error:', parseError.message)
        }
      }
    }
  } finally {
    try { reader.releaseLock() } catch (_e) { /* ignore */ }
  }

  return fullContent
}

// ──────────────────────────────────────────────────────────────────────────────
// BASE AI REQUEST HANDLER (from new code - enhanced with old code features)
// ──────────────────────────────────────────────────────────────────────────────
async function makeAIRequest({ url, apiKey, provider, messages, model, onChunk, signal, options = {} }) {
  validateMessages(messages)
  validateApiKey(apiKey, provider)

  // From old code: Combine abort signals
  const controller = new AbortController()
  const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal

  // From old code: Request timeout
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, CONFIG.AI.REQUEST_TIMEOUT)

  const requestBody = {
    model,
    messages,
    max_tokens: options.maxTokens ?? CONFIG.AI.MAX_TOKENS,
    stream: true,
    temperature: options.temperature ?? CONFIG.AI.DEFAULT_TEMPERATURE,
  }

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      signal: combinedSignal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error?.name === 'AbortError') throw error
    throw new AIError(`${provider} network error`, 'NETWORK_ERROR', {
      provider,
      message: error?.message || 'Unknown network error',
    })
  }

  clearTimeout(timeoutId)

  if (!response || typeof response.status !== 'number') {
    throw new AIError(`${provider} invalid response`, 'INVALID_RESPONSE', { provider })
  }

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10)
    throw new RateLimitError(retryAfter)
  }

  if (response.status >= 500) {
    throw new ServerError(provider, response.status)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new AIError(`${provider} error: HTTP ${response.status}`, 'HTTP_ERROR', {
      statusCode: response.status,
      details: errorText.slice(0, 200),
    })
  }

  return readSSEStream(response, onChunk, signal)
}

// ──────────────────────────────────────────────────────────────────────────────
// CEREBRAS PROVIDER (from new code)
// ──────────────────────────────────────────────────────────────────────────────
async function cerebrasRequest(messages, model, onChunk, signal, options) {
  const apiKey = getCerebrasKey()
  const processedMessages = injectVisionImage(messages, options?.imageBase64)

  return makeAIRequest({
    url: CONFIG.API.CEREBRAS_URL,
    apiKey,
    provider: 'Cerebras',
    messages: processedMessages,
    model,
    onChunk,
    signal,
    options,
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// GROQ PROVIDER (from new code)
// ──────────────────────────────────────────────────────────────────────────────
async function groqRequest(messages, model, onChunk, signal, options) {
  const apiKey = getGroqKey()
  const processedMessages = injectVisionImage(messages, options?.imageBase64)

  return makeAIRequest({
    url: CONFIG.API.GROQ_URL,
    apiKey,
    provider: 'Groq',
    messages: processedMessages,
    model,
    onChunk,
    signal,
    options,
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// FALLBACK LOGIC (from new code - enhanced)
// ──────────────────────────────────────────────────────────────────────────────
async function tryGroqFallbackChain(messages, onChunk, signal, options) {
  for (const fallbackModel of CONFIG.GROQ_FALLBACK_CHAIN) {
    try {
      options?.onFallback?.(fallbackModel)
      return await groqRequest(messages, fallbackModel, onChunk, signal, options)
    } catch (error) {
      if (error.name === 'AbortError') throw error
      // Continue to next model on rate limit or server error
      if (error.code === 'RATE_LIMIT' || error.code === 'SERVER_ERROR') {
        logger.debug(`Fallback model ${fallbackModel} failed, trying next...`)
        continue
      }
      throw error
    }
  }
  return null
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATION FUNCTION (integrated)
// ──────────────────────────────────────────────────────────────────────────────
export async function askAIStream(messages, model, onChunk, signal, options = {}) {
  validateMessages(messages)

  const modelDef = MODELS.find(m => m.id === model)
  const provider = modelDef?.provider || 'cerebras'

  // Groq provider handling
  if (provider === 'groq') {
    try {
      return await groqRequest(messages, model, onChunk, signal, options)
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'RATE_LIMIT') {
        throw error
      }

      // Retry logic from old code
      if (
        (error.code === 'NETWORK_ERROR' ||
          (error.code === 'SERVER_ERROR' && isRetryableStatus(error.statusCode))) &&
        (options._attempt ?? 0) < CONFIG.RETRY.MAX_ATTEMPTS
      ) {
        const attempt = options._attempt ?? 0
        const delay = getBackoffDelay(attempt)
        logger.debug(`Groq request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${CONFIG.RETRY.MAX_ATTEMPTS})`)
        await sleep(delay)
        return askAIStream(messages, model, onChunk, signal, { ...options, _attempt: attempt + 1 })
      }
      throw error
    }
  }

  // Cerebras provider with fallback to Groq
  try {
    return await cerebrasRequest(messages, model, onChunk, signal, options)
  } catch (error) {
    if (error.name === 'AbortError') throw error

    // Rate limit: fallback to Groq chain
    if (error.code === 'RATE_LIMIT' && hasUsableApiKey(getGroqKey())) {
      try {
        const fallbackResult = await tryGroqFallbackChain(messages, onChunk, signal, options)
        if (fallbackResult !== null) {
          logger.info('Cerebras rate limited, using Groq fallback')
          return fallbackResult
        }
      } catch (fallbackError) {
        if (fallbackError?.name === 'AbortError') throw fallbackError
        logger.debug('Groq fallback chain failed:', fallbackError?.message)
      }
      throw error
    }

    // Retry logic from old code
    if (
      error.code === 'NETWORK_ERROR' ||
      (error.code === 'SERVER_ERROR' && isRetryableStatus(error.statusCode))
    ) {
      if ((options._attempt ?? 0) < CONFIG.RETRY.MAX_ATTEMPTS) {
        const attempt = options._attempt ?? 0
        const delay = getBackoffDelay(attempt)
        logger.debug(`Cerebras request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${CONFIG.RETRY.MAX_ATTEMPTS})`)
        await sleep(delay)
        return askAIStream(messages, model, onChunk, signal, { ...options, _attempt: attempt + 1 })
      }
    }

    throw error
  }
}

// Fallback function for backwards compatibility
export async function askAIWithFallback(messages, model, onChunk, signal, options = {}) {
  const { cerebrasKey, groqKey } = options

  // Store keys temporarily if provided
  if (cerebrasKey && hasUsableApiKey(cerebrasKey)) {
    try {
      return await askAIStream(messages, model, onChunk, signal, options)
    } catch (error) {
      if (error.code === 'RATE_LIMIT' && hasUsableApiKey(groqKey)) {
        logger.info('Rate limit hit, falling back to Groq')
        return await askAIStream(messages, 'mixtral-8x7b-32768', onChunk, signal, { ...options, apiKey: groqKey })
      }
      throw error
    }
  }

  if (hasUsableApiKey(groqKey)) {
    return await askAIStream(messages, 'mixtral-8x7b-32768', onChunk, signal, options)
  }

  throw new AIError('No valid API key configured', 'AUTH_ERROR')
}

// ──────────────────────────────────────────────────────────────────────────────
// SERVER COMMUNICATION (from old code - enhanced)
// ──────────────────────────────────────────────────────────────────────────────
export async function callServer(payload) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.SERVER.REQUEST_TIMEOUT)

    const response = await fetch(YUYU_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      logger.warn(`Server error ${response.status}: ${errorText.slice(0, 200)}`)
      return { ok: false, data: `Server error: ${response.status} — ${errorText.slice(0, 200)}` }
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.error('Request timeout', { payload: payload.type })
      return { ok: false, data: 'Request timeout. Server may be busy.' }
    }

    logger.error('Server unreachable', error)
    return {
      ok: false,
      data: 'YuyuServer tidak dapat dihubungi. Jalankan: node yuyu-server.cjs &'
    }
  }
}

export async function callServerBatch(payloads) {
  return Promise.all(payloads.map(payload => callServer(payload)))
}

// ──────────────────────────────────────────────────────────────────────────────
// WEBSOCKET EXECUTION STREAM (from old code - integrated)
// ──────────────────────────────────────────────────────────────────────────────
export function execStream(command, cwd, onLine, signal) {
  return new Promise((resolve, reject) => {
    let ws = null
    let output = ''
    let settled = false
    let reconnectAttempts = 0
    const maxReconnect = CONFIG.SERVER.WS_RECONNECT_MAX

    const cleanup = () => {
      if (ws) {
        ws.onopen = null
        ws.onmessage = null
        ws.onerror = null
        ws.onclose = null
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
        ws = null
      }
    }

    const connect = () => {
      try {
        ws = new WebSocket(WS_SERVER)
      } catch (error) {
        reject(new AIError('WebSocket tidak tersedia', 'WS_UNAVAILABLE', error))
        return
      }

      // From old code: Unique ID with random suffix
      const id = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'exec_stream', id, command, cwd }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Ignore messages not for this exec
          if (data.id && data.id !== id) return

          if (data.type === 'stdout' || data.type === 'stderr') {
            const line = data.data
            output += line
            onLine?.(line, data.type)
          }

          if (data.type === 'exit') {
            cleanup()
            if (!settled) {
              settled = true
              resolve({ exitCode: data.code, output })
            }
          }

          if (data.type === 'error') {
            cleanup()
            if (!settled) {
              settled = true
              reject(new AIError(data.data, 'EXEC_ERROR'))
            }
          }
        } catch (e) {
          logger.warn('Failed to parse WebSocket message', e)
        }
      }

      // From old code: Reconnect logic
      ws.onerror = (error) => {
        logger.error('WebSocket error', error)
        if (reconnectAttempts < maxReconnect && !settled) {
          reconnectAttempts++
          const delay = CONFIG.SERVER.WS_RECONNECT_DELAY_BASE * reconnectAttempts
          logger.info(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnect})`)
          setTimeout(connect, delay)
        } else if (!settled) {
          cleanup()
          settled = true
          reject(new AIError('WebSocket connection failed', 'WS_ERROR'))
        }
      }

      ws.onclose = () => {
        if (!settled) {
          cleanup()
          settled = true
          resolve({ exitCode: 1, output })
        }
      }
    }

    connect()

    if (signal) {
      signal.addEventListener('abort', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
        if (!settled) {
          settled = true
          reject(new AIError('Aborted', 'ABORTED'))
        }
      })
    }
  })
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
  sleep,
  getBackoffDelay,
  isRetryableError,
  isRetryableStatus,
  injectVisionImage,
}

// Export askAIStream as askCerebrasStream for backwards compatibility
export { askAIStream as askCerebrasStream }
