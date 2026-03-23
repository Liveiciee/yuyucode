# Diff Review

Diff Review is YuyuCode's mechanism for pausing the agent loop before any file write, letting you inspect and approve or reject changes with full context.

## Enabling

```bash
/config
```

Toggle **Diff Review** in the config panel. The state persists across sessions via `Preferences`.

## How It Works

When Diff Review is on, the agent loop intercepts `patch_file` and `write_file` actions before executing them:

```
Agent produces patch_file / write_file action
    │
    ▼
Read original file from disk
    │
    ▼
Pre-compute diff (Myers algorithm via `diff` library)
    │
    ▼
Mark action as executed: false (pending)
    │
    ▼
Push message to chat with DiffReviewCard
    │
    ▼
Loop returns early — paused
    │
    ▼ User action
   ┌─────────────┬─────────────┐
   │ Accept      │ Reject      │
   ▼             ▼             
Execute writes  Send rejection
+ backup        reason to AI
+ verify syntax → agent self-corrects
+ auto-resume   → loop continues
```

## The Diff Format

Diffs are generated with `generateDiff()` in `src/utils.js` using the `diff` library (Myers algorithm):

```
- L12: const timeout = 5000;
+ L12: const timeout = 10000;
```

Each line is prefixed with its line number. Maximum 60 lines shown per diff — longer diffs show a `... (baris lebih)` truncation marker.

## Accepting Changes

**Accept all** — executes all pending writes in the current message simultaneously.

**Accept per file** — executes one file at a time. The loop waits until all writes in the message are resolved before resuming.

On accept:
1. Original file is backed up to `editHistory` (for `/undo`)
2. Write is executed via `executeAction()`
3. If multiple files fail in an atomic write, all are rolled back
4. Syntax is verified: `.js`/`.cjs`/`.mjs` via `node --check`, `.json` via `python3 -m json.tool`, `.sh` via `bash -n`
5. Auto-resume fires via `sendMsgRef` once all pending writes are resolved

## Rejecting Changes

Rejection sends a structured message back to the agent:

```
❌ User menolak perubahan ke: src/api.js

Coba pendekatan lain atau tanya dulu apa yang diinginkan sebelum menulis ulang.
```

The agent receives this as a new user message and continues the loop — it does not start over. Typically it re-reads the file, adjusts its approach, and produces a new `patch_file` with a different strategy.

## Atomic Rollback

For multi-file writes, `useApprovalFlow` implements atomic semantics:

- All targets are backed up before any write starts
- If any write fails, all backups are restored in parallel
- A rollback message is shown: `❌ Atomic write gagal (N file). Rollback.`

This prevents partial writes where some files were updated and others weren't.

## Auto-Resume Logic

After all writes in a message are executed, `autoResumeIfAllDone()` checks if every `write_file` and `patch_file` action in the message has `executed: true`. If so, it fires:

```
✅ Semua perubahan disetujui dan berhasil ditulis: src/api.js, src/utils.js

Lanjutkan task.
```

This message is sent via `sendMsgRef` — it re-enters the agent loop as a new user message, which causes the agent to continue the task from where it paused.

## Syntax Verification

After accepting a write (when `exec` permission is enabled), each written file is syntax-checked:

| Extension | Command |
|-----------|---------|
| `.js` `.cjs` `.mjs` | `node --check file.js` |
| `.json` | `python3 -m json.tool file.json` |
| `.sh` | `bash -n file.sh` |

If a syntax error is found, the error is shown in chat and a fix is automatically triggered:

```
Fix syntax error di src/api.js:
```
SyntaxError: Unexpected token '}'
```
```

## Plan Mode

Diff Review also applies to `/plan` — the planned execution mode where the agent generates a numbered list of steps before acting.

When a plan is approved via `handlePlanApprove()`, each step is executed with `executePlanStep()`. Write actions from each step are surfaced as DiffReviewCards, giving you per-step control over what gets written.

## Undo

All writes that pass through Diff Review (and auto-execute mode) are backed up to `editHistory`. Use `/undo` or `/undo N` to roll back the last N writes regardless of whether Diff Review was on.
