# YUYU.md — Project Rules
> YuyuCode project-specific constraints. Dibaca Yuyu di setiap sesi.

## Coding Standards
- Gunakan React hooks, bukan class components
- State management: useState + props passing (tidak ada Redux/Zustand)
- File naming: camelCase untuk hooks (useXxx.js), PascalCase untuk components (.jsx)
- Tidak ada TypeScript — project ini pure JavaScript + JSX
- Komentar penting pakai `// ──` style (lihat codebase existing)

## Architecture Decisions
- Agent loop ada di `useAgentLoop.js` — jangan pecah ke file lain
- Semua slash commands di `useSlashCommands.js` — satu file, pakai else-if chain
- Theme system: token-based, zero hardcoded colors di component JSX
- Server communication: selalu lewat `callServer()` di `api.js`
- No npm build lokal — Vite build hanya di CI (ARM64 constraint)

## Forbidden Patterns
- Hindari `npm run build` lokal — build hanya dibutuhkan untuk APK, sudah di-handle CI
- JANGAN upgrade vitest ke v4+ — crash Illegal instruction di ARM64 Snapdragon 680
- JANGAN pakai isolate: false di vitest — vi.mock/vi.hoisted bocor antar file
- JANGAN hapus `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di package.json
- JANGAN override `global.TextDecoder` di test files — infinite recursion Node 24
- JANGAN edit folder `android/` manual — di-generate Capacitor

## Preferred Libraries
- Code editor: CodeMirror 6
- Terminal: xterm.js
- File search: Fuse.js
- Diff: `diff` library — chunked histogram untuk file >2000 baris (O(n) worst case), Myers untuk file kecil
- Testing: vitest@3 (bukan v4 — crash Illegal instruction di ARM64)

## Commands
- Dev: `npm run dev` (port 5173)
- Test: `npx vitest run` (harus 1124/1124 pass sebelum commit)
- Lint: `npm run lint` (harus 0 problems)
- Bench: `npm run bench`
- Deploy: `node yugit.cjs "feat: ..."`
- Release: `node yugit.cjs "release: vX.Y — deskripsi"`

## Collaboration Workflow (Papa ↔ Yuyu via Claude Chat)

### Edit Strategy — hemat token, zero degradasi
- **File kecil (<80 baris) atau file baru** → `write_file` langsung
- **File besar yang ada** → `patch_file` dengan `old_str` + `new_str` (kirim delta bukan full file)
- **Multi-file edit** → tulis semua `patch_file` paralel sekaligus, bukan satu per satu
- **Script apply manual** → kalau perubahan kompleks, buat `.py` atau `.sh` patch script, present ke Papa

### Sebelum Nulis Kode
1. Baca file target dulu (`read_file`) — jangan asumsi isi file
2. Kalau belum tahu struktur → `tree` dulu
3. Kalau ada duplikat risk (script dijalankan >1x) → cek dulu dengan `grep`
4. Rencana >3 file → kasih full plan dulu sebelum action, bukan step-by-step pingpong

### Test Discipline
- Setiap fitur baru → test file wajib ikut di commit yang sama
- Test harus cover: happy path + edge cases + branch conditions (null, undefined, empty, error)
- Gunakan `vi.hoisted()` untuk mock yang dipakai di `beforeEach`
- Pattern: `freshModule()` dengan `vi.resetModules()` untuk module dengan state global
- Target: tidak nambah coverage debt — kalau tambah fungsi, tambah test-nya

### Commit Convention
- `feat:` → fitur baru
- `fix:` → bugfix
- `perf:` → optimasi performa/token
- `test:` → hanya nambah/fix test
- `release: vX.Y.Z — deskripsi` → trigger CI build APK

### Quality Gate (wajib sebelum push)
```bash
npm run lint && npx vitest run
```
Harus: 0 lint errors, semua tests pass. Warning boleh kalau memang tidak bisa dihindari.
