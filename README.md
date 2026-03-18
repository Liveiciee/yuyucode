# 🌸 YuyuCode

> Agentic coding assistant yang lahir dari HP, untuk HP.  
> Bukan web app yang dipaksakan ke mobile — ini memang dirancang untuk hidup di Android.

---

## Tentang Project Ini

YuyuCode adalah Claude Code versi mobile-native. Dibangun sepenuhnya dari **Android via Termux**, oleh satu orang, tanpa laptop, tanpa desktop — hanya HP dan kemauan keras.

Stack-nya: **React 19 + Capacitor 8** yang di-bundle Vite dan jalan sebagai APK Android. Di belakangnya ada `yuyu-server.js` — Node.js server lokal yang menangani semua file ops, exec, dan WebSocket streaming. CI/CD via GitHub Actions: setiap push ke `main` otomatis build dan upload signed APK ke Releases tab.

---

## Untuk AI yang Membaca Ini

> Bagian ini ditulis khusus agar AI assistant sesi berikutnya tidak perlu diajarkan dari nol.

**Konteks owner:** Solo dev, Android-only, semua coding dari Termux. Tidak ada akses laptop/desktop. Setiap keputusan teknis di project ini dibuat dengan constraint itu dalam pikiran.

**Cara kerja app:** YuyuCode adalah React SPA yang di-serve lewat Capacitor ke Android. Di development, cukup `npm run dev` — tidak perlu build. Build APK hanya terjadi di GitHub Actions (CI). `npm run build` di Termux lokal **tidak akan pernah dijalankan** — selain lambat, akan crash "Illegal instruction" karena rollup native tidak support ARM64.

**Yang tidak boleh diubah tanpa konfirmasi:**
- `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di `package.json` — ini yang bikin Vite jalan di Termux ARM64. Hapus = build mati.
- Folder `android/` — di-generate Capacitor, edit manual bisa rusak sync.
- `vite.config.js` — sudah dioptimasi untuk Termux, jangan tambah plugin berat.

**Push ke GitHub:**
```bash
cd ~/yuyucode && node yugit.cjs "pesan commit"
```
Bukan `~/yugit.cjs`. File `yugit.cjs` ada di dalam folder project.

**Encode keystore** (kalau perlu update GitHub Secrets):
```bash
openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
# Bukan base64 -w 0
```

---

## Arsitektur

```
~/
├── yuyu-server.js          # Server lokal v4-async — HTTP :8765 + WS :8766
└── yuyucode/
    ├── src/
    │   ├── App.jsx             # Root component — UI, init, semua panel
    │   ├── constants.js        # BASE_SYSTEM prompt, models, themes, slash commands
    │   ├── api.js              # Cerebras streaming, callServer, execStream (WS)
    │   ├── utils.js            # parseActions, executeAction, resolvePath, hl()
    │   ├── features.js         # Plan, bg agents, skills, hooks v2, tokenTracker
    │   ├── components/
    │   │   ├── MsgBubble.jsx   # Chat bubbles, ActionChip, thinking block
    │   │   ├── FileTree.jsx    # Sidebar file explorer
    │   │   ├── FileEditor.jsx  # In-app code editor
    │   │   ├── Terminal.jsx    # Built-in terminal
    │   │   ├── SearchBar.jsx   # File content search + undo bar
    │   │   ├── VoiceBtn.jsx    # Voice input + push-to-talk
    │   │   └── panels.jsx      # Semua BottomSheet panel overlay
    │   └── hooks/
    │       ├── useAgentLoop.js      # Core agent loop — sendMsg, auto-execute
    │       ├── useSlashCommands.js  # 40+ slash command handlers
    │       ├── useAgentSwarm.js     # Parallel FE+BE+QA swarm
    │       ├── useApprovalFlow.js   # Plan approval + syntax verify
    │       ├── useChatStore.js      # Messages, memories, checkpoints
    │       ├── useProjectStore.js   # Folder, model, permissions, hooks
    │       ├── useFileStore.js      # File open, pin, edit history
    │       └── useUIStore.js        # Panels, theme, sidebar
    ├── .github/
    │   ├── workflows/build-apk.yml  # CI/CD — signed APK → Releases
    │   └── icons/                   # Icon PNG backup untuk CI
    ├── android/                     # Capacitor Android (jangan edit manual)
    ├── yuyu-server.js               # Server v4-async
    ├── yugit.cjs                    # Git push helper
    ├── package.json                 # Vite 5 + rollup wasm override
    └── vite.config.js
