---
name: add-feature
description: Pola baku menambah fitur baru ke YuyuCode — slash command baru, panel baru, hook baru, atau action type baru. Use when menambah command, fitur UI, atau extend agent loop.
---

# Tambah Fitur Baru ke YuyuCode

## Tambah slash command baru

**1. Handler** di `src/hooks/useSlashCommands.js` — tambah `else if` baru:
```js
} else if (base==='/namacommand') {
  const arg = parts.slice(1).join(' ').trim();
  if (!arg) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /namacommand <arg>',actions:[]}]); return; }
  setLoading(true);
  // ... logic
  setLoading(false);
}
```

**2. Daftarkan** di `src/constants.js` array `SLASH_COMMANDS`:
```js
{ cmd:'/namacommand', desc:'Deskripsi singkat' },
```

**3. Tambah ke README.md** di tabel slash commands kategori yang sesuai.

## Tambah panel baru (BottomSheet)

**1. State** di `src/hooks/useUIStore.js`:
```js
const [showNamaPanel, setShowNamaPanel] = useState(false);
// expose di return
```

**2. Render** di `src/App.jsx` setelah panel lain:
```jsx
{ui.showNamaPanel&&(
  <BottomSheet onClose={()=>ui.setShowNamaPanel(false)}>
    <div style={{padding:'0 16px 8px',flex:1,...}}>
      {/* konten panel */}
    </div>
  </BottomSheet>
)}
```

**3. Trigger** dari slash command atau tombol di header.

## Tambah action type baru ke agent loop

**1. Handler** di `src/utils.js` fungsi `executeAction`:
```js
if (a.type === 'nama_action') {
  const r = await callServer({ type: 'nama_action', ...a });
  return r;
}
```

**2. Server handler** di `~/yuyu-server.js` fungsi `handle()`:
```js
if (type === 'nama_action') {
  // logic
  return { ok: true, data: hasil };
}
```

**3. Tambah ke `BASE_SYSTEM`** di `src/constants.js` agar AI tahu formatnya:
```
### Nama action
\`\`\`action
{"type":"nama_action","param":"value"}
\`\`\`
```

**4. Permission** di `src/features.js` `DEFAULT_PERMISSIONS`:
```js
nama_action: true,  // atau false kalau destruktif
```

## Checklist sebelum push
- [ ] Slash command terdaftar di `SLASH_COMMANDS` constant
- [ ] README.md diupdate
- [ ] `npm run lint` 0 errors
- [ ] `npx vitest run` masih pass
