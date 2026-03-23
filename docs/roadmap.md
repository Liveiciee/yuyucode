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

---

## 🔴 Tier 1 — Game Changers

### Project Management (PRIORITY)
**Gap**: YuyuCode auto-loads the yuyucode project — there's no first-run experience or project switcher.

What's needed:
- **New Project** — blank workspace, pick folder or create new, optional `/scaffold` template
- **Open Project** — browse filesystem or type path, recent projects list
- **Recent Projects** — persisted list of last N opened folders, one-tap switch
- **Blank state** — no folder pre-loaded by default on first launch

### Parallel Agent Swarm v2
**Gap vs Cursor**: Cursor runs background agents in isolated VMs. YuyuCode `/bg` is single-instance.

What's being added:
- `/bg task1 && /bg task2` → max 3 agents in parallel worktrees
- Progress dashboard: all agents simultaneously (running/done/stuck/error)
- Rate limit aware queue: throttle → queue → execute one at a time
- `/bgkill all` → abort all simultaneously
- Auto-merge: done → show diff, one tap merge

### Rate Limit Seamless Fallback
**Gap**: Cerebras 429 shows "tunggu 60s" countdown. Should be transparent.

What's needed:
- On Cerebras rate limit → silent switch to Groq fallback mid-generation
- No user-visible interruption
- Partial response preserved, generation continues with fallback model

---

## 🟠 Tier 2 — Significant Upgrades

### Histogram Diff Algorithm
**Gap**: Myers diff algorithm is O(n²) worst case — benchmarks show **0 ops/sec** for 5000-line all-changed diffs. On a Snapdragon 680 editing large files, this causes visible freeze.

Switch to histogram/patience diff (O(n log n)) — the same algorithm Git and VSCode use. Impact is most visible when agent applies large rewrites.

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

## Current State (v4.4.2)

```
Tests:          1124 ✅
Slash commands: ~68
CI:             CodeQL ✅ · Semgrep ✅ · SonarCloud ✅ · DeepSource ✅
Coverage:       80%
Platform:       Oppo A77s, Snapdragon 680, Android 14
```
