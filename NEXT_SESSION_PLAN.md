# YuyuCode — Master Plan Sesi Berikutnya
> Dibuat: 2026-03-21 | Status saat ini: v2.6 released ✅
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."

---

## 🔴 PRIORITAS 1 — Vitest & Coverage

### 1.1 isolate: false — Squeeze performa lebih jauh
- Problem: mock strategy di `utils.integration.test.js` tidak compatible dengan `isolate:false`
- Solution: Refactor semua `vi.mock('./api.js')` jadi dependency injection pattern
- Expected gain: dari 6.7s → target <4s
- Files: `src/utils.integration.test.js`, `src/multitab.test.js`, `src/features.extra.test.js`

### 1.2 Coverage gaps di yuyu-map.test.cjs
- `generateLlmsTxt()` — belum ada test sama sekali
- `ensureHandoffTemplate()` — belum ada test
- `main()` integration test — test full flow dengan tmp dir
- Target: dari 47 → 70+ tests

### 1.3 pool: vmThreads experiment
- Research sudah done: potentially 4x faster tapi ARM64 risk
- Plan: test di Termux, kalau crash revert, kalau OK keep
- Command: tambah `pool: 'vmThreads'` ke vitest.config.js, run 3x, cek stability

---

## 🟠 PRIORITAS 2 — ESLint v10 Upgrade

### Research sudah done di sesi ini:
- ESLint v10 rilis Feb 2026
- Node minimum v20.19.0 — YuyuCode Node 24 ✅
- Flat config sudah dipakai ✅
- Risk: config lookup behavior berubah, plugin compatibility

### Steps:
```bash
npm install eslint@10 --save-dev
npm run lint  # cek hasilnya
# Kalau 0 errors → commit
# Kalau ada issues → fix satu per satu
```

### Files yang mungkin perlu update:
- `eslint.config.js` — cek apakah ada breaking change
- Plugin versions: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

---

## 🟠 PRIORITAS 3 — yugit.cjs v2 Polish

### 3.1 --push flag
- Sekarang `--no-push` ada tapi tidak ada `--push` untuk push setelah commit lokal
- Use case: commit offline, push nanti waktu ada koneksi
```bash
node yugit.cjs --push  # push tanpa commit baru
```

### 3.2 Squash helper
- `node yugit.cjs --squash 3` → squash 3 commit terakhir jadi 1
- Berguna untuk cleanup sebelum release

### 3.3 Status command
- `node yugit.cjs --status` → tampilkan branch, uncommitted files, last 3 commits
- Nice to have untuk quick overview

### 3.4 Fix yuyu-cp untuk path selain root yuyucode
- Sekarang hardcode ke `~/yuyucode/`
- Tambah optional second arg: `yuyu-cp file.js src/components/`

---

## 🟡 PRIORITAS 4 — yuyu-map.cjs v3

### 4.1 repomix output ke compressed-repomix.md TERPISAH
- Sekarang repomix output override compressed.md
- Better: simpan di `.yuyu/compressed-repomix.md` (sudah ada di file tapi belum dipakai optimal)
- compressed.md tetap untuk regex fallback
- Agent loop bisa pilih mana yang lebih fresh/relevant

### 4.2 Incremental map update
- Sekarang full rescan setiap run — lambat di project besar
- Idea: cek `git diff --name-only` → hanya rescan file yang berubah
- Expected: dari ~3s → <1s untuk commit kecil

### 4.3 Symbol type accuracy
- Bug ditemukan di sesi ini: `export function useFileStore` match `fn` bukan `hook`
- Pattern order issue — hook pattern harus di-check SEBELUM fn pattern
- Fix: reorder patterns array di `extractSymbols()`

---

## 🟡 PRIORITAS 5 — yuyu-server.js Improvements

### 5.1 Health check endpoint
- Sekarang tidak ada cara tau server running atau tidak kecuali coba request
- Tambah `GET /health` → `{status: 'ok', uptime, version}`
- yuyu-apply bisa ping dulu sebelum lint/test

