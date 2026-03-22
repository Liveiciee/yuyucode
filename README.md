<div align="center">

<img src="public/banner.svg" width="880" alt="YuyuCode — A full agentic coding assistant, built entirely on an Android phone." />

<br/>

[![Build APK](https://github.com/liveiciee/yuyucode/actions/workflows/build-apk.yml/badge.svg)](https://github.com/liveiciee/yuyucode/actions)
[![Quality Gate](https://github.com/liveiciee/yuyucode/actions/workflows/quality.yml/badge.svg)](https://github.com/liveiciee/yuyucode/actions)
[![CodeQL · SAST](https://github.com/liveiciee/yuyucode/actions/workflows/codeql.yml/badge.svg)](https://github.com/liveiciee/yuyucode/actions)
[![Benchmark](https://github.com/liveiciee/yuyucode/actions/workflows/bench.yml/badge.svg)](https://liveiciee.github.io/yuyucode/dev/bench/)
[![SonarCloud](https://sonarcloud.io/api/project_badges/measure?project=Liveiciee_yuyucode&metric=alert_status)](https://sonarcloud.io/project/overview?id=Liveiciee_yuyucode)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Liveiciee_yuyucode&metric=coverage)](https://sonarcloud.io/project/overview?id=Liveiciee_yuyucode)

<br/>

> *Every line of code in this repo was written from a phone, in Termux, using Claude AI.*
> *No laptop. No desktop. Ever.*

</div>

---

## Table of Contents

- [Status](#status)
- [What is this?](#what-is-this)
- [Demo](#demo)
- [Features that don't exist anywhere else](#features-that-dont-exist-anywhere-else)
- [Technically interesting things](#technically-interesting-things)
- [Testing & Benchmarks](#testing--benchmarks)
- [Stack](#stack)
- [Why Cerebras + Groq instead of Claude?](#why-cerebras--groq-instead-of-claude)
- [Getting started](#getting-started)
- [Known limitations](#known-limitations)
- [Project origin](#project-origin)
- [Acknowledgements](#acknowledgements)
- [Developer Documentation](#developer-documentation-internal--ai-context)

---

## Status

> **v4.2.0** — Personal tool. Works on one phone — mine. Not production software. Tested on one device (Oppo A77s, Snapdragon 680, Android 14). No contributions expected, though issues are welcome. Use at your own risk.

---

## What is this?

YuyuCode is a **Claude Code / Cursor-style agentic coding assistant** that runs natively on Android. Not a web app forced into a mobile shell — designed from the ground up for the phone.

It connects to a local Node.js server (`yuyu-server.js`) running in Termux, giving it full filesystem access, shell execution, WebSocket streaming, and MCP support — all from your pocket.

**In one sentence:** You type a task → YuyuCode streams a response, automatically executes file reads/writes/patches, feeds results back into the loop, and keeps going until the task is done. Background agents run in isolated git worktrees so your main branch stays clean the whole time.

---

## Demo

> 📸 *Screenshots and GIF demos coming soon — drop a ⭐ to get notified*

---

## Features that don't exist anywhere else

### 🔆 Perceptual Brightness Compensation
A native Capacitor plugin streams real-time brightness values from `Settings.System.SCREEN_BRIGHTNESS` via `ContentObserver`. Below 25% screen brightness, the UI compensates using **Weber-Fechner perceptual scaling** — humans perceive brightness logarithmically, so linear boosts feel wrong. The compensation applies a gentle `brightness(1.0–1.4×)` + slight desaturation to counteract the warm-orange shift CSS `brightness()` introduces. A frosted overlay (`backdrop-filter: blur`) adds depth at extreme low-light. Zero processing above 25% — no visible effect in normal use.

### 📷 Camera-to-Code
Capture a photo of a whiteboard, a printed error, a diagram — directly from the native Android camera. Routes automatically to a vision-capable model. Zero friction, zero file management.

### 🤖 Background Agents with Git Worktree Isolation
`/bg <task>` spins up an agent in a separate git worktree. Your main branch stays clean while the agent works up to 8 agentic iterations. Live progress tracking, abort anytime, merge when ready.

### 🐝 Agent Swarm Pipeline
`/swarm <task>` runs: **Architect** → **FE Agent + BE Agent** (parallel) → **QA Engineer** → **auto-fix pass**. Multi-agent coordination, single command.

### 📋 YUYU.md — Persistent Project Rules
Drop a `YUYU.md` in your project root — Yuyu reads it every session, before every agent loop. Define coding standards, architecture decisions, forbidden patterns, preferred libraries. `/rules add "..."` to append from chat. `/rules init` to auto-generate one from your codebase.

### 🔍 Visual Diff Review
Toggle **Diff Review** in `/config` — agent pauses before applying any `patch_file` or `write_file`. Each pending change shows a colour-coded diff (green adds, red removes) inline in chat. Accept per-file or all at once. Reject sends the reason back to the agent — it self-corrects and tries again. Approving resumes the loop automatically.

### 🗂️ Multi-Tab Editor
Each tab maintains its own independent CodeMirror `EditorState` — cursor position, scroll, undo history all preserved on switch. Dirty indicator (●) per tab. Like VS Code tabs, on a phone.

### ✏️ Full Mobile Code Editor

CodeMirror 6 with a complete extension suite:

| Feature | Details |
|---|---|
| **Vim mode** | normal/insert/visual, full `hjkl`, `:wq` saves |
| **Emmet** | `div.container>ul>li*3` → HTML via Ctrl+E |
| **AI Ghost Text L1+L2** | L1: next line 300ms (Tab) · L2: 2–3 lines 900ms (Tab+Tab), distinct colour |
| **Minimap** | 64px canvas overview, semantic colors, click to jump |
| **Inline Lint** | Syntax error gutter markers (JSON + JS) |
| **Code Folding** | Fold all / unfold all |
| **Multi-cursor** | Ctrl+D next occurrence, Ctrl+Shift+L select all |
| **Sticky Scroll** | Scope header stays visible while scrolling into a function |
| **Breadcrumb** | Live scope path — `App > useEffect > callback` — derived from syntax tree |
| **Git Inline Blame** | Per-line gutter: commit hash + author + date via `git blame` |
| **TypeScript LSP** | `@valtown/codemirror-ts` autocomplete + type info on JS/TS |

### ⌨️ Extra Keyboard Row
A row of coding symbols (`{ } [ ] ( ) ; => // : . ! ?` + indent) above the soft keyboard. Inserts at cursor in both CodeMirror and the chat textarea.

### 👁️ Live HTML/CSS/JS Preview
Split view with a live `<iframe srcdoc>` that rebuilds 300ms after any edit. Auto-combines open HTML/CSS/JS tabs. Console output intercepted via `postMessage` and shown inline.

### 🔍 Global Find & Replace
Grep across all project files — grouped by file, expandable, match highlighted. Regex mode, case-sensitive toggle. Replace all: reads, patches, re-searches automatically.

### 📌 Pinned Context Files
`/pin src/api.js` — file always injected into every agent loop. `/unpin` to release.

### 🔍 Chat Search
`/search <query>` — search across full chat history. Click result → scroll to message.

### ⏸ Graceful Stop
⏸ button during agent loop — finishes current iteration cleanly before stopping. Different from ■ hard abort.

### ↩ Global Undo
`/undo` or `/undo 3` — roll back N last file edits made by the agent.

### 🤖 One-shot Model Override
`/ask kimi review this` — query a specific model once without changing the default. Aliases: `kimi`, `llama`, `llama8b`, `qwen`, `scout`, `qwen235`.

### 🤝 Realtime Collaboration
`/collab <room>` connects two devices to the same editing session via WebSocket. OT-based sync using `@codemirror/collab`. No third-party service needed.

### 🧠 Surgical Context Editor
Remove specific sections from any AI message without deleting the whole thing. Code blocks, exec results, text — tap to mark, save. The AI won't see those parts next turn.

### 💭 Live Chain of Thought
`<think>` blocks stream live — collapsible "N langkah berpikir". Brain icon pulses while thinking, collapses with step count when done.

### 💻 xterm.js Terminal
Full terminal emulator: 2000-line scrollback, ANSI escape support. Traffic lights are functional: red = kill process, yellow = clear, green = send output to AI.

### 🔎 Fuse.js Fuzzy File Search
`cmpt` finds `components/`, `astst` finds `useAgentStore`. Full fuzzy match on filename + path.

### 📝 /review --all
`/review --all` reads all files changed vs HEAD (up to 8) and runs a structured PR-level review — missing error handling, security issues, missing tests, performance flags — with severity per finding (🔴 High / 🟡 Medium / 🟢 Low).

---

## Technically interesting things

- **Perceptual brightness compensation** — `ContentObserver` streams brightness changes from native Android. Below 25%, applies Weber-Fechner-scaled `brightness(1.0–1.4×)` + desaturation (-18%) via CSS filter. Frosted `backdrop-filter: blur` overlay for extreme low-light depth. Zero cost above 25%.
- **Per-theme token system** — every component reads colour tokens from the active theme object; zero hardcoded colours in component JSX
- **EditorState swap per tab** — `view.setState()` on tab switch, no remount, cursor and undo history fully preserved
- **Two-level ghost text** — L1: `StateField` + 300ms debounce, Llama 8B, next-line. L2: `ghostL2Field` + 900ms, 2–3 line lookahead, dimmer colour. Tab accepts L1; double-Tab (< 400ms gap) accepts L2 via timestamp delta.
- **Diff review intercept** — `diffReview` ON → agent pre-computes `generateDiff()` on all write/patch actions, marks them `pending`, pushes to chat, `return`s — loop pauses. `useApprovalFlow.handleApprove()` resumes via `sendMsgRef`. Reject sends AI feedback; agent self-corrects without full restart.
- **YUYU.md context injection** — loaded in `gatherProjectContext()` each session, injected into `buildSystemPrompt()` after AGENTS.md. State synced via `project.setYuyuMd()` so mid-session edits take effect next iteration.
- **Inline blame gutter** — custom `GutterMarker` + `gutter()` extension; data from `git blame --abbrev=7` via yuyu-server
- **Breadcrumb from syntax tree** — `syntaxTree(state).resolveInner(pos)` walks AST upward collecting `FunctionDeclaration`, `ClassDeclaration`, etc.
- **Collab via `@codemirror/collab`** — OT-based update sync over yuyu-server WebSocket; `collabRooms` Map tracks version + update log per room
- **Minimap as canvas** — 64px `<canvas>` with `requestAnimationFrame`; colors code semantically (imports=purple, comments=green, strings=yellow)
- **D3 dependency graph** — `DepGraphPanel` renders a force-directed graph of inter-file imports using d3 v7; supports both `{nodes, edges}` and legacy `{file, imports}` format
- **Parallel action execution** — `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` run in parallel; `exec` and `mcp` serial
- **TF-IDF + age decay memory ranking** — memories scored by relevance + recency (14-day linear decay). Mini-RAG pipeline, fully client-side, no vector DB.
- **`protect()` pattern in syntax highlighter** — prevents regex passes from matching inside already-highlighted `<span>` tags
- **3-fallback patch handler** — `patch_file` tries exact match → whitespace-normalized → trim-lines before giving up
- **Myers diff** — `generateDiff()` uses the `diff` library for accurate line tracking; includes line numbers
- **Batch server action** — `{ type: 'batch', actions: [...] }` runs multiple ops in one HTTP request; reduces agent loop roundtrips
- **Incremental codebase map** — `yuyu-map.cjs` runs `git diff --name-only HEAD` before scanning; only changed files re-analyzed
- **Benchmark regression detector** — `yuyu-bench.cjs` stores results in `.yuyu/bench-history.json`; flags 2× regressions vs baseline
- **Property-based test coverage** — `parseActions` and `resolvePath` fuzz-tested with 100 random inputs each via `fast-check`
- **`resolvePath` basename dedup fix** — fixed silent bug where paths like `myproject/src/App.js` would double-prefix to `/project/myproject/src/App.js` instead of `/project/src/App.js` when base ends with the project name
- **Branch coverage infrastructure** — 363 new tests systematically targeting SonarCloud condition branches across all core hooks; discovered `isolate: false` module-cache issue in Termux vitest causing false test failures
- **Auto version bump** — `yugit.cjs` detects `release: vX.Y` commits, sets `package.json` version, triggers CI APK build. Supports `--no-push`, `--amend`, `--hash` revert, scopes, breaking changes, `--push`, `--squash N`, `--status`.

---

## Testing & Benchmarks

```
1031 tests passing. 0 lint warnings. Runs on Termux ARM64.
50 of which are property-based (fast-check, 100 random inputs each).
363 of which are branch coverage tests added in v4.2 (condition/branch coverage for SonarCloud).
```

| File | Type | Tests |
|------|------|-------|
| `api.test.js` | Unit | 5 |
| `api.extended.test.js` | Unit + Retry/Fallback | 15 |
| `utils.test.js` | Unit | 22 |
| `utils.extended.test.js` | Unit — all action types | 42 |
| `utils.integration.test.js` | Integration + Fuzz | 38 |
| `utils.snapshot.test.js` | Snapshot | 7 |
| `features.test.js` | Unit | 29 |
| `features.extended.test.js` | Unit + Edge cases | 48 |
| `features.extra.test.js` | Unit — sessions, skills, plan | 21 |
| `themes.test.js` | Schema validation — all 4 themes | 103 |
| `editor.test.js` | Unit — getLang, isEmmet, isTsLang | 21 |
| `livepreview.test.js` | Unit — buildSrcdoc | 12 |
| `multitab.test.js` | Unit — useFileStore multi-tab | 18 |
| `uistore.test.js` | Unit — useUIStore | 26 |
| `globalfind.test.js` | Unit — grep parser + regex + replace | 18 |
| `yuyu-map.test.cjs` | Unit — map, symbols, compress, handoff, llms.txt | 98 |
| `yuyu-server.test.cjs` | Integration — HTTP, read/write/patch/batch/exec | 30 |
| `useSlashCommands.test.js` | Unit — all 68 slash command handlers | 115 |
| `api.branch.test.js` | Branch coverage — api.js conditions | 12 |
| `branch.coverage.test.js` | Branch coverage — utils.js executeAction/resolvePath | 22 |
| `features.branch.test.js` | Branch coverage — features.js | 27 |
| `features.bgagent.test.js` | Branch coverage — background agent | 11 |
| `useFileStore.branch.test.js` | Branch coverage — useFileStore | 14 |
| `useAgentLoop.branch.test.js` | Branch coverage — agent loop conditions | 39 |
| `useSlashCommands.branch.test.js` | Branch coverage — slash command handlers | 41 |

### Benchmarks

#### 📱 Device — Termux ARM64 (Snapdragon 680)

```
getLangExt          5.08x  faster than 10 mixed extensions
isEmmetLang         4.48x  faster than 10 mixed
isTsLang            4.55x  faster than 10 mixed
buildSrcdoc         4.52x  faster than html + css + js combined
multi-tab open     35.57x  faster than open 50 tabs sequentially
generateDiff     5545.38x  faster than large diff (500 lines)
extractSymbols    206.08x  faster than large file (10 components, ~500 lines)
compressSource    634.74x  faster than large file (500 lines)
parseActions       80.24x  faster than mixed valid/invalid blocks (agent loop hot path)
```

> The Myers diff number isn't a typo. Small diffs exit the algorithm early — large diffs don't.
>
> Benchmarks run on Oppo A77s (Snapdragon 680, 8GB RAM) via Termux ARM64.
> Not a MacBook. Not a server. A ~$130 phone from 2022.

#### 🖥️ CI — Ubuntu x86_64 (GitHub Actions)

[![Benchmark](https://github.com/liveiciee/yuyucode/actions/workflows/bench.yml/badge.svg)](https://liveiciee.github.io/yuyucode/dev/bench/)

Historical performance chart: **[liveiciee.github.io/yuyucode/dev/bench](https://liveiciee.github.io/yuyucode/dev/bench/)**

Runs automatically on every push to `main`. Alerts via commit comment jika ada regresi >150% dari baseline. Angka CI berbeda dari device benchmark (x86\_64 vs ARM64) — keduanya intentional: device bench untuk feel di HP nyata, CI bench untuk deteksi regresi yang stabil antar commit.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 5 |
| Mobile | Capacitor 8 |
| Backend | Node.js (yuyu-server.js, local in Termux) |
| Code Editor | CodeMirror 6 + full extension suite |
| Terminal | xterm.js |
| File Search | Fuse.js |
| Diff | diff library (Myers algorithm) |
| Graph Visualization | D3 v7 (dependency graph) |
| Build | GitHub Actions → signed APK |
| ARM64 compat | `@rollup/wasm-node` override |
| AI Providers | Cerebras (default) + Groq (fallback + vision) |

---

## Why Cerebras + Groq instead of Claude?

Both are **free tier** with fast inference. Cerebras runs Qwen 3 235B at remarkable speed. Groq runs Kimi K2 (262K context) as fallback — large enough to hold a full codebase in context. Rate limit on Cerebras → auto-switch to Groq, silently, without interrupting the session.

The irony: this entire project was built *with* Claude AI (via claude.ai), but the app itself runs on open models due to API cost constraints. A tool built by Claude, that doesn't use Claude.

---

## Getting started

You need an Android phone with Termux.

```bash
# Clone
git clone https://github.com/liveiciee/yuyucode
cd yuyucode
npm install

# Start dev server
npm run dev
# Open localhost:5173 in browser
```

> **Note:** `yuyu-server.js` must be running before using the app.

Get free API keys:
- [Cerebras](https://cloud.cerebras.ai) — main AI
- [Groq](https://console.groq.com) — fallback + vision
- [Tavily](https://tavily.com) — web search (optional)

**Option A — Termux `.bashrc` (recommended):** See full setup template in the Developer Documentation section below.

**Option B — `.env.local`:**
```
VITE_CEREBRAS_API_KEY=your_key
VITE_GROQ_API_KEY=your_key
VITE_TAVILY_API_KEY=your_key
```

> **Note:** `npm run build` works on ARM64 (Termux) via the `@rollup/wasm-node` override — takes ~1-2 minutes. The signed APK is produced by CI. Do NOT remove that override.

---

## Known limitations

- **Requires `yuyu-server.js` running in Termux at all times.** If Termux gets killed by Android's memory manager, the app stops working.
- **Depends entirely on free-tier AI APIs.** Rate limits are real. Both Cerebras and Groq exhausted mid-task = agent loop stops.
- **Single-developer bus factor.** Core logic is concentrated in a small number of large files — built for speed, not for onboarding strangers.
- **Not tested on other devices.** All development and benchmarking was done on one Oppo A77s.
- **`npm run build` takes ~1-2 minutes on ARM64.** Signed APK requires GitHub Actions.

---

## Project origin

Started as a question: *can Claude Code be replicated on a phone?*

Turned out: yes, mostly. Built patch by patch, from morning to past midnight, using only a phone and an AI chat interface. Core features — streaming, file patching, background agents, multi-tab editor, visual diff review, persistent project memory — all work. The remaining gap is model quality and context window size, not features.

It's not a polished product. It's proof that the constraints were never the hardware.

---

## Acknowledgements

- **[CodeMirror 6](https://codemirror.net/)** by Marijn Haverbeke — the editor that made all of this possible.
- **[Capacitor](https://capacitorjs.com/)** by Ionic — the bridge that turned a web app into a real Android app.
- **[xterm.js](https://xtermjs.org/)** — a terminal emulator that actually works inside a WebView on Android.
- **[Termux](https://termux.dev/)** — the reason any of this was possible in the first place.
- **[Cerebras](https://cloud.cerebras.ai/)** and **[Groq](https://groq.com/)** — for making fast AI inference accessible without a credit card.
- **[Claude](https://claude.ai/)** by Anthropic — every architectural decision, every tricky bug, every refactor in this codebase was worked through in a Claude chat window.
- **`@valtown/codemirror-ts`**, **`@replit/codemirror-vim`**, **`@emmetio/codemirror6-plugin`**, **`@codemirror/collab`**, **`@capgo/capacitor-brightness`** — each one saved weeks of work.

---

<details>
<summary><b>🛠 Developer Documentation</b> (internal / AI context)</summary>

---

## Yang Tidak Boleh Diubah Tanpa Konfirmasi

- [`"overrides": { "rollup": "npm:@rollup/wasm-node" }`](./package.json) di `package.json` — ini yang bikin Vite jalan di Termux ARM64. Hapus = build mati.
- [Folder `android/`](./android/) — di-generate Capacitor, edit manual bisa rusak sync.
- [`vitest@3`](./vitest.config.js) — v4 crash `Illegal instruction` di ARM64 Snapdragon 680. Jangan upgrade.
- [`isolate: false`](./vitest.config.js) di vitest — `vi.mock`/`vi.hoisted` bocor antar file. Jangan pakai.
- Jangan override `global.TextDecoder` di test files — infinite recursion di Node 24.
- Keystore encoding: `openssl base64` + `tr -d '\n'`, bukan `base64 -w 0`.

## Workflow Harian

```bash
node ~/yuyu-server.js &
cd ~/yuyucode && npm run dev &

# Apply dari Claude — kirim hanya file yang disentuh (cek: git diff --name-only HEAD):
yuyu-apply yuyu-patch.zip       # zip — unzip + lint + test + rollback otomatis
yuyu-apply --dry-run            # preview dulu
yuyu-cp README.md               # file tunggal
yuyu-cp quality.yml .github/workflows/quality.yml  # file ke subdirectory

# Selalu setelah apply:
npm run lint        # 0 problems
npx vitest run      # harus 1031/1031 pass
node yuyu-map.cjs   # update codebase map

# Push
node yugit.cjs "feat: ..."
node yugit.cjs "feat(api): add endpoint"
node yugit.cjs "feat!: overhaul"            # breaking change
node yugit.cjs "fix: typo" --amend
node yugit.cjs "revert: bad" --hash=abc123
node yugit.cjs --push
node yugit.cjs --squash 3
node yugit.cjs --status

# Release — auto bump version + trigger CI APK
node yugit.cjs "release: v4.x — deskripsi"

npm run bench           # benchmark + compare ke history
npm run bench:save      # set/update baseline
```

## Arsitektur

```
src/
├── App.jsx                 # Root — mounts semua stores + hooks, brightness compensation
├── components/
│   ├── AppHeader.jsx       # Header bar (status, model, tools)
│   ├── AppSidebar.jsx      # File tree sidebar
│   ├── AppChat.jsx         # Main area: tabs, chat, editor, terminal, preview
│   ├── AppPanels.jsx       # Semua overlay panels
│   ├── FileEditor.jsx      # CodeMirror 6 — multi-tab, vim, ghost text L1+L2, blame, collab
│   ├── KeyboardRow.jsx     # Extra symbol row above keyboard
│   ├── LivePreview.jsx     # iframe HTML/CSS/JS preview
│   ├── GlobalFindReplace.jsx
│   ├── Terminal.jsx        # xterm.js terminal
│   ├── FileTree.jsx        # Fuse.js fuzzy file tree
│   ├── MsgBubble.jsx       # Chat message renderer + DiffReviewCard
│   ├── SearchBar.jsx
│   ├── ThemeEffects.jsx
│   ├── VoiceBtn.jsx
│   ├── panels.base.jsx     # BottomSheet, CommandPalette
│   ├── panels.git.jsx      # GitCompare, FileHistory, GitBlame, DepGraph, MergeConflict
│   ├── panels.agent.jsx    # Elicitation, Skills, BgAgent
│   └── panels.tools.jsx    # Config, Deploy, MCP, GitHub, Sessions, Permissions, Plugins
├── hooks/
│   ├── useAgentLoop.js     # Core AI loop — stream, parse, execute, diff review intercept
│   ├── useAgentSwarm.js    # Multi-agent swarm pipeline
│   ├── useApprovalFlow.js  # Write approval + reject feedback + atomic rollback + auto-resume
│   ├── useBrightness.js    # Real-time brightness via @capgo/capacitor-brightness
│   ├── useChatStore.js     # Messages, streaming, memories, checkpoints
│   ├── useDevTools.js      # GitHub, deploy, commit msg, tests, browse
│   ├── useFileStore.js     # Multi-tab state
│   ├── useGrowth.js        # XP, streak, badge, learnedStyle
│   ├── useMediaHandlers.js # Camera, image attach, drag & drop
│   ├── useNotifications.js # Push notification, haptic, TTS
│   ├── useProjectStore.js  # Folder, model, effort, permissions, YUYU.md, diffReview
│   ├── useSlashCommands.js # ~68 slash commands
│   └── useUIStore.js       # All UI state + editor feature toggles
├── themes/
│   ├── obsidian.js         # Obsidian Warm (default)
│   ├── aurora.js, ink.js, neon.js, mybrand.js
│   └── index.js
└── plugins/
    └── brightness.js       # Bridge untuk @capgo/capacitor-brightness
```

## Editor Feature Toggles (/config)

| Toggle | Key | Default | Keterangan |
|--------|-----|---------|------------|
| Vim Mode | `yc_vim` | off | hjkl, normal/insert/visual |
| AI Ghost Text | `yc_ghosttext` | off | L1+L2, Tab / Tab+Tab |
| Minimap | `yc_minimap` | off | Canvas scroll overview |
| Inline Lint | `yc_lint` | off | JSON + JS syntax check |
| TypeScript LSP | `yc_tslsp` | off | Autocomplete + types |
| Inline Blame | `yc_blame` | off | git blame per line |
| Multi-cursor | `yc_multicursor` | **on** | Ctrl+D, Ctrl+Shift+L |
| Sticky Scroll | `yc_stickyscroll` | off | Scope header sticky |
| Realtime Collab | `yc_collab` | off | OT sync via WebSocket |
| Diff Review | `yc_diff_review` | off | Pause loop, show diff sebelum apply |

## Cara Kerja Agent Loop

`src/hooks/useAgentLoop.js`. Setiap pesan masuk → loop sampai MAX_ITER:

1. Auto-compact kalau context > 80.000 chars dan pesan > 12
2. `gatherProjectContext` — handoff.md → YUYU.md → map.md → llms.txt → tree → keyword files (paralel)
3. Set `agentStatus` → tampil di UI
4. Kirim ke AI (streaming) — `<think>` blocks tampil live
5. Parse semua `action` blocks
6. Parallel: read/search/list/tree/mkdir — Serial: exec/mcp
7. **diffReview ON** → pre-compute diff, mark `pending`, pause — tunggu user
8. **diffReview OFF** → auto-execute dengan backup
9. Reject → kirim feedback ke AI, loop lanjut. Approve → resume via sendMsgRef.
10. Feed hasil ke AI → lanjut loop

## AI Provider

### Cerebras (default)
| Model | ID |
|-------|-----|
| Qwen 3 235B | `qwen-3-235b-a22b-instruct-2507` |
| Llama 3.1 8B | `llama3.1-8b` |

### Groq (fallback + vision)
| Model | ID | Note |
|-------|-----|------|
| Kimi K2 | `moonshotai/kimi-k2-instruct-0905` | 262K context, fallback utama |
| Llama 3.3 70B | `llama-3.3-70b-versatile` | Serbaguna |
| Llama 4 Scout | `meta-llama/llama-4-scout-17b-16e-instruct` | Vision — auto-route kalau ada gambar |
| Qwen 3 32B | `qwen/qwen3-32b` | Coding |
| Llama 8B Fast | `llama-3.1-8b-instant` | Hemat rate limit |

Auto-fallback: Cerebras 429 → Kimi K2. Vision: Cerebras → Llama 4 Scout. Retry 5xx: 2× backoff 2s/4s.

## YuyuServer v4-async

```bash
node ~/yuyu-server.js &  # dari ~, bukan project folder
```

HTTP :8765 — `ping`, `read`, `read_many`, `write`, `append`, `patch`, `delete`, `move`, `mkdir`, `list`, `tree`, `info`, `search`, `web_search`, `exec`, `browse`, `fetch_json`, `sqlite`, `mcp`, `mcp_list`, `batch`, `index`

REST — `GET /health`, `GET /status`

WebSocket :8766 — `watch`, `exec_stream`, `kill`, `collab_join`, `collab_push`, `collab_updates`

## CI/CD

1. Install deps (cached)
2. `npm run build` → dist/
3. Java 21 + Android SDK 34
4. `cap sync android` + restore icons
5. Auto-bump `versionCode` = GitHub run number
6. `./gradlew assembleRelease`
7. Sign APK
8. GitHub Release hanya kalau commit diawali `release:`
9. Push yang hanya ubah `.md` → skip CI

**Secrets:** `VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`, `VITE_TAVILY_API_KEY`, `ANDROID_KEYSTORE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`, `SONAR_TOKEN`, `DEEPSOURCE_DSN`

## State v4.2

- Version: 4.2.0 · Tests: 1031 ✅ · Slash commands: ~68
- Features: YUYU.md, visual diff review + reject feedback, ghost text L1+L2, /review --all, contextual slash suggestions, context bar, graceful stop, chat search, /pin, /undo, /diff, /ask, offline detect, read cache
- CI/CD: CodeQL ✅ · SonarCloud Quality Gate ✅ · Semgrep SAST ✅ · DeepSource ✅
- SonarCloud: Security A · Maintainability A · Coverage 70% ✅
- vitest@3 + happy-dom — 16s → 9s ✅

</details>

---

<div align="center">
  <sub>
    <img src="public/icon.svg" width="14" alt="🌸" />
    &nbsp;built on a phone · for a phone · with love
  </sub>
</div>
