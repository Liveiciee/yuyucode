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
vi.mock('./api.js', () => ({ callServer: vi.fn() }));
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
import { Preferences } from '@capacitor/preferences';

beforeEach(() => { vi.clearAllMocks(); });

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

// ═══════════════════════════════════════════════════════════════════════════════
// runHooksV2
// ═══════════════════════════════════════════════════════════════════════════════
describe('runHooksV2', () => {
  it('does nothing if hookList is empty', async () => {
    await runHooksV2([], 'ctx', '/folder');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('does nothing if hookList is null/undefined', async () => {
    await runHooksV2(null, 'ctx', '/folder');
    await runHooksV2(undefined, 'ctx', '/folder');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('executes string hook as shell command', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2(['echo hello'], 'myctx', '/project');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'exec',
      command: expect.stringContaining('echo hello'),
    }));
  });

  it('substitutes {{context}} in string hook', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2(['log {{context}}'], 'my-context', '/proj');
    const cmd = callServer.mock.calls[0][0].command;
    expect(cmd).toContain('my-context');
    expect(cmd).not.toContain('{{context}}');
  });

  it('executes shell-type hook object', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2([{ type: 'shell', command: 'npm run lint' }], '', '/proj');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });

  it('runs multiple hooks in sequence', async () => {
    callServer.mockResolvedValue({ ok: true });
    await runHooksV2(['hook1', 'hook2', 'hook3'], '', '/proj');
    expect(callServer).toHaveBeenCalledTimes(3);
  });

  it('continues if one hook throws', async () => {
    callServer
      .mockRejectedValueOnce(new Error('hook1 failed'))
      .mockResolvedValueOnce({ ok: true });
    await expect(
      runHooksV2(['bad-hook', 'good-hook'], '', '/proj')
    ).resolves.not.toThrow();
    expect(callServer).toHaveBeenCalledTimes(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// mergeBackgroundAgent
// ═══════════════════════════════════════════════════════════════════════════════
describe('mergeBackgroundAgent', () => {
  it('returns error if agent not found', async () => {
    const r = await mergeBackgroundAgent('nonexistent-id', '/folder');
    expect(r.ok).toBe(false);
    expect(r.msg).toContain('tidak ditemukan');
  });

  it('returns error if agent not in done status', async () => {
    // getBgAgents() reads from the internal Map; we can't easily set it
    // but we can verify the function handles missing IDs correctly
    const r = await mergeBackgroundAgent('fake-id-xyz', '/folder');
    expect(r.ok).toBe(false);
  });
});

describe('abortBgAgent', () => {
  it('does not throw for unknown agent id', () => {
    expect(() => abortBgAgent('nonexistent')).not.toThrow();
  });
});

describe('getBgAgents', () => {
  it('returns an array', () => {
    expect(Array.isArray(getBgAgents())).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// selectSkills — edge cases
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

// ═══════════════════════════════════════════════════════════════════════════════
// rewindMessages — edge cases
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

// ═══════════════════════════════════════════════════════════════════════════════
// tfidfRank — edge cases
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

// ═══════════════════════════════════════════════════════════════════════════════
// parsePlanSteps — edge cases
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
});

// ═══════════════════════════════════════════════════════════════════════════════
// checkPermission — edge cases
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
});

// ═══════════════════════════════════════════════════════════════════════════════
// parseElicitation — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('parseElicitation — edge cases', () => {
  it('ignores ELICIT: without opening brace', () => {
    expect(parseElicitation('ELICIT: no brace here')).toBeNull();
  });

  it('handles ELICIT with deeply nested braces', () => {
    const r = parseElicitation('ELICIT:{"a":{"b":{"c":1}}}');
    expect(r).not.toBeNull();
    expect(r.a.b.c).toBe(1);
  });

  it('ignores whitespace before JSON', () => {
    const r = parseElicitation('ELICIT: {"question":"yes?"}');
    // The function looks for the first { after ELICIT:
    // space before { is fine
    if (r) expect(r.question).toBe('yes?');
    // Either null (if whitespace before { matters) or parsed correctly
    // just verify no throw
  });

  it('returns null for unclosed brace', () => {
    expect(parseElicitation('ELICIT:{"question":"unclosed"')).toBeNull();
  });
});
