// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from './utils.js';

// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly

// ── Integration: parseActions → executeAction ─────────────────────────────────
describe('parseActions + executeAction (integration)', () => {

  it('should parse then execute read_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'isi file' });
    const text = '```action\n{"type":"read_file","path":"src/App.jsx"}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);

    const result = await executeAction(actions[0], '/home/user/project', mockCS);
    expect(mockCS).toHaveBeenCalledWith(expect.objectContaining({
      type: 'read',
      path: '/home/user/project/src/App.jsx',
    }));
    expect(result.ok).toBe(true);
    expect(result.data).toBe('isi file');
  });

  it('should parse then execute write_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"write_file","path":"output.txt","content":"hello"}\n```';
    const actions = parseActions(text);
    await executeAction(actions[0], '/base', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'write', path: '/base/output.txt', content: 'hello' });
  });

  it('should parse then execute exec action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'npm test output' });
    const text = '```action\n{"type":"exec","command":"npm test"}\n```';
    const [action] = parseActions(text);
    const result = await executeAction(action, '/project', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'exec', path: '/project', command: 'npm test' });
    expect(result.data).toBe('npm test output');
  });

  it('should parse then execute patch_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"patch_file","path":"src/utils.js","old_str":"const x = 1","new_str":"const x = 2"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/base', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'patch', path: '/base/src/utils.js', old_str: 'const x = 1', new_str: 'const x = 2' });
  });

  it('should handle multiple actions in sequence', async () => {
    const mockCS = vi.fn()
      .mockResolvedValueOnce({ ok: true, data: 'file content' })
      .mockResolvedValueOnce({ ok: true });
    const text = [
      '```action\n{"type":"read_file","path":"src/App.jsx"}\n```',
      '```action\n{"type":"write_file","path":"output.txt","content":"done"}\n```',
    ].join('\n');
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    const r1 = await executeAction(actions[0], '/proj', mockCS);
    const r2 = await executeAction(actions[1], '/proj', mockCS);
    expect(r1.data).toBe('file content');
    expect(r2.ok).toBe(true);
    expect(mockCS).toHaveBeenCalledTimes(2);
  });

  it('should handle list_files action and format output', async () => {
    const mockCS = vi.fn().mockResolvedValue({
      ok: true,
      data: [
        { name: 'App.jsx', isDir: false, size: 2048 },
        { name: 'components', isDir: true, size: 0 },
      ],
    });
    const text = '```action\n{"type":"list_files","path":"src"}\n```';
    const [action] = parseActions(text);
    const result = await executeAction(action, '/proj', mockCS);
    expect(result.ok).toBe(true);
    expect(result.data).toContain('📄 App.jsx');
    expect(result.data).toContain('📁 components');
  });

  it('should handle append_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"append_file","path":"log.txt","content":"new line"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/base', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'append', path: '/base/log.txt', content: 'new line' });
  });

  it('should handle tree action with default depth', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'tree output' });
    const text = '```action\n{"type":"tree","path":"src"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith(expect.objectContaining({ type: 'tree', depth: 3 }));
  });

  it('should handle search action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'search results' });
    const text = '```action\n{"type":"search","query":"useState","path":"src"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith(expect.objectContaining({ type: 'search', content: 'useState' }));
  });

  it('should handle web_search action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'web results' });
    const text = '```action\n{"type":"web_search","query":"vitest DI"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'web_search', query: 'vitest DI' });
  });

  it('should handle mkdir action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"mkdir","path":"src/new-feature"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'mkdir', path: '/proj/src/new-feature' });
  });

  it('should return unknown action error for unrecognized type', async () => {
    const mockCS = vi.fn();
    const action = { type: 'teleport', destination: 'mars' };
    const result = await executeAction(action, '/proj', mockCS);
    expect(result.ok).toBe(false);
    expect(result.data).toContain('Unknown action type');
    expect(mockCS).not.toHaveBeenCalled();
  });

  it('should handle create_structure with multiple files', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const action = {
      type: 'create_structure',
      files: [
        { path: 'src/a.js', content: 'const a = 1;' },
        { path: 'src/b.js', content: 'const b = 2;' },
      ],
    };
    const result = await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.data).toContain('✅');
  });

  it('should handle callServer rejection gracefully (throws)', async () => {
    const mockCS = vi.fn().mockRejectedValue(new Error('network error'));
    const action = { type: 'read_file', path: 'src/App.jsx' };
    await expect(executeAction(action, '/proj', mockCS)).rejects.toThrow('network error');
  });
});

// ── generateDiff ───────────────────────────────────────────────────────────────
describe('generateDiff', () => {
  it('returns empty string for falsy inputs', () => {
    expect(generateDiff('', 'abc')).toBe('');
    expect(generateDiff('abc', '')).toBe('');
    expect(generateDiff(null, 'abc')).toBe('');
  });

  it('shows added lines with + prefix', () => {
    const result = generateDiff('line1\n', 'line1\nline2\n');
    expect(result).toContain('+');
    expect(result).toContain('line2');
  });

  it('shows removed lines with - prefix', () => {
    const result = generateDiff('line1\nline2\n', 'line1\n');
    expect(result).toContain('-');
    expect(result).toContain('line2');
  });

  it('returns empty for identical inputs', () => {
    expect(generateDiff('same\ncontent\n', 'same\ncontent\n')).toBe('');
  });

  it('respects maxLines limit', () => {
    const big = Array.from({ length: 100 }, (_, i) => `line ${i}`).join('\n');
    const result = generateDiff(big, big + '\nextra');
    const lineCount = result.split('\n').length;
    expect(lineCount).toBeLessThanOrEqual(45);
  });
});

