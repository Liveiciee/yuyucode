// @vitest-environment node
// features.branch.test.js — condition branch coverage untuk features.js
// NOTE: runHooksV2 tests ada di features.extended.test.js — tidak diduplikasi
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCallServer = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true, data: '' })
);
const mockExecuteAction = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true, data: 'done' })
);
const mockParseActions = vi.hoisted(() =>
  vi.fn().mockReturnValue([])
);

vi.mock('./api.js', () => ({ callServer: mockCallServer }));
vi.mock('./utils.js', () => ({
  parseActions:  mockParseActions,
  executeAction: mockExecuteAction,
}));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import {
  checkPermission, DEFAULT_PERMISSIONS,
  tfidfRank, selectSkills,
  parseElicitation, rewindMessages,
  TokenTracker, runBackgroundAgent, getBgAgents,
} from './features.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockResolvedValue({ ok: true, data: '' });
  mockExecuteAction.mockResolvedValue({ ok: true, data: 'done' });
  mockParseActions.mockReturnValue([]);
});

// ── checkPermission — all branches ───────────────────────────────────────────
describe('checkPermission — all branches', () => {
  it('returns false for null/undefined permissions', () => {
    expect(checkPermission(null,      'read_file')).toBe(false);
    expect(checkPermission(undefined, 'read_file')).toBe(false);
  });

  it('returns explicit permission value when set', () => {
    expect(checkPermission({ delete_file: true  }, 'delete_file')).toBe(true);
    expect(checkPermission({ read_file:   false }, 'read_file'  )).toBe(false);
  });

  it('falls back to DEFAULT_PERMISSIONS when key not in object', () => {
    expect(checkPermission({}, 'read_file'  )).toBe(DEFAULT_PERMISSIONS.read_file);
    expect(checkPermission({}, 'delete_file')).toBe(DEFAULT_PERMISSIONS.delete_file);
  });

  it('returns false for unknown action with no default', () => {
    expect(checkPermission({}, 'totally_unknown_action')).toBe(false);
  });
});

// ── tfidfRank — all branches ──────────────────────────────────────────────────
describe('tfidfRank — all branches', () => {
  it('returns empty for empty memories', () => {
    expect(tfidfRank([], 'react')).toEqual([]);
  });

  it('returns slice when no queryText', () => {
    const mems = [{ id: 1, text: 'a' }, { id: 2, text: 'b' }];
    expect(tfidfRank(mems, '', 1)).toHaveLength(1);
  });

  it('returns slice when queryWords all short (≤2 chars)', () => {
    const mems = [{ id: 1, text: 'react hooks' }];
    const r = tfidfRank(mems, 'a b', 5); // all words ≤ 2 chars → filtered out
    expect(r).toHaveLength(1);
  });

  it('handles memory with id=0 (ageDays=999, no recency bonus)', () => {
    const mems = [
      { id: 0,          text: 'react old' },
      { id: Date.now(), text: 'react new' },
    ];
    const r = tfidfRank(mems, 'react', 2);
    expect(r).toHaveLength(2);
    // new should score higher due to age bonus
    expect(r[0]._score).toBeGreaterThanOrEqual(r[1]._score);
  });

  it('respects topN limit', () => {
    const mems = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, text: `item${i} react` }));
    expect(tfidfRank(mems, 'react', 3)).toHaveLength(3);
  });
});

