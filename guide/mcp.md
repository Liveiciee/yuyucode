# MCP Integration

YuyuCode supports the Model Context Protocol (MCP), allowing the agent to call external tools — git operations, database queries, GitHub API, system info, and more.

## Opening the Panel

```bash
/mcp
```

The MCP panel shows all tools available from `yuyu-server.js`. If no tools are detected, the panel shows the default set as a reference.

## Built-in MCP Tools

These are available by default through `yuyu-server.js`:

| Tool | Actions | Description |
|------|---------|-------------|
| `git` | `status`, `log`, `diff` | Git operations in the project folder |
| `fetch` | `browse` | Fetch webpage content |
| `sqlite` | `tables`, `query` | Query SQLite databases |
| `github` | `issues`, `pulls` | GitHub API (requires token) |
| `system` | `disk`, `memory` | Device/server system info |
| `filesystem` | `list` | File listing |

## Agent Usage

The agent calls MCP tools via the `mcp` action type:

```json
{
  "type": "mcp",
  "tool": "github",
  "action": "issues",
  "params": { "repo": "liveiciee/yuyucode", "state": "open" }
}
```

MCP actions execute serially (not in parallel) — order matters.

## SQLite via `/db`

The most frequently used MCP tool. Query SQLite databases directly from chat:

```bash
/db                         # list all .db files in project
/db use myapp.db            # select active database
/db SELECT * FROM users LIMIT 10
/db SELECT count(*) FROM logs WHERE level='error'
```

The active database is remembered within the session.

## Permission

MCP is disabled by default. Enable in `/permissions`:

```
mcp: off → on
```

Without permission, any `mcp` action returns `⛔ Permission ditolak: mcp`.

## Adding Custom MCP Servers

Custom MCP servers are configured in `yuyu-server.js`. The server exposes connected tools via `mcp_list`:

```bash
# From chat
/mcp   # refreshes tool list from server
```

The panel updates in real time — no restart needed after connecting a new MCP server.
