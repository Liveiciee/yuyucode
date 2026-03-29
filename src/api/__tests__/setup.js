import { vi } from 'vitest';

// Mock constants.js secara lengkap
vi.mock('../../constants.js', () => ({
  CEREBRAS_KEY: 'test-cerebras-key-1234567890',
  GROQ_KEY: 'test-groq-key-1234567890',
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
  MODELS: [
    { id: 'cerebras-model', provider: 'cerebras' },
    { id: 'groq-model', provider: 'groq' },
  ],
  GROQ_FALLBACK_CHAIN: ['groq-model'],
  FALLBACK_MODEL: 'groq-model',
}));

// Mock runtimeKeys.js
vi.mock('../../runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => 'mock-cerebras-key',
  getRuntimeGroqKey: () => 'mock-groq-key',
}));

// Helper untuk SSE response
export function makeSseResponse(...chunks) {
  const enc = new TextEncoder();
  const calls = chunks.map(c => ({ done: false, value: enc.encode(c) }));
  calls.push({ done: true });
  let i = 0;
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    body: {
      getReader: () => ({
        read: vi.fn().mockImplementation(() => Promise.resolve(calls[i++])),
        releaseLock: vi.fn(),
      }),
    },
  };
}

// Helper untuk 429 response
export function make429Response(retryAfter = 10) {
  return {
    ok: false,
    status: 429,
    headers: { get: (key) => key === 'retry-after' ? String(retryAfter) : null },
    body: null,
    text: () => Promise.resolve('Rate limit exceeded'),
  };
}

// Helper untuk 5xx response
export function make5xxResponse(status = 503) {
  return {
    ok: false,
    status,
    headers: { get: () => null },
    text: () => Promise.resolve('Server Error'),
    body: null,
  };
}
