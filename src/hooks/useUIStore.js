import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { THEMES_MAP, THEME_KEYS, DEFAULT_THEME } from '../themes/index.js';

export function useUIStore() {
  // ── Ambient brightness ──
  const [brightnessLevel, setBrightnessLevel] = useState(1.0); // 0.0–1.0, default full

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

  // ── Derived: T = active theme object ──────────────────────────────────────
  // T punya semua token lama (bg, text, accent, ...) + token baru (bubble, chip, ...)
  const T = THEMES_MAP[themeKey] || THEMES_MAP[DEFAULT_THEME];

  // ── Persisted setters ──────────────────────────────────────────────────────
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

  // ── Load from Preferences ─────────────────────────────────────────────────
  function loadUIPrefs({ theme: t, fontSize: fs, sidebarWidth: sw, onboarded }) {
    // support lama (dark/darker/midnight/rose) → fallback ke obsidian
    if (t && THEME_KEYS.includes(t)) setThemeKeyRaw(t);
    else if (t) setThemeKeyRaw(DEFAULT_THEME); // migrate dari theme lama
    if (fs) setFontSizeRaw(parseInt(fs) || 14);
    if (sw) setSidebarWidthRaw(parseInt(sw) || 180);
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
    // compat alias — beberapa tempat pakai showThemeBuilder
    showThemeBuilder: showThemePicker, setShowThemeBuilder: setShowThemePicker,
    showOnboarding, setShowOnboarding,
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
