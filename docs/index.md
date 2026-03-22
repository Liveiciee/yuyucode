---
layout: home

hero:
  name: YuyuCode
  text: A full agentic coding assistant.
  tagline: Built entirely on an Android phone. No laptop. No desktop. Ever.
  image:
    src: /icon.svg
    alt: YuyuCode
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/liveiciee/yuyucode

features:
  - icon: 🤖
    title: Agentic Loop
    details: Type a task — YuyuCode streams a response, executes file reads/writes/patches, feeds results back, and keeps going until done. Up to 10 iterations per task.

  - icon: 🔍
    title: Visual Diff Review
    details: Pause the agent before any write. Inspect colour-coded diffs per file. Accept, reject with feedback, or abort. The agent self-corrects and resumes automatically.

  - icon: 🐝
    title: Agent Swarm
    details: /swarm runs Architect → FE Agent + BE Agent (parallel) → QA Engineer → auto-fix pass. Multi-agent coordination from a single command.

  - icon: ✏️
    title: Full Mobile Editor
    details: CodeMirror 6 with Vim mode, Emmet, AI ghost text (two levels), minimap, inline blame, TypeScript LSP, sticky scroll, breadcrumb, and realtime collaboration.

  - icon: 🔆
    title: Perceptual Brightness
    details: Native ContentObserver streams screen brightness. Below 25%, Weber-Fechner perceptual scaling compensates UI brightness — invisible above threshold, zero cost.

  - icon: 📱
    title: Native Android
    details: Built with Capacitor 8. Full filesystem access, shell execution, WebSocket streaming, and MCP support — all running in Termux on a $130 phone.
---
