# Roadmap

YuyuCode's development is tracked in `NEXT_SESSION_PLAN.md`. Every feature has a tier based on impact. Nothing is skipped — each item is implemented in order.

> "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."

## Vision

**"The Phone That Codes Like a Senior Engineer"**

Benchmark: feature-parity with Cursor Pro ($20/month) — free, offline-capable, from a $130 phone.

---

## ✅ Completed

### v4.0
- Visual Diff Review — DiffReviewCard, Myers diff, pause loop, toggle in /config
- AI Ghost Text L1+L2 — 300ms/900ms, Tab/Tab+Tab accept
- YUYU.md — auto-load, system prompt injection, /rules command

### v4.1
- Reject feedback loop — rejection reason sent to AI, agent self-corrects
- /review --all — batch review all files changed vs HEAD, severity grading
- Contextual slash suggestions — fuzzy match + context boost

### v4.2
- 1031 tests passing (from 546)
- Branch coverage infrastructure — 363 new tests targeting SonarCloud conditions
- Property-based tests via fast-check
- vitest@3 + happy-dom — 16s → 9s test run
- SonarCloud: Security A · Maintainability A · Coverage 70%
- /review --all, /search, /pin, /undo N, /diff, /ask aliases

### v4.3
- Test infrastructure hardening — mock isolation fixed, `resetAllMocks` pattern
- `useFileStore` + `useApprovalFlow` test fixes after approval flow refactor
- `useDb` singleton isolation pattern (`loadFresh(platform)`)

### v4.4
- **SQLite persistence** — `useDb.js` with FTS5 full-text search, automatic Preferences migration
- **useSlashCommands cognitive complexity refactor** — `pushMsg`, `stopLoop`, `makeLoopMsg`, `mcpList/Connect/Disconnect`, `reviewAll/File` extracted
- 1124 tests passing (from 1031)
- Coverage: **80%** (from 70%)
- LivePreview `TermIcon` fix
- TicTacToe game component — agentic benchmark

### v4.5
- **Project Manager** — recent projects, browse filesystem, create new, auto-open on first run
- **Entry UX** — empty chat welcome screen, server-down guidance, onboarding → ProjectManager
- **Seamless rate limit fallback** — Cerebras → Kimi K2 → Llama 70B → Llama 8B chain, `⚡` notification without stopping agent
- **Histogram diff** — chunked O(n) for large files, 5000-line worst case: 0 → 2,482 ops/sec
- **SonarCloud Blocker 0 · High 0** — `useDb.test.js` blocker fix + nesting refactor across `App.jsx`, `api.js`, `AppChat.jsx`, `MsgBubble.jsx`
- **DeepSource config** — `.deepsource.toml`, ShellCheck suppression, `.gitignore` hygiene, MIT `LICENSE`
- **1235 tests passing** (from 1124)

---

## 🔴 Tier 1 — Game Changers

### Parallel Agent Swarm v2
**Gap vs Cursor**: Cursor runs background agents in isolated VMs. YuyuCode `/bg` is single-instance.

What's being added:
- `/bg task1 && /bg task2` → max 3 agents in parallel worktrees
- Progress dashboard: all agents simultaneously (running/done/stuck/error)
- Rate limit aware queue: throttle → queue → execute one at a time
- `/bgkill all` → abort all simultaneously
- Auto-merge: done → show diff, one tap merge

---

## 🟠 Tier 2 — Significant Upgrades

### Click-to-Edit in Live Preview
Click an element in the iframe → popup "edit this?" → agent patches CSS/JSX directly. Inspector mode: hover → show component name + file path.

### Auto Test Generation
After agent writes a new function → auto-suggest "Generate tests?". Coverage badge in header from vitest --coverage. Failed test → one tap agent auto-fix.

### Smart Context Compression v2
Current `/compact` is lossy recursive summary. Next version: semantic chunking (extract `[FILE_EDIT]`, `[ERROR_FIX]`, `[ARCH_DECISION]`), discard verbose explanations, show "47K → 12K, 94% signal".

### Dependency Graph Visual
Interactive D3 force-directed graph of inter-file imports. Tap node → jump to file. Circular dependency → red highlight.

---

## 🟡 Tier 3 — Premium Polish

| Feature | Description |
|---------|-------------|
| Voice-First Agent Mode | Wake word "Hey Yuyu" → continuous Web Speech API, PTT → trigger agent |
| Snippet Library + AI | /snippet save/use with AI adapting to current context |
| Commit Message AI | /commit → analyse changed files → semantic commit message → push |
| Error Lens | Inline error display at the offending line, 1 tap auto-fix |
| Multi-cursor AI Edit | Select multiple occurrences → "AI: rename all?" context menu |
| Keyboard Row Customisable | Drag-reorder symbols, per-project save to YUYU.md |

---

## 🔵 Tier 4 — Ambitious

| Feature | Description |
|---------|-------------|
| Self-Healing App | xterm output → intercept runtime errors → auto-trigger agent fix |
| Codebase Q&A | /ask upgrade: trace + explain architecture, not just grep |
| Changelog Generation | /changelog → HEAD vs last release → grouped changelog |
| Live Performance Profiler | PerformanceObserver in live preview srcdoc, flag slow components |
| AI Merge Conflict Resolution | Auto-resolve whitespace/rename, AI merge for complex conflicts |

---

## Current State (v4.6.0)

```
Tests:          1216 ✅
Slash commands: ~68
CI:             CodeQL ✅ · Semgrep ✅ · SonarCloud ✅ · DeepSource ✅
SonarCloud:     Blocker 0 · High 0 · Security A · Maintainability A
Coverage:       ~80% statements / ~85% branches
Platform:       Oppo A77s, Snapdragon 680, Android 14
Diff:           Histogram chunked (O(n) large files)
Fallback chain: Cerebras → Kimi K2 → Llama 70B → Llama 8B
Security:       AES-256-GCM encrypted key storage (runtimeKeys.js)
Wake word:      "Hey Yuyu" — Web Speech API continuous detection
```

## Mobile-First Execution Plan (V2)

Semua fase ini diprioritaskan agar **jalan stabil di HP (Snapdragon 680, 8GB RAM)**:

1. **Reliability Gate (Now)**
   - Jalankan `npm run health:mobile` sebelum merge release.
   - Wajib lulus lint + test kritikal + build.
2. **Runtime Safety (Next)**
   - Tambah watchdog untuk background agents (max restart budget + backoff).
   - Batasi memory spike per fitur (live preview, diff, swarm).
3. **UX Stability (Next+)**
   - Graceful degradation saat offline / server down untuk command kritikal.
   - Telemetry ringan lokal (tanpa network) untuk crash hotspots.
4. **Performance Budget (Release Gate)**
   - Tetapkan budget startup, input latency, dan render chunk per release.
   - Tolak merge jika budget melewati ambang yang disepakati.
