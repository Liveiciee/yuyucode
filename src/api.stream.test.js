// @vitest-environment node
// src/api.stream.test.js — SSE Stream & Vision Tests
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readSSEStream, injectVisionImage } from '../src/api.js';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function makeReader(...chunks) {
  const calls = chunks.map(chunk => ({
    done: false,
    value: new TextEncoder().encode(chunk),
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

function makeChunk(content) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`;
}

// ──────────────────────────────────────────────────────────────────────────────
// readSSEStream Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('readSSEStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accumulates chunks and calls onChunk per token', async () => {
    const reader = makeReader(
      makeChunk('Hello'),
      makeChunk(' world'),
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result).toBe('Hello world');
    expect(reader.releaseLock).toHaveBeenCalled();
  });

  it('skips invalid JSON lines gracefully', async () => {
    const reader = makeReader(
      makeChunk('Hi'),
      'data: invalid-json\n',
      makeChunk('!'),
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hi');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hi!');
    expect(result).toBe('Hi!');
  });

  it('ignores [DONE] sentinel', async () => {
    const reader = makeReader(
      makeChunk('Done'),
      'data: [DONE]\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(result).toBe('Done');
    expect(onChunk).toHaveBeenCalledTimes(1);
  });

  it('handles abort and throws DOMException', async () => {
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
    ).rejects.toThrow('Aborted');

    expect(reader.releaseLock).toHaveBeenCalled();
  });

  it('flushes remaining buffer without trailing newline', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Flush"}}]}',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(result).toBe('Flush');
    expect(onChunk).toHaveBeenCalledWith('Flush');
  });

  it('breaks loop on read error when signal not aborted', async () => {
    const reader = {
      read: vi.fn().mockRejectedValue(new Error('network reset')),
      releaseLock: vi.fn(),
    };
    const resp = { body: { getReader: () => reader } };
    const result = await readSSEStream(resp, () => {}, new AbortController().signal);
    expect(result).toBe('');
  });

  it('handles empty content gracefully', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":""}}]}\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);
    expect(result).toBe('');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// injectVisionImage Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('injectVisionImage', () => {
  it('does nothing when imageBase64 is null/undefined', () => {
    const messages = [{ role: 'user', content: 'hello' }];
    const result = injectVisionImage(messages, null);
    expect(result).toEqual(messages);
  });

  it('injects image into last user message only', () => {
    const messages = [
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'last' },
    ];
    const result = injectVisionImage(messages, 'base64data');
    
    expect(result[0].content).toBe('first');
    expect(result[1].content).toBe('reply');
    expect(Array.isArray(result[2].content)).toBe(true);
    expect(result[2].content.some(c => c.type === 'image_url')).toBe(true);
  });

  it('handles string content', () => {
    const messages = [{ role: 'user', content: 'describe this' }];
    const result = injectVisionImage(messages, 'base64data');
    
    expect(result[0].content).toEqual([
      { type: 'text', text: 'describe this' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,base64data' } },
    ]);
  });

  it('handles array content (preserves text, adds image)', () => {
    const messages = [{ 
      role: 'user', 
      content: [{ type: 'text', text: 'describe this' }] 
    }];
    const result = injectVisionImage(messages, 'base64data');
    
    expect(Array.isArray(result[0].content)).toBe(true);
    expect(result[0].content.find(c => c.type === 'text')).toBeDefined();
    expect(result[0].content.find(c => c.type === 'image_url')).toBeDefined();
  });

  it('handles null content (converts to empty string)', () => {
    const messages = [{ role: 'user', content: null }];
    const result = injectVisionImage(messages, 'base64data');
    
    expect(Array.isArray(result[0].content)).toBe(true);
    expect(result[0].content.find(c => c.type === 'text').text).toBe('');
  });

  it('skips non-last messages even if they are user role', () => {
    const messages = [
      { role: 'user', content: 'first message' },
      { role: 'user', content: 'second message' },
    ];
    const result = injectVisionImage(messages, 'base64data');
    
    expect(result[0].content).toBe('first message');
    expect(Array.isArray(result[1].content)).toBe(true);
  });
});
