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

describe('countTokens — extended', () => {
  it.skip('handles messages with undefined content', () => {
    expect(() => countTokens([{ role: 'user' }])).not.toThrow();
  });

  it.skip('handles null message in array (throws — function expects objects)', () => {
    // countTokens does not guard against null entries — documents current behavior
    expect(() => countTokens([null])).toThrow();
  });

  it.skip('large messages are counted proportionally', () => {
    const bigMsg = [{ content: 'x'.repeat(4000) }];
    expect(countTokens(bigMsg)).toBe(1000);
  });

  it.skip('returns integer (no decimals)', () => {
    const msgs = [{ content: 'abc' }]; // 3/4 = 0.75 → round to 1
    const result = countTokens(msgs);
    expect(Number.isInteger(result)).toBe(true);
  });
}