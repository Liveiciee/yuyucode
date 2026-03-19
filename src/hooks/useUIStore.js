import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { THEMES } from '../constants.js';

export function useUIStore() {
  // ── Panels / Overlays ──
  const [showSidebar, setShowSidebar]         = useState(true);
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
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [showOnboarding, setShowOnboarding]   = useState(false);

  // ── Theme / Display ──
  const [theme, setThemeRaw]         = useState('dark');
  const [customTheme, setCustomTheme] = useState(null);
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

  // ── Elicitation (AI-requested form input) ──
  const [elicitationData, setElicitationData] = useState(null);

  // ── Merge Conflict UI ──
  const [showMergeConflict, setShowMergeConflict] = useState(false);
  const [mergeConflictData, setMergeConflictData] = useState(null);

  // ── Derived ──
  const T = customTheme || THEMES[theme] || THEMES.dark;

  // ── Persisted setters ──
  function setTheme(t) {
    setThemeRaw(t);
    Preferences.set({ key: 'yc_theme', value: t });
  }
  function setFontSize(n) {
    setFontSizeRaw(n);
    Preferences.set({ key: 'yc_fontsize', value: String(n) });
  }
  function setSidebarWidth(w) {
    setSidebarWidthRaw(w);
    Preferences.set({ key: 'yc_sidebar_w', value: String(w) });
  }

  // ── Load from Preferences ──
  function loadUIPrefs({ theme: t, fontSize: fs, sidebarWidth: sw, customTheme: ct, onboarded }) {
    if (t && ['dark','darker','midnight','rose'].includes(t)) setThemeRaw(t);
    if (fs) setFontSizeRaw(parseInt(fs) || 14);
    if (sw) setSidebarWidthRaw(parseInt(sw) || 180);
    if (ct) { try { setCustomTheme(JSON.parse(ct)); } catch (_e) { } }
    if (!onboarded) setShowOnboarding(true);
  }

  return {
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
    showThemeBuilder, setShowThemeBuilder,
    showOnboarding, setShowOnboarding,
    // theme/display
    theme, setTheme,
    customTheme, setCustomTheme,
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
    // loader
    loadUIPrefs,
  };
}
