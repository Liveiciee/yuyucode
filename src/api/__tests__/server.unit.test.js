// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer, callServerBatch, execStream } from '../../api.js';

vi.mock('../../constants.js', () => ({
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
  MODELS: [],
}));

const originalFetch = globalThis.fetch;
const originalWebSocket = globalThis.WebSocket;

beforeEach(() => {
  globalThis.fetch = vi.fn();
  globalThis.WebSocket = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.WebSocket = originalWebSocket;
  vi.clearAllMocks();
});

function mockJsonResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

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
    expect(r.data).toContain('yuyu-server.cjs');
  });
});

describe('callServerBatch', () => {
  it('executes all payloads in parallel and returns array', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(mockJsonResponse({ data: 'a' }))
      .mockResolvedValueOnce(mockJsonResponse({ data: 'b' }))
      .mockResolvedValueOnce(mockJsonResponse({ data: 'c' }));

    const results = await callServerBatch([
      { type: 'a' },
      { type: 'b' },
      { type: 'c' },
    ]);
    expect(results).toHaveLength(3);
    expect(results.map(r => r.data)).toEqual(['a', 'b', 'c']);
  });
});
