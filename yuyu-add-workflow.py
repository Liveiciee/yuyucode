#!/usr/bin/env python3
# Append workflow section to YUYU.md

addition = """
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
"""

with open('YUYU.md', 'r') as f:
    content = f.read()

if 'Collaboration Workflow' not in content:
    with open('YUYU.md', 'w') as f:
        f.write(content + addition)
    print('✅ YUYU.md updated')
else:
    print('⚠ Already exists, skip')
