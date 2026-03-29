// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer, callServerBatch, execStream } from '../../api.js';

vi.mock('../../constants.js', () => ({
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
  MODELS: [], // ← tambahkan ini
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

  it('returns ok:false on network timeout', async () => {
    globalThis.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const r = await callServer({ type: 'read', path: '/file.txt' });
    expect(r.ok).toBe(false);
  });

  it('truncates error message to 200 chars', async () => {
    const longError = 'x'.repeat(500);
    globalThis.fetch.mockResolvedValueOnce({
      ok: false, status: 500,
      text: () => Promise.resolve(longError),
    });
    const r = await callServer({ type: 'ping' });
    expect(r.data.length).toBeLessThanOrEqual(250);
  });
});

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

  it('maintains order of results', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(mockJsonResponse({ data: 'third' }))
      .mockResolvedValueOnce(mockJsonResponse({ data: 'first' }))
      .mockResolvedValueOnce(mockJsonResponse({ data: 'second' }));

    const results = await callServerBatch([
      { type: 'req1' },
      { type: 'req2' },
      { type: 'req3' },
    ]);
    expect(results.map(r => r.data)).toEqual(['third', 'first', 'second']);
  });
});

describe('execStream', () => {
  it('connects to WebSocket and sends exec_stream message', async () => {
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    globalThis.WebSocket.mockImplementation(() => mockWs);

    const promise = execStream('ls -la', '/tmp', () => {}, null);
    mockWs.onopen();
    mockWs.onmessage({ data: JSON.stringify({ id: mockWs.send.mock.calls[0][0], type: 'exit', code: 0 }) });
    await promise;
    expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('exec_stream'));
  });

  it('streams stdout and stderr to onLine callback', async () => {
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    globalThis.WebSocket.mockImplementation(() => mockWs);

    const onLine = vi.fn();
    const promise = execStream('echo hello', '/tmp', onLine, null);

    mockWs.onopen();
    mockWs.onmessage({ data: JSON.stringify({ id: 'exec_test', type: 'stdout', data: 'hello\n' }) });
    mockWs.onmessage({ data: JSON.stringify({ id: 'exec_test', type: 'stderr', data: 'warning\n' }) });
    mockWs.onmessage({ data: JSON.stringify({ id: 'exec_test', type: 'exit', code: 0 }) });

    const result = await promise;
    expect(result.exitCode).toBe(0);
    expect(onLine).toHaveBeenCalledWith('hello\n', 'stdout');
    expect(onLine).toHaveBeenCalledWith('warning\n', 'stderr');
  });

  it('handles WebSocket connection error', async () => {
    globalThis.WebSocket.mockImplementation(() => {
      throw new Error('WebSocket unavailable');
    });

    await expect(execStream('ls', '/tmp', () => {}, null))
      .rejects.toThrow('WebSocket tidak tersedia');
  });

  it('handles abort signal', async () => {
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    globalThis.WebSocket.mockImplementation(() => mockWs);

    const ctrl = new AbortController();
    const promise = execStream('long-running', '/tmp', () => {}, ctrl.signal);
    mockWs.onopen();
    ctrl.abort();
    await expect(promise).rejects.toThrow('Aborted');
    expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('kill'));
  });

  it('returns exit code -1 on error message', async () => {
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    globalThis.WebSocket.mockImplementation(() => mockWs);

    const promise = execStream('bad-command', '/tmp', () => {}, null);
    mockWs.onopen();
    mockWs.onmessage({ data: JSON.stringify({ id: 'exec_test', type: 'error', data: 'command not found' }) });

    const result = await promise;
    expect(result.exitCode).toBe(-1);
  });

  it('ignores messages with wrong id', async () => {
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    globalThis.WebSocket.mockImplementation(() => mockWs);

    const onLine = vi.fn();
    const promise = execStream('ls', '/tmp', onLine, null);

    mockWs.onopen();
    mockWs.onmessage({ data: JSON.stringify({ id: 'wrong_id', type: 'stdout', data: 'ignored' }) });
    mockWs.onmessage({ data: JSON.stringify({ id: 'exec_*', type: 'exit', code: 0 }) });

    const result = await promise;
    expect(onLine).not.toHaveBeenCalledWith('ignored', 'stdout');
    expect(result.exitCode).toBe(0);
  });
});
