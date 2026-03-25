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
