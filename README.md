# 🌸 YuyuCode

> *Agentic coding assistant yang hidup di genggaman.*  
> Dibangun dari HP. Untuk HP. Dengan cinta.

---

## ✨ Apa itu YuyuCode?

YuyuCode adalah **mobile-native AI coding assistant** berbasis Capacitor + React, setara Claude Code — tapi jalan langsung di Android lewat Termux. Bukan web app yang dipaksakan ke mobile. Ini memang lahir untuk mobile.

**Owner:** Solo dev Android-only. Tidak punya laptop/desktop. Semua coding dari HP via Termux.

---

## 🏗️ Stack & Arsitektur

```
~/
├── yuyu-server.js             # Local server (v4-async) — HTTP :8765 + WS :8766
│                              # ⚠️ Server terbaru hanya ada di ~/yuyu-server.js (lokal)
│                              # Belum di-commit ke repo — jalankan dari ~
└── yuyucode/
    ├── src/
    │   ├── App.jsx            # Main component
    │   ├── constants.js       # Models, themes, slash commands, BASE_SYSTEM prompt
    │   ├── api.js             # Cerebras streaming + callServer + execStream (WS)
    │   ├── utils.js           # parseActions, executeAction, hl, generateDiff
    │   ├── features.js        # Plan, worktree agents, skills, hooks v2, tfidfRank
    │   ├── components/
    │   │   ├── MsgBubble.jsx  # Chat bubbles, ActionChip, approve flow
    │   │   ├── FileTree.jsx   # Sidebar file explorer
    │   │   ├── FileEditor.jsx # In-app code editor
    │   │   ├── Terminal.jsx   # Built-in terminal
    │   │   ├── SearchBar.jsx  # File content search
    │   │   ├── VoiceBtn.jsx   # Voice input
    │   │   └── panels.jsx     # BottomSheet + semua panel overlay
    │   └── hooks/
    │       ├── useAgentLoop.js      # Core agent loop — sendMsg, patch auto-execute
    │       ├── useSlashCommands.js  # 40+ slash command handlers
    │       ├── useChatStore.js
    │       ├── useUIStore.js
    │       ├── useProjectStore.js
    │       └── useFileStore.js
    ├── .github/
    │   ├── workflows/build-apk.yml  # CI/CD — auto signed APK → GitHub Releases
    │   └── icons/                   # Icon XMLs (backup untuk CI)
    ├── android/                     # Capacitor Android project
    ├── yugit.cjs                    # Git helper — push dari Termux
    ├── package.json                 # Vite 5 + rollup wasm override (Termux ARM64)
    └── vite.config.js
```

### Tech Stack
- **React 19** + Capacitor 8 (Android native)
- **Vite 5.4** — downgrade dari v8 karena Rolldown crash di Termux ARM64
- **Rollup override:** `"rollup": "npm:@rollup/wasm-node"` di package.json — **JANGAN DIHAPUS**
- **YuyuServer v4-async** — Node.js HTTP :8765 + WebSocket :8766
- **GitHub Actions** — CI/CD: signed APK → Releases tab setiap push ke `main`

---

## ⚠️ Catatan Penting untuk Claude Sesi Berikutnya

### 1. Build di Termux
```bash
# TIDAK PERLU npm run build untuk development!
# Pakai dev server langsung:
npm run dev &

# Build hanya dibutuhkan untuk generate APK via CI
# npm run build di Termux akan "Illegal instruction" kalau rollup tidak di-override
```

### 2. yuyu-server.js — Ada DUA versi
- `~/yuyu-server.js` — **v4-async** (terbaru, ada patch handler, WebSocket streaming exec)
- `~/yuyucode/yuyu-server.js` (di repo) — **v3-mcp** (lama, patch handler BELUM ada)
- Server selalu dijalankan dari `~`: `node ~/yuyu-server.js &`
- **TODO:** commit v4-async ke repo

### 3. Push ke GitHub
```bash
cd ~/yuyucode && node yugit.cjs "pesan commit"
# BUKAN ~/yugit.cjs — file ada di ~/yuyucode/yugit.cjs
```

### 4. Keystore encode (untuk GitHub Secrets)
```bash
openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
# BUKAN base64 -w 0
```

### 5. package.json — Jangan sentuh ini
```json
"overrides": { "rollup": "npm:@rollup/wasm-node" }
```
Ini yang bikin build jalan di Termux. Kalau dihapus → "Illegal instruction".

