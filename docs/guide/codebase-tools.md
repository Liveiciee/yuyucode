# Codebase Tools

YuyuCode ships three CLI scripts that maintain the codebase context injected into every agent call.

## yuyu-map.cjs

Generates the context files the agent reads before every task.

```bash
node yuyu-map.cjs             # generate all
node yuyu-map.cjs --verbose   # show progress
node yuyu-map.cjs --compress-only  # only update compressed.md
```

### What it generates

**`.yuyu/map.md`** — Symbol index with salience scores. Every exported function, hook, component, and constant, ranked by how "hot" the file is (size × recency × import frequency). The agent reads the first 120 lines before every task to understand the codebase structure.

```markdown
## 🔥 `src/hooks/useAgentLoop.js` _(686L, salience:2)_
- 🪝 `useAgentLoop({ project, chat, file, ui, ... })`

## ⭐ `src/features.js` _(423L, salience:24)_
- ƒ `runBackgroundAgent(task, folder, callAI, onDone)`
- ƒ `tfidfRank(memories, queryText, topN)`
```

**`.yuyu/compressed.md`** — Repomix-style compressed representation. Function signatures with bodies stripped — ~70% token reduction vs full source. Injected when the user's message contains keywords like `refactor`, `overhaul`, or `codebase`.

**`llms.txt`** — High-level project brief for LLMs. Standard format, injected into context as background info.

**`.yuyu/handoff.md`** — Session handoff template (only created if it doesn't exist).

### Incremental updates

`yuyu-map.cjs` runs `git diff --name-only HEAD` before scanning. Only changed files are re-analyzed. Unchanged files use cached symbols. This makes it fast enough to run after every commit.

### Symbol types

| Icon | Type |
|------|------|
| 🪝 | React hook (`useXxx`) |
| ⚛ | React component (uppercase) |
| ƒ | Regular function |
| ◆ | Exported constant |

---

## yuyu-bench-ci.cjs

CI benchmark runner. Runs `vitest bench` and converts output to the format expected by `benchmark-action/github-action-benchmark`.

```bash
node yuyu-bench-ci.cjs
# Output: .yuyu/bench-ci.json
```

### Output format

```json
[
  { "name": "getLangExt — single call", "unit": "ops/sec", "value": 981449 },
  { "name": "parseActions — 1 action block", "unit": "ops/sec", "value": 1780000 }
]
```

This JSON is consumed by the `bench.yml` workflow, which stores historical results in the `gh-pages` branch and deploys the benchmark dashboard.

### Parsing strategy

Parses vitest's verbose bench output line by line:
```
  · single call — jsx    981,449.94  0.0009  ...
```

Strips ANSI escape codes, extracts name and hz value, converts to JSON array.

---

## yuyu-server.js

The local HTTP + WebSocket server. See [YuyuServer](/guide/yuyu-server) for full documentation.

---

## Workflow

The recommended workflow after any significant change:

```bash
# 1. Tests must pass
npx vitest run               # 1124/1124

# 2. Lint must be clean
npm run lint                 # 0 problems

# 3. Update codebase map
node yuyu-map.cjs            # regenerate context files

# 4. Commit
node yugit.cjs "feat: ..."
```

The agent reads `.yuyu/map.md` at the start of every session. If you forget to run `yuyu-map.cjs` after adding new files or functions, the agent won't know they exist until it reads them directly.
