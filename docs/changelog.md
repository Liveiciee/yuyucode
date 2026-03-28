## bashrc-additions.sh v5.0 — Neko-Edition

**Shell environment major release.**

- **Dual-Brain AI** — `yai-setup` wizard adds OpenAI / Grok / Ollama support; falls back to local Neko Mode on failure or when disabled
- **`yai` / `yai-analyze` / `yai-code`** — chat, auto-error-analysis, code generation from the terminal
- **`ybrain`** — shows current intelligence mode (AI provider or Neko Mode)
- **SQLite metrics** — `ymetrics` shows 7-day crash/restart/request stats via `~/.yuyu-server.db`; uses `BEGIN IMMEDIATE` transactions (no race conditions)
- **Compressed backups** — `yapply` now creates `.tar.gz` backups before every apply, auto-rotates to keep last 5
- **`yrestore`** — interactive restore from any compressed backup
- **`yapply` flags** — `--dry-run`, `--skip-tests`, `--force`; jittered exponential backoff on server crashes
- **`yprofile`** — device profile (CPU temp, disk, uptime, Node options)
- **`yreset`** — clear crash counter to re-enable auto-restart after max crashes
- **Atomic writes** — all PID/counter writes use `flock` to prevent partial-write corruption
- **Security** — no `yexec` command; all ops via `yuyu-server.js` API; JSON built with `jq` to prevent injection; AI key chmod 600

---

# Changelog

## v4.6.0

**Kebaikan penuh V2 — integrity + docs sync.**

- Dev toolchain moved to Vite 8-compatible settings and dependency set (`vite`, `@vitejs/plugin-react`, `happy-dom`) to keep local dev/test/build aligned with current ecosystem.
- `runtimeKeys` hardened for Node/test/Capacitor runtime differences (buffer-aware encoding path + guarded Preferences fallback behavior).
- AI orchestration and websocket paths lint-hardened to avoid hidden dead-code/error-swallowing regressions.
- Slash command `/search` now has dedicated unit coverage (`handlers/chat.test.js`) including empty query, no-result, success, and error scenarios.
- Slash `/sessions` load path switched to direct import to remove ineffective dynamic import warning in production build.
- Test baseline updated: 51 test files, 1216 passing tests.
- Added dedicated unit coverage for `/bg`, `/db`, `/mcp`, `/plan` command handlers.
- Testing guide updated with current test totals and required build smoke-check command.
- Added a new slash-command sequence smoke test (`/bg -> /status -> /plan -> /db`) to guard critical mobile workflow dispatch regressions.
- `health:mobile` now runs critical handler suites and sequence smoke checks, not only single-command dispatch smoke.
- Fixed `vitest` coverage include path drift (`yuyu-server.cjs`) and script exclude path (`scripts/yugit.cjs`) to keep coverage config aligned with real files.
- Test baseline updated: 50 test files, 1215 passing tests.
- Added dedicated unit coverage for `/bg`, `/db`, `/mcp`, `/plan` command handlers.
- Testing guide updated with current test totals and required build smoke-check command.

## v4.5.8

**Stable QA baseline.**

- Test suite: **1235 passing** (from 1124)
- Lint: 0 problems
- SonarCloud: Blocker 0 · High 0 · Security A · Maintainability A
- DeepSource: 226 non-blocker issues remaining (JS-C1002, JS-R1005, JS-0067 — all intentional patterns, documented)
- Coverage: ~75% (target 85% next sprint)

---

## v4.5.7

**DeepSource configuration & project hygiene.**

- `.deepsource.toml` — comprehensive analyser config for JavaScript + Shell
- ShellCheck suppression annotations for intentional patterns in `bashrc-additions.sh`
- `.gitignore` updated — added Termux artefacts, `.yuyu/compressed.md` output, bench temp files
- `LICENSE` — MIT licence added (was missing from repo)
- `DEEPSOURCE_DSN` secret wired to CI `quality.yml` — DeepSource reports now appear per-push

---

## v4.5.6

**SonarCloud High severity — nesting refactor.**

