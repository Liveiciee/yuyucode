# Testing & Benchmarks

## Test Suite

1203 tests passing. 0 lint warnings. Runs on Termux ARM64 (Snapdragon 680).

- 50 property-based tests via `fast-check` — 100 random inputs each for `parseActions` and `resolvePath`
- 363 branch coverage tests targeting SonarCloud condition branches across all core hooks

```bash
npx vitest run       # run all tests (1203)
npm run lint         # must be 0 problems
npm run build        # production build smoke check
npm run health:mobile # fast phone-ready confidence gate
```

### Test Files

| File | Type | Tests |
|------|------|-------|
| `api.test.js` | Unit | 5 |
| `api.extended.test.js` | Unit + Retry/Fallback | 15 |
| `api.stream.test.js` | Unit — SSE streaming paths | 13 |
| `api.server.test.js` | Unit — callServer + batch | 16 |
| `api.orchestration.test.js` | Integration — full request orchestration | 29 |
| `utils.test.js` | Unit | 22 |
| `utils.extended.test.js` | Unit — all action types | 42 |
| `utils.integration.test.js` | Integration + Fuzz | 38 |
| `utils.snapshot.test.js` | Snapshot | 7 |
| `features.test.js` | Unit | 29 |
| `features.extended.test.js` | Unit + Edge cases | 48 |
| `features.extra.test.js` | Unit — sessions, skills, plan | 21 |
| `themes.test.js` | Schema validation — all 5 themes | 103 |
| `editor.test.js` | Unit — getLang, isEmmet, isTsLang | 21 |
| `livepreview.test.js` | Unit — buildSrcdoc | 12 |
| `multitab.test.js` | Unit — useFileStore multi-tab | 18 |
| `uistore.test.js` | Unit — useUIStore | 26 |
| `globalfind.test.js` | Unit — grep parser + regex + replace | 18 |
| `yuyu-map.test.cjs` | Unit — map, symbols, compress, handoff, llms.txt | 98 |
| `yuyu-server.test.cjs` | Integration — HTTP, read/write/patch/batch/exec | 30 |
| `useSlashCommands/index.test.js` | Unit — command dispatch | 9 |
| `useSlashCommands/handlers/batch.test.js` | Unit — /batch handler | 45 |
| `useSlashCommands/handlers/chat.test.js` | Unit — /search + clear/stop/rename paths | 8 |
| `useSlashCommands/handlers/git.test.js` | Unit — /history, /diff, /refactor | 49 |
| `useSlashCommands/handlers/model.test.js` | Unit — /model, /ask, /ab | 7 |
| `useSlashCommands/handlers/undo.test.js` | Unit — /undo, /rewind | 15 |
| `useSlashCommands/helpers/simpleResponse.test.js` | Unit — simpleResponse helper | 14 |
| `useSlashCommands/helpers/withLoading.test.js` | Unit — withLoading wrapper | 23 |
| `api.branch.test.js` | Branch coverage — api.js | 12 |
| `branch.coverage.test.js` | Branch coverage — utils.js executeAction/resolvePath | 22 |
| `features.branch.test.js` | Branch coverage — features.js | 27 |
| `features.bgagent.test.js` | Branch coverage — background agent | 11 |
| `useFileStore.branch.test.js` | Branch coverage — useFileStore | 14 |
| `useAgentLoop.branch.test.js` | Branch coverage — agent loop conditions | 39 |
| `useDb.test.js` | Unit — SQLite + Preferences fallback paths | 36 |
| `runtimeKeys.test.js` | Unit — KeyStore encrypt/decrypt/expiry/integrity | 26 |
| `utils.coverage.test.js` | Coverage — generateDiff edge cases | 6 |

### Why vitest@3

`vitest@4` crashes with `Illegal instruction` on Snapdragon 680 (ARM64). The crash is in the test runner's native bindings. The pin is enforced in `package.json` and `YUYU.md`. Do not upgrade.

### Why `isolate: false` is forbidden

With `isolate: false`, `vi.mock()` and `vi.hoisted()` state leaks between test files. Tests pass in isolation but fail in the full suite. The default (isolated) mode is always used.

---

## Benchmarks

### 📱 Device — Termux ARM64 (Snapdragon 680)

Oppo A77s, 8GB RAM. These are the numbers that matter — they reflect the actual feel on the target device.

| Benchmark | Result | What it means |
|-----------|--------|---------------|
| Language detection (single) | 5.08× faster | Triggers on every file open |
| Language detection (10 files) | 4.48× faster | Workspace load scan |
| TypeScript detection | 4.55× faster | TS-specific tooling activation |
| Build JS preview (srcdoc) | 4.52× faster | Rebuilds on every keypress |
| Multi-tab open (50 tabs) | **35.57×** faster | EditorState swap vs remount |
| Myers diff (500 lines) | **5545×** faster | Diff review pre-computation |
| Extract symbols (500 lines) | 206× faster | Codebase map generation |
| Compress source (500 lines) | 634× faster | Context compression |
| Parse actions (mixed) | 80× faster | Agent loop hot path |

> The Myers diff number isn't a typo. Small diffs exit the algorithm early — the benchmark tests the large-diff case against a naive approach.

### 🖥️ CI — Ubuntu x86_64 (GitHub Actions)

[![Benchmark](https://github.com/liveiciee/yuyucode/actions/workflows/bench.yml/badge.svg)](https://liveiciee.github.io/yuyucode/dev/bench/)

Historical chart: **[liveiciee.github.io/yuyucode/dev/bench](https://liveiciee.github.io/yuyucode/dev/bench/)**

Runs on every push to `main`. Alerts via commit comment on >150% regression from baseline. CI numbers differ from device benchmarks (x86_64 vs ARM64) — both are intentional. Device bench for real-world feel, CI bench for stable regression detection across commits.

```bash
npm run bench        # run benchmarks
npm run bench:save   # set current results as baseline
npm run bench:reset  # clear baseline
```

---

## Quality Gates

| Service | Metric | Status |
|---------|--------|--------|
| SonarCloud | Security | A |
| SonarCloud | Maintainability | A |
| SonarCloud | Blocker issues | 0 |
| SonarCloud | High issues | 0 |
| SonarCloud | Coverage | ~75% |
| DeepSource | Active issues | 226 (non-blocker, tracked) |
| CodeQL | SAST | passing |
| ESLint | Warnings | 0 |
