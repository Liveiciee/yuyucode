# Memory System

YuyuCode maintains persistent memory across sessions using three mechanisms: auto-extracted memories, agent memory pools, and session checkpoints.

## Auto Memory Extraction

After every agent response, `extractMemories()` in `useChatStore.js` runs asynchronously:

```
Agent produces reply
    │
    ▼
Signal check: is reply > 300 chars?
Is there technical content? (file extensions, code blocks, git, npm, etc.)
    │ yes
    ▼
llama3.1-8b extracts 0–2 facts
Format: bullet points starting with "•"
    │
    ▼
Store to memories[] (max 50, newest first)
Persist to Capacitor Preferences (yc_memories)
```

The extraction prompt is strict — only technical decisions, bug fixes, and project-specific facts are extracted. General conversation is discarded. If nothing worth remembering is found, the model returns `"none"` and nothing is stored.

### What gets extracted

Examples of what the system captures:
- `"• Project uses Zustand for state, not Redux"`
- `"• Bug fix: resolvePath was double-prefixing when base ends with project name"`
- `"• Test runner: vitest@3 — v4 crashes on ARM64"`

Examples of what gets discarded:
- Greetings and acknowledgements
- General explanations without project-specific content
- Responses shorter than 300 characters

---

## TF-IDF Ranking

Before each agent call, `getRelevantMemories()` scores memories against the current task using TF-IDF with age decay:

```javascript
score = Σ (tf × idf) for each query word
      + age_bonus (max 0.15, linear decay over 14 days)
```

- **TF** (term frequency): how often the query word appears in the memory text
- **IDF** (inverse document frequency): `log((N+1) / df)` — rare words score higher
- **Age decay**: memories from the last 14 days get a recency bonus up to 0.15

Top 5 memories by score are injected into the system prompt:
```
Memories:
• vitest@3 pinned — v4 crashes ARM64
• Project uses callServer() for all server communication
```

If all scores are 0 (no query words match), the 5 most recent memories are used as fallback.

---

## Agent Memory Pools

Three separate memory pools, each scoped differently:

| Pool | Scope | Use |
|------|-------|-----|
| `user` | Global — all projects | Personal preferences, working style |
| `project` | Per project folder | Architecture decisions, constraints |
| `local` | Per session | Current task context |

Each pool is ranked independently with TF-IDF before injection. All three are appended to the system prompt in order: user → project → local.

Manage via `/amemory`:
```bash
/amemory               # show all memories
/amemory add user "prefer named exports"
/amemory clear local   # clear local pool
```

---

## Learned Style

`useGrowth.learnFromSession()` runs after every session with file activity. It uses `llama3.1-8b` to extract coding style preferences from the session:

```
Session messages (last 8 user messages + last 5 code blocks)
    │
    ▼
llama3.1-8b extracts 3–5 style preferences
Format: "• Selalu pakai single quote untuk string"
    │
    ▼
Merge with existing learnedStyle (dedup, max 15 items)
Persist to yc_learned_style
```

The extracted style is injected into every system prompt under `[Gaya coding yang dipelajari dari sesi sebelumnya]`. This means the agent progressively learns your preferences without you having to repeat them.

---

## Checkpoints

Checkpoints save both conversation state and a git diff snapshot:

```bash
/checkpoint           # save current state
/checkpoint my label  # save with label
/restore              # list and restore
```

A checkpoint stores:
- Last 30 messages
- Current project folder + branch
- Project notes
- `git diff HEAD` (up to 200 lines) — file state snapshot

On restore, if a git diff was captured, the current working directory is stashed (`git stash`) before restoring the conversation. This prevents checkpoint restoration from corrupting uncommitted work.

Max 10 checkpoints stored at once (oldest discarded).

---

## Persistence

All memory data is stored on-device via Capacitor `Preferences`:

| Key | Content |
|-----|---------|
| `yc_memories` | Auto-extracted memories (JSON array, max 50) |
| `yc_checkpoints` | Checkpoint objects (JSON array, max 10) |
| `yc_history` | Last N messages (JSON array) |
| `yc_learned_style` | Style bullet points (string) |

No data leaves the device except the memories that are injected into AI API calls.
