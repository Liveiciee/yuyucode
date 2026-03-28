# YuyuServer

`yuyu-server.js` is the local Node.js server that provides filesystem, shell, and WebSocket capabilities to the YuyuCode web app. It runs in Termux and is the reason YuyuCode can do anything a desktop IDE can do.

## Starting

```bash
node ~/yuyu-server.js &
```

Run from `~` (home), not the project folder. The server is project-agnostic — it accepts paths from the app.

Check it's running:
```bash
curl http://localhost:8765/ping
# → {"ok":true}

curl http://localhost:8765/health
curl http://localhost:8765/status
```

## HTTP API — Port 8765

All requests are `POST /` with a JSON body `{ "type": "...", ...params }`.

### File Operations

| Type | Parameters | Description |
|------|-----------|-------------|
| `read` | `path`, `from?`, `to?` | Read file, optionally by line range |
| `read_many` | `paths[]` | Read multiple files in parallel |
| `write` | `path`, `content` | Write file (creates dirs if needed) |
| `append` | `path`, `content` | Append to file |
| `patch` | `path`, `old_str`, `new_str` | Find-and-replace with 3-fallback strategy |
| `delete` | `path` | Delete file |
| `move` | `from`, `to` | Move/rename file |
| `mkdir` | `path` | Create directory (recursive) |

### Navigation

| Type | Parameters | Description |
|------|-----------|-------------|
| `list` | `path` | List directory with size info |
| `tree` | `path`, `depth` | Directory tree |
| `info` | `path` | File metadata (size, lines, modified) |
| `search` | `path`, `content` | Grep across files |
| `index` | `path` | Build/update codebase index |

### Execution

| Type | Parameters | Description |
|------|-----------|-------------|
| `exec` | `path`, `command` | Run shell command in directory |
| `browse` | `url` | Fetch webpage content |
| `fetch_json` | `url` | Fetch and parse JSON |
| `web_search` | `query` | Search via Tavily API |
| `sqlite` | `path`, `query` | Query SQLite database |

### Advanced

| Type | Parameters | Description |
|------|-----------|-------------|
| `mcp` | `tool`, `action`, `params` | Call MCP server tool |
| `mcp_list` | — | List available MCP tools |
| `batch` | `actions[]` | Run multiple operations in one HTTP round-trip |

### The `patch` Fallback Strategy

The `patch` operation tries three strategies in order:

1. **Exact match** — find `old_str` literally in the file
2. **Whitespace-normalised** — collapse all whitespace before comparing
3. **Trim-lines** — trim each line before comparing

If all three fail, the server returns `ok: false` with a descriptive error. The agent loop receives this, re-reads the file, and retries with the correct string.

### The `batch` Operation

```json
{
  "type": "batch",
  "actions": [
    {"type": "read", "path": "/project/src/api.js"},
    {"type": "read", "path": "/project/src/utils.js"},
    {"type": "exec", "path": "/project", "command": "git status"}
  ]
}
```

Runs multiple operations in a single HTTP request. Significantly reduces agent loop round-trip time when the agent needs to read several files at the start of an iteration.

## WebSocket API — Port 8766

Long-lived connections for streaming and collaboration.

### `watch`
```json
{"type": "watch", "path": "/project/src"}
```
File watcher — emits events when files change. Used by `/watch` to notify the agent of external changes.

### `exec_stream`
```json
{"type": "exec_stream", "path": "/project", "command": "npm run dev"}
```
Streams command output line by line. Used by the xterm.js terminal. Returns a session ID that can be used with `kill`.

### `kill`
```json
{"type": "kill", "id": "session_id"}
```
Terminates a running `exec_stream` process.

### `collab_join`
```json
{"type": "collab_join", "room": "myroom", "version": 0}
```
Joins a collaboration room. The server maintains version + update log per room in a `collabRooms` Map.

### `collab_push`
```json
{"type": "collab_push", "room": "myroom", "steps": [...], "clientID": "abc"}
```
Pushes OT steps from one client. The server broadcasts to all other clients in the room.

### `collab_updates`
```json
{"type": "collab_updates", "room": "myroom", "version": 5}
```
Fetches all updates since `version`. Used to catch up after reconnect.

## Health Checks

The agent loop calls `ping` before every first iteration:

```json
POST /
{"type": "ping"}
→ {"ok": true}
```

If the server is unreachable, the loop aborts immediately with:
```
❌ yuyu-server tidak dapat dijangkau!

Pastikan server berjalan di Termux:
  yuyu-server-start
  # atau
  node ~/yuyu-server.js &
```

## Keeping It Running

Android's memory manager will kill Termux processes under memory pressure. Common mitigations:

1. **Acquire wakelock** in Termux: `termux-wake-lock`
2. **Disable battery optimisation** for Termux in Android settings
3. **Keep Termux in the foreground** or pinned

There is no automatic reconnect — if the server dies mid-task, the agent loop will fail on the next server call and surface the error in chat.
