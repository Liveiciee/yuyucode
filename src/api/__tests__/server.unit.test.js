import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer, callServerBatch, execStream } from '../server.js';
import { YUYU_SERVER, WS_SERVER } from '../../constants.js';

vi.mock('../../constants.js', () => ({
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
}));

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.clearAllMocks();
});

describe('callServer', () => {
  it('should return ok:true on successful fetch', async () => {
    const mockData = { ok: true, data: 'test' };
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    const result = await callServer({ type: 'ping' });
    expect(result).toEqual(mockData);
  });

  it('should handle non-ok response', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Server Error',
    });
    const result = await callServer({ type: 'ping' });
    expect(result.ok).toBe(false);
    expect(result.data).toContain('Server error: 500');
  });

  it('should retry on network error', async () => {
    globalThis.fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });
    const result = await callServer({ type: 'ping' }, 1);
    expect(result.ok).toBe(true);
  });

  it('should return fallback message after max retries', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network error'));
    const result = await callServer({ type: 'ping' }, 2);
    expect(result.ok).toBe(false);
    expect(result.data).toContain('yuyu-server.cjs');
  });
});

describe('callServerBatch', () => {
  it('should execute multiple calls in parallel', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'a' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'b' }) });
    const results = await callServerBatch([{ type: 'a' }, { type: 'b' }], 2);
    expect(results).toHaveLength(2);
    expect(results[0].data).toBe('a');
    expect(results[1].data).toBe('b');
  });
});

describe('execStream', () => {
  it('should establish WebSocket connection', async () => {
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    globalThis.WebSocket = vi.fn(() => mockWs);
    const onLine = vi.fn();
    const promise = execStream('ls', '/tmp', onLine, null);
    mockWs.onopen();
    mockWs.onmessage({ data: JSON.stringify({ type: 'exit', code: 0, id: 'some-id' }) });
    await promise;
    expect(mockWs.send).toHaveBeenCalled();
  });
});
