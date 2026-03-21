# YuyuCode — Flagship Plan
> Dibuat: 2026-03-21 | Status saat ini: v3.1 ✅
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."
> Riset: Cursor, Claude Code, Windsurf, Copilot, Devin 2026 — ambil yang terbaik, beat yang bisa dibeat.

---

## 🏆 VISI v4.0 — "The Phone That Codes Like a Senior Engineer"

YuyuCode bukan sekadar chat + editor. Target v4.0:
> **Autonomous. Context-aware. Self-improving. Runs entirely on a $130 phone.**

Benchmark: feature-parity dengan Cursor Pro ($20/month) — tapi gratis, offline-capable, dan dari HP.

---

## 🔴 TIER 1 — Game Changers (Langsung kerasa berbeda)

### 1.1 Visual Diff Review — "Accept/Reject per hunk"
**Gap vs Cursor:** Cursor tunjukkan visual diff sebelum apply, bisa accept/reject per-block.
YuyuCode sekarang: langsung apply tanpa preview.

- Setiap `patch_file` dan `write_file` dari agent → tampilkan diff dulu di UI
- Per-hunk accept/reject: ✅ apply baris ini / ❌ skip / ✏️ edit manual
- "Accept all" dan "Reject all" untuk bulk
- Kalau reject → agent loop lanjut dengan feedback "user rejected: [hunk]"
- **Implementasi:** intercept write/patch actions, pause loop, render Myers diff, wait user input
- **Impact:** kontrol penuh atas setiap perubahan. Tidak ada lagi "agent ngaco dan gak ketauan"

### 1.2 Multi-Level Ghost Text — "Lookahead completion"
**Gap vs Cursor:** Cursor tunjukkan tidak hanya line berikutnya, tapi preview 2-3 baris ke depan.
YuyuCode sekarang: ghost text 1 baris, 900ms debounce.

- Ghost text level 1: immediate next line (fast, 300ms, model kecil)
- Ghost text level 2: next function body preview (900ms, model besar)
- Tab = accept level 1. Tab+Tab = accept level 2. Shift+Tab = lihat alternatif
- Model routing: level 1 pakai Llama 8B (cepat), level 2 pakai Kimi K2 (akurat)
- **Implementasi:** dua request paralel, render sebagai ghost text berbeda warna/opacity

### 1.3 YUYU.md — Persistent Project Memory
**Gap vs Claude Code:** Claude Code punya CLAUDE.md — file yang dibaca setiap sesi, isi coding standards, architecture decisions, preferred patterns.
YuyuCode sekarang: tidak ada persistent project memory (handoff.md terlalu manual).

- `YUYU.md` di root project → auto-loaded di setiap agent loop (lebih prioritas dari handoff)
- Format: coding standards, architecture decisions, forbidden patterns, preferred libraries
- `/rules` command untuk edit YUYU.md via chat
- `/rules add "always use TypeScript strict mode"` → append ke YUYU.md
- Auto-suggest: kalau agent detect pola berulang → "Mau tambahkan ke YUYU.md?"
- **Implementasi:** baca di `gatherProjectContext()` sebelum handoff, inject ke system prompt

### 1.4 Parallel Agent Swarm v2 — "Background VM-style"
**Gap vs Cursor:** Cursor jalankan background agents di isolated VM. YuyuCode `/bg` sequential.

- `/bg task1 & bg task2 & bg task3` → 3 agents jalan paralel di git worktrees berbeda
- Setiap agent punya isolated context, tidak saling ganggu
- Progress dashboard: lihat semua agents sekaligus, mana yang stuck
- Auto-merge: kalau selesai → show diff, 1 tap merge ke main
- `/bgkill all` → abort semua background agents sekaligus
- Rate limit aware: queue agents kalau provider sedang throttle
- **Implementasi:** extend `runBackgroundAgent()` untuk multi-instance dengan shared progress state

---

