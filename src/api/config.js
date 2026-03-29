import { MODELS as IMPORTED_MODELS } from '../constants.js';

export const CONFIG = Object.freeze({
  ENV: {
    isDev: import.meta.env?.DEV ?? false,
    isProd: import.meta.env?.PROD ?? false,
  },
  SERVER: {
    PORT: 8765,
    WS_PORT: 8766,
    HEALTH_TIMEOUT: 2000,
    REQUEST_TIMEOUT: 30000,
    WS_RECONNECT_MAX: 5,
    WS_RECONNECT_DELAY_BASE: 1000,
    WS_RECONNECT_MAX_DELAY: 30000,
  },
  AI: {
    REQUEST_TIMEOUT: 120000,
    MAX_TOKENS: {
      default: 4096,
      cerebras: 8192,
      groq: 8192,
    },
    DEFAULT_TEMPERATURE: 0.3,
    DEFAULT_TOP_P: 0.95,
  },
  RETRY: {
    MAX_ATTEMPTS: 5,
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 30000,
    JITTER_MAX_MS: 500,
    RETRYABLE_STATUSES: [408, 429, 500, 502, 503, 504],
    RETRYABLE_CODES: ['NETWORK_ERROR', 'SERVER_ERROR', 'RATE_LIMIT'],
  },
  API: {
    CEREBRAS_URL: 'https://api.cerebras.ai/v1/chat/completions',
    GROQ_URL: 'https://api.groq.com/openai/v1/chat/completions',
    CEREBRAS_ALT_URL: 'https://api.cerebras.ai/v1/completions',
    GROQ_ALT_URL: 'https://api.groq.com/v1/chat/completions',
  },
  GROQ_FALLBACK_CHAIN: [
    'moonshotai/kimi-k2-instruct-0905',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
  ],
  CIRCUIT_BREAKER: {
    failureThreshold: 5,
    timeoutMs: 60000,
    halfOpenRequests: 3,
  },
  CACHE: {
    ttlMs: 300000,
    maxSize: 100,
  },
});

const MODELS_FALLBACK = [
  { id: 'llama3.1-8b', provider: 'cerebras', name: 'Llama 3.1 8B', contextWindow: 8192 },
  { id: 'qwen-32b', provider: 'cerebras', name: 'Qwen 2.5 32B', contextWindow: 32768 },
  { id: 'qwen-72b', provider: 'cerebras', name: 'Qwen 2.5 72B', contextWindow: 131072 },
  { id: 'llama-3.3-70b-versatile', provider: 'groq', name: 'Llama 3.3 70B', contextWindow: 8192 },
  { id: 'llama-3.1-8b-instant', provider: 'groq', name: 'Llama 3.1 8B Instant', contextWindow: 8192 },
  { id: 'mixtral-8x7b-32768', provider: 'groq', name: 'Mixtral 8x7B', contextWindow: 32768 },
];

export const MODELS = (IMPORTED_MODELS?.length ? IMPORTED_MODELS : MODELS_FALLBACK).map(m => ({
  ...m,
  isAvailable: true,
  isFallback: !IMPORTED_MODELS?.length,
}));
