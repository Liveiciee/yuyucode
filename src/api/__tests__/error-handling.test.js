// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askAIStream, ServerError, RateLimitError } from '../../api.js';
import * as cerebrasModule from '../providers/cerebras.js';

vi.mock('../../constants.js', () => ({
  MODELS: [{ id: 'cerebras-model', provider: 'cerebras' }],
  GROQ_FALLBACK_CHAIN: [],
}));

vi.mock('../../runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => 'mock-key',
  getRuntimeGroqKey: () => null,
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('Error Handling', () => {
  it('throws ServerError on 5xx', async () => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new ServerError('Cerebras', 500));

    await expect(
      askAIStream([{ role: 'user', content: 'hi' }], 'cerebras-model', () => {}, null)
    ).rejects.toThrow(ServerError);
  });

  it('throws RateLimitError on 429', async () => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockRejectedValue(new RateLimitError(30, 'Cerebras'));

    await expect(
      askAIStream([{ role: 'user', content: 'hi' }], 'cerebras-model', () => {}, null)
    ).rejects.toThrow(RateLimitError);
  });

  it('retries on network error', async () => {
    let attempts = 0;
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockImplementation(async () => {
      attempts++;
      if (attempts < 2) throw new Error('network error');
      return 'recovered';
    });

    const result = await askAIStream(
      [{ role: 'user', content: 'hi' }],
      'cerebras-model',
      () => {},
      null
    );

    expect(result).toBe('recovered');
    expect(attempts).toBe(2);
  });
});
