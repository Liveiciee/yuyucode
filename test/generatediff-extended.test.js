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

describe('generateDiff — extended', () => {
  it.skip('handles files with only whitespace differences', () => {
    const a = 'line1\nline2\n';
    const b = 'line1\n  line2\n';
    const diff = generateDiff(a, b);
    expect(diff).toContain('- L2');
    expect(diff).toContain('+ L2');
  });

  it.skip('shows no diff for identical multiline strings', () => {
    const code = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');
    expect(generateDiff(code, code)).toBe('');
  });

  it.skip('handles single-char change', () => {
    const diff = generateDiff('a', 'b');
    expect(diff).toContain('- L1: a');
    expect(diff).toContain('+ L1: b');
  });

  it.skip('defaultMaxLines is 40 (truncates large diffs)', () => {
    const old = Array.from({ length: 50 }, (_, i) => `old ${i}`).join('\n');
    const nw  = Array.from({ length: 50 }, (_, i) => `new ${i}`).join('\n');
    const diff = generateDiff(old, nw);
    expect(diff).toContain('baris lebih');
  });
});