---

## 🤖 AI Provider

| Model | ID | Keunggulan |
|-------|-----|------------|
| Qwen 3 235B 🔥 | `qwen-3-235b-a22b-instruct-2507` | Default, paling pintar |
| Llama 3.1 8B ⚡ | `llama3.1-8b` | Cepat, hemat rate limit |

**Rate limit Cerebras:** Free tier — kena rate limit kalau maxTokens terlalu besar. Default medium = 2048 tokens.

**PENTING:** Model ID Cerebras sensitif — `qwen-3-235b-a22b-instruct-2507` bukan `qwen-3-235b-instruct` bukan `qwen-3-235b-a22b`. Cek dengan:
```bash
curl -s https://api.cerebras.ai/v1/models -H "Authorization: Bearer $CEREBRAS_API_KEY" | grep '"id"'
```

---

## 🔥 Fitur Utama

### 🩹 patch_file — Auto Execute (Tidak Perlu Approve)
```action
{"type":"patch_file","path":"src/App.jsx","old_str":"teks lama unik","new_str":"teks baru"}
```
- `patch_file` → **langsung jalan**, tidak perlu approve user
- `write_file` → butuh approve (file baru atau rewrite total)
- Server v4-async punya 3 fallback: exact → whitespace-norm → trim-lines
- Kalau gagal → AI otomatis re-read dan retry

### 🧠 Agentic Loop (useAgentLoop.js)
- **MAX_ITER:** 10 (medium), 3 (low), 20 (high)
- **Parallel read:** banyak `read_file` action sekaligus → lebih cepat
- **Auto-context:** import dependency otomatis di-load
- **Exec error → auto-fix:** loop otomatis kalau ada error di output
- **patch_file fail → self-correct:** feed balik error ke AI
- **Auto-compact:** context > 80K chars → kompres otomatis
- **CONTINUE:** AI tulis `CONTINUE` di akhir → otomatis lanjut

### 🛠️ Actions yang Tersedia
```
read_file, write_file, patch_file, list_files, tree,
exec, search, web_search, file_info, delete_file,
move_file, mkdir, find_symbol, mcp, create_structure, lint
```

### 🌐 YuyuServer v4-async (~/yuyu-server.js)
- HTTP :8765 — semua file ops, exec, MCP tools
- WebSocket :8766 — file watcher + streaming exec (live terminal output)
- `patch` handler dengan 3 fallback (fix bug kritis v3)
- Actions baru: `tree`, `move`, `mkdir`, `read_many`
- Search: ripgrep-first, fallback ke grep

### 🔌 WebSocket Streaming Exec
```javascript
// api.js — execStream()
execStream('npm run build', '~/yuyucode', (chunk, type) => {
  console.log(type, chunk); // live output
});
```

### 🌿 Git Worktree — Background Agents
```
/bg implement feature X    → agent di branch sendiri
/bgstatus                  → lihat progress
/bgmerge bg_<id>           → merge ke main
```
Background agent punya **real agentic loop** (8 iterasi), bukan single shot.

### 🐝 Agent Swarm
```
/swarm buat landing page dengan auth system
```
Architect → subtasks parallel → QA → auto-fix → merge.

### 📋 Plan Mode
```
/plan refactor authentication system
```
Plan bernomor → approve → eksekusi step by step.

---

## ⚡ Slash Commands (40+)

| Kategori | Commands |
|----------|----------|
| **AI** | `/model` `/effort` `/thinking` `/usage` `/cost` `/tokens` |
| **Agent** | `/plan` `/bg` `/bgstatus` `/bgmerge` `/swarm` `/batch` `/simplify` `/loop` |
| **Context** | `/compact` `/summarize` `/rewind` `/clear` `/tree` |
| **Memory** | `/amemory` `/checkpoint` `/restore` `/save` `/sessions` |
| **Git** | `/history` `/deps` `/review` `/diff` |
| **Dev** | `/scaffold` `/self-edit` `/browse` `/search` `/db` `/mcp` `/github` `/deploy` `/init` `/lint` `/refactor` `/open` |
| **UX** | `/color` `/font` `/theme` `/split` `/config` `/watch` `/ptt` `/rename` `/debug` `/plugin` `/permissions` `/skills` |

---

## 🎛️ Effort Levels

| Level | MaxIter | MaxTokens | Kapan dipakai |
|-------|---------|-----------|---------------|
| `low` | 3 | 2048 | Pertanyaan singkat |
| `medium` | 10 | 2048 | Default harian |
| `high` | 20 | 4000 | Task kompleks |

