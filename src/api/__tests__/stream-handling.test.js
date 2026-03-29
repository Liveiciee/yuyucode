// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askAIStream } from '../../api.js';
import * as cerebrasModule from '../providers/cerebras.js';

vi.mock('../../constants.js', () => ({
  MODELS: [{ id: 'cerebras-model', provider: 'cerebras' }],
  GROQ_FALLBACK_CHAIN: [],
}));

vi.mock('../../runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => 'mock-key',
  getRuntimeGroqKey: () => null,
}));

beforeEach(() => {
  vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async (msg, model, onChunk) => {
    onChunk('Hello');
    onChunk('Hello World');
    onChunk('Hello World!');
    return 'Hello World!';
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('Stream Handling', () => {
  it('accumulates chunks correctly', async () => {
    const chunks = [];
    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'cerebras-model',
      c => chunks.push(c),
      null
    );

    expect(result).toBe('Hello World!');
    expect(chunks).toEqual(['Hello', 'Hello World', 'Hello World!']);
  });

  it('handles empty content', async () => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async (msg, model, onChunk) => {
      onChunk('');
      return '';
    });

    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'cerebras-model',
      () => {},
      null
    );

    expect(result).toBe('');
  });
});
