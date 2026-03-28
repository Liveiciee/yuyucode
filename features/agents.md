# Agent System

YuyuCode has three distinct agent modes: the standard loop, background agents, and the swarm pipeline.

## Standard Agent Loop

The default mode. Every message triggers an agent loop that runs up to `MAX_ITER` iterations (default 6, configurable with `/effort`). See [Agent Loop](/guide/agent-loop) for the full flow.

---

## Background Agents

Background agents run tasks in isolated git worktrees, keeping your main branch clean throughout.

### Starting a Background Agent

```bash
/bg refactor the authentication module to use JWT
```

This creates a new git worktree at `/data/data/com.termux/files/home/.yuyuworktrees/bg_<timestamp>` and spawns an agent on a new branch `agent-<id>`.

### Lifecycle

```
/bg <task>
    │
    ▼
git worktree add .yuyuworktrees/bg_<id> -b agent-<id>
    │
    ▼
Isolated agent loop (max 8 iterations)
    ├── read_file (with paths relative to worktree)
    ├── write_file (absolute paths in worktree)
    ├── patch_file
    └── exec (in worktree context)
    │
    ▼
Agent writes DONE → loop ends
    │
    ▼
git add -A && git commit -m "agent(<id>): <task>"
    │
    ▼
Status: done — awaiting merge
```

### Monitoring

```bash
/bgstatus
```

Shows all active agents with status: `preparing`, `running`, `done`, `error`, and their logs.

### Merging

```bash
/bgmerge bg_1234567890
```

Merges the completed agent's branch into main via `git merge --no-ff`. If conflicts are found, the Merge Conflict panel opens with per-file conflict resolution UI.

### Aborting

The abort button on the BgAgent panel calls `agent.abort()` which:
1. Aborts the AI signal
2. Removes the worktree: `git worktree remove --force`
3. Deletes the branch: `git branch -D`

### Agent System Prompt

Background agents receive a specialised system prompt:

```
Kamu adalah isolated background coding agent.
Working dir: /path/to/worktree
Branch: agent-<id>
Task: <task>

ATURAN:
- Gunakan read_file dengan path relatif terhadap /worktree
- patch_file untuk edit file yang ada
- write_file untuk file baru (path wajib absolute: /worktree/filename)
- exec untuk jalankan command di /worktree
- Setelah selesai tulis DONE di akhir response
```

The `DONE` sentinel tells the loop to exit cleanly. If no actions are produced after the first iteration, the loop also exits — it assumes the task was informational.

---

## Agent Swarm

The swarm pipeline runs multiple specialised agents in coordination:

```bash
/swarm build a REST API for user authentication with JWT
```

### Pipeline

```
/swarm <task>
    │
    ▼
1. Architect
   └── Produces: implementation plan (max 5 points)
    │
    ▼
2. FE Agent + BE Agent (parallel, Promise.all)
   ├── Frontend Engineer
   │   └── Implements UI/React with write_file actions
   └── Backend Engineer
       └── Implements server/API/logic with write_file actions
    │
    ▼
3. QA Engineer
   └── Reviews FE + BE output
   └── Lists bugs: "BUG: [FE|BE] <description>"
   └── If clean: "NO_BUGS"
    │
    ▼
4. Auto-fix pass (if bugs found)
   ├── FE bugs → FE Agent re-runs with bug list
   └── BE bugs → BE Agent re-runs with bug list
    │
    ▼
5. Deduplication
   └── BE writes take priority over FE for same path
    │
    ▼
6. DiffReviewCard
   └── All writes surfaced for approval
   └── Haptic feedback + notification
```

### What Each Agent Knows

- **Architect**: task + project folder → produces numbered plan
- **FE Agent**: architect plan + task → produces React/UI code
- **BE Agent**: architect plan + task → produces server/logic code
- **QA Agent**: FE output + BE output → produces bug list
- **Fix agents**: original code + specific bug list → produces patches

No agent has access to the live project context or filesystem during the swarm — they work from the plan and each other's output. This is intentional: the swarm is for greenfield work, not for surgical edits to an existing codebase. For the latter, use the standard agent loop.

### Limitations

- No iteration within the swarm — each agent runs once
- No filesystem reads during swarm (agents produce from plan only)
- Rate limits hit harder: 4–6 AI calls per swarm, all in sequence except the FE+BE parallel step
- Max context: each agent sees ~2000 chars of its predecessor's output

---

## Comparison

| | Standard Loop | Background Agent | Swarm |
|---|---|---|---|
| Max iterations | 6–10 | 8 | 1 per agent |
| Filesystem access | Full | Isolated worktree | None (plan only) |
| Branch impact | Main | Separate branch | Approval required |
| Best for | Iterative tasks | Long-running work | Greenfield features |
| Abort | ⏸ graceful / ■ hard | `/bgstatus` → abort | ■ hard only |
| Parallel execution | No | No | FE+BE step only |
