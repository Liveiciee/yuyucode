// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askAIStream, ValidationError } from '../../api.js';
import * as cerebrasModule from '../providers/cerebras.js';

vi.mock('../../constants.js', () => ({
  MODELS: [{ id: 'test-model', provider: 'cerebras' }],
  GROQ_FALLBACK_CHAIN: [],
}));

vi.mock('../../runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => 'mock-key',
  getRuntimeGroqKey: () => null,
}));

beforeEach(() => {
  vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('ok');
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('Input Validation', () => {
  it('throws on empty messages array', async () => {
    await expect(askAIStream([], 'test-model', () => {}, null)).rejects.toThrow(ValidationError);
  });

  it('throws on non-array messages', async () => {
    await expect(askAIStream(null, 'test-model', () => {}, null)).rejects.toThrow(ValidationError);
  });

  it('throws on messages without role', async () => {
    await expect(askAIStream([{ content: 'hi' }], 'test-model', () => {}, null)).rejects.toThrow(ValidationError);
  });

  it('throws on messages without content', async () => {
    await expect(askAIStream([{ role: 'user' }], 'test-model', () => {}, null)).rejects.toThrow(ValidationError);
  });
});
