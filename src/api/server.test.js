// @vitest-environment node
// tests/api/server.test.js — Server Communication Tests
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer, callServerBatch, execStream } from '../../api.js';
import { CONFIG } from './config.js';

// Mock fetch globally
const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.clearAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────────
// callServer Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('callServer', () => {
  it('makes POST request to YUYU_SERVER with payload', async () => {
    const mockResponse = { ok: true, json: async () => ({ data: 'ok' }) };
    globalThis.fetch.mockResolvedValueOnce(mockResponse);

    const payload = { type: 'ping' };
    const result = await callServer(payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:8765'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual({ data: 'ok' });
  });

  it('handles non-ok response', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    };
    globalThis.fetch.mockResolvedValueOnce(mockResponse);

    const result = await callServer({ type: 'ping' });
    expect(result.ok).toBe(false);
    expect(result.data).toContain('Server error: 500');
  });

  it('handles fetch error with retries', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('Network error'));
    const mockResponse = { ok: true, json: async () => ({ ok: true }) };
    globalThis.fetch.mockResolvedValueOnce(mockResponse);

    const result = await callServer({ type: 'ping' }, 1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  });

  it('handles timeout abort', async () => {
    const controller = new AbortController();
    globalThis.fetch.mockImplementationOnce((url, options) => {
      options.signal.addEventListener('abort', () => {});
      return new Promise(() => {});
    });
    // Force timeout by using a very short timeout in the function? We'll just simulate abort via signal.
    // For simplicity, we test that the function returns error message on timeout.
    // But the actual timeout is inside callServer. We can mock setTimeout.
    vi.useFakeTimers();
    const promise = callServer({ type: 'ping' });
    await vi.advanceTimersByTimeAsync(CONFIG.SERVER.REQUEST_TIMEOUT + 100);
    const result = await promise;
    expect(result).toEqual({ ok: false, data: 'Request timeout. Server may be busy.' });
    vi.useRealTimers();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// callServerBatch Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('callServerBatch', () => {
  it('processes payloads in parallel with concurrency', async () => {
    const responses = [{ ok: true }, { ok: true }, { ok: true }];
    globalThis.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    const payloads = [{ type: 'a' }, { type: 'b' }, { type: 'c' }];
    const results = await callServerBatch(payloads, 2);
    expect(results).toHaveLength(3);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// execStream Tests (simplified, as it uses WebSocket)
// ──────────────────────────────────────────────────────────────────────────────
describe('execStream', () => {
  it('creates WebSocket and handles messages', async () => {
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1,
    };
    global.WebSocket = vi.fn(() => mockWs);

    const onLine = vi.fn();
    const promise = execStream('ls', '/tmp', onLine);

    // Simulate open
    mockWs.onopen?.();
    expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('exec_stream'));

    // Simulate message
    mockWs.onmessage?.({ data: JSON.stringify({ type: 'stdout', data: 'file.txt\n' }) });
    expect(onLine).toHaveBeenCalledWith('file.txt\n', 'stdout');

    // Simulate exit
    mockWs.onmessage?.({ data: JSON.stringify({ type: 'exit', code: 0 }) });
    const result = await promise;
    expect(result).toEqual({ exitCode: 0, output: 'file.txt\n' });
  });
});
