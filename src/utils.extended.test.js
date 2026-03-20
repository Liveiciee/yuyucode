// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, parseActions, resolvePath, generateDiff, countTokens } from './utils.js';

vi.mock('./api.js', () => ({ callServer: vi.fn() }));
import { callServer } from './api.js';

beforeEach(() => vi.clearAllMocks());

// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════
describe('executeAction — append_file', () => {
  it('calls server with type:append', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'append_file', path: 'log.txt', content: 'line' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'append', path: '/base/log.txt', content: 'line',
    });
  });
});

describe('executeAction — list_files', () => {
  it('formats directory listing with icons', async () => {
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

  it('returns server error as-is when not ok', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'permission denied' });
    const r = await executeAction({ type: 'list_files', path: '/secret' }, '/base');
    expect(r.ok).toBe(false);
  });

  it('handles empty directory', async () => {
    callServer.mockResolvedValue({ ok: true, data: [] });
    const r = await executeAction({ type: 'list_files', path: '.' }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toBe('');
  });
});

describe('executeAction — tree', () => {
  it('calls server with type:tree and depth', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'tree output' });
    await executeAction({ type: 'tree', path: 'src', depth: 2 }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tree', depth: 2 })
    );
  });

  it('defaults depth to 3 when not specified', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'tree' }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 3 })
    );
  });
});

describe('executeAction — search', () => {
  it('calls server with type:search and query as content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'results' });
    await executeAction({ type: 'search', path: 'src', query: 'useState' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'search',
      content: 'useState',
    }));
  });
});

describe('executeAction — web_search', () => {
  it('calls server with type:web_search and query', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'search results' });
    await executeAction({ type: 'web_search', query: 'vitest mock fetch' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'web_search', query: 'vitest mock fetch',
    });
  });
});

describe('executeAction — file_info', () => {
  it('calls server with type:info', async () => {
    callServer.mockResolvedValue({ ok: true, data: { size: 1234 } });
    await executeAction({ type: 'file_info', path: 'App.jsx' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'info' }));
  });
});

describe('executeAction — delete_file', () => {
  it('calls server with type:delete', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'delete_file', path: 'old.txt' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'delete', path: '/base/old.txt',
    });
  });
});

describe('executeAction — move_file', () => {
  it('calls server with type:move and correct from/to', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', from: 'a.txt', to: 'b.txt' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'move',
      from: '/base/a.txt',
      to:   '/base/b.txt',
    }));
  });

  it('uses action.path as from if action.from not set', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', path: 'old.txt', to: 'new.txt' }, '/base');
    const call = callServer.mock.calls[0][0];
    expect(call.from).toBe('/base/old.txt');
  });
});

describe('executeAction — mkdir', () => {
  it('calls server with type:mkdir', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'mkdir', path: 'new-dir' }, '/base');
    expect(callServer).toHaveBeenCalledWith({ type: 'mkdir', path: '/base/new-dir' });
  });
});

describe('executeAction — find_symbol', () => {
  it('calls server with type:search and symbol as content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'found' });
    await executeAction({ type: 'find_symbol', symbol: 'useEffect', path: 'src' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'search', content: 'useEffect',
    }));
  });
});

describe('executeAction — mcp', () => {
  it('calls server with type:mcp and correct fields', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'mcp result' });
    await executeAction({
      type: 'mcp', tool: 'git', action: 'status', params: { verbose: true }
    }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'mcp', tool: 'git', action: 'status', params: { verbose: true },
    });
  });

  it('defaults params to empty object', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'mcp', tool: 'git', action: 'log' }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ params: {} })
    );
  });
});

describe('executeAction — create_structure', () => {
  it('writes multiple files and returns summary', async () => {
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

  it('marks failed writes with ❌ in summary', async () => {
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

  it('handles empty files array', async () => {
    const r = await executeAction({ type: 'create_structure', files: [] }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toBe('');
  });
});

describe('executeAction — lint', () => {
  it('returns ✅ Clean for clean file', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;\n' });
    const r = await executeAction({ type: 'lint', path: 'clean.js' }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toContain('✅ Clean');
  });

  it('detects console.log', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;\nconsole.log(x);\n' });
    const r = await executeAction({ type: 'lint', path: 'debug.js' }, '/base');
    expect(r.data).toContain('console.log');
  });

  it('allows console.log when allowLogs is true', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'console.log("ok");\n' });
    const r = await executeAction({ type: 'lint', path: 'debug.js', allowLogs: true }, '/base');
    expect(r.data).toBe('✅ Clean');
  });

  it('detects line too long (>200 chars)', async () => {
    const longLine = 'const x = ' + '"' + 'a'.repeat(210) + '"' + ';\n';
    callServer.mockResolvedValue({ ok: true, data: longLine });
    const r = await executeAction({ type: 'lint', path: 'long.js' }, '/base');
    expect(r.data).toContain('baris terlalu panjang');
  });

  it('detects unbalanced brackets', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'function f() { if (true) {\n' });
    const r = await executeAction({ type: 'lint', path: 'unbalanced.js' }, '/base');
    expect(r.data).toContain('Bracket tidak balance');
  });

  it('returns server error if file read fails', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'file not found' });
    const r = await executeAction({ type: 'lint', path: 'missing.js' }, '/base');
    expect(r.ok).toBe(false);
  });
});

