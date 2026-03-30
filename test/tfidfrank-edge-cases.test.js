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

describe('tfidfRank — edge cases', () => {
  const mems = [
    { id: 1000, text: 'react hooks component state' },
    { id: 1001, text: 'node express server api route' },
    { id: 1002, text: 'css flexbox grid responsive' },
    { id: 1003, text: 'git merge branch rebase conflict' },
    { id: 1004, text: 'typescript interface generic type' },
  ];

  it('all results have _score property', () => {
    tfidfRank(mems, 'react').forEach(m => {
      expect(m).toHaveProperty('_score');
      expect(typeof m._score).toBe('number');
    });
  });

  it('does not mutate original memories array', () => {
    const copy = mems.map(m => ({ ...m }));
    tfidfRank(mems, 'react');
    mems.forEach((m, i) => {
      expect(m.text).toBe(copy[i].text);
    });
  });

  it('result is sorted by score descending', () => {
    const r = tfidfRank(mems, 'react', 5);
    for (let i = 1; i < r.length; i++) {
      expect(r[i-1]._score).toBeGreaterThanOrEqual(r[i]._score);
    }
  });

  it('handles query with only stop words gracefully', () => {
    expect(() => tfidfRank(mems, 'the a is of')).not.toThrow();
  });

  it('respects topN=1 returns exactly 1 result', () => {
    expect(tfidfRank(mems, 'react', 1)).toHaveLength(1);
  });
});
