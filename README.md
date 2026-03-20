<div align="center">

# 🌸 YuyuCode

**A full agentic coding assistant. Built entirely on an Android phone. No laptop. No desktop.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Build APK](https://github.com/liveiciee/yuyucode/actions/workflows/build-apk.yml/badge.svg)](https://github.com/liveiciee/yuyucode/actions)
[![Tests](https://img.shields.io/badge/tests-310%20passing-brightgreen)](src)
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

```
layer_1 = min(comp, 2.0)   // CSS filter — no banding
layer_2 = screen_blend(T.accent, opacity)  // additive light fill
```

### Camera-to-Code
Capture a photo of a whiteboard, a printed error, a diagram — directly from the native Android camera. Routes automatically to a vision-capable model for analysis. Zero friction, zero file management.

### Background Agents with Git Worktree Isolation
`/bg <task>` spins up an agent in a separate git worktree. Your main branch stays clean while the agent works up to 8 agentic iterations. Live progress tracking, abort anytime, merge when ready. Conflict resolution handled via a dedicated panel.

### Agent Swarm Pipeline
`/swarm <task>` runs: **Architect** (plan) → **FE Agent + BE Agent** (parallel execution) → **QA Engineer** (review + bug list) → **auto-fix pass**. Multi-agent coordination, single command.

### Surgical Context Editor
Remove specific sections from any AI message without deleting the whole thing. Code blocks, exec results, text sections — tap to mark, save. The AI won't see those parts next turn.

### Live Chain of Thought
`<think>` blocks stream live as Yuyu generates — collapsible "N langkah berpikir" like Claude.ai. Brain icon pulses while thinking, collapses with step count when done.

### CodeMirror 6 Editor
Full syntax highlighting for JS/JSX/TS/TSX/CSS/HTML/JSON/Python/Markdown, bracket matching, auto-indent, Ctrl+S save, find/replace panel (Ctrl+F), line numbers, cursor position. Replaces the old plain textarea.

### xterm.js Terminal
Proper terminal emulator with 2000-line scrollback, full ANSI escape support, native font rendering. Traffic lights are functional: red = stop process, yellow = clear, green = send output to AI. Hint labels fade when typing.

### Fuse.js Fuzzy File Search
Search bar in the file tree does fuzzy matching on filename + path — `cmpt` finds `components/`, `astst` finds `useAgentStore`. Linear filter replaced with Fuse.js.

### Myers Diff Algorithm
`generateDiff()` uses the `diff` library (Myers algorithm) for accurate line tracking. Detects moved blocks, not just line-by-line comparison. Output includes line numbers: `- L1: old`, `+ L1: new`.

### Table Copy-Paste Friendly
Long-press select on any rendered table → clipboard gets proper markdown pipe format `| col | col |` via `onCopy` event intercept. Same technique used by Gemini and Claude.ai.

---

## Technically interesting things

- **Custom Capacitor plugin in Java** — `BrightnessPlugin.java` uses `ContentObserver` to emit real-time brightness events to the WebView. No npm dependency, no polling, zero lag.
- **Two-layer brightness compensation** — Layer 1: CSS filter capped at 2.0 to avoid 8-bit GPU quantization artifacts on Android WebView. Layer 2: `mix-blend-mode: screen` overlay with T.accent color for extreme boost without banding.
- **Per-theme T token system** — every component reads colour tokens from the active theme object (`T.bg`, `T.accent`, `T.border`, etc.) with safe fallbacks. Zero hardcoded colours in component JSX.
- **Parallel action execution** — `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` run in parallel; `exec` and `mcp` run serial. The agent loop handles scheduling automatically.
- **TF-IDF + age decay memory ranking** — memories injected into the system prompt are scored by relevance to the current task *and* recency, not just insertion order.
- **`protect()` pattern in syntax highlighter** — prevents regex passes from matching inside already-highlighted `<span>` tags. Solves an entire class of highlighter corruption bugs with one elegant wrapper.
- **3-fallback patch handler** — `patch_file` tries exact match → whitespace-normalized → trim-lines before giving up and feeding the diff error back to the AI to retry.
- **TrafficDot component boundary** — ESLint `react-hooks/refs` cannot trace `termRef.current` across component boundaries. Traffic light buttons extracted to `<TrafficDot>` to safely reference terminal ref in onClick without lint warnings.
- **onCopy intercept for tables** — `e.clipboardData.setData('text/plain', markdown)` + `e.preventDefault()` intercepts long-press copy on rendered `<table>` elements and replaces clipboard content with pipe-formatted markdown.
- **310 tests, 0 lint warnings** — unit, integration, fuzz, snapshot, and full theme schema validation. All run on Termux ARM64 with `vitest@1`.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 5 |
| Mobile | Capacitor 8 |
| Backend | Node.js (yuyu-server.js, local) |
| Code Editor | CodeMirror 6 + lang extensions |
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

## Untuk AI yang Membaca Ini

> Bagian ini ditulis khusus agar AI assistant sesi berikutnya tidak perlu diajarkan dari nol.

**Konteks owner:** Solo dev, Android-only, semua coding dari Termux. Tidak ada akses laptop/desktop. Setiap keputusan teknis di project ini dibuat dengan constraint itu dalam pikiran.

**Cara kerja app:** YuyuCode adalah React SPA yang di-serve lewat Capacitor ke Android. Di development, cukup `npm run dev` — tidak perlu build. Build APK hanya terjadi di GitHub Actions (CI). `npm run build` di Termux lokal **tidak akan pernah dijalankan** — selain lambat, akan crash "Illegal instruction" karena rollup native tidak support ARM64.

---

## Yang Tidak Boleh Diubah Tanpa Konfirmasi

- `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di `package.json` — ini yang bikin Vite jalan di Termux ARM64. Hapus = build mati.
- Folder `android/` — di-generate Capacitor, edit manual bisa rusak sync.
- `vite.config.js` — sudah dioptimasi untuk Termux. Manual chunks: `codemirror`, `xterm`, `d3`, `vendor` dipisah supaya initial bundle tetap kecil.

---

## Workflow Dasar

**Push ke GitHub:**
```bash
cd ~/yuyucode && node yugit.cjs "pesan commit"
```
Bukan `~/yugit.cjs`. File `yugit.cjs` ada di dalam folder project.

**CI/CD — Release strategy:**
- Setiap push ke `main` → CI tetap build + lint + test
- GitHub Release + APK **hanya dibuat** kalau commit message diawali `release:`
- Push yang hanya ubah file `.md` → CI **skip otomatis** (paths-ignore di workflow)
- Contoh: `node yugit.cjs "release: v2.x — fitur X dan fix Y"`

**Encode keystore** (kalau perlu update GitHub Secrets):
```bash
openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
# Bukan base64 -w 0
```

---

## Gotchas — Dikelompokkan

### Termux / ARM64
- `vitest@4` crash silent di Termux ARM64 → pakai `vitest@1`
- `npm run build` crash "Illegal instruction" → CI only, jangan lokal
- `global.TextDecoder` override di test file → infinite recursion. Node 24 sudah punya native, jangan override
- `/tmp` di Termux restricted → pakai `$TMPDIR` atau `~/` untuk temp files

### ESLint
- Regex literal di JSX tidak boleh mengandung newline fisik → pakai `\n` escape
- `\|` di dalam single-quoted string JS adalah useless escape → pakai `[|]` atau `\\|` dalam template literal
- `react-hooks/refs` — `termRef.current` di dalam array literal yang di-render dianggap "in render". Solusi: extract ke komponen terpisah (component boundary memutus trace ESLint)
- `react-hooks/set-state-in-effect` — `setSaved()` langsung di dalam useEffect → bungkus dengan `setTimeout(() => setSaved(true), 0)`
- Unused eslint-disable directive → warning. Hapus komentar disable kalau masalah yang didisable sudah tidak ada

### T Token System
- Deklarasikan **hanya token yang benar-benar dipakai** di JSX — `no-unused-vars` akan flag yang tidak dipakai
- Duplikat `const text` di function scope = parse error
- Token yang dipakai di `buildTheme()` (CodeMirror) dan di JSX component adalah scope yang berbeda — deklarasikan di masing-masing scope

### CodeMirror 6
- Import dari `'codemirror'` bukan `'@codemirror/basic-setup'` (deprecated)
- `Compartment` untuk dynamic lang/theme reconfigure tanpa remount
- `useEffect(()=>{}, [])` untuk mount — dependency array kosong intentional, eslint-disable-line
- xterm.js: import dari `'@xterm/xterm'` dan `'@xterm/addon-fit'` — package `xterm` dan `xterm-addon-fit` deprecated
- xterm CSS: jangan `import '@xterm/xterm/css/xterm.css'` global — inject manual via `<style>` tag supaya tidak corrupt layout flex

### Capacitor / API
- Cerebras tidak support vision → auto-fallback ke Llama 4 Scout (Groq)
- `readSSEStream` harus di-export dari `api.js` supaya bisa di-test

### Skills
- Skills disimpan di `.yuyu/skills/` (bukan `.claude/skills/`)
- `/init` akan generate `SKILL.md` di root project folder

### Misc
- `hl()` di `utils.js` pakai pattern `protect()` — jangan hilangkan
- `generateDiff()` sekarang pakai `diffLines` dari library `diff` (Myers) — output format: `- L1: teks` bukan `- teks`

---

## Arsitektur

```
~/
├── yuyu-server.js          # Server lokal v4-async — HTTP :8765 + WS :8766
└── yuyucode/
    ├── src/
    │   ├── App.jsx                 # Root — state init, effects, layout shell
    │   ├── constants.js            # BASE_SYSTEM prompt, models, themes, limits
    │   ├── api.js                  # Cerebras+Groq streaming, callServer, execStream
    │   ├── utils.js                # parseActions, executeAction, hl(), generateDiff (Myers)
    │   ├── features.js             # Plan, bg agents, skills, hooks v2, tokenTracker, tfidfRank
    │   ├── components/
    │   │   ├── AppHeader.jsx       # Header bar, folder input, status bar
    │   │   ├── AppSidebar.jsx      # Overlay sidebar + file tree
    │   │   ├── AppChat.jsx         # Tabs, chat, file viewer, editor, input composer
    │   │   ├── AppPanels.jsx       # Semua panel overlay, modals, commit dialog
    │   │   ├── MsgBubble.jsx       # Chat bubbles, ThinkingBlock (live), StreamingBubble,
    │   │   │                       # ActionChip, surgical editor, onCopy table intercept
    │   │   ├── FileTree.jsx        # Sidebar file explorer + Fuse.js fuzzy search
    │   │   ├── FileEditor.jsx      # CodeMirror 6 — syntax, bracket, find/replace, Ctrl+S
    │   │   ├── Terminal.jsx        # xterm.js — ANSI, scrollback, traffic lights fungsional
    │   │   ├── SearchBar.jsx       # File content search + undo bar
    │   │   ├── ThemeEffects.jsx    # Visual overlays (orbs, scanlines, aurora, grain)
    │   │   ├── VoiceBtn.jsx        # Voice input + push-to-talk
    │   │   └── panels/
    │   │       ├── panels.jsx      # Barrel re-export
    │   │       ├── panels.base.jsx # BottomSheet, CommandPalette
    │   │       ├── panels.git.jsx  # GitCompare, FileHistory, GitBlame, DepGraph, MergeConflict
    │   │       ├── panels.agent.jsx# Elicitation, Skills, BgAgent
    │   │       └── panels.tools.jsx# Deploy, Mcp, GitHub, Sessions, Permissions,
    │   │                           # Plugins, Config, CustomActions, Shortcuts, Snippets, ThemeBuilder
    │   ├── hooks/
    │   │   ├── useAgentLoop.js     # Core agent loop — sendMsg, gatherContext, auto-execute, agentStatus
    │   │   ├── useSlashCommands.js # 58 slash command handlers
    │   │   ├── useAgentSwarm.js    # Architect → FE+BE parallel → QA → auto-fix
    │   │   ├── useApprovalFlow.js  # Plan approval + syntax verify
    │   │   ├── useChatStore.js     # Messages, memories, checkpoints, agentStatus, plan, swarm
    │   │   ├── useProjectStore.js  # Folder, model, effort, permissions, hooks, skills
    │   │   ├── useFileStore.js     # File open, pin, edit history, split view
    │   │   ├── useUIStore.js       # Panels, theme, sidebar, brightness level
    │   │   ├── useMediaHandlers.js # Camera, gallery, drag & drop
    │   │   ├── useDevTools.js      # GitHub, deploy, commit msg, tests, browse, shortcuts
    │   │   ├── useNotifications.js # Push notification, haptic, TTS
    │   │   ├── useBrightness.js    # Real-time brightness via Capacitor plugin
    │   │   └── useGrowth.js        # XP, streak, badge, learnedStyle
    │   ├── plugins/
    │   │   └── brightness.js       # JS bridge untuk BrightnessPlugin.java
    │   └── themes/
    │       ├── index.js        # Theme registry
    │       ├── obsidian.js     # Obsidian Warm (default)
    │       ├── aurora.js       # Aurora Glass
    │       ├── ink.js          # Ink & Paper
    │       ├── neon.js         # Neon Terminal
    │       └── mybrand.js      # Template custom theme
    ├── android/
    │   └── app/src/main/java/com/liveiciee/yuyucode/
    │       ├── MainActivity.java      # Register BrightnessPlugin
    │       └── BrightnessPlugin.java  # ContentObserver → emit ke WebView
    ├── .github/
    │   └── workflows/build-apk.yml  # CI/CD — signed APK → Releases (skip pada .md only push)
    ├── yugit.cjs                    # Git push helper
    ├── eslint.config.js
    ├── package.json                 # Vite 5 + rollup wasm override
    └── vite.config.js               # Manual chunks: vendor/codemirror/xterm/d3
```

---

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

**Effort levels:**

| Level | MaxIter | MaxTokens | Pakai kapan |
|-------|---------|-----------|-------------|
| `low` | 3 | 1500 | Pertanyaan singkat |
| `medium` | 10 | 2048 | Default harian |
| `high` | 20 | 4000 | Task kompleks |

---

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

**Auto-fallback:** Cerebras rate limit (429) → otomatis switch ke Kimi K2 tanpa user tahu.
**Vision:** Cerebras tidak support image → auto-route ke Llama 4 Scout.
**Retry:** Server error 5xx → retry 2x dengan backoff 2s/4s.

---

## YuyuServer v4-async

```bash
node ~/yuyu-server.js &  # jalankan dari ~, bukan dari project folder
```

**HTTP :8765** — `ping`, `read`, `read_many`, `write`, `append`, `patch`, `delete`, `move`, `mkdir`, `list`, `tree`, `info`, `search`, `web_search`, `exec`, `browse`, `fetch_json`, `sqlite`, `mcp`, `mcp_list`

**WebSocket :8766** — `watch` (file watcher), `exec_stream` (live terminal output), `kill` (abort process)

---

## Permissions

| Action | Default | Keterangan |
|--------|---------|------------|
| `read_file`, `list_files`, `tree`, `search`, `web_search`, `mkdir` | ✅ | Safe |
| `write_file`, `patch_file` | ✅ | Auto-execute + backup |
| `exec` | ✅ | Bebas run command |
| `delete_file`, `move_file` | ❌ | Destruktif |
| `mcp`, `browse` | ❌ | Manual enable |

---

## Slash Commands

| Kategori | Commands |
|----------|----------|
| **AI** | `/model` `/effort` `/thinking` `/usage` `/cost` `/tokens` `/debug` `/ab` `/xp` |
| **Agent** | `/plan` `/bg` `/bgstatus` `/bgmerge` `/swarm` `/batch` `/simplify` `/loop` |
| **Context** | `/compact` `/summarize` `/rewind` `/clear` `/tree` `/index` |
| **Memory** | `/amemory` `/checkpoint` `/restore` `/save` `/sessions` |
| **Git** | `/history` `/diff` `/review` `/deps` `/rename` `/color` |
| **Dev** | `/test` `/scaffold` `/browse` `/search` `/db` `/mcp` `/github` `/deploy` `/init` `/lint` `/refactor` `/open` `/status` |
| **UX** | `/font` `/theme` `/split` `/config` `/watch` `/ptt` `/plugin` `/permissions` `/skills` `/actions` `/export` |

---

## Testing

```bash
npm run lint          # ESLint — harus 0 errors, 0 warnings
npx vitest run        # Semua tests — harus 310/310 pass
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

Pakai `vitest@1` — v4 crash silent di Termux ARM64.

---

## CI/CD

**Steps:**
1. Install deps (cached)
2. `npm run build` (Vite → dist/)
3. Setup Java 21 + Android SDK 34
4. `cap sync android` + restore custom icons
5. Auto-bump versionCode = GitHub run number
6. `./gradlew assembleRelease`
7. Sign APK dengan keystore dari Secrets
8. GitHub Release hanya kalau commit diawali `release:`
9. Push yang hanya ubah `.md` → skip CI otomatis

**GitHub Secrets:** `VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`, `VITE_TAVILY_API_KEY`, `ANDROID_KEYSTORE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`

---

## Workflow Harian

```bash
node ~/yuyu-server.js &
cd ~/yuyucode && npm run dev &

node yugit.cjs "feat: ..."
node yugit.cjs "release: v2.x — ..."
npm run lint && npx vitest run
```

</details>

---

<div align="center">
  <sub>built on a phone. for a phone. with love.</sub>
</div>
