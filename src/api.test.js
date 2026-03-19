import { describe, it, expect, vi } from 'vitest';
import { readSSEStream } from './api';

global.TextDecoder = class {
  decode(chunk) {
    return new TextDecoder().decode(chunk);
  }
};

global.ReadableStream = class {
  constructor() {}
};

describe('readSSEStream', () => {
  it('should read full SSE stream and call onChunk with accumulated content', async () => {
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}]}\n') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}]}\n') })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: vi.fn(),
    };

    const mockResponse = {
      body: { getReader: () => mockReader },
    };

    const onChunk = vi.fn();
    const controller = new AbortController();

    const result = await readSSEStream(mockResponse, onChunk, controller.signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result).toBe('Hello world');
    expect(mockReader.releaseLock).toHaveBeenCalled();
  });

  it('should handle partial JSON and buffer across chunks', async () => {
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(' world!"}]}}\n') })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: vi.fn(),
    };

    const mockResponse = {
      body: { getReader: () => mockReader },
    };

    const onChunk = vi.fn();
    const controller = new AbortController();

    const result = await readSSEStream(mockResponse, onChunk, controller.signal);

    expect(onChunk).toHaveBeenCalledWith('Hello world!');
    expect(result).toBe('Hello world!');
  });

  it('should ignore invalid JSON lines and continue processing', async () => {
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}]}\n') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: invalid json\n') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}]}\n') })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: vi.fn(),
    };

    const mockResponse = {
      body: { getReader: () => mockReader },
    };

    const onChunk = vi.fn();
    const controller = new AbortController();

    const result = await readSSEStream(mockResponse, onChunk, controller.signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result).toBe('Hello world');
  });

  it('should throw AbortError if signal is aborted during read', async () => {
    const mockReader = {
      read: vi
        .fn()
        .mockImplementation(async () => {
          // Simulate abort after first read
          controller.abort();
          throw new Error('aborted');
        }),
      releaseLock: vi.fn(),
    };

    const mockResponse = {
      body: { getReader: () => mockReader },
    };

    const onChunk = vi.fn();
    const controller = new AbortController();

    await expect(readSSEStream(mockResponse, onChunk, controller.signal)).rejects.toThrow('AbortError');
    expect(mockReader.releaseLock).toHaveBeenCalled();
  });

  it('should handle [DONE] event and ignore it', async () => {
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}]}\n') })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n') })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: vi.fn(),
    };

    const mockResponse = {
      body: { getReader: () => mockReader },
    };

    const onChunk = vi.fn();
    const controller = new AbortController();

    const result = await readSSEStream(mockResponse, onChunk, controller.signal);

    expect(onChunk).toHaveBeenCalledWith('Hello');
    expect(result).toBe('Hello');
  });
});
