// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer, callServerBatch, askCerebrasStream } from './api.js';

// ── Mock constants so import.meta.env doesn't blow up ────────────────────────
vi.mock('./constants.js', () => ({
  CEREBRAS_KEY:  'test-cerebras-key',
  GROQ_KEY:      'test-groq-key',
  TAVILY_KEY:    '',
  YUYU_SERVER:   'http://localhost:8765',
  WS_SERVER:     'ws://127.0.0.1:8766',
  FALLBACK_MODEL:'moonshotai/kimi-k2-instruct-0905',
  MODELS: [
    { id: 'qwen-3-235b-a22b-instruct-2507', label: 'Qwen 3 235B', provider: 'cerebras' },
    { id: 'moonshotai/kimi-k2-instruct-0905', label: 'Kimi K2', provider: 'groq' },
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3', provider: 'groq' },
  ],
}));

vi.mock('./runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => null,
  getRuntimeGroqKey: () => 'test-groq-key',
}));

const originalFetch = globalThis.fetch;
beforeEach(() => { globalThis.fetch = vi.fn(); });
afterEach(() => { globalThis.fetch = originalFetch; vi.clearAllMocks(); });

// ── Helpers ──────────────────────────────────────────────────────────────────
function mockJsonResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: { get: () => null },
    body: null,
  });
}

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
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// callServer
// ═══════════════════════════════════════════════════════════════════════════════
describe('callServer', () => {
  it('returns ok:true and parsed JSON on success', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'hello' }));
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(true);
    expect(r.data).toBe('hello');
  });

  it('sends JSON POST to YUYU_SERVER', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockJsonResponse({ ok: true }));
    await callServer({ type: 'read', path: '/foo' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8765',
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ type: 'read', path: '/foo' });
  });

  it('returns ok:false with message on non-ok HTTP status', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false, status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(false);
    expect(r.data).toContain('500');
  });

  it('returns ok:false when fetch throws (server unreachable)', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(false);
    expect(r.data).toContain('yuyu-server.js');
  });

  it('returns ok:false on network timeout', async () => {
    globalThis.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const r = await callServer({ type: 'read', path: '/file.txt' });
    expect(r.ok).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// callServerBatch
// ═══════════════════════════════════════════════════════════════════════════════
describe('callServerBatch', () => {
  it('executes all payloads in parallel and returns array', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'a' }))
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'b' }))
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'c' }));

    const results = await callServerBatch([
      { type: 'read', path: '/a' },
      { type: 'read', path: '/b' },
      { type: 'read', path: '/c' },
    ]);
    expect(results).toHaveLength(3);
    expect(results.map(r => r.data)).toEqual(['a', 'b', 'c']);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('handles partial failures gracefully', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'ok' }))
      .mockRejectedValueOnce(new Error('fail'));
    const results = await callServerBatch([
      { type: 'read', path: '/ok' },
      { type: 'read', path: '/bad' },
    ]);
    expect(results[0].ok).toBe(true);
    expect(results[1].ok).toBe(false);
  });

  it('returns empty array for empty input', async () => {
    const results = await callServerBatch([]);
    expect(results).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// askCerebrasStream
// ═══════════════════════════════════════════════════════════════════════════════
describe('askCerebrasStream', () => {
  it('throws on empty messages', async () => {
    await expect(
      askCerebrasStream([], 'qwen-3-235b-a22b-instruct-2507', () => {}, null)
    ).rejects.toThrow('non-empty array');
  });

  it('streams Cerebras response successfully', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    const chunks = [];
    const result = await askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      c => chunks.push(c),
      new AbortController().signal
    );
    expect(result).toBe('Hello');
    expect(chunks).toContain('Hello');
  });

  it('falls back to Groq on Cerebras 429 rate limit', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Fallback"}}]}\n';
    globalThis.fetch
      .mockResolvedValueOnce(make429Response(10))
      .mockResolvedValueOnce(makeSseResponse(chunk));

    const result = await askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      () => {},
      new AbortController().signal
    );
    expect(result).toBe('Fallback');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('routes Groq model directly to Groq API', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Kimi"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'moonshotai/kimi-k2-instruct-0905',
      () => {},
      new AbortController().signal
    );
    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('groq.com');
  });

  it('throws AbortError when signal is aborted', async () => {
    const ctrl = new AbortController();
    globalThis.fetch.mockImplementation(() => {
      ctrl.abort();
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });
    await expect(
      askCerebrasStream(
        [{ role: 'user', content: 'Hi' }],
        'qwen-3-235b-a22b-instruct-2507',
        () => {},
        ctrl.signal
      )
    ).rejects.toThrow();
  });

  it('retries on Cerebras 5xx server error (up to 2 times)', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"OK"}}]}\n';
    globalThis.fetch
      .mockResolvedValueOnce({ ok: false, status: 503, headers: { get: () => null } })
      .mockResolvedValueOnce({ ok: false, status: 503, headers: { get: () => null } })
      .mockResolvedValueOnce(makeSseResponse(chunk));

    vi.useFakeTimers();
    const promise = askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      () => {},
      new AbortController().signal
    );
    await vi.runAllTimersAsync();
    const result = await promise;
    vi.useRealTimers();
    expect(result).toBe('OK');
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('passes maxTokens and temperature options to API', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"x"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askCerebrasStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      () => {},
      new AbortController().signal,
      { maxTokens: 500, temperature: 0.7 }
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(500);
    expect(body.temperature).toBe(0.7);
  });
});
