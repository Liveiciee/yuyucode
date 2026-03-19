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

**CI/CD — Release strategy:**
- Setiap push ke `main` → CI tetap build + lint + test
- GitHub Release + APK **hanya dibuat** kalau commit message diawali `release:`
- Contoh: `node yugit.cjs "release: v1.3 — fitur X dan fix Y"`
- Commit biasa (feat/fix/chore/docs) → build jalan tapi tidak bikin release baru
- Empty commit untuk trigger release: `git commit --allow-empty -m "release: ..." && git push`

**Encode keystore** (kalau perlu update GitHub Secrets):
```bash
openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
# Bukan base64 -w 0
```

**Hal yang sudah diketahui (jangan diulang):**
- `vitest@4` crash silent di Termux ARM64 → pakai `vitest@1`
- `global.TextDecoder` override di test file → infinite recursion, jangan override, Node 24 sudah punya native
- Cerebras tidak support vision → auto-fallback ke Llama 4 Scout (Groq)
- `readSSEStream` harus di-export dari `api.js` supaya bisa di-test
- Skills disimpan di `.claude/skills/` — kelola via `/skills` panel, tidak ada SKILL.md root
- Hapus releases lama via GitHub web atau `gh release delete` — jaga maks 5 terbaru
- **Regex literal di JSX tidak boleh mengandung newline fisik** — pakai `\n` escape. Contoh: `/\n(?=```|\*\*|##)/` bukan regex multiline literal. Vite/esbuild akan error "Unterminated regular expression".
- `hl()` di `utils.js` pakai pattern `protect()` untuk melindungi `<span>` yang sudah digenerate dari regex pass berikutnya — jangan hilangkan pattern ini
- `Date.now()` di dalam render JSX → error `react-hooks/purity`. Solusi: pindah ke komponen terpisah dengan `useState(() => Date.now())` + `setInterval`
- `\"` di dalam single-quoted string JS adalah useless escape → pakai `"` biasa
- `\x00` dilarang di regex ESLint → pakai Unicode Private Use Area (`\uE000`) sebagai placeholder

---

## Arsitektur

