# YuyuCode — Codebase Map
> Generated: 2026-03-21T21:01:34.161Z
> Files: 77 | Symbols: 112

---

## 🔥 `src/theme.js` _(15L, salience:67)_

## 🔥 `src/plugins/brightness.js` _(16L, salience:63)_

## 🔥 `src/components/panels.jsx` _(19L, salience:53)_

## 🔥 `src/themes/index.js` _(25L, salience:43)_
- ◆ `THEMES_MAP`
- ◆ `THEME_KEYS`
- ◆ `DEFAULT_THEME`

## 🔥 `src/main.jsx` _(26L, salience:38)_

## 🔥 `src/hooks/useBrightness.js` _(28L, salience:37)_
- 🪝 `useBrightness(setBrightnessLevel)`

## 🔥 `vite.config.js` _(29L, salience:34)_

## 🔥 `vitest.config.js` _(33L, salience:30)_

## 🔥 `src/components/AppSidebar.jsx` _(38L, salience:27)_
- ⚛ `AppSidebar({ T, ui, project, file, onSidebarDragStart })`

## 🔥 `src/utils.snapshot.test.js` _(39L, salience:26)_

## 🔥 `src/constants.js` _(271L, salience:24)_
- ◆ `CEREBRAS_KEY`
- ◆ `GROQ_KEY`
- ◆ `TAVILY_KEY`
- ◆ `YUYU_SERVER`
- ◆ `WS_SERVER`
- ◆ `MAX_HISTORY`
- ◆ `AUTO_COMPACT_CHARS`
- ◆ `CONTEXT_WARN_CHARS`
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

## 🔥 `src/features.js` _(427L, salience:24)_
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

## 🔥 `src/hooks/useNotifications.js` _(49L, salience:21)_
- 🪝 `useNotifications`

## ⭐ `src/components/SearchBar.jsx` _(68L, salience:17)_
- ⚛ `SearchBar({ folder, onSelectFile, onClose, T })`
- ⚛ `UndoBar({ history, onUndo, T })`

## ⭐ `src/components/KeyboardRow.jsx` _(73L, salience:15)_
- ⚛ `KeyboardRow({ onInsert, T })`

## ⭐ `src/hooks/useMediaHandlers.js` _(70L, salience:15)_
- 🪝 `useMediaHandlers({ setVisionImage, setInput, haptic, setDragOver })`

## ⭐ `src/components/AppHeader.jsx` _(78L, salience:14)_
- ⚛ `AppHeader({ T, ui, project, file, chat, growth, saveFolder, undoLastEdit, haptic })`

## ⭐ `eslint.config.js` _(72L, salience:14)_

## ⭐ `src/components/panels.tools.jsx` _(608L, salience:13)_
- ⚛ `CustomActionsPanel({ folder:_folder, onRun, onClose, T })`
- ⚛ `ShortcutsPanel({ onClose, T })`
- ⚛ `SnippetLibrary({ onInsert, onClose, T })`
- ⚛ `ThemeBuilder({ onClose, themeKey, themesMap, themeKeys, onTheme, T })`
- ⚛ `DeployPanel({ deployLog, loading, onDeploy, onClose, T })`
- ⚛ `McpPanel({ mcpTools, folder: _folder, onResult, onClose, T })`
- ⚛ `SessionsPanel({ sessions, onRestore, onClose, T })`
- ⚛ `PermissionsPanel({ permissions, accentColor:_accentColor, onToggle, onReset, onClose, T })`
- ⚛ `PluginsPanel({ activePlugins, folder, onToggle, onClose, T })`
- ⚛ `ElapsedTime({ startedAt })`
- ƒ `GitHubPanel({ githubRepo, githubToken, githubData, onRepoChange, onTokenChange, onFetch, onAskYuyu, onClose, T })`

## ⭐ `src/hooks/useAgentSwarm.js` _(84L, salience:13)_
- 🪝 `useAgentSwarm({
  callAI, folder,
  setSwarmRunning, setSwarmLog, setMessages,
  sendNotification, haptic, abortRef,
})`

## ⭐ `src/hooks/useAgentSwarm.test.js` _(78L, salience:13)_

## ⭐ `src/utils.js` _(221L, salience:12)_
- ƒ `countTokens(msgs)`
- ƒ `getFileIcon(name)`
- ƒ `hl(code, lang = '')`
- ƒ `resolvePath(base, p)`
- ƒ `parseActions(text)`
- ƒ `generateDiff(original, patched, maxLines = 40)`
- ƒ `executeAction(action, baseFolder, _callServer = callServer)`

## · `src/api.js` _(220L, salience:10)_
- ƒ `readSSEStream(resp, onChunk, signal)`
- ƒ `askCerebrasStream(messages, model, onChunk, signal, options = {}, _attempt = 0)`
- ƒ `callServer(payload)`
- ƒ `execStream(command, cwd, onLine, signal)`
- ƒ `callServerBatch(payloads)`

## · `src/api.test.js` _(99L, salience:10)_

## · `src/components/VoiceBtn.jsx` _(135L, salience:9)_
- ⚛ `VoiceBtn({ onResult, disabled, T })`
- ⚛ `PushToTalkBtn({ onResult, disabled, T })`

## · `src/hooks/useDevTools.js` _(113L, salience:9)_

## · `src/livepreview.test.js` _(128L, salience:8)_

## · `src/themes/mybrand.js` _(126L, salience:8)_

## · `src/themes/obsidian.js` _(127L, salience:8)_

