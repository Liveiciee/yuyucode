import { describe, it, expect, vi } from 'vitest';
import { readSSEStream } from './api';

describe('readSSEStream', () => {
  it('should read and parse SSE stream correctly', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}]}\n'));
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}]}\n'));
        controller.close();
      },
    });

    const mockResponse = { body: mockStream };
    const onChunk = vi.fn();
    const signal = AbortSignal.timeout(1000);

    const result = await readSSEStream(mockResponse, onChunk, signal);

    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result).toBe('Hello world');
  });

  it('should handle partial JSON and buffer correctly', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello'));
        controller.enqueue(new TextEncoder().encode(' world"}]}\n'));
        controller.close();
      },
    });

    const mockResponse = { body: mockStream };
    const onChunk = vi.fn();
    const signal = AbortSignal.timeout(1000);

    const result = await readSSEStream(mockResponse, onChunk, signal);

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk).toHaveBeenCalledWith('Hello world');
    expect(result).toBe('Hello world');
  });

  it('should handle invalid JSON gracefully', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {invalid json\n'));
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"recovered"}]}\n'));
        controller.close();
      },
    });

    const mockResponse = { body: mockStream };
    const onChunk = vi.fn();
    const signal = AbortSignal.timeout(1000);

    const result = await readSSEStream(mockResponse, onChunk, signal);

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk).toHaveBeenCalledWith('recovered');
    expect(result).toBe('recovered');
  });

  it('should handle [DONE] message and ignore it', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n'));
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"done ignored"}]}\n'));
        controller.close();
      },
    });

    const mockResponse = { body: mockStream };
    const onChunk = vi.fn();
    const signal = AbortSignal.timeout(1000);

    const result = await readSSEStream(mockResponse, onChunk, signal);

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk).toHaveBeenCalledWith('done ignored');
    expect(result).toBe('done ignored');
  });

  it('should throw AbortError if signal is aborted during read', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}]}\n'));
        // Simulate abort after first chunk
        setTimeout(() => controller.desiredSize = -1, 10);
      },
    });

    const mockResponse = { body: mockStream };
    const onChunk = vi.fn();
    const controller = new AbortController();
    controller.abort();

    await expect(readSSEStream(mockResponse, onChunk, controller.signal)).rejects.toThrow('AbortError');
    expect(onChunk).not.toHaveBeenCalled();
  });

  it('should handle empty stream and return empty string', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    const mockResponse = { body: mockStream };
    const onChunk = vi.fn();
    const signal = AbortSignal.timeout(1000);

    const result = await readSSEStream(mockResponse, onChunk, signal);

    expect(onChunk).not.toHaveBeenCalled();
    expect(result).toBe('');
  });
});
