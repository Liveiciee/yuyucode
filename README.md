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
- Contoh: `node yugit.cjs "release: v1.1 — fitur X dan fix Y"`
- Commit biasa (feat/fix/chore/docs) → build jalan tapi tidak bikin release baru

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

---

## Arsitektur

```
~/
├── yuyu-server.js          # Server lokal v4-async — HTTP :8765 + WS :8766
└── yuyucode/
    ├── src/
    │   ├── App.jsx             # Root component — UI, init, semua panel
    │   ├── constants.js        # BASE_SYSTEM prompt, models, themes, slash commands
    │   ├── api.js              # Cerebras+Groq streaming, callServer, execStream (WS)
    │   ├── utils.js            # parseActions, executeAction, resolvePath, hl()
    │   ├── features.js         # Plan, bg agents, skills, hooks v2, tokenTracker
    │   ├── components/
    │   │   ├── MsgBubble.jsx   # Chat bubbles, ActionChip, thinking block
    │   │   ├── FileTree.jsx    # Sidebar file explorer
    │   │   ├── FileEditor.jsx  # In-app code editor
    │   │   ├── Terminal.jsx    # Built-in terminal — live streaming via WebSocket
    │   │   ├── SearchBar.jsx   # File content search + undo bar
    │   │   ├── VoiceBtn.jsx    # Voice input + push-to-talk + partial results
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

Ada di `src/hooks/useAgentLoop.js`. Setiap pesan masuk → loop sampai MAX_ITER:

1. Kirim ke AI API (streaming)
2. Parse semua `action` blocks dari response
3. Eksekusi actions:
   - `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` → **parallel**
   - `exec`, `mcp` → **serial** (side effects, urutan penting)
   - `patch_file` → **auto-execute** dengan 3 fallback di server
   - `write_file` → **auto-execute** + backup otomatis untuk undo
4. Feed hasil balik ke AI → lanjut loop
5. Error di `exec` → auto-fix langsung
6. `patch_file` gagal → feed error, AI retry

**Effort levels:**

| Level | MaxIter | MaxTokens | Pakai kapan |
|-------|---------|-----------|-------------|
| `low` | 3 | 1500 | Pertanyaan singkat |
| `medium` | 10 | 2048 | Default harian |
| `high` | 20 | 4000 | Task kompleks |

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
| Kimi K2 🌙 | `moonshotai/kimi-k2-instruct-0905` | Context 262K |
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

**HTTP :8765** — read, write, patch, exec, list, tree, search, web_search, move, mkdir, delete, info, browse, mcp, ping, append

**WebSocket :8766** — file watcher + streaming exec (live terminal output)

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
| **Dev** | `/test` `/scaffold` `/self-edit` `/browse` `/search` `/db` `/mcp` `/github` `/deploy` `/init` `/lint` `/refactor` `/open` |
| **UX** | `/font` `/theme` `/split` `/config` `/watch` `/ptt` `/plugin` `/permissions` `/skills` `/actions` |

**Yang penting:**

`/test [path]` — generate unit test untuk file aktif atau path tertentu. Pakai Vitest.

`/bg <task>` — agent di git worktree terpisah, 8 iterasi. `/bgmerge <id>` untuk merge.

`/swarm <task>` — Architect → FE + BE **parallel** → QA → auto-fix.

`/plan <task>` — rencana bernomor → approve → eksekusi step by step.

`/summarize [N]` — kompres N pesan ke ringkasan padat.

`/scaffold react|node|express` — buat struktur project baru.

`/thinking` — think-aloud mode. Yuyu tulis `<think>` sebelum jawab. Prompt trick, bukan extended thinking API.

---

## Testing

```bash
npm run lint          # ESLint — harus 0 errors
npx vitest run        # Unit tests — harus semua pass
```

**Status:** 0 lint errors, 5/5 tests passing.

**Catatan vitest:** Pakai `vitest@1` — v4 crash silent di Termux ARM64. Jangan upgrade.

**Catatan test:** Jangan override `global.TextDecoder` di test files — infinite recursion. Node 24 sudah punya native TextDecoder.

---

## CI/CD

Setiap push ke `main` → GitHub Actions build signed APK → upload ke Releases tab. Waktu build ~1 menit dengan cache.

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

**Skills** — `SKILL.md` di root atau `.claude/skills/*.md`. Di-inject ke system prompt otomatis via TF-IDF. Generate dengan `/init`.

**Hooks v2:**
```javascript
{
  preWrite:     ["echo 'akan nulis: {{context}}'"],
  postWrite:    [{ type: "http", url: "https://..." }],
  preToolCall:  [],
  postToolCall: [],
  onError:      [],
}
```

Plugin built-in (`/plugin`): Auto Commit, Lint on Save, Test Runner, Git Auto Push.

---

## Themes

| Theme | Accent | Vibe |
|-------|--------|------|
| `dark` | `#7c3aed` | Default gelap |
| `darker` | `#6d28d9` | Lebih pekat |
| `midnight` | `#6366f1` | Biru malam |
| `rose` | `#e879a0` | Pink sakura |
| Custom | — | `/theme` builder |

---

## Workflow Harian

```bash
# Start session
node ~/yuyu-server.js &
cd ~/yuyucode && npm run dev &
# Buka app → localhost:5173

# Push + build APK otomatis (~1 menit)
cd ~/yuyucode && node yugit.cjs "pesan commit"

# Copy file dari Downloads
cp /sdcard/Download/* ~/yuyucode/src/ 2>/dev/null
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