## 🟠 TIER 2 — Significant Upgrades (Mematangkan yang ada)

### 2.1 Click-to-Edit di Live Preview
**Gap vs Windsurf:** Windsurf punya "click any element → edit with AI".

- Klik elemen di live preview iframe → highlight + open edit dialog
- Tanya agent: "ubah warna button ini jadi biru" → agent patch CSS/JSX langsung
- Inspector mode: hover element → tampilkan component name + file path
- **Implementasi:** inject click interceptor ke srcdoc iframe, postMessage ke parent, resolve ke file path

### 2.2 Auto Test Generation — "Write code → tests auto-suggested"
**Gap vs Copilot/Qodo:** Tools modern auto-generate tests setelah kamu tulis function.

- Setiap kali agent tulis/edit function → auto-suggest test skeleton
- `/test` command: generate vitest tests untuk file yang sedang terbuka
- Coverage badge di header: "73% coverage" berdasarkan vitest --coverage output
- Failed test → agent auto-fix dengan 1 tap
- **Implementasi:** post-write hook di agent loop, template-based test generation

### 2.3 Smart Context Compression v2
**Gap:** Auto-compact sekarang pakai recursive summary yang lossy dan tidak akurat.

- Ganti dengan **semantic chunking**: extract key decisions, not just summarize
- Preserve: semua file edits history, error → fix chains, architectural decisions
- Discard: verbose explanations, duplicate reads, tool call logs
- Size indicator: "Kompres 47K → 12K chars, preserve 94% signal"
- **Implementasi:** structured compact format dengan tagged sections

### 2.4 Dependency Graph Visual
**Gap:** `/deps` ada tapi output text. Windsurf punya visual graph.

- Render dependency graph sebagai interactive force-directed graph di canvas
- Node = file, edge = import. Warna = salience score dari yuyu-map
- Tap node → jump to file. Long-press → "refactor this module"
- Circular dependency detection → highlight merah
- **Implementasi:** d3.js force simulation di iframe atau canvas element

### 2.5 AI Code Review — PR-level analysis
**Gap vs Qodo:** Tools modern analyze entire diffs untuk security, patterns, missing tests.

- `/review` sekarang hanya review satu file
- `/review --all` → review semua changed files vs HEAD
- Check: (1) missing error handling, (2) security issues, (3) missing tests, (4) performance red flags
- Output: structured report dengan severity + suggested fix per issue
- **Implementasi:** batch read all changed files, structured review prompt, parse output

### 2.6 Intelligent Auto-complete Commands
**Gap:** Slash command suggestions sekarang static list.

- Contextual suggestions: kalau ada error di chat → suggest `/fix`, `/review`
- Kalau file baru dibuka → suggest `/test`, `/explain`
- Frequency-based: commands yang sering dipakai muncul di atas
- Fuzzy match: `/rev` → `/review`, `/gen` → suggest `/generate`, `/scaffold`
- **Implementasi:** score commands by context + usage history

---

## 🟡 TIER 3 — Premium Polish

### 3.1 Voice-First Agent Mode
- Push-to-talk → voice → agent langsung execute (sudah ada PTT, extend ke agent)
- Wake word detection: "Hey Yuyu" → activate (pakai Web Speech API)
- TTS response: agent jawab dengan suara (sudah ada TTS, integrate better)
- **Use case:** hands-free coding while reading docs / eating 😂

### 3.2 Snippet Library dengan AI
- `/snippet save "auth handler"` → simpan selection sebagai named snippet
- `/snippet use "auth handler"` → insert + adapt ke context saat ini dengan AI
- Auto-categorize: frontend, backend, utils, hooks
- Export/import: share snippet library antar project

### 3.3 Commit Message AI — Smarter yugit
- Sebelum commit, analyze semua changed files → generate semantic commit message
- Suggest: `feat(auth): add JWT refresh token rotation` bukan `update auth.js`
- Breaking change detection: otomatis append `!` kalau detect breaking changes
- `/commit` command dari dalam app → tugit dari app langsung

