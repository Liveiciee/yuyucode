# YuyuCode — Codebase Map
> Generated: 2026-03-20T15:28:53.505Z
> Files: 67 | Symbols: 110

---

## 🔥 `vitest.config.js` _(11L, salience:91)_

## 🔥 `src/theme.js` _(15L, salience:67)_

## 🔥 `src/plugins/brightness.js` _(16L, salience:63)_

## 🔥 `src/components/panels.jsx` _(19L, salience:53)_

## 🔥 `src/themes/index.js` _(25L, salience:43)_
- ◆ `THEMES_MAP`
- ◆ `THEME_KEYS`
- ◆ `DEFAULT_THEME`

## 🔥 `src/main.jsx` _(25L, salience:40)_

## 🔥 `src/hooks/useBrightness.js` _(28L, salience:37)_
- ƒ `useBrightness(setBrightnessLevel)`

## 🔥 `vite.config.js` _(29L, salience:34)_

## 🔥 `src/components/AppSidebar.jsx` _(38L, salience:27)_
- ƒ `AppSidebar({ T, ui, project, file, onSidebarDragStart })`

## 🔥 `src/utils.snapshot.test.js` _(38L, salience:26)_

## 🔥 `src/features.js` _(420L, salience:24)_
- ƒ `parsePlanSteps(reply)`
- ƒ `generatePlan(task, folder, callAI, signal)`
- ƒ `executePlanStep(step, folder, callAI, signal, onChunk)`
- ƒ `getBgAgents`
- ƒ `runBackgroundAgent(task, folder, callAI, onDone)`
- ƒ `mergeBackgroundAgent(id, folder)`
- ƒ `abortBgAgent(id)`
- ƒ `loadSkills(folder, activeMap = {})`
- ƒ `saveSkillFile(folder, name, content)`
- ƒ `deleteSkillFile(folder, name)`
- ƒ `selectSkills(skills, taskText)`
- ƒ `runHooksV2(hookList, context, folder)`
- ƒ `saveSession(name, messages, folder, branch)`
- ƒ `loadSessions`
- ƒ `rewindMessages(messages, turns)`
- ƒ `checkPermission(permissions, actionType)`
- ƒ `parseElicitation(reply)`
- ƒ `tfidfRank(memories, queryText, topN = 5)`
- ◆ `DEFAULT_HOOKS`
- ◆ `tokenTracker`
- ◆ `EFFORT_CONFIG`
- ◆ `DEFAULT_PERMISSIONS`

## 🔥 `src/constants.js` _(269L, salience:23)_
- ◆ `CEREBRAS_KEY`
- ◆ `GROQ_KEY`
- ◆ `TAVILY_KEY`
- ◆ `YUYU_SERVER`
- ◆ `WS_SERVER`
- ◆ `MAX_HISTORY`
- ◆ `AUTO_COMPACT_CHARS`
- ◆ `AUTO_COMPACT_MIN_MSG`
- ◆ `MAX_FILE_PREVIEW`
- ◆ `MAX_SKILL_PREVIEW`
- ◆ `CONTEXT_RECENT_KEEP`
- ◆ `VISION_MODEL`
- ◆ `FALLBACK_MODEL`
- ◆ `MODELS`
- ◆ `BASE_SYSTEM`
- ◆ `GIT_SHORTCUTS`
- ◆ `FOLLOW_UPS`
- ◆ `SLASH_COMMANDS`
- ◆ `TEMPLATES`

## 🔥 `src/hooks/useNotifications.js` _(49L, salience:21)_
- ƒ `useNotifications`

## ⭐ `src/components/SearchBar.jsx` _(68L, salience:17)_
- ƒ `SearchBar({ folder, onSelectFile, onClose, T })`
- ƒ `UndoBar({ history, onUndo, T })`

## ⭐ `src/components/KeyboardRow.jsx` _(73L, salience:15)_
- ƒ `KeyboardRow({ onInsert, T })`

