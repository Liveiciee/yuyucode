# Troubleshooting

## Server Issues

### ❌ `yuyu-server tidak dapat dijangkau`

The agent loop checks server health before every first iteration. If it fails:

```bash
# Check if server is running
curl http://localhost:8765/ping

# Start it
node ~/yuyu-server.js &

# Or use the alias if you set one up
yuyu-server-start
```

**Why it dies:** Android's memory manager kills background Termux processes under memory pressure. Mitigations:
```bash
termux-wake-lock          # acquire wakelock
```
Also disable battery optimisation for Termux in Android Settings → Apps → Termux → Battery.

---

### ❌ Agent loop stops mid-task

Likely causes in order:

1. **Server killed** — `curl localhost:8765/ping`. If no response, restart.
2. **Rate limit** — UI shows countdown timer. Wait or switch model with `/model`.
3. **MAX_ITER reached** — default is 6. Use `/effort deep` for complex tasks (max 10).
4. **Agent returned `DONE`** — expected. The loop exits cleanly when the agent decides the task is complete.
5. **`patch_file` old_str mismatch** — agent couldn't find the exact string to patch. It will retry after re-reading the file.

---

### ❌ `patch_file GAGAL` — exact match not found

The 3-fallback strategy failed. Usually means the file was modified between the agent reading it and applying the patch. The loop sends the failure back to the agent:

```
patch_file GAGAL di src/api.js: string not found

Cek old_str — harus exact match. Coba baca ulang bagian file yang relevan lalu patch lagi.
```

The agent will re-read the file and retry. If it keeps failing, the file might have unusual whitespace or encoding — open it in the editor and check.

---

## Build Issues

### ❌ `npm run build` fails locally

Expected — local builds are not supported. The Vite build is only for CI (APK production). Use `npm run dev` for local development.

### ❌ CI build fails: `Illegal instruction`

```
vitest@4 is installed — must be vitest@3
```

Check `package.json`:
```json
"vitest": "^3.x.x"   ✅
"vitest": "^4.x.x"   ❌ — crashes ARM64
```

Downgrade: `npm install vitest@3 --save-dev`

### ❌ APK CI build fails: `npm ci` error — lock file out of sync

```bash
# Fix locally in Termux
npm install
node yugit.cjs "chore: update package-lock"
```

### ❌ APK not created after `release:` commit

Check the commit message format — it must start with exactly `release:`:

```bash
# Correct
node yugit.cjs "release: v4.3 — description"

# Wrong — no APK will be created
node yugit.cjs "Release v4.3"
node yugit.cjs "feat: release v4.3"
```

---

## Editor Issues

### AI ghost text not appearing

1. Check `yc_ghosttext` is enabled in `/config`
2. Check API keys are set — ghost text uses `llama3.1-8b` on Cerebras
3. Rate limit on Cerebras will suppress ghost text — wait for countdown

### Vim mode not working

Check `yc_vim` in `/config`. Note: `:wq` saves and sets the file as clean. `:q!` discards changes.

### TypeScript LSP slow to start

`@valtown/codemirror-ts` loads the TypeScript language server on first activation. Takes 1–3 seconds on ARM64. Disable `yc_tslsp` if not needed — it has a measurable startup cost.

---

## Memory Issues

### Memories not persisting between sessions

Check Capacitor Preferences storage isn't being cleared. Memory is stored at key `yc_memories`. If Android is clearing app data aggressively, try:
```bash
/amemory   # verify memories exist in current session
```

### Agent ignoring YUYU.md rules

`YUYU.md` is sliced to 2000 characters in `buildSystemPrompt()`. If your file is longer, the most important rules must be at the top. Check with:
```bash
/rules   # shows current YUYU.md content
```

---

## Test Issues

### Tests passing locally but failing in CI

Almost always the `isolate: false` issue — `vi.mock()` state leaking between files. Ensure `vitest.config.js` does not have `isolate: false`.

### `global.TextDecoder` override causing infinite recursion

Do not override `global.TextDecoder` in any test file. This causes infinite recursion in Node 24. Remove the override.

---

## Known Issues

From `.yuyu/handoff.md`:

- **Brightness overshoots at mid-range** — gamma curve slightly aggressive at ~15% brightness
- **CodeMirror bundle is 4.5MB** — candidate for dynamic import to reduce initial load time

These are tracked but not yet fixed.
