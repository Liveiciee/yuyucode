// ── panels.jsx — barrel re-export ───────────────────────────────────────────
// Semua panel diimport dari sini supaya App.jsx tidak perlu tahu lokasi internal.
// Edit panel: buka file yang sesuai:
//   panels.base.jsx  — BottomSheet, CommandPalette
//   panels.git.jsx   — GitComparePanel, FileHistoryPanel, GitBlamePanel,
//                      DepGraphPanel, MergeConflictPanel
//   panels.agent.jsx — ElicitationPanel, SkillsPanel, BgAgentPanel
//   panels.tools.jsx — CustomActionsPanel, ShortcutsPanel, SnippetLibrary,
//                      ThemeBuilder, DeployPanel, McpPanel, GitHubPanel,
//                      SessionsPanel, PermissionsPanel, PluginsPanel, ConfigPanel

export { BottomSheet, CommandPalette } from './panels.base.jsx';
export { GitComparePanel, FileHistoryPanel, GitBlamePanel, DepGraphPanel, MergeConflictPanel } from './panels.git.jsx';
export { ElicitationPanel, SkillsPanel, BgAgentPanel } from './panels.agent.jsx';
export { CustomActionsPanel, ShortcutsPanel, SnippetLibrary, ThemeBuilder,
  DeployPanel, McpPanel, GitHubPanel, SessionsPanel, PermissionsPanel,
  PluginsPanel, ConfigPanel } from './panels.tools.jsx';
