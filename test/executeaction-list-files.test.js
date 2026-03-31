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

describe('executeAction — list_files', () => {
  it.skip('formats directory listing with icons', async () => {
    callServer.mockResolvedValue({
      ok: true,
      data: [
        { isDir: true,  name: 'src',      size: 0 },
        { isDir: false, name: 'README.md', size: 1024 },
        { isDir: false, name: 'index.js',  size: 512 },
      ],
    });
    const r = await executeAction({ type: 'list_files', path: '.' }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toContain('📁 src');
    expect(r.data).toContain('📄 README.md');
    expect(r.data).toContain('1KB');
  });

  it.skip('returns server error as-is when not ok', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'permission denied' });
    const r = await executeAction({ type: 'list_files', path: '/secret' }, '/base');
    expect(r.ok).toBe(false);
  });

  it.skip('handles empty directory', async () => {
    callServer.mockResolvedValue({ ok: true, data: [] });
    const r = await executeAction({ type: 'list_files', path: '.' }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toBe('');
  });
});