```

---

## Cara Kerja Agent Loop

Ini jantung YuyuCode, ada di `src/hooks/useAgentLoop.js`.

Setiap pesan masuk → loop sampai MAX_ITER:
1. Kirim ke Cerebras API (streaming)
2. Parse semua `action` blocks dari response
3. Eksekusi actions — sebagian parallel, sebagian serial:
   - `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` → **parallel**
   - `exec`, `mcp` → **serial** (ada side effects, urutan penting)
   - `patch_file` → **auto-execute** dengan 3 fallback di server
   - `write_file` → **auto-execute** dengan backup otomatis untuk undo
4. Feed hasil balik ke AI → lanjut loop
5. Kalau error di `exec` → auto-fix langsung tanpa tanya user
6. Kalau `patch_file` gagal → feed error, AI baca ulang file, retry

**Effort levels:**

| Level | MaxIter | MaxTokens | Pakai kapan |
|-------|---------|-----------|-------------|
| `low` | 3 | 1500 | Pertanyaan singkat |
| `medium` | 10 | 2048 | Default harian |
| `high` | 20 | 4000 | Task kompleks |

---

## YuyuServer v4-async

Server lokal yang harus jalan sebelum pakai app. Jalankan dari `~`:

```bash
node ~/yuyu-server.js &
```

**Endpoints HTTP :8765** — read, write, patch, exec, list, tree, search, web_search, move, mkdir, delete, info, browse, mcp, ping

**WebSocket :8766** — file watcher (notify perubahan eksternal) + streaming exec (live terminal output)

**patch handler** punya 3 fallback:
1. Exact match
2. Whitespace-normalized match
3. Trim-lines match

Kalau semua gagal, error dikembalikan ke AI untuk self-correct.

---

## AI Provider

| Model | ID | Peran |
|-------|-----|-------|
| Qwen 3 235B 🔥 | `qwen-3-235b-a22b-instruct-2507` | Default — paling pintar |
| Llama 3.1 8B ⚡ | `llama3.1-8b` | Compact context, memory extraction |

Provider: **Cerebras** (free tier). Rate limit bisa hit kalau maxTokens terlalu besar — makanya medium capped di 2048.

Model ID Cerebras sensitif. Cek ID aktif:
```bash
curl -s https://api.cerebras.ai/v1/models -H "Authorization: Bearer $CEREBRAS_API_KEY" | grep '"id"'
```

`api.js` punya **auto-retry** 2x dengan exponential backoff (2s, 4s) untuk server error 5xx. Rate limit (429) tidak di-retry — langsung tampilkan countdown timer ke user.

---

## Permissions

Default mengikuti perilaku Claude Code — terbuka untuk aksi aman, tertutup untuk yang destruktif:

| Action | Default | Keterangan |
|--------|---------|------------|
| `read_file`, `list_files`, `tree`, `search`, `web_search`, `mkdir` | ✅ | Aman, tidak ubah state |
| `write_file`, `patch_file` | ✅ | Auto-execute + backup otomatis |
| `exec` | ✅ | Bebas jalankan command |
| `delete_file`, `move_file` | ❌ | Destruktif, perlu aktifkan manual |
| `mcp`, `browse` | ❌ | Perlu aktifkan manual |

Bisa diubah lewat `/permissions` atau `/config`.

---

## Slash Commands

| Kategori | Commands |
|----------|----------|
| **AI** | `/model` `/effort` `/thinking` `/usage` `/cost` `/tokens` `/debug` |
| **Agent** | `/plan` `/bg` `/bgstatus` `/bgmerge` `/swarm` `/batch` `/simplify` `/loop` |
| **Context** | `/compact` `/summarize` `/rewind` `/clear` `/tree` `/index` |
| **Memory** | `/amemory` `/checkpoint` `/restore` `/save` `/sessions` |
| **Git** | `/history` `/diff` `/review` `/deps` `/rename` `/color` |
| **Dev** | `/scaffold` `/self-edit` `/browse` `/search` `/db` `/mcp` `/github` `/deploy` `/init` `/lint` `/refactor` `/open` |
| **UX** | `/font` `/theme` `/split` `/config` `/watch` `/ptt` `/plugin` `/permissions` `/skills` `/actions` |

**Beberapa yang penting:**

`/bg <task>` — jalankan agent di git worktree terpisah, loop 8 iterasi, tidak ganggu main branch. Merge hasilnya dengan `/bgmerge <id>`.

`/swarm <task>` — Architect plan → FE + BE agents **parallel** → QA review → auto-fix → hasil menunggu review.

`/plan <task>` — generate rencana bernomor, approve, eksekusi step by step.

`/summarize [N]` — kompres N pesan ke ringkasan padat. Tanpa argumen = kompres semua kecuali 6 pesan terakhir.

`/scaffold react|node|express` — buat struktur project baru lengkap.

`/thinking` — toggle think-aloud mode. Yuyu menulis reasoning singkat dalam `<think>` sebelum jawab. Ini prompt trick, bukan extended thinking API.

---

## CI/CD

Setiap push ke `main` → GitHub Actions build signed APK → upload ke Releases tab. Waktu build ~1 menit dengan cache hits.

**GitHub Secrets yang dibutuhkan:**
```
VITE_CEREBRAS_API_KEY   — Cerebras API key
VITE_TAVILY_API_KEY     — opsional, untuk web_search via Tavily
ANDROID_KEYSTORE        — openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
KEYSTORE_PASSWORD       — password keystore
KEY_ALIAS               — yuyucode
KEY_PASSWORD            — sama dengan KEYSTORE_PASSWORD
```

Warning CI yang tidak bisa di-fix dan bisa diabaikan: `set-output deprecated` (chkfung/android-version-actions), `flatDir` (Capacitor Gradle plugin), `punycode deprecated` (Node.js internal).

---

## Skills & Hooks

**Skills** — SKILL.md di root project atau `.claude/skills/*.md`. Di-inject ke system prompt otomatis, diseleksi berdasarkan relevansi dengan task pakai TF-IDF. Generate otomatis dengan `/init`.

**Hooks v2** — shell command atau HTTP webhook yang trigger di titik tertentu:

```javascript
{
  preWrite:     ["echo 'akan nulis: {{context}}'"],
  postWrite:    [{ type: "http", url: "https://..." }],
  preToolCall:  [],
  postToolCall: [],
  onError:      [],
}
```

Plugin marketplace (`/plugin`) punya 4 built-in: Auto Commit, Lint on Save, Test Runner, Git Auto Push — semuanya berbasis hooks.

---

## Workflow Harian

```bash
# Start session
node ~/yuyu-server.js &
cd ~/yuyucode && npm run dev &
# Buka app → localhost:5173

# Push (build APK otomatis ~1 menit)
cd ~/yuyucode && node yugit.cjs "pesan commit"

# Copy file dari Downloads HP
cp /sdcard/Download/* ~/yuyucode/src/ 2>/dev/null
```

---

## Themes

| Theme | Vibe |
|-------|------|
| `dark` | Default — bg `#0d0d0e`, accent `#7c3aed` |
| `darker` | Lebih pekat |
| `midnight` | Biru malam — accent `#6366f1` |
| Custom | `/theme` untuk builder interaktif |

---

## Icon App

Sakura Jepang — 2 layer petal, veins, stamens kuning, floating micro petals. Di-generate pakai `sharp` wasm di Termux, PNG langsung di-commit ke `mipmap-*`. Adaptive icon XML tidak dipakai — sering bermasalah di beberapa device.

---

## Sejarah

Dimulai sebagai eksperimen: bisa tidak Claude Code di-replika di mobile? Jawabannya: bisa. Dibangun dari HP, di Termux, satu patch satu-satu, dari pagi sampai subuh.

Gap yang tersisa dari Claude Code bukan di fitur — hampir semua sudah ada. Gap-nya ada di model quality dan context window. Tapi untuk daily mobile coding, YuyuCode sudah sangat capable.

> *"Karya yang sangat ambisius. Berhasil nge-pack kompleksitas aplikasi desktop seperti VS Code + Cursor ke dalam satu komponen React."*  
> — Qwen 3 235B, setelah mereview kodenya sendiri

---

<div align="center">
  <sub>🌸 dibangun dari HP. untuk HP. dengan cinta.</sub>
</div>