```
~/
├── yuyu-server.js          # Server lokal v4-async — HTTP :8765 + WS :8766
└── yuyucode/
    ├── src/
    │   ├── App.jsx             # Root component — UI, init, semua panel
    │   ├── constants.js        # BASE_SYSTEM prompt, models, themes, slash commands, limits
    │   ├── api.js              # Cerebras+Groq streaming, callServer, execStream (WS)
    │   ├── utils.js            # parseActions, executeAction, resolvePath, hl(), generateDiff
    │   ├── features.js         # Plan, bg agents, skills, hooks v2, tokenTracker, sessions,
    │   │                       # permissions, elicitation, tfidfRank
    │   ├── theme.js            # (legacy) theme resolver
    │   ├── components/
    │   │   ├── MsgBubble.jsx   # Chat bubbles, ActionChip, ThinkingBlock, surgical editor
    │   │   ├── FileTree.jsx    # Sidebar file explorer dengan context menu
    │   │   ├── FileEditor.jsx  # In-app code editor
    │   │   ├── Terminal.jsx    # Built-in terminal — live streaming via WebSocket
    │   │   ├── SearchBar.jsx   # File content search + undo bar
    │   │   ├── ThemeEffects.jsx # Visual overlays (orbs, scanlines, aurora, grain)
    │   │   ├── VoiceBtn.jsx    # Voice input + push-to-talk + partial results
    │   │   └── panels.jsx      # Semua BottomSheet panel (21 panel)
    │   ├── hooks/
    │   │   ├── useAgentLoop.js      # Core agent loop — sendMsg, gatherContext, auto-execute
    │   │   ├── useSlashCommands.js  # 56+ slash command handlers
    │   │   ├── useAgentSwarm.js     # Architect → FE+BE parallel → QA → auto-fix
    │   │   ├── useApprovalFlow.js   # Plan approval + syntax verify
    │   │   ├── useChatStore.js      # Messages, memories, checkpoints, plan, swarm state
    │   │   ├── useProjectStore.js   # Folder, model, effort, permissions, hooks, skills
    │   │   ├── useFileStore.js      # File open, pin, edit history, split view
    │   │   ├── useUIStore.js        # Panels, theme, sidebar, modals
    │   │   ├── useMediaHandlers.js  # Camera capture, gallery pick, drag & drop image/file
    │   │   ├── useDevTools.js       # GitHub, deploy, commit msg gen, tests, browse, shortcuts
    │   │   └── useNotifications.js  # Push notification, haptic feedback, TTS (id-ID)
    │   ├── themes/
    │   │   ├── index.js        # Theme registry — import & export THEMES_MAP
    │   │   ├── obsidian.js     # Obsidian Warm (default)
    │   │   ├── aurora.js       # Aurora Glass
    │   │   ├── ink.js          # Ink & Paper
    │   │   ├── neon.js         # Neon Terminal
    │   │   └── mybrand.js      # Template untuk custom theme baru
    │   └── tests/
    │       ├── api.test.js                # Unit — readSSEStream
    │       ├── utils.test.js              # Unit — countTokens, getFileIcon, hl, resolvePath, parseActions
    │       ├── utils.integration.test.js  # Integration + Fuzz — parseActions→executeAction, generateDiff
    │       ├── utils.snapshot.test.js     # Snapshot — hl() output per bahasa
    │       └── features.test.js           # Unit — parsePlanSteps, selectSkills, checkPermission, dll
    ├── .github/
    │   ├── workflows/build-apk.yml  # CI/CD — signed APK → Releases
    │   └── icons/                   # Icon backup (di-restore setelah cap sync)
    ├── android/                     # Capacitor Android (jangan edit manual)
    ├── yuyu-server.js               # Server v4-async
    ├── yugit.cjs                    # Git push helper
    ├── eslint.config.js             # ESLint flat config
    ├── package.json                 # Vite 5 + rollup wasm override
    └── vite.config.js
```

---

## Cara Kerja Agent Loop

Ada di `src/hooks/useAgentLoop.js`. Setiap pesan masuk → loop sampai MAX_ITER:

1. **Auto-compact** — kalau context > 80.000 chars dan pesan > 12, kompres otomatis
2. **gatherProjectContext** — sebelum iter 1, baca tree + file kunci project secara paralel
3. Kirim ke AI API (streaming)
4. Parse semua `action` blocks dari response
5. Eksekusi actions:
   - `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` → **parallel**
   - `exec`, `mcp` → **serial** (side effects, urutan penting)
   - `patch_file` → **auto-execute** dengan 3 fallback di server
   - `write_file` → **auto-execute** + backup otomatis untuk undo
6. Feed hasil balik ke AI → lanjut loop
7. Error di `exec` → auto-fix langsung
8. `patch_file` gagal → feed error, AI retry

**Effort levels:**

| Level | MaxIter | MaxTokens | Pakai kapan |
|-------|---------|-----------|-------------|
| `low` | 3 | 1500 | Pertanyaan singkat |
| `medium` | 10 | 2048 | Default harian |
| `high` | 20 | 4000 | Task kompleks |

**Context limits (constants.js):**

| Konstanta | Nilai | Keterangan |
|-----------|-------|------------|
| `AUTO_COMPACT_CHARS` | 80.000 | Trigger auto-compact |
| `AUTO_COMPACT_MIN_MSG` | 12 | Min pesan sebelum compact |
| `MAX_FILE_PREVIEW` | 2.000 | Chars file aktif di context |
| `MAX_SKILL_PREVIEW` | 6.000 | Max chars per skill |
| `CONTEXT_RECENT_KEEP` | 6 | Pesan tersimpan setelah compact |

---

## Fitur Utama

### 📸 Camera-to-Code
Capture foto langsung dari kamera native Android via Capacitor Camera API, atau pick dari galeri. Hasil langsung jadi visionImage yang di-route ke Llama 4 Scout (Groq) untuk analisis. Handle via `useMediaHandlers.js`.

