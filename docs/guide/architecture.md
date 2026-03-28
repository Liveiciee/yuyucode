# Architecture

YuyuCode is a React 19 web application running inside a Capacitor 8 Android shell. A local Node.js server — `yuyu-server.js` — provides the filesystem, shell, and WebSocket capabilities that a browser environment cannot.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Android Phone                         │
│                                                             │
│  ┌───────────────────────────────────┐                      │
│  │   YuyuCode (Capacitor WebView)    │                      │
│  │                                   │                      │
│  │  React 19 + Vite 5                │  HTTP :8765          │
│  │  CodeMirror 6                     │◄────────────────┐    │
│  │  xterm.js                         │  WebSocket :8766│    │
│  │  Fuse.js                          │◄────────────────┘    │
│  └───────────────────────────────────┘                      │
│                                                             │
│  ┌───────────────────────────────────┐                      │
│  │   yuyu-server.js (Termux / Node)  │                      │
│  │                                   │                      │
│  │  read · write · patch · exec      │                      │
│  │  tree · search · sqlite · mcp     │                      │
│  │  watch · collab · exec_stream     │                      │
│  └───────────────────────────────────┘                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Cerebras    │  │    Groq      │  (external APIs)       │
│  │  Qwen 3 235B │  │  Kimi K2     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── App.jsx                 # Root — mounts stores, hooks, brightness compensation
├── api.js                  # AI streaming (Cerebras/Groq) + callServer()
├── utils.js                # parseActions, executeAction, generateDiff, resolvePath
├── features.js             # Background agents, skills, sessions, permissions, TF-IDF
├── constants.js            # Models, system prompt, effort config, slash command defs
│
├── components/
│   ├── AppHeader.jsx       # Status bar, model picker, tools
│   ├── AppSidebar.jsx      # File tree sidebar
│   ├── AppChat.jsx         # Main area — tabs, chat, editor, terminal, preview
│   ├── AppPanels.jsx       # All overlay panels (router)
│   ├── FileEditor.jsx      # CodeMirror 6 — all extensions
│   ├── KeyboardRow.jsx     # Extra symbol row above soft keyboard
│   ├── LivePreview.jsx     # iframe srcdoc preview
│   ├── Terminal.jsx        # xterm.js
│   ├── FileTree.jsx        # Fuse.js fuzzy tree
│   ├── MsgBubble.jsx       # Chat renderer + DiffReviewCard
│   ├── OnboardingWizard.jsx# Step-by-step first-run setup (API keys, server ping)
│   ├── ApiKeySettings.jsx  # Runtime API key management panel
│   ├── panels.base.jsx     # BottomSheet, CommandPalette
│   ├── panels.git.jsx      # GitCompare, FileHistory, GitBlame, DepGraph, Merge
│   ├── panels.agent.jsx    # Elicitation, Skills, BgAgent
│   ├── panels.project.jsx  # Project Manager — recent, browse, new
│   └── panels.tools.jsx    # Config, Deploy, MCP, GitHub, Sessions, Permissions
│
├── hooks/
│   ├── useAgentLoop.js     # Core agent loop — the heart of YuyuCode
│   ├── useAgentSwarm.js    # /swarm multi-agent pipeline
│   ├── useApprovalFlow.js  # Diff review approval + reject feedback + rollback
│   ├── useBrightness.js    # Real-time brightness via Capacitor plugin
│   ├── useChatStore.js     # Messages, streaming, memories, checkpoints
│   ├── useDevTools.js      # GitHub, deploy, commit msg, tests, browse
│   ├── useFileStore.js     # Multi-tab EditorState
│   ├── useDb.js            # SQLite persistence (messages, memories, checkpoints)
│   ├── useGrowth.js        # XP, streaks, badges, learned style
│   ├── useMediaHandlers.js # Camera, image attach, drag & drop
│   ├── useNotifications.js # Push, haptic, TTS
│   ├── useProjectStore.js  # Folder, model, effort, permissions, YUYU.md
│   ├── useWakeWord.js      # "Hey Yuyu" wake word — Web Speech API continuous detection
│   ├── useSlashCommands/   # ~68 slash command handlers (modular directory)
│   │   ├── index.js        # Entry point + simple action dispatch
│   │   ├── handlers/       # Per-domain handlers: agent, git, model, review, ui…
│   │   └── helpers/        # Shared: simpleResponse, withLoading, processBatchFile
│   └── useUIStore.js       # All UI state + feature toggles
│
├── themes/
│   ├── obsidian.js         # Default — Obsidian Warm
│   ├── aurora.js
│   ├── ink.js
│   ├── neon.js
│   └── mybrand.js
│
├── runtimeKeys.js          # AES-256-GCM encrypted API key store (PBKDF2 300K iter, 24h expiry)
├── theme.js                # Active theme re-export (points to themes/obsidian.js by default)
│
└── plugins/
    └── brightness.js       # Bridge for @capgo/capacitor-brightness
```

## State Architecture

YuyuCode uses React hooks with `useState` and prop-passing. No Redux, no Zustand. All state lives in `App.jsx` and flows down through props.

Key stores:
- **`useProjectStore`** — folder, model, effort, permissions, YUYU.md, diffReview toggle
- **`useChatStore`** — messages, streaming state, memories, rate limit timer
- **`useFileStore`** — open tabs, EditorState per tab, edit history for `/undo`
- **`useUIStore`** — all panel visibility, editor feature toggles (vim, ghost text, etc.)
- **`useDb`** — SQLite persistence layer; side-effect only hook that initialises the database on mount and migrates data from Preferences on first run
- **`useWakeWord`** — passive Web Speech API listener; fires `onActivated` callback when "Hey Yuyu" (or variants) is detected. Auto-restarts on error or end event.
- **`useAgentLoop`** — no persistent state; pure function that runs the agent loop

## Theme System

Every component reads colour tokens from the active theme object. Zero hardcoded colours in component JSX. Themes export a flat token map (`bg`, `fg`, `accent`, `border`, etc.) consumed via a `T` prop passed top-down.