- `App.jsx` — extracted `renderContent()` helper; conditional nesting depth: 5 → 2
- `api.js` — extracted `handleRateLimit()` and `retryWithFallback()` — retry nesting: 4 → 1
- `AppChat.jsx` — extracted `renderTabContent()` — nested ternary chain replaced with lookup map
- `MsgBubble.jsx` — extracted `renderActionBlock()` — switch-in-switch eliminated
- SonarCloud High issues: 4 → 0

---

## v4.5.5

**SonarCloud Blocker fix + test hardening.**

- `useDb.test.js` L113 — added missing `expect(mockDb.execute).not.toHaveBeenCalled()` assertion (was Blocker)
- SonarCloud Blocker issues: 1 → 0
- +111 tests across error-handling paths and edge cases missed by previous coverage sweep
- Tests: **1124 → 1235 passing**
- Coverage: 80% → ~75% (expanded test surface revealed uncovered branches — tracked for next sprint)

---

## v4.5.4

**Entry UX overhaul.**

- `clearChat()` now sets `messages: []` so empty state welcome screen shows on new chat
- Onboarding screen redirects to ProjectManager instead of manual folder input
- Empty chat state: welcome message + 6 suggestion buttons (review, test, plan, tree, status, rules)
- Server down guidance: `node ~/yuyu-server.js &` command shown inline in status bar
- `useUIStore.loadUIPrefs` no longer triggers `showOnboarding` — first run handled by ProjectManager auto-open

---

## v4.5.3

**First-run experience.**

- Default folder changed from hardcoded `'yuyucode'` to `''`
- App auto-opens ProjectManager on first launch when no `yc_folder` saved in Preferences
- `useProjectStore.test.js` updated: initial `folder` default is now `''`

---

## v4.5.2

**Histogram diff — performance fix.**

- `generateDiff()` now uses chunked approach for files >2000 lines
- Chunks 500 lines at a time → avoids O(n²) Myers blowup on large all-changed files
- Worst case benchmark: `5000 lines all changed` went from **0 ops/sec → 2,482 ops/sec**
- Files ≤2000 lines still use Myers via `diffLines` (accurate, fast)
- Identical files exit immediately (early return before any diff computation)

---

## v4.5.1

**Seamless rate limit fallback.**

- `GROQ_FALLBACK_CHAIN` — on Cerebras 429, tries in order: Kimi K2 → Llama 3.3 70B → Llama 8B Fast
- Each fallback attempt calls `options.onFallback?.(model)` — agent loop shows `⚡ Rate limit — lanjut pakai kimi-k2` without stopping
- Only falls back to countdown timer if ALL Groq models are also rate-limited
- `AppHeader.jsx` lint: `saveFolder` → `_saveFolder`

---

## v4.5.0

**Project management.**

- `panels.project.jsx` — new Project Manager panel with three tabs: Recent, Browse, New
- Recent projects: `yc_recent_projects` Preferences key, max 10, sorted by `lastOpened`
- Browse tab: filesystem navigation via `callServer list`, "Buka ini" button opens current dir
- New tab: create folder + optional name, auto-opens after creation
- `switchProject(f)` in `App.jsx`: sets folder, adds to recent, loads folder prefs, resets chat with welcome message
- `AppHeader.jsx`: folder input replaced with `FolderOpen` button + clickable title area
- `useProjectStore`: `recentProjects`, `addRecentProject`, `removeRecentProject`, `loadRecentProjects`
- `useUIStore`: `showProjectManager` state added

---

## v4.4.2

**Fix: LivePreview + panels export.**

- Fixed `TermIcon` not imported in `LivePreview.jsx` — caused white screen when opening iframe preview
- Fixed literal `\n` in `panels.jsx` TicTacToe barrel export — caused Vite build failure in CI
- Added `TicTacToe.jsx` game component — agentic benchmark for testing code generation quality

---

## v4.4.1

**Fix: useSlashCommands cognitive complexity refactor.**

- Extracted `pushMsg()` / `pushErr()` helpers — eliminated ~60 duplicate `setMessages` inline calls
- Extracted `makeLoopMsg()` / `stopLoop()` — loop interval nesting depth: 4 → 1
- Extracted `mcpList()` / `mcpConnect()` / `mcpDisconnect()` module-level functions
- Extracted `reviewAll()` / `reviewFile()` — `handleReview` reduced to clean if/else dispatch
- `handleRules` now uses lookup object instead of if/else if chain
- `handleMcp` dispatch: 3-line lookup map
- 197 tests for `useSlashCommands` — 94% coverage
- Cognitive complexity: significantly reduced across all handlers

