# YUYU.md — Project Rules
> YuyuCode project-specific constraints. Dibaca Yuyu di setiap sesi.

## Coding Standards
- Gunakan React hooks, bukan class components
- State management: useState + props passing (tidak ada Redux/Zustand)
- File naming: camelCase untuk hooks (useXxx.js), PascalCase untuk components (.jsx)
- Tidak ada TypeScript — project ini pure JavaScript + JSX
- Komentar penting pakai `// ──` style (lihat codebase existing)

## Architecture Decisions
- Agent loop ada di `useAgentLoop.js` — jangan pecah ke file lain
- Semua slash commands di `useSlashCommands.js` — satu file, pakai else-if chain
- Theme system: token-based, zero hardcoded colors di component JSX
- Server communication: selalu lewat `callServer()` di `api.js`
- No npm build lokal — Vite build hanya di CI (ARM64 constraint)

## Forbidden Patterns
- JANGAN `npm run build` lokal — crash di Termux ARM64
- JANGAN upgrade vitest ke v4+ — crash silent di ARM64
- JANGAN hapus `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di package.json
- JANGAN override `global.TextDecoder` di test files — infinite recursion Node 24
- JANGAN edit folder `android/` manual — di-generate Capacitor

## Preferred Libraries
- Code editor: CodeMirror 6
- Terminal: xterm.js
- File search: Fuse.js
- Diff: `diff` library (Myers algorithm)
- Testing: vitest@1 (bukan v4)

## Commands
- Dev: `npm run dev` (port 5173)
- Test: `npx vitest run` (harus 546/546 pass sebelum commit)
- Lint: `npm run lint` (harus 0 problems)
- Bench: `npm run bench`
- Deploy: `node yugit.cjs "feat: ..."`
- Release: `node yugit.cjs "release: vX.Y — deskripsi"`
