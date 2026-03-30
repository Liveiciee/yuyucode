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
} from './features.js';

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock('./api.js', () => ({ callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }) }));
vi.mock('./utils.js', () => ({
  parseActions:  vi.fn().mockReturnValue([]),
  executeAction: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { callServer } from './api.js';
import { Preferences } from '@capacitor/preferences'; // used via vi.mock above — CodeQL false positive

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TokenTracker
// ═══════════════════════════════════════════════════════════════════════════════

describe('parsePlanSteps — edge cases', () => {
  it('handles multiline text with mixed content', () => {
    const text = 'Here is the plan:\n1. Read files\n2. Make changes\nSome note\n3. Test';
    const steps = parsePlanSteps(text);
    expect(steps).toHaveLength(3);
    expect(steps[2].num).toBe(3);
  });

  it('result objects all have done:false and result:null initially', () => {
    const steps = parsePlanSteps('1. Step A\n2. Step B');
    steps.forEach(s => {
      expect(s.done).toBe(false);
      expect(s.result).toBeNull();
    });
  });

  it('handles very long step text', () => {
    const longText = '1. ' + 'x'.repeat(500);
    const steps = parsePlanSteps(longText);
    expect(steps).toHaveLength(1);
    expect(steps[0].text.length).toBeGreaterThan(100);
  });
}