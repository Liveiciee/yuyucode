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

describe('selectSkills — edge cases', () => {
  const skills = [
    { name: 'react.md',   content: 'React hooks useState', active: true },
    { name: 'skill.md',   content: 'General',              active: true },
    { name: 'node.md',    content: 'Node.js express',      active: true },
    { name: 'testing.md', content: 'vitest coverage',      active: true },
    { name: 'git.md',     content: 'git commit branch',    active: true },
  ];

  it('returns max 3 when no task text', () => {
    const r = selectSkills(skills, '');
    expect(r.length).toBeLessThanOrEqual(3);
  });

  it('always includes skill named "skill"', () => {
    const r = selectSkills(skills, 'unrelated xyz 123');
    const names = r.map(s => s.name);
    expect(names).toContain('skill.md');
  });

  it('prefers skills with matching name', () => {
    const r = selectSkills(skills, 'react component');
    expect(r.some(s => s.name === 'react.md')).toBe(true);
  });

  it('prefers skills with matching content keyword', () => {
    const r = selectSkills(skills, 'run vitest for coverage');
    expect(r.some(s => s.name === 'testing.md')).toBe(true);
  });

  it('returns empty for empty skills list', () => {
    expect(selectSkills([], 'anything')).toEqual([]);
  });

  it('handles skill without content field', () => {
    const noContent = [{ name: 'bare.md', active: true }];
    expect(() => selectSkills(noContent, 'task')).not.toThrow();
  });
});
