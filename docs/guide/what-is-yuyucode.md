# What is YuyuCode?

YuyuCode is a Claude Code / Cursor-style agentic coding assistant that runs natively on Android. Not a web app ported to mobile — designed from the ground up for a phone.

It connects to a local Node.js server running in Termux, giving it full filesystem access, shell execution, WebSocket streaming, and MCP support. Everything a desktop IDE has, in your pocket.

## The one-sentence version

You type a task → YuyuCode streams a response, automatically executes file reads/writes/patches, feeds results back into the loop, and keeps going until the task is done.

## Why it exists

Started as a question: *can Claude Code be replicated on a phone?*

Turned out: yes, mostly. Built patch by patch, from morning past midnight, using only a phone and a Claude chat window. The remaining gap between YuyuCode and a desktop agent is model quality and context window size — not features.

It is not a polished product. It is proof that the constraints were never the hardware.

## What makes it different

Most "mobile coding" tools are either thin wrappers around a web editor or remote desktop clients. YuyuCode is neither.

- **The agent loop runs on the device.** No cloud intermediary between your code and the AI.
- **The filesystem is local.** Reads, writes, and patches happen directly in Termux — no sync, no upload.
- **The editor is full-featured.** CodeMirror 6 with Vim mode, AI ghost text, minimap, inline blame, TypeScript LSP, and realtime collaboration — on a touchscreen.
- **Background agents run in isolated git worktrees.** Your main branch stays clean while the agent works.

## What it is not

- Not production software. Tested on one device (Oppo A77s, Snapdragon 680, Android 14).
- Not a cloud service. No accounts, no subscriptions, no data leaving your phone except API calls.
- Not for everyone. Requires Termux, Node.js, and comfort with a terminal.

## Ready to try it?

→ [Getting Started](/guide/getting-started)