## ⭐ `src/hooks/useMediaHandlers.js` _(70L, salience:15)_
- ƒ `useMediaHandlers({ setVisionImage, setInput, haptic, setDragOver })`

## ⭐ `src/components/AppHeader.jsx` _(78L, salience:14)_
- ƒ `AppHeader({ T, ui, project, file, chat, growth, saveFolder, undoLastEdit, haptic })`

## ⭐ `eslint.config.js` _(72L, salience:14)_

## ⭐ `src/components/panels.tools.jsx` _(605L, salience:13)_
- ƒ `CustomActionsPanel({ folder:_folder, onRun, onClose, T })`
- ƒ `ShortcutsPanel({ onClose, T })`
- ƒ `SnippetLibrary({ onInsert, onClose, T })`
- ƒ `ThemeBuilder({ onClose, themeKey, themesMap, themeKeys, onTheme, T })`
- ƒ `DeployPanel({ deployLog, loading, onDeploy, onClose, T })`
- ƒ `McpPanel({ mcpTools, folder: _folder, onResult, onClose, T })`
- ƒ `GitHubPanel({ githubRepo, githubToken, githubData, onRepoChange, onTokenChange, onFetch, onAskYuyu, onClose, T })`
- ƒ `SessionsPanel({ sessions, onRestore, onClose, T })`
- ƒ `PermissionsPanel({ permissions, accentColor:_accentColor, onToggle, onReset, onClose, T })`
- ƒ `PluginsPanel({ activePlugins, folder, onToggle, onClose, T })`
- ⚛ `ElapsedTime({ startedAt })`

## ⭐ `src/hooks/useAgentSwarm.js` _(84L, salience:13)_
- ƒ `useAgentSwarm({
  callAI, folder,
  setSwarmRunning, setSwarmLog, setMessages,
  sendNotification, haptic, abortRef,
})`

## ⭐ `src/utils.js` _(239L, salience:11)_
- ƒ `countTokens(msgs)`
- ƒ `getFileIcon(name)`
- ƒ `hl(code, lang = '')`
- ƒ `resolvePath(base, p)`
- ƒ `parseActions(text)`
- ƒ `generateDiff(original, patched, maxLines = 40)`
- ƒ `executeAction(action, baseFolder)`

## · `src/api.js` _(220L, salience:10)_
- ƒ `readSSEStream(resp, onChunk, signal)`
- ƒ `askCerebrasStream(messages, model, onChunk, signal, options = {}, _attempt = 0)`
- ƒ `callServer(payload)`
- ƒ `execStream(command, cwd, onLine, signal)`
- ƒ `callServerBatch(payloads)`

## · `src/api.test.js` _(98L, salience:10)_

## · `src/components/VoiceBtn.jsx` _(135L, salience:9)_
- ƒ `VoiceBtn({ onResult, disabled, T })`
- ƒ `PushToTalkBtn({ onResult, disabled, T })`

## · `src/hooks/useApprovalFlow.js` _(116L, salience:9)_

## · `src/hooks/useDevTools.js` _(113L, salience:9)_

## · `src/livepreview.test.js` _(127L, salience:8)_

## · `src/themes/mybrand.js` _(126L, salience:8)_

## · `src/themes/obsidian.js` _(127L, salience:8)_

## · `src/components/MsgBubble.jsx` _(481L, salience:7)_
- ƒ `ThinkingBlock({ text, T, live = false })`
- ƒ `StreamingBubble({ text, T })`
- ƒ `MsgContent({ text, T })`
- ƒ `ActionChip({ action, T })`
- ƒ `MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix, onDelete, onEdit, T })`

## · `src/components/ThemeEffects.jsx` _(168L, salience:7)_
- ƒ `ThemeEffects({ T })`

