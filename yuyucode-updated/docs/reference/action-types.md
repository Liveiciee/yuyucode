# Action Types

The agent communicates intent through JSON action blocks embedded in its response. YuyuCode parses these with `parseActions()` in `src/utils.js` and routes each to a handler in `ACTION_HANDLERS`.

## Format

````
```action
{"type": "read_file", "path": "src/api.js"}
```
````

Multiple actions can appear in a single response. They are classified and executed based on safety — parallel for reads, serial for writes and exec.

---

## Read & Navigation

### `read_file`
```json
{"type": "read_file", "path": "src/api.js"}
{"type": "read_file", "path": "src/api.js", "from": 50, "to": 100}
```
Reads a file. `from`/`to` for line ranges — essential for large files. The response includes a metadata header:
```
[Lines 50–100 / 340 | 12KB]
... file content ...
```

### `list_files`
```json
{"type": "list_files", "path": "src/components"}
```
Lists files in a directory with size info. Returns formatted output:
```
📁 hooks
📄 App.jsx (24KB)
📄 api.js (8KB)
```

### `tree`
```json
{"type": "tree", "path": "src", "depth": 2}
```
Directory tree up to specified depth.

### `file_info`
```json
{"type": "file_info", "path": "src/utils.js"}
```
Metadata: size, line count, last modified.

### `search`
```json
{"type": "search", "path": "src", "query": "useAgentLoop"}
```
Grep-style search across files.

### `find_symbol`
```json
{"type": "find_symbol", "path": "src", "symbol": "buildSystemPrompt"}
```
Searches for a symbol name across the codebase.

---

## Write Operations

::: warning
Write actions trigger diff review if enabled, and create automatic backups for `/undo`.
:::

### `write_file`
```json
{
  "type": "write_file",
  "path": "src/components/NewComponent.jsx",
  "content": "import React from 'react';\n..."
}
```
Full file write. Creates the file if it doesn't exist. Overwrites if it does. A backup is always saved to `editHistory` before writing.

### `patch_file`
```json
{
  "type": "patch_file",
  "path": "src/api.js",
  "old_str": "const timeout = 5000;",
  "new_str": "const timeout = 10000;"
}
```
Surgical edit — replaces `old_str` with `new_str`. Three-fallback strategy:
1. Exact string match
2. Whitespace-normalised match
3. Trim-lines match

If all three fail, the agent receives an error and retries with the correct string after re-reading the file.

### `append_file`
```json
{"type": "append_file", "path": "logs/debug.log", "content": "new entry\n"}
```
Appends to a file without overwriting.

### `delete_file`
```json
{"type": "delete_file", "path": "src/old-component.jsx"}
```

### `move_file`
```json
{"type": "move_file", "from": "src/utils.js", "to": "src/lib/utils.js"}
```

### `mkdir`
```json
{"type": "mkdir", "path": "src/lib/parsers"}
```

### `create_structure`
```json
{
  "type": "create_structure",
  "files": [
    {"path": "src/lib/index.js", "content": "export * from './utils';"},
    {"path": "src/lib/utils.js", "content": ""}
  ]
}
```
Creates multiple files in one action. Useful for scaffolding.

---

## Execution

::: danger
`exec` requires explicit permission. Toggle in `/permissions`.
:::

### `exec`
```json
{"type": "exec", "command": "npm run test 2>&1 | tail -20"}
```
Runs a shell command in the project folder. Output is capped and fed back into the agent loop. If the output contains error patterns (`error`, `exception`, `traceback`, `exit code 1`), the loop treats it as a failure and continues iterating.

---

## Web & External

### `web_search`
```json
{"type": "web_search", "query": "react 19 use hook documentation"}
```
Searches the web via Tavily API. Results are injected as context for the next iteration.

---

## MCP

### `mcp`
```json
{
  "type": "mcp",
  "tool": "github",
  "action": "create_issue",
  "params": {"title": "Bug: ...", "body": "..."}
}
```
Calls a connected MCP (Model Context Protocol) server. Available tools depend on what's configured in `/mcp`. Executed serially.

---

## Linting (Internal)

### `lint`
```json
{"type": "lint", "path": "src/api.js"}
```
Lightweight client-side lint: checks for `console.log`, lines over 200 chars, and bracket imbalance. Not a substitute for ESLint — use `/lint` for that.

---

## Execution Order

```
All actions in one reply
    │
    ├── read_file      ──┐
    ├── list_files      │ Promise.all (parallel)
    ├── tree            │
    ├── search          │
    ├── find_symbol     │
    ├── mkdir          ─┘
    │
    ├── web_search     ──┐ Promise.all (parallel)
    │                  ─┘
    ├── exec           ──┐ serial (order matters)
    └── mcp            ─┘
```

`patch_file` and `write_file` are handled separately — they go through diff review or auto-execute with backup, then defensive review and auto-verify passes.