### 📍 Checkpoint + FS Snapshot
`/checkpoint` menyimpan state chat + git diff snapshot (patch) dari file yang berubah. `/restore` bisa reapply patch untuk rollback file state. Disimpan di Capacitor Preferences, maks 10 checkpoint.

### ✂️ Surgical Context Editor
Di setiap message bubble, ada mode "surgical" untuk menghapus bagian tertentu dari context AI tanpa hapus seluruh pesan. Tiap section (code block, exec result, teks) bisa di-tap untuk di-mark remove, lalu simpan — AI tidak akan "lihat" bagian itu di next turn.

### 🤖 Bg Agent Live Panel
Background agents berjalan di git worktree terpisah dengan live progress tracking via `BgAgentPanel`. Bisa abort kapan saja, merge hasilnya ke main branch setelah selesai. Konflik merge ditangani via `MergeConflictPanel`.

### 🐝 Agent Swarm
`/swarm <task>` menjalankan pipeline multi-agent: **Architect** buat rencana → **FE Agent + BE Agent** jalan paralel → **QA Engineer** review dan list bugs → **auto-fix pass** kalau ada bug. Semua log live di `BgAgentPanel`.

### 🧠 TF-IDF Memory Ranking
Memories di-rank pakai TF-IDF + age decay sebelum di-inject ke system prompt. Makin relevan dengan task sekarang dan makin baru → makin diprioritaskan. Logic ada di `tfidfRank()` di `features.js`.

### 📊 Token Tracker
`tokenTracker` (singleton di `features.js`) merekam input/output tokens per request, track model yang dipakai, dan bisa summary via `/usage` atau `/cost`. History 100 request terakhir.

### 🔊 TTS & Haptic
`useNotifications.js` menyediakan TTS bahasa Indonesia (`id-ID`, prefer female voice), haptic feedback (light/medium/heavy), dan push notification native.

### 🎨 Theme System
4 built-in themes + custom builder. Setiap theme punya token lengkap: warna, efek visual (orbs, scanlines, aurora, grain), dan CSS animations. Tambah theme baru dengan copy `src/themes/mybrand.js`, isi token, import di `src/themes/index.js`.

---

## AI Provider

### Cerebras (default)
| Model | ID |
|-------|-----|
| Qwen 3 235B 🔥 | `qwen-3-235b-a22b-instruct-2507` |
| Llama 3.1 8B ⚡ | `llama3.1-8b` |

### Groq (fallback + vision)
| Model | ID | Keterangan |
|-------|-----|------------|
| Kimi K2 🌙 | `moonshotai/kimi-k2-instruct-0905` | Context 262K — fallback utama |
| Llama 3.3 70B 🦙 | `llama-3.3-70b-versatile` | Serbaguna |
| Llama 4 Scout 👁 | `meta-llama/llama-4-scout-17b-16e-instruct` | **Vision** — auto-route kalau ada gambar |
| Qwen 3 32B 🐼 | `qwen/qwen3-32b` | Coding |
| Llama 8B Fast ⚡ | `llama-3.1-8b-instant` | Hemat rate limit |

**Auto-fallback:** Cerebras rate limit (429) → otomatis switch ke Kimi K2 (Groq) tanpa user tahu.  
**Vision:** Cerebras tidak support image → auto-route ke Llama 4 Scout.  
**Retry:** Server error 5xx → retry 2x dengan backoff 2s/4s.

Cek model Cerebras aktif:
```bash
curl -s https://api.cerebras.ai/v1/models -H "Authorization: Bearer $CEREBRAS_API_KEY" | grep '"id"'
```

---

## YuyuServer v4-async

```bash
node ~/yuyu-server.js &  # jalankan dari ~, bukan dari project folder
```

**HTTP :8765** — `ping`, `read`, `read_many`, `write`, `append`, `patch`, `delete`, `move`, `mkdir`, `list`, `tree`, `info`, `search`, `web_search`, `exec`, `browse`, `fetch_json`, `sqlite`, `mcp`, `mcp_list`