## · `src/components/ThemeEffects.jsx` _(168L, salience:7)_
- ⚛ `ThemeEffects({ T })`

## · `src/components/panels.agent.jsx` _(316L, salience:7)_
- ⚛ `ElicitationPanel({ data, onSubmit, onDismiss, T })`
- ⚛ `ElapsedTime({ startedAt })`
- ⚛ `BgAgentPanel({ agents, onMerge, onAbort, onClose, T })`
- ƒ `SkillsPanel({ skills, onToggle, onUpload, onRemove, onAdd, onClose, accentColor:_accentColor, T })`

## · `src/components/panels.base.jsx` _(167L, salience:7)_
- ⚛ `BottomSheet({ children, onClose, height='88%', noPad:_noPad=false, T })`

## · `src/components/panels.git.jsx` _(537L, salience:7)_
- ⚛ `GitComparePanel({ folder, onClose, T })`
- ⚛ `FileHistoryPanel({ folder, filePath, onClose, T })`
- ⚛ `GitBlamePanel({ folder, filePath, onClose, T })`
- ⚛ `DepGraphPanel({ depGraph, onClose, T })`
- ⚛ `MergeConflictPanel({ data, folder, onResolved, onAborted, onClose, T })`

## · `src/globalfind.test.js` _(150L, salience:7)_

## · `src/hooks/useGrowth.js` _(162L, salience:7)_
- 🪝 `useGrowth`

## · `src/hooks/useNotifications.test.js` _(152L, salience:7)_

## · `src/themes/aurora.js` _(142L, salience:7)_

## · `src/themes/ink.js` _(134L, salience:7)_

## · `src/themes/neon.js` _(141L, salience:7)_

## · `src/utils.test.js` _(149L, salience:7)_

## · `src/components/LivePreview.jsx` _(211L, salience:6)_
- ⚛ `LivePreview({ tabs, T, onClose })`

## · `src/components/MsgBubble.jsx` _(287L, salience:6)_
- ⚛ `ThinkingBlock({ text, T, live = false })`
- ⚛ `StreamingBubble({ text, T })`
- ƒ `MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix, onDelete, onEdit, T })`

## · `src/editor.bench.js` _(332L, salience:6)_
- 🪝 `useAgentLoop(opts = {})`
- ƒ `buildSystemPrompt(config)`
- ◆ `EFFORT_CONFIG`

## · `src/hooks/useApprovalFlow.js` _(164L, salience:6)_

## · `src/hooks/useChatStore.js` _(217L, salience:6)_
- 🪝 `useChatStore`

## · `src/hooks/useUIStore.js` _(208L, salience:6)_
- 🪝 `useUIStore`

## · `src/components/FileTree.jsx` _(295L, salience:5)_
- ⚛ `FileIcon({ name, size=13 })`
- ⚛ `FileTree({ folder, onSelectFile, selectedFile, T })`

## · `src/components/GlobalFindReplace.jsx` _(248L, salience:5)_
- ⚛ `GlobalFindReplace({ folder, onOpenFile, onClose, T })`

## · `src/components/Terminal.jsx` _(342L, salience:5)_
- ⚛ `TrafficDot({ color, hint, active, cmd, onClick })`
- ⚛ `Terminal({ folder, cmdHistory, addHistory, onSendToAI, T })`

## · `src/editor.test.js` _(188L, salience:5)_

## · `src/features.test.js` _(215L, salience:5)_

## · `src/hooks/useApprovalFlow.test.js` _(211L, salience:5)_

## · `src/hooks/useDevTools.test.js` _(201L, salience:5)_

## · `src/hooks/useFileStore.js` _(260L, salience:5)_
- 🪝 `useFileStore`

## · `src/hooks/useMediaHandlers.test.js` _(201L, salience:5)_

## · `src/hooks/useProjectStore.js` _(238L, salience:5)_
- 🪝 `useProjectStore`

## · `src/uistore.test.js` _(193L, salience:5)_

## · `src/App.jsx` _(329L, salience:4)_
- ⚛ `App`

## · `src/api.extended.test.js` _(254L, salience:4)_

## · `src/components/AppPanels.jsx` _(272L, salience:4)_

## · `src/components/FileEditor.jsx` _(867L, salience:4)_
- ⚛ `Minimap({ viewRef, T })`
- ⚛ `Breadcrumb({ viewRef, T })`
- ◆ `FileEditor`

## · `src/features.extra.test.js` _(272L, salience:4)_

## · `src/hooks/useProjectStore.test.js` _(237L, salience:4)_

## · `src/themes.test.js` _(225L, salience:4)_

## · `src/features.extended.test.js` _(390L, salience:3)_

## · `src/hooks/useChatStore.test.js` _(341L, salience:3)_

## · `src/hooks/useGrowth.test.js` _(286L, salience:3)_

## · `src/multitab.test.js` _(327L, salience:3)_

## · `src/utils.extended.test.js` _(389L, salience:3)_

## · `src/utils.integration.test.js` _(344L, salience:3)_

## · `src/components/AppChat.jsx` _(527L, salience:2)_

## · `src/hooks/useAgentLoop.js` _(725L, salience:2)_
- 🪝 `useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
  growth,
})`

## · `src/hooks/useAgentLoop.test.js` _(525L, salience:2)_

## · `src/hooks/useSlashCommands.js` _(776L, salience:1)_

## · `src/hooks/useSlashCommands.test.js` _(1112L, salience:1)_

## · `yuyu-server.js` _(722L, salience:1)_
