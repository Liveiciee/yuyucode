import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cerebrasRequest, getCerebrasKey } from '../../providers/cerebras.js';
import { makeSseResponse } from '../setup.js';

vi.mock('../../../constants.js');
vi.mock('../../../runtimeKeys.js');

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.clearAllMocks();
});

describe('cerebrasRequest', () => {
  it('makes request and returns streamed content', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    const result = await cerebrasRequest(
      [{ role: 'user', content: 'Hi' }],
      'cerebras-model',
      () => {},
      new AbortController().signal
    );

    expect(result).toBe('Hello');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws when API key is missing', async () => {
    // Temporarily mock getCerebrasKey to return empty
    vi.spyOn({ getCerebrasKey }, 'getCerebrasKey').mockReturnValue('');

    await expect(
      cerebrasRequest([{ role: 'user', content: 'Hi' }], 'cerebras-model', () => {}, null)
    ).rejects.toThrow('Cerebras API key not configured');
  });
});
