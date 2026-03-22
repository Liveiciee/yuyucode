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
    details: Type a task. YuyuCode reads context, streams a plan, executes file reads/writes/patches, recovers from errors, and loops — up to 10 iterations — until the task is done.

  - icon: 🔍
    title: Visual Diff Review
    details: Pause the agent before any write. Inspect colour-coded diffs per file. Accept or reject with feedback. Atomic rollback on failure. The agent self-corrects and resumes.

  - icon: 🐝
    title: Agent Swarm
    details: /swarm — Architect plans, FE and BE agents build in parallel, QA reviews, auto-fix pass runs. Multi-agent coordination from a single command.

  - icon: ✏️
    title: Full Mobile Editor
    details: CodeMirror 6 with Vim mode, two-level AI ghost text, TypeScript LSP, inline blame, minimap, sticky scroll, realtime collaboration — built for a touchscreen.

  - icon: 🔆
    title: Perceptual Brightness
    details: Weber-Fechner logarithmic compensation below 25% screen brightness. Accounts for the warm-orange shift CSS filters introduce. Zero processing above threshold.

  - icon: 📱
    title: Native Android
    details: Capacitor 8 on Termux. Full filesystem access, shell execution, WebSocket streaming, MCP support. Everything a desktop IDE has, on a $130 phone from 2022.
---

<div style="max-width: 800px; margin: 0 auto; padding: 48px 24px; text-align: center;">

## The origin

Started as a single question: *can Claude Code be replicated on a phone?*

The answer was yes. Built patch by patch — from morning to past midnight — using only an Oppo A77s and a Claude chat window. Every architectural decision, every tricky bug, every refactor in this codebase was worked through at claude.ai.

The agent loop, visual diff review, background agents, multi-tab editor, perceptual brightness compensation — all of it runs on a Snapdragon 680 at 1031 tests passing, SonarCloud Security A, 70% coverage.

**It's not a polished product. It's proof that the constraints were never the hardware.**

</div>