### 3.4 Error Lens — Inline error display
- Baca ESLint/TypeScript errors dari yuyu-server → tampilkan inline di CodeMirror
- Bukan hanya gutter marker — tampilkan message di baris yang error
- 1 tap on error → agent auto-fix
- **Implementasi:** periodic lint run via server, inject diagnostics ke CM extensions

### 3.5 Multi-cursor AI Edit
- Select multiple occurrences (`Ctrl+D`) → "AI: rename all these to X"
- Region select → "AI: refactor this block"
- **Implementasi:** extend existing multi-cursor dengan AI action menu

### 3.6 Keyboard Shortcut Row Customizable
- Config panel: drag-reorder symbols, add custom symbols/snippets
- Per-project shortcuts: save ke YUYU.md
- Preset themes: "React dev", "Python", "Shell script"

---

## 🔵 TIER 4 — Ambitious / Experimental

### 4.1 Self-Healing App — Runtime Error Recovery
- Connect ke xterm.js terminal output → intercept runtime errors
- Auto-detect: "TypeError: Cannot read property of undefined at line 42"
- Auto-trigger agent: fix dengan context dari error + stack trace
- "Auto-fix mode": kalau diaktifkan, langsung fix tanpa konfirmasi
- **Ini literally apa yang Devin lakukan** — tapi kita di HP 😂

### 4.2 Codebase Q&A — "Ask your codebase"
- `/ask "bagaimana flow authentication bekerja?"` → agent trace kode dan jawab
- `/ask "di mana semua useEffect yang fetch data?"` → semantic search
- Bukan hanya grep — agent actually reads dan explains patterns
- **Gap vs Claude Code:** Claude Code bisa ini karena 200K context. Kita pakai Kimi K2 (262K) ✅

### 4.3 Automated Changelog Generation
- `/changelog` → compare HEAD vs last release tag → generate user-facing changelog
- Semantic grouping: Features / Fixes / Breaking Changes / Performance
- Markdown format, siap paste ke GitHub Release
- Auto-update README Changelog section

### 4.4 Live Performance Profiler
- Inject performance observer ke live preview
- Tampilkan: render time, JS execution time, memory usage
- Flag komponen yang lambat → agent suggest optimization
- "Profiler mode" toggle di live preview header

### 4.5 AI-Powered Merge Conflict Resolution
- Sekarang ada MergeConflictPanel tapi manual
- Auto-resolve: untuk conflict yang simple (different variable names, whitespace)
- Untuk conflict yang complex → agent analyze both versions + suggest semantic merge
- "Trust incoming" / "Trust current" / "AI merge" per-conflict

---

## 📋 CONTEXT PENTING UNTUK SESI BARU

### State saat ini v3.1:
- Version: 3.1.0
- Tests: 546 ✅
- Slash commands: ~66
- Features: context bar, graceful stop, chat search, /pin, /undo, /diff, /ask, offline detect, read cache

### Priority untuk sesi berikutnya:
```
Tier 1 dulu — impact terbesar:
1. Visual diff review (1.1) — paling game-changing UX
2. YUYU.md persistent memory (1.3) — paling berguna sehari-hari
3. Multi-level ghost text (1.2) — paling wow factor
4. Parallel agents v2 (1.4) — paling ambitious

Tier 2 setelah Tier 1 selesai:
5. Auto test generation (2.2)
6. Click-to-edit live preview (2.1)
7. AI code review --all (2.5)
```

### Command release setelah sesi:
```bash
npm run lint && npx vitest run
node yugit.cjs "release: v4.0 — visual diff, YUYU.md, multi-level ghost text, parallel agents"
```

---

> "Berat, Lama, Susah Bukan Hambatan."
> YuyuCode v4.0: **The Phone That Codes Like a Senior Engineer** 🚀
