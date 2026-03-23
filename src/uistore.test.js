// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:  vi.fn().mockResolvedValue({ value: null }),
    set:  vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('../themes/index.js', () => ({
  THEMES_MAP: { obsidian: { name: 'Obsidian', accent: '#a78bfa' }, aurora: { name: 'Aurora', accent: '#38bdf8' } },
  THEME_KEYS: ['obsidian', 'aurora'],
  DEFAULT_THEME: 'obsidian',
}));

import { Preferences } from '@capacitor/preferences';
import { useUIStore } from './hooks/useUIStore.js';

beforeEach(() => vi.clearAllMocks());

describe('useUIStore — defaults', () => {
  it('starts with correct Fase 1+2 defaults', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.vimMode).toBe(false);
    expect(result.current.showMinimap).toBe(false);
    expect(result.current.ghostTextEnabled).toBe(false);
    expect(result.current.lintEnabled).toBe(false);
    expect(result.current.showLivePreview).toBe(false);
  });

  it('starts with correct Fase 3 defaults', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.tsLspEnabled).toBe(false);
    expect(result.current.blameEnabled).toBe(false);
    expect(result.current.multiCursor).toBe(true); // default ON
    expect(result.current.stickyScroll).toBe(false);
    expect(result.current.collabEnabled).toBe(false);
    expect(result.current.collabRoom).toBe('');
    expect(result.current.showGlobalFind).toBe(false);
  });

  it('starts with obsidian theme', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.theme).toBe('obsidian');
  });

  it('starts with fontSize 14', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.fontSize).toBe(14);
  });
});

describe('useUIStore — setters persist', () => {
  it('setVimMode persists to Preferences', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setVimMode(true); });
    expect(result.current.vimMode).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_vim', value: 'true' });
  });

  it('setShowMinimap persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setShowMinimap(true); });
    expect(result.current.showMinimap).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_minimap', value: 'true' });
  });

  it('setGhostTextEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setGhostTextEnabled(true); });
    expect(result.current.ghostTextEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_ghosttext', value: 'true' });
  });

  it('setLintEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setLintEnabled(true); });
    expect(result.current.lintEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_lint', value: 'true' });
  });

  it('setTsLspEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTsLspEnabled(true); });
    expect(result.current.tsLspEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_tslsp', value: 'true' });
  });

  it('setBlameEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setBlameEnabled(true); });
    expect(result.current.blameEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_blame', value: 'true' });
  });

  it('setMultiCursor persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setMultiCursor(false); });
    expect(result.current.multiCursor).toBe(false);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_multicursor', value: 'false' });
  });

  it('setStickyScroll persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setStickyScroll(true); });
    expect(result.current.stickyScroll).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_stickyscroll', value: 'true' });
  });

  it('setCollabEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setCollabEnabled(true); });
    expect(result.current.collabEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_collab', value: 'true' });
  });

  it('setTheme rejects unknown theme and falls back to default', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTheme('nonexistent'); });
    expect(result.current.theme).toBe('obsidian');
  });

  it('setTheme accepts valid theme', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTheme('aurora'); });
    expect(result.current.theme).toBe('aurora');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_theme', value: 'aurora' });
  });

  it('setFontSize clamps and persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setFontSize(16); });
    expect(result.current.fontSize).toBe(16);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_fontsize', value: '16' });
  });

  it('setShowGlobalFind toggles', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setShowGlobalFind(true); });
    expect(result.current.showGlobalFind).toBe(true);
  });
});

describe('useUIStore — loadUIPrefs Fase 3', () => {
  it('loads tslsp from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ tslsp: 'true' }); });
    expect(result.current.tsLspEnabled).toBe(true);
  });

  it('loads blame from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ blame: 'true' }); });
    expect(result.current.blameEnabled).toBe(true);
  });

  it('loads multiCursor=false from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ multiCursor: 'false' }); });
    expect(result.current.multiCursor).toBe(false);
  });

  it('keeps multiCursor=true if pref not false', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ multiCursor: 'true' }); });
    expect(result.current.multiCursor).toBe(true);
  });

  it('loads stickyScroll from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ stickyScroll: 'true' }); });
    expect(result.current.stickyScroll).toBe(true);
  });

  it('loads collab from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ collab: 'true' }); });
    expect(result.current.collabEnabled).toBe(true);
  });

  it('shows onboarding when onboarded is falsy', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ onboarded: null }); });
    expect(result.current.showOnboarding).toBe(false);
  });

  it('does not show onboarding when onboarded is set', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ onboarded: 'true' }); });
    expect(result.current.showOnboarding).toBe(false);
  });
});

describe('setSidebarWidth', () => {
  it('persists to Preferences', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setSidebarWidth(320); });
    expect(result.current.sidebarWidth).toBe(320);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_sidebar_w', value: '320' });
  });
});
