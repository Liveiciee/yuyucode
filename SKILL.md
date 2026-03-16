# YuyuCode SKILL.md

## Tentang Project
- React + Vite + Capacitor
- Entry point: src/App.jsx (582 baris)
- Build via GitHub Actions — tidak bisa npm run build lokal
- Server lokal: ~/yuyu-server.js (jalankan sebelum pakai)

## Struktur Penting
- src/App.jsx → UI + logic utama
- android/ → jangan edit manual
- .github/workflows/build-apk.yml → CI/CD

## Aturan Project
- Setiap fitur baru → update README.md
- Jangan edit folder android/ tanpa konfirmasi
- Commit message: feat/fix/chore/docs: deskripsi
