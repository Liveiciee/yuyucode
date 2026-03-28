# How-to Examples

Practical examples of real tasks with YuyuCode. Each shows the input, what the agent does, and what to expect.

---

## Fix a bug you can't find

```
fix the login function — token not being saved after auth
```

What happens:
1. Agent searches for "login" across `src/`
2. Reads the auth file
3. Identifies the missing `Preferences.set()` call
4. Applies `patch_file`
5. Reflects: "Token now persisted. If it disappears after refresh, check if logout handler clears storage."

**Don't do this:** pasting the code yourself. The agent reads it faster than you can copy it.

---

## Add a feature to an existing component

```
add a copy-to-clipboard button to each code block in MsgBubble
```

What happens:
1. Agent reads `src/components/MsgBubble.jsx`
2. Identifies the code block render section
3. Adds a copy button with `navigator.clipboard.writeText()`
4. Patches the file

**Tip:** If the component is large, the agent may read it in chunks (`from`/`to`). This is normal and faster than reading the whole file.

---

## Refactor a large file

```
/effort deep
useSlashCommands/ handlers are getting complex — extract logic into a new handler file under handlers/
```

What happens:
1. Reads `useSlashCommands/index.js` and the relevant handler file in chunks
2. Identifies the command dispatch pattern
3. Extracts handlers one by one as named `const handleXxx = useCallback()`
4. Rewrites the dispatch section

**Note:** Use `/effort deep` for large refactors — gives max iterations and tokens.

---

## Run tests and fix failures

```
run tests and fix any failures
```

What happens:
1. Executes `npx vitest run 2>&1 | tail -30`
2. Parses failing test output
3. Reads the relevant test file and source file
4. Patches the source to make the test pass
5. Runs tests again to verify

**Requires:** `exec` permission enabled in `/permissions`.

---

## Debug a crash

```
app crashes on startup — white screen
```

What happens:
1. Runs `node src/main.jsx 2>&1 | head -30` or checks console
2. Reads the error-adjacent file
3. Fixes the issue

**Tip:** If it's a React render error, paste the console output directly — the agent will diagnose it without running anything.

---

## Background task while you work

```
/bg refactor all components to use the T prop instead of hardcoded colours
```

What happens:
1. Creates isolated git worktree on a new branch
2. Reads each component file
3. Replaces hardcoded colour strings with `T.` token references
4. Commits to the worktree branch
5. You continue working on main

When done: `/bgstatus` → check → `/bgmerge bg_<id>`.

---

## Greenfield feature with multiple files

```
/swarm build a REST API endpoint for user preferences — store in SQLite, expose GET and POST routes in yuyu-server.js
```

What happens:
1. Architect produces a plan (SQLite schema, endpoint design)
2. FE Agent writes the client-side fetch code
3. BE Agent writes the yuyu-server.js endpoints
4. QA reviews both outputs for bugs
5. Auto-fix pass if bugs found
6. DiffReviewCard shows all writes for your approval

---

## Search and understand the codebase

```
how does the diff review approval flow work — walk me through it
```

What happens:
1. Agent reads the relevant files (`useApprovalFlow.js`, `useAgentLoop.js`)
2. Explains the flow with code references
3. No writes — this is a read + explain task

**Tip:** This is faster than reading the docs. The agent reads the actual code and explains what it does.

---

## Add a slash command

```
add a /summary command that summarises the last 10 messages using llama3.1-8b
```

What happens:
1. Reads `useSlashCommands/handlers/index.js` to understand the pattern
2. Reads `src/constants.js` to see the command list
3. Adds `handleSummary = useCallback(...)` following existing patterns
4. Adds it to the dispatch section
5. Adds it to `SLASH_COMMANDS` in constants

---

## Generate tests for new code

```
/test src/hooks/useMyNewHook.js
```

What happens:
1. Reads the hook file
2. Identifies exported functions and key branches
3. Writes a `.test.js` file with unit tests
4. Runs the tests to verify they pass

---

## Review before committing

```
/review --all
```

What happens:
1. Runs `git diff --name-only HEAD` to find changed files
2. Reads up to 8 changed files
3. Produces structured review with severity:
   - 🔴 High — potential bugs, security issues
   - 🟡 Medium — missing error handling, edge cases
   - 🟢 Low — style, improvement suggestions

---

## Tips

**Read before you ask.** The agent reads files faster than you can paste them. Describe the problem, not the code.

**Specificity helps.** "fix the crash in the auth flow" is better than "app broken". "add loading state to the submit button in ContactForm" is better than "improve the form".

**Use `/effort deep` for complex tasks.** Default is 6 iterations. Deep gives 10 with more tokens per call.

**Use `/pin` for frequently referenced files.** Pinned files are injected into every call — useful for architecture docs, constants, or the file you're actively working in.

**Use YUYU.md for project rules.** The agent reads it every session. If you find yourself repeating the same instructions, put them in YUYU.md.
