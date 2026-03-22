// ── panels.jsx — barrel re-export ───────────────────────────────────────────

export { BottomSheet, CommandPalette } from './panels.base.jsx';
export { TicTacToe } from './games/TicTacToe.jsx';
export { GitComparePanel, FileHistoryPanel, GitBlamePanel, DepGraphPanel, MergeConflictPanel } from './panels.git.jsx';
export { ElicitationPanel, SkillsPanel, BgAgentPanel } from './panels.agent.jsx';
export { CustomActionsPanel, ShortcutsPanel, SnippetLibrary, ThemeBuilder,
  DeployPanel, McpPanel, GitHubPanel, SessionsPanel, PermissionsPanel,
  PluginsPanel, ConfigPanel } from './panels.tools.jsx';
export { GlobalFindReplace } from './GlobalFindReplace.jsx';
