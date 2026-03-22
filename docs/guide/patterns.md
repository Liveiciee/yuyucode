# Contributing Patterns

YuyuCode is a single-developer personal tool. Pull requests are not expected. This page documents the patterns used throughout the codebase — for the agent and for anyone reading the code.

## Core Constraints

These are enforced by `YUYU.md` and must never be violated:

| Constraint | Reason |
|-----------|--------|
| No TypeScript | Pure JS + JSX — faster to write on a phone |
| No Redux/Zustand | `useState` + prop-passing is sufficient and readable |
| No `npm run build` locally | Crashes on ARM64 Snapdragon 680 with `@rollup/wasm-node` |
| No `vitest@4` | `Illegal instruction` crash on ARM64 |
| No `isolate: false` in vitest | `vi.mock` leaks between test files |
| No `global.TextDecoder` override | Infinite recursion in Node 24 |
| No manual edits to `android/` | Overwritten by `cap sync android` |
| Agent loop stays in `useAgentLoop.js` | Don't split it |
| All slash commands in `useSlashCommands.js` | One file, else-if chain |
| Zero hardcoded colours in components | Always use `T.accent`, `T.bg`, etc. |
| All server calls via `callServer()` | Never fetch `localhost:8765` directly |

## File Naming

```
useXxx.js     → React hook
Xxx.jsx       → React component (PascalCase)
xxx.js        → utility / feature / constant
xxx.cjs       → Node.js CLI script
xxx.test.js   → vitest test file
xxx.bench.js  → vitest benchmark file
```

## Comment Style

Important comments use the `// ──` pattern:
```javascript
// ── gatherProjectContext — "read before act" ─────────────────────────────────
async function gatherProjectContext(txt, _signal) {
```

Section dividers use `// ─────────────────────────────────────────────────────`.

## State Patterns

All persisted state follows this pattern:
```javascript
const [value, setValueRaw] = useState(defaultValue);

function setValue(v) {
  setValueRaw(v);
  Preferences.set({ key: 'yc_key', value: String(v) });
}
```

Private raw setter is used internally. Public setter is exposed from the hook.

## Component Structure

```javascript
export function MyComponent({ T, ui, project, onAction }) {
  // 1. Extract tokens
  const bg     = T?.bg     || '#111';
  const text   = T?.text   || '#fff';
  const accent = T?.accent || '#ec4899';

  // 2. Local state
  const [open, setOpen] = useState(false);

  // 3. Handlers
  function handleClick() { ... }

  // 4. Render
  return (
    <div style={{ background: bg, color: text }}>
      ...
    </div>
  );
}
```

Never import theme values directly — always receive through `T` prop.

## Slash Command Pattern

```javascript
const handleMyCommand = useCallback(async (parts) => {
  const arg = parts.slice(1).join(' ').trim();
  
  // Show usage if no arg
  if (!arg) {
    setMessages(m => [...m, {
      role: 'assistant',
      content: '**`/mycommand`** — description\n\n- `/mycommand <arg>` — does thing',
      actions: []
    }]);
    return;
  }
  
  setLoading(true);
  try {
    // ... do the thing
    setMessages(m => [...m, { role: 'assistant', content: '✅ Done', actions: [] }]);
  } finally {
    setLoading(false);
  }
}, [/* deps */]);
```

Add to the dispatch section at the bottom of `useSlashCommands.js`. Add to `SLASH_COMMANDS` in `src/constants.js`.

## Test Patterns

```javascript
describe('myFunction', () => {
  it('handles normal case', () => {
    expect(myFunction('input')).toBe('expected');
  });
  
  it('handles empty input', () => {
    expect(myFunction('')).toBe('');
  });
  
  it('handles null', () => {
    expect(myFunction(null)).toBe(null);
  });
});
```

Always test the `else` branch. SonarCloud tracks condition coverage — every `if` needs both paths tested.

For server-dependent tests:
```javascript
vi.mock('../api.js', () => ({
  callServer: vi.fn(),
  askCerebrasStream: vi.fn(),
}));
```

## Action Block Format

When writing agent instructions or examples, use this format:
````
```action
{"type": "patch_file", "path": "src/api.js", "old_str": "...", "new_str": "..."}
```
````

`old_str` must be unique in the file. Include 2–3 lines of context around the change. Never use `old_str` of just one line if that line appears multiple times.

## Workflow Before Committing

```bash
npm run lint        # 0 problems
npx vitest run      # 1031/1031 pass
node yuyu-map.cjs   # update codebase map
node yugit.cjs "type: description"
```

All three must pass. The CI quality gate will catch lint and test failures, but `yuyu-map.cjs` is local-only.
