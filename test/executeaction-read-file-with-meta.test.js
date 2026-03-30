// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, parseActions, resolvePath, generateDiff, countTokens } from './utils.js';

vi.mock('./api.js', () => ({ callServer: vi.fn() }));
import { callServer } from './api.js';

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════

describe('executeAction — read_file with meta', () => {
  it.skip('prepends line range info when meta is returned', async () => {
    callServer.mockResolvedValue({
      ok: true,
      data: 'function hello() {}',
      meta: { totalLines: 100, totalChars: 2000 },
    });
    const r = await executeAction({ type: 'read_file', path: 'big.js', from: 1, to: 20 }, '/base');
    expect(r.data).toContain('Lines 1');
    expect(r.data).toContain('100');
  });

  it.skip('does not prepend if no meta returned', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;' });
    const r = await executeAction({ type: 'read_file', path: 'small.js' }, '/base');
    expect(r.data).toBe('const x = 1;');
  });
}