**WebSocket :8766** — `watch` (file watcher), `exec_stream` (live terminal output), `kill` (abort process)

**patch handler** punya 3 fallback: exact → whitespace-normalized → trim-lines. Kalau semua gagal, error balik ke AI untuk self-correct.

---

## Permissions

Default mengikuti Claude Code — terbuka untuk aksi aman:

| Action | Default | Keterangan |
|--------|---------|------------|
| `read_file`, `list_files`, `tree`, `search`, `web_search`, `mkdir` | ✅ | Safe |
| `write_file`, `patch_file` | ✅ | Auto-execute + backup |
| `exec` | ✅ | Bebas run command |
| `delete_file`, `move_file` | ❌ | Destruktif |
| `mcp`, `browse` | ❌ | Manual enable |

Ubah lewat `/permissions` atau `/config`.

---

## Slash Commands

| Kategori | Commands |
|----------|----------|
| **AI** | `/model` `/effort` `/thinking` `/usage` `/cost` `/tokens` `/debug` |
| **Agent** | `/plan` `/bg` `/bgstatus` `/bgmerge` `/swarm` `/batch` `/simplify` `/loop` |
| **Context** | `/compact` `/summarize` `/rewind` `/clear` `/tree` `/index` |
| **Memory** | `/amemory` `/checkpoint` `/restore` `/save` `/sessions` |
| **Git** | `/history` `/diff` `/review` `/deps` `/rename` `/color` |
| **Dev** | `/test` `/scaffold` `/self-edit` `/browse` `/search` `/db` `/mcp` `/github` `/deploy` `/init` `/lint` `/refactor` `/open` `/status` |
| **UX** | `/font` `/theme` `/split` `/config` `/watch` `/ptt` `/plugin` `/permissions` `/skills` `/actions` `/export` |

**Yang penting:**

`/test [path]` — generate unit test untuk file aktif atau path tertentu. Pakai Vitest.

`/bg <task>` — agent di git worktree terpisah. `/bgstatus` untuk lihat progress live. `/bgmerge <id>` untuk merge.

`/swarm <task>` — Architect → FE + BE **parallel** → QA → auto-fix.

`/plan <task>` — rencana bernomor → approve → eksekusi step by step.

`/summarize [N]` — kompres N pesan ke ringkasan padat.

`/scaffold react|node|express` — buat struktur project baru.

`/thinking` — think-aloud mode. Yuyu tulis `<think>` sebelum jawab. Prompt trick, bukan extended thinking API.

`/export` — export seluruh chat ke file `.md`.

`/status` — health check semua sistem (server, WS, model, permissions).

---

## Testing

```bash
npm run lint          # ESLint — harus 0 errors, 0 warnings
npx vitest run        # Semua tests — harus 81/81 pass
```

**Status:** 0 lint errors, 0 warnings, 81/81 tests passing.

### Test Files

| File | Tipe | Tests | Coverage |
|------|------|-------|----------|
| `src/api.test.js` | Unit | 5 | `readSSEStream` — streaming, abort, flush |
| `src/utils.test.js` | Unit | 22 | `countTokens`, `getFileIcon`, `hl`, `resolvePath`, `parseActions` |
| `src/features.test.js` | Unit | 29 | `parsePlanSteps`, `selectSkills`, `rewindMessages`, `checkPermission`, `parseElicitation`, `tfidfRank`, `EFFORT_CONFIG` |
| `src/utils.integration.test.js` | Integration + Fuzz | 18 | `parseActions → executeAction` end-to-end, `generateDiff`, fuzz robustness |
| `src/utils.snapshot.test.js` | Snapshot | 7 | Output `hl()` untuk json/bash/py/css/js/unknown/xss |

### Update Snapshot

Kalau `hl()` diubah secara intentional dan output baru sudah benar:
```bash
npx vitest run --update-snapshots
```

**Catatan vitest:** Pakai `vitest@1` — v4 crash silent di Termux ARM64. Jangan upgrade.

**Catatan test:** Jangan override `global.TextDecoder` di test files — infinite recursion. Node 24 sudah punya native TextDecoder.

