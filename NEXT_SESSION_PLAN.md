# YuyuCode — Master Plan Sesi Berikutnya
> Dibuat: 2026-03-21 | Status saat ini: v2.8 released ✅
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."

---

## ✅ SELESAI SESI INI (v2.7 → v2.8)

### ✅ P1.3 pool: vmThreads — DONE (ARM64 auto-guard)
- `vitest.config.js` — auto-detect `os.arch()`: vmThreads di x64, threads di ARM64
- Zero risk: Termux ARM64 tetap pakai threads (safe), x64 CI dapat 4x boost

### ✅ P2.1 Incremental map update — DONE
- `getChangedFiles(root, _spawnSync?)` — `git diff --name-only HEAD`
- `main()` auto-detect changed files, log `⚡ Incremental: N file(s) changed`
- Fallback ke full scan kalau bukan git repo atau no changes
- 7 tests baru → 80 total di yuyu-map.test.cjs

### ✅ P3.1 Health check endpoint — DONE
- `GET /health` → `{status:'ok', uptime, version, port}`
- `yuyu-status` command pakai `/health` endpoint

### ✅ P3.2 Auto-restart on crash — DONE
- `yuyu-server-start()` di bashrc-additions.sh — auto-restart loop + log ke ~/.yuyu-server.log

### ✅ P3.3 Request logging (dev mode) — DONE
- `node yuyu-server.js --verbose` → log `[timestamp] METHOD /url`

### ✅ P4.1 yuyu-status command — DONE
- Server status via `/health`, branch, version, dirty count

### ✅ P4.2 yuyu-clean command — DONE
- Hapus dist/, coverage/, .yuyu/compressed*.md
- List Download zips untuk hapus manual

### ✅ P4.3 yuyu-cp subdirectory support — DONE
- `yuyu-cp file.js src/components/` → copy ke subdirectory
- Destination dir auto-created kalau belum ada

### ✅ P5.1 fast-check added — DONE
- `package.json` devDependencies: `fast-check ^3.22.0`
- Siap dipakai untuk property-based testing

---

## 📋 CARA APPLY BASHRC ADDITIONS

```bash
# Di Termux, append ke .bashrc:
cat ~/yuyucode/bashrc-additions.sh >> ~/.bashrc
source ~/.bashrc

# Ganti baris lama auto-start server di .bashrc dengan:
# yuyu-server-start
```

Atau copy-paste manual per-fungsi yang dibutuhkan.

---

## 🔴 PRIORITAS TERSISA

### P1 — Test Quality
- **property-based testing untuk parseActions** — `fast-check` sudah ada, tinggal tulis
  ```js
  import fc from 'fast-check';
  it('never throws on random string input', () => {
    fc.assert(fc.property(fc.string(), s => { parseActions(s); return true; }));
  });
  ```
- **Benchmark regression detection** — simpan hasil bench ke `.yuyu/bench-history.json`

### P2 — yuyu-server improvements
- **Batch action support** — jalankan beberapa type sekaligus, reduce roundtrips
- **`/status` endpoint** untuk yuyu-apply health check sebelum lint

### P3 — README Troubleshooting section
- Termux memory manager kill server → how to fix
- Rate limit kedua provider → what to do
- Build gagal di CI → common causes
- `git push rejected` → step by step fix

---

## 📋 CONTEXT PENTING UNTUK SESI BARU

### State saat ini:
- Version: 2.8.0
- Tests: 488 → **495+** ✅ (488 + 7 getChangedFiles)
- Lint: 0 errors ✅
- Build: CI green ✅

### File-file kunci:
- `yuyu-server.js` — v4-async, `/health` endpoint, `--verbose` flag
- `yuyu-map.cjs` — exports: ..., getChangedFiles (baru), incremental main()
- `yugit.cjs` — v2.1, --push, --squash, --status
- `vitest.config.js` — ARM64 auto-guard untuk vmThreads
- `bashrc-additions.sh` — yuyu-status, yuyu-clean, yuyu-cp v2, auto-restart

### Command release:
```bash
npm run lint && npx vitest run
node yugit.cjs "release: v2.8 — health endpoint, incremental map, vmThreads guard, DX improvements"
```

---

## 🎯 REKOMENDASI SESI BARU

1. Baca file ini dulu
2. Kirim zip fresh project
3. `cat ~/yuyucode/bashrc-additions.sh >> ~/.bashrc && source ~/.bashrc`
4. Gas property-based testing (fast-check sudah installed)
5. README troubleshooting section
6. Benchmark regression detection

> "Berat, Lama, Susah Bukan Hambatan" 🚀