### 5.2 Auto-restart on crash
- Sekarang kalau yuyu-server crash → semua fitur mati
- Tambah ke .bashrc:
```bash
while true; do node ~/yuyu-server.js; sleep 2; done &
```

### 5.3 Request logging (dev mode)
- `node yuyu-server.js --verbose` → log setiap request
- Berguna untuk debug agent loop

---

## 🟢 PRIORITAS 6 — Developer Experience

### 6.1 yuyu-status command baru
- One command untuk lihat semua state:
```bash
yuyu-status
# Output:
# 📡 Server: running (port 8765)
# 🌿 Branch: main (3 commits ahead)
# 🧪 Tests: 451/451 (last run: 2h ago)
# 📦 Version: 2.6.0
# 🔥 Hot files: 5 (since last map update)
```

### 6.2 yuyu-clean command
- Hapus artifacts: `dist/`, `coverage/`, `.yuyu/compressed*.md`, `*.zip`
- Safe version — tidak hapus source files

### 6.3 README — tambah section "Troubleshooting"
- Termux memory manager kill server → how to fix
- Rate limit kedua provider → what to do
- Build gagal di CI → common causes
- `git push rejected` → step by step fix

---

## 🔵 PRIORITAS 7 — Test Quality

### 7.1 Property-based testing untuk parseActions
- Saat ini: manual fuzz inputs
- Better: gunakan `fast-check` library untuk generate random inputs
- Coverage jauh lebih comprehensive untuk edge cases

### 7.2 Benchmark regression detection
- Sekarang bench hanya tampilkan angka
- Idea: simpan hasil bench ke `.yuyu/bench-history.json`
- Kalau ada fungsi yang 2x lebih lambat dari baseline → warn

### 7.3 Snapshot update workflow
- `npx vitest run --update-snapshots` perlu di-document lebih jelas
- Tambah ke workflow harian di README

---

## 📋 CONTEXT PENTING UNTUK SESI BARU

### State saat ini:
- Version: 2.6.0
- Tests: 451/451 ✅
- Lint: 0 errors, 0 warnings ✅
- Build: CI green (#360) ✅

### Bug yang diketahui:
1. `extractSymbols()` — hook pattern match sebagai fn (pattern order issue)
2. `yuyu-cp` — path hardcode ke root yuyucode, belum support subdirectory
3. `isolate: false` — belum bisa karena mock strategy conflict

### File-file kunci:
- `yuyu-map.cjs` — exports: walkFiles, extractSymbols, compressSource, extractImports, computeSalience, generateMap, generateCompressed, generateLlmsTxt, tryRepomix
- `yugit.cjs` — v2, bug fix di HASH parsing sudah applied
- `vitest.config.js` — happy-dom, pool:threads, css:false
- `src/setupTest.js` — minimal, no cleanup needed
- `.bashrc` — yuyu-apply, yuyu-cp, completions semua ada

### Workflow apply file:
```bash
yuyu-apply              # zip → unzip + lint + test + rollback
yuyu-cp <file>          # single file → copy + rm dari Download
yuyu-apply --dry-run    # preview dulu
```

### Command release:
```bash
npm run lint && npx vitest run
node yugit.cjs "release: vX.X — deskripsi"
```

---

## 🎯 REKOMENDASI URUTAN EKSEKUSI SESI BARU

1. Baca file ini dulu
2. Kirim zip fresh project (untuk context terbaru)
3. Gas Prioritas 1.2 (coverage gaps yuyu-map) — paling quick win
4. Lanjut Prioritas 1.1 (isolate:false) — paling impactful
5. Prioritas 2 (ESLint v10) — satu command, low risk
6. Prioritas 3 (yugit polish) — incremental improvement
7. Selebihnya sesuai mood dan kebutuhan

> "Berat, Lama, Susah Bukan Hambatan" — Let's go! 🚀
