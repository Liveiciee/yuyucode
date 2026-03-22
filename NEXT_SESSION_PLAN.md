# YuyuCode — Flagship Plan
> Dibuat: 2026-03-21 | **Update terakhir: 2026-03-21 (post SonarCloud AAA sprint)**
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."
> Riset: Cursor, Claude Code, Windsurf, Copilot, Devin 2026 — ambil yang terbaik, beat yang bisa dibeat.

---

## 🏆 VISI — "The Phone That Codes Like a Senior Engineer"

> **Autonomous. Context-aware. Self-improving. Runs entirely on a $130 phone.**

Benchmark: feature-parity dengan Cursor Pro ($20/month) — tapi gratis, offline-capable, dan dari HP.

---

## ✅ SUDAH SELESAI

### v4.0
- Bug #1–5 di useAgentLoop.js + handoff.md ✅
- **1.1 Visual Diff Review** — DiffReviewCard, diff preview merah/hijau, pause loop, toggle /config ✅
- **1.2 Multi-Level Ghost Text** — L1 300ms + L2 900ms, Tab/Tab+Tab accept ✅
- **1.3 YUYU.md** — auto-load, inject system prompt, /rules command, template default ✅

### v4.1
- **1.1 Reject feedback loop** — reject → feedback ke AI + auto-resume setelah approve ✅
- **2.5 /review --all** — batch review semua changed files vs HEAD, severity report ✅
- **2.6 Contextual slash suggestions** — fuzzy match + context boost dari isi chat ✅

### SonarCloud AAA Sprint (2026-03-21)
- **CI/CD hardening** — CodeQL SAST + Semgrep SAST + SonarCloud Quality Gate terpasang ✅
- **SonarCloud setup** — sonar-project.properties, SONAR_TOKEN secret, badge di README ✅
- **Security fixes** — LivePreview postMessage origin check, yuyu-server log injection fix ✅
- **Test suite expanded** — 546 → 661 tests (+115 useSlashCommands handlers, fix CI mock isolation) ✅
- **Cognitive complexity refactor** — 14 files direfactor, semua 27 SonarCloud issues addressed:
  - `useSlashCommands.js` → complexity 338 → dipecah 25+ handler functions
  - `useAgentLoop.js` → extract `executePatchActions`, `executeWriteActions`, `buildIterFeedback`, dll
  - `api.js` → extract `parseSSELine`, `_callGroqWithRetry`, `_callCerebrasWithFallback`
  - `utils.js` → extract `hlJson/Bash/Python/Css/Default`, `ACTION_DISPATCH` map
  - `features.js` → extract `runBgAgentLoop` dari async IIFE
  - `App.jsx` → extract `handleFileWatchEvent`
  - `AppChat.jsx` → extract `updateSlashSuggestions`
  - `useApprovalFlow.js` → extract `verifySyntax`
  - `useFileStore.js` + `useProjectStore.js` + `Terminal.jsx` + `FileTree.jsx` + `GlobalFindReplace.jsx` + `MsgBubble.jsx` ✅
- **README diperbarui** — test counts, badges SonarCloud, SONAR_TOKEN di secrets list ✅

---

## 🔴 TIER 1 — Game Changers

### 1.4 Parallel Agent Swarm v2 — "Background VM-style" 🔲
**Gap vs Cursor:** Cursor jalankan background agents di isolated VM. YuyuCode /bg masih single-instance.

**Yang sudah ada:** `runBackgroundAgent()` di features.js, git worktree, /bgstatus, /bgmerge.

**Yang perlu:**
- `/bg task1 && /bg task2` → max 3 agents paralel di worktrees berbeda
- Progress dashboard: semua agents sekaligus (running/done/stuck/error)
- Rate limit aware queue: throttle → antri, jalan satu per satu
- `/bgkill all` → abort semua sekaligus
- Auto-merge: selesai → show diff, 1 tap merge

**File:** `src/features.js`, `src/hooks/useSlashCommands.js`, `src/components/panels.agent.jsx`

---

## 🟠 TIER 2 — Significant Upgrades

### 2.1 Click-to-Edit di Live Preview 🔲
- Klik elemen di iframe → popup "edit ini?" → agent patch CSS/JSX langsung
- Inspector mode: hover → tampilkan component name + file path
**File:** `src/components/LivePreview.jsx`

### 2.2 Auto Test Generation — post-write hook 🔲
**Yang sudah ada:** `/test` command.
**Yang belum:**
- Setelah agent tulis function baru → auto-suggest "Mau generate tests?"
- Coverage badge di header dari vitest --coverage
- Failed test → 1 tap agent auto-fix
**File:** `src/hooks/useAgentLoop.js`

### 2.3 Smart Context Compression v2 🔲
**Gap:** /compact sekarang lossy recursive summary.
- Semantic chunking: extract `[FILE_EDIT]`, `[ERROR_FIX]`, `[ARCH_DECISION]`
- Discard: verbose explanations, duplicate reads
- Size indicator: "47K → 12K, 94% signal"
**File:** `src/hooks/useAgentLoop.js` (compactContext), `src/hooks/useSlashCommands.js`

### 2.4 Dependency Graph Visual 🔲
**Yang sudah ada:** /deps tapi output text.
- Interactive force-directed graph (d3.js)
- Tap node → jump to file, circular dep → merah
**File:** `src/components/panels.git.jsx`

---

## 🟡 TIER 3 — Premium Polish

