# Shell Environment (Neko-Edition v5.0)

`bashrc-additions.sh` is YuyuCode's Termux shell environment — a full production toolkit that wraps the server, filesystem API, backups, metrics, and an optional AI assistant behind short `y*` commands.

Source it once in `~/.bashrc`:

```bash
source ~/yuyucode/bashrc-additions.sh
```

## Architecture — Dual-Brain

```
yai "question"
    │
    ▼
_yuyu_ai_is_enabled?
    │
    ├── yes → _neko_ai_call() → provider (OpenAI / Grok / Ollama)
    │             on failure → fallback to local
    │
    └── no  → _neko_local_response() — fast, offline, rule-based
```

Two modes, same interface. Local (Neko) mode is the default — fast, private, no internet. AI mode requires a key but gives full LLM responses.

---

## Server Management

| Command | Description |
|---------|-------------|
| `ystart` | Start `yuyu-server.js` with auto-restart and jittered exponential backoff |
| `ystop` | Graceful SIGTERM → SIGKILL after 5s timeout |
| `yrestart` | Stop + start |
| `yreset` | Clear crash counter (re-enables auto-restart after max restarts) |
| `ylogs` | `tail -f` the server log |
| `ystatus` | Server health check — uptime, memory, git branch, dirty files, metrics |
| `yhealth` | Raw `/health` JSON from the server |
| `yping` | Ping the server root |

Auto-restart uses jittered exponential backoff: `backoff = backoff * 2 + random(0–2)`, capped at 10s. After `MAX_SERVER_RESTARTS` (5) consecutive crashes, auto-restart is disabled — run `yreset` to clear.

---

## Files via Secure API

All file operations go through `yuyu-server.js` — no direct shell access.

| Command | Usage |
|---------|-------|
| `yread <path>` | Read a file |
| `yread-human <path>` | Read with human-readable formatting |
| `ywrite <path> <content>` | Write a file |
| `ylist [path]` | List directory |
| `ytree [path] [depth]` | Directory tree (default depth 3) |
| `ysearch <query>` | Search codebase |
| `yinfo <path>` | File metadata |
| `ygrep <pattern> <file>` | Grep via API (safe — no shell injection) |
| `ypkg` | Show `package.json` human-readable |

---

## AI Assistant

### Setup

```bash
yai-setup    # interactive wizard — choose OpenAI / Grok / Ollama
yai-off      # disable AI, back to Neko Mode
ybrain       # show current mode and provider
```

Supported providers:

| Provider | Command | Notes |
|----------|---------|-------|
| OpenAI | `yai-setup` → option 1 | GPT-3.5/GPT-4, validates key before saving |
| Grok (xAI) | `yai-setup` → option 2 | grok-beta |
| Ollama | `yai-setup` → option 3 | 100% local, requires `ollama serve` |

Keys are stored in `~/.yuyu-ai-key` (chmod 600), obfuscated with base64+rev. Config in `~/.yuyu-ai-config` (JSON).

### Usage

```bash
yai "How do I fix npm install errors?"
yai-analyze          # auto-reads last 50 log lines, asks AI to explain
yai-code "bash function to backup files"
```

When AI mode is enabled, every `yai` call injects context automatically:
- Server status
- Node.js version  
- Current memory usage

On AI failure (timeout, bad key, network error) → silently falls back to local Neko Mode.

---

## ZIP & Backup

### yapply

```bash
yapply                          # interactive — pick from Download/
yapply ~/Download/patch.zip     # direct path
yapply patch.zip --dry-run      # preview only, no changes
yapply patch.zip --skip-tests   # skip lint + vitest
yapply patch.zip --force        # no confirmation prompt
```

Full flow:
1. Preview zip contents
2. Prompt for confirmation (unless `--force`)
3. Create compressed backup to `~/.yuyucode/.backups/`
4. `git stash` current changes
5. Extract zip
6. Run `npm run lint` + `npx vitest run` (unless `--skip-tests`)
7. On failure → `git reset --hard` to snapshot

Backups auto-rotate — only the 5 most recent `tar.gz` are kept.

### yrestore

```bash
yrestore    # list available backups, select one to restore
```

Stops server, extracts the selected `.tar.gz`, server ready to start again.

### yuyu-cp (ycp)

```bash
ycp file.jsx                  # copy from Download/ to ~/yuyucode/
ycp file.jsx src/components/  # copy to specific subdirectory
ycp patch.zip                 # auto-routes to yapply
```

---

## Metrics (SQLite)

Server events are logged to `~/.yuyu-server.db` via SQLite (`BEGIN IMMEDIATE` transactions — no race conditions).

| Event type | When recorded |
|-----------|---------------|
| `crash` | Server process exits with non-zero code |
| `restart` | Auto-restart triggered |
| `request` | API call made via `_yuyu_curl_post` |

```bash
ymetrics    # show last 7 days: crashes, restarts, requests, uptime
```

---

## Dev Tools

| Command | Equivalent |
|---------|-----------|
| `ytest` | `npm test -- --run` |
| `ylint` | `npm run lint -- --fix` |
| `ybuild` | `npm run build` |
| `ydev` | `npm run dev` |
| `ybench` | `node yuyu-bench.cjs` |
| `yclean` | Remove `dist/`, `coverage/`, `.cache/`, `node_modules/.cache/` |
| `ynode [version]` | Switch Node.js via nvm |

---

## System Info

| Command | Shows |
|---------|-------|
| `ystatus` | Server health, git branch, dirty files, Node version, metrics |
| `ymemory` | RAM usage + Node heap limit |
| `yprofile` | Device profile — CPU temp, disk, uptime, Node options |

---

## MCP

```bash
ymcp <tool> <action>    # call an MCP tool
ymcp-list               # list available MCP tools
ybatch '<json_array>'   # batch operations
```

---

## Configuration

| Path | Purpose |
|------|---------|
| `~/.yuyu-server.log` | Server log (max 5MB, auto-rotated) |
| `~/.yuyu-server.pid` | Server PID |
| `~/.yuyu-server.restarts` | Crash counter |
| `~/.yuyu-server.db` | SQLite metrics |
| `~/.yuyucode/.backups/` | Compressed backup archives |
| `~/.yuyu-ai-config` | AI provider config (JSON) |
| `~/.yuyu-ai-key` | Encrypted API key |

Node.js tuned for Snapdragon 680:

```bash
NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=16"
UV_THREADPOOL_SIZE=4
```

---

## Security Design

- **No `yexec` command** — arbitrary shell execution is intentionally not exposed
- All file/system ops go through `yuyu-server.js` API (`_yuyu_curl_post`)
- JSON payloads built with `jq` (when available) to prevent injection
- Atomic writes via `flock` — no partial writes
- AI keys stored chmod 600, never logged
