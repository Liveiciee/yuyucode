# YuyuCode — Flagship Plan
> Dibuat: 2026-03-21 | **Update terakhir: 2026-03-28 (Kebaikan Penuh V2)**
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."

---

## 🏆 VISI — "The Phone That Codes Like a Senior Engineer"

> **Autonomous. Context-aware. Self-improving. Runs entirely on a $130 phone (Snapdragon 680, 8GB RAM).**

---

## ✅ SUDAH SELESAI

### v4.0
- Bug #1–5 di useAgentLoop.js + handoff.md ✅
- Visual Diff Review — DiffReviewCard, diff preview merah/hijau, pause loop, toggle /config ✅
- Multi-Level Ghost Text — L1 300ms + L2 900ms, Tab/Tab+Tab accept ✅
- YUYU.md — auto-load, inject system prompt, /rules command, template default ✅

### v4.1
- Reject feedback loop — reject → feedback ke AI + auto-resume setelah approve ✅
- /review --all — batch review semua changed files vs HEAD, severity report ✅
- Contextual slash suggestions — fuzzy match + context boost dari isi chat ✅

### SonarCloud AAA Sprint (2026-03-21)
- CI/CD hardening — CodeQL SAST + Semgrep SAST + SonarCloud Quality Gate ✅
- SonarCloud setup — sonar-project.properties, SONAR_TOKEN secret, badge di README ✅
- Security fixes — LivePreview postMessage origin check, yuyu-server log injection fix ✅
- Test suite expanded — 546 → 661 tests (+115 useSlashCommands handlers) ✅
- Cognitive complexity refactor — 14 files, 27 SonarCloud issues resolved ✅

### SonarCloud High/Blocker Sprint (2026-03-24)
- Blocker fix — useDb.test.js L113 ✅
- Nesting High fixes — App.jsx, api.js, AppChat.jsx, MsgBubble.jsx ✅

### DeepSource Cleanup (2026-03-25)
- Konfigurasi deepsource.toml komprehensif ✅
- ShellCheck suppression untuk .bashrc ✅
- .gitignore diperbarui ✅
- LICENSE MIT ✅

---

## 🔧 TECH DEBT — Sprint Berikutnya

> **Prioritas: stabilitas, performa, maintainability. Fitur baru ditunda sampai tech debt bersih.**

### 1. DeepSource Issues — 226 tersisa
**Target:** 0 issues
- [ ] JS-C1002 — short variable names (loop dense, intentional tapi perlu dokumentasi)
- [ ] JS-R1005 — cyclomatic complexity (state machine, perlu refactor bertahap)
- [ ] JS-0067 — singleton pattern (module-level state, dokumentasi intent)
- [ ] JS-0002 — no-console (terminal UI, tapi perlu wrapper untuk production)
- [ ] JS-D007 — function length (slash commands, perlu dipecah)
- [ ] JS-0128 — dangling underscore (intentional, tambah comment)
- [ ] SC issues — shellcheck di bashrc-additions.sh

### 2. Test Coverage — 1215 tests, target 85%
- [ ] Coverage gap: error handling paths
- [ ] Integration tests untuk agent loop edge cases
- [ ] E2E test untuk critical path (open project → edit → save → commit)

### 3. Performance Optimization for Snapdragon 680
**Benchmark baseline (dari yb):**
| Operation | Current | Target |
|-----------|---------|--------|
| generateDiff (500 lines) | 4.2 ops/sec (235ms) | >10 ops/sec (<100ms) |
| compressSource (500 lines) | 1,555 ops/sec (0.64ms) | >3,000 ops/sec |
| extractSymbols (500 lines) | 4,942 ops/sec | >8,000 ops/sec |
| extractImports (realistic) | 190k ops/sec | >300k ops/sec |

**Actions:**
- [ ] Optimasi generateDiff — cache, early exit, segmented diff tuning
- [ ] Cache untuk extractSymbols (Map with LRU)
- [ ] compressSource — skip large files (>100KB)
- [ ] Add `HARDWARE_LIMITS` config untuk Snapdragon 680
- [ ] Memory monitoring — auto-compact saat >400MB

### 4. Type Safety (JSDoc / TypeScript migration?)
- [ ] JSDoc untuk semua hooks (useAgentLoop, useSlashCommands)
- [ ] Type definitions untuk API responses
- [ ] PropTypes atau JSDoc untuk components

### 5. Documentation
- [ ] API documentation (yuyu-server endpoints)
- [ ] Setup guide untuk fresh Termux install
- [ ] Contribution guide

---

## 📋 STATUS SAAT INI

### v4.6.0 (2026-03-28)
- **Tests:** 1225 ✅
- **Lint:** 0 problems
- **SonarCloud:** Blocker 0 · High 0
- **DeepSource:** 226 issues (non-blocker)
- **Coverage:** ~80% statements / ~85% branches

### V2 Execution Backlog (Mobile-first)
- [x] `/bg`, `/db`, `/mcp`, `/plan` masing-masing punya test file dedicated (bukan hanya tercover tidak langsung)
- [x] Tambah `npm run health:mobile` ke release checklist wajib
- [x] Definisikan budget awal ukuran bundle JS (`npm run perf:budget`) sebagai release gate
- [x] Tambah command smoke matrix untuk jalur kritikal command (`/bg -> /status -> /plan -> /db`)
- [ ] Review semua docs status numerik (test count, coverage, benchmark) per release agar tidak usang

### Hot Files — Perlu Perhatian:
- `src/hooks/useAgentLoop.js` — complexity tinggi, perlu refactor lanjutan
- `src/hooks/useSlashCommands/index.js` — 25+ handler, perlu organisasi
- `yuyu-map.cjs` — perlu caching dan optimasi
- `src/utils.js` — generateDiff perlu tuning

---

## 🎯 METRIK KEBERHASILAN TECH DEBT SPRINT

- [ ] DeepSource issues < 50
- [ ] Test coverage > 80%
- [ ] Benchmark diff improvement >2x
- [ ] Memory usage < 400MB peak
- [ ] No console.log in production build

---

## 📝 RELEASE COMMAND

```bash
npm run lint && npx vitest run
node yugit.cjs "release: v4.5.9 — tech debt: DeepSource cleanup + performance optimization"
