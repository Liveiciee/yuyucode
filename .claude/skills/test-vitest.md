---
name: test-vitest
description: Tulis dan jalankan unit test untuk YuyuCode menggunakan Vitest v1. Use when membuat test baru, debug test gagal, atau generate test untuk file tertentu.
---

# Test dengan Vitest v1

## Jalankan test
```action
{"type":"exec","command":"npx vitest run 2>&1"}
```
Atau generate otomatis untuk file tertentu:
```
/test src/api.js
/test src/utils.js
```

## Struktur test yang benar

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('nama modul', () => {
  it('happy path', () => { ... });
  it('edge case: input kosong', () => { ... });
  it('error case: network gagal', () => { ... });
});
```

## Aturan kritis proyek ini

1. **Jangan override `global.TextDecoder`** → infinite recursion. Node 24 sudah punya native.
2. **Jangan upgrade ke vitest v4** → crash silent di Termux ARM64. Tetap di `vitest@1`.
3. Mock fetch dengan `vi.stubGlobal`:
```js
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true, status: 200,
  body: { getReader: () => ... },
  headers: { get: () => null },
}));
```

## Mock SSE stream (untuk test api.js)

```js
function makeSSEStream(chunks) {
  const lines = chunks.map(c => `data: ${JSON.stringify({choices:[{delta:{content:c}}]})}\n`);
  lines.push('data: [DONE]\n');
  const encoded = lines.map(l => new TextEncoder().encode(l));
  let i = 0;
  return { getReader: () => ({
    read: async () => i < encoded.length
      ? { done: false, value: encoded[i++] }
      : { done: true },
    releaseLock: () => {},
  })};
}
```

## Coverage yang wajib ada

Untuk setiap fungsi di `utils.js` dan `api.js`:
- Input normal → output benar
- Input kosong / null → tidak throw
- Network error → error message bermakna

## File test yang sudah ada
- `src/api.test.js` — test `readSSEStream`, `askCerebrasStream`
- `src/utils.test.js` — test `parseActions`, `executeAction`, `resolvePath`

Tambah test baru di file yang sudah ada, jangan buat file duplikat.
