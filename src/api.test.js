import { describe, it, expect, vi } from "vitest";
import { readSSEStream } from "./api";

describe('readSSEStream', () => {
  const mockOnChunk = vi.fn();
  let mockReader, mockResponse, mockDecoder;

  beforeEach(() => {
    vi.resetAllMocks();

    mockDecoder = {
      decode: vi.fn()
    };

    global.TextDecoder = vi.fn(() => mockDecoder);

    mockReader = {
      read: vi.fn(),
      releaseLock: vi.fn()
    };

    mockResponse = {
      body: {
        getReader: vi.fn(() => mockReader)
      }
    };
  });

  it('should read full SSE stream and call onChunk with accumulated content', async () => {
    const decoder = new TextDecoder();
    const chunk1 = encoder.encode('data: {"choices":[{"delta":{"content":"Hello"}]}}\n');
    const chunk2 = encoder.encode('data: {"choices":[{"delta":{"content":" world"}]}}\n');
    const encoder = new TextEncoder();

    mockDecoder.decode
      .mockReturnValueOnce(decoder.decode(chunk1))
      .mockReturnValueOnce(decoder.decode(chunk2))
      .mockReturnValue('');

    mockReader.read
      .mockResolvedValueOnce({ done: false, value: chunk1 })
      .mockResolvedValueOnce({ done: false, value: chunk2 })
      .mockResolvedValueOnce({ done: true });

    const result = await readSSEStream(mockResponse, mockOnChunk, null);

    expect(mockOnChunk).toHaveBeenCalledTimes(2);
    expect(mockOnChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(mockOnChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result).toBe('Hello world');
    expect(mockReader.releaseLock).toHaveBeenCalled();
  });

  it('should handle partial JSON and buffer correctly', async () => {
    const decoder = new TextDecoder();
    const chunk1 = encoder.encode('data: {"choices":[{"delta":{"content":"Hello');
    const chunk2 = encoder.encode(' world"}]}}\n');
    const encoder = new TextEncoder();

    mockDecoder.decode
      .mockReturnValueOnce(decoder.decode(chunk1))
      .mockReturnValueOnce(decoder.decode(chunk2))
      .mockReturnValue('');

    mockReader.read
      .mockResolvedValueOnce({ done: false, value: chunk1 })
      .mockResolvedValueOnce({ done: false, value: chunk2 })
      .mockResolvedValueOnce({ done: true });

    const result = await readSSEStream(mockResponse, mockOnChunk, null);

    expect(mockOnChunk).toHaveBeenCalledTimes(1);
    expect(mockOnChunk).toHaveBeenCalledWith('Hello world');
    expect(result).toBe('Hello world');
  });

  it('should ignore non-data and [DONE] lines', async () => {
    const decoder = new TextDecoder();
    const chunk = encoder.encode('event: ping\ndata: [DONE]\n\n');
    const encoder = new TextEncoder();

    mockDecoder.decode.mockReturnValue(decoder.decode(chunk));
    mockReader.read
      .mockResolvedValueOnce({ done: false, value: chunk })
      .mockResolvedValueOnce({ done: true });

    const result = await readSSEStream(mockResponse, mockOnChunk, null);

    expect(mockOnChunk).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('should throw AbortError if signal is aborted during read', async () => {
    const abortController = new AbortController();
    abortController.abort();

    mockReader.read.mockRejectedValue(new Error('Reader error'));

    await expect(readSSEStream(mockResponse, mockOnChunk, abortController.signal)).rejects.toThrow(DOMException);
    expect(mockReader.releaseLock).toHaveBeenCalled();
  });

  it('should handle JSON parse error and continue', async () => {
    const decoder = new TextDecoder();
    const chunk = encoder.encode('data: invalid json\n');
    const encoder = new TextEncoder();

    mockDecoder.decode.mockReturnValue(decoder.decode(chunk));
    mockReader.read
      .mockResolvedValueOnce({ done: false, value: chunk })
      .mockResolvedValueOnce({ done: true });

    const result = await readSSEStream(mockResponse, mockOnChunk, null);

    expect(mockOnChunk).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('should flush buffered data at the end', async () => {
    const decoder = new TextDecoder();
    const chunk = encoder.encode('');
    const buffer = 'data: {"choices":[{"delta":{"content":"Final"}]}';

    mockDecoder.decode
      .mockReturnValueOnce(decoder.decode(chunk))
      .mockReturnValue(buffer); // buffer has incomplete line

    mockReader.read
      .mockResolvedValueOnce({ done: false, value: chunk })
      .mockResolvedValueOnce({ done: true });

    const result = await readSSEStream(mockResponse, mockOnChunk, null);

    expect(mockOnChunk).toHaveBeenCalledWith('Final');
    expect(result).toBe('Final');
  });
});
