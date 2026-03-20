import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveSession, loadSessions,
  loadSkills, saveSkillFile, deleteSkillFile,
  DEFAULT_HOOKS,
  generatePlan, executePlanStep,
} from './features.js';

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

beforeEach(() => vi.clearAllMocks());

// ═══════════════════════════════════════════════════════════════════════════════
// saveSession / loadSessions
// ═══════════════════════════════════════════════════════════════════════════════
describe('saveSession', () => {
  it('saves session with correct shape', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const msgs = Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `msg ${i}` }));
    const s = await saveSession('Test Session', msgs, '/project', 'main');
    expect(s).toHaveProperty('id');
    expect(s.name).toBe('Test Session');
    expect(s.folder).toBe('/project');
    expect(s.branch).toBe('main');
    expect(Array.isArray(s.messages)).toBe(true);
    expect(Preferences.set).toHaveBeenCalled();
  });

  it('truncates messages to last 50', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const msgs = Array.from({ length: 100 }, (_, i) => ({ role: 'user', content: `${i}` }));
    const s = await saveSession('Big', msgs, '/p', 'main');
    expect(s.messages.length).toBeLessThanOrEqual(50);
  });

  it('uses default name when name is empty', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const s = await saveSession('', [], '/p', 'main');
    expect(typeof s.name).toBe('string');
    expect(s.name.length).toBeGreaterThan(0);
  });

  it('merges with existing sessions (dedupes by name)', async () => {
    const existing = [{ id: 1, name: 'Existing', messages: [], folder: '/', savedAt: new Date().toISOString() }];
    Preferences.get.mockResolvedValue({ value: JSON.stringify(existing) });
    await saveSession('Existing', [{ role: 'user', content: 'hi' }], '/', 'main');
    const saved = JSON.parse(Preferences.set.mock.calls[0][0].value);
    const withName = saved.filter(s => s.name === 'Existing');
    expect(withName).toHaveLength(1); // deduped
  });
});

describe('loadSessions', () => {
  it('returns empty array when no sessions stored', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    expect(await loadSessions()).toEqual([]);
  });

  it('returns parsed sessions array', async () => {
    const data = [{ id: 1, name: 'S1' }, { id: 2, name: 'S2' }];
    Preferences.get.mockResolvedValue({ value: JSON.stringify(data) });
    const result = await loadSessions();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('S1');
  });

  it('returns empty array on malformed JSON', async () => {
    Preferences.get.mockResolvedValue({ value: 'NOT JSON' });
    const result = await loadSessions();
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// loadSkills / saveSkillFile / deleteSkillFile
// ═══════════════════════════════════════════════════════════════════════════════
describe('loadSkills', () => {
  it('returns empty array when server returns no files', async () => {
    callServer.mockResolvedValue({ ok: false });
    const skills = await loadSkills('/project');
    expect(skills).toEqual([]);
  });

  it('returns empty array when directory is empty', async () => {
    callServer.mockResolvedValue({ ok: true, data: [] });
    expect(await loadSkills('/project')).toEqual([]);
  });

  it('loads and shapes skill files correctly', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [{ name: 'react.md', isDir: false }] })
      .mockResolvedValueOnce({ ok: true, data: '# React skill content' });
    const skills = await loadSkills('/project');
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('react.md');
    expect(skills[0].content).toContain('React skill');
    expect(skills[0].active).toBe(true);
    expect(skills[0].builtin).toBe(false);
  });

  it('respects activeMap — marks inactive when set to false', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [{ name: 'react.md', isDir: false }] })
      .mockResolvedValueOnce({ ok: true, data: '# React' });
    const skills = await loadSkills('/project', { 'react.md': false });
    expect(skills[0].active).toBe(false);
  });

  it('ignores directories in skill folder', async () => {
    callServer.mockResolvedValueOnce({
      ok: true,
      data: [
        { name: 'subfolder', isDir: true },
        { name: 'skill.md',  isDir: false },
      ],
    }).mockResolvedValueOnce({ ok: true, data: '# content' });
    const skills = await loadSkills('/project');
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('skill.md');
  });

  it('ignores non-.md files', async () => {
    callServer.mockResolvedValueOnce({
      ok: true,
      data: [
        { name: 'script.sh', isDir: false },
        { name: 'skill.md',  isDir: false },
      ],
    }).mockResolvedValueOnce({ ok: true, data: '# content' });
    const skills = await loadSkills('/project');
    expect(skills).toHaveLength(1);
  });
});

describe('saveSkillFile', () => {
  it('calls mkdir then write with sanitized filename', async () => {
    callServer.mockResolvedValue({ ok: true });
    await saveSkillFile('/project', 'My React Skill!!!', '# content');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mkdir' }));
    const writeCall = callServer.mock.calls.find(c => c[0].type === 'write');
    expect(writeCall[0].path).toMatch(/\.md$/);
    expect(writeCall[0].content).toBe('# content');
  });

  it('sanitizes special chars but dots are preserved (document actual behavior)', async () => {
    callServer.mockResolvedValue({ ok: true });
    await saveSkillFile('/project', 'my skill #1!', '# content');
    const writeCall = callServer.mock.calls.find(c => c[0].type === 'write');
    // spaces and ! are replaced with -; alphanumeric, dots, hyphens preserved
    expect(writeCall[0].path).not.toContain(' ');
    expect(writeCall[0].path).not.toContain('!');
    expect(writeCall[0].path).toMatch(/\.md$/);
  });
});

describe('deleteSkillFile', () => {
  it('calls server with type:delete and correct path', async () => {
    callServer.mockResolvedValue({ ok: true });
    await deleteSkillFile('/project', 'react.md');
    expect(callServer).toHaveBeenCalledWith({
      type: 'delete',
      path: '/project/.claude/skills/react.md',
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT_HOOKS shape
// ═══════════════════════════════════════════════════════════════════════════════
describe('DEFAULT_HOOKS', () => {
  it('has all required hook categories', () => {
    const required = ['preToolCall', 'postToolCall', 'preWrite', 'postWrite', 'onError', 'onNotification'];
    for (const k of required) {
      expect(DEFAULT_HOOKS).toHaveProperty(k);
      expect(Array.isArray(DEFAULT_HOOKS[k])).toBe(true);
    }
  });

  it('all hook arrays start empty', () => {
    Object.values(DEFAULT_HOOKS).forEach(arr => {
      expect(arr).toHaveLength(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// generatePlan / executePlanStep (mocked callAI)
// ═══════════════════════════════════════════════════════════════════════════════
describe('generatePlan', () => {
  it('returns reply and parsed steps', async () => {
    const fakeAI = vi.fn().mockResolvedValue('1. Read files\n2. Make changes\n3. Test');
    const result = await generatePlan('build feature X', '/project', fakeAI, null);
    expect(result.reply).toContain('Read files');
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].num).toBe(1);
  });

  it('returns empty steps for non-numbered AI response', async () => {
    const fakeAI = vi.fn().mockResolvedValue('Sure, I will help you.');
    const result = await generatePlan('task', '/project', fakeAI, null);
    expect(result.steps).toEqual([]);
  });
});

describe('executePlanStep', () => {
  it('calls callAI with step text and returns reply + actions', async () => {
    const fakeAI = vi.fn().mockResolvedValue('Done. No actions needed.');
    const step = { text: 'Read App.jsx', num: 1, done: false, result: null };
    const result = await executePlanStep(step, '/project', fakeAI, null);
    expect(result.reply).toContain('Done');
    expect(Array.isArray(result.actions)).toBe(true);
  });
});
