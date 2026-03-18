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
| Cerebras | Qwen 3 235B 🔥 | Default, paling pintar |
| Cerebras | Llama 3.1 8B ⚡ | Cepat, ringan |

> Llama 3.3 70B dihapus — tidak tersedia di akun Cerebras free tier.

### 🩹 Surgical Edits (`patch_file`)
AI tidak perlu tulis ulang file penuh. Cukup `old_str` + `new_str`:
```action
{"type":"patch_file","path":"src/App.jsx","old_str":"...teks lama unik...","new_str":"...teks baru..."}
```
Hemat token drastis dibanding `write_file` untuk perubahan kecil.

### 🧠 Agentic Loop
- **10 iterasi otomatis** — AI baca file, analisis, tulis, tanpa perlu disuruh
- **Parallel read** — baca banyak file sekaligus
- **Auto-context** — import dependency otomatis di-load ke context
- **Self-optimization** — retry otomatis kalau ada error
- **Auto-compact** — context otomatis dikompres sebelum overflow

### 🔌 WebSocket File Watcher (Real-time)
Tidak lagi polling 30 detik. Server sekarang pakai `fs.watch` + WebSocket di port 8766:
```
/watch  →  notify real-time + diff preview kalau ada file berubah dari luar app
```

### 🌐 Web Search (built-in)
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

### 🐝 Agent Swarm (Parallel + QA Fix Loop)
```
/swarm buat landing page dengan auth system
```
Architect → Frontend + Backend (full context, parallel) → QA → **auto-fix kalau ada bug** → merge.

### 📋 Plan Mode
```
/plan refactor authentication system
```
AI buat rencana bernomor → approve → eksekusi step by step.

---

## ⚡ Slash Commands (40+)

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

### Notable:
- **`/review src/file.js`** — review file langsung tanpa harus buka dulu
- **`/batch <instruksi>`** — AI proses semua file di `src/`, kumpulkan dulu, approve sebelum tulis
- **`/deps`** — dep graph rekursif 2 level dengan d3 force layout
- **`/db`** — auto-discover `*.db` files, tidak hardcode `data.db`

---

## 🎛️ Panel & UI (Mobile-First)

Semua panel sekarang **bottom sheet** — slide up dari bawah, swipe down untuk tutup. Tidak ada lagi overlay full-screen mendadak.

- **Command Palette** `⌘` — search semua action
- **Config Panel** `/config` — effort, font, theme, model, thinking
- **Permissions Panel** `/permissions` — toggle tiap tool on/off
- **Sessions Panel** `/sessions` — save & restore sesi
- **Plugin Marketplace** `/plugin` — auto commit, lint on save, dll
- **Agent Memory** `/amemory` — user / project / local scope
- **Session Color Bar** `/color` — visual marker per sesi
- **File Watcher** `/watch` — real-time via WebSocket, diff preview

### UI Improvements
- Header 2 baris: nama project + status bar (model, branch, token, effort)
- Tab bar 48px, quick bar 44px — jempol-friendly
- Approve button `✓ Apply` min 44px touch target
- `copy` dan `retry` selalu visible (tidak pakai hover)
- Terminal: tombol `↑` `↓` history + `▶ Run` visible di atas keyboard
- FileEditor: toolbar sticky, `autoCapitalize` off

---

## 🏗️ Arsitektur

```
~/
├── yuyu-server.js             # Local server (v4-async) — HTTP :8765 + WS :8766
└── yuyucode/
    └── src/
        ├── App.jsx            # Main component (~1300 baris)
        ├── constants.js       # Models, themes, slash commands, BASE_SYSTEM
        ├── api.js             # Cerebras streaming + callServer
        ├── utils.js           # countTokens, hl, parseActions, executeAction (patch_file)
        ├── features.js        # Plan, worktree agents, skills, hooks v2, tfidfRank
        ├── components/
        │   ├── MsgBubble.jsx  # Chat bubbles, ActionChip, approve flow (write+patch)
        │   ├── FileTree.jsx   # Sidebar file explorer
        │   ├── FileEditor.jsx # In-app code editor (sticky toolbar)
        │   ├── Terminal.jsx   # Built-in terminal (↑↓ history buttons)
        │   ├── SearchBar.jsx  # File content search
        │   ├── VoiceBtn.jsx   # Voice input
        │   └── panels.jsx     # BottomSheet + semua panel overlay
        └── hooks/
            ├── useSlashCommands.js  # 40+ slash command handlers
            ├── useChatStore.js
            ├── useUIStore.js
            ├── useProjectStore.js
            └── useFileStore.js
```

### Stack
- **React 19** + Capacitor 8 (Android native)
- **Vite 8** build system
- **YuyuServer v4-async** — Node.js async server di Termux, HTTP + WebSocket
- **GitHub Actions** — CI/CD otomatis: signed release APK → GitHub Releases

---

## 🚀 Setup

### Prerequisites
- Android HP dengan **Termux**
- Node.js di Termux (`pkg install nodejs`)

### Install
```bash
git clone https://github.com/Liveiciee/yuyucode
cd yuyucode
npm install

# Jalankan YuyuServer di Termux (dari ~, bukan dari folder project)
node ~/yuyu-server.js &
```

### Push ke GitHub (auto-build APK)
```bash
cd ~/yuyucode && node yugit.cjs "pesan commit"
```

APK otomatis tersedia di **Releases tab** setiap push ke `main`.

### Environment Variables (GitHub Secrets)
```
VITE_CEREBRAS_API_KEY   — Cerebras API key
VITE_TAVILY_API_KEY     — opsional, untuk web search
ANDROID_KEYSTORE        — base64 dari keystore (openssl base64 < key.jks | tr -d '\n')
KEYSTORE_PASSWORD       — password keystore
KEY_ALIAS               — alias (default: yuyucode)
KEY_PASSWORD            — sama dengan KEYSTORE_PASSWORD
```

### Regenerate Keystore (kalau hilang)
```bash
keytool -genkey -v -keystore ~/yuyucode-jks.jks \
  -alias yuyucode -keyalg RSA -keysize 2048 -validity 10000 \
  -deststoretype JKS

openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
# → paste ke GitHub Secret ANDROID_KEYSTORE
```

---

## 🧩 Skills System

Buat file `SKILL.md` di root project atau `.claude/skills/nama.md` untuk instruksi spesifik per konteks. Atau auto-generate:
```
/init
```

---

## 🔌 Hooks System v2

```javascript
{
  preWrite:     ["echo 'sebelum write: {{context}}'"],
  postWrite:    [{ type: "http", url: "https://webhook.site/..." }],
  preToolCall:  [],  // dipanggil sebelum setiap action
  postToolCall: [],  // dipanggil setelah setiap action
  onError:      [],  // dipanggil kalau ada error di agent loop
  onNotification: []
}
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

## 📊 Token Tracking

```
/usage
📊 Token Usage
Input:    ~1240tk
Output:   ~3820tk
Requests: 12 (~420tk/req)
Cerebras: gratis 🎉
```

---

## 💜 Dibuat dengan

Dibangun sepenuhnya dari **Android**, di **Termux**, satu patch satu-satu.  
Bukan di laptop. Bukan di desktop. Di HP. Dari pagi sampai malam.

> *"Karya yang sangat ambisius. Berhasil nge-pack kompleksitas aplikasi desktop seperti VS Code + Cursor ke dalam satu komponen React."*  
> — Qwen 3 235B, setelah mereview kodenya sendiri

---

<div align="center">
  <sub>🌸 YuyuCode — built different</sub>
</div>
