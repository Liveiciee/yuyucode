 // @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── HOISTED MOCKS (harus paling atas) ─────────────────────────────────────
const mockCallServer = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: false, data: '' })
);

const mockPreferencesGet = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ value: null })
);

const mockPreferencesSet = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);

// ── Module mocks ─────────────────────────────────────────────────────────────
vi.mock('./api.js', () => ({ callServer: mockCallServer }));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: mockPreferencesGet,
    set: mockPreferencesSet,
  },
}));

// ── Imports setelah semua mock ───────────────────────────────────────────────
import * as utilsModule from './utils.js';
import {
  saveSession, loadSessions,
  loadSkills, saveSkillFile, deleteSkillFile,
  DEFAULT_HOOKS,
  generatePlan, executePlanStep,
} from './features.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockResolvedValue({ ok: false, data: '' });
  mockPreferencesGet.mockResolvedValue({ value: null });
  mockPreferencesSet.mockResolvedValue(undefined);
  vi.spyOn(utilsModule, 'parseActions').mockReturnValue([]);
  vi.spyOn(utilsModule, 'executeAction').mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// saveSession / loadSessions
// ═══════════════════════════════════════════════════════════════════════════════
describe('saveSession', () => {
  it('saves session with correct shape', async () => {
    const msgs = Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `msg ${i}` }));
    const s = await saveSession('Test Session', msgs, '/project', 'main');
    expect(s).toHaveProperty('id');
    expect(s.name).toBe('Test Session');
    expect(s.folder).toBe('/project');
    expect(s.branch).toBe('main');
    expect(Array.isArray(s.messages)).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalled();
  });

  it('truncates messages to last 50', async () => {
    const msgs = Array.from({ length: 100 }, (_, i) => ({ role: 'user', content: `${i}` }));
    const s = await saveSession('Big', msgs, '/p', 'main');
    expect(s.messages.length).toBeLessThanOrEqual(50);
  });

  it('uses default name when name is empty', async () => {
    const s = await saveSession('', [], '/p', 'main');
    expect(typeof s.name).toBe('string');
    expect(s.name.length).toBeGreaterThan(0);
  });
});

describe('loadSessions', () => {
  it('returns empty array when no sessions stored', async () => {
    const result = await loadSessions();
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// loadSkills / saveSkillFile / deleteSkillFile
// ═══════════════════════════════════════════════════════════════════════════════
describe('loadSkills', () => {
  it('returns empty array when server returns no files', async () => {
    const skills = await loadSkills('/project');
    expect(skills).toEqual([]);
  });

  it('loads and shapes skill files correctly', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: [{ name: 'react.md', isDir: false }] })
      .mockResolvedValueOnce({ ok: true, data: '# React skill content' });
    const skills = await loadSkills('/project');
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('react.md');
  });
});

describe('saveSkillFile', () => {
  it('calls mkdir then write with sanitized filename', async () => {
    mockCallServer.mockResolvedValue({ ok: true });
    await saveSkillFile('/project', 'My React Skill!!!', '# content');
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mkdir' }));
  });
});

describe('deleteSkillFile', () => {
  it('calls server with type:delete and correct path', async () => {
    mockCallServer.mockResolvedValue({ ok: true });
    await deleteSkillFile('/project', 'react.md');
    expect(mockCallServer).toHaveBeenCalledWith({
      type: 'delete',
      path: '/project/.yuyu/skills/react.md',
    });
  });
});

describe('DEFAULT_HOOKS', () => {
  it('has all required hook categories', () => {
    const required = ['preToolCall', 'postToolCall', 'preWrite', 'postWrite', 'onError', 'onNotification'];
    for (const k of required) {
      expect(DEFAULT_HOOKS).toHaveProperty(k);
      expect(Array.isArray(DEFAULT_HOOKS[k])).toBe(true);
    }
  });
});

describe('generatePlan', () => {
  it('returns reply and parsed steps', async () => {
    const fakeAI = vi.fn().mockResolvedValue('1. Read files\n2. Make changes\n3. Test');
    const result = await generatePlan('build feature X', '/project', fakeAI, null);
    expect(result.reply).toContain('Read files');
    expect(result.steps).toHaveLength(3);
  });
});