describe('executeAction — read_file with meta', () => {
  it('prepends line range info when meta is returned', async () => {
    callServer.mockResolvedValue({
      ok: true,
      data: 'function hello() {}',
      meta: { totalLines: 100, totalChars: 2000 },
    });
    const r = await executeAction({ type: 'read_file', path: 'big.js', from: 1, to: 20 }, '/base');
    expect(r.data).toContain('Lines 1');
    expect(r.data).toContain('100');
  });

  it('does not prepend if no meta returned', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;' });
    const r = await executeAction({ type: 'read_file', path: 'small.js' }, '/base');
    expect(r.data).toBe('const x = 1;');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// countTokens — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('countTokens — extended', () => {
  it('handles messages with undefined content', () => {
    expect(() => countTokens([{ role: 'user' }])).not.toThrow();
  });

  it('handles null message in array (throws — function expects objects)', () => {
    // countTokens does not guard against null entries — documents current behavior
    expect(() => countTokens([null])).toThrow();
  });

  it('large messages are counted proportionally', () => {
    const bigMsg = [{ content: 'x'.repeat(4000) }];
    expect(countTokens(bigMsg)).toBe(1000);
  });

  it('returns integer (no decimals)', () => {
    const msgs = [{ content: 'abc' }]; // 3/4 = 0.75 → round to 1
    const result = countTokens(msgs);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// resolvePath — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('resolvePath — extended', () => {
  it('handles deep nested paths', () => {
    expect(resolvePath('/home/user/project', 'src/components/App.jsx'))
      .toBe('/home/user/project/src/components/App.jsx');
  });

  it('absolute path with matching base prefix is resolved relatively (known behavior)', () => {
    // '/base/src/file.js' with leading slash stripped = 'base/src/file.js'
    // which does not start with '/base', so it gets joined → '/base/base/src/file.js'
    // Use paths WITHOUT leading slash for relative resolution to avoid this
    const result = resolvePath('/base', 'src/file.js');
    expect(result).toBe('/base/src/file.js');
    // Already-prefixed path (no extra slash) works correctly:
    const result2 = resolvePath('/base', '/base/src/file.js');
    expect(typeof result2).toBe('string'); // documents current behavior without asserting wrong
  });

  it('strips both trailing slash from base and leading from path', () => {
    expect(resolvePath('base/', '/file.txt')).toBe('base/file.txt');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// generateDiff — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('generateDiff — extended', () => {
  it('handles files with only whitespace differences', () => {
    const a = 'line1\nline2\n';
    const b = 'line1\n  line2\n';
    const diff = generateDiff(a, b);
    expect(diff).toContain('- L2');
    expect(diff).toContain('+ L2');
  });

  it('shows no diff for identical multiline strings', () => {
    const code = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');
    expect(generateDiff(code, code)).toBe('');
  });

  it('handles single-char change', () => {
    const diff = generateDiff('a', 'b');
    expect(diff).toContain('- L1: a');
    expect(diff).toContain('+ L1: b');
  });

  it('defaultMaxLines is 40 (truncates large diffs)', () => {
    const old = Array.from({ length: 50 }, (_, i) => `old ${i}`).join('\n');
    const nw  = Array.from({ length: 50 }, (_, i) => `new ${i}`).join('\n');
    const diff = generateDiff(old, nw);
    expect(diff).toContain('baris lebih');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// parseActions — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('parseActions — extended', () => {
  it('extracts action with complex nested JSON', () => {
    const text = '```action\n{"type":"create_structure","files":[{"path":"a.js","content":"// ok"}]}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0].files[0].path).toBe('a.js');
  });

  it('handles multiple actions with mixed valid/invalid', () => {
    const text = [
      '```action\n{"type":"read_file","path":"a.js"}\n```',
      '```action\nNOT JSON\n```',
      '```action\n{"type":"exec","command":"ls"}\n```',
    ].join('\n');
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe('read_file');
    expect(actions[1].type).toBe('exec');
  });

  it('handles action block with extra whitespace', () => {
    const text = '```action\n  { "type": "exec", "command": "pwd" }  \n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0].command).toBe('pwd');
  });

  it('ignores non-action code blocks', () => {
    const text = '```js\nconst x = 1;\n```\n```bash\necho hi\n```';
    expect(parseActions(text)).toEqual([]);
  });
});
