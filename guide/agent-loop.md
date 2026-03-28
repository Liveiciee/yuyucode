# Agent Loop

The agent loop is the core of YuyuCode. It lives entirely in `src/hooks/useAgentLoop.js` and is never split across files — this is an explicit architectural constraint enforced by `YUYU.md`.

## Flow

```
User input
    │
    ▼
/slash command? ──yes──► handleSlashCommand()
    │ no
    ▼
checkServerHealth()  ── fail ──► show error, abort
    │ ok
    ▼
gatherProjectContext()  [parallel reads]
  ├── .yuyu/handoff.md
  ├── YUYU.md
  ├── llms.txt (first 80 lines)
  ├── .yuyu/map.md (first 120 lines)
  ├── tree (depth 2)
  └── keyword-matched files (up to 5)
    │
    ▼
Auto-compact?  (context > 80K chars AND messages > 12)
    │
    ▼
┌─────────────────────────────────┐
│         MAIN LOOP (≤ MAX_ITER)  │
│                                 │
│  buildSystemPrompt()            │
│    └── BASE_SYSTEM              │
│    └── effort config suffix     │
│    └── YUYU.md rules            │
│    └── AGENTS.md                │
│    └── pinned files             │
│    └── open file preview        │
│    └── TF-IDF ranked memories   │
│    └── learned style            │
│                                 │
│  callAI() → streaming reply     │
│                                 │
│  parseActions(reply)            │
│    ├── read_file   ──┐          │
│    ├── web_search   ├── parallel│
│    ├── list_files   │           │
│    ├── tree        ─┘          │
│    ├── exec  ──────── serial   │
│    └── mcp   ──────── serial   │
│                                 │
│  patch_file / write_file:       │
│    diffReview ON  → pause loop  │
│    diffReview OFF → auto-exec   │
│      └── backup original        │
│      └── defensive review pass  │
│      └── auto-verify (run file) │
│                                 │
│  execError? → feed back, loop   │
│  patchFail? → feed back, loop   │
│  no new data? → done            │
└─────────────────────────────────┘
    │
    ▼
setMessages() with final reply
extractMemories()
learnFromSession()
sendNotification() if iter > 1
```

## Action Execution

Actions are parsed from the AI reply as JSON blocks:

````
```action
{"type": "read_file", "path": "src/api.js"}
```
````

**Parallel actions** (all run with `Promise.all`):
- `read_file`
- `web_search`
- `list_files`
- `tree`
- `search`
- `mkdir`
- `file_info`
- `find_symbol`
- `move_file`

**Serial actions** (executed in order):
- `exec`
- `mcp`

**Write actions** (special handling):
- `patch_file` — 3-fallback strategy: exact match → whitespace-normalized → trim-lines
- `write_file` — full replacement with automatic backup to `editHistory`

## Diff Review Mode

When `diffReview` is enabled in `/config`, the loop pauses before applying any write:

1. Agent pre-computes diffs using the `diff` library (Myers algorithm)
2. Loop `return`s — it does not `break`; state is saved
3. User sees DiffReviewCard with per-file colour-coded diff
4. **Accept** → `useApprovalFlow.handleApprove()` executes pending writes, calls `sendMsgRef` to resume
5. **Reject** → rejection reason is sent back to the AI as a new user message; agent self-corrects and retries without full restart

## Auto-Verify Writes

After a successful `write_file`, if `exec` permission is enabled, the loop runs the written file:

- `.js`/`.mjs`/`.cjs` → `node file.js 2>&1 | head -30`
- `.py` → `python3 file.py 2>&1 | head -30`
- `.sh` → `bash file.sh 2>&1 | head -30`
- `.test.*` → `npx vitest run file 2>&1 | tail -20`

If the output contains `error|exception|traceback|...`, the output is fed back to the AI as a new message and the loop continues.

## Defensive Review Pass

After writing files (when `exec` permission is enabled), a lightweight security review pass runs:

- A secondary AI call checks the newly written code for missing input validation, unhandled edge cases, and potential crashes
- If issues are found, `patch_file` actions are applied automatically
- If the code is clean, the model replies only `"LGTM"` and the pass costs one extra API call

## Auto-Compact

When total context characters exceed `AUTO_COMPACT_CHARS` (80,000) and message count exceeds `AUTO_COMPACT_MIN_MSG` (12), the loop compacts inline using `llama3.1-8b` (fast, cheap) before the next iteration. The compact runs as an inline call — it does not reset the abort controller or loading state.

## Effort Levels

Three effort presets control `maxTokens`, `maxIter`, and system prompt suffix:

| Level | Max Tokens | Max Iter | Use Case |
|-------|-----------|---------|---------|
| `low` | 1500 | 3 | Quick questions, one-liners |
| `medium` | 2048 | 10 | Default — most tasks |
| `high` | 4000 | 20 | Complex refactors, multi-file changes |

Switch with `/effort low\|medium\|high`.
