import { describe, it, expect, vi } from 'vitest';
import { getTsExtensions } from '../tsExtensions.js';

describe('tsExtensions', () => {
  it('returns null if import fails', async () => {
    // Mock dynamic import to fail
    vi.doMock('@valtown/codemirror-ts', () => { throw new Error('module not found'); });
    const mod = await getTsExtensions();
    expect(mod).toBeNull();
  });
});
