# YuyuCode — Master Plan Sesi Berikutnya
> Dibuat: 2026-03-21 | Status saat ini: v2.9 released ✅
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."

---

## ✅ SELESAI SESI INI (v2.8 → v2.9)

### ✅ Property-based testing (fast-check) — DONE
- `src/utils.integration.test.js` — 29 → **38 tests**
- 9 property-based tests: `parseActions` (6) + `resolvePath` (3)
- Coverage: never throws, always array, count ≤ blocks, valid JSON parsed, idempotent

### ✅ Benchmark regression detection — DONE
- `yuyu-bench.cjs` — new file, 151 lines
- Run bench + compare ke `.yuyu/bench-history.json`
- `🔴 SLOW` kalau 2x lebih lambat dari baseline
- `🟢 FAST` kalau 2x lebih cepat
- `package.json` scripts: `bench`, `bench:save`, `bench:run`
- Usage: `npm run bench` → `npm run bench:save` untuk set baseline

### ✅ yuyu-server batch action — DONE
- `{ type: 'batch', actions: [...] }` → `{ ok, results: [...] }`
- Reduce roundtrips untuk agent loop yang banyak parallel read

### ✅ yuyu-server /status endpoint — DONE
- `GET /status` → `{ status, uptime, version, port, memory_mb, tools }`
- Lebih detail dari `/health` — include memory usage

### ✅ README Troubleshooting section — DONE
- Termux memory manager → wakelock fix
- Rate limit Cerebras/Groq → manual workaround
- CI build gagal → 4 penyebab + fix
- `git push rejected` → step by step
- Test lambat → diagnose + fix
- `yuyu-apply` rollback terus → manual debug steps

---

## 📋 CONTEXT PENTING UNTUK SESI BARU

### State saat ini:
- Version: 2.9.0
- Tests: 495 → **504+** ✅ (+9 property-based)
- yuyu-map.test.cjs: 80 tests
- utils.integration.test.js: 38 tests
- Lint: 0 errors ✅

### File-file kunci:
- `yuyu-server.js` — v4-async, `/health`, `/status`, batch action, `--verbose`
- `yuyu-map.cjs` — incremental map, getChangedFiles
- `yuyu-bench.cjs` — NEW: bench regression detector
- `src/utils.integration.test.js` — 38 tests termasuk fast-check
- `package.json` — scripts: bench, bench:save, bench:run

### Bench workflow:
```bash
npm run bench:run    # lihat angka bench
npm run bench:save   # set baseline pertama kali
npm run bench        # compare ke baseline (pakai setiap sesi)
```

---

## 🔴 PRIORITAS TERSISA

### P1 — Codebase quality
- **Snapshot update workflow** — document `npx vitest run --update-snapshots` lebih jelas di README dev docs
- **`yuyu-map.test.cjs` property-based** — tambah fc tests untuk `extractSymbols`, `compressSource`

### P2 — yuyu-server
- **Streaming batch** — WebSocket batch untuk parallel exec_stream
- **Rate limiting** — simple in-memory rate limit untuk cegah abuse (optional)

### P3 — App features
- **Apapun yang muncul waktu pakai** — bug reports, UX improvements

---

## 🎯 REKOMENDASI SESI BARU

1. Baca file ini
2. Kirim zip fresh
3. `npm run bench:save` untuk set baseline pertama kali
4. Gas snapshot update docs
5. fc tests untuk yuyu-map
6. Atau langsung pakai app dan report bugs

> "Berat, Lama, Susah Bukan Hambatan" 🚀
