This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where empty lines have been removed, content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**/*.js, src/**/*.jsx
- Files matching these patterns are excluded: **/*.test.js, **/*.bench.js, **/__snapshots__/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Empty lines have been removed from all files
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
src/
  components/
    AppChat.jsx
    AppHeader.jsx
    AppPanels.jsx
    AppSidebar.jsx
    FileEditor.jsx
    FileTree.jsx
    GlobalFindReplace.jsx
    KeyboardRow.jsx
    LivePreview.jsx
    MsgBubble.jsx
    panels.agent.jsx
    panels.base.jsx
    panels.git.jsx
    panels.jsx
    panels.tools.jsx
    SearchBar.jsx
    Terminal.jsx
    ThemeEffects.jsx
    VoiceBtn.jsx
  hooks/
    useAgentLoop.js
    useAgentSwarm.js
    useApprovalFlow.js
    useBrightness.js
    useChatStore.js
    useDevTools.js
    useFileStore.js
    useGrowth.js
    useMediaHandlers.js
    useNotifications.js
    useProjectStore.js
    useSlashCommands.js
    useUIStore.js
  plugins/
    brightness.js
  themes/
    aurora.js
    index.js
    ink.js
    mybrand.js
    neon.js
    obsidian.js
  api.js
  App.jsx
  constants.js
  features.js
  main.jsx
  setupTest.js
  theme.js
  utils.js
```

# Files

## File: src/components/AppChat.jsx
```javascript
// ── AppChat ───────────────────────────────────────────────────────────────────
// Center area: multi-tab bar, chat, file viewer, file editor, terminal,
// live preview, keyboard row, follow-up chips, quick bar, and composer.
⋮----
export function AppChat({
  T, ui, project, file, chat,
  sendMsg, cancelMsg, retryLast, continueMsg,
  handleApprove, handlePlanApprove,
  handleCameraCapture, fileInputRef,
  runShortcut, stopTts,
  visibleMessages,
})
⋮----
// editorConfig derived from ui prefs
⋮----
// Fase 3
⋮----
// ── Keyboard row insert handler ──────────────────────────────────────────
function handleKeyboardInsert(text)
⋮----
// If file editor is visible and focused → insert into CM
⋮----
// Fallback: insert into textarea
⋮----
// Active tab object
⋮----
{/* ── MULTI-TAB BAR ── */}
⋮----
{/* Chat tab */}
⋮----
{/* File tabs */}
⋮----
{/* Edit mode toggle */}
⋮----
{/* Close button */}
⋮----
{/* Live Preview button */}
⋮----
{/* Terminal toggle */}
⋮----
{/* ── CHAT ── */}
⋮----
{/* ── FILE VIEWER (read-only) ── */}
⋮----

