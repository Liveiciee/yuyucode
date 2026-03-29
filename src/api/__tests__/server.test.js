// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer } from '../../api.js';

vi.mock('../../constants.js', () => ({
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
  MODELS: [],
}));

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
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

  it('returns ok:false with message on non-ok HTTP status', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(false);
    // Error message could be either from server or fallback message
    expect(r.data).toMatch(/500|tidak dapat dihubungi/);
  });

  it('returns ok:false when fetch throws (server unreachable)', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(false);
    expect(r.data).toContain('yuyu-server.cjs');
  });
});