### 3.1 Voice-First Agent Mode 🔲
**Yang sudah ada:** PTT button, TTS.
- Wake word "Hey Yuyu" → Web Speech API continuous
- PTT → langsung trigger agent loop
**File:** `src/components/VoiceBtn.jsx`

### 3.2 Snippet Library dengan AI 🔲
**Yang sudah ada:** SnippetLibrary panel di panels.tools.jsx.
- /snippet save/use dengan AI adapt ke context
**File:** `src/components/panels.tools.jsx`, `src/hooks/useSlashCommands.js`

### 3.3 Commit Message AI — /commit command 🔲
- /commit → analyze changed files → generate semantic commit → push
- Breaking change detection, scope otomatis
**File:** `src/hooks/useSlashCommands.js`, `src/hooks/useDevTools.js`

### 3.4 Error Lens — Inline error display 🔲
**Yang sudah ada:** gutter marker lint (yc_lint).
- Error message tampil inline di baris (bukan hanya dot)
- Periodic ESLint via yuyu-server → inject ke CM diagnostics
- 1 tap → agent auto-fix
**File:** `src/components/FileEditor.jsx`

### 3.5 Multi-cursor AI Edit 🔲
**Yang sudah ada:** multi-cursor Ctrl+D.
- Select multiple → "AI: rename all?" context menu
- Region select → "AI: refactor this block"
**File:** `src/components/FileEditor.jsx`

### 3.6 Keyboard Shortcut Row Customizable 🔲
**Yang sudah ada:** KeyboardRow.jsx fixed symbols.
- Drag-reorder, add custom symbols, per-project save ke YUYU.md
**File:** `src/components/KeyboardRow.jsx`, `src/components/panels.tools.jsx`

---

## 🔵 TIER 4 — Ambitious / Experimental

### 4.1 Self-Healing App — Runtime Error Recovery 🔲
- xterm.js output → intercept runtime errors → auto-trigger agent fix
- "Auto-fix mode" toggle
**File:** `src/components/Terminal.jsx`, `src/hooks/useAgentLoop.js`

### 4.2 Codebase Q&A — /ask upgrade 🔲
**Yang sudah ada:** /ask untuk one-shot model override.
- /ask "bagaimana flow auth?" → agent trace + explain (bukan hanya grep)
- Kimi K2 262K context → bisa hold full codebase
**File:** `src/hooks/useSlashCommands.js`

### 4.3 Automated Changelog Generation 🔲
- /changelog → HEAD vs last release tag → grouped changelog
- Auto-update README
**File:** `src/hooks/useSlashCommands.js`

### 4.4 Live Performance Profiler 🔲
- PerformanceObserver di live preview srcdoc
- Render time, JS time, memory — flag komponen lambat
**File:** `src/components/LivePreview.jsx`

### 4.5 AI-Powered Merge Conflict Resolution 🔲
**Yang sudah ada:** MergeConflictPanel manual.
- Auto-resolve whitespace/rename conflicts
- Complex → "AI merge" per-conflict block
**File:** `src/components/panels.git.jsx`

---

## 📋 CONTEXT UNTUK SESI BERIKUTNYA

### State saat ini v4.2 (post perf sprint):
- Version: 4.2.0
- Tests: 1031 ✅ (+370 dari v4.1)
- Slash commands: ~68
- Done: YUYU.md, Visual Diff Review, Ghost Text L1+L2, reject feedback, /review --all, contextual slash
- CI: CodeQL ✅ · Semgrep ✅ · SonarCloud Quality Gate ✅ · DeepSource ✅
- SonarCloud: Security A · Maintainability A · Coverage 70% ✅
- vitest@1 → vitest@3, jsdom → happy-dom, 16s → 9s ✅
- 0 lint warnings ✅

### Urutan wajib sesi berikutnya (tidak ada yang dilewat):
```
0.  DeepSource — selesaikan sisa issues (226 total, sudah fix JS-0002/0073/0123/0833)
1.  1.4  Parallel Agent Swarm v2
2.  2.2  Auto test generation post-write hook
3.  2.3  Smart context compression v2
4.  2.1  Click-to-edit live preview
5.  2.4  Dependency graph visual
6.  3.4  Error Lens inline
7.  3.3  Commit Message AI /commit
8.  3.2  Snippet Library upgrade
9.  3.5  Multi-cursor AI edit
10. 3.6  Keyboard Row customizable
11. 3.1  Voice-First Agent Mode
12. 4.2  Codebase Q&A /ask upgrade
13. 4.3  Changelog generation
14. 4.1  Self-Healing Runtime
15. 4.4  Live Performance Profiler
16. 4.5  AI Merge Conflict Resolution
```

### Hot files — baca dulu sebelum mulai:
- `src/hooks/useAgentLoop.js`
- `src/hooks/useSlashCommands.js`
- `src/features.js`
- `src/components/FileEditor.jsx`

### Release command:
```bash
npm run lint && npx vitest run
node yugit.cjs "release: vX.X — deskripsi"
```

### Reminder zip:
Kirim **hanya file yang disentuh** — cek `git diff --name-only HEAD`.

---

> "Berat, Lama, Susah Bukan Hambatan."
> Tidak ada fitur yang dilewat. Satu per satu sampai selesai. 🚀

## 🆕 Project Management (PRIORITY)
- New Project flow — buat folder baru + pilih template
- Open Project — browse/ketik path folder lain  
- Recent Projects — list project yang pernah dibuka
- Blank workspace state — tanpa auto-load yuyucode folder
