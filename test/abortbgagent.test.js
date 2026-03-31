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

describe('abortBgAgent', () => {
  it('does not throw for unknown agent id', () => {
    expect(() => abortBgAgent('nonexistent')).not.toThrow();
  });
});