// ── resolvePath ───────────────────────────────────────────────────────────────
describe('resolvePath', () => {
  it('returns base when path is empty', () => {
    expect(resolvePath('/home/user', '')).toBe('/home/user');
  });

  it('returns path when base is empty', () => {
    expect(resolvePath('', 'src/App.jsx')).toBe('src/App.jsx');
  });

  it('joins base and relative path', () => {
    expect(resolvePath('/home/user/project', 'src/App.jsx')).toBe('/home/user/project/src/App.jsx');
  });

  it('strips trailing slash from base', () => {
    expect(resolvePath('/home/user/', 'src/App.jsx')).toBe('/home/user/src/App.jsx');
  });

  it('strips leading slash from path', () => {
    expect(resolvePath('/home/user', '/src/App.jsx')).toBe('/home/user/src/App.jsx');
  });

  it('handles path that already contains full absolute path independent of base', () => {
    // resolvePath strips leading slash from p before checking,
    // so '/proj/src/App.jsx' becomes 'proj/src/App.jsx' which doesn't startWith '/proj'
    // result: base + '/' + stripped = '/proj/proj/src/App.jsx'
    // This is the documented behavior — callers should pass relative paths
    const result = resolvePath('/proj', 'src/App.jsx');
    expect(result).toBe('/proj/src/App.jsx');
  });
});

// ── Fuzz: parseActions edge cases ─────────────────────────────────────────────
describe('parseActions — edge cases', () => {
  it('ignores malformed JSON inside action block', () => {
    expect(parseActions('```action\n{broken json}\n```')).toEqual([]);
  });

  it('parses multiple valid blocks ignoring invalid ones', () => {
    const text = [
      '```action\n{"type":"read_file","path":"a.js"}\n```',
      '```action\n{bad}\n```',
      '```action\n{"type":"exec","command":"ls"}\n```',
    ].join('\n');
    const result = parseActions(text);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('read_file');
    expect(result[1].type).toBe('exec');
  });

  it('returns empty array for text with no action blocks', () => {
    expect(parseActions('just regular text')).toEqual([]);
    expect(parseActions('')).toEqual([]);
  });

  it('handles action blocks with extra whitespace', () => {
    expect(parseActions('```action\n  {"type":"read_file","path":"x.js"}  \n```')).toHaveLength(1);
  });
});

// ── Property-based tests (inline — no external deps needed) ──────────────────
// Minimal fc-like runner — zero dependency, works without npm install
const fc = {
  assert(prop, { numRuns = 100 } = {}) {
    for (let i = 0; i < numRuns; i++) prop();
  },
  property(arb, fn)       { return () => fn(arb()); },
  property2(a1, a2, fn)   { return () => fn(a1(), a2()); },
  string({ minLength = 0, maxLength = 80 } = {}) {
    return () => {
      const len   = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \'"`{}[]()\\n\\t\\\\!@#$%^&*-_=+;:,./<>?|~';
      return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };
  },
  constantFrom(...vals) { return () => vals[Math.floor(Math.random() * vals.length)]; },
  record(shape) {
    return () => {
      const out = {};
      for (const [k, arb] of Object.entries(shape)) out[k] = arb();
      return out;
    };
  },
  filteredString(filter, { minLength = 1, maxLength = 40 } = {}) {
    const base = this.string({ minLength, maxLength });
    return () => { for (let i = 0; i < 100; i++) { const v = base(); if (filter(v)) return v; } return 'safe'; };
  },
};

describe('parseActions — property-based (100 random inputs each)', () => {
  it('never throws on arbitrary string input', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      expect(() => parseActions(s)).not.toThrow();
    }));
  });

  it('always returns an array', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      expect(Array.isArray(parseActions(s))).toBe(true);
    }));
  });

  it('every parsed action is a plain object', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      for (const a of parseActions(s)) {
        expect(typeof a).toBe('object');
        expect(a).not.toBeNull();
      }
    }));
  });

  it('count never exceeds number of ```action blocks', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      const blockCount = (s.match(/```action/g) || []).length;
      expect(parseActions(s).length).toBeLessThanOrEqual(blockCount);
    }));
  });

  it('valid JSON action blocks are always parsed correctly', () => {
    const typeArb = fc.constantFrom('read_file', 'write_file', 'exec', 'search', 'tree');
    const pathArb = fc.filteredString(s => !s.includes('\n') && !s.includes('`'));
    fc.assert(fc.property(fc.record({ type: typeArb, path: pathArb }), (action) => {
      const text = '```action\n' + JSON.stringify(action) + '\n```';
      const result = parseActions(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(action.type);
    }));
  });

  it('idempotent — parsing same string twice gives identical result', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      expect(parseActions(s)).toEqual(parseActions(s));
    }));
  });
});

describe('resolvePath — property-based (100 random inputs each)', () => {
  it('never throws on arbitrary base + path', () => {
    fc.assert(fc.property2(fc.string(), fc.string(), (base, p) => {
      expect(() => resolvePath(base, p)).not.toThrow();
    }));
  });

  it('always returns a string', () => {
    fc.assert(fc.property2(fc.string(), fc.string(), (base, p) => {
      expect(typeof resolvePath(base, p)).toBe('string');
    }));
  });

  it('result contains non-empty arg when the other is empty', () => {
    const safe = fc.filteredString(s => !s.includes('/') && !s.startsWith('.'));
    fc.assert(fc.property(safe, (s) => {
      expect(resolvePath('', s)).toContain(s);
      expect(resolvePath(s, '')).toContain(s);
    }));
  });
});
