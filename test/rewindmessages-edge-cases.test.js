// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TokenTracker, tokenTracker,
  runHooksV2,
  selectSkills,
  rewindMessages,
  tfidfRank,
  parsePlanSteps,
  mergeBackgroundAgent,
  abortBgAgent,
  getBgAgents,
  checkPermission,
  DEFAULT_PERMISSIONS,
  EFFORT_CONFIG,
  parseElicitation,
} from '../src/features.js';

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock('../src/api.js', () => ({ callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }) }));
vi.mock('../src/utils.js', () => ({
  parseActions:  vi.fn().mockReturnValue([]),
  executeAction: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { callServer } from '../src/api.js';
import { Preferences } from '@capacitor/preferences'; // used via vi.mock above — CodeQL false positive

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TokenTracker
// ═══════════════════════════════════════════════════════════════════════════════

describe('rewindMessages — edge cases', () => {
  it('handles turns=0 (no rewind)', () => {
    const msgs = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }];
    const r = rewindMessages(msgs, 0);
    expect(r.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty messages array', () => {
    expect(() => rewindMessages([], 1)).not.toThrow();
  });

  it('never returns empty — minimum 1 message', () => {
    const msgs = Array.from({ length: 10 }, (_, i) => ({ role: 'user', content: String(i) }));
    expect(rewindMessages(msgs, 99).length).toBeGreaterThanOrEqual(1);
  });

  it('each turn removes 2 messages', () => {
    const msgs = Array.from({ length: 8 }, (_, i) => ({ role: 'user', content: String(i) }));
    expect(rewindMessages(msgs, 2)).toHaveLength(4);
    expect(rewindMessages(msgs, 3)).toHaveLength(2);
  });
});