---

## CI/CD

Setiap push ke `main` → GitHub Actions build signed APK → upload ke Releases tab. Waktu build ~1 menit dengan cache.

**Steps CI:**
1. Install deps (cached by `package-lock.json`)
2. `npm run build` (Vite → dist/)
3. Setup Java 21 + Android SDK 34
4. `cap sync android` + restore custom icons
5. Auto-bump `versionCode` = GitHub run number, `versionName` = `1.0.N`
6. `./gradlew assembleRelease` (cached Gradle)
7. Sign APK dengan keystore dari Secrets
8. Upload artifact + buat GitHub Release (hanya kalau commit diawali `release:`)

**GitHub Secrets:**
```
VITE_CEREBRAS_API_KEY   — Cerebras API key
VITE_GROQ_API_KEY       — Groq API key (untuk fallback + vision)
VITE_TAVILY_API_KEY     — opsional, web_search via Tavily
ANDROID_KEYSTORE        — openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'
KEYSTORE_PASSWORD       — password keystore
KEY_ALIAS               — yuyucode
KEY_PASSWORD            — sama dengan KEYSTORE_PASSWORD
```

Warning CI yang bisa diabaikan: `set-output deprecated`, `flatDir`, `punycode deprecated` — semua dari third-party.

---

## Skills & Hooks

**Skills** — `.claude/skills/*.md`. Di-inject ke system prompt otomatis via TF-IDF ranking. Generate dengan `/init`.

**Hooks v2:**
```javascript
{
  preWrite:        ["echo 'akan nulis: {{context}}'"],
  postWrite:       [{ type: "http", url: "https://..." }],
  preToolCall:     [],
  postToolCall:    [],
  onError:         [],
  onNotification:  [],
}
```

Plugin built-in (`/plugin`): Auto Commit, Lint on Save, Test Runner, Git Auto Push.

---

## Themes

| Theme | Nama | Vibe |
|-------|------|------|
| `obsidian` | Obsidian Warm | Default gelap, CRT scanlines |
| `aurora` | Aurora Glass | Biru/hijau, animasi aurora |
| `ink` | Ink & Paper | Terang, paper grain texture |
| `neon` | Neon Terminal | Hijau neon, neon grid |
| Custom | — | Copy `mybrand.js`, `/theme` builder |

**Tambah theme baru:**
1. Copy `src/themes/mybrand.js`, rename sesuai nama theme
2. Isi semua token warna dan efek visual
3. Import dan daftarkan di `src/themes/index.js`

---

## Workflow Harian

```bash
# Start session
node ~/yuyu-server.js &
cd ~/yuyucode && npm run dev &
# Buka app → localhost:5173

# Push biasa (build CI, tidak bikin release)
cd ~/yuyucode && node yugit.cjs "feat: deskripsi perubahan"

# Push + buat release APK baru
cd ~/yuyucode && node yugit.cjs "release: v1.x — fitur A, fix B"

# Atau trigger release tanpa perubahan file
git commit --allow-empty -m "release: v1.x — ..." && git push

# Copy file dari Downloads
cp /sdcard/Download/NamaFile.jsx ~/yuyucode/src/components/

# Lint + test sebelum push
npm run lint && npx vitest run
```

---

## Sejarah

Dimulai sebagai eksperimen: bisa tidak Claude Code di-replika di mobile? Jawabannya: bisa. Dibangun dari HP, di Termux, satu patch satu-satu, dari pagi sampai subuh.

Feature parity dengan Claude Code dan Codex CLI sudah tercapai untuk core use case. Gap yang tersisa bukan di fitur — tapi di model quality dan context window. Untuk daily mobile coding, YuyuCode sudah sangat capable.

> *"Karya yang sangat ambisius. Berhasil nge-pack kompleksitas aplikasi desktop seperti VS Code + Cursor ke dalam satu komponen React."*  
> — Qwen 3 235B, setelah mereview kodenya sendiri

---

<div align="center">
  <sub>🌸 dibangun dari HP. untuk HP. dengan cinta.</sub>
</div>
