// @vitest-environment node
// tests/api/orchestration.test.js — AI Orchestration & Fallback Tests (Fixed)
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  askAIStream, 
  RateLimitError, 
  ServerError, 
  ValidationError,
  CONFIG 
} from '../api.js';
import * as groqModule from './providers/groq.js';

// ──────────────────────────────────────────────────────────────────────────────
// Custom Matchers
// ──────────────────────────────────────────────────────────────────────────────
expect.extend({
  toBeRateLimitError(received, expectedRetryAfter) {
    const isRateLimitError = received instanceof RateLimitError;
    const hasCorrectCode = isRateLimitError && received.code === 'RATE_LIMIT';
    const hasCorrectRetryAfter = isRateLimitError && received.retryAfter === expectedRetryAfter;
    const hasCorrectMessage = isRateLimitError && 
      received.message.includes(`Retry after ${expectedRetryAfter}s`);
    
    const pass = isRateLimitError && hasCorrectCode && hasCorrectRetryAfter && hasCorrectMessage;
    
    if (pass) {
      return {
        pass: true,
        message: () => `expected ${received} not to be a RateLimitError with retryAfter ${expectedRetryAfter}`
      };
    } else {
      return {
        pass: false,
        message: () => {
          const errors = [];
          if (!isRateLimitError) errors.push(`not a RateLimitError (got ${received?.constructor?.name || typeof received})`);
          if (!hasCorrectCode) errors.push(`code !== 'RATE_LIMIT' (got ${received?.code})`);
          if (!hasCorrectRetryAfter) errors.push(`retryAfter !== ${expectedRetryAfter} (got ${received?.retryAfter})`);
          if (!hasCorrectMessage) errors.push(`message does not contain 'Retry after ${expectedRetryAfter}s' (got ${received?.message})`);
          
          return `Expected RateLimitError with retryAfter ${expectedRetryAfter}\n  ${errors.join('\n  ')}`;
        }
      };
    }
  },
  
  toBeServerError(received, expectedStatusCode) {
    const isServerError = received instanceof ServerError;
    const hasCorrectCode = isServerError && received.code === 'SERVER_ERROR';
    const hasCorrectStatusCode = isServerError && received.statusCode === expectedStatusCode;
    
    const pass = isServerError && hasCorrectCode && hasCorrectStatusCode;
    
    return {
      pass,
      message: () => {
        if (!isServerError) return `expected ServerError, got ${received?.constructor?.name || typeof received}`;
        if (!hasCorrectCode) return `expected code 'SERVER_ERROR', got '${received.code}'`;
        if (!hasCorrectStatusCode) return `expected statusCode ${expectedStatusCode}, got ${received.statusCode}`;
        return `expected not to be ServerError with status ${expectedStatusCode}`;
      }
    };
  },
  
  toBeValidationError(received, expectedField) {
    const isValidationError = received instanceof ValidationError;
    const hasCorrectCode = isValidationError && received.code === 'VALIDATION_ERROR';
    const hasCorrectField = isValidationError && received.field === expectedField;
    
    const pass = isValidationError && hasCorrectCode && hasCorrectField;
    
    return {
      pass,
      message: () => {
        if (!isValidationError) return `expected ValidationError, got ${received?.constructor?.name || typeof received}`;
        if (!hasCorrectCode) return `expected code 'VALIDATION_ERROR', got '${received.code}'`;
        if (!hasCorrectField) return `expected field '${expectedField}', got '${received.field}'`;
        return `expected not to be ValidationError with field ${expectedField}`;
      }
    };
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Mock Setup (with valid key lengths)
// ──────────────────────────────────────────────────────────────────────────────
vi.mock('../../constants.js', () => ({
  CEREBRAS_KEY: 'test-cerebras-key-1234567890',
  GROQ_KEY: 'test-groq-key-1234567890',
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
  MODELS: [
    { id: 'qwen-cerebras', label: 'Qwen Cerebras', provider: 'cerebras' },
    { id: 'kimi-groq', label: 'Kimi Groq', provider: 'groq' },
    { id: 'llama-3.3-70b', label: 'Llama 70B', provider: 'groq' },
  ],
  FALLBACK_MODEL: 'kimi-groq',
}));

vi.mock('../../runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => null,
  getRuntimeGroqKey: () => 'test-groq-key-1234567890',
}));

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function makeSseResponse(...chunks) {
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

function make429Response(retryAfter = 10) {
  return {
    ok: false,
    status: 429,
    headers: { get: (key) => key === 'retry-after' ? String(retryAfter) : null },
    body: null,
    text: () => Promise.resolve('Rate limit exceeded'),
  };
}

function make5xxResponse(status = 503) {
  return {
    ok: false,
    status,
    headers: { get: () => null },
    text: () => Promise.resolve('Server Error'),
    body: null,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// askAIStream Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('askAIStream', () => {
  // ── Input Validation ────────────────────────────────────────────────────────
  it('throws on empty messages array', async () => {
    await expect(
      askAIStream([], 'qwen-cerebras', () => {}, null)
    ).rejects.toBeValidationError('messages');
  });

  it('throws on non-array messages', async () => {
    await expect(
      askAIStream(null, 'qwen-cerebras', () => {}, null)
    ).rejects.toBeValidationError('messages');
  });

  it('throws on messages without role', async () => {
    await expect(
      askAIStream([{ content: 'hi' }], 'qwen-cerebras', () => {}, null)
    ).rejects.toBeValidationError('messages[0]');
  });

  it('throws on messages without content', async () => {
    await expect(
      askAIStream([{ role: 'user' }], 'qwen-cerebras', () => {}, null)
    ).rejects.toBeValidationError('messages[0]');
  });

  // ── Cerebras Provider ───────────────────────────────────────────────────────
  it('streams Cerebras response successfully', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    const chunks = [];
    const result = await askAIStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-cerebras',
      c => chunks.push(c),
      new AbortController().signal
    );
    expect(result).toBe('Hello');
    expect(chunks).toContain('Hello');
  });

  it('passes maxTokens and temperature options to API', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"x"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      { maxTokens: 500, temperature: 0.7 }
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(500);
    expect(body.temperature).toBe(0.7);
  });

  it('uses default values when options not provided', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"x"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      {}
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(CONFIG.AI.MAX_TOKENS.cerebras);
    expect(body.temperature).toBe(CONFIG.AI.DEFAULT_TEMPERATURE);
  });

  // ── Cerebras Rate Limit → Groq Fallback ─────────────────────────────────────
  it('falls back to Groq on Cerebras 429 rate limit', async () => {
    // Mock a 429 response from Cerebras
    globalThis.fetch.mockResolvedValueOnce(make429Response(10));

    // Mock groqRequest to return the fallback value directly
    const groqSpy = vi.spyOn(groqModule, 'groqRequest').mockResolvedValue('Fallback');

    const result = await askAIStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );

    expect(result).toBe('Fallback');
    expect(groqSpy).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1); // Only the original Cerebras fetch
  });

  it('throws original Cerebras RATE_LIMIT when Groq also fails', async () => {
    // Make both Cerebras and Groq fail
    globalThis.fetch.mockResolvedValueOnce(make429Response(60));
    vi.spyOn(groqModule, 'groqRequest').mockRejectedValue(new RateLimitError(60, 'Groq'));

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras',
        () => {},
        new AbortController().signal
      )
    ).rejects.toBeRateLimitError(60);
  });

  it('throws AbortError when Groq fallback is aborted', async () => {
    globalThis.fetch.mockResolvedValueOnce(make429Response(60));
    vi.spyOn(groqModule, 'groqRequest').mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras',
        () => {},
        new AbortController().signal
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  // ── Cerebras Server Error Retry ─────────────────────────────────────────────
  it('retries on Cerebras 5xx server error (up to 2 times)', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"OK"}}]}\n';
    globalThis.fetch
      .mockResolvedValueOnce(make5xxResponse(503))
      .mockResolvedValueOnce(make5xxResponse(503))
      .mockResolvedValueOnce(makeSseResponse(chunk));

    vi.useFakeTimers();
    const promise = askAIStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );
    await vi.runAllTimersAsync();
    const result = await promise;
    vi.useRealTimers();
    
    expect(result).toBe('OK');
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('throws on Cerebras 401 unauthorized immediately', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false, status: 401,
      headers: { get: () => null },
      text: () => Promise.resolve('unauthorized'),
    });

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras',
        () => {},
        new AbortController().signal
      )
    ).rejects.toThrow('Cerebras error: HTTP 401');
  });

  it('retries on network fetch error', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"recovered"}}]}\n';
    let calls = 0;
    globalThis.fetch.mockImplementation(() => {
      calls++;
      if (calls < 2) return Promise.reject(new Error('fetch failed'));
      return Promise.resolve(makeSseResponse(chunk));
    });

    vi.useFakeTimers();
    const promise = askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );
    await vi.runAllTimersAsync();
    const result = await promise;
    vi.useRealTimers();

    expect(result).toBe('recovered');
    expect(calls).toBe(2);
  });

  // ── Groq Provider ───────────────────────────────────────────────────────────
  it('routes Groq model directly to Groq API', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Kimi"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askAIStream(
      [{ role: 'user', content: 'Hi' }],
      'kimi-groq',
      () => {},
      new AbortController().signal
    );
    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('groq.com');
  });

  it('retries Groq model on 5xx error up to 2 times', async () => {
    vi.useFakeTimers();
    let calls = 0;
    globalThis.fetch.mockImplementation(() => {
      calls++;
      if (calls < 3) return Promise.resolve(make5xxResponse(503));
      return Promise.resolve(makeSseResponse('data: {"choices":[{"delta":{"content":"ok"}}]}\n'));
    });

    const promise = askAIStream(
      [{ role: 'user', content: 'hi' }],
      'kimi-groq',
      () => {},
      new AbortController().signal
    );
    await vi.runAllTimersAsync();
    const result = await promise;
    vi.useRealTimers();

    expect(result).toBe('ok');
    expect(calls).toBe(3);
  });

  it('throws AbortError without retry for Groq model', async () => {
    globalThis.fetch.mockRejectedValue(
      new DOMException('Aborted', 'AbortError')
    );

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'kimi-groq',
        () => {},
        new AbortController().signal
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('throws RATE_LIMIT for Groq model without fallback', async () => {
    globalThis.fetch.mockResolvedValueOnce(make429Response(30));

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'kimi-groq',
        () => {},
        new AbortController().signal
      )
    ).rejects.toBeRateLimitError(30);
  });

  it('stops fallback chain on non-rate-limit error', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(make429Response(1))
      .mockResolvedValueOnce({ ok: false, status: 401, text: () => Promise.resolve('auth fail') });

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras',
        () => {},
        new AbortController().signal
      )
    ).rejects.toThrow();
  });

  // ── Vision Support ──────────────────────────────────────────────────────────
  it('injects image into last user message', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"ok"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askAIStream(
      [{ role: 'user', content: [{ type: 'text', text: 'describe this' }] }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      { imageBase64: 'base64data' }
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    const lastMsg = body.messages[body.messages.length - 1];
    expect(Array.isArray(lastMsg.content)).toBe(true);
    expect(lastMsg.content.some(c => c.type === 'image_url')).toBe(true);
  });

  it('does not inject image when imageBase64 is null', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"ok"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askAIStream(
      [{ role: 'user', content: 'hello' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      { imageBase64: null }
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(typeof body.messages[0].content).toBe('string');
  });

  // ── Error Handling ──────────────────────────────────────────────────────────
  it('throws ValidationError for missing messages', async () => {
    await expect(askAIStream([], 'qwen-cerebras', () => {}, null))
      .rejects.toBeValidationError('messages');
  });

  it('throws ServerError for 5xx responses', async () => {
    globalThis.fetch.mockResolvedValueOnce(make5xxResponse(500));

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras',
        () => {},
        new AbortController().signal
      )
    ).rejects.toBeServerError(500);
  });

  it('throws RateLimitError for 429 responses', async () => {
    globalThis.fetch.mockResolvedValueOnce(make429Response(30));

    await expect(
      askAIStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras',
        () => {},
        new AbortController().signal
      )
    ).rejects.toBeRateLimitError(30);
  });

  // ── Callbacks & Events ──────────────────────────────────────────────────────
  it('calls onFallback when using fallback model', async () => {
    globalThis.fetch.mockResolvedValueOnce(make429Response(10));
    const onFallback = vi.fn();

    vi.spyOn(groqModule, 'groqRequest').mockImplementation(async () => {
      onFallback('fallback-model');
      return 'fallback result';
    });

    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      { onFallback }
    );

    expect(onFallback).toHaveBeenCalled();
    expect(result).toBe('fallback result');
  });

  it('accumulates full response correctly', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: {"choices":[{"delta":{"content":" World"}}]}\n',
      'data: {"choices":[{"delta":{"content":"!"}}]}\n',
    ];
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(...chunks));

    const collected = [];
    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      c => collected.push(c),
      new AbortController().signal
    );

    expect(result).toBe('Hello World!');
    expect(collected).toEqual(['Hello', 'Hello World', 'Hello World!']);
  });

  // ── Edge Cases ──────────────────────────────────────────────────────────────
  it('handles empty content in stream', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":""}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );

    expect(result).toBe('');
  });

  it('handles multiple consecutive empty chunks', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":""}}]}\n',
      'data: {"choices":[{"delta":{"content":""}}]}\n',
      'data: {"choices":[{"delta":{"content":"text"}}]}\n',
    ];
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(...chunks));

    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );

    expect(result).toBe('text');
  });

  it('preserves message order in request', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"ok"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    const messages = [
      { role: 'system', content: 'system prompt' },
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'second' },
    ];

    await askAIStream(
      messages,
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.messages.map(m => m.role)).toEqual([
      'system', 'user', 'assistant', 'user'
    ]);
  });

  it('uses FALLBACK_MODEL when model not found in MODELS', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"ok"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'unknown-model',
      () => {},
      new AbortController().signal
    );

    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('cerebras.ai');
  });
});
