# State Architecture

YuyuCode uses React hooks with `useState` and prop-passing throughout. No Redux, no Zustand, no Context API for state. All state lives in `App.jsx` and flows down through props.

## Store Overview

```
App.jsx
├── useUIStore()       → ui
├── useProjectStore()  → project
├── useFileStore()     → file
├── useChatStore()     → chat
└── useGrowth()        → growth
```

All stores are instantiated in `App.jsx`. Every component receives the stores it needs as props. The `T` (theme) prop is derived from `ui.T` and passed everywhere.

---

## useUIStore

UI state and feature toggles. Nothing persisted except editor preferences.

**Key state:**
- All panel visibility flags (`showConfig`, `showMCP`, `showDiff`, etc.)
- Editor feature toggles derived from Capacitor Preferences (`vim`, `ghostText`, `minimap`, etc.)
- `brightnessLevel` — real-time screen brightness (0–1)
- `dragOver`, `deployLog`, `sessionList`
- `T` — active theme object, derived from `themeKey`

**Notable:** The `T` object is computed from `THEMES_MAP[themeKey]` inside the hook. Changing the theme key triggers a single re-render that propagates the new token set to every component.

---

## useProjectStore

Project context, model config, and all server-adjacent settings.

**Key state:**
- `folder` — active project path (persisted as `yc_folder`)
- `model` — active AI model ID (persisted as `yc_model`)
- `effort` — `fast`/`normal`/`deep` (persisted as `yc_effort`)
- `effortCfg` — computed from `EFFORT_CONFIG[effort]` — `maxTokens`, `maxIter`, `systemSuffix`
- `branch` — current git branch (read from server on folder change)
- `diffReview` — toggle for diff review mode (persisted as `yc_diff_review`)
- `permissions` — per-action allow/deny flags
- `hooks` — pre/post write hooks, error hooks
- `skills` — loaded from `.yuyu/skills/`
- `yuyuMd`, `agentsMd` — project rule files
- `notes` — free-form project notes (persisted per folder)
- `agentMemory` — three memory pools: `user`, `project`, `local`
- `mcpTools` — available MCP tools from server
- `githubToken`, `githubRepo` — GitHub integration

**Persistence pattern:**
```javascript
function setFolder(f) {
  setFolderRaw(f);
  Preferences.set({ key: 'yc_folder', value: f });
}
```
Every persisted value has a paired raw setter for in-memory updates and a public setter that also writes to Preferences.

---

## useFileStore

Multi-tab editor state.

**Key state:**
- `tabs` — array of `{ path, label, dirty }`
- `activeTab` — `'chat'` or file path
- `selectedFile`, `fileContent` — currently open file
- `editorStates` — Map of path → CodeMirror `EditorState`
- `splitView` — boolean
- `pinnedFiles` — paths always injected into agent context
- `editHistory` — last 10 file backups for `/undo`
- `cmdHistory` — terminal command history

**Tab switching:**
```javascript
// view.setState() — no remount, preserves cursor + undo history
view.setState(editorStates.get(newPath));
```

---

## useChatStore

Message state and all chat-adjacent data.

**Key state:**
- `messages` — full conversation history
- `loading`, `streaming`, `agentRunning` — agent loop status
- `agentStatus` — current iteration label shown in UI
- `gracefulStop` — finish current iter then halt
- `memories` — auto-extracted facts (persisted as `yc_memories`)
- `checkpoints` — conversation snapshots (persisted as `yc_checkpoints`)
- `visionImage` — base64 image for vision calls
- `slashSuggestions` — current slash command autocomplete options
- `rateLimitTimer` — countdown for rate limit display
- `ttsEnabled` — text-to-speech toggle
- `swarmRunning`, `swarmLog` — swarm pipeline state

**Message persistence:**
Messages are persisted to `yc_history` on every change (last N messages, role + content only — actions stripped).

---

## Hook Dependencies

`App.jsx` wires all hooks together. The dependency graph:

```
useAgentLoop
  ├── needs: project, chat, file, ui, growth
  ├── needs: sendNotification, haptic, speakText (from useNotifications)
  └── needs: handleSlashCommandRef (ref to slash handler)

useApprovalFlow
  ├── needs: chat.messages, chat.setMessages
  ├── needs: project.folder, project.hooks, project.permissions
  ├── needs: file.editHistory, file.setEditHistory
  └── needs: sendMsgRef → { current: sendMsg } from useAgentLoop

useSlashCommands
  ├── needs: almost everything from all stores
  ├── needs: sendMsg, compactContext, callAI from useAgentLoop
  ├── needs: runAgentSwarm from useAgentSwarm
  └── needs: runTests, browseTo, generateCommitMsg from useDevTools
```

`handleSlashCommandRef` is a ref (not a prop) because `useSlashCommands` depends on `sendMsg` which is defined in `useAgentLoop`. This breaks the circular dependency: `useAgentLoop` holds a ref, `useSlashCommands` sets the ref via `useEffect` in `App.jsx`.

---

## Persistence Keys Reference

All Capacitor Preferences keys used across the app:

| Key | Store | Content |
|-----|-------|---------|
| `yc_folder` | project | Active project path |
| `yc_model` | project | Active model ID |
| `yc_effort` | project | Effort level |
| `yc_diff_review` | project | Diff review toggle |
| `yc_notes_<folder>` | project | Notes per project |
| `yc_gh_token` | project | GitHub token |
| `yc_gh_repo` | project | GitHub repo |
| `yc_history` | chat | Last N messages |
| `yc_memories` | chat | Auto-extracted memories |
| `yc_checkpoints` | chat | Conversation checkpoints |
| `yc_xp` | growth | Total XP |
| `yc_streak` | growth | Streak count |
| `yc_last_active` | growth | Last active date |
| `yc_badges` | growth | Earned badge IDs |
| `yc_learned_style` | growth | Style bullet points |
| `yc_vim` | ui | Vim mode toggle |
| `yc_ghosttext` | ui | Ghost text toggle |
| `yc_minimap` | ui | Minimap toggle |
| `yc_lint` | ui | Inline lint toggle |
| `yc_tslsp` | ui | TypeScript LSP toggle |
| `yc_blame` | ui | Inline blame toggle |
| `yc_multicursor` | ui | Multi-cursor toggle |
| `yc_stickyscroll` | ui | Sticky scroll toggle |
| `yc_collab` | ui | Collaboration toggle |
| `yc_theme` | ui | Active theme key |
| `yc_session_color` | project | Session accent colour |
