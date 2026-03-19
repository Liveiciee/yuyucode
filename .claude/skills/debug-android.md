---
name: debug-android
description: Debug crash, blank screen, build error, atau masalah Capacitor/Termux di YuyuCode. Use when app crash, APK tidak jalan, WebView error, plugin tidak berfungsi, atau CI build gagal.
---

# Debug Android / Termux

## Urutan diagnosis

### App crash / blank screen
```action
{"type":"exec","command":"npx cap run android 2>&1 | tail -30"}
```
Lalu cek logcat:
```action
{"type":"exec","command":"adb logcat -s chromium:E | head -50"}
```

### CI build gagal
- Cek `.github/workflows/build-apk.yml` — jangan ubah tanpa konfirmasi
- Warning `set-output deprecated`, `flatDir`, `punycode deprecated` → **abaikan**, dari third-party
- Keystore error → encode ulang: `openssl base64 < ~/yuyucode-jks.jks | tr -d '\n'` (bukan `base64 -w 0`)

### Plugin Capacitor tidak jalan
```action
{"type":"exec","command":"npx cap sync android 2>&1"}
```
Jangan edit `android/` manual — selalu lewat `npx cap sync`.

### npm/node error di Termux
- `Illegal instruction` saat build → JANGAN `npm run build` lokal, push ke CI
- `rollup` error → pastikan `"overrides": {"rollup": "npm:@rollup/wasm-node"}` ada di `package.json`
- `vitest` crash silent → pastikan pakai `vitest@1`, bukan v4

### Server lokal tidak jalan
```action
{"type":"exec","command":"node ~/yuyu-server.js &"}
```
Jalankan dari `~`, bukan dari folder project. Port: HTTP 8765, WS 8766.

### WebSocket disconnect
- File watcher / Terminal streaming pakai WS 8766
- Jika `ws` tidak tersedia: `npm install -g ws`

## Checklist sebelum push
- [ ] `npm run lint` → 0 errors (warnings boleh)
- [ ] `npx vitest run` → semua pass
- [ ] `yuyu-server.js` jalan
- [ ] `package.json` masih ada rollup override
