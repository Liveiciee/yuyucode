import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { THEMES_MAP, THEME_KEYS, DEFAULT_THEME } from '../themes/index.js';

export function useUIStore() {
  // ── Ambient brightness ──
  const [brightnessLevel, setBrightnessLevel] = useState(1.0);

  // ── Panels / Overlays ──
  const [showSidebar, setShowSidebar]         = useState(false);
  const [showTerminal, setShowTerminal]       = useState(false);
  const [showFolder, setShowFolder]           = useState(false);
  const [showSearch, setShowSearch]           = useState(false);
  const [showShortcuts, setShowShortcuts]     = useState(false);
  const [showDiff, setShowDiff]               = useState(false);
  const [showBlame, setShowBlame]             = useState(false);
  const [showSnippets, setShowSnippets]       = useState(false);
  const [showFileHistory, setShowFileHistory] = useState(false);
  const [showCustomActions, setShowCustomActions] = useState(false);
  const [showMemory, setShowMemory]           = useState(false);
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  const [showDepGraph, setShowDepGraph]       = useState(false);
  const [showMCP, setShowMCP]                 = useState(false);
  const [showGitHub, setShowGitHub]           = useState(false);
  const [showDeploy, setShowDeploy]           = useState(false);
  const [showSessions, setShowSessions]       = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showPlugins, setShowPlugins]         = useState(false);
  const [showSkills, setShowSkills]           = useState(false);
  const [showBgAgents, setShowBgAgents]       = useState(false);
  const [showConfig, setShowConfig]           = useState(false);
  const [showPalette, setShowPalette]         = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showOnboarding, setShowOnboarding]   = useState(false);

  // ── Editor feature toggles (Fase 1+2) ──
  const [vimMode, setVimModeRaw]               = useState(false);
  const [showMinimap, setShowMinimapRaw]       = useState(false);
  const [ghostTextEnabled, setGhostTextRaw]   = useState(false);
  const [lintEnabled, setLintEnabledRaw]       = useState(false);
  const [showLivePreview, setShowLivePreview]  = useState(false);

  // ── Editor feature toggles (Fase 3) ──
  const [tsLspEnabled,    setTsLspRaw]        = useState(false);
  const [blameEnabled,    setBlameRaw]        = useState(false);
  const [multiCursor,     setMultiCursorRaw]  = useState(true);
  const [stickyScroll,    setStickyScrollRaw] = useState(false);
  const [collabEnabled,   setCollabRaw]       = useState(false);
  const [collabRoom,      setCollabRoom]      = useState('');
  const [showGlobalFind,  setShowGlobalFind]  = useState(false);

  // ── Theme / Display ──
  const [themeKey, setThemeKeyRaw]   = useState(DEFAULT_THEME);
  const [fontSize, setFontSizeRaw]   = useState(14);
  const [sidebarWidth, setSidebarWidthRaw] = useState(180);
  const [dragging, setDragging]      = useState(false);

  // ── Misc UI ──
  const [depGraph, setDepGraph]       = useState(null);
  const [deployLog, setDeployLog]     = useState('');
  const [sessionList, setSessionList] = useState([]);
  const [commitModal, setCommitModal] = useState(false);
  const [commitMsg, setCommitMsg]     = useState('');
  const [dragOver, setDragOver]       = useState(false);

  // ── Elicitation ──
  const [elicitationData, setElicitationData] = useState(null);

  // ── Merge Conflict ──
  const [showMergeConflict, setShowMergeConflict] = useState(false);
  const [mergeConflictData, setMergeConflictData] = useState(null);

  // ── Derived: T = active theme object ──
  const T = THEMES_MAP[themeKey] || THEMES_MAP[DEFAULT_THEME];

  // ── Persisted setters ──
  function setTheme(key) {
    const k = THEME_KEYS.includes(key) ? key : DEFAULT_THEME;
    setThemeKeyRaw(k);
    Preferences.set({ key: 'yc_theme', value: k });
  }
  function setFontSize(n) {
    setFontSizeRaw(n);
    Preferences.set({ key: 'yc_fontsize', value: String(n) });
  }
  function setSidebarWidth(w) {
    setSidebarWidthRaw(w);
    Preferences.set({ key: 'yc_sidebar_w', value: String(w) });
  }
  function setVimMode(v) {
    setVimModeRaw(v);
    Preferences.set({ key: 'yc_vim', value: String(v) });
  }
  function setShowMinimap(v) {
    setShowMinimapRaw(v);
    Preferences.set({ key: 'yc_minimap', value: String(v) });
  }
  function setGhostTextEnabled(v) {
    setGhostTextRaw(v);
    Preferences.set({ key: 'yc_ghosttext', value: String(v) });
  }
  function setLintEnabled(v) {
    setLintEnabledRaw(v);
    Preferences.set({ key: 'yc_lint', value: String(v) });
  }
  function setTsLspEnabled(v) {
    setTsLspRaw(v);
    Preferences.set({ key: 'yc_tslsp', value: String(v) });
  }
  function setBlameEnabled(v) {
    setBlameRaw(v);
    Preferences.set({ key: 'yc_blame', value: String(v) });
  }
  function setMultiCursor(v) {
    setMultiCursorRaw(v);
    Preferences.set({ key: 'yc_multicursor', value: String(v) });
  }
  function setStickyScroll(v) {
    setStickyScrollRaw(v);
    Preferences.set({ key: 'yc_stickyscroll', value: String(v) });
  }
  function setCollabEnabled(v) {
    setCollabRaw(v);
    Preferences.set({ key: 'yc_collab', value: String(v) });
  }

  // ── Load from Preferences ──
  function loadUIPrefs({ theme: t, fontSize: fs, sidebarWidth: sw, onboarded, vim: vm, minimap: mm, ghostText: gt, lint: lt, tslsp, blame, multiCursor: multiCursor_, stickyScroll: stickyScroll_, collab }) {
    if (t && THEME_KEYS.includes(t)) setThemeKeyRaw(t);
    else if (t) setThemeKeyRaw(DEFAULT_THEME);
    if (fs) setFontSizeRaw(parseInt(fs) || 14);
    if (sw) setSidebarWidthRaw(parseInt(sw) || 180);
    if (vm === 'true') setVimModeRaw(true);
    if (mm === 'true') setShowMinimapRaw(true);
    if (gt === 'true') setGhostTextRaw(true);
    if (lt === 'true') setLintEnabledRaw(true);
    if (tslsp === 'true') setTsLspRaw(true);
    if (blame === 'true') setBlameRaw(true);
    if (multiCursor_ === 'false') setMultiCursorRaw(false);
    if (stickyScroll_ === 'true') setStickyScrollRaw(true);
    if (collab === 'true') setCollabRaw(true);
    if (!onboarded) setShowOnboarding(true);
  }

  return {
    brightnessLevel, setBrightnessLevel,
    // panels
    showSidebar, setShowSidebar,
    showTerminal, setShowTerminal,
    showFolder, setShowFolder,
    showSearch, setShowSearch,
    showShortcuts, setShowShortcuts,
    showDiff, setShowDiff,
    showBlame, setShowBlame,
    showSnippets, setShowSnippets,
    showFileHistory, setShowFileHistory,
    showCustomActions, setShowCustomActions,
    showMemory, setShowMemory,
    showCheckpoints, setShowCheckpoints,
    showDepGraph, setShowDepGraph,
    showMCP, setShowMCP,
    showGitHub, setShowGitHub,
    showDeploy, setShowDeploy,
    showSessions, setShowSessions,
    showPermissions, setShowPermissions,
    showPlugins, setShowPlugins,
    showSkills, setShowSkills,
    showBgAgents, setShowBgAgents,
    showConfig, setShowConfig,
    showPalette, setShowPalette,
    showThemePicker, setShowThemePicker,
    showThemeBuilder: showThemePicker, setShowThemeBuilder: setShowThemePicker,
    showOnboarding, setShowOnboarding,
    // editor feature toggles fase 1+2
    vimMode, setVimMode,
    showMinimap, setShowMinimap,
    ghostTextEnabled, setGhostTextEnabled,
    lintEnabled, setLintEnabled,
    showLivePreview, setShowLivePreview,
    // editor feature toggles fase 3
    tsLspEnabled, setTsLspEnabled,
    blameEnabled, setBlameEnabled,
    multiCursor, setMultiCursor,
    stickyScroll, setStickyScroll,
    collabEnabled, setCollabEnabled,
    collabRoom, setCollabRoom,
    showGlobalFind, setShowGlobalFind,
    // theme/display
    theme: themeKey, setTheme,
    themeKey, THEMES_MAP, THEME_KEYS,
    fontSize, setFontSize,
    sidebarWidth, setSidebarWidth,
    dragging, setDragging,
    T,
    // misc
    depGraph, setDepGraph,
    deployLog, setDeployLog,
    sessionList, setSessionList,
    commitModal, setCommitModal,
    commitMsg, setCommitMsg,
    dragOver, setDragOver,
    elicitationData, setElicitationData,
    showMergeConflict, setShowMergeConflict,
    mergeConflictData, setMergeConflictData,
    loadUIPrefs,
  };
}
