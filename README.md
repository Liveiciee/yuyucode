# 🌸 YuyuCode

> *Agentic coding assistant yang hidup di genggaman.*  
> Dibangun dari HP. Untuk HP. Dengan cinta.

---

## ✨ Apa itu YuyuCode?

YuyuCode adalah **mobile-native AI coding assistant** berbasis Capacitor + React, setara Claude Code — tapi jalan langsung di Android. Bukan web app yang dipaksakan ke mobile. Ini memang lahir untuk mobile.

---

## 🔥 Fitur Utama

### 🤖 AI Provider
| Provider | Model | Keunggulan |
|----------|-------|------------|
| Cerebras | Qwen 3 235B, Llama 3.3 70B, Llama 3.1 8B | Gratis, super cepat |

### 🧠 Agentic Loop
- **10 iterasi otomatis** — AI baca file, analisis, tulis, tanpa perlu disuruh
- **Parallel read** — baca banyak file sekaligus
- **Auto-context** — import dependency otomatis di-load ke context
- **Self-optimization** — retry otomatis kalau ada error
- **Auto-compact** — context otomatis dikompres sebelum overflow

### 🌐 Web Search (built-in)
AI bisa search internet langsung dari agentic loop:
```action
{"type":"web_search","query":"react 19 new features"}
```
Atau manual: `/search <query>`

### 🌿 Git Worktree Isolation
Background agent dapat **branch sendiri** via `git worktree`:
```
/bg implement feature X
/bgstatus
/bgmerge bg_<id>
```

### 🐝 Agent Swarm (Parallel)
```
/swarm buat landing page dengan auth system
```
Architect → Frontend + Backend (parallel) → QA → merge.

### 📋 Plan Mode
```
/plan refactor authentication system
```
AI buat rencana bernomor → approve → eksekusi step by step.

---

## ⚡ Slash Commands (37+)

| Kategori | Commands |
|----------|----------|
| **AI** | `/model` `/effort` `/thinking` `/usage` `/cost` |
| **Agent** | `/plan` `/bg` `/bgstatus` `/bgmerge` `/swarm` `/batch` `/simplify` |
| **Context** | `/compact` `/summarize` `/rewind` `/tokens` |
| **Memory** | `/amemory` `/checkpoint` `/restore` `/save` `/sessions` |
| **Git** | `/history` `/deps` `/review` |
| **Dev** | `/scaffold` `/self-edit` `/browse` `/search` `/db` `/mcp` `/github` `/deploy` `/init` |
| **UX** | `/color` `/font` `/theme` `/split` `/config` `/watch` `/loop` `/ptt` |
| **Info** | `/status` `/debug` `/skills` `/permissions` `/plugin` `/index` |

### Baru di versi ini
- **`/init`** — auto-generate SKILL.md dari analisis project
- **`/search <query>`** — web search langsung dari chat

---

## 🎛️ Panel & UI

- **Command Palette** `⌘` — search semua action
- **Config Panel** `/config` — effort, font, theme, model, thinking, file watcher
- **Permissions Panel** `/permissions` — toggle tiap tool on/off
- **Sessions Panel** `/sessions` — save & restore sesi
- **Plugin Marketplace** `/plugin` — auto commit, lint on save, dll
- **Agent Memory** `/amemory` — user / project / local scope
- **Session Color Bar** `/color` — visual marker per sesi
- **File Watcher** `/watch` — notify kalau ada file berubah dari luar (30 detik polling)

---

## 🏗️ Arsitektur

```
src/
├── App.jsx                    # Main component (~1200 baris)
├── constants.js               # Models, themes, slash commands, BASE_SYSTEM
├── api.js                     # Cerebras streaming + callServer
├── utils.js                   # countTokens, hl, resolvePath, parseActions, executeAction
├── features.js                # Plan mode, worktree agents, skills, hooks v2,
│                              # token tracker, session manager, rewind
├── components/
│   ├── MsgBubble.jsx          # Chat messages, ActionChip, ThinkingBlock
│   ├── FileTree.jsx           # Sidebar file explorer
│   ├── FileEditor.jsx         # In-app code editor
│   ├── Terminal.jsx           # Built-in terminal
│   ├── SearchBar.jsx          # File content search
│   ├── VoiceBtn.jsx           # Voice input
│   └── panels.jsx             # All overlay panels (GitDiff, Snippets, dll)
└── hooks/
    └── useSlashCommands.js    # All 37+ slash command handlers
```

### Stack
- **React 19** + Capacitor 8 (Android native)
- **Vite** build system
- **YuyuServer** — local Node.js server di Termux untuk filesystem + git ops
- **GitHub Actions** — CI/CD otomatis build APK

---

## 🚀 Setup

### Prerequisites
- Android HP dengan **Termux**
- Node.js di Termux

### Install
```bash
git clone https://github.com/Liveiciee/yuyucode
cd yuyucode
npm install

# Jalankan YuyuServer di Termux
node ~/yuyu-server.js &

# Build & install via GitHub Actions
git add -A && git commit -m "update" && git push
```

### Environment Variables
```env
VITE_CEREBRAS_API_KEY=your_key_here
VITE_TAVILY_API_KEY=your_key_here  # opsional, untuk web search
```

---

## 🧩 Skills System

Buat file `.claude/skills/nama.md` di folder project untuk instruksi spesifik per konteks. Atau gunakan `/init` untuk auto-generate SKILL.md dari project yang sudah ada.

---

## 🔌 Hooks System v2

```javascript
{
  preWrite:    ["echo 'sebelum write: {{context}}'"],
  postWrite:   [{ type: "http", url: "https://webhook.site/..." }],
  preToolCall: [],
  postToolCall:[],
  onError:     [],
  onNotification: []
}
```

---

## 📊 Token Tracking (Real)

```
/usage
📊 Token Usage
Input:    ~1240tk
Output:   ~3820tk
Total:    ~5060tk
Requests: 12 (~420tk/req)
Durasi:   34 menit
Cerebras: gratis 🎉

5 request terakhir:
  1. in:820 out:340tk (Qwen 3 235B)
  2. in:1100 out:580tk (Qwen 3 235B)
  ...
```

---

## 🌙 Themes

| Theme | Vibe |
|-------|------|
| `dark` | Default gelap |
| `darker` | Lebih pekat |
| `midnight` | Biru malam |
| Custom | `/theme` builder |

---

## 💜 Dibuat dengan

Dibangun sepenuhnya dari **Oppo Android**, di **Termux**, satu patch script satu-satu.
Bukan di laptop. Bukan di desktop. Di HP. Dari pagi sampai malam.

> *"Karya yang sangat ambisius. Berhasil nge-pack kompleksitas aplikasi desktop seperti VS Code + Cursor ke dalam satu komponen React."*  
> — Qwen 3 235B, setelah mereview kodenya sendiri

---

<div align="center">
  <sub>🌸 YuyuCode — built different</sub>
</div>
