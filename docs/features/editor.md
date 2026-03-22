# Code Editor

YuyuCode's editor is built on CodeMirror 6 with a full extension suite. Every feature is opt-in — toggle what you need in `/config`. The defaults are conservative to preserve battery and responsiveness on ARM64.

## Multi-Tab Architecture

Each tab maintains its own independent `EditorState` — not just a cursor position, but the full CodeMirror state including:
- Cursor position and selection
- Scroll position
- Complete undo/redo history
- All extension state (ghost text fields, lint markers, etc.)

Tab switching calls `view.setState()` directly — no remount, no React re-render. This means opening 50 tabs and switching between them is measured at **35× faster** than sequential open in benchmarks.

A dirty indicator (●) appears on tabs with unsaved changes.

---

## AI Ghost Text (Two Levels)

The most complex editor feature. Two independent `StateField` instances run concurrently.

### Level 1 — Next Line
- **Trigger**: 300ms after the last keystroke
- **Model**: `llama3.1-8b` (fast, cheap)
- **Prediction**: next single line
- **Accept**: `Tab`
- **Visual**: standard ghost text colour

### Level 2 — Lookahead
- **Trigger**: 900ms after the last keystroke (only if L1 is visible)
- **Model**: same as L1
- **Prediction**: 2–3 line lookahead
- **Accept**: `Tab` + `Tab` (second Tab within 400ms of the first)
- **Visual**: dimmer colour to distinguish from L1

The double-Tab detection uses a timestamp delta — if the second Tab comes within 400ms, it's interpreted as L2 accept. Beyond that gap, it's a new acceptance attempt for L1.

Toggle: `yc_ghosttext` in `/config`.

---

## Vim Mode

Full Vim emulation via `@replit/codemirror-vim`:

- Modes: normal, insert, visual
- Navigation: `hjkl`, `w`, `b`, `e`, `gg`, `G`, `0`, `$`
- Editing: `d`, `c`, `y`, `p`, `u`, `Ctrl+r`
- Commands: `:w` saves, `:wq` saves and closes, `:q!` discards
- Visual mode: line and character selection

Toggle: `yc_vim` in `/config`.

---

## Emmet

HTML expansion via `@emmetio/codemirror6-plugin`:

```
div.container>ul>li*3
```
→ Press `Ctrl+E` →
```html
<div class="container">
  <ul>
    <li></li>
    <li></li>
    <li></li>
  </ul>
</div>
```

Only active in HTML files. Toggle: always on (not configurable separately).

---

## TypeScript LSP

`@valtown/codemirror-ts` provides:
- **Autocomplete**: triggered on `.`, `(`, and manual `Ctrl+Space`
- **Type information**: hover popup with inferred type
- **Works on**: `.js`, `.ts`, `.jsx`, `.tsx`

Toggle: `yc_tslsp` in `/config`. Note: loading the TypeScript language server has a startup cost — disable if not needed.

---

## Minimap

A 64×N pixel `<canvas>` rendered alongside the editor:

- Redraws every `requestAnimationFrame` tick
- Colours code semantically: imports → purple, comments → green, strings → yellow, default → dimmed text colour
- Click anywhere to jump to that position
- Proportional scroll indicator

Toggle: `yc_minimap` in `/config`.

---

## Git Inline Blame

Per-line gutter showing commit hash, author, and date:

```
a1b2c3d Liveiciee  22 Mar  const timeout = 10000;
```

Data comes from `git blame --abbrev=7` via yuyu-server. Refreshes on file open and on save.

Toggle: `yc_blame` in `/config`.

---

## Sticky Scroll

The scope header (function name, class name, etc.) stays pinned at the top of the visible area while you scroll into a deep function. Derived from the CodeMirror syntax tree — no parsing overhead.

Toggle: `yc_stickyscroll` in `/config`.

---

## Breadcrumb

Live scope path shown below the editor toolbar:

```
App > useEffect > callback
```

Built by walking the syntax tree upward from cursor position, collecting `FunctionDeclaration`, `ClassDeclaration`, `ArrowFunction`, and similar nodes. Updates on every cursor move.

---

## Multi-cursor

- `Ctrl+D` — select next occurrence of current selection
- `Ctrl+Shift+L` — select all occurrences
- Standard CodeMirror multi-cursor editing

Toggle: `yc_multicursor` in `/config`. **On by default.**

---

## Inline Lint

Gutter markers for syntax errors:

- **JSON**: validates against `JSON.parse`
- **JS**: checks bracket balance, `console.log` presence, line length

For full ESLint, use `/lint`. The inline lint is intentionally lightweight — it runs on every edit and must be fast on ARM64.

Toggle: `yc_lint` in `/config`.

---

## Code Folding

- **Fold all**: collapses all foldable regions
- **Unfold all**: expands everything
- Click gutter arrow to fold/unfold individual regions

---

## Realtime Collaboration

Two devices can co-edit the same file simultaneously:

```bash
/collab myroom
```

Both devices join `myroom`. Changes are synced via `@codemirror/collab` OT (operational transformation) over the yuyu-server WebSocket on port `:8766`.

The server maintains a version number and update log per room in a `collabRooms` Map. Clients submit updates and receive patches from other clients.

Toggle: `yc_collab` in `/config`.

---

## Extra Keyboard Row

A fixed row of coding symbols above the soft keyboard:

```
{ } [ ] ( ) ; => // : . ! ? ⇥
```

Each symbol inserts at the current cursor position in both CodeMirror and the chat textarea. The row is always visible when the keyboard is open — no need to switch keyboard layouts for common coding characters.

---

## Live HTML/CSS/JS Preview

Split view with a live `<iframe srcdoc>`:

- Rebuilds 300ms after any keystroke (debounced)
- Auto-combines open HTML + CSS + JS tabs into a single document
- Console output intercepted via `postMessage` and shown inline below the preview
- Toggle with the preview button in the tab bar

---

## Performance

All editor benchmarks run on Oppo A77s (Snapdragon 680, ARM64):

| Benchmark | Result |
|-----------|--------|
| Language detection (single file) | ~116ns |
| Language detection (10 mixed files) | ~771ns |
| TypeScript detection | ~118ns |
| Open blank tab | ~66ns |
| Build JS preview (srcdoc) | ~160ns |
| Open 50 tabs sequentially | 35× faster than naive |

Historical results: [liveiciee.github.io/yuyucode/dev/bench](https://liveiciee.github.io/yuyucode/dev/bench/)
