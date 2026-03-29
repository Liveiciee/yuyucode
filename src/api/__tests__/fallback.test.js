// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askAIStream, RateLimitError } from '../../api.js';
import * as cerebrasModule from '../providers/cerebras.js';
import * as groqModule from '../providers/groq.js';

vi.mock('../../constants.js', () => ({
  MODELS: [{ id: 'cerebras-model', provider: 'cerebras' }],
  GROQ_FALLBACK_CHAIN: ['groq-model'],
}));

vi.mock('../../runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => 'mock-key',
  getRuntimeGroqKey: () => 'mock-key',
}));

beforeEach(() => {
  vi.spyOn(groqModule, 'groqRequest').mockResolvedValue('fallback response');
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('Rate Limit Fallback', () => {
  it('falls back to Groq when Cerebras returns 429', async () => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(10, 'Cerebras'));

    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'cerebras-model',
      () => {},
      null
    );

    expect(result).toBe('fallback response');
    expect(groqModule.groqRequest).toHaveBeenCalled();
  });
});