---

## v4.4.0

**SQLite persistence via useDb.**

- `useDb.js` — SQLite layer using `@capacitor-community/sqlite` v8
- Schema: `messages`, `messages_fts` (FTS5 full-text search), `memories`, `checkpoints`
- Graceful fallback to Capacitor `Preferences` on web/emulator
- `migrateFromPreferences()` — one-time migration from existing Preferences data
- `/db` slash command now routes queries to SQLite via MCP tool
- 36 tests for `useDb` — 97% coverage (SQLite + Preferences fallback paths)
- Overall test coverage: **62% → 80%** (+18%)
- Total tests: **1031 → 1124 passing**

---

## v4.3.0

**Test infrastructure hardening.**

- Fixed `useFileStore.branch.test.js` — typo `vi.spyOn(utilsModule, 'utilsModule.executeAction')` → `'executeAction'`
- Fixed `useApprovalFlow.test.js` — 5 expectations updated to match refactored implementation (`backupFiles` / `verifySyntaxBatch` now mocked directly, no longer called via `callServer`)
- `resetAllMocks` replaces `clearAllMocks` in `useSlashCommands.test.js` — prevents mock queue leaking between tests
- `useDb.test.js` — `vi.resetModules()` + dynamic import pattern (`loadFresh(platform)`) for proper singleton isolation between test groups

---

## v4.2.0

**Test suite expansion & branch coverage infrastructure.**

- +370 tests (546 → 1031 passing)
- 363 branch coverage tests targeting SonarCloud condition branches across all core hooks
- Property-based tests: `parseActions` and `resolvePath` fuzz-tested with 100 random inputs each via `fast-check`
- `vitest@1` → `vitest@3`, `jsdom` → `happy-dom`: test run time 16s → 9s
- Fixed `isolate: false` module-cache issue in Termux vitest causing false failures
- Fixed silent `resolvePath` basename dedup bug (`myproject/src/App.js` → double-prefixed to `/project/myproject/src/App.js`)
- `/review --all`: batch review all files changed vs HEAD, severity-graded output (🔴 High / 🟡 Medium / 🟢 Low)
- Contextual slash suggestions: fuzzy match + context boost from chat content
- Ghost text L2: `ghostL2Field` + 900ms debounce, 2–3 line lookahead, Tab+Tab accept
- Context bar: live token count estimate in header
- Graceful stop: ⏸ button finishes current iteration cleanly before halting
- Chat search: `/search <query>` across full history
- `/pin`, `/undo <n>`, `/diff`, `/ask <alias>`: new commands
- Offline detection: `📡 Internet terputus~` on network loss
- Read cache: reduce redundant server reads within a loop

---

## v4.1.0

**Reject feedback loop & review tooling.**

- Diff review reject: sends rejection reason to AI, agent self-corrects without full loop restart
- `useApprovalFlow.js`: extracted approval/reject/rollback logic from agent loop
- `/review --all`: introduced (full implementation in v4.2)
- Contextual slash suggestions: initial implementation
- +115 tests (`useSlashCommands` handler coverage)
- Fixed CI mock isolation issue (`vi.mock` leaking between test files)

---

## v4.0.0

**SonarCloud AAA sprint & visual diff review.**

- **Visual Diff Review**: `DiffReviewCard`, Myers diff preview (green adds / red removes), pause-loop mechanism, toggle in `/config`
- **Ghost Text L1**: `StateField` + 300ms debounce, Llama 8B, next-line prediction, Tab accept
- **YUYU.md**: auto-load from project root, injected into system prompt, `/rules` command suite, default template
- CI hardening: CodeQL SAST, Semgrep SAST, SonarCloud Quality Gate
- Security fixes: `LivePreview` postMessage origin check, `yuyu-server` log injection fix
- Cognitive complexity refactor: 14 files, all 27 SonarCloud issues addressed
- SonarCloud: Security A · Maintainability A · Coverage 70%

---

## v3.x

Agentic loop foundation, background agents, multi-tab editor, live preview, terminal, realtime collaboration, perceptual brightness compensation, TF-IDF memory, agent swarm pipeline.
