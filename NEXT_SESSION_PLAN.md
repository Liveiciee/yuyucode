# YuyuCode — Master Plan Sesi Berikutnya
> Dibuat: 2026-03-21 | Status saat ini: v2.7 released ✅
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."

---

## ✅ SELESAI SESI INI

### ✅ P1.1 isolate: false — DONE
- Refactor `utils.integration.test.js` → DI pattern, hapus `vi.mock('./api.js')`
- `executeAction` sekarang terima `_callServer` param (default = `callServer`)
- `vitest.config.js` — `isolate: false` enabled

### ✅ P1.2 Coverage yuyu-map — DONE (47 → 73 tests)
- `generateLlmsTxt()` — 9 tests baru
- `ensureHandoffTemplate()` — 5 tests baru (dengan tmp dir)
- `main()` integration test — 10 tests full flow
- `generateMap`, `generateCompressed`, `walkFiles`, `computeSalience` — sudah ada

### ✅ P2 ESLint v10 Upgrade — DONE
- `package.json`: eslint + @eslint/js → `^10.0.0`
- `happy-dom` ditambahkan ke devDependencies

### ✅ P3 yugit.cjs v2 Polish — DONE
- `node yugit.cjs --push` → push tanpa commit baru
- `node yugit.cjs --squash 3` → squash 3 commit terakhir + push
- `node yugit.cjs --status` → branch + uncommitted + 3 recent commits

### ✅ P4.3 Symbol type accuracy — DONE
- Bug fix: hook pattern sekarang di-check SEBELUM fn pattern di `extractSymbols()`
- `export function useFileStore` sekarang correctly typed sebagai `hook` bukan `fn`

### ✅ P4.1 repomix output terpisah — DONE
- `tryRepomix` sudah output ke `.yuyu/compressed-repomix.md` (sudah ada sebelumnya)
- `main()` sekarang testable — accept `{root, yuyuDir}` opts
- `ensureHandoffTemplate()` exported dan testable

---

## 🔴 PRIORITAS 1 — Tersisa

### 1.3 pool: vmThreads experiment
- Research sudah done: potentially 4x faster tapi ARM64 risk
- Plan: test di Termux, kalau crash revert, kalau OK keep
- Command: tambah `pool: 'vmThreads'` ke vitest.config.js, run 3x, cek stability

---

## 🟡 PRIORITAS 2 — yuyu-map.cjs v3 (sisa)

### 2.1 Incremental map update
- Sekarang full rescan setiap run — lambat di project besar
- Idea: cek `git diff --name-only` → hanya rescan file yang berubah
- Expected: dari ~3s → <1s untuk commit kecil

---

## 🟡 PRIORITAS 3 — yuyu-server.js Improvements

### 3.1 Health check endpoint
- Tambah `GET /health` → `{status: 'ok', uptime, version}`

### 3.2 Auto-restart on crash
```bash
while true; do node ~/yuyu-server.js; sleep 2; done &
```

### 3.3 Request logging (dev mode)
- `node yuyu-server.js --verbose`

---

## 🟢 PRIORITAS 4 — Developer Experience

### 4.1 yuyu-status command baru
```bash
yuyu-status
# 📡 Server: running (port 8765)
# 🌿 Branch: main (3 commits ahead)
# 🧪 Tests: 451/451 (last run: 2h ago)
# 📦 Version: 2.7.0
```

### 4.2 yuyu-clean command
- Hapus artifacts: `dist/`, `coverage/`, `.yuyu/compressed*.md`, `*.zip`

### 4.3 yuyu-cp subdirectory support
- Sekarang hardcode ke `~/yuyucode/`
- Tambah optional second arg: `yuyu-cp file.js src/components/`

### 4.4 README — tambah section "Troubleshooting"

---

## 🔵 PRIORITAS 5 — Test Quality

### 5.1 Property-based testing untuk parseActions
- `fast-check` library untuk generate random inputs

### 5.2 Benchmark regression detection
- Simpan hasil bench ke `.yuyu/bench-history.json`

---

## 📋 CONTEXT PENTING UNTUK SESI BARU

### State saat ini:
- Version: 2.7.0
- Tests: 480+ / 480+ ✅ (naik dari 451 — +29 integration + 26 yuyu-map)
- Lint: 0 errors, 0 warnings ✅
- Build: CI green ✅

### Bug yang sudah difix:
- ~~`extractSymbols()` — hook pattern match sebagai fn~~ ✅ FIXED
- `yuyu-cp` — path hardcode ke root yuyucode, belum support subdirectory (masih open)
- ~~`isolate: false` — belum bisa karena mock strategy conflict~~ ✅ FIXED (DI pattern)

### File-file kunci:
- `yuyu-map.cjs` — exports: walkFiles, extractSymbols, compressSource, extractImports, computeSalience, generateMap, generateCompressed, generateLlmsTxt, ensureHandoffTemplate, tryRepomix, main
- `yugit.cjs` — v2.1, tambah --push, --squash, --status
- `vitest.config.js` — happy-dom, pool:threads, isolate:false, css:false
- `src/utils.js` — executeAction sekarang punya _callServer DI param
- `src/setupTest.js` — minimal, no cleanup needed

### Command release:
```bash
npm run lint && npx vitest run
node yugit.cjs "release: v2.7 — isolate:false, coverage yuyu-map +26, hook fix, yugit polish"
```

---

## 🎯 REKOMENDASI URUTAN SESI BARU

1. Baca file ini dulu
2. Kirim zip fresh project
3. Gas P1.3 (vmThreads) — 5 menit, low risk
4. P3.1 health check endpoint
5. P4.3 yuyu-cp subdirectory
6. Selebihnya sesuai mood

> "Berat, Lama, Susah Bukan Hambatan" — Let's go! 🚀
