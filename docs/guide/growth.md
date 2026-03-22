# Growth & Gamification

YuyuCode has a progression system that tracks your coding activity, learns your style, and rewards consistent use. It's not decorative — the learned style is injected into every agent call.

## XP

Every meaningful action earns XP:

| Event | XP | When it triggers |
|-------|----|-----------------|
| Message sent | 10 | Every agent loop completion |
| File written | 50 | Successful `write_file` |
| Patch applied | 30 | Successful `patch_file` |
| Exec success | 20 | Successful `exec` without errors |
| Test passed | 100 | Test run with passing results |
| Commit made | 150 | Commit via `yugit.cjs` |
| Bug fixed | 80 | Error recovery — exec error → agent fixes → success |

View current XP and level:
```bash
/xp
```

## Levels

| Level | XP Required |
|-------|-------------|
| Apprentice | 0 |
| Coder | 500 |
| Hacker | 2,000 |
| Legend | 5,000 |

## Badges

Earned automatically when conditions are met. A toast notification appears when a new badge is unlocked.

| Badge | Condition |
|-------|-----------|
| 🩸 First Blood | First message sent |
| 🌱 Apprentice | 500 XP |
| ⚡ Coder | 2,000 XP |
| 🔥 Hacker | 5,000 XP |
| 📅 Konsisten | 3-day streak |
| 🗓 Seminggu Penuh | 7-day streak |
| 👑 One Month | 30-day streak |

## Streak

A day is counted when you send at least one message. The streak increments if you were active yesterday, resets to 1 otherwise. Persisted to `yc_streak` and `yc_last_active`.

## Learned Style

The most impactful part of the system. After every session with file activity, `learnFromSession()` runs:

```
Session ends (messages > 5, file activity detected)
    │
    ▼
llama3.1-8b analyses:
- Last 8 user messages (how you phrase requests)
- Last 5 code blocks in AI responses (what patterns were applied)
    │
    ▼
Extracts 3–5 coding preferences:
• Selalu pakai single quote untuk string
• Prefer arrow function daripada function declaration
• Naming: camelCase variable, PascalCase component
    │
    ▼
Merge with existing learned style (dedup, max 15 items)
Persist to yc_learned_style
```

These preferences are injected into every system prompt under `[Gaya coding yang dipelajari dari sesi sebelumnya]`. Over time, the agent stops needing reminders about your preferences — it learns them automatically.

## Persistence

All growth data is stored on-device via Capacitor `Preferences`:

| Key | Content |
|-----|---------|
| `yc_xp` | Total XP (integer) |
| `yc_streak` | Current streak (integer) |
| `yc_last_active` | Last active date (locale string) |
| `yc_badges` | Earned badge IDs (JSON array) |
| `yc_learned_style` | Style bullet points (string, max 15 items) |
