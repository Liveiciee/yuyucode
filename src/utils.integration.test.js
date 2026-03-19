import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from './utils.js';

// ── Mock callServer ───────────────────────────────────────────────────────────
vi.mock('./api.js', () => ({
  callServer: vi.fn(),
}));
import { callServer } from './api.js';

// ── Integration: parseActions → executeAction ─────────────────────────────────
describe('parseActions + executeAction (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse then execute read_file action', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'isi file' });

    const text = '```action\n{"type":"read_file","path":"src/App.jsx"}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);

    const result = await executeAction(actions[0], '/home/user/project');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'read',
      path: '/home/user/project/src/App.jsx',
    }));
    expect(result.ok).toBe(true);
    expect(result.data).toBe('isi file');
  });

  it('should parse then execute write_file action', async () => {
    callServer.mockResolvedValue({ ok: true });

    const text = '```action\n{"type":"write_file","path":"output.txt","content":"hello"}\n```';
    const actions = parseActions(text);
    await executeAction(actions[0], '/base');

    expect(callServer).toHaveBeenCalledWith({
      type: 'write',
      path: '/base/output.txt',
      content: 'hello',
    });
  });

  it('should parse then execute exec action', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'npm test output' });

    const text = '```action\n{"type":"exec","command":"npm test"}\n```';
    const actions = parseActions(text);
    const result = await executeAction(actions[0], '/project');

    expect(callServer).toHaveBeenCalledWith({
      type: 'exec',
      path: '/project',
      command: 'npm test',
    });
    expect(result.data).toBe('npm test output');
  });

  it('should parse then execute patch_file action', async () => {
    callServer.mockResolvedValue({ ok: true });

    const text = '```action\n{"type":"patch_file","path":"src/utils.js","old_str":"const x = 1","new_str":"const x = 2"}\n```';
    const actions = parseActions(text);
    await executeAction(actions[0], '/base');

    expect(callServer).toHaveBeenCalledWith({
      type: 'patch',
      path: '/base/src/utils.js',
      old_str: 'const x = 1',
      new_str: 'const x = 2',
    });
  });

  it('should handle multiple actions in sequence', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'file content' })
      .mockResolvedValueOnce({ ok: true });

    const text = [
      '```action\n{"type":"read_file","path":"input.txt"}\n```',
      '```action\n{"type":"write_file","path":"output.txt","content":"done"}\n```',
    ].join('\n');

    const actions = parseActions(text);
    expect(actions).toHaveLength(2);

    const r1 = await executeAction(actions[0], '/base');
    const r2 = await executeAction(actions[1], '/base');
    expect(r1.data).toBe('file content');
    expect(r2.ok).toBe(true);
    expect(callServer).toHaveBeenCalledTimes(2);
  });

  it('should return error for unknown action type', async () => {
    const result = await executeAction({ type: 'unknown_action' }, '/base');
    expect(result.ok).toBe(false);
    expect(result.data).toContain('Unknown action type');
  });

  it('should handle server failure gracefully', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'Server error' });

    const result = await executeAction({ type: 'read_file', path: 'file.txt' }, '/base');
    expect(result.ok).toBe(false);
  });
});

// ── generateDiff ──────────────────────────────────────────────────────────────
describe('generateDiff', () => {
  it('should return empty string for null/empty input', () => {
    expect(generateDiff('', 'something')).toBe('');
    expect(generateDiff('something', '')).toBe('');
    expect(generateDiff(null, 'x')).toBe('');
  });

  it('should return empty string for identical files', () => {
    const code = 'const x = 1;\nconst y = 2;';
    expect(generateDiff(code, code)).toBe('');
  });

  it('should show added lines', () => {
    const original = 'line1\nline2';
    const patched  = 'line1\nline2\nline3';
    const diff = generateDiff(original, patched);
    expect(diff).toContain('+ L3: line3');
  });

  it('should show removed lines', () => {
    const original = 'line1\nline2\nline3';
    const patched  = 'line1\nline2';
    const diff = generateDiff(original, patched);
    expect(diff).toContain('- L3: line3');
  });

  it('should show changed lines as remove + add', () => {
    const original = 'const x = 1;';
    const patched  = 'const x = 99;';
    const diff = generateDiff(original, patched);
    expect(diff).toContain('- L1: const x = 1;');
    expect(diff).toContain('+ L1: const x = 99;');
  });

  it('should truncate at maxLines', () => {
    const original = Array.from({ length: 60 }, (_, i) => `old line ${i}`).join('\n');
    const patched  = Array.from({ length: 60 }, (_, i) => `new line ${i}`).join('\n');
    const diff = generateDiff(original, patched, 10);
    expect(diff).toContain('baris lebih');
  });
});

// ── Fuzz Testing: robustness ──────────────────────────────────────────────────
describe('fuzz — parseActions robustness', () => {
  const fuzzInputs = [
    '',
    '   ',
    null,
    undefined,
    '```action\n\n```',
    '```action\n{broken json\n```',
    '```action\n{"type":"exec","command":"' + 'x'.repeat(10000) + '"}\n```',
    '```action\n{"type":"exec","command":"rm -rf /"}\n```',
    '```action\n' + '}'.repeat(1000) + '\n```',
    '```action\nnull\n```',
    '```action\n[1,2,3]\n```',
  ];

  it('should never throw on any input', () => {
    for (const input of fuzzInputs) {
      expect(() => parseActions(input ?? '')).not.toThrow();
    }
  });

  it('should always return an array', () => {
    for (const input of fuzzInputs) {
      const result = parseActions(input ?? '');
      expect(Array.isArray(result)).toBe(true);
    }
  });
});

describe('fuzz — resolvePath robustness', () => {
  const fuzzPairs = [
    ['', ''],
    [null, null],
    [undefined, undefined],
    ['/', '/'],
    ['///', '///'],
    ['base', '../../../../etc/passwd'],
    [' ', ' '],
    ['base', 'base/../../secret'],
  ];

  it('should never throw on any input', () => {
    for (const [base, p] of fuzzPairs) {
      expect(() => resolvePath(base ?? '', p ?? '')).not.toThrow();
    }
  });

  it('should always return a string', () => {
    for (const [base, p] of fuzzPairs) {
      const result = resolvePath(base ?? '', p ?? '');
      expect(typeof result).toBe('string');
    }
  });
});

describe('fuzz — generateDiff robustness', () => {
  it('should not throw on extreme inputs', () => {
    const huge = 'x\n'.repeat(5000);
    expect(() => generateDiff(huge, huge + 'new line\n')).not.toThrow();
    expect(() => generateDiff('', '')).not.toThrow();
    expect(() => generateDiff(null, null)).not.toThrow();
  });
});
