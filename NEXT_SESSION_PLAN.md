# YuyuCode — Master Plan Sesi Berikutnya
> Dibuat: 2026-03-21 | Status saat ini: v3.1 released ✅
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."

---

## ✅ SELESAI SESI INI (v3.0.3 → v3.1)

### ✅ Context window bar visual
- Progress bar `chars/80K` realtime, kuning (50K) → merah (68K)
- `CONTEXT_WARN_CHARS = 50_000` di constants.js

### ✅ Graceful stop
- Tombol ⏸ di samping ■ cancel saat agent running
- `/stop` slash command
- `chat.gracefulStop` flag — selesaikan iter dulu baru berhenti

### ✅ Chat search
- Tombol 🔍 di input area + search bar inline
- `chat.searchMessages(q)` — filter messages
- `/search <query>` command

### ✅ Read cache di yuyu-server
- TTL 10s, max 50 entries, auto-invalidate on write/patch/delete

### ✅ /clear smarter
- Tanya simpan dulu kalau ada messages, `/clear force` untuk langsung

### ✅ /undo global
- `/undo N` — batalkan N file edit terakhir dari agent

### ✅ /cost enhanced
- Tambah estimasi savings vs GPT-4o

### ✅ /pin + /unpin
- Pin file ke context permanent — selalu masuk agent loop
- Inject ke gatherProjectContext otomatis

### ✅ /diff
- `/diff` → git diff working tree
- `/diff v3.0..v3.1` → diff antara commits

### ✅ /ask — one-shot model override
- `/ask kimi review ini` — tanya model tertentu sekali
- Alias: kimi, llama, llama8b, qwen, scout, qwen235
- `sendMsg(txt, { overrideModel })` pattern

### ✅ Server offline detection
- Health check sebelum loop mulai
- Friendly error + instruksi restart kalau server mati

---

## 📋 CONTEXT PENTING UNTUK SESI BARU

### State saat ini:
- Version: 3.1.0
- Tests: 546 ✅
- Slash commands: ~66
- CI: green ✅

### Yang belum dikerjain:
- Keyboard shortcut row customizable per project
- Multi-file /undo (undo semua file dari satu agent iteration sekaligus)
- Token cost per model yang lebih akurat (rate Cerebras/Groq API)

---

## 🎯 REKOMENDASI SESI BARU

1. Baca file ini
2. Kirim zip fresh
3. Pakai app — catat yang masih annoying
4. Gas fix atau fitur baru

> "Berat, Lama, Susah Bukan Hambatan" 🚀
