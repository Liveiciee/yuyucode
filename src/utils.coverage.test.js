/* eslint-disable */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generateDiff } from './utils.js';

const THRESHOLD = 2000;

// Helper buat array baris unik
const makeLines = (prefix, n, start = 0) =>
  Array.from({ length: n }, (_, i) => `${prefix}_${start + i}`);

// ── advanceContext: pastikan line number akurat saat ada baris context ─────────
describe('generateDiff — advanceContext (context lines)', () => {
  it('line number tepat saat perubahan bukan di baris pertama', () => {
    const original = 'ctx1\nctx2\nold_line\nctx4';
    const patched  = 'ctx1\nctx2\nnew_line\nctx4';
    const diff = generateDiff(original, patched);
    expect(diff).toContain('- L3: old_line');
    expect(diff).toContain('+ L3: new_line');
  });

  it('line number akurat saat perubahan di tengah file panjang', () => {
    const lines   = makeLines('baris', 20);
    const patched = [...lines];
    patched[9] = 'DIUBAH';
    const diff = generateDiff(lines.join('\n'), patched.join('\n'));
    expect(diff).toContain('- L10: baris_9');
    expect(diff).toContain('+ L10: DIUBAH');
  });
});

// ── segmentedDiff — Guard 1: anchor ratio rendah → fallback Myers ─────────────
describe('segmentedDiff — Guard 1 (anchor ratio rendah)', () => {
  it('fallback ke Myers saat baris mayoritas duplikat', () => {
    // Semua baris di A dan B beda → 0 anchor bersama → ratio = 0 < 30%
    const aLines = makeLines('old', THRESHOLD + 100);
    const bLines = makeLines('new', THRESHOLD + 100);
    const diff = generateDiff(aLines.join('\n'), bLines.join('\n'));
    // Harus tetap mendeteksi perubahan meski fallback
    expect(diff).toBeTruthy();
    expect(diff).toContain('baris lebih');
  });
});

// ── segmentedDiff — Guard 2: chunk gap > 500 → fallback Myers ────────────────
describe('segmentedDiff — Guard 2 (chunk gap besar)', () => {
  it('fallback ke Myers saat jarak antar anchor lebih dari 500 baris', () => {
    // File A: shared_0..599, kemudian only_a_600..1100, lalu shared_1101..2099
    // File B: shared_0..599, kemudian only_b_600..1100, lalu shared_1101..2099
    // Anchor terakhir di 599, anchor berikutnya di 1101 → gap = 502 > 500
    const size    = THRESHOLD + 100;
    const aShared = makeLines('shared', 600);
    const bShared = makeLines('shared', 600);   // sama persis
    const aOnly   = makeLines('only_a', 502);
    const bOnly   = makeLines('only_b', 502);
    const aShared2 = makeLines('shared', size - 1102, 600);
    const bShared2 = makeLines('shared', size - 1102, 600);

    const a = [...aShared, ...aOnly, ...aShared2].join('\n');
    const b = [...bShared, ...bOnly, ...bShared2].join('\n');

    const diff = generateDiff(a, b);
    expect(diff).toBeTruthy();
  });
});

// ── segmentedDiff — jalur normal (file besar, anchor cukup) ──────────────────
describe('segmentedDiff — jalur normal (large file)', () => {
  it('mendeteksi perubahan kecil di file besar', () => {
    const lines   = makeLines('line', THRESHOLD + 50);
    const patched = [...lines];
    patched[5]  = 'UBAH_AWAL';
    patched[THRESHOLD + 49] = 'UBAH_AKHIR';
    const diff = generateDiff(lines.join('\n'), patched.join('\n'));
    expect(diff).toContain('UBAH_AWAL');
  });

  it('return kosong kalau file besar identik', () => {
    const lines = makeLines('same', THRESHOLD + 10);
    const text  = lines.join('\n');
    expect(generateDiff(text, text)).toBe('');
  });
});
