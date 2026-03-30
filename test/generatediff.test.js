// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from './utils.js';

// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly

// ── Integration: parseActions → executeAction ─────────────────────────────────

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
}