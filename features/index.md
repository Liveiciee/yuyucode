# Features

YuyuCode's features fall into four categories. Each is opt-in where possible — the defaults are conservative to preserve battery and responsiveness on a $130 phone.

## Agent System

The core of YuyuCode. Three modes for different kinds of work:

- **[Standard Loop](/features/agents#standard-agent-loop)** — iterative task execution with full filesystem access, context gathering, and automatic error recovery
- **[Background Agents](/features/agents#background-agents)** — long-running tasks in isolated git worktrees, your main branch stays clean
- **[Agent Swarm](/features/agents#agent-swarm)** — Architect + FE Agent + BE Agent + QA, parallel execution, for greenfield features

## Code Editor

CodeMirror 6 with features designed specifically for mobile coding:

- **[AI Ghost Text](/features/editor#ai-ghost-text-two-levels)** — two-level prediction (300ms next line, 900ms lookahead), Tab / Tab+Tab accept
- **[Vim Mode](/features/editor#vim-mode)** — full normal/insert/visual with `:wq`
- **[TypeScript LSP](/features/editor#typescript-lsp)** — autocomplete and type info on JS/TS
- **[Git Inline Blame](/features/editor#git-inline-blame)** — per-line commit info in the gutter
- **[Realtime Collaboration](/features/editor#realtime-collaboration)** — OT-based two-device sync over WebSocket
- **[Minimap](/features/editor#minimap)** — semantic canvas overview
- And more: Emmet, sticky scroll, breadcrumb, multi-cursor, inline lint, code folding

## Write Safety

- **[Diff Review](/features/diff-review)** — pause the agent before any write, inspect colour-coded diffs, accept or reject with feedback, atomic rollback on failure
- **Auto-verify** — after write, runs the file and feeds errors back into the loop automatically
- **Defensive review** — security pass on every write: missing validation, unhandled edge cases, potential crashes
- **`/undo`** — roll back the last N file edits regardless of how they were written

## Mobile-Native

- **[Perceptual Brightness Compensation](/features/brightness)** — Weber-Fechner scaling below 25% screen brightness, zero cost above threshold
- **[Wake Word](/features/wake-word)** — "Hey Yuyu" hands-free activation via Web Speech API, auto-restarts on error, toggle in `/config`
- **[Onboarding Wizard](/features/onboarding)** — step-by-step first-run setup: server ping, encrypted key entry, project folder selection
- **Camera-to-Code** — photo → vision model → code, one tap
- **Extra Keyboard Row** — `{ } [ ] ( ) ; => // : .` always visible above the soft keyboard
- **Live Preview** — split view iframe srcdoc with console intercept
- **xterm.js Terminal** — 2000-line scrollback, ANSI support, traffic lights (kill / clear / send to AI)
- **Haptic feedback** — distinct patterns for send, success, error, swarm complete

## Security

- **[Encrypted Key Storage](/guide/runtime-keys)** — API keys encrypted with AES-256-GCM + PBKDF2 (300K iterations). 24h expiry. Change at runtime with `/apikeys` — no APK rebuild, no plaintext ever written to disk.
