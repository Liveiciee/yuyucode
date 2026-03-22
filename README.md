<div align="center">

<img src="public/banner.svg" width="880" alt="YuyuCode — A full agentic coding assistant, built entirely on an Android phone." />

<br/>

[![Release](https://img.shields.io/github/v/release/liveiciee/yuyucode)](https://github.com/liveiciee/yuyucode/releases)
[![Benchmark](https://github.com/liveiciee/yuyucode/actions/workflows/bench.yml/badge.svg)](https://liveiciee.github.io/yuyucode/dev/bench/)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Liveiciee_yuyucode&metric=coverage)](https://sonarcloud.io/project/overview?id=Liveiciee_yuyucode)
[![DeepSource](https://deepsource.io/gh/liveiciee/yuyucode.svg/)](https://deepsource.io/gh/liveiciee/yuyucode/)
[![Last Commit](https://img.shields.io/github/last-commit/liveiciee/yuyucode)](https://github.com/liveiciee/yuyucode/commits/main)

<br/>

**[📖 Documentation →](https://liveiciee.github.io/yuyucode/)**

<br/>

> *Every line of code in this repo was written from a phone, in Termux, using Claude AI.*
> *No laptop. No desktop. Ever.*

</div>

---

**v4.2.0** — Personal tool. Works on one phone — mine. Not production software. Tested on one device (Oppo A77s, Snapdragon 680, Android 14). Issues welcome. Use at your own risk.

---

## What is this?

YuyuCode is a Claude Code / Cursor-style agentic coding assistant that runs natively on Android — not a web app in a shell, built from the ground up for the phone.

You type a task → YuyuCode streams a response, executes file reads/writes/patches, feeds results back into the loop, and keeps going until the task is done. It connects to a local Node.js server in Termux for full filesystem access, shell execution, WebSocket streaming, and MCP support.

→ **[Full feature documentation](https://liveiciee.github.io/yuyucode/features/)**

---

## Demo

> 📸 *Screenshots and GIF demos coming soon — drop a ⭐ to get notified*

---

## Highlights

- 🤖 **Agentic loop** — up to 10 iterations, parallel reads, serial exec, auto error recovery
- 🔍 **Visual Diff Review** — pause before any write, inspect diffs, reject with feedback
- 🐝 **Agent Swarm** — Architect → FE + BE (parallel) → QA → auto-fix, one command
- 🤖 **Background Agents** — isolated git worktrees, main branch stays clean
- ✏️ **Full mobile editor** — CodeMirror 6, Vim, AI ghost text L1+L2, TypeScript LSP, inline blame
- 🔆 **Perceptual brightness** — Weber-Fechner compensation below 25%, zero cost above
- 📷 **Camera-to-Code** — photo → vision model → code

→ **[All features](https://liveiciee.github.io/yuyucode/features/)**

---

## Getting started

Requires Android + [Termux](https://termux.dev/).

```bash
git clone https://github.com/liveiciee/yuyucode
cd yuyucode
npm install
```

Set API keys (free tier — [Cerebras](https://cloud.cerebras.ai) + [Groq](https://console.groq.com)):

```bash
# Add to ~/.bashrc
export VITE_CEREBRAS_API_KEY="your_key"
export VITE_GROQ_API_KEY="your_key"
```

Run:

```bash
node ~/yuyu-server.js &   # Session 1
npm run dev               # Session 2 — open localhost:5173
```

→ **[Full setup guide](https://liveiciee.github.io/yuyucode/guide/getting-started)**

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 5 |
| Mobile | Capacitor 8 |
| Backend | Node.js (yuyu-server.js, Termux) |
| Editor | CodeMirror 6 |
| Terminal | xterm.js |
| AI | Cerebras (default) + Groq (fallback + vision) |

---

## Known limitations

- Requires `yuyu-server.js` running in Termux at all times
- Depends on free-tier AI APIs — rate limits are real
- Tested on one device only (Oppo A77s, Snapdragon 680)
- `npm run build` takes ~1–2 min on ARM64 — signed APK via CI only

---

## Project origin

Started as a question: *can Claude Code be replicated on a phone?*

Turned out: yes, mostly. Built patch by patch, from morning past midnight, using only a phone and a Claude chat window. It's not a polished product. It's proof that the constraints were never the hardware.

---

## Acknowledgements

[CodeMirror 6](https://codemirror.net/) · [Capacitor](https://capacitorjs.com/) · [xterm.js](https://xtermjs.org/) · [Termux](https://termux.dev/) · [Cerebras](https://cloud.cerebras.ai/) · [Groq](https://groq.com/) · [Claude](https://claude.ai/) by Anthropic

---

<div align="center">
  <sub>
    <img src="public/icon.svg" width="14" alt="🌸" />
    &nbsp;built on a phone · for a phone · with love
  </sub>
</div>
