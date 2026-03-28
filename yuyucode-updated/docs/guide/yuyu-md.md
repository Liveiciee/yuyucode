# YUYU.md

`YUYU.md` is a project-level rules file that YuyuCode reads at the start of every session and injects into the system prompt before every agent loop iteration.

## Location

Place `YUYU.md` in the root of your project folder:

```
myproject/
├── YUYU.md       ← here
├── src/
└── package.json
```

## Auto-generation

```bash
/rules init
```

YuyuCode reads your codebase structure, installed packages, and existing patterns, then generates a `YUYU.md` tailored to your project. Review and edit it before committing.

## Structure

```markdown
# YUYU.md — Project Rules

## Coding Standards
- Use TypeScript strict mode
- Prefer named exports over default exports
- Error handling: always use Result<T, E> pattern

## Architecture Decisions
- State: Zustand stores, no prop drilling beyond 2 levels
- API calls: always through src/lib/api.ts
- Never import from ui/ inside lib/

## Forbidden Patterns
- No console.log in committed code
- No inline styles — use Tailwind only
- Never use any — write the type

## Preferred Libraries
- HTTP: ky (not axios, not fetch directly)
- Dates: date-fns (not dayjs, not moment)
- Validation: zod

## Commands
- Dev: npm run dev
- Test: npm run test
- Lint: npm run lint (must be 0 warnings before commit)
```

## Runtime Commands

### Add a rule
```bash
/rules add "Never use console.error — throw instead"
```

Appends to `YUYU.md` immediately. Takes effect on the next agent iteration.

### View current rules
```bash
/rules
```

### Clear rules
```bash
/rules clear
```

Removes all entries from `YUYU.md`. The file is preserved but emptied.

## How it Works

`gatherProjectContext()` reads `YUYU.md` on every new conversation. The content is injected into `buildSystemPrompt()` after `AGENTS.md`:

```
[BASE_SYSTEM]
[effort suffix]
[AGENTS.md — if present]
[YUYU.md rules]        ← here
[project notes]
[skill context]
[pinned files]
[open file]
[TF-IDF memories]
```

## Tips

**Be explicit about what matters.** The agent reads your rules literally. "Prefer named exports" is acted on. "Write clean code" is ignored.

**Forbidden patterns are more effective than preferences.** `NEVER use any` stops the agent cold. `Prefer strict types` may be ignored under time pressure.

**Document your architecture decisions.** If a pattern exists for a reason (e.g. "always go through `callServer()` in `api.js`"), write it down. The agent cannot infer reasons from structure alone.

**Keep it under 2000 characters.** `buildSystemPrompt()` slices `YUYU.md` to 2000 chars. Prioritise the most important rules at the top.
