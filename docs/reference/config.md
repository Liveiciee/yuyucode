# Configuration (/config)

Open the config panel with `/config`. All settings persist via Capacitor `Preferences` (device storage).

## Editor Toggles

| Toggle | Key | Default | Description |
|--------|-----|---------|-------------|
| Vim Mode | `yc_vim` | off | Normal/insert/visual modes, `hjkl`, `:wq` to save |
| AI Ghost Text | `yc_ghosttext` | off | L1 (300ms, Tab) + L2 (900ms, Tab+Tab) |
| Minimap | `yc_minimap` | off | 64px semantic canvas overview |
| Inline Lint | `yc_lint` | off | JSON + JS syntax check in gutter |
| TypeScript LSP | `yc_tslsp` | off | Autocomplete + type info on JS/TS |
| Inline Blame | `yc_blame` | off | `git blame` per-line in gutter |
| Multi-cursor | `yc_multicursor` | **on** | `Ctrl+D` next occurrence, `Ctrl+Shift+L` all |
| Sticky Scroll | `yc_stickyscroll` | off | Scope header pinned while scrolling |
| Realtime Collab | `yc_collab` | off | OT sync over WebSocket (`/collab <room>`) |
| Diff Review | `yc_diff_review` | off | Pause loop before writes, show colour diff |

## Agent Settings

| Setting | Description |
|---------|-------------|
| Effort | `low` / `medium` / `high` — controls max tokens and iterations |
| Model | Active AI model — also cycle with `/model` |
| Thinking | Toggle `<think>` chain-of-thought blocks |
| Max iterations | Override per-effort default |

## Permission Flags

All agent actions that touch the filesystem or shell require explicit permission. Defaults are conservative.

| Permission | Default | Controls |
|-----------|---------|---------|
| `read` | on | `read_file`, `list_files`, `tree`, `search` |
| `write` | on | `write_file`, `append_file`, `patch_file` |
| `exec` | off | `exec` — shell command execution |
| `delete` | off | `delete_file` |
| `web_search` | on | `web_search` via Tavily |
| `mcp` | off | MCP tool calls |

Toggle any permission in `/permissions`. The agent receives `⛔ Permission ditolak: exec` when it attempts a blocked action.

## Growth & Gamification

| Setting | Description |
|---------|-------------|
| XP | Accumulated across sessions. View with `/xp`. |
| Streak | Consecutive days active. Persisted to device storage. |
| Level | Apprentice (0–499) → Coder (500–1999) → Hacker (2000–4999) → Legend (5000+) |
| Learned style | AI-extracted coding preferences from past sessions, injected into system prompt |

### XP Events

| Event | XP |
|-------|-----|
| Message sent | 10 |
| File written | 50 |
| Patch applied | 30 |
| Exec success | 20 |
| Test passed | 100 |
| Commit made | 150 |
| Bug fixed | 80 |

### Badges

| Badge | Requirement |
|-------|------------|
| 🩸 First Blood | First message |
| 🌱 Apprentice | 500 XP |
| ⚡ Coder | 2,000 XP |
| 🔥 Hacker | 5,000 XP |
| 📅 Konsisten | 3-day streak |
| 🗓 Seminggu Penuh | 7-day streak |
| 👑 One Month | 30-day streak |

## Session Settings

| Setting | Description |
|---------|-------------|
| Session name | Label for the current session (shown in `/sessions`) |
| Session colour | Accent colour for this session |
| Font size | Editor font size in px |
| Split view | Toggle side-by-side editor + chat |
| Push-to-talk | Toggle PTT voice input mode |

## File Watcher

```bash
/watch on     # start watching for external file changes
/watch off    # stop
```

When active, external file changes trigger a notification in chat. Interval configurable in `/config`.