⋮----
{/* ── FILE EDITOR (CodeMirror) ── */}
⋮----
{/* ── LIVE PREVIEW ── */}
⋮----
{/* ── GLOBAL FIND & REPLACE ── */}
⋮----
{/* ── TERMINAL ── */}
⋮----
{/* ── KEYBOARD ROW (file edit mode only) ── */}
⋮----
{/* ── FOLLOW UPS ── */}
⋮----
{/* ── QUICK BAR ── */}
⋮----
{/* ── INPUT COMPOSER ── */}
```

## File: src/components/AppHeader.jsx
```javascript
// ── AppHeader ─────────────────────────────────────────────────────────────────
// Session color bar, header (title/effort/tokens/xp/palette), folder input,
// UndoBar, dan status bar (offline/ratelimit/agent running).
⋮----
export function AppHeader(
⋮----
{/* Session color strip */}
⋮----
{/* HEADER — 48px */}
⋮----
{/* Folder input */}
⋮----
{/* Status bar — priority-based */}
```

## File: src/components/AppPanels.jsx
```javascript
// ── AppPanels ─────────────────────────────────────────────────────────────────
// Semua panel overlay, modal, dan floating UI yang render di atas main layout.
// Memory, checkpoints, swarm log, dep graph, semua BottomSheet panels,
// onboarding, dan commit modal.
⋮----
export function AppPanels({
  T, ui, project, file, chat,
  sendMsg, compactContext, runShortcut,
  fetchGitHub, runDeploy, runTests, generateCommitMsg,
  haptic, saveCheckpoint, restoreCheckpoint,
  fileInputRef, handleImageAttach,
})
⋮----
{/* Search */}
⋮----
{/* Light overlays */}
⋮----
{/* Command Palette */}
⋮----
{/* Memory */}
⋮----
{/* Checkpoints */}
⋮----
{/* Swarm log */}
⋮----
{/* Onboarding */}
⋮----
{/* Activity-wrapped panels */}
⋮----
{/* File input (hidden) */}
⋮----
{/* Commit modal */}
```

## File: src/components/AppSidebar.jsx
```javascript
// ── AppSidebar ────────────────────────────────────────────────────────────────
// Overlay sidebar: backdrop, file tree, recent files, resize handle.
⋮----
export function AppSidebar(
```

## File: src/components/FileEditor.jsx
```javascript
// ── FileEditor — CodeMirror 6 · Full IDE ─────────────────────────────────────
// Fase 1+2: Multi-tab, Vim, Emmet, Ghost Text, Minimap, Lint
// Fase 3:   TypeScript LSP, Inline Blame, Sticky Scroll, Code Fold,
//           Multi-Cursor, Breadcrumb, Realtime Collab
⋮----
// ── TypeScript LSP — lazy load @valtown/codemirror-ts ────────────────────────
⋮----
async function getTsExtensions()
// ── Language detector ─────────────────────────────────────────────────────────
function getLang(path)
function isEmmetLang(path)
function isTsLang(path)
// ── Theme builder ─────────────────────────────────────────────────────────────
function buildTheme(T)
// ── Ghost text ────────────────────────────────────────────────────────────────
⋮----
create: () => (
update(val, tr)
⋮----
class GhostWidget extends WidgetType
⋮----
toDOM()
eq(other)
ignoreEvent()
⋮----
run(view)
⋮----
async function fetchAISuggestion(prefix)
function makeGhostPlugin()
⋮----
update(upd)
destroy()
⋮----
// ── Inline blame gutter ───────────────────────────────────────────────────────
class BlameMarker extends GutterMarker
function makeBlameGutter(blameMap)
⋮----
lineMarker(view, line)
initialSpacer: ()
⋮----
async function fetchBlame(folder, filePath)
⋮----
// git blame --abbrev=7 format: "^abc1234 (Author   2024-01-01 1) code"
⋮----
// ── Syntax lint ───────────────────────────────────────────────────────────────
function makeSyntaxLinter(path, folder)
// ── Minimap ───────────────────────────────────────────────────────────────────
function Minimap(
⋮----
function draw()
⋮----
// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb(
⋮----
// Listen to cursor movement via a plugin attached after mount
⋮----
function update(v)
// Initial read
⋮----
// Subscribe via updateListener extension — inject as a state facet
// Since view is already created, we use a transaction listener
⋮----
// Inject via a new compartment on existing view
⋮----
// ── Collab WS plugin ──────────────────────────────────────────────────────────
function makeCollabPlugin(wsRef)
⋮----
schedule()
async push()
⋮----
// sendableUpdates is accessed from the view in update()
⋮----
// ── Build optional extensions ─────────────────────────────────────────────────
function buildOptionalExtensions(cfg, path, _folder, collabWsRef)
// ── Main FileEditor ───────────────────────────────────────────────────────────
⋮----
insert(text)
focus()
foldAll()
unfoldAll()
⋮----
// ── Mount ──────────────────────────────────────────────────────────────────
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
// ── Theme sync ──────────────────────────────────────────────────────────────
⋮----
// ── Lang sync ───────────────────────────────────────────────────────────────
⋮----
// ── Optional extensions sync ────────────────────────────────────────────────
⋮----
}, [ // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── Blame toggle ────────────────────────────────────────────────────────────
⋮----
// ── Blame gutter update ─────────────────────────────────────────────────────
⋮----
// ── TS LSP lazy attach ──────────────────────────────────────────────────────
⋮----
// Further TS integration would attach completionSource + hoverTooltip here
// Requires a tsserver worker — deferred to when worker is available
⋮----
// ── Collab WS ───────────────────────────────────────────────────────────────
⋮----
ws.onopen = () =>
ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
⋮----
? null // fallback
⋮----
ws.onclose = () =>
⋮----
// ── Tab swap ─────────────────────────────────────────────────────────────────
⋮----
}, [tab?.path]); // eslint-disable-line react-hooks/exhaustive-deps
// ── External content sync ────────────────────────────────────────────────────
⋮----
// ── Save ──────────────────────────────────────────────────────────────────
⋮----
function onKey(e)
⋮----
const tbBtn = (active) => (
⋮----
{/* Toolbar */}
⋮----
{/* badges */}
⋮----
{/* fold/unfold */}
⋮----
{/* Breadcrumb */}
⋮----
{/* Editor + minimap */}
```

## File: src/components/FileTree.jsx
```javascript
function getFileIconData(name)
function FileIcon(
export function FileTree(
⋮----
// ── Theme tokens ──
⋮----
useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect
async function toggleDir(fullPath)
async function doRename(oldPath)
async function doCreate(parentPath)
async function doDelete(path)
// Flatten tree into searchable list
function flattenTree(items, basePath, acc = [])
const allFiles = useMemo(() => tree ? flattenTree(tree, folder) : [], [tree, expanded, folder]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
const inputStyle = (borderColor) => (
function renderItems(items, basePath, depth)
const iconBtn = (onClick, title, children) => (
    <button onClick={onClick} title={title}
      style={{background:'none',border:'none',color:textMute,cursor:'pointer',padding:'4px 6px',borderRadius:'5px',display:'flex',alignItems:'center'}}
      onMouseEnter={e=>e.currentTarget.style.background=bg3}
      onMouseLeave={e=>e.currentTarget.style.background='none'}>
      {children}
    </button>
  );
const ctxItem = (onClick, color, children) => (
    <div onClick={onClick}
      style={{padding:'7px 12px',fontSize:'12.5px',color:color||textSec,cursor:'pointer',borderRadius:'6px',display:'flex',alignItems:'center',gap:'8px'}}
      onMouseEnter={e=>e.currentTarget.style.background=color===error?errorBg:bg3}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      {children}
    </div>
  );
⋮----
{/* Fuzzy search */}
```

## File: src/components/GlobalFindReplace.jsx
```javascript
// ── GlobalFindReplace — search & replace across all project files ─────────────
⋮----
export function GlobalFindReplace(
⋮----
const [results,     setResults]     = useState([]); // [{file, matches:[{line,col,text}]}]
⋮----
// ── Search ──────────────────────────────────────────────────────────────────
⋮----
// Build grep command
⋮----
// Parse grep output: "path/to/file:linenum:col: text"
⋮----
// Make path relative
⋮----
// Auto-expand if few files
⋮----
// ── Replace all ─────────────────────────────────────────────────────────────
⋮----
// Read file
⋮----
doSearch(); // re-run search to show updated results
⋮----
{/* Header */}
⋮----
{/* Search bar */}
⋮----
{/* Replace row */}
⋮----
{/* Results */}
⋮----
{/* Replace log */}
⋮----
{/* Summary */}
⋮----
{/* File header */}
⋮----
{/* Match lines */}
```

## File: src/components/KeyboardRow.jsx
```javascript
// ── KeyboardRow — extra symbol row above Android soft keyboard ─────────────────
// Inserts symbols at cursor: either into a textarea or a CodeMirror view.
// Shows whenever a file is in edit mode on mobile.
⋮----
{ label: '→',  text: '  ' },  // indent (2 spaces)
⋮----
export function KeyboardRow(
```

## File: src/components/LivePreview.jsx
```javascript
// ── LivePreview — live HTML/CSS/JS iframe preview ─────────────────────────────
// Combines open HTML/CSS/JS files into a single srcdoc iframe.
// Intercepts console.log via postMessage for in-app display.
⋮----
function buildSrcdoc(tabs)
⋮----
// Inject CSS and JS into HTML
⋮----
// No HTML tab — synthesize one from CSS + JS
⋮----
export function LivePreview(
⋮----
// Debounced rebuild on tab content change
⋮----
// Manual refresh
⋮----
// Console message listener
⋮----
function onMsg(e)
⋮----
const logColor = (level) =>
⋮----
{/* Toolbar */}
⋮----
{/* Console panel */}
⋮----
{/* iframe */}
```

## File: src/components/MsgBubble.jsx
```javascript
// ── ThinkingBlock — collapsible, pakai count kalau ada newlines ──────────────
export function ThinkingBlock(
⋮----
// Count "steps" = non-empty paragraphs separated by blank lines
⋮----
// ── StreamingBubble — live render saat generate, parse think realtime ─────────
export function StreamingBubble(
⋮----
// Parse <think> dari stream secara realtime
⋮----
// Nothing yet — show blink cursor only
⋮----
// ── MsgContent — markdown + code blocks ──────────────────────────────────────
export function MsgContent(
⋮----
function copyCode(code, idx)
⋮----
function handleCopy(e)
⋮----
table:(
th:(
td:(
h1:(
h2:(
h3:(
p:(
code:(
blockquote:(
hr:(
strong:(
em:(
li:(
ul:(
ol:(
a:(
⋮----
{/* Header: label kiri */}
⋮----
// Code block — lang label kiri, copy button kanan (Claude/Gemini style)
⋮----
{/* Lang label — kiri */}
⋮----
{/* Copy button — kanan, compact */}
⋮----
// ── ActionChip ────────────────────────────────────────────────────────────────
export function ActionChip(
// ── MsgBubble ─────────────────────────────────────────────────────────────────
export function MsgBubble(
⋮----
function doCopy()
⋮----
// ── User bubble ─────────────────────────────────────────────────────────────
⋮----
// ── AI bubble ───────────────────────────────────────────────────────────────
⋮----
onEdit&&
```

## File: src/components/panels.agent.jsx
```javascript
export function ElicitationPanel(
⋮----
function set(name, val)
function handleSubmit()
⋮----
{/* Header */}
⋮----
{/* Fields */}
⋮----
{/* Actions */}
⋮----
// ─── MERGE CONFLICT PANEL ─────────────────────────────────────────────────────
export function SkillsPanel(
⋮----
async function handleUpload(e)
async function handleAdd()
⋮----
{/* Header */}
⋮----
{/* Inline add form */}
⋮----
{/* Skill list */}
⋮----
{/* Delete — hanya non-builtin */}
⋮----
{/* Toggle */}
⋮----
{/* Footer hint */}
⋮----
// ── DeployPanel ───────────────────────────────────────────────────────────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime(
export function BgAgentPanel(
⋮----
{/* Header row */}
⋮----
{/* Progress bar for running */}
⋮----
{/* Log — last 4 entries */}
⋮----
{/* Actions */}
```

## File: src/components/panels.base.jsx
```javascript
export function BottomSheet(
⋮----
function onTouchStart(e)
function onTouchMove(e)
function onTouchEnd()
⋮----
{/* drag handle zone */}
⋮----
export function CommandPalette({ onClose, onRun:_onRun, folder:_folder, memories, checkpoints, model, models, T,
  onModelChange, onNewChat, theme, onThemeChange, showSidebar, onToggleSidebar,
  onShowMemory, onShowCheckpoints, onShowMCP, onShowGitHub, onShowDeploy,
  onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  onShowSessions, onShowPermissions, onShowPlugins, onShowConfig,
  onShowSkills,
runTests, generateCommitMsg, exportChat, compactContext })
⋮----

⋮----
action:()=>
⋮----
// ─── DEP GRAPH PANEL (d3 force layout) ───────────────────────────────────────
```

## File: src/components/panels.git.jsx
```javascript
export function GitComparePanel(
⋮----
const [view, setView]       = useState('unified'); // 'unified' | 'split'
⋮----
async function load(s)
⋮----
// Compute stats
⋮----
useEffect(() => { load(false); }, []); // eslint-disable-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
function lineStyle(line)
function renderUnified()
function renderSplit()
⋮----
// Parse hunk into left (old) and right (new) columns
⋮----
// Try to pair with next + line
⋮----
{/* Left (old) */}
⋮----
{/* Right (new) */}
⋮----
const tabBtn = (label, active, onClick) => (
    <button onClick={onClick} style={{background:active?'rgba(255,255,255,.1)':'none',border:'1px solid '+(active?borderMed:border),borderRadius:'5px',padding:'3px 9px',color:active?text:textMute,fontSize:'11px',cursor:'pointer'}}>{label}</button>
  );
⋮----
{/* Header */}
⋮----
{/* Stats */}
⋮----
{/* Diff content */}
⋮----
// ─── FILE HISTORY PANEL ───────────────────────────────────────────────────────
export function FileHistoryPanel(
⋮----
async function preview(hash)
async function restore(hash)
⋮----
// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
export function GitBlamePanel(
// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
export function DepGraphPanel(
⋮----
// Support both new {nodes, edges} format and legacy {file, imports} format
⋮----
// Legacy fallback
⋮----
// Arrow marker
⋮----
}, [depGraph]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ─── ELICITATION PANEL (AI-requested dynamic form) ───────────────────────────
export function MergeConflictPanel(
⋮----
async function loadPreview(cf)
async function resolve(strategy)
async function abortMerge()
⋮----
{/* Header */}
⋮----
{/* Conflict files */}
⋮----
{/* Status */}
⋮----
{/* Actions */}
⋮----
// ── SkillsPanel ───────────────────────────────────────────────────────────────
```

## File: src/components/panels.jsx
```javascript
// ── panels.jsx — barrel re-export ───────────────────────────────────────────
// Semua panel diimport dari sini supaya App.jsx tidak perlu tahu lokasi internal.
// Edit panel: buka file yang sesuai:
//   panels.base.jsx  — BottomSheet, CommandPalette
//   panels.git.jsx   — GitComparePanel, FileHistoryPanel, GitBlamePanel,
//                      DepGraphPanel, MergeConflictPanel
//   panels.agent.jsx — ElicitationPanel, SkillsPanel, BgAgentPanel
//   panels.tools.jsx — CustomActionsPanel, ShortcutsPanel, SnippetLibrary,
//                      ThemeBuilder, DeployPanel, McpPanel, GitHubPanel,
//                      SessionsPanel, PermissionsPanel, PluginsPanel, ConfigPanel
```

## File: src/components/panels.tools.jsx
```javascript
// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
export function CustomActionsPanel(
⋮----
function save(list)
function add()
⋮----
// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────
// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────
export function ShortcutsPanel(
// ─── GIT BLAME PANEL ──────────────────────────────────────────────────────────
// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
export function SnippetLibrary(
⋮----
function addSnippet()
⋮----
// ─── THEME BUILDER ────────────────────────────────────────────────────────────
// ThemeBuilder diganti ThemePicker — theme kini dari file src/themes/*.js
// ─── THEME BUILDER ────────────────────────────────────────────────────────────
export function ThemeBuilder(
⋮----
{/* accent swatch */}
⋮----
// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────
// ── DeployPanel ───────────────────────────────────────────────────────────────
export function DeployPanel(
// ── McpPanel ──────────────────────────────────────────────────────────────────
// ── McpPanel ──────────────────────────────────────────────────────────────────
export function McpPanel(
// ── GitHubPanel ───────────────────────────────────────────────────────────────
// ── GitHubPanel ───────────────────────────────────────────────────────────────
export function GitHubPanel(
// ── SessionsPanel ─────────────────────────────────────────────────────────────
// ── SessionsPanel ─────────────────────────────────────────────────────────────
export function SessionsPanel(
// ── PermissionsPanel ──────────────────────────────────────────────────────────
// ── PermissionsPanel ──────────────────────────────────────────────────────────
export function PermissionsPanel(
// ── PluginsPanel ──────────────────────────────────────────────────────────────
// ── PluginsPanel ──────────────────────────────────────────────────────────────
⋮----
export function PluginsPanel(
// ── ConfigPanel ───────────────────────────────────────────────────────────────
export function ConfigPanel({
  effort, fontSize, theme, model, thinkingEnabled, models,
  onEffort, onFontSize, onTheme, onModel, onThinking,
  // Fase 1+2
  vimMode, onVimMode,
  showMinimap, onMinimap,
  ghostTextEnabled, onGhostText,
  lintEnabled, onLint,
  // Fase 3
  tsLspEnabled, onTsLsp,
  blameEnabled, onBlame,
  multiCursor, onMultiCursor,
  stickyScroll, onStickyScroll,
  collabEnabled, onCollab,
  onClose, T,
})
⋮----
// Fase 1+2
⋮----
// Fase 3
⋮----

⋮----
const makeToggle = (label, sublabel, value, onToggle, color, bg, br)
⋮----
function ToggleRow(
⋮----
// ── BgAgentPanel — live progress tracking ────────────────────────────────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime(
```

## File: src/components/SearchBar.jsx
```javascript
export function SearchBar(
⋮----
async function doSearch()
⋮----
export function UndoBar(
```

## File: src/components/Terminal.jsx
```javascript
// ── Terminal — xterm.js dengan layout yang benar ─────────────────────────────
⋮----
// xterm CSS diinject manual supaya tidak corrupt global styles
⋮----
// ── TrafficDot — isolated component so onClick never accesses ref during render
function TrafficDot(
export function Terminal(
⋮----
const wrapRef   = useRef(null);  // outer wrapper div (flex:1)
const xtermRef  = useRef(null);  // xterm mount target
⋮----
// ── Theme ─────────────────────────────────────────────────────────────────
⋮----
// ── Mount xterm ────────────────────────────────────────────────────────────
⋮----
// Fit after paint
⋮----
// ResizeObserver untuk fit otomatis
⋮----
// ── Update theme realtime ──────────────────────────────────────────────────
⋮----
function detectError(text)
function onTextChange(v)
function handleKeyDown(e)
function cancel()
⋮----
async function run()
⋮----
{/* Inject xterm CSS tanpa pollute global */}
⋮----
{/* macOS header */}
⋮----
{/* Traffic lights — fungsional: merah=stop, kuning=clear, hijau=send to AI */}
⋮----
{/* xterm container — flex:1 dengan overflow hidden */}
⋮----
{/* AI fix button */}
⋮----
{/* Input bar */}
```

## File: src/components/ThemeEffects.jsx
```javascript
// ── ThemeEffects ───────────────────────────────────────────────────────────────
// Render semua visual overlay berdasarkan tema aktif:
//   - Atmosphere orbs (semua tema)
//   - Scanlines layer (obsidian, neon)
//   - CRT scan bar (obsidian)
//   - Aurora animated orbs (aurora)
//   - Neon grid + scan pulse (neon)
//   - Paper grain SVG (ink)
//   - Vignette corner (obsidian)
// ─────────────────────────────────────────────────────────────────────────────
export function ThemeEffects(
⋮----
// Inject theme CSS once per theme change
⋮----
{/* ── Atmosphere Orbs (semua tema) ──────────────────────────────────── */}
⋮----
{/* ── Scanlines (obsidian, neon) ─────────────────────────────────────── */}
⋮----
{/* ── CRT rolling scan bar (obsidian) ──────────────────────────────── */}
⋮----
{/* Corner vignette */}
⋮----
{/* ── Neon grid + scan pulse (neon) ─────────────────────────────────── */}
⋮----
{/* Subtle perspective grid */}
⋮----
{/* Horizontal scan pulse */}
⋮----
{/* Corner vignette dark */}
⋮----
{/* ── Aurora shimmer overlay (aurora) ───────────────────────────────── */}
⋮----
{/* Diagonal aurora band */}
⋮----
{/* Corner vignette subtle */}
⋮----
{/* ── Paper grain texture (ink) ─────────────────────────────────────── */}
⋮----
{/* SVG turbulence grain */}
⋮----
{/* Subtle paper discoloration */}
```

## File: src/components/VoiceBtn.jsx
```javascript
export function VoiceBtn(
⋮----
async function toggle()
⋮----
// Show partial results
⋮----
// Web fallback
⋮----
r.onresult = e => {
      const transcript = e.results[0][0].transcript;
      if (e.results[0].isFinal) { onResult(transcript); setListening(false); setPartial(''); }
      else setPartial(transcript);
r.onerror = () =>
r.onend   = () =>
⋮----
export function PushToTalkBtn(
⋮----
async function onPressIn()
async function onPressOut()
```

## File: src/hooks/useAgentLoop.js
```javascript
export function useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
  growth,
})
⋮----
// ── callAI ──
function callAI(msgs, onChunk, signal, imageBase64)
⋮----
// Llama 4 Scout support vision, llama-3.3-70b tidak
⋮----
// ── abTest — kirim ke dua model paralel, tampilkan side by side ──
async function abTest(task, modelA, modelB)
⋮----
// Tampilkan hasil side by side
⋮----
...m.slice(0, -1), // hapus "Menunggu..." bubble
⋮----
// ── compactContext ──
async function compactContext()
// ── executeWithPermission ──
async function executeWithPermission(a, folder)
// ── gatherProjectContext — "read before act" ─────────────────────────────────
// Priority: handoff.md → map.md → llms.txt → tree → keyword heuristic files
async function gatherProjectContext(txt, _signal)
⋮----
// 1. Session handoff — highest priority (previous session context)
⋮----
// 2. Codebase map — symbol index (signatures only, low token cost)
⋮----
// 2b. Compressed source — repomix-style, bodies stripped (~70% reduction)
// Only load if task is complex (mentions multiple files or refactor keywords)
⋮----
// 3. llms.txt — project brief (architecture, constraints, patterns)
⋮----
// 4. Tree struktur (always — untuk spatial awareness)
⋮----
// 5. Keyword heuristic — file yang spesifik relevan dengan task
⋮----
// Task mentions file name directly
⋮----
// Keyword → relevant file
⋮----
// 6. Baca paralel — max 5 additional files
⋮----
// ── buildSystemPrompt ───────────────────────────────────────────────────────
function buildSystemPrompt(txt, cfg)
⋮----
const stripFrontmatter = s
⋮----
// ── sendMsg — agent loop ──
async function sendMsg(override)
⋮----
// Slash command
⋮----
// Auto-compact jika context > 80K chars
⋮----
// compactContext sudah update chat.messages — tapi kita gunakan history lama
// untuk allMessages awal (messages baru akan terpakai di iter berikutnya via getState)
⋮----
// ── Pre-load pinned files ──
⋮----
// ── Read before act — gather project context sebelum iter 1 ──
⋮----
// ── MAIN AGENT LOOP ──
⋮----
// content bisa array (vision dari iter sebelumnya) — flatten ke string untuk history
⋮----
// Token tracking
⋮----
// ── Separate actions by type ──
// patch_file  → auto-execute (find-and-replace)
// write_file  → auto-execute WITH backup (Claude Code behavior)
// read_file   → parallel
// web_search  → parallel
// safe others (list,tree,search,mkdir,file_info,find_symbol) → parallel
// exec        → serial (side effects, order matters)
// mcp         → serial
⋮----
// ── Read files (parallel) ──
⋮----
// ── Web search + safe actions (all parallel) ──
⋮----
// ── Exec / MCP (serial — order matters) ──
⋮----
// ── AUTO-EXECUTE patch_file ──
⋮----
// Patch failed → self-correct
⋮----
// ── AUTO-EXECUTE write_file (Claude Code style: backup → write → continue) ──
⋮----
// Backup dulu untuk undo
⋮----
// Store backups for undo
⋮----
// ── Defensive review pass — security & edge cases ──
⋮----
// ── Auto-verify after write — run file, feed error back ──
⋮----
break; // re-enter loop with error context
⋮----
// ── Auto-load imports dari file yang dibaca ──
⋮----
// ── Exec error → auto-fix loop ──
⋮----
// ── Build feedback ──
⋮----
// ── Tidak ada data baru → done ──
⋮----
// ── Ada data → feed back ke AI ──
⋮----
// Tambah XP per sesi dan pelajari style
⋮----
// Auto-continue
⋮----
// PROJECT_NOTE extraction
⋮----
// Elicitation
⋮----
// Tambah XP per sesi dan pelajari style
⋮----
// ── Derived actions ──
function cancelMsg()
⋮----
// Tambah XP per sesi dan pelajari style
⋮----
async function continueMsg()
async function retryLast()
```

## File: src/hooks/useAgentSwarm.js
```javascript
export function useAgentSwarm({
  callAI, folder,
  setSwarmRunning, setSwarmLog, setMessages,
  sendNotification, haptic, abortRef,
})
⋮----
async function runAgentSwarm(task)
⋮----
const log = msg
```

## File: src/hooks/useApprovalFlow.js
```javascript
export function useApprovalFlow({
  messages, setMessages,
  folder, hooks, permissions,
  _editHistory, setEditHistory,
  sendMsgRef, callAI, abortRef,
  setLoading,
})
⋮----
async function handleApprove(idx, ok, targetPath)
⋮----
const isWrite = a
⋮----
// Backup sebelum tulis
⋮----
// Atomic rollback jika ada yang gagal
⋮----
// Syntax verify (jika exec permission aktif)
⋮----
async function handlePlanApprove(idx, approved)
```

## File: src/hooks/useBrightness.js
```javascript
// ── useBrightness — real-time adaptive brightness ────────────────────────
// ContentObserver native → emit setiap slider berubah → scale filter dinamis
// Tidak ada polling. Tidak ada threshold on/off. Murni proporsional.
⋮----
export function useBrightness(setBrightnessLevel)
```

## File: src/hooks/useChatStore.js
```javascript
export function useChatStore()
⋮----
// ── Core chat ──
⋮----
const [agentStatus, setAgentStatus]   = useState(''); // e.g. 'Iter 2/10 · exec'
⋮----
// ── Rate limit ──
⋮----
// ── Memories / Checkpoints ──
⋮----
// ── Agent / Plan ──
⋮----
// ── Input extras ──
⋮----
// ── Persisted setters ──
function setMemories(next)
function setCheckpoints(next)
// ── Load from Preferences ──
function loadChatPrefs(
// ── Persist messages on change (called from useEffect in App) ──
function persistMessages(msgs)
// ── trimHistory ──
function trimHistory(msgs)
// ── Auto memory extraction ──
async function extractMemories(userMsg, aiReply, folder)
⋮----
// Skip kalau reply terlalu pendek atau tidak technical
⋮----
// ── getRelevantMemories (TF-IDF scoring) ──
function getRelevantMemories(txt)
⋮----
// Fallback to most recent if no scores > 0
⋮----
// ── saveCheckpoint — chat + file snapshot via git stash snapshot ──
async function saveCheckpoint(folder, branch, notes, callServerFn)
⋮----
// Snapshot file state: capture git diff as patch
⋮----
filePatch,                       // git diff snapshot
⋮----
// ── restoreCheckpoint — chat + optional file restore ──
async function restoreCheckpoint(cp, setFolder, setFolderInput, setNotesRaw, callServerFn)
⋮----
// Offer to restore file state via reverse patch
⋮----
// ── exportChat ──
function exportChat()
// ── clearChat ──
function clearChat()
// ── startRateLimitTimer ──
function startRateLimitTimer(secs)
⋮----
deleteMessage: (idx)
editMessage:   (idx, newContent) => setMessages(m => m.map((msg, i) => i === idx ?
⋮----
// functions
```

## File: src/hooks/useDevTools.js
```javascript
export function useDevTools({
  folder, githubRepo, githubToken, setGithubData,
  setMessages, setLoading, setStreaming, setDeployLog,
  callAI, sendMsgRef,
  sendNotification, haptic, abortRef,
  addHistory,
})
⋮----
async function fetchGitHub(action)
async function runDeploy(platform)
async function generateCommitMsg()
async function runTests()
async function browseTo(url)
async function runShortcut(cmd)
```

## File: src/hooks/useFileStore.js
```javascript
export function useFileStore()
⋮----
// ── Multi-tab state ──
const [openTabs, setOpenTabs]       = useState([]);   // [{path, content, dirty}]
⋮----
// ── Legacy single-view state (still used for some flows) ──
const [activeTab, setActiveTab]     = useState('chat'); // 'chat' | 'file'
⋮----
// ── Derived compat ──
⋮----
// ── Lists ──
⋮----
// Ref to always read the latest openTabs in async contexts
⋮----
// ── Persisted setters ──
function setRecentFiles(next)
function setPinnedFiles(next)
// ── Load from Preferences ──
function loadFilePrefs(
// ── setActiveTabIdx (also switches to file tab) ──
function setActiveTabIdx(idx)
// ── openFile — opens in existing tab or new tab ──
async function openFile(path)
⋮----
// Check if already open
⋮----
// Load content
⋮----
// Recent files
⋮----
// ── closeTab ──
function closeTab(idx)
// ── updateTabContent — marks a tab dirty (from editor changes) ──
function updateTabContent(idx, content)
// ── saveFile — saves current active tab to server ──
async function saveFile(content, onMsg)
// ── Backward compat setters ──
function setSelectedFile(path)
function setFileContent(content)
// ── togglePin ──
function togglePin(path)
// ── undoLastEdit ──
async function undoLastEdit(onMsg)
// ── readFilesParallel ──
async function readFilesParallel(paths, folder)
// ── handleApprove (write file batch with backup + rollback) ──
async function handleApprove(idx, ok, targetPath, messages, setMessages, folder, hooks, runHooksV2, permissions)
⋮----
// Syntax verify
⋮----
// Multi-tab
⋮----
// Backward compat derived
⋮----
// Legacy view state
⋮----
// Lists
⋮----
// Actions
```

## File: src/hooks/useGrowth.js
```javascript
// ── useGrowth — Yuyu yang tumbuh + Gamifikasi ─────────────────────────────────
// Yuyu belajar dari setiap sesi: naming style, bahasa dominan, error patterns
// Gamifikasi: streak harian, XP, badge — motivasi solo dev tanpa tim
⋮----
// ── XP table ──
⋮----

⋮----
export function useGrowth()
⋮----
const [newBadge, setNewBadge]       = useState(null); // untuk toast notif
// ── Load on mount ──
⋮----
// Update streak on open
⋮----
function setXp(val)
function setBadges(val)
function setLearnedStyle(val)
// ── addXP — tambah XP + cek badge baru ──
function addXP(event)
⋮----
// Cek badge baru
⋮----
setNewBadge(earned[earned.length - 1]); // toast badge terakhir
⋮----
// ── learnFromSession — analisis pola coding, update learnedStyle ──
async function learnFromSession(messages, folder)
⋮----
// Minimal 5 pesan dan ada aktivitas file
⋮----
// Ambil sample pesan user
⋮----
// Ambil sample kode yang ditulis AI
⋮----
// Merge dengan style lama — pertahankan yang lama, update/tambah yang baru
⋮----
// ── summary untuk display ──
```

## File: src/hooks/useMediaHandlers.js
```javascript
export function useMediaHandlers(
⋮----
function handleImageAttach(e)
⋮----
reader.onload = ev =>
⋮----
// ── Camera capture (Capacitor native) ────────────────────────────────────────
async function handleCameraCapture()
⋮----
// User cancelled or permission denied — silent fail
⋮----
// ── Gallery pick ──────────────────────────────────────────────────────────────
async function handleGalleryPick()
⋮----
} catch (_e) { /* cancelled */ }
⋮----
function handleDrop(e)
```

## File: src/hooks/useNotifications.js
```javascript
export function useNotifications()
⋮----
function sendNotification(title, body)
function haptic(type = 'light')
function speakText(text)
function stopTts()
```

## File: src/hooks/useProjectStore.js
```javascript
export function useProjectStore()
⋮----
// ── Battery ──
⋮----
// ── Project / Folder ──
⋮----
// ── Server / Network ──
⋮----
// ── Model / Effort ──
⋮----
// ── Session identity ──
⋮----
// ── Command history ──
⋮----
// ── Permissions / Hooks / Plugins ──
⋮----
// ── GitHub ──
⋮----
// ── Agent memory (cross-session user/project/local) ──
⋮----
// ── Loop / PTT ──
⋮----
// ── File watcher (belongs to project context) ──
⋮----
// ── Persisted setters ──
function setFolder(f)
function saveFolder(f)
function setModel(id)
function setEffort(e)
function setNotes(n, folderKey)
function setSessionColor(c)
function setGithubToken(t)
function setGithubRepo(r)
function setPermissions(p)
function setHooks(h)
function setActivePlugins(p)
// ── addHistory ──
function addHistory(cmd)
// ── runHooks wrapper ──
async function runHooks(type, context = '')
// ── effortCfg derived ──
⋮----
// ── Load from Preferences ──
function loadProjectPrefs({
    folder: f, cmdHistory: ch, model: mo, pinned: _pinned, recent: _recent,
    memories: _memories, checkpoints: _checkpoints, hooks: hk, githubToken: ght, githubRepo: ghr,
    sessionColor: sc, plugins, effort: ef, thinkingEnabled: th, permissions: perm,
})
// ── Load folder-specific prefs ──
async function loadFolderPrefs(f)
⋮----
// Auto-load skills dari .yuyu/skills/, respect saved active map
⋮----
// ── Skill helpers ──
async function toggleSkill(name)
async function uploadSkill(name, mdContent)
async function removeSkill(name)
```

## File: src/hooks/useSlashCommands.js
```javascript
export function useSlashCommands({
  // state
  model, folder, branch, messages, selectedFile, fileContent, notes,
  memories, checkpoints: _checkpoints, skills, thinkingEnabled, effort, loopActive,
  loopIntervalRef, agentMemory, splitView, pushToTalk, sessionName,
  sessionColor, fileWatcherActive, fileWatcherInterval,
  // setters
  setModel, setMessages, setFolder: _setFolder, setFolderInput: _setFolderInput, setLoading, setStreaming: _setStreaming,
  setThinkingEnabled, setEffort, setLoopActive, setLoopIntervalRef,
  setSplitView, setPushToTalk, setSessionName, setSessionColor,
  setSkills: _setSkills, setFileWatcherActive, setFileWatcherInterval, setFileSnapshots,
  setPlanSteps, setPlanTask, setAgentMemory, setSessionList,
  setShowCheckpoints, setShowMemory: _setShowMemory, setShowMCP, setShowGitHub, setShowDeploy,
  setShowSessions, setShowPermissions, setShowPlugins, setShowConfig,
  setShowCustomActions, setShowFileHistory, setShowThemeBuilder,
  setShowDepGraph,
  setDepGraph, setFontSize,
  setShowMergeConflict, setMergeConflictData,
  setShowSkills, setShowBgAgents,
  // functions
  sendMsg, compactContext, saveCheckpoint, exportChat,
  browseTo, runAgentSwarm, callAI, abTest,
  growth,
  sendNotification, haptic,
  // refs
  abortRef,
})
⋮----
// state
⋮----
// setters
⋮----
// functions
⋮----
// refs
⋮----
// ⚠️ Recursive summary anti-pattern — bisa degradasi accuracy seiring waktu
⋮----
// Generate session handoff — structured context for next session
// Better than /compact: creates a forward-looking brief, not recursive summary
⋮----
// Save to .yuyu/handoff.md
⋮----
// Ensure .yuyu dir exists
⋮----
// /review src/api.js — load file directly
⋮----
async function parseFile(path, depth)
⋮----
// Auto-discover .db files
⋮----
// /db use <file.db> — persist active db per folder di ref
⋮----
// Real-time symbol index via yuyu-server — all function signatures, no bodies
⋮----
// Gather project info
⋮----
// eslint-disable-next-line react-hooks/exhaustive-deps
```

## File: src/hooks/useUIStore.js
```javascript
export function useUIStore()
⋮----
// ── Ambient brightness ──
⋮----
// ── Panels / Overlays ──
⋮----
// ── Editor feature toggles (Fase 1+2) ──
⋮----
// ── Editor feature toggles (Fase 3) ──
⋮----
// ── Theme / Display ──
⋮----
// ── Misc UI ──
⋮----
// ── Elicitation ──
⋮----
// ── Merge Conflict ──
⋮----
// ── Derived: T = active theme object ──
⋮----
// ── Persisted setters ──
function setTheme(key)
function setFontSize(n)
function setSidebarWidth(w)
function setVimMode(v)
function setShowMinimap(v)
function setGhostTextEnabled(v)
function setLintEnabled(v)
function setTsLspEnabled(v)
function setBlameEnabled(v)
function setMultiCursor(v)
function setStickyScroll(v)
function setCollabEnabled(v)
// ── Load from Preferences ──
function loadUIPrefs(
⋮----
// panels
⋮----
// editor feature toggles fase 1+2
⋮----
// editor feature toggles fase 3
⋮----
// theme/display
⋮----
// misc
```

## File: src/plugins/brightness.js
```javascript
// ── Brightness Plugin Bridge ───────────────────────────────────────────────
// Wraps native BrightnessPlugin via Capacitor — real-time ContentObserver
⋮----
// Web fallback — tidak ada brightness API di browser
⋮----
getBrightness: async () => (
addListener: () => (
removeAllListeners: async () =>
```

## File: src/themes/aurora.js
```javascript
// ── Aurora Glass ───────────────────────────────────────────────────────────────
// Efek: glassmorphism real, aurora bands bergerak, backdrop blur, refraction
// ─────────────────────────────────────────────────────────────────────────────
⋮----
aiBubble: () => (
userBubble: () => (
glowBorder: (color='#8b5cf6') => (
codeBlock: () => (
chipOk: () => (
glowText: () => ({}), // Aurora tidak pakai text glow
inputFocus: () => (
```

## File: src/themes/index.js
```javascript
// ── Theme Registry ────────────────────────────────────────────────────────────
// Tambah theme baru di sini:
//   1. Buat file di src/themes/namabaru.js (copy dari template)
//   2. import namabaru from './namabaru.js'
//   3. Tambah ke THEMES_MAP
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// Key yang valid untuk disimpan ke Preferences
⋮----
// Default fallback
```

## File: src/themes/ink.js
```javascript
// ── Ink & Paper ────────────────────────────────────────────────────────────────
// Efek: paper grain texture via SVG, brushstroke separators, aged paper feel
// Zero glow — semua matte, kontras tinggi seperti tinta di kertas
// ─────────────────────────────────────────────────────────────────────────────
⋮----
aiBubble: () => (
⋮----
// Ink: no bubble at all — bare text with left rule
⋮----
userBubble: () => (
glowBorder: () => ({}), // No glow in ink
codeBlock: () => (
chipOk: () => (
glowText: () => (
inputFocus: () => (
```

## File: src/themes/mybrand.js
```javascript
// ── My Brand Theme — Template untuk Custom Theme ────────────────────────────
// TEMPLATE: Ini bukan tema aktif. Copy, rename, isi token, import di index.js.
// Lihat src/themes/obsidian.js untuk referensi skema lengkap.
// ─────────────────────────────────────────────────────────────────────────────
/** @type {import('./index').YuyuTheme} */
⋮----
// ── Global colours ────────────────────────────────────────────────────────
⋮----
// ── Atmosphere (glow blobs di bg) ─────────────────────────────────────────
⋮----
// ── Header ────────────────────────────────────────────────────────────────
⋮----
// ── Chat Bubbles ──────────────────────────────────────────────────────────
⋮----
// ── Action Chips ──────────────────────────────────────────────────────────
⋮----
// ── Code Blocks ───────────────────────────────────────────────────────────
⋮----
// ── Loading dots ──────────────────────────────────────────────────────────
⋮----
// ── Input Area ────────────────────────────────────────────────────────────
⋮----
// ── Slash Command Popup ───────────────────────────────────────────────────
⋮----
// ── Per-theme CSS & Animations ────────────────────────────────────────────
⋮----
// ── Visual FX helpers (dipakai oleh MsgBubble) ───────────────────────────
⋮----
aiBubble:   () => (
userBubble: () => (
glowBorder: (color='#d97706', intensity=1) => (
codeBlock:  () => (
chipOk:     () => (
glowText:   (color='#d97706') => (
inputFocus: () => (
```

## File: src/themes/neon.js
```javascript
// ── Neon Terminal ──────────────────────────────────────────────────────────────
// Efek: real neon glow, flicker animation, cyberpunk grid, scan pulse
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ── CSS injected globally ────────────────────────────────────────────────
⋮----
// ── Per-element effect functions ─────────────────────────────────────────
⋮----
// Extra box-shadow for accented borders
glowBorder: (color='#00ff8c', intensity=1) => (
// AI bubble extra glow
aiBubble: () => (
// User bubble glow
userBubble: () => (
// Neon text glow
glowText: (color='#00ff8c') => (
// Code block glow
codeBlock: () => (
// Action chip glow when ok
chipOk: () => (
// Input focus
inputFocus: () => (
```

## File: src/themes/obsidian.js
```javascript
// ── Obsidian Warm ──────────────────────────────────────────────────────────────
// Efek: CRT scanlines rolling, amber phosphor glow, screen vignette, warm static
// ─────────────────────────────────────────────────────────────────────────────
⋮----
aiBubble: () => (
userBubble: () => (
glowBorder: (color='#d97706', intensity=1) => (
codeBlock: () => (
chipOk: () => (
glowText: (color='#d97706') => (
inputFocus: () => (
```

## File: src/api.js
```javascript
// ── SHARED SSE STREAM READER ───────────────────────────────────────────────────
export async function readSSEStream(resp, onChunk, signal)
⋮----
// flush
⋮----
// ── INJECT VISION IMAGE ────────────────────────────────────────────────────────
function injectVision(messages, imageBase64)
// ── CEREBRAS STREAMING ─────────────────────────────────────────────────────────
async function _cerebrasOnce(messages, model, onChunk, signal, options)
// ── GROQ STREAMING ─────────────────────────────────────────────────────────────
async function _groqOnce(messages, model, onChunk, signal, options)
// ── UNIFIED AI CALL — auto-fallback Cerebras → Groq ───────────────────────────
// - Cerebras model → tries Cerebras, jika rate limit → fallback ke Groq (kimi-k2)
// - Groq model → langsung ke Groq
export async function askCerebrasStream(messages, model, onChunk, signal, options =
⋮----
// ── Groq model: langsung ke Groq ──
⋮----
// ── Cerebras model: try Cerebras, fallback Groq on rate limit ──
⋮----
// Rate limit → auto-switch ke Groq
⋮----
// Groq juga rate limit? lempar error asli biar timer tetap jalan
⋮----
// Server error → retry
⋮----
// ── CALL SERVER (HTTP) ─────────────────────────────────────────────────────────
export async function callServer(payload)
// ── EXEC STREAM via WebSocket ──────────────────────────────────────────────────
export function execStream(command, cwd, onLine, signal)
⋮----
const cleanup = () =>
const done = (exitCode) =>
ws.onopen = () => ws.send(JSON.stringify(
ws.onmessage = (e) =>
ws.onerror = () =>
ws.onclose = () =>
⋮----
// ── CALL SERVER BATCH ──────────────────────────────────────────────────────────
export async function callServerBatch(payloads)
```

## File: src/App.jsx
```javascript
export default function App()
⋮----
// ── STORES ──
⋮----
// ── Dynamic brightness filter — gamma-corrected two-layer ──
// Layer 1: CSS brightness capped at 2.0 (no 8-bit quantization artifacts).
// Layer 2: mix-blend-mode:screen overlay for extreme low brightness boost.
⋮----
// ── REFS ──
⋮----
// ── HOOKS ──
⋮----
saveCheckpoint: ()
⋮----
// ── EFFECTS ──
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, [project.batteryLevel, project.batteryCharging]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
const on=()
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(() => { chat.persistMessages(chat.messages); }, [chat.messages]); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(() => { if(project.folder) project.loadFolderPrefs(project.folder); }, [project.folder]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
function connect()
⋮----
ws.onopen = () => ws.send(JSON.stringify(
ws.onmessage = async (e) =>
ws.onerror = () =>
ws.onclose = () =>
⋮----
}, [project.fileWatcherActive, project.folder]); // eslint-disable-line react-hooks/exhaustive-deps
// ── HELPERS ──
function saveFolder(f)
function undoLastEdit()
function saveCheckpoint()
function restoreCheckpoint(cp)
function onSidebarDragStart(e)
⋮----
function onMove(ev)
function onEnd()
⋮----
// ── RENDER ──
⋮----
{/* Brightness screen overlay — mix-blend-mode:screen, no banding */}
⋮----
{/* Badge toast */}
```

## File: src/constants.js
```javascript
// Re-export THEMES_MAP as THEMES untuk backward compat (panels.jsx, App.jsx)
⋮----
// ── Agent loop limits ─────────────────────────────────────────────────────────
export const AUTO_COMPACT_CHARS   = 80_000;  // trigger auto-compact
export const AUTO_COMPACT_MIN_MSG = 12;      // min messages before auto-compact
export const MAX_FILE_PREVIEW     = 2_000;   // chars of open file injected to context
export const MAX_SKILL_PREVIEW    = 6_000;   // max chars per skill in context
export const CONTEXT_RECENT_KEEP  = 6;       // messages kept after compact
// ── Vision ───────────────────────────────────────────────────────────────────
⋮----
// Cerebras — ultra-fast inference
⋮----
// Groq — large context, fallback
⋮----
// ── SIAPA YUYU ───────────────────────────────────────────────────────────
```

## File: src/features.js
```javascript
// ── FEATURES v3 — Overhaul ─────────────────────────────────────────────────────
⋮----
// ─── PLAN MODE ────────────────────────────────────────────────────────────────
export function parsePlanSteps(reply)
export async function generatePlan(task, folder, callAI, signal)
export async function executePlanStep(step, folder, callAI, signal, onChunk)
// ─── BACKGROUND AGENTS WITH GIT WORKTREE ISOLATION ───────────────────────────
⋮----
export function getBgAgents()
async function execGit(folder, cmd)
// Background agent dengan REAL agentic loop (tidak hanya satu call)
export async function runBackgroundAgent(task, folder, callAI, onDone)
⋮----
agent.abort = () =>
// Async agent loop in background
⋮----
// 1. Setup worktree
⋮----
// 2. Real agentic loop (up to 8 iterations)
⋮----
// Auto-execute patches in bg agent
⋮----
// Write new files
⋮----
// Break if done
⋮----
// Feed results back
⋮----
// 3. Commit semua perubahan
⋮----
export async function mergeBackgroundAgent(id, folder)
export function abortBgAgent(id)
// ─── SKILLS SYSTEM ────────────────────────────────────────────────────────────
// ── loadSkills: .yuyu/skills/*.md only ─────────────────────────────────────
export async function loadSkills(folder, activeMap =
⋮----
// .yuyu/skills/*.md
⋮----
active: activeMap[f.name] !== false,   // default on
⋮----
// ── Upload / save skill to .yuyu/skills/ ────────────────────────────────────
export async function saveSkillFile(folder, name, content)
// ── Delete skill file ─────────────────────────────────────────────────────────
export async function deleteSkillFile(folder, name)
export function selectSkills(skills, taskText)
// ─── HOOKS v2 ────────────────────────────────────────────────────────────────
⋮----
export async function runHooksV2(hookList, context, folder)
// ─── TOKEN TRACKER ────────────────────────────────────────────────────────────
export class TokenTracker
⋮----
reset()
record(inTk, outTk, model)
lastCost()
summary()
⋮----
// ─── SESSION MANAGER ─────────────────────────────────────────────────────────
export async function saveSession(name, messages, folder, branch)
export async function loadSessions()
// ─── REWIND ──────────────────────────────────────────────────────────────────
export function rewindMessages(messages, turns)
// ─── EFFORT LEVELS ───────────────────────────────────────────────────────────
⋮----
// ─── PERMISSIONS ─────────────────────────────────────────────────────────────
⋮----
write_file:  true,   // auto-execute like Claude Code
⋮----
exec:        true,   // Claude Code runs commands freely
⋮----
delete_file: false,  // tetap false — terlalu destruktif
⋮----
export function checkPermission(permissions, actionType)
⋮----
// normalize: patch_file and write_file use separate permissions now
⋮----
// ─── ELICITATION ─────────────────────────────────────────────────────────────
export function parseElicitation(reply)
// ─── TF-IDF MEMORY RANKING ───────────────────────────────────────────────────
export function tfidfRank(memories, queryText, topN = 5)
```

## File: src/main.jsx
```javascript
class ErrorBoundary extends React.Component
⋮----
static getDerivedStateFromError(e)
render()
```

## File: src/setupTest.js
```javascript
// Setup global mocks for tests
// Contoh: TextDecoder, fetch, dll
```

## File: src/theme.js
```javascript
// ── YuyuCode Active Theme ────────────────────────────────────────────────────
// Ganti file ini untuk ganti tema — atau import dari themes/ yang udah ada:
//
//   import theme from './themes/aurora.js'
//   import theme from './themes/neon.js'
//   import theme from './themes/ink.js'
//   import theme from './themes/obsidian.js'
//   import theme from './themes/mybrand.js'   ← custom buatan sendiri
//
// Atau edit langsung di sini. Token yang tersedia ada di bawah.
// ─────────────────────────────────────────────────────────────────────────────
```

## File: src/utils.js
```javascript
// ── TOKEN COUNT ──
export function countTokens(msgs)
// ── FILE ICON ──
export function getFileIcon(name)
// ── SYNTAX HIGHLIGHT ──
// Baru untuk dimasukkan ke utils.js
// Ganti function hl() yang lama
export function hl(code, lang = '')
⋮----
// Protect already-generated spans from subsequent regex passes
function protect(str, fn)
⋮----
s = protect(s, t => t.replace(/(\"(?:[^\"\\]|\\.)*\")(\s*:)/g, '<span style="color:#79b8ff">$1</span>$2')); // eslint-disable-line no-useless-escape
s = protect(s, t => t.replace(/:\s*(\"(?:[^\"\\]|\\.)*\")/g, ': <span style="color:#98c379">$1</span>')); // eslint-disable-line no-useless-escape
⋮----
s = protect(s, t => t.replace(/(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>')); // eslint-disable-line no-useless-escape
⋮----
// default JS/JSX/TS/TSX
⋮----
s = protect(s, t => t.replace(/(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>')); // eslint-disable-line no-useless-escape
⋮----
// ── PATH RESOLVER ──
export function resolvePath(base, p)
⋮----
const b = base.replace(/\/$/, '');      // strip trailing slash
const q = p.replace(/^\//, '');          // strip leading slash
⋮----
// ── ACTION PARSER ──
export function parseActions(text)
// ── SIMPLE DIFF GENERATOR ──
// Returns a compact unified-diff-style string for display (not patch format).
export function generateDiff(original, patched, maxLines = 40)
// ── ACTION EXECUTOR ──
export async function executeAction(action, baseFolder)
```