## · `src/components/panels.agent.jsx` _(317L, salience:7)_
- ƒ `ElicitationPanel({ data, onSubmit, onDismiss, T })`
- ƒ `SkillsPanel({ skills, onToggle, onUpload, onRemove, onAdd, onClose, accentColor:_accentColor, T })`
- ƒ `BgAgentPanel({ agents, onMerge, onAbort, onClose, T })`
- ⚛ `ElapsedTime({ startedAt })`

## · `src/components/panels.base.jsx` _(167L, salience:7)_
- ƒ `BottomSheet({ children, onClose, height='88%', noPad:_noPad=false, T })`

## · `src/components/panels.git.jsx` _(537L, salience:7)_
- ƒ `GitComparePanel({ folder, onClose, T })`
- ƒ `FileHistoryPanel({ folder, filePath, onClose, T })`
- ƒ `GitBlamePanel({ folder, filePath, onClose, T })`
- ƒ `DepGraphPanel({ depGraph, onClose, T })`
- ƒ `MergeConflictPanel({ data, folder, onResolved, onAborted, onClose, T })`

## · `src/editor.bench.js` _(150L, salience:7)_

## · `src/globalfind.test.js` _(149L, salience:7)_

## · `src/hooks/useGrowth.js` _(162L, salience:7)_
- ƒ `useGrowth`

## · `src/themes/aurora.js` _(142L, salience:7)_

## · `src/themes/ink.js` _(134L, salience:7)_

## · `src/themes/neon.js` _(141L, salience:7)_

## · `src/utils.test.js` _(148L, salience:7)_

## · `src/components/LivePreview.jsx` _(208L, salience:6)_
- ƒ `LivePreview({ tabs, T, onClose })`

## · `src/hooks/useChatStore.js` _(208L, salience:6)_
- ƒ `useChatStore`

## · `src/hooks/useUIStore.js` _(208L, salience:6)_
- ƒ `useUIStore`

## · `src/components/FileTree.jsx` _(293L, salience:5)_
- ƒ `FileTree({ folder, onSelectFile, selectedFile, T })`
- ⚛ `FileIcon({ name, size=13 })`

## · `src/components/GlobalFindReplace.jsx` _(248L, salience:5)_
- ƒ `GlobalFindReplace({ folder, onOpenFile, onClose, T })`

## · `src/components/Terminal.jsx` _(342L, salience:5)_
- ƒ `Terminal({ folder, cmdHistory, addHistory, onSendToAI, T })`
- ⚛ `TrafficDot({ color, hint, active, cmd, onClick })`

## · `src/editor.test.js` _(187L, salience:5)_

## · `src/features.test.js` _(214L, salience:5)_

## · `src/hooks/useFileStore.js` _(246L, salience:5)_
- ƒ `useFileStore`

## · `src/hooks/useProjectStore.js` _(226L, salience:5)_
- ƒ `useProjectStore`

## · `src/multitab.test.js` _(209L, salience:5)_

## · `src/uistore.test.js` _(193L, salience:5)_

## · `src/utils.integration.test.js` _(217L, salience:5)_

## · `src/App.jsx` _(329L, salience:4)_
- ƒ `App`

## · `src/api.extended.test.js` _(253L, salience:4)_

## · `src/components/AppPanels.jsx` _(271L, salience:4)_

## · `src/components/FileEditor.jsx` _(779L, salience:4)_
- ⚛ `Minimap({ viewRef, T })`
- ⚛ `Breadcrumb({ viewRef, T })`
- ◆ `FileEditor`

## · `src/features.extra.test.js` _(227L, salience:4)_

## · `src/themes.test.js` _(224L, salience:4)_

## · `src/features.extended.test.js` _(389L, salience:3)_

## · `src/hooks/useAgentLoop.js` _(645L, salience:3)_
- ƒ `useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
  growth,
})`

## · `src/utils.extended.test.js` _(388L, salience:3)_

## · `src/components/AppChat.jsx` _(485L, salience:2)_

## · `yuyu-server.js` _(598L, salience:2)_

## · `src/hooks/useSlashCommands.js` _(712L, salience:1)_
