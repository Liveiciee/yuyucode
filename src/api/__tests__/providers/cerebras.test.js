import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cerebrasRequest } from '../../providers/cerebras.js';
import { makeSseResponse } from '../setup.js';
import * as cerebrasModule from '../../providers/cerebras.js';

// Apply global mocks from setup.js
import '../setup.js';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
  // Ensure getCerebrasKey returns a valid key for this test
  vi.spyOn(cerebrasModule, 'getCerebrasKey').mockReturnValue('test-cerebras-key');
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
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
    vi.spyOn(cerebrasModule, 'getCerebrasKey').mockReturnValue('');
    await expect(
      cerebrasRequest([{ role: 'user', content: 'Hi' }], 'cerebras-model', () => {}, null)
    ).rejects.toThrow('Cerebras API key not configured');
  });
});
