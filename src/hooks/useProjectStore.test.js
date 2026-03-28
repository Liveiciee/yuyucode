// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../api.js', () => ({
  callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));

vi.mock('../features.js', () => ({
  runHooksV2: vi.fn().mockResolvedValue(undefined),
  EFFORT_CONFIG: { low: { maxIter: 3 }, medium: { maxIter: 6 }, high: { maxIter: 12 } },
  DEFAULT_PERMISSIONS: { read_file: true, write_file: true, patch_file: true, exec: true, list_files: true, tree: true, search: true, mcp: false, delete_file: false, move_file: false, mkdir: true, browse: false, web_search: true },
  loadSkills: vi.fn().mockResolvedValue([]),
  saveSkillFile: vi.fn().mockResolvedValue({ ok: true }),
  deleteSkillFile: vi.fn().mockResolvedValue({ ok: true }),
}));

import { useProjectStore } from './useProjectStore.js';
import { callServer } from '../api.js';
import { loadSkills, saveSkillFile, deleteSkillFile } from '../features.js';
import { Preferences } from '@capacitor/preferences';

beforeEach(() => {
  vi.clearAllMocks();
  loadSkills.mockResolvedValue([]);
  saveSkillFile.mockResolvedValue({ ok: true });
  deleteSkillFile.mockResolvedValue({ ok: true });
});

describe('useProjectStore — skill helpers', () => {
  it('toggleSkill flips active state and persists', async () => {
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.setSkills([{ name: 'linter', active: false }]);
    });
    await act(async () => { await result.current.toggleSkill('linter'); });
    expect(result.current.skills[0].active).toBe(true);
  });

  it('uploadSkill calls saveSkillFile and reloads skills', async () => {
    // Mock loadSkills to return a skill after upload
    loadSkills.mockResolvedValueOnce([{ name: 'new-skill', active: true }]);
    
    const { result } = renderHook(() => useProjectStore());
    
    await act(async () => {
      await result.current.uploadSkill('new-skill', '# skill content');
    });
    
    expect(saveSkillFile).toHaveBeenCalled();
    expect(loadSkills).toHaveBeenCalled();
    expect(result.current.skills).toHaveLength(1);
    expect(result.current.skills[0].name).toBe('new-skill');
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

describe('useProjectStore — state and persistence coverage', () => {
  it('addRecentProject deduplicates, orders newest first, and persists', () => {
    const { result } = renderHook(() => useProjectStore());

    act(() => {
      result.current.addRecentProject('/work/a');
      result.current.addRecentProject('/work/b');
      result.current.addRecentProject('/work/a');
    });

    expect(result.current.recentProjects.map((p) => p.path)).toEqual(['/work/a', '/work/b']);
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'yc_recent_projects',
      value: JSON.stringify(result.current.recentProjects),
    });
  });

  it('loadRecentProjects ignores invalid json but loads valid list', () => {
    const { result } = renderHook(() => useProjectStore());

    act(() => {
      result.current.loadRecentProjects('not-json');
    });
    expect(result.current.recentProjects).toEqual([]);

    const seeded = [{ path: '/repo', name: 'repo', lastOpened: 1 }];
    act(() => {
      result.current.loadRecentProjects(JSON.stringify(seeded));
    });
    expect(result.current.recentProjects).toEqual(seeded);
  });

  it('loadProjectPrefs hydrates known fields and safely ignores broken json', () => {
    const { result } = renderHook(() => useProjectStore());

    act(() => {
      result.current.loadProjectPrefs({
        folder: '/repo',
        cmdHistory: JSON.stringify(['/plan', '/status']),
        model: 'qwen-cerebras',
        hooks: '{broken',
        githubToken: 'ghp_x',
        githubRepo: 'owner/repo',
        sessionColor: 'blue',
        plugins: JSON.stringify({ lint: true }),
        effort: 'high',
        thinkingEnabled: '1',
        permissions: JSON.stringify({ read_file: true }),
        diffReview: '1',
      });
    });

    expect(result.current.folder).toBe('/repo');
    expect(result.current.folderInput).toBe('/repo');
    expect(result.current.cmdHistory).toEqual(['/plan', '/status']);
    expect(result.current.githubToken).toBe('ghp_x');
    expect(result.current.githubRepo).toBe('owner/repo');
    expect(result.current.sessionColor).toBe('blue');
    expect(result.current.activePlugins).toEqual({ lint: true });
    expect(result.current.effort).toBe('high');
    expect(result.current.thinkingEnabled).toBe(true);
    expect(result.current.diffReview).toBe(true);
  });

  it('loadFolderPrefs loads branch, docs and skills', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'main\n' })
      .mockResolvedValueOnce({ ok: true, data: '# AGENTS' })
      .mockResolvedValueOnce({ ok: true, data: '# YUYU' });
    Preferences.get
      .mockResolvedValueOnce({ value: 'dev notes' })
      .mockResolvedValueOnce({ value: JSON.stringify({ optimizer: true }) });
    loadSkills.mockResolvedValueOnce([{ name: 'optimizer', active: true }]);

    const { result } = renderHook(() => useProjectStore());
    await act(async () => {
      await result.current.loadFolderPrefs('/repo');
      await Promise.resolve();
    });

    expect(result.current.notes).toBe('dev notes');
    expect(result.current.branch).toBe('main');
    expect(result.current.agentsMd).toBe('# AGENTS');
    expect(result.current.yuyuMd).toBe('# YUYU');
    expect(result.current.skills).toEqual([{ name: 'optimizer', active: true }]);
    expect(callServer).toHaveBeenNthCalledWith(1, { type: 'exec', path: '/repo', command: 'git branch --show-current' });
    expect(callServer).toHaveBeenNthCalledWith(2, { type: 'read', path: '/repo/AGENTS.md' });
    expect(callServer).toHaveBeenNthCalledWith(3, { type: 'read', path: '/repo/YUYU.md' });
  });
});
