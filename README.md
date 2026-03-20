<div align="center">

# 🌸 YuyuCode

**A full agentic coding assistant. Built entirely on an Android phone. No laptop. No desktop.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Build APK](https://github.com/liveiciee/yuyucode/actions/workflows/build-apk.yml/badge.svg)](https://github.com/liveiciee/yuyucode/actions)
[![Tests](https://img.shields.io/badge/tests-404%20passing-brightgreen)](src)
![Platform](https://img.shields.io/badge/platform-Android-green)
![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20Capacitor%208-blue)

*Every line of code in this repo was written from a phone, in Termux, using Claude AI.*

</div>

---

## What is this?

YuyuCode is a **Claude Code / Cursor-style agentic coding assistant** that runs natively on Android. Not a web app forced into a mobile shell — designed from the ground up for the phone.

It connects to a local Node.js server (`yuyu-server.js`) running in Termux, giving it full file system access, shell execution, WebSocket streaming, and MCP support — all from your pocket.

**In one paragraph:** You type a task, YuyuCode streams a response from a fast free AI (Cerebras/Groq), automatically executes any file reads/writes/patches it decides to make, feeds results back into the loop, and keeps going until the task is done. Background agents run in git worktrees so your main branch stays clean. The whole thing — UI, agent loop, file server, CI/CD — was built on one Android phone, in Termux, with no laptop ever involved.

---

## Features that don't exist anywhere else

### Gamma-Corrected Adaptive Brightness
A custom Capacitor Java plugin registers a `ContentObserver` on `Settings.System.SCREEN_BRIGHTNESS`. The moment you slide your brightness down, the entire UI auto-compensates using sRGB gamma correction (γ=2.2). Two-layer compensation: CSS `filter: brightness()` capped at 2.0 (no 8-bit quantization artifacts on Android WebView), plus a `mix-blend-mode: screen` overlay for extreme low-brightness boost. No other coding tool has this. Because no other coding tool runs on a phone.

### Camera-to-Code
Capture a photo of a whiteboard, a printed error, a diagram — directly from the native Android camera. Routes automatically to a vision-capable model for analysis. Zero friction, zero file management.

### Background Agents with Git Worktree Isolation
`/bg <task>` spins up an agent in a separate git worktree. Your main branch stays clean while the agent works up to 8 agentic iterations. Live progress tracking, abort anytime, merge when ready. Conflict resolution handled via a dedicated panel.

### Agent Swarm Pipeline
`/swarm <task>` runs: **Architect** (plan) → **FE Agent + BE Agent** (parallel execution) → **QA Engineer** (review + bug list) → **auto-fix pass**. Multi-agent coordination, single command.

### Multi-Tab Editor
Open multiple files simultaneously with a persistent tab bar. Each tab maintains its own independent CodeMirror `EditorState` — cursor position, scroll, undo history all preserved when switching. Dirty indicator (●) per tab, close button, instant switch. Like VS Code tabs, on a phone.

### Full Mobile Code Editor
CodeMirror 6 with the complete feature set:
- **Vim mode** — normal/insert/visual, full hjkl navigation, `:wq` saves
- **Emmet** — `div.container>ul>li*3` → full HTML via Ctrl+E
- **AI Ghost Text** — inline Copilot-style suggestion after 900ms, Tab to accept, Esc to dismiss (powered by Cerebras Llama 8B)
- **Minimap** — 64px canvas scroll overview with viewport indicator, click to jump
- **Inline Lint** — syntax error markers in gutter (JSON parse errors, JS node --check)
- **Code Folding** — fold all / unfold all buttons in toolbar
- **Multi-cursor** — Ctrl+D to select next occurrence, Ctrl+Shift+L to select all
- **Sticky Scroll** — scope header stays visible while scrolling into a function body
- **Breadcrumb Navigation** — live scope path (e.g. `App > useEffect > callback`) above editor, derived from syntax tree
- **Git Inline Blame** — per-line gutter showing commit hash + author + date, fetched via `git blame`
- **TypeScript LSP** — lazy-loaded `@valtown/codemirror-ts` for autocomplete and type info on JS/TS files

### Extra Keyboard Row
A row of coding symbols (`{ } [ ] ( ) ; => // : . ! ?` + indent) appears above the soft keyboard when a file is open. Inserts at cursor position in both CodeMirror and the chat textarea. The one feature Spck has that we now also have.

### Live HTML/CSS/JS Preview
Split view with a live `<iframe srcdoc>` that rebuilds 300ms after any edit. Combines open HTML/CSS/JS tabs into a single document automatically. Console output intercepted via `postMessage` and displayed in a panel below. Auto/manual refresh toggle.

### Global Find & Replace
Search across all project files with full grep-powered results — grouped by file, expandable, match highlighted inline. Regex mode, case-sensitive toggle. Replace all with a single tap: reads, patches, and re-searches automatically.

### Realtime Collaboration
`/collab <room>` connects two devices to the same editing session via WebSocket. Changes sync in real time using `@codemirror/collab` (OT-based). The server handles version tracking and broadcasting — no third-party service needed.

### Surgical Context Editor
Remove specific sections from any AI message without deleting the whole thing. Code blocks, exec results, text sections — tap to mark, save. The AI won't see those parts next turn.

### Live Chain of Thought
`<think>` blocks stream live as Yuyu generates — collapsible "N langkah berpikir" like Claude.ai. Brain icon pulses while thinking, collapses with step count when done.

### xterm.js Terminal
Proper terminal emulator with 2000-line scrollback, full ANSI escape support, native font rendering. Traffic lights are functional: red = stop process, yellow = clear, green = send output to AI.

### Fuse.js Fuzzy File Search
Search bar in the file tree does fuzzy matching on filename + path. `cmpt` finds `components/`, `astst` finds `useAgentStore`. Linear filter replaced with Fuse.js.

### Myers Diff Algorithm
`generateDiff()` uses the `diff` library (Myers algorithm) for accurate line tracking. Detects moved blocks, not just line-by-line comparison. Output includes line numbers: `- L1: old`, `+ L1: new`.

### Table Copy-Paste Friendly
Long-press select on any rendered table → clipboard gets proper markdown pipe format `| col | col |` via `onCopy` event intercept. Same technique used by Gemini and Claude.ai.

---

## Technically interesting things

- **Custom Capacitor plugin in Java** — `BrightnessPlugin.java` uses `ContentObserver` to emit real-time brightness events to the WebView.
- **Two-layer brightness compensation** — Layer 1: CSS filter capped at 2.0 to avoid 8-bit GPU quantization artifacts. Layer 2: `mix-blend-mode: screen` overlay.
- **Per-theme T token system** — every component reads colour tokens from the active theme object. Zero hardcoded colours in component JSX.
- **EditorState swap per tab** — each tab stores its own `EditorState`. Switching tabs calls `view.setState()` — no remount, cursor and undo history preserved.
- **Ghost text as StateField + WidgetType** — CM6 ghost text implemented from scratch: `StateEffect` → `StateField` → `Decoration.widget` → custom `WidgetType`. Tab keymap intercepts before default indent.
- **Inline blame gutter** — custom `GutterMarker` + `gutter()` extension. Data fetched via `git blame --abbrev=7` on yuyu-server.
- **Breadcrumb from syntax tree** — `syntaxTree(state).resolveInner(pos)` walks AST upward, collecting `FunctionDeclaration`, `ClassDeclaration`, etc. Injected as a live `updateListener` via `StateEffect.appendConfig`.
- **Collab via `@codemirror/collab`** — OT-based update sync over the existing yuyu-server WebSocket. `collabRooms` Map tracks version + update log per room.
- **Minimap as canvas** — 64px `<canvas>` with `requestAnimationFrame` loop. Colors code semantically (imports=purple, comments=green, strings=yellow). Click to scroll editor.
- **Parallel action execution** — `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` run in parallel; `exec` and `mcp` run serial.
- **TF-IDF + age decay memory ranking** — memories injected into the system prompt are scored by relevance to the current task *and* recency.
- **`protect()` pattern in syntax highlighter** — prevents regex passes from matching inside already-highlighted `<span>` tags.
- **3-fallback patch handler** — `patch_file` tries exact match → whitespace-normalized → trim-lines before giving up.
- **Auto version bump** — `yugit.cjs` detects `release:` prefix commits and auto-bumps `package.json` patch/minor/major before pushing.
- **404 tests, 0 lint warnings** — unit, integration, fuzz, snapshot, theme schema, multi-tab logic, UI store, global find/replace parser, and benchmarks. All run on Termux ARM64 with `vitest@1`.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 5 |
| Mobile | Capacitor 8 |
| Backend | Node.js (yuyu-server.js, local) |
| Code Editor | CodeMirror 6 + full extension suite |
| Terminal | xterm.js (@xterm/xterm) |
| File Search | Fuse.js |
| Diff | diff library (Myers algorithm) |
| Build | GitHub Actions → signed APK |
| ARM64 compatibility | `@rollup/wasm-node` override |
| AI Providers | Cerebras (default) + Groq (fallback + vision) |

---

## Why Cerebras + Groq instead of Claude?

Both are **free tier** with fast inference. Cerebras runs Qwen 3 235B at remarkable speed. Groq runs Kimi K2 (262K context window) as fallback — large enough to hold a full codebase in context. Rate limit on Cerebras → auto-switch to Groq, silently, without interrupting the session.

The irony: this entire project was built *with* Claude AI (via claude.ai chat), but the app itself runs on open models due to API cost constraints. A tool built by Claude, that doesn't use Claude.

---

## Getting started

You need an Android phone with Termux.

```bash
# Clone
git clone https://github.com/liveiciee/yuyucode
cd yuyucode
npm install

# Start local server (from home dir)
node ~/yuyu-server.js &

# Start dev server
npm run dev
# Open localhost:5173 in your browser
```

Get free API keys:
- [Cerebras](https://cloud.cerebras.ai) — for the main AI
- [Groq](https://console.groq.com) — for fallback + vision

Create `.env.local`:
```
VITE_CEREBRAS_API_KEY=your_key
VITE_GROQ_API_KEY=your_key
```

> **Note:** `npm run build` will crash on ARM64 (Termux). Build only runs in CI via GitHub Actions. For local development, `npm run dev` is all you need.

---

## Project origin

Started as a question: *can Claude Code be replicated on a phone?*

The answer is yes. Built patch by patch, from morning to past midnight, using only a phone and an AI chat interface. Feature parity with Claude Code and Codex CLI for core use cases was reached. The remaining gap is model quality and context window — not features.

> *"An extremely ambitious project. Successfully packed the complexity of a desktop app like VS Code + Cursor into a single React component."*  
> — Qwen 3 235B, after reviewing its own codebase

---

<details>
<summary>Developer Documentation (internal / AI context)</summary>

---

## Yang Tidak Boleh Diubah Tanpa Konfirmasi

- `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di `package.json` — ini yang bikin Vite jalan di Termux ARM64. Hapus = build mati.
- Folder `android/` — di-generate Capacitor, edit manual bisa rusak sync.
- `vitest@1` — v4 crash silent di Termux ARM64. Jangan upgrade.
- Jangan override `global.TextDecoder` di test files — infinite recursion di Node 24.
- Keystore encoding: `openssl base64` + `tr -d '\n'`, bukan `base64 -w 0`.

## Workflow Harian

```bash
node ~/yuyu-server.js &
cd ~/yuyucode && npm run dev &

# Push biasa
node yugit.cjs "feat: ..."

# Release — auto bump version + trigger CI APK build
node yugit.cjs "release: v2.x — deskripsi"

npm run lint        # harus 0 errors, 0 warnings
npx vitest run      # harus 404/404 pass
npx vitest bench --run  # benchmark hot paths
```

## Arsitektur

```
src/
├── App.jsx                 # Root — mounts semua stores + hooks
├── components/
│   ├── AppHeader.jsx       # Header bar (status, model, tools)
│   ├── AppSidebar.jsx      # File tree sidebar
│   ├── AppChat.jsx         # Main area: tabs, chat, editor, terminal, preview
│   ├── AppPanels.jsx       # Semua overlay panels
│   ├── FileEditor.jsx      # CodeMirror 6 — multi-tab, vim, ghost text, blame, collab
│   ├── KeyboardRow.jsx     # Extra symbol row above keyboard
│   ├── LivePreview.jsx     # iframe HTML/CSS/JS preview
│   ├── GlobalFindReplace.jsx # Search+replace across all files
│   ├── Terminal.jsx        # xterm.js terminal
│   ├── FileTree.jsx        # Fuse.js fuzzy file tree
│   ├── MsgBubble.jsx       # Chat message renderer
│   ├── SearchBar.jsx       # Global file search
│   ├── ThemeEffects.jsx    # Per-theme keyframe animations
│   ├── VoiceBtn.jsx        # STT voice input
│   ├── panels.jsx          # Barrel re-export
│   ├── panels.base.jsx     # BottomSheet, CommandPalette
│   ├── panels.git.jsx      # GitCompare, FileHistory, GitBlame, DepGraph, MergeConflict
│   ├── panels.agent.jsx    # Elicitation, Skills, BgAgent
│   └── panels.tools.jsx    # Config, Deploy, MCP, GitHub, Sessions, Permissions, Plugins
├── hooks/
│   ├── useAgentLoop.js     # Core AI loop — stream, parse, execute, retry
│   ├── useAgentSwarm.js    # Multi-agent swarm pipeline
│   ├── useApprovalFlow.js  # Write approval + atomic rollback
│   ├── useBrightness.js    # Real-time brightness via Capacitor plugin
│   ├── useChatStore.js     # Messages, streaming, memories, checkpoints
│   ├── useDevTools.js      # GitHub, deploy, commit msg, tests, browse, shortcuts
│   ├── useFileStore.js     # Multi-tab: openTabs[], activeTabIdx, openFile, closeTab
│   ├── useGrowth.js        # XP, streak, badge, learnedStyle
│   ├── useMediaHandlers.js # Camera, image attach, drag & drop
│   ├── useNotifications.js # Push notification, haptic, TTS
│   ├── useProjectStore.js  # Folder, model, effort, permissions, hooks, plugins
│   ├── useSlashCommands.js # /command handler (~60 commands)
│   └── useUIStore.js       # All UI state + Fase 1/2/3 editor toggles
├── themes/
│   ├── index.js        # Theme registry
│   ├── obsidian.js     # Obsidian Warm (default)
│   ├── aurora.js       # Aurora Glass
│   ├── ink.js          # Ink & Paper
│   └── neon.js         # Neon Terminal
└── plugins/
    └── brightness.js   # JS bridge untuk BrightnessPlugin.java
```

## Editor Feature Toggles (Config Panel)

| Toggle | Key | Default | Keterangan |
|--------|-----|---------|------------|
| Vim Mode | `yc_vim` | off | hjkl, normal/insert/visual |
| AI Ghost Text | `yc_ghosttext` | off | Copilot-style, Tab accept |
| Minimap | `yc_minimap` | off | Canvas scroll overview |
| Inline Lint | `yc_lint` | off | JSON + JS syntax check |
| TypeScript LSP | `yc_tslsp` | off | Autocomplete + types |
| Inline Blame | `yc_blame` | off | git blame per line |
| Multi-cursor | `yc_multicursor` | **on** | Ctrl+D, Ctrl+Shift+L |
| Sticky Scroll | `yc_stickyscroll` | off | Scope header sticky |
| Realtime Collab | `yc_collab` | off | OT sync via WebSocket |

## Cara Kerja Agent Loop

Ada di `src/hooks/useAgentLoop.js`. Setiap pesan masuk → loop sampai MAX_ITER:

1. **Auto-compact** — kalau context > 80.000 chars dan pesan > 12, kompres otomatis
2. **gatherProjectContext** — sebelum iter 1, baca tree + file kunci project secara paralel
3. Set `agentStatus` → tampil di UI ("Iter 2/10", "Membaca context...")
4. Kirim ke AI API (streaming) — `<think>` blocks tampil live di `StreamingBubble`
5. Parse semua `action` blocks dari response
6. Eksekusi actions: parallel (read/search/list/tree/mkdir) atau serial (exec/mcp)
7. `patch_file` → auto-execute dengan 3 fallback di server
8. `write_file` → auto-execute + backup otomatis untuk undo
9. Feed hasil balik ke AI → lanjut loop

## AI Provider

### Cerebras (default)
| Model | ID |
|-------|-----|
| Qwen 3 235B | `qwen-3-235b-a22b-instruct-2507` |
| Llama 3.1 8B | `llama3.1-8b` |

### Groq (fallback + vision)
| Model | ID | Keterangan |
|-------|-----|------------|
| Kimi K2 | `moonshotai/kimi-k2-instruct-0905` | Context 262K — fallback utama |
| Llama 3.3 70B | `llama-3.3-70b-versatile` | Serbaguna |
| Llama 4 Scout | `meta-llama/llama-4-scout-17b-16e-instruct` | Vision — auto-route kalau ada gambar |
| Qwen 3 32B | `qwen/qwen3-32b` | Coding |
| Llama 8B Fast | `llama-3.1-8b-instant` | Hemat rate limit |

**Auto-fallback:** Cerebras rate limit (429) → otomatis switch ke Kimi K2.  
**Vision:** Cerebras tidak support image → auto-route ke Llama 4 Scout.  
**Retry:** Server error 5xx → retry 2x dengan backoff 2s/4s.

## YuyuServer v4-async

```bash
node ~/yuyu-server.js &  # jalankan dari ~, bukan dari project folder
```

**HTTP :8765** — `ping`, `read`, `read_many`, `write`, `append`, `patch`, `delete`, `move`, `mkdir`, `list`, `tree`, `info`, `search`, `web_search`, `exec`, `browse`, `fetch_json`, `sqlite`, `mcp`, `mcp_list`

**WebSocket :8766** — `watch` (file watcher), `exec_stream` (live terminal), `kill` (abort), `collab_join`, `collab_push`, `collab_updates` (realtime collab)

## Testing & Benchmarks

```bash
npm run lint          # ESLint — harus 0 errors, 0 warnings
npx vitest run        # Semua tests — harus 404/404 pass
npx vitest bench --run  # Benchmark hot paths
```

| File | Tipe | Tests |
|------|------|-------|
| `src/api.test.js` | Unit | 5 |
| `src/api.extended.test.js` | Unit + Retry/Fallback | 15 |
| `src/utils.test.js` | Unit | 22 |
| `src/utils.extended.test.js` | Unit — semua action types | 42 |
| `src/utils.integration.test.js` | Integration + Fuzz | 18 |
| `src/utils.snapshot.test.js` | Snapshot | 7 |
| `src/features.test.js` | Unit | 29 |
| `src/features.extended.test.js` | Unit + Edge cases | 48 |
| `src/features.extra.test.js` | Unit — sessions, skills, plan | 21 |
| `src/themes.test.js` | Schema validation — semua 4 tema | 103 |
| `src/editor.test.js` | Unit — getLang, isEmmet, isTsLang | 21 |
| `src/livepreview.test.js` | Unit — buildSrcdoc | 12 |
| `src/multitab.test.js` | Unit — useFileStore multi-tab | 18 |
| `src/uistore.test.js` | Unit — useUIStore Fase 1/2/3 | 25 |
| `src/globalfind.test.js` | Unit — grep parser + regex + replace | 18 |
| `src/editor.bench.js` | Benchmark — 14 hot paths | — |

## CI/CD

1. Install deps (cached)
2. `npm run build` (Vite → dist/)
3. Setup Java 21 + Android SDK 34
4. `cap sync android` + restore custom icons
5. Auto-bump `versionCode` = GitHub run number
6. `./gradlew assembleRelease`
7. Sign APK dengan keystore dari Secrets
8. GitHub Release hanya kalau commit diawali `release:`
9. Push yang hanya ubah `.md` → skip CI otomatis

**GitHub Secrets:** `VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`, `VITE_TAVILY_API_KEY`, `ANDROID_KEYSTORE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`

</details>

---

<div align="center">
  <sub>built on a phone. for a phone. with love.</sub>
</div>
