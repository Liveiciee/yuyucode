---
name: optimize-context
description: Kelola context window agar tidak membengkak dan AI tetap akurat. Use when context terasa lambat, jawaban AI mulai melantur, token boros, atau session sudah panjang.
---

# Optimize Context

## Kapan perlu action

| Kondisi | Action |
|---------|--------|
| Messages > 20, jawaban mulai tidak fokus | `/compact` |
| Task baru tidak ada hubungannya dengan sebelumnya | `/clear` lalu mulai fresh |
| Context > 80K chars (auto-compact sudah jalan) | `/summarize 1` untuk manual control |
| Task berat tapi tidak ingin ganggu session utama | `/bg <task>` → isolated worktree |
| Mau lanjut besok dari titik yang sama | `/save nama-sesi` |

## Strategi per skenario

### Session coding panjang
- Setiap ~30 menit atau setelah selesai 1 fitur besar → `/compact`
- Pinned files (file yang terus dipakai) → lebih baik pin dari sidebar daripada paste terus ke chat

### Multi-file refactor
Pakai `/bg` daripada di session utama:
```
/bg Rename semua fungsi fetchData menjadi fetchUser di src/
```
Lalu `/bgmerge <id>` setelah selesai. Tidak polusi context utama.

### Task paralel
```
/bg Tulis unit tests untuk semua hooks
```
Kerjakan task lain di session utama, merge setelah bg agent selesai.

### Context sudah terlalu panjang tapi tidak mau hilang info penting
```
/summarize 5
```
Kompres pesan dari index ke-5 ke ringkasan padat. Pesan terbaru tetap utuh.

## Token budget per effort

| Effort | Max tokens | Cocok untuk |
|--------|-----------|-------------|
| `low` | 1500 | Pertanyaan cepat, lookup |
| `medium` | 2048 | Default harian |
| `high` | 4000 | Refactor besar, arsitektur |

Set via `/effort low` sebelum tanya hal-hal singkat — hemat rate limit Cerebras.

## Memory lintas sesi
Simpan keputusan teknis penting:
```
/amemory add project Pakai vitest@1 bukan v4 — crash di ARM64
/amemory add project rollup override wasm wajib ada di package.json
```
Ini akan di-inject otomatis (TF-IDF ranked) ke context sesi berikutnya.
