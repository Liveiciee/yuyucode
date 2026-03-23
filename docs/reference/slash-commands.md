# Slash Commands

All slash commands are handled in `src/hooks/useSlashCommands.js`. The full list of ~68 commands is defined in `src/constants.js` under `SLASH_COMMANDS`.

## Agent Control

| Command | Description |
|---------|-------------|
| `/compact` | Summarise conversation history using `llama3.1-8b`. Warns about accuracy loss — use `/handoff` for structured sessions. |
| `/compact force` | Skip the warning and compact immediately. |
| `/handoff` | Generate a structured session brief (completed work, pending tasks, hot files, decisions). Saves to `.yuyu/handoff.md` and auto-loads next session. |
| `/effort low\|medium\|high` | Switch effort preset. `low`: 3 iter, 1.5K tokens. `medium`: 10 iter, 2K tokens. `high`: 20 iter, 4K tokens. |
| `/thinking on\|off` | Toggle chain-of-thought. When on, agent writes `<think>` blocks before responses. |
| `/loop <interval> <cmd>` | Run a shell command on a repeating interval. Format: `/loop 5m git status`, `/loop 1h npm test`. Units: `s`, `m`, `h`. Auto-stops after 3 consecutive errors. `/loop stop` to halt. |

## Code & Files

| Command | Description |
|---------|-------------|
| `/review` | Review the currently open file. |
| `/review <path>` | Review a specific file. |
| `/review --all` | Review all files changed vs `HEAD` (up to 8). Outputs severity-graded findings (🔴 High / 🟡 Medium / 🟢 Low). |
| `/diff <file>` | Show git diff for a file. |
| `/lint` | Run ESLint on the project. Requires `exec` permission. |
| `/test` | Run the test suite. |
| `/test <path>` | Run tests for a specific file. |
| `/bench` | Run benchmarks. |
| `/bench save` | Set current benchmark results as baseline. |
| `/refactor <instruction>` | Refactor the open file according to the instruction. |
| `/simplify` | Simplify the open file. |
| `/summarize` | Summarise the open file. |
| `/scaffold <type>` | Generate a scaffold (component, hook, API route, etc.). |
| `/init <type>` | Initialise a project structure. |
| `/batch <instruction>` | Apply an instruction to all source files in parallel. |

## Project Context

| Command | Description |
|---------|-------------|
| `/rules` | Show current `YUYU.md` content. |
| `/rules add "<rule>"` | Append a rule to `YUYU.md`. Takes effect immediately. |
| `/rules clear` | Clear all rules from `YUYU.md`. |
| `/rules init` | Auto-generate `YUYU.md` from codebase analysis. |
| `/pin <path>` | Pin a file — always injected into every agent loop context. |
| `/pin` | Show pinned files. |
| `/status` | Show project status: branch, model, effort, token count, server health. |
| `/tree` | Show project directory tree. |
| `/deps` | Show dependency graph (text). See also `/config` → DepGraph for visual. |
| `/index` | Rebuild the codebase index (`.yuyu/map.md`, `compressed.md`). |

## Memory & History

| Command | Description |
|---------|-------------|
| `/search <query>` | Search across full chat history. Click result to scroll to message. |
| `/history` | Show input history (↑/↓ already navigates inline). |
| `/undo` | Undo the last file edit made by the agent. |
| `/undo <n>` | Undo the last N file edits. |
| `/rewind <n>` | Remove the last N conversation turns. |
| `/checkpoint` | Save current conversation state as a checkpoint. |
| `/restore` | List and restore a checkpoint. |
| `/save <name>` | Save the current session with a name. |
| `/sessions` | Open the sessions panel. |
| `/amemory` | Manage agent memory (user/project/local pools). |
| `/export` | Export conversation as markdown. |

## Background Agents

| Command | Description |
|---------|-------------|
| `/bg <task>` | Spawn a background agent in an isolated git worktree. Up to 8 iterations. |
| `/bgstatus` | Show status of all background agents (running/done/stuck/error). |
| `/bgmerge <id>` | Merge a completed background agent's worktree. |

## Agent Swarm

| Command | Description |
|---------|-------------|
| `/swarm <task>` | Run the full swarm pipeline: Architect → FE Agent + BE Agent (parallel) → QA Engineer → auto-fix pass. |
| `/plan <task>` | Generate a step-by-step execution plan before acting. |

## Model Control

| Command | Description |
|---------|-------------|
| `/model` | Cycle to the next available model. |
| `/ask <alias> <task>` | One-shot model override. Aliases: `kimi`, `llama`, `llama8b`, `qwen`, `scout`, `qwen235`. |
| `/ab <modelA> vs <modelB>: <task>` | Run the same prompt against two models and compare results. |
| `/tokens` | Show current token count estimate. |
| `/cost` | Show estimated API cost for the session. |
| `/usage` | Show token usage breakdown by model. |

## UI & Editor

| Command | Description |
|---------|-------------|
| `/config` | Open the configuration panel (editor toggles, diff review, effort, etc.). |
| `/theme` | Open the theme builder. |
| `/font <size>` | Set editor font size. |
| `/split` | Toggle split view (editor + chat side by side). |
| `/open <path>` | Open a file in the editor. |
| `/color <hex>` | Set accent colour. |

## Tools & Integrations

| Command | Description |
|---------|-------------|
| `/websearch <query>` | Search the web and return results in chat. |
| `/browse <url>` | Fetch and display a webpage. |
| `/mcp` | Open the MCP (Model Context Protocol) panel. |
| `/github` | Open the GitHub integration panel. |
| `/deploy` | Open the deploy panel. |
| `/permissions` | Open the permissions panel. |
| `/plugin <name>` | Toggle a plugin. |
| `/skills` | Open the skills panel. |
| `/db <query>` | Query a SQLite database in the project folder. Auto-detects `.db` files. Use `/db use <file.db>` to select when multiple exist. |
| `/ptt` | Toggle push-to-talk voice input. |
| `/watch on\|off` | Toggle file watcher — notifies agent on external file changes. |

## Developer

| Command | Description |
|---------|-------------|
| `/self-edit <instruction>` | Apply an edit to YuyuCode's own source. Use with care. |
| `/xp` | Show growth stats (XP, streaks, badges). |
| `/debug` | Show internal state dump for debugging. |
| `/rename <old> <new>` | Rename a file and update all import references. |
