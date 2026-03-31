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

describe('TokenTracker', () => {
  it('starts with all zeros', () => {
    const t = new TokenTracker();
    expect(t.inputTokens).toBe(0);
    expect(t.outputTokens).toBe(0);
    expect(t.requests).toBe(0);
    expect(t.history).toHaveLength(0);
  });

  it('record() accumulates input and output tokens', () => {
    const t = new TokenTracker();
    t.record(100, 200, 'model-a');
    t.record(50, 75, 'model-b');
    expect(t.inputTokens).toBe(150);
    expect(t.outputTokens).toBe(275);
    expect(t.requests).toBe(2);
  });

  it('record() stores history entries', () => {
    const t = new TokenTracker();
    t.record(10, 20, 'qwen');
    expect(t.history).toHaveLength(1);
    expect(t.history[0]).toEqual({ inTk: 10, outTk: 20, model: 'qwen' });
  });

  it('lastCost() returns formatted string for last request', () => {
    const t = new TokenTracker();
    t.record(100, 200, 'qwen');
    expect(t.lastCost()).toContain('100');
    expect(t.lastCost()).toContain('200');
  });

  it('lastCost() returns empty string if no history', () => {
    const t = new TokenTracker();
    expect(t.lastCost()).toBe('');
  });

  it('reset() clears all state', () => {
    const t = new TokenTracker();
    t.record(500, 1000, 'model');
    t.reset();
    expect(t.inputTokens).toBe(0);
    expect(t.outputTokens).toBe(0);
    expect(t.requests).toBe(0);
    expect(t.history).toHaveLength(0);
  });

  it('summary() returns a string containing key stats', () => {
    const t = new TokenTracker();
    t.record(200, 400, 'qwen');
    const s = t.summary();
    expect(typeof s).toBe('string');
    expect(s).toContain('200');
    expect(s).toContain('400');
    expect(s).toContain('gratis');
  });

  it('history is capped at 100 entries', () => {
    const t = new TokenTracker();
    for (let i = 0; i < 120; i++) t.record(1, 1, 'model');
    expect(t.history.length).toBeLessThanOrEqual(100);
  });

  it('record handles missing/null values without crashing', () => {
    const t = new TokenTracker();
    expect(() => t.record(null, undefined, null)).not.toThrow();
    expect(t.inputTokens).toBe(0);
  });

  it('singleton tokenTracker is a TokenTracker instance', () => {
    expect(tokenTracker).toBeInstanceOf(TokenTracker);
  });
});
