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

describe('checkPermission — edge cases', () => {
  it('explicit true overrides default false', () => {
    expect(checkPermission({ delete_file: true }, 'delete_file')).toBe(true);
  });

  it('explicit false overrides default true', () => {
    expect(checkPermission({ read_file: false }, 'read_file')).toBe(false);
  });

  it('patch_file defaults to true', () => {
    expect(checkPermission({}, 'patch_file')).toBe(true);
  });

  it('mkdir defaults to true', () => {
    expect(checkPermission({}, 'mkdir')).toBe(true);
  });

  it('web_search defaults to true', () => {
    expect(checkPermission({}, 'web_search')).toBe(true);
  });
}