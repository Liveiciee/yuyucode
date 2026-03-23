# Changelog

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
  - `useSlashCommands.js`: complexity 338 → 25+ extracted handler functions
  - `useAgentLoop.js`: extracted `executePatchActions`, `executeWriteActions`, `buildIterFeedback`
  - `api.js`: extracted `parseSSELine`, `_callGroqWithRetry`, `_callCerebrasWithFallback`
  - `utils.js`: extracted `ACTION_DISPATCH` map, per-language highlight helpers
- SonarCloud: Security A · Maintainability A · Coverage 70%

---

## v3.x

Agentic loop foundation, background agents, multi-tab editor, live preview, terminal, realtime collaboration, perceptual brightness compensation, TF-IDF memory, agent swarm pipeline.