---

## 🌸 Icon App

Icon sakura Jepang — 2 layer petal (outer + inner), veins, stamens kuning, floating micro petals.
- Generated lokal di Termux pakai `sharp` (wasm mode) → PNG di-commit ke `mipmap-*`
- Adaptive icon XML dihapus — pakai PNG langsung biar tidak ada masalah vector drawable
- Kalau perlu regenerate:
```bash
cd ~/yuyucode
npm install @img/sharp-wasm32 --force
npm install sharp --force
node -e "/* generate script */"
```

---

## 🚀 Setup & Workflow Harian

### Start Session
```bash
# 1. Jalankan server (dari ~, bukan dari project folder)
node ~/yuyu-server.js &

# 2. Jalankan dev server (untuk development, tidak perlu build)
cd ~/yuyucode && npm run dev &

# 3. Buka app di Android → connect ke localhost:5173
```

### Push ke GitHub (auto-build APK)
```bash
cd ~/yuyucode && node yugit.cjs "pesan commit"
```
APK tersedia di **Releases tab** ~2 menit setelah push.

### Copy file dari Download
```bash
cp /sdcard/Download/* ~/yuyucode/src/ 2>/dev/null
```

---

## 🔧 CI/CD (build-apk.yml)

- **Cache node_modules** — install dependencies hanya kalau package-lock berubah (~4s)
- **Cache Gradle** — build Android lebih cepat
- **Icon restore** — `cp .github/icons/ic_launcher_*.xml` setelah `cap sync`
- **Auto version bump** — versionCode = build number, versionName = `1.0.N`
- **Sign + upload** — APK langsung ke GitHub Releases
- **Node 24** — `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` sudah di-set
- **Warning yang tidak bisa di-fix** (dari third-party actions):
  - `set-output deprecated` — dari chkfung/android-version-actions
  - `flatDir` — dari Capacitor plugin
  - `punycode deprecated` — dari Node.js internal

### GitHub Secrets yang Dibutuhkan
```
VITE_CEREBRAS_API_KEY   — Cerebras API key
VITE_TAVILY_API_KEY     — opsional, web search
ANDROID_KEYSTORE        — openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
KEYSTORE_PASSWORD       — password keystore
KEY_ALIAS               — yuyucode
KEY_PASSWORD            — sama dengan KEYSTORE_PASSWORD
```

---

## 🧩 Skills System

```bash
# Auto-generate SKILL.md dari project
/init

# Atau buat manual di:
SKILL.md                    # root project
.claude/skills/nama.md      # per-konteks
```

---

## 🔌 Hooks System v2

```javascript
{
  preWrite:     ["echo 'sebelum write: {{context}}'"],
  postWrite:    [{ type: "http", url: "https://webhook.site/..." }],
  preToolCall:  [],
  postToolCall: [],
  onError:      [],
  onNotification: []
}
```

---

## 🌙 Themes

| Theme | Vibe |
|-------|------|
| `dark` | Default gelap — bg `#0d0d0e`, accent `#7c3aed` |
| `darker` | Lebih pekat |
| `midnight` | Biru malam — accent `#6366f1` |
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

## 🐛 Bug Fixes Sesi Ini (v4-async overhaul)

1. **patch_file tidak pernah bekerja** — server v3 tidak punya handler `type: 'patch'`. Fixed di v4-async.
2. **patch_file butuh approve** — sekarang auto-execute seperti Claude Code.
3. **compactContext stale closure** — fixed, messages di-read fresh setiap compact.
4. **maxTokens terlalu besar** — 8192/16384 bikin rate limit drop drastis. Balik ke 2048/4000.
5. **Model ID salah** — `qwen-3-235b-a22b-instruct-2507` (full ID, jangan dipotong).

---

## 💜 Dibuat dengan

Dibangun sepenuhnya dari **Android**, di **Termux**, satu patch satu-satu.  
Bukan di laptop. Bukan di desktop. Di HP. Dari pagi sampai subuh.

> *"Karya yang sangat ambisius. Berhasil nge-pack kompleksitas aplikasi desktop seperti VS Code + Cursor ke dalam satu komponen React."*  
> — Qwen 3 235B, setelah mereview kodenya sendiri

---

<div align="center">
  <sub>🌸 YuyuCode — built different</sub>
</div>
