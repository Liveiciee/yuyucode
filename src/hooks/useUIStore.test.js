// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockPreferencesSet = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@capacitor/preferences', () => ({
  Preferences: { get: vi.fn().mockResolvedValue({ value: null }), set: mockPreferencesSet },
}));
vi.mock('../themes/index.js', () => ({
  THEMES_MAP:   { dark: { bg: '#000' }, light: { bg: '#fff' } },
  THEME_KEYS:   ['dark', 'light'],
  DEFAULT_THEME: 'dark',
}));

import { useUIStore } from './useUIStore.js';

beforeEach(() => { vi.clearAllMocks(); });

// ── initial state ──────────────────────────────────────────────────────────────
describe('useUIStore — initial state', () => {
  it('starts with all panels closed', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.showSidebar).toBe(false);
    expect(result.current.showTerminal).toBe(false);
    expect(result.current.showMCP).toBe(false);
    expect(result.current.showConfig).toBe(false);
    expect(result.current.showPalette).toBe(false);
  });

  it('starts with default fontSize 14', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.fontSize).toBe(14);
  });

  it('starts with default theme', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.themeKey).toBe('dark');
  });

  it('multiCursor defaults to true', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.multiCursor).toBe(true);
  });

  it('T is derived from themeKey', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.T).toEqual({ bg: '#000' });
  });
});

// ── persisted setters ─────────────────────────────────────────────────────────
describe('useUIStore — persisted setters', () => {
  it('setTheme updates themeKey and persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTheme('light'); });
    expect(result.current.themeKey).toBe('light');
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_theme', value: 'light' });
  });

  it('setTheme falls back to DEFAULT_THEME for unknown key', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTheme('nonexistent'); });
    expect(result.current.themeKey).toBe('dark');
  });

  it('setFontSize updates and persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setFontSize(16); });
    expect(result.current.fontSize).toBe(16);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_fontsize', value: '16' });
  });

  it('setSidebarWidth updates and persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setSidebarWidth(220); });
    expect(result.current.sidebarWidth).toBe(220);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_sidebar_w', value: '220' });
  });

  it('setVimMode true persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setVimMode(true); });
    expect(result.current.vimMode).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_vim', value: 'true' });
  });

  it('setShowMinimap persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setShowMinimap(true); });
    expect(result.current.showMinimap).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_minimap', value: 'true' });
  });

  it('setGhostTextEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setGhostTextEnabled(true); });
    expect(result.current.ghostTextEnabled).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_ghosttext', value: 'true' });
  });

  it('setLintEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setLintEnabled(true); });
    expect(result.current.lintEnabled).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_lint', value: 'true' });
  });

  it('setTsLspEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTsLspEnabled(true); });
    expect(result.current.tsLspEnabled).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_tslsp', value: 'true' });
  });

  it('setBlameEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setBlameEnabled(true); });
    expect(result.current.blameEnabled).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_blame', value: 'true' });
  });

  it('setMultiCursor false persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setMultiCursor(false); });
    expect(result.current.multiCursor).toBe(false);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_multicursor', value: 'false' });
  });

  it('setStickyScroll persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setStickyScroll(true); });
    expect(result.current.stickyScroll).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_stickyscroll', value: 'true' });
  });

  it('setCollabEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setCollabEnabled(true); });
    expect(result.current.collabEnabled).toBe(true);
    expect(mockPreferencesSet).toHaveBeenCalledWith({ key: 'yc_collab', value: 'true' });
  });
});

// ── loadUIPrefs branches ──────────────────────────────────────────────────────
describe('useUIStore — loadUIPrefs', () => {
  it('loads valid theme', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ theme: 'light' }); });
    expect(result.current.themeKey).toBe('light');
  });

  it('falls back to DEFAULT_THEME for invalid theme', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ theme: 'invalid-theme' }); });
    expect(result.current.themeKey).toBe('dark');
  });

  it('loads fontSize as integer', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ fontSize: '16' }); });
    expect(result.current.fontSize).toBe(16);
  });

  it('falls back to 14 for invalid fontSize', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ fontSize: 'bad' }); });
    expect(result.current.fontSize).toBe(14);
  });

  it('loads sidebarWidth as integer', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ sidebarWidth: '240' }); });
    expect(result.current.sidebarWidth).toBe(240);
  });

  it('loads vim true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ vim: 'true' }); });
    expect(result.current.vimMode).toBe(true);
  });

  it('does not set vim for false string', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ vim: 'false' }); });
    expect(result.current.vimMode).toBe(false);
  });

  it('loads minimap true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ minimap: 'true' }); });
    expect(result.current.showMinimap).toBe(true);
  });

  it('loads ghostText true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ ghostText: 'true' }); });
    expect(result.current.ghostTextEnabled).toBe(true);
  });

  it('loads lint true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ lint: 'true' }); });
    expect(result.current.lintEnabled).toBe(true);
  });

  it('loads tslsp true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ tslsp: 'true' }); });
    expect(result.current.tsLspEnabled).toBe(true);
  });

  it('loads blame true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ blame: 'true' }); });
    expect(result.current.blameEnabled).toBe(true);
  });

  it('sets multiCursor false when value is false string', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ multiCursor: 'false' }); });
    expect(result.current.multiCursor).toBe(false);
  });

  it('keeps multiCursor true when value is true string', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ multiCursor: 'true' }); });
    expect(result.current.multiCursor).toBe(true);
  });

  it('loads stickyScroll true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ stickyScroll: 'true' }); });
    expect(result.current.stickyScroll).toBe(true);
  });

  it('loads collab true', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ collab: 'true' }); });
    expect(result.current.collabEnabled).toBe(true);
  });

  it('handles all null values without throwing', () => {
    const { result } = renderHook(() => useUIStore());
    expect(() => act(() => {
      result.current.loadUIPrefs({ theme: null, fontSize: null, sidebarWidth: null });
    })).not.toThrow();
  });
});

// ── panel toggles ─────────────────────────────────────────────────────────────
describe('useUIStore — panel toggles', () => {
  const panels = [
    ['showSidebar', 'setShowSidebar'],
    ['showTerminal', 'setShowTerminal'],
    ['showMCP', 'setShowMCP'],
    ['showGitHub', 'setShowGitHub'],
    ['showConfig', 'setShowConfig'],
    ['showPalette', 'setShowPalette'],
    ['showPermissions', 'setShowPermissions'],
    ['showDepGraph', 'setShowDepGraph'],
    ['showCheckpoints', 'setShowCheckpoints'],
    ['showMemory', 'setShowMemory'],
  ];

  panels.forEach(([state, setter]) => {
    it(setter + '(true) sets ' + state + ' to true', () => {
      const { result } = renderHook(() => useUIStore());
      act(() => { result.current[setter](true); });
      expect(result.current[state]).toBe(true);
    });
    it(setter + '(false) sets ' + state + ' to false', () => {
      const { result } = renderHook(() => useUIStore());
      act(() => { result.current[setter](true); });
      act(() => { result.current[setter](false); });
      expect(result.current[state]).toBe(false);
    });
  });
});
