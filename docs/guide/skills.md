# Skills

Skills are markdown files that get injected into the system prompt when the agent detects they're relevant to the current task. They let you encode project-specific knowledge, patterns, and templates that the agent applies automatically.

## Storage

Skills live in `.yuyu/skills/` in your project folder:

```
myproject/
└── .yuyu/
    └── skills/
        ├── react-patterns.md
        ├── api-conventions.md
        └── testing-guide.md
```

## Managing Skills

### Via the panel

```bash
/skills
```

Opens the Skills panel. Upload `.md` files, toggle individual skills on/off, delete.

### Via chat

```bash
/skills add "always use React Query for data fetching"
```

Creates or appends to a skill file.

## How Selection Works

`selectSkills()` in `src/features.js` selects which skills to inject:

```
All active skills
    │
    ├── Skill named "skill.md" → always included
    │
    ├── Skill filename matches a word in the task?
    │   e.g. task: "fix the api endpoint"
    │       "api-conventions.md" → included
    │
    ├── Skill content contains a word from the task?
    │   (checks first 20 unique words > 3 chars of skill content)
    │
    └── Skill content is < 2048 chars → always included (small skills are cheap)
```

Skills are loaded into the system prompt after YUYU.md:

```
[BASE_SYSTEM]
[YUYU.md rules]
[Skill context]          ← here
  ## react-patterns
  ... skill content ...
  ---
  ## api-conventions
  ... skill content ...
[pinned files]
```

## Writing Effective Skills

Skills work best when they're specific, actionable, and short:

**Good:**
```markdown
# API Conventions

- All endpoints return `{ ok: boolean, data: any, error?: string }`
- Use `callServer()` in `src/api.js` — never fetch directly
- Error handling: always check `if (!r.ok) throw new Error(r.error)`
- Timeout: 10s for reads, 30s for writes
```

**Not as effective:**
```markdown
# General coding

Write clean, maintainable code with good error handling and follow best practices.
```

The agent ignores vague guidance. Explicit patterns get applied.

## Examples

### Testing conventions
```markdown
# Testing Guide

- Test files: `src/xxx.test.js` (vitest)
- Mock server: `vi.mock('../api.js', () => ({ callServer: vi.fn() }))`
- Each test: arrange → act → assert, no shared state
- Snapshot tests: only for stable UI output, not business logic
- Branch coverage: test both `if` and `else` for every conditional
```

### Component patterns
```markdown
# Component Patterns

- All components receive `T` prop for theme tokens
- Style inline using `T.bg`, `T.accent`, `T.text` etc
- Never hardcode colours — zero exceptions
- BottomSheet wrapper for all panels: `<BottomSheet onClose={onClose}>`
- Loading states: `T.textMute` coloured spinner, not disabled buttons
```

### Slash command conventions
```markdown
# Slash Command Pattern

All commands live in useSlashCommands.js as named handler functions.
Pattern:
  const handleXxx = useCallback(async (parts) => {
    const arg = parts.slice(1).join(' ').trim();
    if (!arg) { setMessages(show usage); return; }
    setLoading(true);
    try { ... } finally { setLoading(false); }
  }, [deps]);

Add to the dispatch map at the bottom of the file.
```
