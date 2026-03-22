// @vitest-environment node
// branch.coverage.test.js — utils.js condition branch coverage
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, generateDiff, resolvePath } from './utils.js';

vi.mock('./api.js', () => ({ callServer: vi.fn() }));
import { callServer } from './api.js';

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ── read_file: no meta → raw data ────────────────────────────────────────────
describe('executeAction — read_file no meta', () => {
  it('returns raw data when no meta in response', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'file content' });
    const r = await executeAction({ type: 'read_file', path: 'App.js' }, '/base', callServer);
    expect(r.data).toBe('file content');
  });

  it('adds line prefix when meta present', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'content', meta: { totalLines: 50, totalChars: 500 } });
    const r = await executeAction({ type: 'read_file', path: 'App.js', from: 1, to: 10 }, '/base', callServer);
    expect(r.data).toContain('Lines');
    expect(r.data).toContain('50');
  });

  it('passes from and to to callServer', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'partial' });
    await executeAction({ type: 'read_file', path: 'App.js', from: 5, to: 10 }, '/base', callServer);
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ from: 5, to: 10 }));
  });
});

// ── patch_file: new_str undefined → '' ───────────────────────────────────────
describe('executeAction — patch_file new_str', () => {
  it('defaults new_str to empty string when undefined', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'patch_file', path: 'App.js', old_str: 'foo' }, '/base', callServer);
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ new_str: '' }));
  });

  it('uses explicit new_str when provided', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'patch_file', path: 'App.js', old_str: 'foo', new_str: 'bar' }, '/base', callServer);
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ new_str: 'bar' }));
  });
});

// ── list_files: size=0 vs size>0 ─────────────────────────────────────────────
describe('executeAction — list_files size branches', () => {
  it('omits KB label when size is 0', async () => {
    callServer.mockResolvedValue({ ok: true, data: [{ name: 'empty.js', isDir: false, size: 0 }] });
    const r = await executeAction({ type: 'list_files', path: '.' }, '/base', callServer);
    expect(r.data).not.toContain('KB');
    expect(r.data).toContain('📄 empty.js');
  });

  it('shows KB when size > 0', async () => {
    callServer.mockResolvedValue({ ok: true, data: [{ name: 'big.js', isDir: false, size: 4096 }] });
    const r = await executeAction({ type: 'list_files', path: '.' }, '/base', callServer);
    expect(r.data).toContain('KB');
  });
});

// ── generateDiff: maxLines truncation ────────────────────────────────────────
describe('generateDiff — branches', () => {
  it('truncates with baris lebih when over maxLines', () => {
    const original = Array.from({ length: 30 }, (_, i) => `old${i}`).join('\n');
    const patched  = Array.from({ length: 30 }, (_, i) => `new${i}`).join('\n');
    expect(generateDiff(original, patched, 5)).toContain('baris lebih');
  });

  it('returns empty string for empty inputs', () => {
    expect(generateDiff('', 'new', 40)).toBe('');
    expect(generateDiff('old', '', 40)).toBe('');
  });

  it('handles context hunks correctly', () => {
    const original = 'a\nb\nc\nd\ne';
    const patched  = 'a\nb\nX\nd\ne';
    expect(generateDiff(original, patched, 40)).toContain('X');
  });
});

// ── lint: various branches ────────────────────────────────────────────────────
describe('executeAction — lint branches', () => {
  it('returns Clean when no issues', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;\n' });
    const r = await executeAction({ type: 'lint', path: 'clean.js' }, '/base', callServer);
    expect(r.data).toBe('✅ Clean');
  });

  it('reports unbalanced brackets', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'function foo() { if (x) {\n' });
    const r = await executeAction({ type: 'lint', path: 'bad.js' }, '/base', callServer);
    expect(r.data).toContain('Bracket tidak balance');
  });

  it('skips console.log when allowLogs=true', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'console.log("hi");\n' });
    const r = await executeAction({ type: 'lint', path: 'debug.js', allowLogs: true }, '/base', callServer);
    expect(r.data).toBe('✅ Clean');
  });

  it('flags long lines > 200 chars', async () => {
    const longLine = 'const x = ' + '"'.repeat(210) + ';';
    callServer.mockResolvedValue({ ok: true, data: longLine });
    const r = await executeAction({ type: 'lint', path: 'long.js' }, '/base', callServer);
    expect(r.data).toContain('terlalu panjang');
  });

  it('returns error when file read fails', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'not found' });
    const r = await executeAction({ type: 'lint', path: 'missing.js' }, '/base', callServer);
    expect(r.ok).toBe(false);
  });
});

// ── create_structure: partial failure ────────────────────────────────────────
describe('executeAction — create_structure partial failure', () => {
  it('shows ❌ for failed writes', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, data: 'disk full' });
    const r = await executeAction({
      type: 'create_structure',
      files: [{ path: 'a.js', content: '' }, { path: 'b.js', content: '' }],
    }, '/base', callServer);
    expect(r.data).toContain('❌');
    expect(r.data).toContain('✅');
  });
});

// ── move_file: from vs path ───────────────────────────────────────────────────
describe('executeAction — move_file', () => {
  it('uses from field when present', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', from: 'old.js', to: 'new.js' }, '/base', callServer);
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'move' }));
  });

  it('falls back to path field when from missing', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', path: 'old.js', to: 'new.js' }, '/base', callServer);
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'move' }));
  });
});

// ── resolvePath: actual documented behavior ───────────────────────────────────
describe('resolvePath — documented behavior', () => {
  it('strips leading slash from path before concat', () => {
    // '/file' → strips to 'file' → base + '/' + 'file'
    expect(resolvePath('/base', '/file')).toBe('/base/file');
  });

  it('returns path unchanged when already starts with base+slash', () => {
    expect(resolvePath('/base', 'base/src')).toBe('/base/src');
  });

  it('handles empty base', () => {
    expect(resolvePath('', 'path/to/file')).toBe('path/to/file');
  });

  it('handles empty path', () => {
    expect(resolvePath('/base', '')).toBe('/base');
  });
});
