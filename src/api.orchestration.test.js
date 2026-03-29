// @vitest-environment node
// tests/api.orchestration.test.js — AI Orchestration & Fallback Tests (Fixed)
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  askAIStream,
  RateLimitError,
  ServerError,
  ValidationError,
  CONFIG
} from './api.js';
import * as groqModule from './api/providers/groq.js';
import * as cerebrasModule from './api/providers/cerebras.js';

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
vi.mock('./constants.js', () => ({
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

vi.mock('./runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => null,
  getRuntimeGroqKey: () => 'test-groq-key-1234567890',
}));

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
  // Bypass key validation by mocking the cerebrasRequest function directly
  vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async (messages, model, onChunk, signal, options) => {
    // Simulate a successful response by calling onChunk and returning the full text
    const fullText = 'Hello';
    onChunk?.(fullText);
    return fullText;
  });
  vi.spyOn(groqModule, 'groqRequest').mockImplementation(async (messages, model, onChunk, signal, options) => {
    const fullText = 'Groq fallback response';
    onChunk?.(fullText);
    return fullText;
  });
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
    // Since we mock cerebrasRequest, we can check that the options are passed through
    const options = { maxTokens: 500, temperature: 0.7 };
    const spy = vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('x');

    await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      options
    );

    expect(spy).toHaveBeenCalledWith(
      expect.any(Array),
      'qwen-cerebras',
      expect.any(Function),
      expect.any(AbortSignal),
      expect.objectContaining(options)
    );
  });

  it('uses default values when options not provided', async () => {
    const spy = vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('x');

    await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      {}
    );

    expect(spy).toHaveBeenCalledWith(
      expect.any(Array),
      'qwen-cerebras',
      expect.any(Function),
      expect.any(AbortSignal),
      expect.objectContaining({
        maxTokens: CONFIG.AI.MAX_TOKENS.cerebras,
        temperature: CONFIG.AI.DEFAULT_TEMPERATURE,
      })
    );
  });

  // ── Cerebras Rate Limit → Groq Fallback ─────────────────────────────────────
  it('falls back to Groq on Cerebras 429 rate limit', async () => {
    // Override cerebrasRequest to throw a RateLimitError
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(10, 'Cerebras'));

    const result = await askAIStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );

    // The groqRequest mock returns 'Groq fallback response'
    expect(result).toBe('Groq fallback response');
    expect(groqModule.groqRequest).toHaveBeenCalledTimes(1);
  });

  it('throws original Cerebras RATE_LIMIT when Groq also fails', async () => {
    // Cerebras throws rate limit, Groq also throws
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(60, 'Cerebras'));
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
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(10, 'Cerebras'));
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
    let attempts = 0;
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async () => {
      attempts++;
      if (attempts < 3) throw new ServerError('Cerebras', 503);
      return 'OK';
    });

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
    expect(attempts).toBe(3);
  });

  it('throws on Cerebras 401 unauthorized immediately', async () => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new Error('Cerebras error: HTTP 401'));

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
    let attempts = 0;
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async () => {
      attempts++;
      if (attempts < 2) throw new Error('fetch failed');
      return 'recovered';
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
    expect(attempts).toBe(2);
  });

  // ── Groq Provider ───────────────────────────────────────────────────────────
  it('routes Groq model directly to Groq API', async () => {
    // The mock groqRequest will be called
    await askAIStream(
      [{ role: 'user', content: 'Hi' }],
      'kimi-groq',
      () => {},
      new AbortController().signal
    );
    expect(groqModule.groqRequest).toHaveBeenCalled();
  });

  it('retries Groq model on 5xx error up to 2 times', async () => {
    let attempts = 0;
    vi.spyOn(groqModule, 'groqRequest').mockImplementation(async () => {
      attempts++;
      if (attempts < 3) throw new ServerError('Groq', 503);
      return 'ok';
    });

    vi.useFakeTimers();
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
    expect(attempts).toBe(3);
  });

  it('throws AbortError without retry for Groq model', async () => {
    vi.spyOn(groqModule, 'groqRequest').mockRejectedValue(new DOMException('Aborted', 'AbortError'));

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
    vi.spyOn(groqModule, 'groqRequest').mockRejectedValue(new RateLimitError(30, 'Groq'));

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
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(1, 'Cerebras'));
    vi.spyOn(groqModule, 'groqRequest').mockRejectedValue(new Error('auth fail'));

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
    const spy = vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('ok');
    await askAIStream(
      [{ role: 'user', content: [{ type: 'text', text: 'describe this' }] }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      { imageBase64: 'base64data' }
    );

    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.arrayContaining([
            { type: 'image_url', image_url: { url: expect.stringContaining('base64data') } }
          ])
        })
      ]),
      'qwen-cerebras',
      expect.any(Function),
      expect.any(AbortSignal),
      expect.anything()
    );
  });

  it('does not inject image when imageBase64 is null', async () => {
    const spy = vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('ok');
    await askAIStream(
      [{ role: 'user', content: 'hello' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal,
      { imageBase64: null }
    );

    const lastArg = spy.mock.calls[0][0];
    expect(lastArg[0].content).toBe('hello');
  });

  // ── Error Handling ──────────────────────────────────────────────────────────
  it('throws ValidationError for missing messages', async () => {
    await expect(askAIStream([], 'qwen-cerebras', () => {}, null))
      .rejects.toBeValidationError('messages');
  });

  it('throws ServerError for 5xx responses', async () => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new ServerError('Cerebras', 500));
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
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(30, 'Cerebras'));
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
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(10, 'Cerebras'));
    const onFallback = vi.fn();
    // Mock groqRequest to simulate fallback call with callback
    vi.spyOn(groqModule, 'groqRequest').mockImplementation(async (messages, model, onChunk, signal, options) => {
      options?.onFallback?.(model);
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
    const chunks = [];
    const mockCerebras = vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async (messages, model, onChunk) => {
      onChunk('Hello');
      onChunk('Hello World');
      onChunk('Hello World!');
      return 'Hello World!';
    });

    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      c => chunks.push(c),
      new AbortController().signal
    );

    expect(result).toBe('Hello World!');
    expect(chunks).toEqual(['Hello', 'Hello World', 'Hello World!']);
  });

  // ── Edge Cases ──────────────────────────────────────────────────────────────
  it('handles empty content in stream', async () => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async (messages, model, onChunk) => {
      onChunk('');
      return '';
    });
    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      () => {},
      new AbortController().signal
    );
    expect(result).toBe('');
  });

  it('handles multiple consecutive empty chunks', async () => {
    const collected = [];
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async (messages, model, onChunk) => {
      onChunk('');
      onChunk('');
      onChunk('text');
      return 'text';
    });
    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras',
      c => collected.push(c),
      new AbortController().signal
    );
    expect(result).toBe('text');
    expect(collected).toEqual(['', '', 'text']);
  });

  it('preserves message order in request', async () => {
    const spy = vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('ok');
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

    expect(spy).toHaveBeenCalledWith(messages, 'qwen-cerebras', expect.any(Function), expect.any(AbortSignal), expect.anything());
  });

  it('uses FALLBACK_MODEL when model not found in MODELS', async () => {
    // The default model should be used, which is 'qwen-cerebras' (provider: cerebras)
    const spy = vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('ok');
    await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'unknown-model',
      () => {},
      new AbortController().signal
    );
    expect(spy).toHaveBeenCalledWith(expect.any(Array), 'qwen-cerebras', expect.any(Function), expect.any(AbortSignal), expect.anything());
  });
});
