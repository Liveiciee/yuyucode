// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockPreferencesGet = vi.hoisted(() => vi.fn().mockResolvedValue({ value: null }));
const mockPreferencesSet = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@capacitor/preferences', () => ({
  Preferences: { get: mockPreferencesGet, set: mockPreferencesSet },
}));
vi.mock('../api.js', () => ({
  callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('../features.js', () => ({
  runHooksV2:     vi.fn().mockResolvedValue(undefined),
  EFFORT_CONFIG:  { low: { maxIter: 3 }, medium: { maxIter: 6 }, high: { maxIter: 12 } },
  loadSkills:     vi.fn().mockResolvedValue([]),
  saveSkillFile:  vi.fn().mockResolvedValue({ ok: true }),
  deleteSkillFile: vi.fn().mockResolvedValue({ ok: true }),
}));

import { useProjectStore } from './useProjectStore.js';
import { callServer } from '../api.js';
import { loadSkills, saveSkillFile, deleteSkillFile } from '../features.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockPreferencesSet.mockResolvedValue(undefined);
  mockPreferencesGet.mockResolvedValue({ value: null });
});

// ── Initial state ─────────────────────────────────────────────────────────────
describe('useProjectStore — initial state', () => {
  it('has expected defaults', () => {
    const { result } = renderHook(() => useProjectStore());
    expect(result.current.folder).toBe('yuyucode');
    expect(result.current.effort).toBe('medium');
    expect(result.current.diffReview).toBe(false);
    expect(result.current.serverOk).toBe(true);
    expect(result.current.permissions.write_file).toBe(true);
    expect(result.current.permissions.mcp).toBe(false);
  });

  it('exposes effortCfg derived from effort', () => {
    const { result } = renderHook(() => useProjectStore());
    expect(result.current.effortCfg.maxIter).toBe(6); // medium
  });
});

// ── Persisted setters ─────────────────────────────────────────────────────────
describe('useProjectStore — persisted setters', () => {
  it('setFolder updates state and persists', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.setFolder('/new/project'); });
    expect(result.current.folder).toBe('/new/project');
    expect(result.current.folderInput).toBe('/new/project');
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_folder', value: '/new/project' });
  });

  it('setModel updates state and persists', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.setModel('llama3.1-8b'); });
    expect(result.current.model).toBe('llama3.1-8b');
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_model', value: 'llama3.1-8b' });
  });

  it('setEffort updates state and effortCfg', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.setEffort('high'); });
    expect(result.current.effort).toBe('high');
    expect(result.current.effortCfg.maxIter).toBe(12);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_effort', value: 'high' });
  });

  it('setNotes persists with folder key', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.setNotes('my notes', 'myproject'); });
    expect(result.current.notes).toBe('my notes');
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_notes_myproject', value: 'my notes' });
  });

  it('setDiffReview persists 1/0', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.setDiffReview(true); });
    expect(result.current.diffReview).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_diff_review', value: '1' });
    act(() => { result.current.setDiffReview(false); });
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_diff_review', value: '0' });
  });

  it('setPermissions persists JSON', () => {
    const { result } = renderHook(() => useProjectStore());
    const newPerms = { ...result.current.permissions, mcp: true };
    act(() => { result.current.setPermissions(newPerms); });
    expect(result.current.permissions.mcp).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'yc_permissions' })
    );
  });

  it('setGithubToken persists', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.setGithubToken('ghp_test123'); });
    expect(result.current.githubToken).toBe('ghp_test123');
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_gh_token', value: 'ghp_test123' });
  });

  it('setSessionColor persists and handles null', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.setSessionColor('red'); });
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_session_color', value: 'red' });
    act(() => { result.current.setSessionColor(null); });
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_session_color', value: '' });
  });
});

// ── addHistory ────────────────────────────────────────────────────────────────
describe('useProjectStore — addHistory', () => {
  it('prepends new command and deduplicates', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => { result.current.addHistory('git status'); });
    act(() => { result.current.addHistory('npm test'); });
    act(() => { result.current.addHistory('git status'); }); // duplicate
    expect(result.current.cmdHistory[0]).toBe('git status');
    expect(result.current.cmdHistory).toHaveLength(2);
  });

  it('caps at 50 entries', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      for (let i = 0; i < 55; i++) result.current.addHistory('cmd' + i);
    });
    expect(result.current.cmdHistory.length).toBeLessThanOrEqual(50);
  });
});

