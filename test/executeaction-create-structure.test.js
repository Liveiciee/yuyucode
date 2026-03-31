// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, parseActions, resolvePath, generateDiff, countTokens } from '../src/utils.js';

vi.mock('../src/api.js', () => ({ callServer: vi.fn() }));
import { callServer } from '../src/api.js';

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════

describe('executeAction — create_structure', () => {
  it.skip('writes multiple files and returns summary', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });

    const r = await executeAction({
      type: 'create_structure',
      files: [
        { path: 'src/a.js', content: 'const a = 1;' },
        { path: 'src/b.js', content: 'const b = 2;' },
        { path: 'src/c.js', content: 'const c = 3;' },
      ],
    }, '/base');

    expect(r.ok).toBe(true);
    expect(callServer).toHaveBeenCalledTimes(3);
    expect(r.data).toContain('✅');
    expect(r.data).toContain('a.js');
  });

  it.skip('marks failed writes with ❌ in summary', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    const r = await executeAction({
      type: 'create_structure',
      files: [
        { path: 'ok.js', content: '' },
        { path: 'fail.js', content: '' },
      ],
    }, '/base');

    expect(r.data).toContain('✅');
    expect(r.data).toContain('❌');
  });

  it.skip('handles empty files array', async () => {
    const r = await executeAction({ type: 'create_structure', files: [] }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toBe('');
  });
});
