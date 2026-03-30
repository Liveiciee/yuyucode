// Re-export from panels.base.jsx
export { BottomSheet, CommandPalette } from './panels.base.jsx';

// Re-export from panels.git.jsx
export {
  GitComparePanel,
  FileHistoryPanel,
  GitBlamePanel,
  DepGraphPanel,
  MergeConflictPanel
} from './panels.git.jsx';

// Re-export from panels.agent.jsx
export {
  ElicitationPanel,
  SkillsPanel,
  BgAgentPanel
} from './panels.agent.jsx';

// Re-export all tool panels from the modular tools directory
/* eslint-disable-next-line react-refresh/only-export-components */
export * from './panels/tools';