// ── loadProjectPrefs ──────────────────────────────────────────────────────────
describe('useProjectStore — loadProjectPrefs', () => {
  it('restores all fields from prefs', () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.loadProjectPrefs({
        folder: '/my/project',
        model: 'llama3.1-8b',
        effort: 'high',
        thinkingEnabled: '1',
        diffReview: '1',
        permissions: JSON.stringify({ write_file: true, exec: false, mcp: true }),
        hooks: JSON.stringify({ preWrite: ['lint'], postWrite: [], postPush: [] }),
        githubToken: 'ghp_abc',
        githubRepo: 'user/repo',
        cmdHistory: JSON.stringify(['git status']),
      });
    });
    expect(result.current.folder).toBe('/my/project');
    expect(result.current.model).toBe('llama3.1-8b');
    expect(result.current.effort).toBe('high');
    expect(result.current.thinkingEnabled).toBe(true);
    expect(result.current.diffReview).toBe(true);
    expect(result.current.permissions.mcp).toBe(true);
    expect(result.current.hooks.preWrite).toEqual(['lint']);
    expect(result.current.githubToken).toBe('ghp_abc');
    expect(result.current.cmdHistory).toEqual(['git status']);
  });

  it('handles invalid JSON gracefully', () => {
    const { result } = renderHook(() => useProjectStore());
    expect(() => {
      act(() => {
        result.current.loadProjectPrefs({ permissions: 'INVALID_JSON', hooks: '{bad}' });
      });
    }).not.toThrow();
  });
});

// ── loadFolderPrefs ───────────────────────────────────────────────────────────
describe('useProjectStore — loadFolderPrefs', () => {
  it('loads branch, YUYU.md, AGENTS.md, notes', async () => {
    mockPreferencesGet.mockResolvedValue({ value: 'my saved notes' });
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'feature/cool\n' }) // git branch
      .mockResolvedValueOnce({ ok: true, data: '# AGENTS' })       // AGENTS.md
      .mockResolvedValueOnce({ ok: true, data: '# YUYU' });         // YUYU.md

    const { result } = renderHook(() => useProjectStore());
    await act(async () => { await result.current.loadFolderPrefs('/my/project'); });

    expect(result.current.branch).toBe('feature/cool');
    expect(result.current.agentsMd).toBe('# AGENTS');
    expect(result.current.yuyuMd).toBe('# YUYU');
    expect(result.current.notes).toBe('my saved notes');
  });

  it('handles server errors gracefully', async () => {
    mockPreferencesGet.mockResolvedValue({ value: null });
    callServer.mockResolvedValue({ ok: false, data: '' });
    const { result } = renderHook(() => useProjectStore());
    await act(async () => { await result.current.loadFolderPrefs('/bad/path'); });
    expect(result.current.agentsMd).toBe('');
    expect(result.current.yuyuMd).toBe('');
  });
});

// ── Skill helpers ─────────────────────────────────────────────────────────────
describe('useProjectStore — skill helpers', () => {
  it('toggleSkill flips active state and persists', async () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.setSkills([{ name: 'linter', active: false }]);
    });
    await act(async () => { await result.current.toggleSkill('linter'); });
    expect(result.current.skills[0].active).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalled();
  });

  it('uploadSkill calls saveSkillFile and reloads skills', async () => {
    loadSkills.mockResolvedValue([{ name: 'new-skill', active: true }]);
    const { result } = renderHook(() => useProjectStore());
    await act(async () => {
      await result.current.uploadSkill('new-skill', '# skill content');
    });
    expect(saveSkillFile).toHaveBeenCalled();
    expect(result.current.skills).toHaveLength(1);
  });

  it('removeSkill calls deleteSkillFile and removes from state', async () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.setSkills([{ name: 'old-skill', active: true }]);
    });
    await act(async () => { await result.current.removeSkill('old-skill'); });
    expect(deleteSkillFile).toHaveBeenCalled();
    expect(result.current.skills).toHaveLength(0);
  });
});
