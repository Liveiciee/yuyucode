import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readSSEStream } from './api';

// Simpan referensi ASLI sebelum override apapun
const OriginalTextDecoder = globalThis.TextDecoder;

describe('readSSEStream', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function makeReader(...chunks) {
    const calls = chunks.map(chunk => ({
      done: false,
      value: OriginalTextDecoder ? new TextEncoder().encode(chunk) : chunk,
    }));
    calls.push({ done: true });
    let i = 0;
    return {
      read: vi.fn().mockImplementation(() => Promise.resolve(calls[i++])),
      releaseLock: vi.fn(),
    };
  }

  function makeResponse(reader) {
    return { body: { getReader: () => reader } };
  }

  it('should accumulate chunks and call onChunk per token', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result).toBe('Hello world');
    expect(reader.releaseLock).toHaveBeenCalled();
  });

  it('should skip invalid JSON lines gracefully', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Hi"}}]}\n',
      'data: invalid-json\n',
      'data: {"choices":[{"delta":{"content":"!"}}]}\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hi');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hi!');
    expect(result).toBe('Hi!');
  });

  it('should ignore [DONE] sentinel', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Done"}}]}\n',
      'data: [DONE]\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(result).toBe('Done');
    expect(onChunk).toHaveBeenCalledTimes(1);
  });

  it('should handle abort and throw DOMException', async () => {
    const ctrl = new AbortController();
    const reader = {
      read: vi.fn().mockImplementation(async () => {
        ctrl.abort();
        throw new Error('network error');
      }),
      releaseLock: vi.fn(),
    };
    const onChunk = vi.fn();

    await expect(
      readSSEStream(makeResponse(reader), onChunk, ctrl.signal)
    ).rejects.toThrow();

    expect(reader.releaseLock).toHaveBeenCalled();
  });

  it('should flush remaining buffer without trailing newline', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Flush"}}]}',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(result).toBe('Flush');
    expect(onChunk).toHaveBeenCalledWith('Flush');
  });
});
