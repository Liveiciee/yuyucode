<div align="center">

<img src="public/yuyu-icon.png" width="96" alt="YuyuCode icon" />

# YuyuCode

### A full agentic coding assistant.
### Built entirely on an Android phone.

<br/>

[![Build APK](https://github.com/liveiciee/yuyucode/actions/workflows/build-apk.yml/badge.svg)](https://github.com/liveiciee/yuyucode/actions)
[![Tests](https://img.shields.io/badge/tests-451%20passing-brightgreen)](#testing--benchmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Android%20(Termux)-3DDC84?logo=android&logoColor=white)
![Stack](https://img.shields.io/badge/React%2019%20+%20Capacitor%208-20232A?logo=react&logoColor=61DAFB)
![Editor](https://img.shields.io/badge/CodeMirror%206-full%20extension%20suite-orange)

<br/>

> *Every line of code in this repo was written from a phone, in Termux, using Claude AI.*
> *No laptop. No desktop. Ever.*

</div>

---

## Status

> **Personal tool. Works on one phone — mine.** Not production software. Tested on one device (Oppo A77s, Snapdragon 680, Android 14). No contributions expected, though issues are welcome. Use at your own risk.

---

## What is this?

YuyuCode is a **Claude Code / Cursor-style agentic coding assistant** that runs natively on Android. Not a web app forced into a mobile shell — designed from the ground up for the phone.

It connects to a local Node.js server (`yuyu-server.js`) running in Termux, giving it full filesystem access, shell execution, WebSocket streaming, and MCP support — all from your pocket.

**In one sentence:** You type a task → YuyuCode streams a response, automatically executes file reads/writes/patches, feeds results back into the loop, and keeps going until the task is done. Background agents run in isolated git worktrees so your main branch stays clean the whole time.

---

## Demo

> 📸 *Screenshots and GIF demos coming soon — drop a ⭐ to get notified*

<!--
<p align="center">
  <img src="docs/demo-agent.gif" width="280" />
  <img src="docs/demo-editor.gif" width="280" />
  <img src="docs/demo-terminal.gif" width="280" />
</p>
-->

---

## Features that don't exist anywhere else

### 🔆 Gamma-Corrected Adaptive Brightness
A custom Capacitor Java plugin registers a `ContentObserver` on `Settings.System.SCREEN_BRIGHTNESS`. The moment you slide brightness down, the entire UI auto-compensates using sRGB gamma correction (γ=2.2). Two-layer compensation: CSS `filter: brightness()` capped at 2.0 (avoids 8-bit quantization artifacts on Android WebView), plus a `mix-blend-mode: screen` overlay for extreme low-brightness boost. No other coding tool has this. Because no other coding tool runs on a phone.

### 📷 Camera-to-Code
Capture a photo of a whiteboard, a printed error, a diagram — directly from the native Android camera. Routes automatically to a vision-capable model. Zero friction, zero file management.

### 🤖 Background Agents with Git Worktree Isolation
`/bg <task>` spins up an agent in a separate git worktree. Your main branch stays clean while the agent works up to 8 agentic iterations. Live progress tracking, abort anytime, merge when ready.

### 🐝 Agent Swarm Pipeline
`/swarm <task>` runs: **Architect** → **FE Agent + BE Agent** (parallel) → **QA Engineer** → **auto-fix pass**. Multi-agent coordination, single command.

### 🗂️ Multi-Tab Editor
Each tab maintains its own independent CodeMirror `EditorState` — cursor position, scroll, undo history all preserved on switch. Dirty indicator (●) per tab. Like VS Code tabs, on a phone.

### ✏️ Full Mobile Code Editor

CodeMirror 6 with a complete extension suite:

| Feature | Details |
|---|---|
| **Vim mode** | normal/insert/visual, full `hjkl`, `:wq` saves |
| **Emmet** | `div.container>ul>li*3` → HTML via Ctrl+E |
| **AI Ghost Text** | Copilot-style inline suggestion, 900ms debounce, Tab to accept |
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

### 🤝 Realtime Collaboration
`/collab <room>` connects two devices to the same editing session via WebSocket. OT-based sync using `@codemirror/collab`. No third-party service needed.

### 🧠 Surgical Context Editor
Remove specific sections from any AI message without deleting the whole thing. Code blocks, exec results, text — tap to mark, save. The AI won't see those parts next turn.

### 💭 Live Chain of Thought
`<think>` blocks stream live — collapsible "N langkah berpikir" like Claude.ai. Brain icon pulses while thinking, collapses with step count when done.

### 💻 xterm.js Terminal
Full terminal emulator: 2000-line scrollback, ANSI escape support. Traffic lights are functional: red = kill process, yellow = clear, green = send output to AI.

### 🔎 Fuse.js Fuzzy File Search
`cmpt` finds `components/`, `astst` finds `useAgentStore`. Full fuzzy match on filename + path.

---

## Technically interesting things

- **Custom Capacitor plugin in Java** — `BrightnessPlugin.java` uses `ContentObserver` to emit real-time brightness events to the WebView
- **Two-layer brightness compensation** — CSS `filter` capped at 2.0 to avoid 8-bit GPU quantization artifacts; `mix-blend-mode: screen` overlay for extreme low-light
- **Per-theme token system** — every component reads colour tokens from the active theme object; zero hardcoded colours in component JSX
- **EditorState swap per tab** — `view.setState()` on tab switch, no remount, cursor and undo history fully preserved
- **Ghost text as StateField + WidgetType** — `StateEffect → StateField → Decoration.widget → WidgetType`; Tab keymap intercepts before default indent
- **Inline blame gutter** — custom `GutterMarker` + `gutter()` extension; data from `git blame --abbrev=7` via yuyu-server
- **Breadcrumb from syntax tree** — `syntaxTree(state).resolveInner(pos)` walks AST upward collecting `FunctionDeclaration`, `ClassDeclaration`, etc.
- **Collab via `@codemirror/collab`** — OT-based update sync over the existing yuyu-server WebSocket; `collabRooms` Map tracks version + update log per room
- **Minimap as canvas** — 64px `<canvas>` with `requestAnimationFrame` loop; colors code semantically (imports=purple, comments=green, strings=yellow)
- **Parallel action execution** — `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` run in parallel; `exec` and `mcp` serial
- **TF-IDF + age decay memory ranking** — memories injected into system prompt scored by relevance to current task *and* recency (14-day linear decay). Effectively a mini-RAG pipeline running entirely client-side, no vector DB required
- **`protect()` pattern in syntax highlighter** — prevents regex passes from matching inside already-highlighted `<span>` tags
- **3-fallback patch handler** — `patch_file` tries exact match → whitespace-normalized → trim-lines before giving up
- **Myers diff** — `generateDiff()` uses the `diff` library for accurate line tracking with moved block detection; includes line numbers
- **Auto version bump** — `yugit.cjs` detects `release: vX.Y` commits and sets `package.json` version before pushing; CI uses that version for the GitHub Release tag. Supports `--no-push`, `--amend`, `--hash` revert, scope `feat(x):`, breaking change `feat!:`, and body/footer multi-line commits.

---

## Testing & Benchmarks

```
451 tests passing. 0 lint warnings. Runs on Termux ARM64.
```

| File | Type | Tests |
|------|------|-------|
| `api.test.js` | Unit | 5 |
| `api.extended.test.js` | Unit + Retry/Fallback | 15 |
| `utils.test.js` | Unit | 22 |
| `utils.extended.test.js` | Unit — all action types | 42 |
| `utils.integration.test.js` | Integration + Fuzz | 18 |
| `utils.snapshot.test.js` | Snapshot | 7 |
| `features.test.js` | Unit | 29 |
| `features.extended.test.js` | Unit + Edge cases | 48 |
| `features.extra.test.js` | Unit — sessions, skills, plan | 21 |
| `themes.test.js` | Schema validation — all 4 themes | 103 |
| `editor.test.js` | Unit — getLang, isEmmet, isTsLang | 21 |
| `livepreview.test.js` | Unit — buildSrcdoc | 12 |
| `multitab.test.js` | Unit — useFileStore multi-tab | 18 |
| `uistore.test.js` | Unit — useUIStore | 25 |
| `globalfind.test.js` | Unit — grep parser + regex + replace | 18 |
| `yuyu-map.test.cjs` | Unit — tryRepomix, extractSymbols, compressSource, walkFiles | 47 |

### Benchmarks (Termux ARM64)

```
getLangExt          4.89x  faster than 10 mixed extensions
isEmmetLang         4.54x  faster than 10 mixed
isTsLang            4.66x  faster than 10 mixed
buildSrcdoc         4.95x  faster than html + css + js combined
multi-tab open     36.55x  faster than open 50 tabs sequentially
generateDiff     5829.58x  faster than large diff (500 lines)
extractSymbols    181.28x  faster than large file (10 components, ~500 lines)
compressSource    624.92x  faster than large file (500 lines)
parseActions       82.54x  faster than mixed valid/invalid blocks (agent loop hot path)
```

> The Myers diff number isn't a typo. Small diffs exit the algorithm early — large diffs don't.
>
> Benchmarks run on Oppo A77s (Snapdragon 680, 8GB RAM) via Termux ARM64.
> Not a MacBook. Not a server. A ~$130 phone from 2022.

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
> See API keys setup below — Option A handles this automatically via `.bashrc`.

Get free API keys:
- [Cerebras](https://cloud.cerebras.ai) — main AI
- [Groq](https://console.groq.com) — fallback + vision

**Option A — Termux (recommended):** setup `.bashrc` lengkap dengan yuyu shortcuts:
```bash
# ~/.bashrc — full setup

export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

export VITE_CEREBRAS_API_KEY=your_key
export VITE_GROQ_API_KEY=your_key

# auto-start yuyu-server on every Termux session
node ~/yuyu-server.js > /dev/null 2>&1 &

# yuyu-apply — apply zip dari Claude (unzip + lint + test + rollback otomatis)
yuyu-apply() { ... }   # lihat .bashrc lengkap di repo

# yuyu-cp — copy file tunggal dari Download (auto-delegate zip ke yuyu-apply)
yuyu-cp() { ... }      # lihat .bashrc lengkap di repo

# Tab completions untuk yuyu-apply, yuyu-cp, yuyu-map, yugit
```
Template `.bashrc` lengkap tersedia di `bashrc_yuyu.txt` — download dan `cp` ke `~/.bashrc`.

Then `source ~/.bashrc` once. After that, just open Termux and everything is ready.

**Option B — `.env.local`** (if you prefer not touching `.bashrc`):
```
VITE_CEREBRAS_API_KEY=your_key
VITE_GROQ_API_KEY=your_key
```

> **Note:** `npm run build` works on ARM64 (Termux) via the `@rollup/wasm-node` override in `package.json` — takes ~1-2 minutes. The signed APK is produced by CI (keystore lives in GitHub Secrets). Do NOT remove that override.

---

## Known limitations

This is a personal tool built by one person, on one phone, in sprint-style sessions. It works well for its creator. Before you adopt it, know what it is:

- **Requires `yuyu-server.js` running in Termux at all times.** If Termux gets killed by Android's memory manager mid-session, the app stops working. No graceful fallback, no offline mode.
- **Depends entirely on free-tier AI APIs.** Cerebras and Groq are generous, but rate limits are real. If both are exhausted mid-task, the agent loop stops. There is no paid fallback.
- **Single-developer bus factor.** The dev environment lives on one device. Core logic is concentrated in a small number of large files — built for speed, not for onboarding strangers.
- **Not tested on other devices.** All development and benchmarking was done on one Oppo A77s. Behavior on other Android versions or Termux configurations is unknown.
- **`npm run build` works, but takes ~1-2 minutes on ARM64.** The signed APK still requires GitHub Actions (keystore lives in CI secrets).

If you're okay with all of the above — welcome. It's a genuinely capable tool.

---

## Project origin

Started as a question: *can Claude Code be replicated on a phone?*

Turned out: yes, mostly. Built patch by patch, from morning to past midnight, using only a phone and an AI chat interface. Core features — streaming, file patching, background agents, multi-tab editor — all work. The remaining gap is model quality and context window size, not features.

It's not a polished product. It's proof that the constraints were never the hardware.

---

## Acknowledgements

This project stands on the shoulders of some exceptional open source work:

- **[CodeMirror 6](https://codemirror.net/)** by Marijn Haverbeke — the editor that made all of this possible. The extension API is genuinely one of the best-designed systems in the JS ecosystem.
- **[Capacitor](https://capacitorjs.com/)** by Ionic — the bridge that turned a web app into a real Android app without losing access to native APIs.
- **[xterm.js](https://xtermjs.org/)** — a terminal emulator that actually works inside a WebView on Android. Not obvious. Very appreciated.
- **[Termux](https://termux.dev/)** — the reason any of this was possible in the first place. A full Linux environment on Android, free, no root required.
- **[Cerebras](https://cloud.cerebras.ai/)** and **[Groq](https://groq.com/)** — for making fast AI inference accessible without a credit card.
- **[Claude](https://claude.ai/)** by Anthropic — every architectural decision, every tricky bug, every refactor in this codebase was worked through in a Claude chat window. The irony of building a coding assistant *with* an AI assistant is not lost.
- **`@valtown/codemirror-ts`**, **`@replit/codemirror-vim`**, **`@emmetio/codemirror6-plugin`**, **`@codemirror/collab`** — each one saved weeks of work.

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

# Apply file dari Claude:
yuyu-cp README.md               # file tunggal — copy + hapus dari Download
yuyu-apply                      # zip — unzip + lint + test + rollback otomatis
yuyu-apply --dry-run            # preview dulu sebelum apply
yuyu-apply yuyu-map.zip         # zip dengan nama lain

# Selalu setelah apply:
npm run lint        # 🔍 Scouring... → ✨ 0 problems found! Code is pure.
npx vitest run      # harus 451/451 pass
node yuyu-map.cjs   # update codebase map

# Push biasa
node yugit.cjs "feat: ..."
node yugit.cjs "feat(api): add endpoint"           # dengan scope
node yugit.cjs "feat: thing" --no-push             # commit lokal, push nanti
node yugit.cjs "fix: typo" --amend                 # amend last commit
node yugit.cjs "revert: bad deploy" --hash=abc123  # git revert otomatis
node yugit.cjs "feat!: overhaul"                   # breaking change

# Release — auto set version + trigger CI APK build
node yugit.cjs "release: v2.x — deskripsi"

npx vitest bench --run  # benchmark hot paths (opsional)
```

### yuyu-apply — smart zip applier
- 📸 Snapshot git HEAD sebelum apply
- ⚠️ Auto-stash uncommitted changes
- 🔍 `--dry-run` untuk preview file yang akan di-overwrite
- 🧐 Lint dengan feedback jelas — *"Memeriksa kesucian kode"* → *"Kode suci dari dosa"*
- 🔄 Auto-rollback `git reset --hard` kalau lint/test gagal
- ✅ Hapus zip dari project + Download kalau semua hijau

### yuyu-cp — smart file copy
- Auto-delegate ke `yuyu-apply` kalau file adalah zip
- ⚠️ Warn kalau file ada uncommitted changes di git
- ✅ Hapus dari Download otomatis setelah copy
- Tab completion: `yuyu-cp <TAB>` → list file di Download

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

**WebSocket :8766** — `watch`, `exec_stream`, `kill`, `collab_join`, `collab_push`, `collab_updates`

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
  <sub>built on a phone · for a phone · with love 🌸</sub>
</div>
