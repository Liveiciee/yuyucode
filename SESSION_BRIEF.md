# YuyuCode — Session Brief
> Baca ini dulu sebelum apapun. Update tiap akhir sesi.
> Last updated: 2026-03-24

---

## 👋 Cara Kerja Kita (baca sekali, pahami selamanya)

**Setup:** 1 orang (owner) + Claude Chat (kamu). Tidak ada laptop. Semua dari HP Android, Termux, Snapdragon 680.

**Workflow per sesi:**
1. Owner kirim `SESSION_BRIEF.md` + file yang relevan ke Claude Chat
2. Claude baca brief → langsung kerja, tidak perlu orientasi panjang
3. Claude hasilkan file baru/edit → owner download dari chat
4. Owner jalankan di Termux:
   ```bash
   yuyu-cp NamaFile.jsx src/hooks/   # copy dari Downloads ke subfolder
   yuyu-cp NamaFile.jsx              # copy ke root yuyucode/
   ```
5. Quality gate — **hanya kalau ada perubahan kode** (skip untuk .md, config, assets):
   ```bash
   npm run lint && npx vitest run
   ```
6. Push:
   ```bash
   node yugit.cjs "feat: deskripsi"
   ```

**Kirim file ke Claude:** Upload langsung di chat (zip kalau banyak file).

**yuyu-cp otomatis:** ambil dari `/sdcard/Download/`, copy ke `~/yuyucode/`, hapus file Download. Kalau zip → auto-apply.

**Forbidden di Termux:** heredoc (`<< EOF`) tidak jalan. Gunakan Python atau yuyu-cp.

---

## 📍 State Sekarang

- **Version:** v4.5.8
- **Tests:** 1235 ✅
- **Lint:** 0 problems
- **CI:** CodeQL ✅ · Semgrep ✅ · SonarCloud A/A/A ✅ · DeepSource ✅
- **SonarCloud fixes sesi ini:**
  - Blocker: `useDb.test.js` L113 — tambah assertion `expect(mockDb.execute).not.toHaveBeenCalled()`
  - High (nesting): `App.jsx`, `api.js`, `AppChat.jsx`, `MsgBubble.jsx` — ekstrak helper functions untuk kurangi nesting depth

---

## ⚡ Next Task (langsung kerjakan ini)

**0. DeepSource** — selesaikan sisa issues (226 total, sudah fix JS-0002/0073/0123/0833)
**1. Parallel Agent Swarm v2** — `/bg task1 && /bg task2`, max 3 paralel, progress dashboard
**2. Auto Test Generation** — post-write hook, suggest generate tests setelah agent tulis fungsi baru

---

## 🔥 Hot Files (baca dulu sebelum edit)

```
src/hooks/useAgentLoop.js       ← agentic loop, jangan pecah ke file lain
src/hooks/useSlashCommands.js   ← semua slash commands, pakai else-if chain
src/features.js                 ← bg agent, skills, sessions, hooks
src/components/FileEditor.jsx   ← editor CodeMirror 6
```

---

## 🚫 Forbidden

- `npm run build` lokal — hanya CI
- Upgrade vitest ke v4+ — crash Illegal instruction di Snapdragon 680
- `isolate: false` di vitest — vi.mock bocor antar file
- Hapus `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di package.json
- Override `global.TextDecoder` di test files — infinite recursion Node 24
- Edit folder `android/` manual — di-generate Capacitor

---

## 🏗️ Architecture Rules

- State: `useState` + props passing — tidak ada Redux/Zustand
- Theme: token-based, zero hardcoded colors di JSX
- Server: selalu lewat `callServer()` di `api.js`
- File naming: `useXxx.js` hooks, `PascalCase.jsx` components
- Pure JavaScript + JSX — tidak ada TypeScript

---

## 🧪 Test Discipline

- Setiap fitur baru → test file ikut di commit yang sama
- Cover: happy path + edge cases + null/undefined/empty/error
- Pakai `vi.hoisted()` untuk mock di `beforeEach`
- Pattern `freshModule()` + `vi.resetModules()` untuk module dengan global state

---

## 📦 Deploy

```bash
node yugit.cjs "feat: deskripsi"
node yugit.cjs "release: vX.Y — deskripsi"   # trigger CI build APK
```

---

## 📋 Roadmap Cepat

| Tier | Item | Status |
|------|------|--------|
| 🔴 1.4 | Parallel Agent Swarm v2 | 🔲 |
| 🟠 2.1 | Click-to-Edit Live Preview | 🔲 |
| 🟠 2.2 | Auto Test Generation | 🔲 |
| 🟠 2.3 | Smart Context Compression v2 | 🔲 |
| 🟠 2.4 | Dependency Graph Visual | 🔲 |
| 🟡 3.3 | Commit Message AI /commit | 🔲 |
| 🟡 3.4 | Error Lens Inline | 🔲 |

→ Full roadmap: `NEXT_SESSION_PLAN.md`

---

> *"Berat, Lama, Susah Bukan Hambatan."*
> Built on a phone · for a phone · with love 🌸