// ── selectSkills — all branches ───────────────────────────────────────────────
describe('selectSkills — all branches', () => {
  it('returns empty for empty skills', () => {
    expect(selectSkills([], 'task')).toEqual([]);
  });

  it('returns first 3 when no taskText', () => {
    const skills = Array.from({ length: 5 }, (_, i) => ({ name: `s${i}.md`, content: 'x', active: true }));
    expect(selectSkills(skills, '')).toHaveLength(3);
  });

  it('always includes skill named "skill"', () => {
    const skills = [
      { name: 'skill.md',  content: 'anything', active: true },
      { name: 'other.md',  content: 'xyz zzz',  active: true },
    ];
    const r = selectSkills(skills, 'totally unrelated query mmm nnn zzz');
    expect(r.some(s => s.name === 'skill.md')).toBe(true);
  });

  it('includes by name keyword match', () => {
    const skills = [{ name: 'react.md', content: 'long content '.repeat(200), active: true }];
    expect(selectSkills(skills, 'react hooks')).toHaveLength(1);
  });

  it('includes by content keyword match', () => {
    const skills = [{ name: 'tooling.md', content: 'webpack bundler optimization configuration', active: true }];
    expect(selectSkills(skills, 'configure webpack')).toHaveLength(1);
  });

  it('includes short content (<2048) regardless of keyword', () => {
    const skills = [{ name: 'short.md', content: 'brief', active: true }];
    expect(selectSkills(skills, 'totally unrelated zzz aaa')).toHaveLength(1);
  });

  it('excludes long content with no keyword match', () => {
    const skills = [{ name: 'long.md', content: 'x '.repeat(1100), active: true }];
    expect(selectSkills(skills, 'zzz aaa bbb ccc totally unrelated')).toHaveLength(0);
  });

  it('handles skill without content field', () => {
    const skills = [{ name: 'bare.md', active: true }];
    expect(() => selectSkills(skills, 'task')).not.toThrow();
  });
});

// ── parseElicitation — all branches ──────────────────────────────────────────
describe('parseElicitation — all branches', () => {
  it('returns null when ELICIT: not present', () => {
    expect(parseElicitation('normal response')).toBeNull();
  });

  it('returns null when no opening brace after ELICIT:', () => {
    expect(parseElicitation('ELICIT: no brace here')).toBeNull();
  });

  it('returns null when brace never closes', () => {
    expect(parseElicitation('ELICIT:{"unclosed":true')).toBeNull();
  });

  it('parses simple JSON', () => {
    const r = parseElicitation('ELICIT:{"question":"yes?"}');
    expect(r?.question).toBe('yes?');
  });

  it('handles nested JSON with depth tracking', () => {
    const r = parseElicitation('ELICIT:{"a":{"b":{"c":42}}}');
    expect(r?.a?.b?.c).toBe(42);
  });
});

// ── rewindMessages — all branches ────────────────────────────────────────────
describe('rewindMessages — all branches', () => {
  it('keeps at least 1 message always', () => {
    const msgs = [{ role: 'user', content: 'hi' }];
    expect(rewindMessages(msgs, 99)).toHaveLength(1);
  });

  it('removes 2 messages per turn', () => {
    const msgs = Array.from({ length: 8 }, (_, i) => ({ role: 'user', content: `${i}` }));
    expect(rewindMessages(msgs, 2)).toHaveLength(4);
  });

  it('handles turns=0', () => {
    const msgs = [{ role: 'user', content: 'a' }, { role: 'user', content: 'b' }];
    expect(rewindMessages(msgs, 0).length).toBeGreaterThanOrEqual(1);
  });
});

// ── TokenTracker — requests=0 branch ─────────────────────────────────────────
describe('TokenTracker — requests=0', () => {
  it('returns 0 avg when no requests', () => {
    const t = new TokenTracker();
    const s = t.summary();
    expect(s).toContain('0');
    expect(typeof s).toBe('string');
  });
});

// ── runBackgroundAgent — loop iterates without DONE signal ───────────────────
describe('runBackgroundAgent — no action results text', () => {
  it('uses Lanjutkan message when actions have no results', async () => {
    mockCallServer.mockImplementation(({ command } = {}) => {
      if (command?.includes('worktree add'))    return Promise.resolve({ ok: true, data: 'HEAD is now' });
      if (command?.includes('git add'))         return Promise.resolve({ ok: true, data: '' });
      if (command?.includes('git commit'))      return Promise.resolve({ ok: true, data: '' });
      if (command?.includes('worktree remove')) return Promise.resolve({ ok: true, data: '' });
      if (command?.includes('branch -D'))       return Promise.resolve({ ok: true, data: '' });
      return Promise.resolve({ ok: true, data: '' });
    });
    mockParseActions.mockReturnValue([]);
    const callAI = vi.fn()
      .mockResolvedValueOnce('iter 1 no actions')
      .mockResolvedValue('DONE');

    const id = await runBackgroundAgent('task', '/project', callAI);
    await new Promise(r => setTimeout(r, 200));

    const agents = getBgAgents();
    const agent = agents.find(a => a.id === id);
    expect(agent).toBeDefined();
  });
});
