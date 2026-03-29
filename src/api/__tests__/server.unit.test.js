// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer, callServerBatch } from '../../api.js';

vi.mock('../../constants.js', () => ({
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
  MODELS: [],
}));

const originalFetch = globalThis.fetch;
beforeEach(() => { globalThis.fetch = vi.fn(); });
afterEach(() => { globalThis.fetch = originalFetch; vi.clearAllMocks(); });

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

describe('callServer', () => {
  it('returns ok:true and parsed JSON on success', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'hello' }));
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(true);
    expect(r.data).toBe('hello');
  });
});
