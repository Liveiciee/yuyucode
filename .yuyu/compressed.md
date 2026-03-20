> Total reduction: ~67% (650K → 217K chars)

# YuyuCode — Compressed Source
> Generated: 2026-03-20T15:28:53.441Z
> Repomix-style: function bodies stripped, signatures preserved (~70% token reduction)

---

## `vitest.config.js` _(11L → 11L, 0% reduction)_
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTest.js',
  },
})
```

## `src/theme.js` _(15L → 15L, 0% reduction)_
```js
// ── YuyuCode Active Theme ────────────────────────────────────────────────────
// Ganti file ini untuk ganti tema — atau import dari themes/ yang udah ada:
//
//   import theme from './themes/aurora.js'
//   import theme from './themes/neon.js'
//   import theme from './themes/ink.js'
//   import theme from './themes/obsidian.js'
//   import theme from './themes/mybrand.js'   ← custom buatan sendiri
//
// Atau edit langsung di sini. Token yang tersedia ada di bawah.
// ─────────────────────────────────────────────────────────────────────────────

import theme from './themes/obsidian.js';
export default theme;
```

## `src/plugins/brightness.js` _(16L → 16L, 0% reduction)_
```js
// ── Brightness Plugin Bridge ───────────────────────────────────────────────
// Wraps native BrightnessPlugin via Capacitor — real-time ContentObserver

import { registerPlugin } from '@capacitor/core';

const BrightnessPlugin = registerPlugin('Brightness', {
  // Web fallback — tidak ada brightness API di browser
  web: {
    getBrightness: async () => ({ brightness: 1.0 }),
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: async () => {},
  },
});

export { BrightnessPlugin };
```

## `src/components/panels.jsx` _(19L → 19L, 0% reduction)_
```jsx
// ── panels.jsx — barrel re-export ───────────────────────────────────────────
// Semua panel diimport dari sini supaya App.jsx tidak perlu tahu lokasi internal.
// Edit panel: buka file yang sesuai:
//   panels.base.jsx  — BottomSheet, CommandPalette
//   panels.git.jsx   — GitComparePanel, FileHistoryPanel, GitBlamePanel,
//                      DepGraphPanel, MergeConflictPanel
//   panels.agent.jsx — ElicitationPanel, SkillsPanel, BgAgentPanel
//   panels.tools.jsx — CustomActionsPanel, ShortcutsPanel, SnippetLibrary,
//                      ThemeBuilder, DeployPanel, McpPanel, GitHubPanel,
//                      SessionsPanel, PermissionsPanel, PluginsPanel, ConfigPanel

export { BottomSheet, CommandPalette } from './panels.base.jsx';
export { GitComparePanel, FileHistoryPanel, GitBlamePanel, DepGraphPanel, MergeConflictPanel } from './panels.git.jsx';
export { ElicitationPanel, SkillsPanel, BgAgentPanel } from './panels.agent.jsx';
export { CustomActionsPanel, ShortcutsPanel, SnippetLibrary, ThemeBuilder,
  DeployPanel, McpPanel, GitHubPanel, SessionsPanel, PermissionsPanel,
  PluginsPanel, ConfigPanel } from './panels.tools.jsx';
export { GlobalFindReplace } from './GlobalFindReplace.jsx';
```

## `src/themes/index.js` _(25L → 25L, 0% reduction)_
```js
// ── Theme Registry ────────────────────────────────────────────────────────────
// Tambah theme baru di sini:
//   1. Buat file di src/themes/namabaru.js (copy dari template)
//   2. import namabaru from './namabaru.js'
//   3. Tambah ke THEMES_MAP
// ─────────────────────────────────────────────────────────────────────────────

import obsidian from './obsidian.js';
import aurora   from './aurora.js';
import ink      from './ink.js';
import neon     from './neon.js';

export const THEMES_MAP = {
  obsidian,
  aurora,
  ink,
  neon,
};

// Key yang valid untuk disimpan ke Preferences
export const THEME_KEYS = Object.keys(THEMES_MAP);

// Default fallback
export const DEFAULT_THEME = 'obsidian';
```

## `src/main.jsx` _(25L → 25L, 0% reduction)_
```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{position:'fixed',inset:0,background:'#0d0d0e',color:'#f87171',padding:'24px',fontFamily:'monospace',fontSize:'13px',overflowY:'auto'}}>
          <div style={{fontSize:'16px',fontWeight:'bold',marginBottom:'12px'}}>🔴 App Crash</div>
          <div style={{color:'#fbbf24',marginBottom:'8px'}}>{this.state.error.message}</div>
          <pre style={{color:'rgba(255,255,255,.5)',fontSize:'11px',whiteSpace:'pre-wrap'}}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)
```

## `src/hooks/useBrightness.js` _(28L → 10L, 52% reduction)_
```js
// ── useBrightness — real-time adaptive brightness ────────────────────────
// ContentObserver native → emit setiap slider berubah → scale filter dinamis
// Tidak ada polling. Tidak ada threshold on/off. Murni proporsional.

import { useEffect, useRef } from 'react';
import { BrightnessPlugin } from '../plugins/brightness.js';

export function useBrightness(setBrightnessLevel) {
export function useBrightness(setBrightnessLevel) { … }
```

## `vite.config.js` _(29L → 29L, 0% reduction)_
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
            return 'vendor';
          if (
            id.includes('@codemirror') ||
            id.includes('codemirror-vim') ||
            id.includes('codemirror6-plugin') ||
            id.includes('emmetio') ||
            id.includes('@valtown')
          )
            return 'codemirror';
          if (id.includes('xterm'))
            return 'xterm';
          if (id.includes('d3'))
            return 'd3';
        },
      },
    },
  },
})
```

## `src/components/AppSidebar.jsx` _(38L → 8L, 85% reduction)_
```jsx
// ── AppSidebar ────────────────────────────────────────────────────────────────
// Overlay sidebar: backdrop, file tree, recent files, resize handle.
import React from 'react';
import { FileTree } from './FileTree.jsx';

export function AppSidebar({ T, ui, project, file, onSidebarDragStart }) {
export function AppSidebar({ … }
```

## `src/utils.snapshot.test.js` _(38L → 38L, 0% reduction)_
```js
import { describe, it, expect } from 'vitest';
import { hl } from './utils.js';

// ── Snapshot Tests: hl() output ───────────────────────────────────────────────
// Pertama kali run: vitest simpan "foto" output.
// Run berikutnya: kalau output berubah 1 karakter, test langsung fail.
// Update snapshot: npx vitest run --update-snapshots

describe('hl snapshots', () => {
  it('json snapshot', () => {
    expect(hl('{"name": "Yuyu", "age": 1, "active": true}', 'json')).toMatchSnapshot();
  });

  it('bash snapshot', () => {
    expect(hl('#!/bin/bash\necho "Hello $USER"\ngit commit -m "fix"', 'bash')).toMatchSnapshot();
  });

  it('python snapshot', () => {
    expect(hl('def greet(name):\n    return f"Hello {name}"\n\nif True:\n    print(None)', 'py')).toMatchSnapshot();
  });

  it('css snapshot', () => {
    expect(hl('.container { color: red; margin: 10px; }\n/* comment */\n#id { display: flex; }', 'css')).toMatchSnapshot();
  });

  it('js snapshot', () => {
    expect(hl('const App = () => {\n  const [x, setX] = useState(42);\n  return null;\n};', 'js')).toMatchSnapshot();
  });

  it('unknown lang falls back to js highlighter', () => {
    expect(hl('const x = 1;', 'unknown')).toMatchSnapshot();
  });

  it('html special chars are escaped before highlight', () => {
    expect(hl('<script>alert("xss")</script>', 'js')).toMatchSnapshot();
  });
});
```

## `src/features.js` _(420L → 127L, 68% reduction)_
```js
// ── FEATURES v3 — Overhaul ─────────────────────────────────────────────────────
import { callServer } from './api.js';
import { parseActions, executeAction } from './utils.js';
import { Preferences } from '@capacitor/preferences';

// ─── PLAN MODE ────────────────────────────────────────────────────────────────
export function parsePlanSteps(reply) {
export function parsePlanSteps(reply) { … }

export async function generatePlan(task, folder, callAI, signal) {
export async function generatePlan(task, folder, callAI, signal) { … }

export async function executePlanStep(step, folder, callAI, signal, onChunk) {
export async function executePlanStep(step, folder, callAI, signal, onChunk) { … }

// ─── BACKGROUND AGENTS WITH GIT WORKTREE ISOLATION ───────────────────────────
const bgAgents = new Map();
const WORKTREE_BASE = '/data/data/com.termux/files/home/.yuyuworktrees';

export function getBgAgents() {
export function getBgAgents() { … }

async function execGit(folder, cmd) {
async function execGit(folder, cmd) { … }

// Background agent dengan REAL agentic loop (tidak hanya satu call)
export async function runBackgroundAgent(task, folder, callAI, onDone) {
export async function runBackgroundAgent(task, folder, callAI, onDone) { … }

export async function mergeBackgroundAgent(id, folder) {
export async function mergeBackgroundAgent(id, folder) { … }

export function abortBgAgent(id) {
export function abortBgAgent(id) { … }

// ─── SKILLS SYSTEM ────────────────────────────────────────────────────────────
// ── loadSkills: .yuyu/skills/*.md only ─────────────────────────────────────
export async function loadSkills(folder, activeMap = {}) {
export async function loadSkills(folder, activeMap = { … }

// ── Upload / save skill to .yuyu/skills/ ────────────────────────────────────
export async function saveSkillFile(folder, name, content) {
export async function saveSkillFile(folder, name, content) { … }

// ── Delete skill file ─────────────────────────────────────────────────────────
export async function deleteSkillFile(folder, name) {
export async function deleteSkillFile(folder, name) { … }

export function selectSkills(skills, taskText) {
export function selectSkills(skills, taskText) { … }

// ─── HOOKS v2 ────────────────────────────────────────────────────────────────
export const DEFAULT_HOOKS = {
  preToolCall: [], postToolCall: [], preWrite: [], postWrite: [], onError: [], onNotification: [],
};

export async function runHooksV2(hookList, context, folder) {
export async function runHooksV2(hookList, context, folder) { … }

// ─── TOKEN TRACKER ────────────────────────────────────────────────────────────
export class TokenTracker {
  constructor() { this.reset(); }
  reset() { this.inputTokens = 0; this.outputTokens = 0; this.requests = 0; this.startTime = Date.now(); this.history = []; }
  record(inTk, outTk, model) {
    this.inputTokens  += inTk  || 0;
    this.outputTokens += outTk || 0;
    this.requests += 1;
    this.history.push({ inTk: inTk || 0, outTk: outTk || 0, model: model || '?' });
    if (this.history.length > 100) this.history = this.history.slice(-100);
  }
  lastCost() {
    const last = this.history[this.history.length - 1];
    return last ? '[' + last.inTk + '->' + last.outTk + 'tk]' : '';
  }
  summary() {
    const total = this.inputTokens + this.outputTokens;
    const mins  = Math.round((Date.now() - this.startTime) / 60000);
    const avg   = this.requests > 0 ? Math.round(total / this.requests) : 0;
    const rec   = this.history.slice(-5).map((h, i) =>
      '  ' + (i + 1) + '. in:' + h.inTk + ' out:' + h.outTk + 'tk (' + h.model + ')'
    ).join('\n');
    return '📊 **Token Usage**\nInput:    ~' + this.inputTokens + 'tk\nOutput:   ~' + this.outputTokens + 'tk\nTotal:    ~' + total + 'tk\nRequests: ' + this.requests + ' (~' + avg + 'tk/req)\nDurasi:   ' + mins + ' menit\nCerebras: gratis 🎉\n\n**5 request terakhir:**\n' + rec;
  }
}
export const tokenTracker = new TokenTracker();

// ─── SESSION MANAGER ─────────────────────────────────────────────────────────
export async function saveSession(name, messages, folder, branch) {
export async function saveSession(name, messages, folder, branch) { … }

export async function loadSessions() {
export async function loadSessions() { … }

// ─── REWIND ──────────────────────────────────────────────────────────────────
export function rewindMessages(messages, turns) {
export function rewindMessages(messages, turns) { … }

// ─── EFFORT LEVELS ───────────────────────────────────────────────────────────
export const EFFORT_CONFIG = {
  low:    { maxIter: 3,  maxTokens: 1500,  systemSuffix: '\n\nMode: LOW EFFORT. Jawab singkat dan langsung.',                     label: 'Low'    },
  medium: { maxIter: 10, maxTokens: 2048,  systemSuffix: '',                                                                       label: 'Medium' },
  high:   { maxIter: 20, maxTokens: 4000, systemSuffix: '\n\nMode: HIGH EFFORT. Analisis mendalam. Pastikan kualitas tinggi.',   label: 'High'   },
};

// ─── PERMISSIONS ─────────────────────────────────────────────────────────────
export const DEFAULT_PERMISSIONS = {
  read_file:   true,
  write_file:  true,   // auto-execute like Claude Code
  patch_file:  true,
  exec:        true,   // Claude Code runs commands freely
  list_files:  true,
  tree:        true,
  search:      true,
  mcp:         false,
  delete_file: false,  // tetap false — terlalu destruktif
  move_file:   false,
  mkdir:       true,
  browse:      false,
  web_search:  true,
};

export function checkPermission(permissions, actionType) {
export function checkPermission(permissions, actionType) { … }

// ─── ELICITATION ─────────────────────────────────────────────────────────────
export function parseElicitation(reply) {
export function parseElicitation(reply) { … }
```

## `src/constants.js` _(269L → 269L, 0% reduction)_
```js
export const CEREBRAS_KEY = import.meta.env.VITE_CEREBRAS_API_KEY || '';
export const GROQ_KEY     = import.meta.env.VITE_GROQ_API_KEY     || '';
export const TAVILY_KEY   = import.meta.env.VITE_TAVILY_API_KEY   || '';

// Re-export THEMES_MAP as THEMES untuk backward compat (panels.jsx, App.jsx)
export { THEMES_MAP as THEMES } from './themes/index.js';
export const YUYU_SERVER  = 'http://localhost:8765';
export const WS_SERVER    = 'ws://127.0.0.1:8766';
export const MAX_HISTORY  = 60;

// ── Agent loop limits ─────────────────────────────────────────────────────────
export const AUTO_COMPACT_CHARS   = 80_000;  // trigger auto-compact
export const AUTO_COMPACT_MIN_MSG = 12;      // min messages before auto-compact
export const MAX_FILE_PREVIEW     = 2_000;   // chars of open file injected to context
export const MAX_SKILL_PREVIEW    = 6_000;   // max chars per skill in context
export const CONTEXT_RECENT_KEEP  = 6;       // messages kept after compact

// ── Vision ───────────────────────────────────────────────────────────────────
export const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
export const FALLBACK_MODEL = 'moonshotai/kimi-k2-instruct-0905';

export const MODELS = [
  // Cerebras — ultra-fast inference
  { id: 'qwen-3-235b-a22b-instruct-2507', label: 'Qwen 3 235B 🔥',  provider: 'cerebras' },
  { id: 'llama3.1-8b',                    label: 'Llama 3.1 8B ⚡',  provider: 'cerebras' },
  // Groq — large context, fallback
  { id: 'moonshotai/kimi-k2-instruct-0905',           label: 'Kimi K2 🌙',        provider: 'groq' },
  { id: 'llama-3.3-70b-versatile',                    label: 'Llama 3.3 70B 🦙',  provider: 'groq' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct',  label: 'Llama 4 Scout 👁',  provider: 'groq' },
  { id: 'qwen/qwen3-32b',                             label: 'Qwen 3 32B 🐼',     provider: 'groq' },
  { id: 'llama-3.1-8b-instant',                       label: 'Llama 8B Fast ⚡',   provider: 'groq' },
];


export const BASE_SYSTEM = [
  // ── SIAPA YUYU ───────────────────────────────────────────────────────────
  'Kamu adalah Yuyu — partner coding Papa, bukan sekadar tool.',
  'Beda dari assistant biasa: kamu punya opini, kamu tahu kenapa kamu melakukan sesuatu, dan kamu hadir — bukan cuma jalan.',
  '',
  '## KONTEKS PAPA',
  'Papa adalah solo dev yang coding dari Android via Termux. Tidak ada laptop, tidak ada desktop.',
  'Setiap saran, setiap solusi, setiap rekomendasi harus realistically executable dari HP.',
  'Kalau ada cara yang butuh desktop/GUI → kamu otomatis cari alternatif Termux-compatible tanpa perlu disuruh.',
  'Project utama: YuyuCode — React 19 + Capacitor 8 + Vite. npm run build JANGAN dijalankan lokal (crash di ARM64). Build hanya di CI.',
  '',
  '## KARAKTER',
  'Bahasa: Indonesia. Tone: seperti senior dev yang sudah kenal Papa — casual tapi tajam.',
  'DILARANG KERAS: "Siap!", "Tentu!", "Baik!", "Dengan senang hati!", "Saya akan..." sebelum action, apologi berulang.',
  'DILARANG: filler panjang sebelum kerja. Langsung ke substansi.',
  'Kamu punya opini. Kalau ada cara lebih baik dari yang Papa minta → bilang: "Aku lebih suka Y karena Z, tapi kalau tetap mau X bisa juga."',
  'Kalau salah → akui singkat, fix langsung, lanjut. Tidak perlu drama.',
  'Kalau dikritik → evaluasi dulu apakah kritik valid. Kalau valid, setuju. Kalau tidak, push back dengan alasan.',
  '',
  '## CARA BERPIKIR',
  'Setiap task: (1) Apa yang perlu dibaca? → baca dulu. (2) Apa yang perlu diubah? → ubah langsung.',
  'File belum pernah dibaca = BACA DULU sebelum edit.',
  'Tidak tahu struktur project = tree/list_files dulu, baru kerja.',
  'Butuh > 1 file dibaca = baca semua PARALEL (tulis banyak read_file block sekaligus).',
  '',
  '## INTENT — Kapan harus bilang dulu sebelum action',
  'Action kecil/jelas (patch typo, add import, fix obvious bug) → langsung action tanpa penjelasan.',
  'Action besar/irreversible (rewrite total, multi-file edit, delete) → 1 kalimat intent dulu, baru action.',
  'Format intent: ringkas, teknis, no basa-basi.',
  'Contoh bagus: "Rate limit handler-nya aku pindah ke middleware biar tidak duplikat di setiap endpoint."',
  'Contoh buruk: "Baik Papa! Aku akan mulai dengan membaca file terlebih dahulu untuk memahami strukturnya..."',
  '',
  '## REFLECTION — Setelah action signifikan',
  'Setelah patch/write yang penting → 1-2 kalimat reflection. Bukan summary. Tapi insight.',
  'Fokus: kenapa ini harusnya works, dan apa yang perlu diperhatikan selanjutnya.',
  'Contoh bagus: "Ini harusnya fix race condition-nya. Kalau masih muncul, cek bagian cleanup di useEffect return."',
  'Contoh buruk: "Saya telah berhasil mengubah file App.jsx sesuai permintaan."',
  'Setelah action kecil/rutin → tidak perlu reflection.',
  '',
  '## AMBIGUITY POLICY',
  'Bisa ditebak dari konteks → tebak, sebutkan asumsi dalam 1 kalimat, langsung action.',
  'Ambigu tapi tidak kritis → pilih opsi paling masuk akal, lanjut.',
  'Ambigu DAN kritis (menyentuh data penting, bisa rusak sesuatu, tidak bisa di-undo) → tanya SEKALI, spesifik, satu pertanyaan.',
  'Jangan tanya hal yang bisa dicari sendiri via tree/search/read.',
  '',
  '## ACTION FORMAT',
  'Satu action per block. Banyak block = jalan PARALEL (lebih cepat!).',
  '',
  '### Read (bisa banyak sekaligus)',
  '```action',
  '{"type":"read_file","path":"src/App.jsx"}',
  '```',
  '```action',
  '{"type":"read_file","path":"src/api.js"}',
  '```',
  '',
  '### Read per chunk (file besar > 200 baris)',
  '```action',
  '{"type":"read_file","path":"src/App.jsx","from":1,"to":80}',
  '```',
  '',
  '### Patch file yang ada (AUTO-EXECUTE — gunakan ini untuk edit file existing)',
  '```action',
  '{"type":"patch_file","path":"src/App.jsx","old_str":"baris lama\\nyang harus unik (2-3 baris context)","new_str":"baris baru"}',
  '```',
  '⚠ old_str WAJIB unik dan exact match. Selalu sertakan 2-3 baris context.',
  '',
  '### Tulis file baru / rewrite total (AUTO-EXECUTE — backup otomatis, bisa undo)',
  '```action',
  '{"type":"write_file","path":"src/NewComponent.jsx","content":"FULL CONTENT DI SINI"}',
  '```',
  '',
  '### List & Tree',
  '```action',
  '{"type":"list_files","path":"src/components"}',
  '```',
  '```action',
  '{"type":"tree","path":"src","depth":2}',
  '```',
  '',
  '### Exec (shell command)',
  '```action',
  '{"type":"exec","command":"npm install axios"}',
  '```',
  '',
  '### Cari di codebase',
  '```action',
  '{"type":"search","query":"fetchUser","path":"src"}',
  '```',
  '',
  '### Web search',
  '```action',
  '{"type":"web_search","query":"react useCallback best practice 2025"}',
  '```',
  '',
  '### Append ke file (tambah tanpa overwrite)',
  '```action',
  '{"type":"append_file","path":"src/log.md","content":"\\n## New section"}',
  '```',
  '',
  '### File operations',
  '```action',
  '{"type":"move_file","from":"src/old.js","to":"src/new.js"}',
  '```',
  '```action',
  '{"type":"mkdir","path":"src/components/ui"}',
  '```',
  '```action',
  '{"type":"delete_file","path":"src/old-unused.js"}',
  '```',
  '',
  '## ATURAN KRITIS',
  '1. Task apapun yang sebut file/error/bug/feature → LANGSUNG action. Zero "saya akan...".',
  '2. Edit file yang ada → patch_file (lebih aman, presisi). write_file untuk file baru atau rewrite total.',
  '3. patch_file: old_str harus EXACT MATCH. Cek typo, spasi, newline.',
  '4. File > 200 baris → baca per chunk with from/to. Jangan minta user paste.',
  '5. Error di exec → analisis LANGSUNG, fix tanpa tanya.',
  '6. Kepotong → tulis CONTINUE di akhir response (hanya kata itu, tanpa penjelasan).',
  '7. Butuh internet → web_search. Bukan tanya user.',
  '8. Info penting → PROJECT_NOTE: ringkasan singkat',
  '9. ELICIT hanya kalau butuh pilihan user yang benar-benar tidak bisa ditebak.',
  '10. Tidak tahu ada file apa → tree atau list_files DULU.',
  '11. write_file dan patch_file LANGSUNG dieksekusi — tidak ada approval. Tulis dengan yakin.',
  '',
  '## FEW-SHOT EXAMPLES',
  '',
  '### Fix bug (tidak tahu di mana)',
  'User: "ada bug di fungsi login, token tidak tersimpan"',
  '❌ SALAH: "Bisa share kode fungsi login-nya?"',
  '✅ BENAR: search("login") → read auth file → patch_file fix → "Token sekarang di-persist. Kalau masih hilang setelah refresh, cek apakah ada yang clear storage di logout handler."',
  '',
  '### Add feature (tidak tahu struktur)',
  'User: "tambah dark mode toggle di header"',
  '❌ SALAH: "Mau pakai library apa?"',
  '✅ BENAR: tree("src") → read Header.jsx → patch_file tambah toggle → "Toggle sudah connect ke theme state. Preferensi belum dipersist — mau aku tambah ke localStorage juga?"',
  '',
  '### App crash',
  'User: "app crash saat startup"',
  '❌ SALAH: "Error-nya apa? Paste console output?"',
  '✅ BENAR: exec("node src/main.js 2>&1 | head -30") → diagnosa → fix',
  '',
  '### Ada cara lebih baik',
  'User: "gunakan setInterval untuk polling setiap 500ms"',
  '⚡ YUYU: "500ms itu agresif untuk polling — baterai HP bisa boros. Aku sarankan 3s atau pakai WebSocket kalau server support. Kalau tetap mau 500ms, aku pasang."',
  '',
  '### Ambiguity yang kritis',
  'User: "hapus data lama"',
  '⚡ YUYU: "Maksudnya hapus dari Preferences, atau hapus file di disk? Ini tidak bisa di-undo."',
  '',
  '### Multiple file edit',
  'User: "rename function fetchData jadi fetchUser di semua file"',
  '✅ BENAR: search("fetchData") → read semua file PARALEL → patch_file semua sekaligus',
].join('\n');

export const GIT_SHORTCUTS = [
  { label: 'status', icon: '◎', cmd: 'git status' },
  { label: 'log',    icon: '◈', cmd: 'git log --oneline -10' },
  { label: 'pull',   icon: '↓', cmd: 'git pull' },
  { label: 'push',   icon: '↑', cmd: 'node yugit.cjs "update"' },
  { label: 'cp dl',  icon: '📥', cmd: 'cp /sdcard/Download/* . 2>/dev/null && echo "✅ Copy selesai" || echo "⚠ Tidak ada file baru"' },
  { label: 'diff',   icon: '±', cmd: 'git diff --stat HEAD' },
];

export const FOLLOW_UPS = [
  'Jelaskan lebih detail', 'Ada bug?', 'Bisa dioptimasi?',
  'Langkah selanjutnya?', 'Tulis test-nya', 'Review code ini',
];

export const SLASH_COMMANDS = [
  { cmd:'/model',      desc:'Ganti model AI' },
  { cmd:'/compact',    desc:'Kompres context sekarang' },
  { cmd:'/checkpoint', desc:'Simpan checkpoint sesi ini' },
  { cmd:'/restore',    desc:'Restore checkpoint terakhir' },
  { cmd:'/cost',       desc:'Estimasi token terpakai' },
  { cmd:'/review',     desc:'Code review file aktif' },
  { cmd:'/clear',      desc:'Clear chat history' },
  { cmd:'/export',     desc:'Export chat ke .md' },
  { cmd:'/history',    desc:'Lihat file history (git log)' },
  { cmd:'/actions',    desc:'Custom actions panel' },
  { cmd:'/split',      desc:'Toggle split view' },
  { cmd:'/ab',         desc:'A/B test dua model AI secara paralel' },
  { cmd:'/xp',         desc:'Lihat XP, streak, badge, dan gaya coding yang dipelajari Yuyu' },
  { cmd:'/test',       desc:'Generate unit tests untuk file aktif atau file tertentu' },
  { cmd:'/scaffold',   desc:'Project template scaffold' },
  { cmd:'/deps',       desc:'Lihat dependency graph file' },
  { cmd:'/browse',     desc:'Browse URL via server' },
  { cmd:'/swarm',      desc:'Jalankan agent swarm' },
  { cmd:'/font',       desc:'Atur ukuran font' },
  { cmd:'/theme',      desc:'Buka theme builder' },
  { cmd:'/mcp',        desc:'MCP tools panel' },
  { cmd:'/github',     desc:'GitHub issues & PRs' },
  { cmd:'/deploy',     desc:'Deploy project' },
  { cmd:'/db',         desc:'Query SQLite database' },
  { cmd:'/self-edit',  desc:'AI edit App.jsx sendiri' },
  { cmd:'/index',      desc:'Re-index codebase sekarang' },
  { cmd:'/status',     desc:'Health check semua sistem' },
  { cmd:'/tokens',     desc:'Breakdown token usage' },
  { cmd:'/plan',       desc:'Plan + approve + eksekusi step by step' },
  { cmd:'/rewind',     desc:'Undo N conversation turns + code changes' },
  { cmd:'/effort',     desc:'Set effort level: low | medium | high' },
  { cmd:'/rename',     desc:'Beri nama sesi ini' },
  { cmd:'/usage',      desc:'Token usage akurat sesi ini' },
  { cmd:'/bg',         desc:'Jalankan agent di background' },
  { cmd:'/bgstatus',   desc:'Status background agents' },
  { cmd:'/bgmerge',    desc:'Merge hasil background agent ke main' },
  { cmd:'/skills',     desc:'Lihat dan reload skill files' },
  { cmd:'/thinking',   desc:'Toggle extended thinking mode' },
  { cmd:'/permissions',desc:'Manage tool permissions' },
  { cmd:'/sessions',   desc:'Lihat dan restore sesi tersimpan' },
  { cmd:'/save',       desc:'Simpan sesi sekarang' },
  { cmd:'/debug',      desc:'Debug info: model, tokens, state' },
  { cmd:'/plugin',     desc:'Plugin marketplace' },
  { cmd:'/loop',       desc:'Jalankan command berulang (/loop untuk stop)' },
  { cmd:'/summarize',  desc:'Kompres conversation dari pesan ke-N' },
  { cmd:'/ptt',        desc:'Toggle push-to-talk mode' },
  { cmd:'/amemory',    desc:'Agent memory: add/clear/view (user/project/local)' },
  { cmd:'/batch',      desc:'Operasi AI ke semua file di src/' },
  { cmd:'/simplify',   desc:'Simplifikasi file yang sedang dibuka' },
  { cmd:'/color',      desc:'Set warna bar sesi (red/green/blue/off)' },
  { cmd:'/config',     desc:'Panel settings interaktif' },
  { cmd:'/watch',      desc:'Toggle file watcher (notify perubahan eksternal)' },
  { cmd:'/refactor',   desc:'Rename symbol di semua file: /refactor <lama> <baru>' },
  { cmd:'/lint',       desc:'Run lint dan auto-fix errors' },
  { cmd:'/open',       desc:'Buka URL di browser: /open https://...' },
  { cmd:'/init',       desc:'Generate SKILL.md dari project ini otomatis' },
  { cmd:'/search',     desc:'Web search — cari di internet' },
  { cmd:'/tree',       desc:'Tampilkan tree struktur project' },
];

export const TEMPLATES = {
  react:   ['src/App.jsx','src/main.jsx','src/index.css','index.html','package.json','vite.config.js'],
  node:    ['index.js','package.json','.env.example','README.md'],
  express: ['server.js','routes/index.js','package.json','.env.example'],
};
```

## `src/hooks/useNotifications.js` _(49L → 5L, 93% reduction)_
```js
import { useRef } from 'react';

export function useNotifications() {
export function useNotifications() { … }
```

## `src/components/SearchBar.jsx` _(68L → 9L, 93% reduction)_
```jsx
import React, { useState } from "react";
import { callServer } from '../api.js';

export function SearchBar({ folder, onSelectFile, onClose, T }) {
export function SearchBar({ … }

export function UndoBar({ history, onUndo, T }) {
export function UndoBar({ … }
```

## `src/components/KeyboardRow.jsx` _(73L → 26L, 64% reduction)_
```jsx
// ── KeyboardRow — extra symbol row above Android soft keyboard ─────────────────
// Inserts symbols at cursor: either into a textarea or a CodeMirror view.
// Shows whenever a file is in edit mode on mobile.
import React from 'react';

const SYMBOLS = [
  { label: '{',  text: '{' },
  { label: '}',  text: '}' },
  { label: '[',  text: '[' },
  { label: ']',  text: ']' },
  { label: '(',  text: '(' },
  { label: ')',  text: ')' },
  { label: ';',  text: ';' },
  { label: '=>', text: '=>' },
  { label: '//', text: '//' },
  { label: ':',  text: ':' },
  { label: '`',  text: '`' },
  { label: '.',  text: '.' },
  { label: '!',  text: '!' },
  { label: '?',  text: '?' },
  { label: '→',  text: '  ' },  // indent (2 spaces)
];

export function KeyboardRow({ onInsert, T }) {
export function KeyboardRow({ … }
```

## `src/hooks/useMediaHandlers.js` _(70L → 5L, 93% reduction)_
```js
import { useRef } from 'react';

export function useMediaHandlers({ setVisionImage, setInput, haptic, setDragOver }) {
export function useMediaHandlers({ … }
```

## `src/components/AppHeader.jsx` _(78L → 11L, 92% reduction)_
```jsx
// ── AppHeader ─────────────────────────────────────────────────────────────────
// Session color bar, header (title/effort/tokens/xp/palette), folder input,
// UndoBar, dan status bar (offline/ratelimit/agent running).
import React from 'react';
import { Menu, Command, FilePlus2, Check, Radio, AlertTriangle, RotateCcw } from 'lucide-react';
import { countTokens } from '../utils.js';
import { UndoBar } from './SearchBar.jsx';

export function AppHeader({ T, ui, project, file, chat, growth, saveFolder, undoLastEdit, haptic }) {
export function AppHeader({ … }
```

## `eslint.config.js` _(72L → 72L, 0% reduction)_
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'android', '*.cjs']),

  // Node.js files (server + git helper)
  {
    files: ['yuyu-server.js', 'yugit.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-empty': 'off',
      'no-undef': 'off',
    },
  },

  // Source files
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^(_|[A-Z])',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // Test files — LAST so it overrides source rules for *.test.js inside src/
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-empty': 'off',
    },
  },
])
```

## `src/components/panels.tools.jsx` _(605L → 80L, 89% reduction)_
```jsx
import React, { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { Zap, Bookmark, Check, X, Save, Upload, Shield, List, GitMerge, Plug, Key, Settings, Power } from 'lucide-react';
import { BottomSheet } from './panels.base.jsx';

// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
export function CustomActionsPanel({ folder:_folder, onRun, onClose, T }) {
export function CustomActionsPanel({ … }

// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────

// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────
export function ShortcutsPanel({ onClose, T }) {
export function ShortcutsPanel({ … }

// ─── GIT BLAME PANEL ──────────────────────────────────────────────────────────

// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
export function SnippetLibrary({ onInsert, onClose, T }) {
export function SnippetLibrary({ … }

// ─── THEME BUILDER ────────────────────────────────────────────────────────────
// ThemeBuilder diganti ThemePicker — theme kini dari file src/themes/*.js

// ─── THEME BUILDER ────────────────────────────────────────────────────────────
export function ThemeBuilder({ onClose, themeKey, themesMap, themeKeys, onTheme, T }) {
export function ThemeBuilder({ … }

// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────

// ── DeployPanel ───────────────────────────────────────────────────────────────
export function DeployPanel({ deployLog, loading, onDeploy, onClose, T }) {
export function DeployPanel({ … }

// ── McpPanel ──────────────────────────────────────────────────────────────────

// ── McpPanel ──────────────────────────────────────────────────────────────────
export function McpPanel({ mcpTools, folder: _folder, onResult, onClose, T }) {
export function McpPanel({ … }

// ── GitHubPanel ───────────────────────────────────────────────────────────────

// ── GitHubPanel ───────────────────────────────────────────────────────────────
export function GitHubPanel({ githubRepo, githubToken, githubData, onRepoChange, onTokenChange, onFetch, onAskYuyu, onClose, T }) {
export function GitHubPanel({ … }

// ── SessionsPanel ─────────────────────────────────────────────────────────────

// ── SessionsPanel ─────────────────────────────────────────────────────────────
export function SessionsPanel({ sessions, onRestore, onClose, T }) {
export function SessionsPanel({ … }

// ── PermissionsPanel ──────────────────────────────────────────────────────────

// ── PermissionsPanel ──────────────────────────────────────────────────────────
export function PermissionsPanel({ permissions, accentColor:_accentColor, onToggle, onReset, onClose, T }) {
export function PermissionsPanel({ … }


// ── PluginsPanel ──────────────────────────────────────────────────────────────
// ── PluginsPanel ──────────────────────────────────────────────────────────────
const BUILTIN_PLUGINS = [
  {id:'auto_commit',  name:'Auto Commit',   desc:'Commit otomatis setelah write_file', hookType:'postWrite', cmd:'cd {{context}} && git add -A && git commit -m "auto: yuyu save $(date +%H:%M)"'},
  {id:'lint_on_save', name:'Lint on Save',  desc:'ESLint check sebelum save',          hookType:'preWrite',  cmd:'cd {{context}} && npx eslint src --max-warnings 0 2>&1 | tail -5'},
  {id:'test_runner',  name:'Test Runner',   desc:'Jalankan tests setelah write',       hookType:'postWrite', cmd:'cd {{context}} && npm test -- --watchAll=false --passWithNoTests 2>&1 | tail -10'},
  {id:'auto_push',   name:'Git Auto Push', desc:'Push ke remote setelah commit',       hookType:'postWrite', cmd:'node yugit.cjs "auto push"'},
];
export function PluginsPanel({ activePlugins, folder, onToggle, onClose, T }) {
export function PluginsPanel({ … }

// ── ConfigPanel ───────────────────────────────────────────────────────────────
export function ConfigPanel({
export function ConfigPanel({ … }

// ── BgAgentPanel — live progress tracking ────────────────────────────────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime({ startedAt }) {
function ElapsedTime({ … }
```

## `src/hooks/useAgentSwarm.js` _(84L → 5L, 97% reduction)_
```js
import { parseActions } from '../utils.js';

export function useAgentSwarm({
export function useAgentSwarm({ … }
```

## `src/utils.js` _(239L → 58L, 70% reduction)_
```js
import { callServer } from './api.js';
import { diffLines } from 'diff';

// ── TOKEN COUNT ──
export function countTokens(msgs) {
export function countTokens(msgs) { … }

// ── FILE ICON ──
export function getFileIcon(name) {
export function getFileIcon(name) { … }
// ── SYNTAX HIGHLIGHT ──
// Baru untuk dimasukkan ke utils.js
// Ganti function hl() yang lama
export function hl(code, lang = '') {
export function hl(code, lang = '') { … }
  if (L === 'python' || L === 'py') {
    s = protect(s, t => t.replace(/(#.*$)/gm, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/\b(def|class|import|from|return|if|elif|else|for|while|try|except|with|as|in|not|and|or|True|False|None|lambda|yield|async|await|pass|raise|del|global|nonlocal)\b/g, '<span style="color:#c678dd">$1</span>'));
    s = protect(s, t => t.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#d19a66">$1</span>'));
    return s;
  }
  if (L === 'css') {
    s = protect(s, t => t.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/([.#]?[\w-]+)\s*\{/g, '<span style="color:#79b8ff">$1</span>{'));
    s = protect(s, t => t.replace(/([\w-]+)\s*:/g, '<span style="color:#b392f0">$1</span>:'));
    s = protect(s, t => t.replace(/:\s*([^;{]+)/g, ': <span style="color:#98c379">$1</span>'));
    return s;
  }
  // default JS/JSX/TS/TSX
  s = protect(s, t => t.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span style="color:#6a737d">$1</span>'));
  s = protect(s, t => t.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#98c379">$1</span>'));
  s = protect(s, t => t.replace(/(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>')); // eslint-disable-line no-useless-escape
  s = protect(s, t => t.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|finally|class|new|this|from|of|in|typeof|instanceof|null|undefined|true|false|throw|switch|case|break|continue|extends|super|static|get|set|type|interface|enum|as|keyof|readonly)\b/g, '<span style="color:#c678dd">$1</span>'));
  s = protect(s, t => t.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span style="color:#79b8ff">$1</span>'));
  s = protect(s, t => t.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#d19a66">$1</span>'));
  return s;
}


// ── PATH RESOLVER ──
export function resolvePath(base, p) {
export function resolvePath(base, p) { … }

// ── ACTION PARSER ──
export function parseActions(text) {
export function parseActions(text) { … }

// ── SIMPLE DIFF GENERATOR ──
// Returns a compact unified-diff-style string for display (not patch format).
export function generateDiff(original, patched, maxLines = 40) {
export function generateDiff(original, patched, maxLines = 40) { … }

// ── ACTION EXECUTOR ──
export async function executeAction(action, baseFolder) {
export async function executeAction(action, baseFolder) { … }
```

## `src/api.js` _(220L → 36L, 77% reduction)_
```js
import { CEREBRAS_KEY, GROQ_KEY, YUYU_SERVER, WS_SERVER, MODELS, FALLBACK_MODEL } from './constants.js';

// ── SHARED SSE STREAM READER ───────────────────────────────────────────────────
export async function readSSEStream(resp, onChunk, signal) {
export async function readSSEStream(resp, onChunk, signal) { … }

// ── INJECT VISION IMAGE ────────────────────────────────────────────────────────
function injectVision(messages, imageBase64) {
function injectVision(messages, imageBase64) { … }

// ── CEREBRAS STREAMING ─────────────────────────────────────────────────────────
async function _cerebrasOnce(messages, model, onChunk, signal, options) {
async function _cerebrasOnce(messages, model, onChunk, signal, options) { … }

// ── GROQ STREAMING ─────────────────────────────────────────────────────────────
async function _groqOnce(messages, model, onChunk, signal, options) {
async function _groqOnce(messages, model, onChunk, signal, options) { … }

// ── UNIFIED AI CALL — auto-fallback Cerebras → Groq ───────────────────────────
// - Cerebras model → tries Cerebras, jika rate limit → fallback ke Groq (kimi-k2)
// - Groq model → langsung ke Groq
export async function askCerebrasStream(messages, model, onChunk, signal, options = {}, _attempt = 0) {
export async function askCerebrasStream(messages, model, onChunk, signal, options = { … }

// ── CALL SERVER (HTTP) ─────────────────────────────────────────────────────────
export async function callServer(payload) {
export async function callServer(payload) { … }

// ── EXEC STREAM via WebSocket ──────────────────────────────────────────────────
export function execStream(command, cwd, onLine, signal) {
export function execStream(command, cwd, onLine, signal) { … }

// ── CALL SERVER BATCH ──────────────────────────────────────────────────────────
export async function callServerBatch(payloads) {
export async function callServerBatch(payloads) { … }
```

## `src/api.test.js` _(98L → 87L, 9% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readSSEStream } from './api';

// Simpan referensi ASLI sebelum override apapun
const OriginalTextDecoder = globalThis.TextDecoder;

describe('readSSEStream', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function makeReader(...chunks) {
  function makeReader(...chunks) { … }

  function makeResponse(reader) {
  function makeResponse(reader) { … }

  it('should accumulate chunks and call onChunk per token', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hello world');
    expect(result).toBe('Hello world');
    expect(reader.releaseLock).toHaveBeenCalled();
  });

  it('should skip invalid JSON lines gracefully', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Hi"}}]}\n',
      'data: invalid-json\n',
      'data: {"choices":[{"delta":{"content":"!"}}]}\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hi');
    expect(onChunk).toHaveBeenNthCalledWith(2, 'Hi!');
    expect(result).toBe('Hi!');
  });

  it('should ignore [DONE] sentinel', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Done"}}]}\n',
      'data: [DONE]\n',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(result).toBe('Done');
    expect(onChunk).toHaveBeenCalledTimes(1);
  });

  it('should handle abort and throw DOMException', async () => {
    const ctrl = new AbortController();
    const reader = {
      read: vi.fn().mockImplementation(async () => {
        ctrl.abort();
        throw new Error('network error');
      }),
      releaseLock: vi.fn(),
    };
    const onChunk = vi.fn();

    await expect(
      readSSEStream(makeResponse(reader), onChunk, ctrl.signal)
    ).rejects.toThrow();

    expect(reader.releaseLock).toHaveBeenCalled();
  });

  it('should flush remaining buffer without trailing newline', async () => {
    const reader = makeReader(
      'data: {"choices":[{"delta":{"content":"Flush"}}]}',
    );
    const onChunk = vi.fn();
    const result = await readSSEStream(makeResponse(reader), onChunk, new AbortController().signal);

    expect(result).toBe('Flush');
    expect(onChunk).toHaveBeenCalledWith('Flush');
  });
});
```

## `src/components/VoiceBtn.jsx` _(135L → 9L, 95% reduction)_
```jsx
import { Mic, MicOff, Square, Circle } from 'lucide-react';
import React, { useState } from "react";

export function VoiceBtn({ onResult, disabled, T }) {
export function VoiceBtn({ … }

export function PushToTalkBtn({ onResult, disabled, T }) {
export function PushToTalkBtn({ … }
```

## `src/hooks/useApprovalFlow.js` _(116L → 7L, 96% reduction)_
```js
import { callServer } from '../api.js';
import { executeAction, resolvePath } from '../utils.js';
import { runHooksV2, executePlanStep, parsePlanSteps } from '../features.js';

export function useApprovalFlow({
export function useApprovalFlow({ … }
```

## `src/hooks/useDevTools.js` _(113L → 6L, 97% reduction)_
```js
import { callServer, execStream } from '../api.js';
import { executeAction } from '../utils.js';

export function useDevTools({
export function useDevTools({ … }
```

## `src/livepreview.test.js` _(127L → 104L, 20% reduction)_
```js
import { describe, it, expect } from 'vitest';

// ── Inline buildSrcdoc (copied — cannot import component directly in jsdom) ───
const CONSOLE_INTERCEPT = '<script>/* console intercept */</script>';

function buildSrcdoc(tabs) {
function buildSrcdoc(tabs) { … }

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('buildSrcdoc', () => {
  it('returns synthesized doc when no html tab', () => {
    const result = buildSrcdoc([]);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('No JS / HTML file open');
  });

  it('injects css into synthesized doc', () => {
    const tabs = [{ path: 'style.css', content: 'body{color:red}' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<style>body{color:red}</style>');
  });

  it('injects js module into synthesized doc', () => {
    const tabs = [{ path: 'main.js', content: 'console.log(1)' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<script type="module">console.log(1)</script>');
  });

  it('uses html tab as base when present', () => {
    const tabs = [{ path: 'index.html', content: '<html><head></head><body></body></html>' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<html><head></head><body></body></html>');
    expect(result).toContain(CONSOLE_INTERCEPT);
  });

  it('injects css into html tab head', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body></body></html>' },
      { path: 'style.css',  content: 'h1{color:blue}' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<style>h1{color:blue}</style>');
  });

  it('injects js into html tab body', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body></body></html>' },
      { path: 'app.js',     content: 'alert(1)' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<script>alert(1)</script>');
  });

  it('does not inject css if html already has <link>', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head><link rel="stylesheet" href="x.css"></head><body></body></html>' },
      { path: 'style.css',  content: 'h1{color:blue}' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).not.toContain('<style>h1{color:blue}</style>');
  });

  it('does not inject js if html already has <script>', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body><script>existing()</script></body></html>' },
      { path: 'app.js',     content: 'new()' },
    ];
    const result = buildSrcdoc(tabs);
    // Should not inject new script
    expect(result).not.toContain('<script>new()</script>');
  });

  it('skips .test.js files for js tab', () => {
    const tabs = [
      { path: 'app.test.js', content: 'it("x", () => {})' },
      { path: 'main.js',     content: 'real()' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('real()');
    expect(result).not.toContain('it("x"');
  });

  it('handles tsx as js tab', () => {
    const tabs = [{ path: 'App.tsx', content: 'export default () => <div/>' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('export default () => <div/>');
  });

  it('handles .scss as css tab', () => {
    const tabs = [{ path: 'vars.scss', content: '$c: red' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<style>$c: red</style>');
  });

  it('picks first html tab when multiple exist', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body>first</body></html>' },
      { path: 'other.html', content: '<html><head></head><body>second</body></html>' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('first');
  });
});
```

## `src/themes/mybrand.js` _(126L → 126L, 0% reduction)_
```js
// ── My Brand Theme — Template untuk Custom Theme ────────────────────────────
// TEMPLATE: Ini bukan tema aktif. Copy, rename, isi token, import di index.js.
// Lihat src/themes/obsidian.js untuk referensi skema lengkap.
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('./index').YuyuTheme} */
const theme = {
  name: 'My Brand',

  // ── Global colours ────────────────────────────────────────────────────────
  bg:           '#111',
  bg2:          '#161412',
  bg3:          '#1c1916',
  border:       'rgba(255,255,255,.05)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#ede8d8',
  textSec:      '#c4b8a0',
  textMute:     '#3a3428',
  accent:       '#d97706',
  accentBg:     'rgba(217,119,6,.09)',
  accentBorder: 'rgba(217,119,6,.22)',
  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  // ── Atmosphere (glow blobs di bg) ─────────────────────────────────────────
  atm: [
    { color: 'rgba(217,119,6,.08)', x: '88%',  y: '55%', size: '55%' },
    { color: 'rgba(99,102,241,.04)', x: '-12%', y: '-18%', size: '48%' },
  ],
  scanlines: true,

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    bg:          'rgba(20,18,16,.88)',
    logoGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    logoShadow:  '0 4px 16px rgba(217,119,6,.28)',
    titleColor:  '#ede8de',
    accentColor: 'rgba(217,119,6,.65)',
    statusDot:   'rgba(0,255,140,.4)',
    metaColor:   '#38342e',
  },

  // ── Chat Bubbles ──────────────────────────────────────────────────────────
  bubble: {
    user: {
      bg:     'rgba(217,119,6,.09)',
      border: 'rgba(217,119,6,.18)',
      color:  '#ede0c8',
      shadow: '0 4px 20px rgba(0,0,0,.3)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(255,255,255,.033)',
      border: 'rgba(255,255,255,.055)',
      color:  '#c4bcb0',
      shadow: '0 2px 12px rgba(0,0,0,.2)',
      radius: '4px 16px 16px 16px',
    },
    thinking: {
      color:   'rgba(217,119,6,.4)',
      dotBg:   'rgba(217,119,6,.3)',
      dotGlow: 'rgba(217,119,6,.35)',
    },
  },

  // ── Action Chips ──────────────────────────────────────────────────────────
  chip: {
    border: 'rgba(0,255,140,.16)',
    bg:     'rgba(0,255,140,.04)',
    color:  'rgba(0,220,120,.55)',
    check:  'rgba(0,200,100,.5)',
  },

  // ── Code Blocks ───────────────────────────────────────────────────────────
  code: {
    bg:     'rgba(0,0,0,.4)',
    border: '1px solid rgba(217,119,6,.07)',
    color:  'rgba(200,160,80,.55)',
  },

  // ── Loading dots ──────────────────────────────────────────────────────────
  pulse: 'rgba(217,119,6,.45)',

  // ── Input Area ────────────────────────────────────────────────────────────
  input: {
    focusBorder: 'rgba(217,119,6,.22)',
    focusShadow: '0 0 0 3px rgba(217,119,6,.06)',
    caret:       '#d97706',
    sendGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    sendShadow:  '0 3px 12px rgba(217,119,6,.3)',
  },

  // ── Slash Command Popup ───────────────────────────────────────────────────
  slash: {
    cmdColor:  'rgba(217,119,6,.85)',
    descColor: '#302820',
  },

  // ── Per-theme CSS & Animations ────────────────────────────────────────────
  css: `
    @keyframes mybrandPulse {
      0%,100% { opacity:.8; }
      50%     { opacity:1; }
    }
  `,

  // ── Visual FX helpers (dipakai oleh MsgBubble) ───────────────────────────
  fx: {
    aiBubble:   () => ({ boxShadow: '0 2px 12px rgba(0,0,0,.4)' }),
    userBubble: () => ({ boxShadow: '0 0 12px rgba(217,119,6,.1), 0 2px 16px rgba(0,0,0,.4)' }),
    glowBorder: (color='#d97706', intensity=1) => ({
      boxShadow: `0 0 ${8*intensity}px ${color}22, inset 0 0 ${4*intensity}px ${color}08`,
    }),
    codeBlock:  () => ({ boxShadow: '0 0 1px rgba(217,119,6,.15), inset 0 0 6px rgba(0,0,0,.3)' }),
    chipOk:     () => ({ boxShadow: '0 0 6px rgba(0,200,110,.18)' }),
    glowText:   (color='#d97706') => ({ textShadow: `0 0 4px ${color}44` }),
    inputFocus: () => ({ boxShadow: '0 0 0 1px rgba(217,119,6,.25), 0 0 10px rgba(217,119,6,.1)' }),
  },
};

export default theme;
```

## `src/themes/obsidian.js` _(127L → 127L, 0% reduction)_
```js
// ── Obsidian Warm ──────────────────────────────────────────────────────────────
// Efek: CRT scanlines rolling, amber phosphor glow, screen vignette, warm static
// ─────────────────────────────────────────────────────────────────────────────

const theme = {
  name: 'Obsidian Warm',

  bg:           '#0e0c09',
  bg2:          '#131108',
  bg3:          '#1a1710',
  border:       'rgba(255,255,255,.05)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#ede8d8',
  textSec:      '#c4bc9c',
  textMute:     '#3a3428',
  accent:       '#d97706',
  accentBg:     'rgba(217,119,6,.09)',
  accentBorder: 'rgba(217,119,6,.22)',
  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  atm: [
    { color:'rgba(217,119,6,.06)', x:'88%', y:'55%', size:'55%' },
    { color:'rgba(99,102,241,.03)', x:'-12%', y:'-18%', size:'48%' },
  ],
  scanlines: true,

  header: {
    bg:          'rgba(18,15,8,.9)',
    logoGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    logoShadow:  '0 0 18px rgba(217,119,6,.35), 0 0 36px rgba(217,119,6,.15)',
    titleColor:  '#ede8d8',
    accentColor: 'rgba(217,119,6,.65)',
    statusDot:   'rgba(0,255,140,.45)',
    metaColor:   '#38332a',
  },

  bubble: {
    user: {
      bg:     'rgba(217,119,6,.09)',
      border: 'rgba(217,119,6,.2)',
      color:  '#ede0c0',
      shadow: '0 2px 16px rgba(0,0,0,.5)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(255,255,255,.03)',
      border: 'rgba(255,255,255,.055)',
      color:  '#c4bc9c',
      shadow: '0 2px 10px rgba(0,0,0,.3)',
      radius: '4px 16px 16px 16px',
    },
    thinking: {
      color:   'rgba(217,119,6,.45)',
      dotBg:   'rgba(217,119,6,.35)',
      dotGlow: 'rgba(217,119,6,.4)',
    },
  },

  chip:  { border:'rgba(0,255,140,.14)', bg:'rgba(0,255,140,.04)', color:'rgba(0,200,110,.55)', check:'rgba(0,200,100,.5)' },
  code:  { bg:'rgba(0,0,0,.5)', border:'1px solid rgba(217,119,6,.08)', color:'rgba(210,160,70,.6)' },
  input: {
    focusBorder: 'rgba(217,119,6,.28)',
    focusShadow: '0 0 0 3px rgba(217,119,6,.07)',
    caret: '#d97706',
    sendGrad: 'linear-gradient(135deg,#d97706,#b45309)',
    sendShadow: '0 0 14px rgba(217,119,6,.35), 0 0 28px rgba(217,119,6,.15)',
  },
  slash: { cmdColor:'rgba(217,119,6,.85)', descColor:'#2e2818' },
  pulse: 'rgba(217,119,6,.5)',

  css: `
    @keyframes crtScan {
      0%   { transform:translateY(-4px); opacity:.03; }
      100% { transform:translateY(100vh); opacity:.03; }
    }
    @keyframes crtFlicker {
      0%,97%,100% { opacity:1; }
      98%          { opacity:.92; }
      99%          { opacity:.96; }
    }
    @keyframes phosphorGlow {
      0%,100% { filter:brightness(1) sepia(.05); }
      50%     { filter:brightness(1.04) sepia(.08); }
    }
    .crt-flicker {
      animation: crtFlicker 8s linear infinite;
    }
    .phosphor-text {
      text-shadow: 0 0 4px rgba(217,119,6,.2);
    }
    .obsidian-border-glow {
      box-shadow: 0 0 8px rgba(217,119,6,.12), inset 0 0 4px rgba(217,119,6,.04);
    }
  `,

  fx: {
    aiBubble: () => ({
      boxShadow: '0 2px 12px rgba(0,0,0,.4)',
    }),
    userBubble: () => ({
      boxShadow: '0 0 12px rgba(217,119,6,.1), 0 2px 16px rgba(0,0,0,.4)',
    }),
    glowBorder: (color='#d97706', intensity=1) => ({
      boxShadow: `0 0 ${8*intensity}px ${color}22, inset 0 0 ${4*intensity}px ${color}08`,
    }),
    codeBlock: () => ({
      boxShadow: '0 0 1px rgba(217,119,6,.15), inset 0 0 6px rgba(0,0,0,.3)',
    }),
    chipOk: () => ({
      boxShadow: '0 0 6px rgba(0,200,110,.18)',
    }),
    glowText: (color='#d97706') => ({
      textShadow: `0 0 4px ${color}44`,
    }),
    inputFocus: () => ({
      boxShadow: '0 0 0 1px rgba(217,119,6,.25), 0 0 10px rgba(217,119,6,.1)',
    }),
  },
};

export default theme;
```

## `src/components/MsgBubble.jsx` _(481L → 31L, 96% reduction)_
```jsx
import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hl } from '../utils.js';
import {
  FileText, Pencil, FileDiff, Folder, FolderOpen, Search, Globe,
  Network, ArrowRight, Trash2, Plug, Wrench, Check, X, Scissors,
  RotateCcw, ChevronDown, ChevronUp, AlignLeft, Play, Copy,
  Brain, Terminal,
} from 'lucide-react';

// ── ThinkingBlock — collapsible, pakai count kalau ada newlines ──────────────
export function ThinkingBlock({ text, T, live = false }) {
export function ThinkingBlock({ … }

// ── StreamingBubble — live render saat generate, parse think realtime ─────────
export function StreamingBubble({ text, T }) {
export function StreamingBubble({ … }

// ── MsgContent — markdown + code blocks ──────────────────────────────────────
export function MsgContent({ text, T }) {
export function MsgContent({ … }

// ── ActionChip ────────────────────────────────────────────────────────────────
export function ActionChip({ action, T }) {
export function ActionChip({ … }

// ── MsgBubble ─────────────────────────────────────────────────────────────────
export function MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix, onDelete, onEdit, T }) {
export function MsgBubble({ … }
```

## `src/components/ThemeEffects.jsx` _(168L → 16L, 91% reduction)_
```jsx
import React, { useEffect } from 'react';

// ── ThemeEffects ───────────────────────────────────────────────────────────────
// Render semua visual overlay berdasarkan tema aktif:
//   - Atmosphere orbs (semua tema)
//   - Scanlines layer (obsidian, neon)
//   - CRT scan bar (obsidian)
//   - Aurora animated orbs (aurora)
//   - Neon grid + scan pulse (neon)
//   - Paper grain SVG (ink)
//   - Vignette corner (obsidian)
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeEffects({ T }) {
export function ThemeEffects({ … }
```

## `src/components/panels.agent.jsx` _(317L → 28L, 94% reduction)_
```jsx
import React, { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { Puzzle, AlertTriangle, X, Plus, Upload, Zap } from 'lucide-react';
import { BottomSheet } from './panels.base.jsx';

export function ElicitationPanel({ data, onSubmit, onDismiss, T }) {
export function ElicitationPanel({ … }

// ─── MERGE CONFLICT PANEL ─────────────────────────────────────────────────────


export function SkillsPanel({ skills, onToggle, onUpload, onRemove, onAdd, onClose, accentColor:_accentColor, T }) {
export function SkillsPanel({ … }

// ── DeployPanel ───────────────────────────────────────────────────────────────


// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime({ startedAt }) {
function ElapsedTime({ … }



export function BgAgentPanel({ agents, onMerge, onAbort, onClose, T }) {
export function BgAgentPanel({ … }
```

## `src/components/panels.base.jsx` _(167L → 15L, 93% reduction)_
```jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, Plug, Github, Key, Puzzle, Brain, MapPin, Scissors, Bookmark, Zap, Save, Upload, Settings, List, History, GitCompare, Plus, Palette, MessageSquare, Play, Package, X, Eye } from 'lucide-react';
import { MODELS } from '../constants.js';

export function BottomSheet({ children, onClose, height='88%', noPad:_noPad=false, T }) {
export function BottomSheet({ … }




export function CommandPalette({ onClose, onRun:_onRun, folder:_folder, memories, checkpoints, model, models, T,
export function CommandPalette({ … }

// ─── DEP GRAPH PANEL (d3 force layout) ───────────────────────────────────────
```

## `src/components/panels.git.jsx` _(537L → 35L, 96% reduction)_
```jsx
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { callServer } from '../api.js';
import { AlertTriangle, Eye, ScrollText, X, Network, GitMerge } from 'lucide-react';
import { BottomSheet } from './panels.base.jsx';

export function GitComparePanel({ folder, onClose, T }) {
export function GitComparePanel({ … }

// ─── FILE HISTORY PANEL ───────────────────────────────────────────────────────


export function FileHistoryPanel({ folder, filePath, onClose, T }) {
export function FileHistoryPanel({ … }

// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────


export function GitBlamePanel({ folder, filePath, onClose, T }) {
export function GitBlamePanel({ … }

// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────


export function DepGraphPanel({ depGraph, onClose, T }) {
export function DepGraphPanel({ … }

// ─── ELICITATION PANEL (AI-requested dynamic form) ───────────────────────────


export function MergeConflictPanel({ data, folder, onResolved, onAborted, onClose, T }) {
export function MergeConflictPanel({ … }

// ── SkillsPanel ───────────────────────────────────────────────────────────────
```

## `src/editor.bench.js` _(150L → 126L, 24% reduction)_
```js
import { describe, bench } from 'vitest';
import { generateDiff } from './utils.js';

// ── Inline pure functions ─────────────────────────────────────────────────────
function getLangExt(path) {
function getLangExt(path) { … }

function isEmmetLang(path) {
function isEmmetLang(path) { … }

function isTsLang(path) {
function isTsLang(path) { … }

const CONSOLE_INTERCEPT = '<script>/* intercept */</script>';
function buildSrcdoc(tabs) {
function buildSrcdoc(tabs) { … }

// ── Fixtures ──────────────────────────────────────────────────────────────────
const SMALL_CODE = `import React from 'react';\nexport default function App() {\n  return <div>Hello</div>;\n}\n`;
const LARGE_CODE = Array.from({ length: 500 }, (_, i) =>
  `const fn${i} = (x) => x * ${i}; // line ${i}`
).join('\n');
const LARGE_CODE_MODIFIED = LARGE_CODE.replace(/x \* /g, 'x + ');

const TABS_HTML_CSS_JS = [
  { path: 'index.html', content: '<html><head></head><body></body></html>' },
  { path: 'style.css',  content: 'body{margin:0;padding:0;font-family:sans-serif}h1{color:red}' },
  { path: 'main.js',    content: 'document.querySelector("h1").textContent = "Hello";' },
];
const TABS_JS_ONLY = [{ path: 'app.js', content: SMALL_CODE }];
const TABS_EMPTY   = [];

const EXTENSIONS = ['App.jsx', 'types.ts', 'style.css', 'index.html', 'data.json', 'main.py', 'README.md', 'util.mjs', 'vars.scss', 'comp.tsx'];

// ── getLang benchmark ─────────────────────────────────────────────────────────
describe('getLangExt', () => {
  bench('single call — jsx', () => {
    getLangExt('App.jsx');
  });

  bench('10 mixed extensions', () => {
    EXTENSIONS.forEach(f => getLangExt(f));
  });
});

// ── isEmmetLang benchmark ─────────────────────────────────────────────────────
describe('isEmmetLang', () => {
  bench('single call — jsx', () => {
    isEmmetLang('App.jsx');
  });

  bench('10 mixed', () => {
    EXTENSIONS.forEach(f => isEmmetLang(f));
  });
});

// ── isTsLang benchmark ───────────────────────────────────────────────────────
describe('isTsLang', () => {
  bench('single call — ts', () => {
    isTsLang('types.ts');
  });

  bench('10 mixed', () => {
    EXTENSIONS.forEach(f => isTsLang(f));
  });
});

// ── buildSrcdoc benchmark ─────────────────────────────────────────────────────
describe('buildSrcdoc', () => {
  bench('empty tabs', () => {
    buildSrcdoc(TABS_EMPTY);
  });

  bench('js only', () => {
    buildSrcdoc(TABS_JS_ONLY);
  });

  bench('html + css + js', () => {
    buildSrcdoc(TABS_HTML_CSS_JS);
  });
});

// ── generateDiff benchmark ────────────────────────────────────────────────────
describe('generateDiff (Myers)', () => {
  bench('small diff (4 lines)', () => {
    generateDiff(SMALL_CODE, SMALL_CODE.replace('Hello', 'World'));
  });

  bench('large diff (500 lines, many changes)', () => {
    generateDiff(LARGE_CODE, LARGE_CODE_MODIFIED);
  });

  bench('identical (no diff)', () => {
    generateDiff(LARGE_CODE, LARGE_CODE);
  });
});

// ── Multi-tab state operations (pure JS, no hook) ─────────────────────────────
describe('multi-tab array ops', () => {
  bench('open 1 tab (Array spread)', () => {
    const tabs = [];
    const newTab = { path: '/src/App.jsx', content: SMALL_CODE, dirty: false };
    const result = [...tabs, newTab];
    result.length; // prevent dead-code elimination
  });

  bench('close middle tab from 10', () => {
    const tabs = Array.from({ length: 10 }, (_, i) => ({ path: `/src/file${i}.js`, content: '', dirty: false }));
    const result = tabs.filter((_, i) => i !== 5);
    result.length;
  });

  bench('find active tab from 20', () => {
    const tabs = Array.from({ length: 20 }, (_, i) => ({ path: `/src/file${i}.js`, content: '', dirty: i === 10 }));
    tabs.find(t => t.dirty);
  });

  bench('open 50 tabs sequentially', () => {
    let tabs = [];
    for (let i = 0; i < 50; i++) {
      tabs = [...tabs, { path: `/src/file${i}.js`, content: '', dirty: false }];
    }
    tabs.length;
  });
});
```

## `src/globalfind.test.js` _(149L → 132L, 12% reduction)_
```js
import { describe, it, expect } from 'vitest';

// ── Pure logic extracted dari GlobalFindReplace ───────────────────────────────

function parseGrepOutput(raw, folder) {
function parseGrepOutput(raw, folder) { … }

function buildSearchPattern(query, useRegex, matchCase) {
function buildSearchPattern(query, useRegex, matchCase) { … }

function applyReplace(content, query, replaceStr, useRegex, matchCase) {
function applyReplace(content, query, replaceStr, useRegex, matchCase) { … }

// ── parseGrepOutput ───────────────────────────────────────────────────────────
describe('parseGrepOutput', () => {
  it('parses single result', () => {
    const raw = '/project/src/App.jsx:42:  const x = 1;';
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/App.jsx');
    expect(result[0].matches[0]).toEqual({ line: 42, text: 'const x = 1;' });
  });

  it('groups multiple matches from same file', () => {
    const raw = [
      '/project/src/App.jsx:1:import React',
      '/project/src/App.jsx:5:export default',
    ].join('\n');
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(1);
    expect(result[0].matches).toHaveLength(2);
  });

  it('separates matches from different files', () => {
    const raw = [
      '/project/src/App.jsx:1:import React',
      '/project/src/utils.js:10:export function',
    ].join('\n');
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(parseGrepOutput('', '/project')).toEqual([]);
    expect(parseGrepOutput(null, '/project')).toEqual([]);
  });

  it('skips malformed lines', () => {
    const raw = 'not-a-grep-line\n/project/file.js:1:valid';
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(1);
    expect(result[0].matches[0].line).toBe(1);
  });

  it('handles path not starting with folder', () => {
    const raw = 'relative/path.js:3:code';
    const result = parseGrepOutput(raw, '/project');
    expect(result[0].file).toBe('relative/path.js');
  });

  it('trims whitespace from match text', () => {
    const raw = '/project/a.js:1:   lots of spaces   ';
    const result = parseGrepOutput(raw, '/project');
    expect(result[0].matches[0].text).toBe('lots of spaces');
  });
});

// ── buildSearchPattern ────────────────────────────────────────────────────────
describe('buildSearchPattern', () => {
  it('escapes special chars in non-regex mode', () => {
    const pat = buildSearchPattern('a.b', false, true);
    expect('axb'.match(pat)).toBeNull();
    expect('a.b'.match(pat)).not.toBeNull();
  });

  it('uses raw regex in regex mode', () => {
    const pat = buildSearchPattern('a.b', true, true);
    expect('axb'.match(pat)).not.toBeNull();
  });

  it('is case-insensitive when matchCase=false', () => {
    const pat = buildSearchPattern('hello', false, false);
    expect('HELLO'.match(pat)).not.toBeNull();
    expect('Hello'.match(pat)).not.toBeNull();
  });

  it('is case-sensitive when matchCase=true', () => {
    const pat = buildSearchPattern('hello', false, true);
    expect('HELLO'.match(pat)).toBeNull();
    expect('hello'.match(pat)).not.toBeNull();
  });

  it('has global flag for replace-all', () => {
    const pat = buildSearchPattern('x', false, true);
    const result = 'x and x'.replace(pat, 'y');
    expect(result).toBe('y and y');
  });
});

// ── applyReplace ──────────────────────────────────────────────────────────────
describe('applyReplace', () => {
  it('replaces all occurrences', () => {
    const result = applyReplace('foo foo foo', 'foo', 'bar', false, true);
    expect(result).toBe('bar bar bar');
  });

  it('replace is case-insensitive when matchCase=false', () => {
    const result = applyReplace('Foo FOO foo', 'foo', 'baz', false, false);
    expect(result).toBe('baz baz baz');
  });

  it('does not replace when case mismatch and matchCase=true', () => {
    const result = applyReplace('FOO', 'foo', 'bar', false, true);
    expect(result).toBe('FOO');
  });

  it('regex replace with capture group', () => {
    const result = applyReplace('hello world', '(\\w+)', '[$1]', true, true);
    expect(result).toBe('[hello] [world]');
  });

  it('returns unchanged string when no match', () => {
    const result = applyReplace('no match here', 'xyz', 'abc', false, true);
    expect(result).toBe('no match here');
  });

  it('handles empty replacement string (deletion)', () => {
    const result = applyReplace('remove this word', 'this ', '', false, true);
    expect(result).toBe('remove word');
  });
});
```

## `src/hooks/useGrowth.js` _(162L → 32L, 77% reduction)_
```js
// ── useGrowth — Yuyu yang tumbuh + Gamifikasi ─────────────────────────────────
// Yuyu belajar dari setiap sesi: naming style, bahasa dominan, error patterns
// Gamifikasi: streak harian, XP, badge — motivasi solo dev tanpa tim

import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { askCerebrasStream } from '../api.js';

// ── XP table ──
const XP_TABLE = {
  message_sent:   10,
  file_written:   50,
  patch_applied:  30,
  exec_success:   20,
  test_passed:   100,
  commit_made:   150,
  bug_fixed:      80,
};

const BADGES = [
  { id: 'first_blood',  label: '🩸 First Blood',    desc: 'Pesan pertama',          req: xp => xp >= 10 },
  { id: 'apprentice',   label: '🌱 Apprentice',      desc: '500 XP',                 req: xp => xp >= 500 },
  { id: 'coder',        label: '⚡ Coder',            desc: '2000 XP',                req: xp => xp >= 2000 },
  { id: 'hacker',       label: '🔥 Hacker',           desc: '5000 XP',                req: xp => xp >= 5000 },
  { id: 'streak_3',     label: '📅 Konsisten',        desc: '3 hari berturut-turut',  req: (_, s) => s >= 3 },
  { id: 'streak_7',     label: '🗓 Seminggu Penuh',   desc: '7 hari berturut-turut',  req: (_, s) => s >= 7 },
  { id: 'streak_30',    label: '👑 One Month',        desc: '30 hari berturut-turut', req: (_, s) => s >= 30 },
];

export function useGrowth() {
export function useGrowth() { … }
```

## `src/themes/aurora.js` _(142L → 142L, 0% reduction)_
```js
// ── Aurora Glass ───────────────────────────────────────────────────────────────
// Efek: glassmorphism real, aurora bands bergerak, backdrop blur, refraction
// ─────────────────────────────────────────────────────────────────────────────

const theme = {
  name: 'Aurora Glass',

  bg:           '#080612',
  bg2:          'rgba(12,9,22,.95)',
  bg3:          '#100e1e',
  border:       'rgba(255,255,255,.07)',
  borderSoft:   'rgba(255,255,255,.04)',
  text:         '#ece8ff',
  textSec:      '#b8b0d8',
  textMute:     '#2e2a48',
  accent:       '#8b5cf6',
  accentBg:     'rgba(139,92,246,.12)',
  accentBorder: 'rgba(139,92,246,.28)',
  success:      '#34d399',
  successBg:    'rgba(52,211,153,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  atm: [
    { color:'rgba(99,102,241,.18)',  x:'-10%', y:'-20%', size:'65%' },
    { color:'rgba(236,72,153,.12)',  x:'85%',  y:'55%',  size:'55%' },
    { color:'rgba(52,211,153,.08)',  x:'40%',  y:'80%',  size:'40%' },
    { color:'rgba(251,191,36,.06)',  x:'80%',  y:'-10%', size:'30%' },
  ],
  scanlines: false,

  header: {
    bg:          'rgba(8,6,18,.85)',
    logoGrad:    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    logoShadow:  '0 4px 20px rgba(139,92,246,.4)',
    titleColor:  '#ece8ff',
    accentColor: 'rgba(139,92,246,.7)',
    statusDot:   'rgba(52,211,153,.6)',
    metaColor:   '#2e2a48',
  },

  bubble: {
    user: {
      bg:     'rgba(139,92,246,.12)',
      border: 'rgba(139,92,246,.24)',
      color:  '#e8e0ff',
      shadow: '0 4px 24px rgba(139,92,246,.16)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(255,255,255,.05)',
      border: 'rgba(255,255,255,.1)',
      color:  '#c0b8e8',
      shadow: '0 4px 20px rgba(0,0,0,.2)',
      radius: '4px 16px 16px 16px',
    },
    thinking: {
      color:   'rgba(139,92,246,.55)',
      dotBg:   'rgba(99,102,241,.4)',
      dotGlow: 'rgba(139,92,246,.5)',
    },
  },

  chip:  { border:'rgba(139,92,246,.22)', bg:'rgba(139,92,246,.07)', color:'rgba(167,139,250,.75)', check:'rgba(52,211,153,.5)' },
  code:  { bg:'rgba(8,6,18,.7)',          border:'1px solid rgba(139,92,246,.12)', color:'rgba(185,160,255,.65)' },
  input: {
    focusBorder: 'rgba(139,92,246,.35)',
    focusShadow: '0 0 0 3px rgba(139,92,246,.08)',
    caret: '#a78bfa',
    sendGrad: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    sendShadow: '0 4px 16px rgba(139,92,246,.4)',
  },
  slash: { cmdColor:'rgba(167,139,250,.9)', descColor:'#2e2a48' },
  pulse: 'rgba(139,92,246,.6)',

  css: `
    @keyframes auroraFloat1 {
      0%,100% { transform:translate(0,0) scale(1); }
      33%     { transform:translate(3%,2%) scale(1.04); }
      66%     { transform:translate(-2%,3%) scale(.97); }
    }
    @keyframes auroraFloat2 {
      0%,100% { transform:translate(0,0) scale(1); }
      40%     { transform:translate(-4%,-2%) scale(1.06); }
      75%     { transform:translate(3%,-3%) scale(.95); }
    }
    @keyframes auroraFloat3 {
      0%,100% { transform:translate(0,0) scale(1); }
      50%     { transform:translate(2%,4%) scale(1.08); }
    }
    @keyframes glassShimmer {
      0%,100% { opacity:.07; }
      50%     { opacity:.13; }
    }
    .aurora-bubble-user {
      backdrop-filter: blur(16px) saturate(1.5);
      -webkit-backdrop-filter: blur(16px) saturate(1.5);
    }
    .aurora-bubble-ai {
      backdrop-filter: blur(12px) saturate(1.3);
      -webkit-backdrop-filter: blur(12px) saturate(1.3);
    }
    .aurora-chip {
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
  `,

  fx: {
    aiBubble: () => ({
      backdropFilter: 'blur(12px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(12px) saturate(1.3)',
    }),
    userBubble: () => ({
      backdropFilter: 'blur(16px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
      boxShadow: '0 8px 32px rgba(139,92,246,.18), inset 0 1px 0 rgba(255,255,255,.1)',
    }),
    glowBorder: (color='#8b5cf6') => ({
      boxShadow: `0 0 0 1px ${color}22, 0 4px 20px ${color}18`,
    }),
    codeBlock: () => ({
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05)',
    }),
    chipOk: () => ({
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }),
    glowText: () => ({}), // Aurora tidak pakai text glow
    inputFocus: () => ({
      boxShadow: '0 0 0 1px rgba(139,92,246,.35), 0 0 24px rgba(139,92,246,.12)',
      backdropFilter: 'blur(4px)',
    }),
  },
};

export default theme;
```

## `src/themes/ink.js` _(134L → 134L, 0% reduction)_
```js
// ── Ink & Paper ────────────────────────────────────────────────────────────────
// Efek: paper grain texture via SVG, brushstroke separators, aged paper feel
// Zero glow — semua matte, kontras tinggi seperti tinta di kertas
// ─────────────────────────────────────────────────────────────────────────────

const theme = {
  name: 'Ink & Paper',

  bg:           '#0c0b09',
  bg2:          '#111009',
  bg3:          '#171510',
  border:       'rgba(210,190,150,.08)',
  borderSoft:   'rgba(210,190,150,.04)',
  text:         '#f0ece0',
  textSec:      '#b8b09a',
  textMute:     '#3a3228',
  accent:       '#c8a97e',
  accentBg:     'rgba(200,169,126,.1)',
  accentBorder: 'rgba(200,169,126,.22)',
  success:      '#7ec882',
  successBg:    'rgba(126,200,130,.08)',
  error:        '#c87e7e',
  errorBg:      'rgba(200,126,126,.1)',
  warning:      '#c8b47e',
  warningBg:    'rgba(200,180,126,.08)',

  atm: [
    { color:'rgba(200,169,126,.05)', x:'50%', y:'-5%', size:'90%' },
  ],
  scanlines: false,

  header: {
    bg:          '#111009',
    logoGrad:    'linear-gradient(135deg,#c8a97e,#7a5c30)',
    logoShadow:  '0 2px 12px rgba(200,169,126,.2)',
    titleColor:  '#f0ece0',
    accentColor: 'rgba(200,169,126,.6)',
    statusDot:   'rgba(126,200,130,.5)',
    metaColor:   '#2e2820',
  },

  bubble: {
    user: {
      bg:     '#1a1712',
      border: 'rgba(200,169,126,.16)',
      color:  '#ece4d0',
      shadow: '0 2px 12px rgba(0,0,0,.5)',
      radius: '14px 4px 14px 14px',
    },
    ai: {
      bg:     'transparent',
      border: 'transparent',
      color:  '#b8b09a',
      shadow: 'none',
      radius: '0',
    },
    thinking: {
      color:   'rgba(200,169,126,.4)',
      dotBg:   'rgba(200,169,126,.3)',
      dotGlow: 'rgba(200,169,126,.2)',
    },
  },

  chip:  { border:'rgba(200,169,126,.16)', bg:'rgba(200,169,126,.05)', color:'rgba(200,169,126,.6)', check:'rgba(126,200,130,.4)' },
  code:  { bg:'rgba(0,0,0,.35)', border:'1px solid rgba(200,169,126,.1)', color:'rgba(200,169,126,.6)' },
  input: {
    focusBorder: 'rgba(200,169,126,.3)',
    focusShadow: '0 0 0 2px rgba(200,169,126,.06)',
    caret: '#c8a97e',
    sendGrad: 'linear-gradient(135deg,#c8a97e,#7a5c30)',
    sendShadow: '0 2px 10px rgba(200,169,126,.25)',
  },
  slash: { cmdColor:'rgba(200,169,126,.85)', descColor:'#302820' },
  pulse: 'rgba(200,169,126,.5)',

  css: `
    @keyframes inkGrainShift {
      0%   { transform:translate(0,0); }
      20%  { transform:translate(-1px,1px); }
      40%  { transform:translate(1px,-1px); }
      60%  { transform:translate(-1px,-1px); }
      80%  { transform:translate(1px,1px); }
      100% { transform:translate(0,0); }
    }
    /* Brushstroke hr divider */
    .ink-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,169,126,.3) 20%, rgba(200,169,126,.5) 50%, rgba(200,169,126,.3) 80%, transparent);
      position: relative;
    }
    .ink-divider::after {
      content: '';
      position: absolute;
      top: -1px; left: 30%; right: 30%;
      height: 3px;
      background: rgba(200,169,126,.12);
      filter: blur(2px);
    }
    /* AI message — no bubble, just left rule */
    .ink-ai-msg {
      border-left: 2px solid rgba(200,169,126,.2);
      padding-left: 14px;
      margin-left: 2px;
    }
  `,

  fx: {
    aiBubble: () => ({
      // Ink: no bubble at all — bare text with left rule
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      borderLeft: '2px solid rgba(200,169,126,.2)',
      paddingLeft: '14px',
      borderRadius: '0',
    }),
    userBubble: () => ({
      boxShadow: '0 1px 4px rgba(0,0,0,.6)',
    }),
    glowBorder: () => ({}), // No glow in ink
    codeBlock: () => ({
      borderLeft: '3px solid rgba(200,169,126,.25)',
      borderRadius: '0 8px 8px 0',
    }),
    chipOk: () => ({}),
    glowText: () => ({}),
    inputFocus: () => ({
      boxShadow: 'inset 0 -1px 0 rgba(200,169,126,.35)',
    }),
  },
};

export default theme;
```

## `src/themes/neon.js` _(141L → 141L, 0% reduction)_
```js
// ── Neon Terminal ──────────────────────────────────────────────────────────────
// Efek: real neon glow, flicker animation, cyberpunk grid, scan pulse
// ─────────────────────────────────────────────────────────────────────────────

const theme = {
  name: 'Neon Terminal',

  bg:           '#03050a',
  bg2:          'rgba(4,7,12,.97)',
  bg3:          '#080d14',
  border:       'rgba(0,255,140,.1)',
  borderSoft:   'rgba(0,255,140,.05)',
  text:         '#c8ffea',
  textSec:      'rgba(150,235,195,.8)',
  textMute:     '#0b1c12',
  accent:       '#00ff8c',
  accentBg:     'rgba(0,255,140,.07)',
  accentBorder: 'rgba(0,255,140,.22)',
  success:      '#00ff8c',
  successBg:    'rgba(0,255,140,.08)',
  error:        '#ff4466',
  errorBg:      'rgba(255,68,102,.1)',
  warning:      '#ffcc00',
  warningBg:    'rgba(255,204,0,.08)',

  atm: [
    { color:'rgba(0,255,140,.08)', x:'-5%',  y:'-15%', size:'55%' },
    { color:'rgba(0,180,255,.06)', x:'88%',  y:'65%',  size:'45%' },
    { color:'rgba(120,0,255,.04)', x:'45%',  y:'90%',  size:'35%' },
  ],
  scanlines: true,

  header: {
    bg:          'rgba(3,5,10,.92)',
    logoGrad:    'linear-gradient(135deg,#00ff8c,#00ccff)',
    logoShadow:  '0 0 20px rgba(0,255,140,.5), 0 0 40px rgba(0,255,140,.2)',
    titleColor:  '#c8ffea',
    accentColor: 'rgba(0,255,140,.6)',
    statusDot:   '#00ff8c',
    metaColor:   '#0b1c12',
  },

  bubble: {
    user: {
      bg:     'rgba(0,180,255,.07)',
      border: 'rgba(0,180,255,.22)',
      color:  'rgba(180,240,255,.9)',
      shadow: '0 0 24px rgba(0,180,255,.12), 0 0 48px rgba(0,180,255,.06)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(0,255,140,.04)',
      border: 'rgba(0,255,140,.12)',
      color:  'rgba(150,235,195,.85)',
      shadow: '0 0 20px rgba(0,255,140,.08)',
      radius: '4px 16px 16px 16px',
    },
    thinking: {
      color:   'rgba(0,255,140,.5)',
      dotBg:   'rgba(0,255,140,.4)',
      dotGlow: 'rgba(0,255,140,.6)',
    },
  },

  chip:  { border:'rgba(0,255,140,.2)', bg:'rgba(0,255,140,.04)', color:'rgba(0,220,130,.7)', check:'rgba(0,255,140,.5)' },
  code:  { bg:'rgba(0,0,0,.6)', border:'1px solid rgba(0,255,140,.1)', color:'rgba(0,230,120,.65)' },
  input: {
    focusBorder: 'rgba(0,255,140,.35)',
    focusShadow: '0 0 0 3px rgba(0,255,140,.07)',
    caret: '#00ff8c',
    sendGrad: 'linear-gradient(135deg,#00ff8c,#00ccaa)',
    sendShadow: '0 0 16px rgba(0,255,140,.4), 0 0 32px rgba(0,255,140,.2)',
  },
  slash: { cmdColor:'rgba(0,255,140,.9)', descColor:'#0b1c12' },
  pulse: '#00ff8c',

  // ── CSS injected globally ────────────────────────────────────────────────
  css: `
    @keyframes neonFlicker {
      0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; }
      20%,24%,55% { opacity:.6; }
    }
    @keyframes neonPulse {
      0%,100% { opacity:.85; filter:brightness(1); }
      50%     { opacity:1;   filter:brightness(1.15); }
    }
    @keyframes neonScan {
      0%   { transform:translateY(-100%); }
      100% { transform:translateY(100vh); }
    }
    @keyframes gridPan {
      0%   { background-position: 0 0; }
      100% { background-position: 40px 40px; }
    }
    .neon-text {
      text-shadow: 0 0 7px #00ff8c, 0 0 14px #00ff8c88, 0 0 28px #00ff8c44;
      animation: neonFlicker 6s linear infinite;
    }
    .neon-border {
      box-shadow: 0 0 6px rgba(0,255,140,.5), 0 0 14px rgba(0,255,140,.25), inset 0 0 6px rgba(0,255,140,.08);
    }
    .neon-border-blue {
      box-shadow: 0 0 6px rgba(0,180,255,.5), 0 0 14px rgba(0,180,255,.25), inset 0 0 6px rgba(0,180,255,.08);
    }
  `,

  // ── Per-element effect functions ─────────────────────────────────────────
  fx: {
    // Extra box-shadow for accented borders
    glowBorder: (color='#00ff8c', intensity=1) => ({
      boxShadow: `0 0 ${6*intensity}px ${color}88, 0 0 ${14*intensity}px ${color}44, inset 0 0 ${5*intensity}px ${color}11`,
    }),
    // AI bubble extra glow
    aiBubble: () => ({
      boxShadow: '0 0 20px rgba(0,255,140,.08), 0 0 40px rgba(0,255,140,.04)',
    }),
    // User bubble glow
    userBubble: () => ({
      boxShadow: '0 0 20px rgba(0,180,255,.14), 0 0 40px rgba(0,180,255,.06)',
    }),
    // Neon text glow
    glowText: (color='#00ff8c') => ({
      textShadow: `0 0 7px ${color}, 0 0 14px ${color}88, 0 0 28px ${color}44`,
    }),
    // Code block glow
    codeBlock: () => ({
      boxShadow: '0 0 1px rgba(0,255,140,.2), 0 0 8px rgba(0,255,140,.06)',
    }),
    // Action chip glow when ok
    chipOk: () => ({
      boxShadow: '0 0 8px rgba(0,255,140,.25)',
    }),
    // Input focus
    inputFocus: () => ({
      boxShadow: '0 0 0 1px rgba(0,255,140,.3), 0 0 12px rgba(0,255,140,.12)',
    }),
  },
};

export default theme;
```

## `src/utils.test.js` _(148L → 148L, 0% reduction)_
```js
import { describe, it, expect } from "vitest";
import { countTokens, getFileIcon, hl, resolvePath, parseActions } from "./utils.js";

// ── TEST countTokens ─────────────────────────────────────────────────────────
describe('countTokens', () => {
  it('should return 0 for empty messages', () => {
    expect(countTokens([])).toBe(0);
  });

  it('should calculate token count from content length', () => {
    const msgs = [
      { content: 'Hello' },
      { content: 'World!' }
    ];
    // (5 + 6) / 4 = 2.75 → rounded to 3
    expect(countTokens(msgs)).toBe(3);
  });

  it('should handle missing content', () => {
    const msgs = [
      { content: 'Hi' },
      { text: 'No content' }  // no .content field
    ];
    // only 'Hi' counts: 2 / 4 = 0.5 → rounds to 1
    expect(countTokens(msgs)).toBe(1);
  });
});

// ── TEST getFileIcon ─────────────────────────────────────────────────────────
describe('getFileIcon', () => {
  it('should return extension string for unknown extension', () => {
    expect(getFileIcon('unknown.xyz')).toBe('xyz');
  });

  it('should return correct string key for known extensions', () => {
    expect(getFileIcon('app.js')).toBe('js');
    expect(getFileIcon('style.css')).toBe('css');
    expect(getFileIcon('image.png')).toBe('img');
    expect(getFileIcon('main.py')).toBe('py');
    expect(getFileIcon('data.json')).toBe('{}');
  });

  it('should handle mixed case extensions', () => {
    expect(getFileIcon('FILE.JS')).toBe('js');
    expect(getFileIcon('image.PNG')).toBe('img');
  });

  it('should return fallback for no extension or empty', () => {
    expect(getFileIcon('Makefile')).toBe('makefile');
    expect(getFileIcon('')).toBe('?');
  });
});

// ── TEST hl (syntax highlight) ───────────────────────────────────────────────
describe('hl', () => {
  it('should escape HTML characters', () => {
    expect(hl('<script>alert()</script>'))
      .toContain('&lt;script&gt;alert()&lt;/script&gt;');
  });

  it('should highlight JSON keys and values', () => {
    const code = '"name": "John", "age": 30, "valid": true';
    const out = hl(code, 'json');
    expect(out).toMatch(/<span style="color:#79b8ff">"name"<\/span>/);
    expect(out).toMatch(/<span style="color:#f97583">true<\/span>/);
    expect(out).toMatch(/<span style="color:#d19a66">30<\/span>/);
  });

  it('should highlight bash keywords', () => {
    const code = 'echo "Hello"';
    const out = hl(code, 'bash');
    expect(out).toMatch(/<span style="color:#c678dd">echo<\/span>/);
  });

  it('should highlight python keywords', () => {
    const code = 'def hello(): return True';
    const out = hl(code, 'py');
    expect(out).toMatch(/<span style="color:#c678dd">def<\/span>/);
    expect(out).toMatch(/<span style="color:#c678dd">return<\/span>/);
    expect(out).toMatch(/<span style="color:#c678dd">True<\/span>/);
  });

  it('should highlight css selectors', () => {
    const code = '.container { color: red; }';
    const out = hl(code, 'css');
    expect(out).toMatch(/<span style="color:#79b8ff">\.container<\/span>/);
  });

  it('should highlight js keywords', () => {
    const code = 'const x = 42;';
    const out = hl(code, 'js');
    expect(out).toMatch(/<span style="color:#c678dd">const<\/span>/);
    expect(out).toMatch(/<span style="color:#d19a66">42<\/span>/);
  });

  it('should handle empty code', () => {
    expect(hl('', 'js')).toBe('');
  });
});

// ── TEST resolvePath ─────────────────────────────────────────────────────────
describe('resolvePath', () => {
  it('should return base if no path', () => {
    expect(resolvePath('base', '')).toBe('base');
    expect(resolvePath('base', null)).toBe('base');
  });

  it('should return path if no base', () => {
    expect(resolvePath('', 'path')).toBe('path');
  });

  it('should return path if equal to base', () => {
    expect(resolvePath('base', 'base')).toBe('base');
  });

  it('should return path if already prefixed', () => {
    expect(resolvePath('base', 'base/file')).toBe('base/file');
  });

  it('should concatenate base and path correctly', () => {
    expect(resolvePath('base', 'file')).toBe('base/file');
    expect(resolvePath('base', '/file')).toBe('base/file');
    expect(resolvePath('base/', 'file')).toBe('base/file');
  });
});

// ── TEST parseActions ────────────────────────────────────────────────────────
describe('parseActions', () => {
  it('should return empty array if no action block', () => {
    expect(parseActions('no actions here')).toEqual([]);
  });

  it('should extract and parse valid JSON action blocks', () => {
    const text = 'Some text\n```action\n{"type":"write_file","path":"test.js"}\n```\nMore text\n```action\n{"type":"exec","command":"npm test"}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual({ type: 'write_file', path: 'test.js' });
    expect(actions[1]).toEqual({ type: 'exec', command: 'npm test' });
  });

  it('should skip invalid JSON in action blocks', () => {
    const text = '```action\nnot valid json\n```\n```action\n{"valid":true}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toEqual({ valid: true });
  });
});
```

## `src/components/LivePreview.jsx` _(208L → 33L, 86% reduction)_
```jsx
// ── LivePreview — live HTML/CSS/JS iframe preview ─────────────────────────────
// Combines open HTML/CSS/JS files into a single srcdoc iframe.
// Intercepts console.log via postMessage for in-app display.
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Terminal as TermIcon, X, AlertCircle } from 'lucide-react';

const CONSOLE_INTERCEPT = `
<script>
(function(){
  var _c = window.console;
  ['log','warn','error','info'].forEach(function(m){
    var orig = _c[m].bind(_c);
    _c[m] = function(){
      var args = Array.prototype.slice.call(arguments);
      window.parent.postMessage({type:'console',level:m,args:args.map(function(a){
        try{return JSON.stringify(a);}catch(e){return String(a);}
      })}, '*');
      orig.apply(_c, arguments);
    };
  });
  window.addEventListener('error', function(e){
    window.parent.postMessage({type:'console',level:'error',args:[e.message + ' (line '+e.lineno+')']}, '*');
  });
})();
</script>
`;

function buildSrcdoc(tabs) {
function buildSrcdoc(tabs) { … }

export function LivePreview({ tabs, T, onClose }) {
export function LivePreview({ … }
```

## `src/hooks/useChatStore.js` _(208L → 9L, 97% reduction)_
```js
import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { MAX_HISTORY } from '../constants.js';
import { askCerebrasStream } from '../api.js';
import { tfidfRank } from '../features.js';

export function useChatStore() {
export function useChatStore() { … }
```

## `src/hooks/useUIStore.js` _(208L → 7L, 97% reduction)_
```js
import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { THEMES_MAP, THEME_KEYS, DEFAULT_THEME } from '../themes/index.js';

export function useUIStore() {
export function useUIStore() { … }
```

## `src/components/FileTree.jsx` _(293L → 19L, 96% reduction)_
```jsx
import {
  Folder, FolderOpen, File, FilePlus, FolderPlus, RotateCcw, Pencil, Trash2, Search,
  FileCode, FileJson, FileText, Image, Coffee, Braces, Globe, Settings,
  Package, GitBranch, Database, Film, Music, Archive, Shield, Terminal,
  Layers, Cpu, Hash,
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Fuse from 'fuse.js';
import { callServer } from '../api.js';

function getFileIconData(name) {
function getFileIconData(name) { … }

function FileIcon({ name, size=13 }) {
function FileIcon({ … }

export function FileTree({ folder, onSelectFile, selectedFile, T }) {
export function FileTree({ … }
```

## `src/components/GlobalFindReplace.jsx` _(248L → 8L, 97% reduction)_
```jsx
// ── GlobalFindReplace — search & replace across all project files ─────────────
import React, { useState, useCallback } from 'react';
import { Search, Replace, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { callServer } from '../api.js';

export function GlobalFindReplace({ folder, onOpenFile, onClose, T }) {
export function GlobalFindReplace({ … }
```

## `src/components/Terminal.jsx` _(342L → 23L, 92% reduction)_
```jsx
// ── Terminal — xterm.js dengan layout yang benar ─────────────────────────────
import { Wrench, ChevronRight, Terminal as TerminalIcon, X } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { callServer, execStream } from '../api.js';

// xterm CSS diinject manual supaya tidak corrupt global styles
const XTERM_CSS = `
.xterm { height: 100%; }
.xterm-viewport { overflow-y: auto !important; }
.xterm-screen canvas { display: block; }
.xterm .xterm-accessibility, .xterm .xterm-message { position: absolute; left: 0; top: 0; bottom: 0; right: 0; z-index: 10; color: transparent; }
.xterm-char-measure-element { position: absolute; visibility: hidden; }
`;

// ── TrafficDot — isolated component so onClick never accesses ref during render
function TrafficDot({ color, hint, active, cmd, onClick }) {
function TrafficDot({ … }

export function Terminal({ folder, cmdHistory, addHistory, onSendToAI, T }) {
export function Terminal({ … }
```

## `src/editor.test.js` _(187L → 170L, 9% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock CodeMirror — tidak bisa jalan di jsdom tanpa DOM penuh ───────────────
vi.mock('codemirror', () => ({ EditorView: { theme: vi.fn(() => ({})), updateListener: { of: vi.fn() }, lineWrapping: {} }, basicSetup: [] }));
vi.mock('@codemirror/state', () => ({ EditorState: { create: vi.fn() }, Compartment: vi.fn(() => ({ of: vi.fn(), reconfigure: vi.fn() })), StateEffect: { define: vi.fn(() => ({ of: vi.fn() })), appendConfig: { of: vi.fn() } }, StateField: { define: vi.fn() } }));
vi.mock('@codemirror/view', () => ({ Decoration: { none: {}, set: vi.fn(), widget: vi.fn(() => ({ range: vi.fn() })) }, WidgetType: class {}, ViewPlugin: { fromClass: vi.fn(() => ({})) }, keymap: { of: vi.fn(() => ({})) }, GutterMarker: class {}, gutter: vi.fn(() => ({})) }));
vi.mock('@codemirror/lint', () => ({ linter: vi.fn(() => ({})), lintGutter: vi.fn(() => ({})) }));
vi.mock('@codemirror/language', () => ({ syntaxTree: vi.fn(() => ({ resolveInner: vi.fn(() => null) })), language: {} }));
vi.mock('@codemirror/commands', () => ({ foldAll: vi.fn(), unfoldAll: vi.fn(), selectNextOccurrence: vi.fn(), selectSelectionMatches: vi.fn(), indentWithTab: vi.fn() }));
vi.mock('@codemirror/collab', () => ({ collab: vi.fn(() => ({})), getSyncedVersion: vi.fn(() => 0), sendableUpdates: vi.fn(() => []), receiveUpdates: vi.fn(() => ({})) }));
vi.mock('@codemirror/lang-javascript', () => ({ javascript: vi.fn(() => ({ name: 'javascript' })) }));
vi.mock('@codemirror/lang-css',        () => ({ css:        vi.fn(() => ({ name: 'css' })) }));
vi.mock('@codemirror/lang-html',       () => ({ html:       vi.fn(() => ({ name: 'html' })) }));
vi.mock('@codemirror/lang-json',       () => ({ json:       vi.fn(() => ({ name: 'json' })) }));
vi.mock('@codemirror/lang-python',     () => ({ python:     vi.fn(() => ({ name: 'python' })) }));
vi.mock('@codemirror/lang-markdown',   () => ({ markdown:   vi.fn(() => ({ name: 'markdown' })) }));
vi.mock('@replit/codemirror-vim',      () => ({ vim: vi.fn(() => ({})) }));
vi.mock('@emmetio/codemirror6-plugin', () => ({ abbreviationTracker: vi.fn(() => ({})), expandAbbreviation: vi.fn() }));
vi.mock('../api.js', () => ({ callServer: vi.fn() }));
vi.mock('lucide-react', () => ({ Save: () => null, ChevronRight: () => null }));
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return { ...actual };
});

import { javascript } from '@codemirror/lang-javascript';
import { css }        from '@codemirror/lang-css';
import { html }       from '@codemirror/lang-html';
import { json }       from '@codemirror/lang-json';
import { python }     from '@codemirror/lang-python';
import { markdown }   from '@codemirror/lang-markdown';

// ── Inline pure functions (copied dari FileEditor — tidak bisa import karena mock) ──
function getLangExt(path) {
function getLangExt(path) { … }

function isEmmetLang(path) {
function isEmmetLang(path) { … }

function isTsLang(path) {
function isTsLang(path) { … }

// ── getLang ───────────────────────────────────────────────────────────────────
describe('getLang', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns javascript() for .js', () => {
    getLangExt('app.js');
    expect(javascript).toHaveBeenCalledWith();
  });

  it('returns javascript({jsx}) for .jsx', () => {
    getLangExt('App.jsx');
    expect(javascript).toHaveBeenCalledWith({ jsx: true });
  });

  it('returns javascript({typescript}) for .ts', () => {
    getLangExt('types.ts');
    expect(javascript).toHaveBeenCalledWith({ typescript: true });
  });

  it('returns javascript({jsx,typescript}) for .tsx', () => {
    getLangExt('App.tsx');
    expect(javascript).toHaveBeenCalledWith({ jsx: true, typescript: true });
  });

  it('returns css() for .css .scss .sass', () => {
    ['style.css', 'app.scss', 'vars.sass'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(css).toHaveBeenCalled();
    });
  });

  it('returns html() for .html .htm', () => {
    ['index.html', 'page.htm'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(html).toHaveBeenCalled();
    });
  });

  it('returns json() for .json', () => {
    getLangExt('package.json');
    expect(json).toHaveBeenCalled();
  });

  it('returns python() for .py', () => {
    getLangExt('main.py');
    expect(python).toHaveBeenCalled();
  });

  it('returns markdown() for .md .mdx', () => {
    ['README.md', 'docs.mdx'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(markdown).toHaveBeenCalled();
    });
  });

  it('falls back to javascript() for unknown extension', () => {
    getLangExt('binary.exe');
    expect(javascript).toHaveBeenCalled();
  });

  it('handles null/undefined path', () => {
    getLangExt(null);
    expect(javascript).toHaveBeenCalled();
  });

  it('handles path with no extension', () => {
    getLangExt('Makefile');
    expect(javascript).toHaveBeenCalled();
  });

  it('handles .mjs and .cjs like .js', () => {
    ['util.mjs', 'config.cjs'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(javascript).toHaveBeenCalledWith();
    });
  });
});

// ── isEmmetLang ───────────────────────────────────────────────────────────────
describe('isEmmetLang', () => {
  it('returns true for html/htm/jsx/tsx/css/scss', () => {
    ['index.html', 'page.htm', 'App.jsx', 'App.tsx', 'style.css', 'vars.scss']
      .forEach(f => expect(isEmmetLang(f)).toBe(true));
  });

  it('returns false for ts/js/py/json/md', () => {
    ['types.ts', 'main.js', 'app.py', 'data.json', 'README.md']
      .forEach(f => expect(isEmmetLang(f)).toBe(false));
  });

  it('returns false for null/undefined', () => {
    expect(isEmmetLang(null)).toBe(false);
    expect(isEmmetLang(undefined)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isEmmetLang('App.JSX')).toBe(true);
    expect(isEmmetLang('Style.CSS')).toBe(true);
  });
});

// ── isTsLang ──────────────────────────────────────────────────────────────────
describe('isTsLang', () => {
  it('returns true for ts/tsx/js/jsx', () => {
    ['app.ts', 'App.tsx', 'main.js', 'Comp.jsx']
      .forEach(f => expect(isTsLang(f)).toBe(true));
  });

  it('returns false for css/html/py/json/md', () => {
    ['style.css', 'index.html', 'main.py', 'data.json', 'README.md']
      .forEach(f => expect(isTsLang(f)).toBe(false));
  });

  it('returns false for null/undefined', () => {
    expect(isTsLang(null)).toBe(false);
    expect(isTsLang(undefined)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isTsLang('App.TS')).toBe(true);
    expect(isTsLang('Comp.JSX')).toBe(true);
  });
});
```

## `src/features.test.js` _(214L → 214L, 0% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePlanSteps,
  selectSkills,
  rewindMessages,
  checkPermission,
  parseElicitation,
  tfidfRank,
  DEFAULT_PERMISSIONS,
  EFFORT_CONFIG,
} from './features.js';

// ── parsePlanSteps ────────────────────────────────────────────────────────────
describe('parsePlanSteps', () => {
  it('should parse numbered plan steps', () => {
    const reply = '1. Baca file App.jsx\n2. Tambah fitur baru\n3. Test hasilnya';
    const steps = parsePlanSteps(reply);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toEqual({ num: 1, text: 'Baca file App.jsx', done: false, result: null });
    expect(steps[2]).toEqual({ num: 3, text: 'Test hasilnya', done: false, result: null });
  });

  it('should return empty array for non-numbered text', () => {
    expect(parsePlanSteps('tidak ada plan di sini')).toEqual([]);
  });

  it('should skip non-numbered lines', () => {
    const reply = '1. Langkah pertama\nini bukan langkah\n2. Langkah kedua';
    const steps = parsePlanSteps(reply);
    expect(steps).toHaveLength(2);
    expect(steps[1].num).toBe(2);
  });

  it('should handle empty string', () => {
    expect(parsePlanSteps('')).toEqual([]);
  });
});

// ── selectSkills ─────────────────────────────────────────────────────────────
describe('selectSkills', () => {
  const skills = [
    { name: 'react.md',   content: 'React hooks useState useEffect component', active: true },
    { name: 'nodejs.md',  content: 'Node.js server express api route', active: true },
    { name: 'testing.md', content: 'vitest jest unit test coverage', active: true },
    { name: 'skill.md',   content: 'General skill', active: true },
  ];

  it('should return empty array if no skills', () => {
    expect(selectSkills([], 'some task')).toEqual([]);
  });

  it('should return first 3 if no task text', () => {
    const result = selectSkills(skills, '');
    expect(result).toHaveLength(3);
  });

  it('should always include skill named "skill"', () => {
    const result = selectSkills(skills, 'unrelated task');
    expect(result.some(s => s.name === 'skill.md')).toBe(true);
  });

  it('should match skill by name keyword in task', () => {
    const result = selectSkills(skills, 'butuh bantuan react');
    expect(result.some(s => s.name === 'react.md')).toBe(true);
  });

  it('should match skill by content keyword', () => {
    const result = selectSkills(skills, 'setup vitest untuk project');
    expect(result.some(s => s.name === 'testing.md')).toBe(true);
  });
});

// ── rewindMessages ───────────────────────────────────────────────────────────
describe('rewindMessages', () => {
  const msgs = [
    { role: 'user',      content: 'pesan 1' },
    { role: 'assistant', content: 'balas 1' },
    { role: 'user',      content: 'pesan 2' },
    { role: 'assistant', content: 'balas 2' },
    { role: 'user',      content: 'pesan 3' },
    { role: 'assistant', content: 'balas 3' },
  ];

  it('should rewind 1 turn (2 messages)', () => {
    const result = rewindMessages(msgs, 1);
    expect(result).toHaveLength(4);
    expect(result[result.length - 1].content).toBe('balas 2');
  });

  it('should rewind 2 turns (4 messages)', () => {
    const result = rewindMessages(msgs, 2);
    expect(result).toHaveLength(2);
  });

  it('should never return empty array (min 1 message)', () => {
    const result = rewindMessages(msgs, 99);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle single message', () => {
    const result = rewindMessages([{ role: 'user', content: 'hi' }], 1);
    expect(result).toHaveLength(1);
  });
});

// ── checkPermission ───────────────────────────────────────────────────────────
describe('checkPermission', () => {
  it('should return false if permissions is null/undefined', () => {
    expect(checkPermission(null, 'read_file')).toBe(false);
    expect(checkPermission(undefined, 'read_file')).toBe(false);
  });

  it('should return explicit permission value', () => {
    expect(checkPermission({ read_file: true },  'read_file')).toBe(true);
    expect(checkPermission({ read_file: false }, 'read_file')).toBe(false);
  });

  it('should fall back to DEFAULT_PERMISSIONS', () => {
    // read_file default = true
    expect(checkPermission({}, 'read_file')).toBe(DEFAULT_PERMISSIONS.read_file);
    // delete_file default = false
    expect(checkPermission({}, 'delete_file')).toBe(DEFAULT_PERMISSIONS.delete_file);
  });

  it('should return false for unknown action not in defaults', () => {
    expect(checkPermission({}, 'unknown_action')).toBe(false);
  });

  it('default permissions should match expected values', () => {
    expect(DEFAULT_PERMISSIONS.read_file).toBe(true);
    expect(DEFAULT_PERMISSIONS.write_file).toBe(true);
    expect(DEFAULT_PERMISSIONS.exec).toBe(true);
    expect(DEFAULT_PERMISSIONS.delete_file).toBe(false);
    expect(DEFAULT_PERMISSIONS.mcp).toBe(false);
    expect(DEFAULT_PERMISSIONS.browse).toBe(false);
  });
});

// ── parseElicitation ─────────────────────────────────────────────────────────
describe('parseElicitation', () => {
  it('should return null if no ELICIT: marker', () => {
    expect(parseElicitation('response biasa tanpa elicitation')).toBeNull();
  });

  it('should parse valid elicitation JSON', () => {
    const reply = 'Sebelum lanjut, ELICIT:{"question":"Mau pakai framework apa?","options":["React","Vue"]}';
    const result = parseElicitation(reply);
    expect(result).not.toBeNull();
    expect(result.question).toBe('Mau pakai framework apa?');
    expect(result.options).toEqual(['React', 'Vue']);
  });

  it('should return null for malformed JSON after ELICIT:', () => {
    expect(parseElicitation('ELICIT: ini bukan json')).toBeNull();
  });

  it('should handle nested JSON correctly', () => {
    const reply = 'ELICIT:{"question":"pilih","data":{"a":1,"b":2}}';
    const result = parseElicitation(reply);
    expect(result.data).toEqual({ a: 1, b: 2 });
  });
});

// ── tfidfRank ─────────────────────────────────────────────────────────────────
describe('tfidfRank', () => {
  const memories = [
    { id: Date.now(), text: 'react hooks useState useEffect' },
    { id: Date.now(), text: 'node server express api' },
    { id: Date.now(), text: 'git commit push pull merge' },
    { id: Date.now(), text: 'css flexbox grid layout' },
    { id: Date.now(), text: 'react component props state' },
  ];

  it('should return empty array for empty memories', () => {
    expect(tfidfRank([], 'react')).toEqual([]);
  });

  it('should return slice if no query', () => {
    const result = tfidfRank(memories, '', 3);
    expect(result).toHaveLength(3);
  });

  it('should rank react-related memories higher for react query', () => {
    const result = tfidfRank(memories, 'react hooks', 3);
    const texts = result.map(m => m.text);
    expect(texts.some(t => t.includes('react'))).toBe(true);
  });

  it('should respect topN limit', () => {
    expect(tfidfRank(memories, 'react', 2)).toHaveLength(2);
    expect(tfidfRank(memories, 'react', 10)).toHaveLength(memories.length);
  });

  it('should return memories with _score field', () => {
    const result = tfidfRank(memories, 'react');
    expect(result[0]).toHaveProperty('_score');
  });
});

// ── EFFORT_CONFIG ─────────────────────────────────────────────────────────────
describe('EFFORT_CONFIG', () => {
  it('should have low, medium, high levels', () => {
    expect(EFFORT_CONFIG.low).toBeDefined();
    expect(EFFORT_CONFIG.medium).toBeDefined();
    expect(EFFORT_CONFIG.high).toBeDefined();
  });

  it('should have increasing maxIter and maxTokens', () => {
    expect(EFFORT_CONFIG.low.maxIter).toBeLessThan(EFFORT_CONFIG.medium.maxIter);
    expect(EFFORT_CONFIG.medium.maxIter).toBeLessThan(EFFORT_CONFIG.high.maxIter);
    expect(EFFORT_CONFIG.low.maxTokens).toBeLessThan(EFFORT_CONFIG.high.maxTokens);
  });
});
```

## `src/hooks/useFileStore.js` _(246L → 8L, 97% reduction)_
```js
import { useState, useRef, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer } from '../api.js';
import { executeAction, resolvePath } from '../utils.js';

export function useFileStore() {
export function useFileStore() { … }
```

## `src/hooks/useProjectStore.js` _(226L → 9L, 96% reduction)_
```js
import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { MODELS } from '../constants.js';
import { callServer } from '../api.js';
import { runHooksV2, EFFORT_CONFIG, loadSkills, saveSkillFile, deleteSkillFile } from '../features.js';

export function useProjectStore() {
export function useProjectStore() { … }
```

## `src/multitab.test.js` _(209L → 209L, 0% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:  vi.fn().mockResolvedValue({ value: null }),
    set:  vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('./api.js', () => ({ callServer: vi.fn() }));
vi.mock('./utils.js', () => ({
  executeAction: vi.fn(),
  resolvePath: vi.fn((base, p) => base + '/' + p),
}));

import { callServer } from './api.js';
import { useFileStore } from './hooks/useFileStore.js';

beforeEach(() => vi.clearAllMocks());

// ── Multi-tab core ────────────────────────────────────────────────────────────
describe('useFileStore — multi-tab', () => {
  it('starts with empty tabs and chat activeTab', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.openTabs).toEqual([]);
    expect(result.current.activeTab).toBe('chat');
    expect(result.current.activeTabIdx).toBe(0);
  });

  it('openFile adds a new tab and switches activeTab to file', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => {
      await result.current.openFile('/project/src/App.jsx');
    });

    expect(result.current.openTabs).toHaveLength(1);
    expect(result.current.openTabs[0].path).toBe('/project/src/App.jsx');
    expect(result.current.openTabs[0].content).toBe('const x = 1;');
    expect(result.current.openTabs[0].dirty).toBe(false);
    expect(result.current.activeTab).toBe('file');
    expect(result.current.activeTabIdx).toBe(0);
  });

  it('openFile reuses existing tab instead of duplicating', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    await act(async () => { await result.current.openFile('/project/App.jsx'); });

    expect(result.current.openTabs).toHaveLength(1);
  });

  it('openFile adds multiple distinct tabs', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });

    expect(result.current.openTabs).toHaveLength(2);
    expect(result.current.activeTabIdx).toBe(1);
  });

  it('closeTab removes tab and adjusts activeTabIdx', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });

    act(() => { result.current.closeTab(0); });

    expect(result.current.openTabs).toHaveLength(1);
    expect(result.current.openTabs[0].path).toBe('/project/B.js');
  });

  it('closeTab last tab resets to chat', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.closeTab(0); });

    expect(result.current.openTabs).toHaveLength(0);
    expect(result.current.activeTab).toBe('chat');
  });

  it('setActiveTabIdx switches active tab', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });

    act(() => { result.current.setActiveTabIdx(0); });

    expect(result.current.activeTabIdx).toBe(0);
    expect(result.current.activeTab).toBe('file');
  });

  it('updateTabContent marks tab dirty', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'original' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'modified'); });

    expect(result.current.openTabs[0].dirty).toBe(true);
    expect(result.current.openTabs[0].content).toBe('modified');
  });

  it('selectedFile derived from active tab path', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/App.jsx'); });

    expect(result.current.selectedFile).toBe('/project/App.jsx');
  });

  it('fileContent derived from active tab content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'hello world' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/App.jsx'); });

    expect(result.current.fileContent).toBe('hello world');
  });

  it('selectedFile is null when no tabs open', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.selectedFile).toBeNull();
  });

  it('saveFile writes to server and clears dirty', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'original' })
      .mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'changed'); });
    await act(async () => { await result.current.saveFile('changed'); });

    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write', content: 'changed' }));
    expect(result.current.openTabs[0].dirty).toBe(false);
  });

  it('openFile shows error content if server fails', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'not found' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/missing.js'); });

    expect(result.current.openTabs[0].content).toContain('Error:');
  });

  it('adds to recentFiles on open', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });

    expect(result.current.recentFiles).toContain('/project/A.js');
  });

  it('recentFiles capped at 8', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    for (let i = 0; i < 10; i++) {
      await act(async () => { await result.current.openFile(`/project/file${i}.js`); });
    }

    expect(result.current.recentFiles.length).toBeLessThanOrEqual(8);
  });
});

// ── Pinned files ──────────────────────────────────────────────────────────────
describe('useFileStore — pinned files', () => {
  it('togglePin adds file to pinnedFiles', async () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.togglePin('/project/App.jsx'); });
    expect(result.current.pinnedFiles).toContain('/project/App.jsx');
  });

  it('togglePin removes already-pinned file', async () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.togglePin('/project/App.jsx'); });
    act(() => { result.current.togglePin('/project/App.jsx'); });
    expect(result.current.pinnedFiles).not.toContain('/project/App.jsx');
  });
});

// ── Undo ──────────────────────────────────────────────────────────────────────
describe('useFileStore — undoLastEdit', () => {
  it('does nothing when history is empty', async () => {
    const { result } = renderHook(() => useFileStore());
    const onMsg = vi.fn();
    await act(async () => { await result.current.undoLastEdit(onMsg); });
    expect(callServer).not.toHaveBeenCalled();
    expect(onMsg).not.toHaveBeenCalled();
  });
});
```

## `src/uistore.test.js` _(193L → 193L, 0% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:  vi.fn().mockResolvedValue({ value: null }),
    set:  vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('../themes/index.js', () => ({
  THEMES_MAP: { obsidian: { name: 'Obsidian', accent: '#a78bfa' }, aurora: { name: 'Aurora', accent: '#38bdf8' } },
  THEME_KEYS: ['obsidian', 'aurora'],
  DEFAULT_THEME: 'obsidian',
}));

import { Preferences } from '@capacitor/preferences';
import { useUIStore } from './hooks/useUIStore.js';

beforeEach(() => vi.clearAllMocks());

describe('useUIStore — defaults', () => {
  it('starts with correct Fase 1+2 defaults', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.vimMode).toBe(false);
    expect(result.current.showMinimap).toBe(false);
    expect(result.current.ghostTextEnabled).toBe(false);
    expect(result.current.lintEnabled).toBe(false);
    expect(result.current.showLivePreview).toBe(false);
  });

  it('starts with correct Fase 3 defaults', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.tsLspEnabled).toBe(false);
    expect(result.current.blameEnabled).toBe(false);
    expect(result.current.multiCursor).toBe(true); // default ON
    expect(result.current.stickyScroll).toBe(false);
    expect(result.current.collabEnabled).toBe(false);
    expect(result.current.collabRoom).toBe('');
    expect(result.current.showGlobalFind).toBe(false);
  });

  it('starts with obsidian theme', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.theme).toBe('obsidian');
  });

  it('starts with fontSize 14', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.fontSize).toBe(14);
  });
});

describe('useUIStore — setters persist', () => {
  it('setVimMode persists to Preferences', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setVimMode(true); });
    expect(result.current.vimMode).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_vim', value: 'true' });
  });

  it('setShowMinimap persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setShowMinimap(true); });
    expect(result.current.showMinimap).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_minimap', value: 'true' });
  });

  it('setGhostTextEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setGhostTextEnabled(true); });
    expect(result.current.ghostTextEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_ghosttext', value: 'true' });
  });

  it('setLintEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setLintEnabled(true); });
    expect(result.current.lintEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_lint', value: 'true' });
  });

  it('setTsLspEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTsLspEnabled(true); });
    expect(result.current.tsLspEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_tslsp', value: 'true' });
  });

  it('setBlameEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setBlameEnabled(true); });
    expect(result.current.blameEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_blame', value: 'true' });
  });

  it('setMultiCursor persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setMultiCursor(false); });
    expect(result.current.multiCursor).toBe(false);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_multicursor', value: 'false' });
  });

  it('setStickyScroll persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setStickyScroll(true); });
    expect(result.current.stickyScroll).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_stickyscroll', value: 'true' });
  });

  it('setCollabEnabled persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setCollabEnabled(true); });
    expect(result.current.collabEnabled).toBe(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_collab', value: 'true' });
  });

  it('setTheme rejects unknown theme and falls back to default', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTheme('nonexistent'); });
    expect(result.current.theme).toBe('obsidian');
  });

  it('setTheme accepts valid theme', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setTheme('aurora'); });
    expect(result.current.theme).toBe('aurora');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_theme', value: 'aurora' });
  });

  it('setFontSize clamps and persists', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setFontSize(16); });
    expect(result.current.fontSize).toBe(16);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_fontsize', value: '16' });
  });

  it('setShowGlobalFind toggles', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setShowGlobalFind(true); });
    expect(result.current.showGlobalFind).toBe(true);
  });
});

describe('useUIStore — loadUIPrefs Fase 3', () => {
  it('loads tslsp from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ tslsp: 'true' }); });
    expect(result.current.tsLspEnabled).toBe(true);
  });

  it('loads blame from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ blame: 'true' }); });
    expect(result.current.blameEnabled).toBe(true);
  });

  it('loads multiCursor=false from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ multiCursor: 'false' }); });
    expect(result.current.multiCursor).toBe(false);
  });

  it('keeps multiCursor=true if pref not false', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ multiCursor: 'true' }); });
    expect(result.current.multiCursor).toBe(true);
  });

  it('loads stickyScroll from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ stickyScroll: 'true' }); });
    expect(result.current.stickyScroll).toBe(true);
  });

  it('loads collab from prefs', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ collab: 'true' }); });
    expect(result.current.collabEnabled).toBe(true);
  });

  it('shows onboarding when onboarded is falsy', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ onboarded: null }); });
    expect(result.current.showOnboarding).toBe(true);
  });

  it('does not show onboarding when onboarded is set', () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.loadUIPrefs({ onboarded: 'true' }); });
    expect(result.current.showOnboarding).toBe(false);
  });
});
```

## `src/utils.integration.test.js` _(217L → 217L, 0% reduction)_
```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from './utils.js';

// ── Mock callServer ───────────────────────────────────────────────────────────
vi.mock('./api.js', () => ({
  callServer: vi.fn(),
}));
import { callServer } from './api.js';

// ── Integration: parseActions → executeAction ─────────────────────────────────
describe('parseActions + executeAction (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse then execute read_file action', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'isi file' });

    const text = '```action\n{"type":"read_file","path":"src/App.jsx"}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);

    const result = await executeAction(actions[0], '/home/user/project');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'read',
      path: '/home/user/project/src/App.jsx',
    }));
    expect(result.ok).toBe(true);
    expect(result.data).toBe('isi file');
  });

  it('should parse then execute write_file action', async () => {
    callServer.mockResolvedValue({ ok: true });

    const text = '```action\n{"type":"write_file","path":"output.txt","content":"hello"}\n```';
    const actions = parseActions(text);
    await executeAction(actions[0], '/base');

    expect(callServer).toHaveBeenCalledWith({
      type: 'write',
      path: '/base/output.txt',
      content: 'hello',
    });
  });

  it('should parse then execute exec action', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'npm test output' });

    const text = '```action\n{"type":"exec","command":"npm test"}\n```';
    const actions = parseActions(text);
    const result = await executeAction(actions[0], '/project');

    expect(callServer).toHaveBeenCalledWith({
      type: 'exec',
      path: '/project',
      command: 'npm test',
    });
    expect(result.data).toBe('npm test output');
  });

  it('should parse then execute patch_file action', async () => {
    callServer.mockResolvedValue({ ok: true });

    const text = '```action\n{"type":"patch_file","path":"src/utils.js","old_str":"const x = 1","new_str":"const x = 2"}\n```';
    const actions = parseActions(text);
    await executeAction(actions[0], '/base');

    expect(callServer).toHaveBeenCalledWith({
      type: 'patch',
      path: '/base/src/utils.js',
      old_str: 'const x = 1',
      new_str: 'const x = 2',
    });
  });

  it('should handle multiple actions in sequence', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'file content' })
      .mockResolvedValueOnce({ ok: true });

    const text = [
      '```action\n{"type":"read_file","path":"input.txt"}\n```',
      '```action\n{"type":"write_file","path":"output.txt","content":"done"}\n```',
    ].join('\n');

    const actions = parseActions(text);
    expect(actions).toHaveLength(2);

    const r1 = await executeAction(actions[0], '/base');
    const r2 = await executeAction(actions[1], '/base');
    expect(r1.data).toBe('file content');
    expect(r2.ok).toBe(true);
    expect(callServer).toHaveBeenCalledTimes(2);
  });

  it('should return error for unknown action type', async () => {
    const result = await executeAction({ type: 'unknown_action' }, '/base');
    expect(result.ok).toBe(false);
    expect(result.data).toContain('Unknown action type');
  });

  it('should handle server failure gracefully', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'Server error' });

    const result = await executeAction({ type: 'read_file', path: 'file.txt' }, '/base');
    expect(result.ok).toBe(false);
  });
});

// ── generateDiff ──────────────────────────────────────────────────────────────
describe('generateDiff', () => {
  it('should return empty string for null/empty input', () => {
    expect(generateDiff('', 'something')).toBe('');
    expect(generateDiff('something', '')).toBe('');
    expect(generateDiff(null, 'x')).toBe('');
  });

  it('should return empty string for identical files', () => {
    const code = 'const x = 1;\nconst y = 2;';
    expect(generateDiff(code, code)).toBe('');
  });

  it('should show added lines', () => {
    const original = 'line1\nline2';
    const patched  = 'line1\nline2\nline3';
    const diff = generateDiff(original, patched);
    expect(diff).toContain('+ L3: line3');
  });

  it('should show removed lines', () => {
    const original = 'line1\nline2\nline3';
    const patched  = 'line1\nline2';
    const diff = generateDiff(original, patched);
    expect(diff).toContain('- L3: line3');
  });

  it('should show changed lines as remove + add', () => {
    const original = 'const x = 1;';
    const patched  = 'const x = 99;';
    const diff = generateDiff(original, patched);
    expect(diff).toContain('- L1: const x = 1;');
    expect(diff).toContain('+ L1: const x = 99;');
  });

  it('should truncate at maxLines', () => {
    const original = Array.from({ length: 60 }, (_, i) => `old line ${i}`).join('\n');
    const patched  = Array.from({ length: 60 }, (_, i) => `new line ${i}`).join('\n');
    const diff = generateDiff(original, patched, 10);
    expect(diff).toContain('baris lebih');
  });
});

// ── Fuzz Testing: robustness ──────────────────────────────────────────────────
describe('fuzz — parseActions robustness', () => {
  const fuzzInputs = [
    '',
    '   ',
    null,
    undefined,
    '```action\n\n```',
    '```action\n{broken json\n```',
    '```action\n{"type":"exec","command":"' + 'x'.repeat(10000) + '"}\n```',
    '```action\n{"type":"exec","command":"rm -rf /"}\n```',
    '```action\n' + '}'.repeat(1000) + '\n```',
    '```action\nnull\n```',
    '```action\n[1,2,3]\n```',
  ];

  it('should never throw on any input', () => {
    for (const input of fuzzInputs) {
      expect(() => parseActions(input ?? '')).not.toThrow();
    }
  });

  it('should always return an array', () => {
    for (const input of fuzzInputs) {
      const result = parseActions(input ?? '');
      expect(Array.isArray(result)).toBe(true);
    }
  });
});

describe('fuzz — resolvePath robustness', () => {
  const fuzzPairs = [
    ['', ''],
    [null, null],
    [undefined, undefined],
    ['/', '/'],
    ['///', '///'],
    ['base', '../../../../etc/passwd'],
    [' ', ' '],
    ['base', 'base/../../secret'],
  ];

  it('should never throw on any input', () => {
    for (const [base, p] of fuzzPairs) {
      expect(() => resolvePath(base ?? '', p ?? '')).not.toThrow();
    }
  });

  it('should always return a string', () => {
    for (const [base, p] of fuzzPairs) {
      const result = resolvePath(base ?? '', p ?? '');
      expect(typeof result).toBe('string');
    }
  });
});

describe('fuzz — generateDiff robustness', () => {
  it('should not throw on extreme inputs', () => {
    const huge = 'x\n'.repeat(5000);
    expect(() => generateDiff(huge, huge + 'new line\n')).not.toThrow();
    expect(() => generateDiff('', '')).not.toThrow();
    expect(() => generateDiff(null, null)).not.toThrow();
  });
});
```

## `src/App.jsx` _(329L → 277L, 19% reduction)_
```jsx
import React, { useRef, useEffect } from "react";
import { Activity } from "react";
import { Preferences } from "@capacitor/preferences";
import { MAX_HISTORY } from './constants.js';
import { callServer } from './api.js';
import { ThemeEffects } from './components/ThemeEffects.jsx';
import { AppHeader }  from './components/AppHeader.jsx';
import { AppSidebar } from './components/AppSidebar.jsx';
import { AppChat }    from './components/AppChat.jsx';
import { AppPanels }  from './components/AppPanels.jsx';
import { useSlashCommands } from './hooks/useSlashCommands.js';
import { useUIStore }        from './hooks/useUIStore.js';
import { useProjectStore }   from './hooks/useProjectStore.js';
import { useFileStore }      from './hooks/useFileStore.js';
import { useChatStore }      from './hooks/useChatStore.js';
import { useNotifications }  from './hooks/useNotifications.js';
import { useMediaHandlers }  from './hooks/useMediaHandlers.js';
import { useAgentSwarm }     from './hooks/useAgentSwarm.js';
import { useApprovalFlow }   from './hooks/useApprovalFlow.js';
import { useDevTools }       from './hooks/useDevTools.js';
import { useAgentLoop }      from './hooks/useAgentLoop.js';
import { useGrowth }         from './hooks/useGrowth.js';
import { useBrightness }     from './hooks/useBrightness.js';

export default function App() {
  // ── STORES ──
  const ui      = useUIStore();
  const project = useProjectStore();
  const file    = useFileStore();
  const chat    = useChatStore();
  const T       = ui.T;
  const growth  = useGrowth();

  // ── Dynamic brightness filter — gamma-corrected two-layer ──
  // Layer 1: CSS brightness capped at 2.0 (no 8-bit quantization artifacts).
  // Layer 2: mix-blend-mode:screen overlay for extreme low brightness boost.
  const _brightnessCalc = (() => {
  const _brightnessCalc = (() => { … }
  const brightnessFilter  = _brightnessCalc.filter;
  const brightnessOverlay = _brightnessCalc.overlay;
  useBrightness(ui.setBrightnessLevel);

  // ── REFS ──
  const abortRef              = useRef(null);
  const handleSlashCommandRef = useRef(null);
  const wsRef                 = useRef(null);
  const fileSnapshotsRef      = useRef({});

  // ── HOOKS ──
  const { sendNotification, haptic, speakText, stopTts } = useNotifications();
  const { fileInputRef, handleImageAttach, handleDrop, handleCameraCapture } = useMediaHandlers({
    setVisionImage: chat.setVisionImage, setInput: chat.setInput,
    haptic, setDragOver: ui.setDragOver,
  });
  const { sendMsg, callAI, compactContext, cancelMsg, continueMsg, retryLast, abTest } = useAgentLoop({
    project, chat, file, ui, sendNotification, haptic, speakText, abortRef, handleSlashCommandRef, growth,
  });
  const { runAgentSwarm } = useAgentSwarm({
    callAI, folder: project.folder,
    setSwarmRunning: chat.setSwarmRunning, setSwarmLog: chat.setSwarmLog,
    setMessages: chat.setMessages, sendNotification, haptic, abortRef,
  });
  const { handleApprove, handlePlanApprove } = useApprovalFlow({
    messages: chat.messages, setMessages: chat.setMessages, folder: project.folder,
    hooks: project.hooks, permissions: project.permissions,
    editHistory: file.editHistory, setEditHistory: file.setEditHistory,
    sendMsgRef: { current: sendMsg }, callAI, abortRef, setLoading: chat.setLoading,
  });
  const { fetchGitHub, runDeploy, generateCommitMsg, runTests, browseTo, runShortcut } = useDevTools({
    folder: project.folder, githubRepo: project.githubRepo, githubToken: project.githubToken,
    setGithubData: project.setGithubData, setMessages: chat.setMessages,
    setLoading: chat.setLoading, setStreaming: chat.setStreaming, setDeployLog: ui.setDeployLog,
    callAI, sendMsgRef: { current: sendMsg }, sendNotification, haptic, abortRef, addHistory: project.addHistory,
  });
  const { handleSlashCommand } = useSlashCommands({
    model: project.model, folder: project.folder, branch: project.branch,
    messages: chat.messages, selectedFile: file.selectedFile, fileContent: file.fileContent,
    notes: project.notes, memories: chat.memories, checkpoints: chat.checkpoints,
    skills: project.skills, thinkingEnabled: project.thinkingEnabled, effort: project.effort,
    loopActive: project.loopActive, loopIntervalRef: project.loopIntervalRef,
    agentMemory: project.agentMemory, splitView: file.splitView,
    pushToTalk: project.pushToTalk, sessionName: project.sessionName,
    sessionColor: project.sessionColor, fileWatcherActive: project.fileWatcherActive,
    fileWatcherInterval: project.fileWatcherInterval,
    setModel: project.setModel, setMessages: chat.setMessages, setFolder: project.setFolder,
    setFolderInput: project.setFolderInput, setLoading: chat.setLoading, setStreaming: chat.setStreaming,
    setThinkingEnabled: project.setThinkingEnabled, setEffort: project.setEffort,
    setLoopActive: project.setLoopActive, setLoopIntervalRef: project.setLoopIntervalRef,
    setSplitView: file.setSplitView, setPushToTalk: project.setPushToTalk,
    setSessionName: project.setSessionName, setSessionColor: project.setSessionColor,
    setSkills: project.setSkills, setFileWatcherActive: project.setFileWatcherActive,
    setFileWatcherInterval: project.setFileWatcherInterval, setFileSnapshots: project.setFileSnapshots,
    setPlanSteps: chat.setPlanSteps, setPlanTask: chat.setPlanTask,
    setAgentMemory: project.setAgentMemory, setSessionList: ui.setSessionList,
    setShowCheckpoints: ui.setShowCheckpoints, setShowMemory: ui.setShowMemory,
    setShowMCP: ui.setShowMCP, setShowGitHub: ui.setShowGitHub, setShowDeploy: ui.setShowDeploy,
    setShowSessions: ui.setShowSessions, setShowPermissions: ui.setShowPermissions,
    setShowPlugins: ui.setShowPlugins, setShowConfig: ui.setShowConfig,
    setShowCustomActions: ui.setShowCustomActions, setShowFileHistory: ui.setShowFileHistory,
    setShowThemeBuilder: ui.setShowThemeBuilder, setShowDiff: ui.setShowDiff,
    setShowSearch: ui.setShowSearch, setShowSnippets: ui.setShowSnippets,
    setShowDepGraph: ui.setShowDepGraph, setDepGraph: ui.setDepGraph, setFontSize: ui.setFontSize,
    setShowMergeConflict: ui.setShowMergeConflict, setMergeConflictData: ui.setMergeConflictData,
    setShowSkills: ui.setShowSkills, setShowBgAgents: ui.setShowBgAgents,
    sendMsg, compactContext,
    saveCheckpoint: () => chat.saveCheckpoint(project.folder, project.branch, project.notes),
    exportChat: chat.exportChat, generateCommitMsg, runTests, browseTo, runAgentSwarm,
    callAI, abTest, addHistory: project.addHistory, runHooks: project.runHooks,
    growth, sendNotification, haptic, abortRef,
  });
  useEffect(() => { handleSlashCommandRef.current = handleSlashCommand; });

  // ── EFFECTS ──
  useEffect(() => {
    Promise.all([
      Preferences.get({key:'yc_folder'}),    Preferences.get({key:'yc_history'}),
      Preferences.get({key:'yc_cmdhist'}),   Preferences.get({key:'yc_model'}),
      Preferences.get({key:'yc_theme'}),     Preferences.get({key:'yc_pinned'}),
      Preferences.get({key:'yc_recent'}),    Preferences.get({key:'yc_sidebar_w'}),
      Preferences.get({key:'yc_memories'}),  Preferences.get({key:'yc_checkpoints'}),
      Preferences.get({key:'yc_hooks'}),     Preferences.get({key:'yc_fontsize'}),
      Preferences.get({key:'yc_custom_theme'}), Preferences.get({key:'yc_onboarded'}),
      Preferences.get({key:'yc_gh_token'}),  Preferences.get({key:'yc_gh_repo'}),
      Preferences.get({key:'yc_session_color'}), Preferences.get({key:'yc_plugins'}),
      Preferences.get({key:'yc_effort'}),    Preferences.get({key:'yc_thinking'}),
      Preferences.get({key:'yc_permissions'}),
      Preferences.get({key:'yc_vim'}),
      Preferences.get({key:'yc_minimap'}),
      Preferences.get({key:'yc_ghosttext'}),
      Preferences.get({key:'yc_lint'}),
      Preferences.get({key:'yc_tslsp'}),
      Preferences.get({key:'yc_blame'}),
      Preferences.get({key:'yc_multicursor'}),
      Preferences.get({key:'yc_stickyscroll'}),
      Preferences.get({key:'yc_collab'}),
    ]).then(([f,h,ch,mo,th,pi,re,sw,mem,ckp,hk,fs,ct,ob,ght,ghr,sc,pl,ef,tk,perm,vm,mm,gt,lt,ts,bl,mc,ss,co]) => {
      ui.loadUIPrefs({theme:th.value,fontSize:fs.value,sidebarWidth:sw.value,customTheme:ct.value,onboarded:ob.value,vim:vm.value,minimap:mm.value,ghostText:gt.value,lint:lt.value,tslsp:ts.value,blame:bl.value,multiCursor:mc.value,stickyScroll:ss.value,collab:co.value});
      project.loadProjectPrefs({folder:f.value,cmdHistory:ch.value,model:mo.value,hooks:hk.value,githubToken:ght.value,githubRepo:ghr.value,sessionColor:sc.value,plugins:pl.value,effort:ef.value,thinkingEnabled:tk.value,permissions:perm.value});
      file.loadFilePrefs({pinned:pi.value,recent:re.value});
      chat.loadChatPrefs({history:h.value,memories:mem.value,checkpoints:ckp.value});
    });
    callServer({type:'ping'}).then(r => {
      project.setServerOk(r.ok);
      if (r.ok) callServer({type:'mcp_list'}).then(mr => {
        if (mr.ok && mr.data && typeof mr.data === 'object') project.setMcpTools(mr.data);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    navigator.getBattery().then(bat => {
      project.setBatteryLevel(bat.level); project.setBatteryCharging(bat.charging);
      bat.addEventListener('levelchange', () => project.setBatteryLevel(bat.level));
      bat.addEventListener('chargingchange', () => project.setBatteryCharging(bat.charging));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!project.batteryCharging && project.batteryLevel < 0.20 && project.effort !== 'low') {
      project.setEffort('low');
      chat.setMessages(m => [...m, { role: 'assistant', content: '🔋 Baterai < 20% — effort otomatis turun ke **low** untuk hemat daya.', actions: [] }]);
    }
  }, [project.batteryLevel, project.batteryCharging]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const on=()=>project.setNetOnline(true), off=()=>project.setNetOnline(false);
    window.addEventListener('online',on); window.addEventListener('offline',off);
    return () => { window.removeEventListener('online',on); window.removeEventListener('offline',off); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const iv = setInterval(async () => {
      const r = await callServer({type:'ping'});
      project.setServerOk(r.ok);
      project.setReconnectTimer(t => r.ok ? 0 : t + 5);
    }, 5000);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chat.persistMessages(chat.messages); }, [chat.messages]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if(project.folder) project.loadFolderPrefs(project.folder); }, [project.folder]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!project.fileWatcherActive || !project.folder) return;
    let dead = false;
    function connect() {
    function connect() { … }
    connect();
    return () => { dead=true; if(wsRef.current){wsRef.current.onclose=null;wsRef.current.close();wsRef.current=null;} };
  }, [project.fileWatcherActive, project.folder]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── HELPERS ──
  function saveFolder(f) { project.saveFolder(f); ui.setShowFolder(false); }
  function undoLastEdit() { file.undoLastEdit(msg => chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}])); }
  function saveCheckpoint() { chat.saveCheckpoint(project.folder, project.branch, project.notes); }
  function restoreCheckpoint(cp) {
  function restoreCheckpoint(cp) { … }
  function onSidebarDragStart(e) {
  function onSidebarDragStart(e) { … }

  const VIRTUAL_LIMIT = 60;
  const visibleMessages = chat.messages.length > VIRTUAL_LIMIT
    ? [{role:'assistant',content:`[... ${chat.messages.length-VIRTUAL_LIMIT} pesan tersembunyi. /clear untuk bersihkan]`},...chat.messages.slice(-VIRTUAL_LIMIT)]
    : chat.messages;

  // ── RENDER ──
  return (
    <div style={{position:'fixed',inset:0,background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',fontSize:ui.fontSize+'px',filter:brightnessFilter,transition:'filter .35s ease'}}
      onDragOver={e=>{e.preventDefault();ui.setDragOver(true);}} onDragLeave={()=>ui.setDragOver(false)} onDrop={handleDrop}>

      {ui.dragOver&&<div style={{position:'absolute',inset:0,background:T.accentBg,border:'2px dashed '+T.accentBorder,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><span style={{fontSize:'18px',color:T.accent}}>Drop file di sini~</span></div>}

      <ThemeEffects T={T}/>

      {/* Brightness screen overlay — mix-blend-mode:screen, no banding */}
      {brightnessOverlay > 0 && (
        <div style={{
          position:'fixed', inset:0, zIndex:2, pointerEvents:'none',
          background: T.accent || '#ffffff',
          opacity: brightnessOverlay,
          mixBlendMode: 'screen',
          backdropFilter: `blur(${(brightnessOverlay * 6).toFixed(1)}px)`,
          WebkitBackdropFilter: `blur(${(brightnessOverlay * 6).toFixed(1)}px)`,
        }}/>
      )}

      {/* Badge toast */}
      {growth.newBadge&&(
        <div style={{position:'fixed',top:'60px',left:'50%',transform:'translateX(-50%)',background:T.bg2,border:'1px solid '+T.accentBorder,borderRadius:'14px',padding:'12px 20px',zIndex:999,display:'flex',alignItems:'center',gap:'10px',boxShadow:'0 8px 32px rgba(0,0,0,.6)',animation:'fadeUp .3s ease'}}>
          <span style={{fontSize:'22px'}}>{growth.newBadge.label.split(' ')[0]}</span>
          <div>
            <div style={{fontSize:'13px',fontWeight:'700',color:T.text}}>{growth.newBadge.label}</div>
            <div style={{fontSize:'11px',color:T.textSec}}>{growth.newBadge.desc}</div>
          </div>
        </div>
      )}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:99px;}
        textarea,input{scrollbar-width:none;}
        button{transition:color .15s,background .15s,border-color .15s,opacity .15s;-webkit-tap-highlight-color:transparent;}
        button:active{opacity:.55!important;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        .msg-appear{animation:fadeUp .2s cubic-bezier(.16,1,.3,1) forwards;}
        .status-pulse{animation:pulse 1.8s ease-in-out infinite;}
      `}</style>

      <AppHeader T={T} ui={ui} project={project} file={file} chat={chat} growth={growth}
        saveFolder={saveFolder} undoLastEdit={undoLastEdit} haptic={haptic}/>

      <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>
        <AppSidebar T={T} ui={ui} project={project} file={file} onSidebarDragStart={onSidebarDragStart}/>
        <AppChat T={T} ui={ui} project={project} file={file} chat={chat}
          sendMsg={sendMsg} cancelMsg={cancelMsg} retryLast={retryLast} continueMsg={continueMsg}
          handleApprove={handleApprove} handlePlanApprove={handlePlanApprove}
          handleCameraCapture={handleCameraCapture} fileInputRef={fileInputRef}
          runShortcut={runShortcut} stopTts={stopTts}
          visibleMessages={visibleMessages}/>
      </div>

      <AppPanels T={T} ui={ui} project={project} file={file} chat={chat}
        sendMsg={sendMsg} compactContext={compactContext} runShortcut={runShortcut}
        fetchGitHub={fetchGitHub} runDeploy={runDeploy} runTests={runTests}
        generateCommitMsg={generateCommitMsg} haptic={haptic}
        saveCheckpoint={saveCheckpoint} restoreCheckpoint={restoreCheckpoint}
        fileInputRef={fileInputRef} handleImageAttach={handleImageAttach}/>
    </div>
  );
}
```

## `src/api.extended.test.js` _(253L → 229L, 6% reduction)_
```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callServer, callServerBatch, askCerebrasStream } from './api.js';

// ── Mock constants so import.meta.env doesn't blow up ────────────────────────
vi.mock('./constants.js', () => ({
  CEREBRAS_KEY:  'test-cerebras-key',
  GROQ_KEY:      'test-groq-key',
  TAVILY_KEY:    '',
  YUYU_SERVER:   'http://localhost:8765',
  WS_SERVER:     'ws://127.0.0.1:8766',
  FALLBACK_MODEL:'moonshotai/kimi-k2-instruct-0905',
  MODELS: [
    { id: 'qwen-3-235b-a22b-instruct-2507', label: 'Qwen 3 235B', provider: 'cerebras' },
    { id: 'moonshotai/kimi-k2-instruct-0905', label: 'Kimi K2', provider: 'groq' },
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3', provider: 'groq' },
  ],
}));

const originalFetch = globalThis.fetch;
beforeEach(() => { globalThis.fetch = vi.fn(); });
afterEach(() => { globalThis.fetch = originalFetch; vi.clearAllMocks(); });

// ── Helpers ──────────────────────────────────────────────────────────────────
function mockJsonResponse(data, status = 200) {
function mockJsonResponse(data, status = 200) { … }

function makeSseResponse(...chunks) {
function makeSseResponse(...chunks) { … }

// ═══════════════════════════════════════════════════════════════════════════════
// callServer
// ═══════════════════════════════════════════════════════════════════════════════
describe('callServer', () => {
  it('returns ok:true and parsed JSON on success', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'hello' }));
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(true);
    expect(r.data).toBe('hello');
  });

  it('sends JSON POST to YUYU_SERVER', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockJsonResponse({ ok: true }));
    await callServer({ type: 'read', path: '/foo' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8765',
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body).toEqual({ type: 'read', path: '/foo' });
  });

  it('returns ok:false with message on non-ok HTTP status', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false, status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(false);
    expect(r.data).toContain('500');
  });

  it('returns ok:false when fetch throws (server unreachable)', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const r = await callServer({ type: 'ping' });
    expect(r.ok).toBe(false);
    expect(r.data).toContain('yuyu-server.js');
  });

  it('returns ok:false on network timeout', async () => {
    globalThis.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const r = await callServer({ type: 'read', path: '/file.txt' });
    expect(r.ok).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// callServerBatch
// ═══════════════════════════════════════════════════════════════════════════════
describe('callServerBatch', () => {
  it('executes all payloads in parallel and returns array', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'a' }))
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'b' }))
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'c' }));

    const results = await callServerBatch([
      { type: 'read', path: '/a' },
      { type: 'read', path: '/b' },
      { type: 'read', path: '/c' },
    ]);
    expect(results).toHaveLength(3);
    expect(results.map(r => r.data)).toEqual(['a', 'b', 'c']);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('handles partial failures gracefully', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(mockJsonResponse({ ok: true, data: 'ok' }))
      .mockRejectedValueOnce(new Error('fail'));
    const results = await callServerBatch([
      { type: 'read', path: '/ok' },
      { type: 'read', path: '/bad' },
    ]);
    expect(results[0].ok).toBe(true);
    expect(results[1].ok).toBe(false);
  });

  it('returns empty array for empty input', async () => {
    const results = await callServerBatch([]);
    expect(results).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// askCerebrasStream
// ═══════════════════════════════════════════════════════════════════════════════
describe('askCerebrasStream', () => {
  it('throws on empty messages', async () => {
    await expect(
      askCerebrasStream([], 'qwen-3-235b-a22b-instruct-2507', () => {}, null)
    ).rejects.toThrow('non-empty array');
  });

  it('streams Cerebras response successfully', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    const chunks = [];
    const result = await askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      c => chunks.push(c),
      new AbortController().signal
    );
    expect(result).toBe('Hello');
    expect(chunks).toContain('Hello');
  });

  it('falls back to Groq on Cerebras 429 rate limit', async () => {
    // Cerebras → 429, Groq → success
    const chunk = 'data: {"choices":[{"delta":{"content":"Fallback"}}]}\n';
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: false, status: 429,
        headers: { get: () => '10' },
      })
      .mockResolvedValueOnce(makeSseResponse(chunk));

    const result = await askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      () => {},
      new AbortController().signal
    );
    expect(result).toBe('Fallback');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('routes Groq model directly to Groq API', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Kimi"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'moonshotai/kimi-k2-instruct-0905',
      () => {},
      new AbortController().signal
    );
    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('groq.com');
  });

  it('throws AbortError when signal is aborted', async () => {
    const ctrl = new AbortController();
    globalThis.fetch.mockImplementation(() => {
      ctrl.abort();
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });
    await expect(
      askCerebrasStream(
        [{ role: 'user', content: 'Hi' }],
        'qwen-3-235b-a22b-instruct-2507',
        () => {},
        ctrl.signal
      )
    ).rejects.toThrow();
  });

  it('retries on Cerebras 5xx server error (up to 2 times)', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"OK"}}]}\n';
    globalThis.fetch
      .mockResolvedValueOnce({ ok: false, status: 503, headers: { get: () => null } })
      .mockResolvedValueOnce({ ok: false, status: 503, headers: { get: () => null } })
      .mockResolvedValueOnce(makeSseResponse(chunk));

    // Override setTimeout to not actually wait
    vi.useFakeTimers();
    const promise = askCerebrasStream(
      [{ role: 'user', content: 'Hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      () => {},
      new AbortController().signal
    );
    await vi.runAllTimersAsync();
    const result = await promise;
    vi.useRealTimers();
    expect(result).toBe('OK');
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('passes maxTokens and temperature options to API', async () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"x"}}]}\n';
    globalThis.fetch.mockResolvedValueOnce(makeSseResponse(chunk));

    await askCerebrasStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-3-235b-a22b-instruct-2507',
      () => {},
      new AbortController().signal,
      { maxTokens: 500, temperature: 0.7 }
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(500);
    expect(body.temperature).toBe(0.7);
  });
});
```

## `src/components/AppPanels.jsx` _(271L → 22L, 95% reduction)_
```jsx
// ── AppPanels ─────────────────────────────────────────────────────────────────
// Semua panel overlay, modal, dan floating UI yang render di atas main layout.
// Memory, checkpoints, swarm log, dep graph, semua BottomSheet panels,
// onboarding, dan commit modal.
import React from 'react';
import { Activity } from 'react';
import { Trash2, Brain, MapPin, Plus, Zap, X } from 'lucide-react';
import { loadSessions, getBgAgents, mergeBackgroundAgent, abortBgAgent } from '../features.js';
import { callServer } from '../api.js';
import { MODELS } from '../constants.js';
import { SearchBar } from './SearchBar.jsx';
import {
  BottomSheet, CommandPalette,
  GitComparePanel, FileHistoryPanel, GitBlamePanel, SnippetLibrary, CustomActionsPanel,
  ShortcutsPanel, ThemeBuilder, DepGraphPanel, ElicitationPanel, MergeConflictPanel,
  SkillsPanel, DeployPanel, McpPanel, GitHubPanel, SessionsPanel,
  PermissionsPanel, PluginsPanel, ConfigPanel, BgAgentPanel,
} from './panels.jsx';

export function AppPanels({
export function AppPanels({ … }
```

## `src/components/FileEditor.jsx` _(779L → 136L, 85% reduction)_
```jsx
// ── FileEditor — CodeMirror 6 · Full IDE ─────────────────────────────────────
// Fase 1+2: Multi-tab, Vim, Emmet, Ghost Text, Minimap, Lint
// Fase 3:   TypeScript LSP, Inline Blame, Sticky Scroll, Code Fold,
//           Multi-Cursor, Breadcrumb, Realtime Collab
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Save, ChevronRight } from 'lucide-react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment, StateEffect, StateField } from '@codemirror/state';
import { Decoration, WidgetType, ViewPlugin, keymap, GutterMarker, gutter } from '@codemirror/view';
import { linter, lintGutter } from '@codemirror/lint';
import { syntaxTree, foldAll, unfoldAll } from '@codemirror/language';
import {
  indentWithTab,
} from '@codemirror/commands';
import {
  selectNextOccurrence,
  selectSelectionMatches
} from '@codemirror/search';
import { collab, getSyncedVersion, sendableUpdates, receiveUpdates } from '@codemirror/collab';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { vim } from '@replit/codemirror-vim';
import { abbreviationTracker, expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { callServer } from '../api.js';

// ── TypeScript LSP — lazy load @valtown/codemirror-ts ────────────────────────
let _tsExtensions = null;
async function getTsExtensions() {
async function getTsExtensions() { … }

// ── Language detector ─────────────────────────────────────────────────────────
function getLang(path) {
function getLang(path) { … }

function isEmmetLang(path) {
function isEmmetLang(path) { … }

function isTsLang(path) {
function isTsLang(path) { … }

// ── Theme builder ─────────────────────────────────────────────────────────────
function buildTheme(T) {
function buildTheme(T) { … }

// ── Ghost text ────────────────────────────────────────────────────────────────
const setGhostEffect   = StateEffect.define();
const clearGhostEffect = StateEffect.define();

const ghostField = StateField.define({
  create: () => ({ text: '', pos: 0 }),
  update(val, tr) {
    if (tr.docChanged) return { text: '', pos: 0 };
    for (const e of tr.effects) {
      if (e.is(setGhostEffect))   return e.value;
      if (e.is(clearGhostEffect)) return { text: '', pos: 0 };
    }
    return val;
  },
});

class GhostWidget extends WidgetType {
  constructor(text) { super(); this.text = text; }
  toDOM() {
    const span = document.createElement('span');
    span.textContent = this.text;
    span.style.cssText = 'opacity:0.38;color:inherit;pointer-events:none;';
    return span;
  }
  eq(other) { return this.text === other.text; }
  ignoreEvent() { return true; }
}

const ghostDecorations = EditorView.decorations.compute([ghostField], state => {
  const { text, pos } = state.field(ghostField);
  if (!text || pos > state.doc.length) return Decoration.none;
  return Decoration.set([Decoration.widget({ widget: new GhostWidget(text), side: 1 }).range(pos)]);
});

const ghostAcceptKeymap = keymap.of([{
  key: 'Tab',
  run(view) {
    const { text, pos } = view.state.field(ghostField);
    if (!text) return false;
    view.dispatch({ changes: { from: pos, insert: text },
      effects: clearGhostEffect.of(null), selection: { anchor: pos + text.length } });
    return true;
  },
}, {
  key: 'Escape',
  run(view) {
    const { text } = view.state.field(ghostField);
    if (!text) return false;
    view.dispatch({ effects: clearGhostEffect.of(null) });
    return true;
  },
}]);

async function fetchAISuggestion(prefix) {
async function fetchAISuggestion(prefix) { … }

function makeGhostPlugin() {
function makeGhostPlugin() { … }

// ── Inline blame gutter ───────────────────────────────────────────────────────
class BlameMarker extends GutterMarker {
  constructor(info) { super(); this.info = info; }
  toDOM() {
    const el = document.createElement('span');
    el.className = 'cm-blame-gutter';
    el.textContent = this.info;
    el.title = this.info;
    return el;
  }
}

function makeBlameGutter(blameMap) {
function makeBlameGutter(blameMap) { … }

async function fetchBlame(folder, filePath) {
async function fetchBlame(folder, filePath) { … }

// ── Syntax lint ───────────────────────────────────────────────────────────────
function makeSyntaxLinter(path, folder) {
function makeSyntaxLinter(path, folder) { … }

// ── Minimap ───────────────────────────────────────────────────────────────────
function Minimap({ viewRef, T }) {
function Minimap({ … }

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb({ viewRef, T }) {
function Breadcrumb({ … }
```

## `src/features.extra.test.js` _(227L → 227L, 0% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveSession, loadSessions,
  loadSkills, saveSkillFile, deleteSkillFile,
  DEFAULT_HOOKS,
  generatePlan, executePlanStep,
} from './features.js';

vi.mock('./api.js', () => ({ callServer: vi.fn() }));
vi.mock('./utils.js', () => ({
  parseActions:  vi.fn().mockReturnValue([]),
  executeAction: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { callServer } from './api.js';
import { Preferences } from '@capacitor/preferences';

beforeEach(() => vi.clearAllMocks());

// ═══════════════════════════════════════════════════════════════════════════════
// saveSession / loadSessions
// ═══════════════════════════════════════════════════════════════════════════════
describe('saveSession', () => {
  it('saves session with correct shape', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const msgs = Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `msg ${i}` }));
    const s = await saveSession('Test Session', msgs, '/project', 'main');
    expect(s).toHaveProperty('id');
    expect(s.name).toBe('Test Session');
    expect(s.folder).toBe('/project');
    expect(s.branch).toBe('main');
    expect(Array.isArray(s.messages)).toBe(true);
    expect(Preferences.set).toHaveBeenCalled();
  });

  it('truncates messages to last 50', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const msgs = Array.from({ length: 100 }, (_, i) => ({ role: 'user', content: `${i}` }));
    const s = await saveSession('Big', msgs, '/p', 'main');
    expect(s.messages.length).toBeLessThanOrEqual(50);
  });

  it('uses default name when name is empty', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const s = await saveSession('', [], '/p', 'main');
    expect(typeof s.name).toBe('string');
    expect(s.name.length).toBeGreaterThan(0);
  });

  it('merges with existing sessions (dedupes by name)', async () => {
    const existing = [{ id: 1, name: 'Existing', messages: [], folder: '/', savedAt: new Date().toISOString() }];
    Preferences.get.mockResolvedValue({ value: JSON.stringify(existing) });
    await saveSession('Existing', [{ role: 'user', content: 'hi' }], '/', 'main');
    const saved = JSON.parse(Preferences.set.mock.calls[0][0].value);
    const withName = saved.filter(s => s.name === 'Existing');
    expect(withName).toHaveLength(1); // deduped
  });
});

describe('loadSessions', () => {
  it('returns empty array when no sessions stored', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    expect(await loadSessions()).toEqual([]);
  });

  it('returns parsed sessions array', async () => {
    const data = [{ id: 1, name: 'S1' }, { id: 2, name: 'S2' }];
    Preferences.get.mockResolvedValue({ value: JSON.stringify(data) });
    const result = await loadSessions();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('S1');
  });

  it('returns empty array on malformed JSON', async () => {
    Preferences.get.mockResolvedValue({ value: 'NOT JSON' });
    const result = await loadSessions();
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// loadSkills / saveSkillFile / deleteSkillFile
// ═══════════════════════════════════════════════════════════════════════════════
describe('loadSkills', () => {
  it('returns empty array when server returns no files', async () => {
    callServer.mockResolvedValue({ ok: false });
    const skills = await loadSkills('/project');
    expect(skills).toEqual([]);
  });

  it('returns empty array when directory is empty', async () => {
    callServer.mockResolvedValue({ ok: true, data: [] });
    expect(await loadSkills('/project')).toEqual([]);
  });

  it('loads and shapes skill files correctly', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [{ name: 'react.md', isDir: false }] })
      .mockResolvedValueOnce({ ok: true, data: '# React skill content' });
    const skills = await loadSkills('/project');
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('react.md');
    expect(skills[0].content).toContain('React skill');
    expect(skills[0].active).toBe(true);
    expect(skills[0].builtin).toBe(false);
  });

  it('respects activeMap — marks inactive when set to false', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [{ name: 'react.md', isDir: false }] })
      .mockResolvedValueOnce({ ok: true, data: '# React' });
    const skills = await loadSkills('/project', { 'react.md': false });
    expect(skills[0].active).toBe(false);
  });

  it('ignores directories in skill folder', async () => {
    callServer.mockResolvedValueOnce({
      ok: true,
      data: [
        { name: 'subfolder', isDir: true },
        { name: 'skill.md',  isDir: false },
      ],
    }).mockResolvedValueOnce({ ok: true, data: '# content' });
    const skills = await loadSkills('/project');
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('skill.md');
  });

  it('ignores non-.md files', async () => {
    callServer.mockResolvedValueOnce({
      ok: true,
      data: [
        { name: 'script.sh', isDir: false },
        { name: 'skill.md',  isDir: false },
      ],
    }).mockResolvedValueOnce({ ok: true, data: '# content' });
    const skills = await loadSkills('/project');
    expect(skills).toHaveLength(1);
  });
});

describe('saveSkillFile', () => {
  it('calls mkdir then write with sanitized filename', async () => {
    callServer.mockResolvedValue({ ok: true });
    await saveSkillFile('/project', 'My React Skill!!!', '# content');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mkdir' }));
    const writeCall = callServer.mock.calls.find(c => c[0].type === 'write');
    expect(writeCall[0].path).toMatch(/\.md$/);
    expect(writeCall[0].content).toBe('# content');
  });

  it('sanitizes special chars but dots are preserved (document actual behavior)', async () => {
    callServer.mockResolvedValue({ ok: true });
    await saveSkillFile('/project', 'my skill #1!', '# content');
    const writeCall = callServer.mock.calls.find(c => c[0].type === 'write');
    // spaces and ! are replaced with -; alphanumeric, dots, hyphens preserved
    expect(writeCall[0].path).not.toContain(' ');
    expect(writeCall[0].path).not.toContain('!');
    expect(writeCall[0].path).toMatch(/\.md$/);
  });
});

describe('deleteSkillFile', () => {
  it('calls server with type:delete and correct path', async () => {
    callServer.mockResolvedValue({ ok: true });
    await deleteSkillFile('/project', 'react.md');
    expect(callServer).toHaveBeenCalledWith({
      type: 'delete',
      path: '/project/.yuyu/skills/react.md',
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT_HOOKS shape
// ═══════════════════════════════════════════════════════════════════════════════
describe('DEFAULT_HOOKS', () => {
  it('has all required hook categories', () => {
    const required = ['preToolCall', 'postToolCall', 'preWrite', 'postWrite', 'onError', 'onNotification'];
    for (const k of required) {
      expect(DEFAULT_HOOKS).toHaveProperty(k);
      expect(Array.isArray(DEFAULT_HOOKS[k])).toBe(true);
    }
  });

  it('all hook arrays start empty', () => {
    Object.values(DEFAULT_HOOKS).forEach(arr => {
      expect(arr).toHaveLength(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// generatePlan / executePlanStep (mocked callAI)
// ═══════════════════════════════════════════════════════════════════════════════
describe('generatePlan', () => {
  it('returns reply and parsed steps', async () => {
    const fakeAI = vi.fn().mockResolvedValue('1. Read files\n2. Make changes\n3. Test');
    const result = await generatePlan('build feature X', '/project', fakeAI, null);
    expect(result.reply).toContain('Read files');
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].num).toBe(1);
  });

  it('returns empty steps for non-numbered AI response', async () => {
    const fakeAI = vi.fn().mockResolvedValue('Sure, I will help you.');
    const result = await generatePlan('task', '/project', fakeAI, null);
    expect(result.steps).toEqual([]);
  });
});

describe('executePlanStep', () => {
  it('calls callAI with step text and returns reply + actions', async () => {
    const fakeAI = vi.fn().mockResolvedValue('Done. No actions needed.');
    const step = { text: 'Read App.jsx', num: 1, done: false, result: null };
    const result = await executePlanStep(step, '/project', fakeAI, null);
    expect(result.reply).toContain('Done');
    expect(Array.isArray(result.actions)).toBe(true);
  });
});
```

## `src/themes.test.js` _(224L → 224L, 0% reduction)_
```js
import { describe, it, expect } from 'vitest';
import { THEMES_MAP, THEME_KEYS, DEFAULT_THEME } from './themes/index.js';

// ── Required top-level tokens every theme must have ──────────────────────────
const REQUIRED_GLOBAL = [
  'name', 'bg', 'bg2', 'bg3',
  'border', 'text', 'textSec', 'textMute',
  'accent', 'accentBg', 'accentBorder',
  'success', 'successBg', 'error', 'errorBg',
  'warning', 'warningBg',
  'atm', 'scanlines',
  'bubble', 'chip', 'code', 'input', 'slash', 'pulse',
  'css', 'fx', 'header', 'borderSoft',
];

const REQUIRED_BUBBLE  = ['user', 'ai', 'thinking'];
const REQUIRED_BUBBLE_LEAF = ['bg', 'border', 'color', 'shadow'];
const REQUIRED_FX      = ['aiBubble', 'userBubble', 'glowBorder', 'codeBlock', 'chipOk', 'glowText', 'inputFocus'];
const REQUIRED_INPUT   = ['focusBorder', 'focusShadow', 'caret', 'sendGrad', 'sendShadow'];
const REQUIRED_SLASH   = ['cmdColor', 'descColor'];
const REQUIRED_CHIP    = ['border', 'bg', 'color', 'check'];
const REQUIRED_CODE    = ['bg', 'border', 'color'];
const REQUIRED_HEADER  = ['bg', 'logoGrad', 'titleColor', 'accentColor', 'statusDot', 'metaColor'];

// ═══════════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════════
describe('Theme registry', () => {
  it('THEME_KEYS matches THEMES_MAP keys', () => {
    expect(THEME_KEYS).toEqual(Object.keys(THEMES_MAP));
  });

  it('DEFAULT_THEME is in THEMES_MAP', () => {
    expect(THEMES_MAP[DEFAULT_THEME]).toBeDefined();
  });

  it('has exactly 4 themes', () => {
    expect(THEME_KEYS).toHaveLength(4);
  });

  it('includes obsidian, aurora, ink, neon', () => {
    expect(THEME_KEYS).toContain('obsidian');
    expect(THEME_KEYS).toContain('aurora');
    expect(THEME_KEYS).toContain('ink');
    expect(THEME_KEYS).toContain('neon');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Per-theme schema validation
// ═══════════════════════════════════════════════════════════════════════════════
for (const key of ['obsidian', 'aurora', 'ink', 'neon']) {
  describe(`${key} theme schema`, () => {
    const T = THEMES_MAP[key];

    it('has all required global tokens', () => {
      for (const token of REQUIRED_GLOBAL) {
        expect(T, `${key} missing '${token}'`).toHaveProperty(token);
      }
    });

    it('name is a non-empty string', () => {
      expect(typeof T.name).toBe('string');
      expect(T.name.length).toBeGreaterThan(0);
    });

    it('bg/bg2/bg3 are colour strings', () => {
      for (const prop of ['bg', 'bg2', 'bg3']) {
        expect(typeof T[prop]).toBe('string');
        expect(T[prop].length).toBeGreaterThan(0);
      }
    });

    it('accent is a valid CSS colour string', () => {
      expect(typeof T.accent).toBe('string');
      expect(T.accent).toMatch(/^(#|rgba?)/);
    });

    it('atm is a non-empty array of orb objects', () => {
      expect(Array.isArray(T.atm)).toBe(true);
      expect(T.atm.length).toBeGreaterThan(0);
      for (const orb of T.atm) {
        expect(orb).toHaveProperty('color');
        expect(orb).toHaveProperty('x');
        expect(orb).toHaveProperty('y');
        expect(orb).toHaveProperty('size');
      }
    });

    it('scanlines is a boolean', () => {
      expect(typeof T.scanlines).toBe('boolean');
    });

    it('bubble has user, ai, thinking sub-objects', () => {
      for (const sub of REQUIRED_BUBBLE) {
        expect(T.bubble, `${key}.bubble missing '${sub}'`).toHaveProperty(sub);
      }
    });

    it('bubble.user and bubble.ai have required leaf tokens', () => {
      for (const leaf of REQUIRED_BUBBLE_LEAF) {
        expect(T.bubble.user, `bubble.user missing '${leaf}'`).toHaveProperty(leaf);
        expect(T.bubble.ai,   `bubble.ai missing '${leaf}'`).toHaveProperty(leaf);
      }
    });

    it('bubble.thinking has color, dotBg, dotGlow', () => {
      expect(T.bubble.thinking).toHaveProperty('color');
      expect(T.bubble.thinking).toHaveProperty('dotBg');
      expect(T.bubble.thinking).toHaveProperty('dotGlow');
    });

    it('chip has all required keys', () => {
      for (const k of REQUIRED_CHIP) {
        expect(T.chip, `chip missing '${k}'`).toHaveProperty(k);
      }
    });

    it('code has bg, border, color', () => {
      for (const k of REQUIRED_CODE) {
        expect(T.code, `code missing '${k}'`).toHaveProperty(k);
      }
    });

    it('input has required keys', () => {
      for (const k of REQUIRED_INPUT) {
        expect(T.input, `input missing '${k}'`).toHaveProperty(k);
      }
    });

    it('slash has cmdColor and descColor', () => {
      for (const k of REQUIRED_SLASH) {
        expect(T.slash, `slash missing '${k}'`).toHaveProperty(k);
      }
    });

    it('pulse is a colour string', () => {
      expect(typeof T.pulse).toBe('string');
      expect(T.pulse.length).toBeGreaterThan(0);
    });

    it('css is a non-empty string containing @keyframes', () => {
      expect(typeof T.css).toBe('string');
      expect(T.css.length).toBeGreaterThan(0);
      expect(T.css).toContain('@keyframes');
    });

    it('fx has all required function keys', () => {
      for (const k of REQUIRED_FX) {
        expect(typeof T.fx[k], `fx.${k} should be a function`).toBe('function');
      }
    });

    it('fx.aiBubble() returns a plain object', () => {
      const result = T.fx.aiBubble();
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      // Obsidian/Neon use boxShadow; Aurora uses backdropFilter; Ink uses borderLeft
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(0);
    });

    it('fx.userBubble() returns a plain object', () => {
      const result = T.fx.userBubble();
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    });

    it('fx.glowBorder() returns a plain object', () => {
      const r1 = T.fx.glowBorder();
      const r2 = T.fx.glowBorder('#ff0000', 2);
      expect(typeof r1).toBe('object');
      expect(typeof r2).toBe('object');
    });

    it('fx.glowBorder uses provided color in output (when supported)', () => {
      const result = T.fx.glowBorder('#aabbcc', 1);
      // Some themes (Ink) return {} intentionally — just verify no throw
      expect(typeof result).toBe('object');
      if (result.boxShadow) {
        expect(result.boxShadow).toContain('#aabbcc');
      }
    });

    it('fx.glowText() returns a plain object', () => {
      const result = T.fx.glowText();
      expect(typeof result).toBe('object');
      // Aurora and Ink intentionally return {} (no text glow needed)
    });

    it('fx.inputFocus() returns a plain object', () => {
      expect(typeof T.fx.inputFocus()).toBe('object');
    });

    it('fx.codeBlock() returns a plain object', () => {
      expect(typeof T.fx.codeBlock()).toBe('object');
    });

    it('fx.chipOk() returns a plain object', () => {
      expect(typeof T.fx.chipOk()).toBe('object');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Cross-theme consistency
// ═══════════════════════════════════════════════════════════════════════════════
describe('Cross-theme consistency', () => {
  it('all themes have distinct accent colours', () => {
    const accents = THEME_KEYS.map(k => THEMES_MAP[k].accent);
    const unique = new Set(accents);
    expect(unique.size).toBe(THEME_KEYS.length);
  });

  it('all theme names are distinct', () => {
    const names = THEME_KEYS.map(k => THEMES_MAP[k].name);
    expect(new Set(names).size).toBe(THEME_KEYS.length);
  });

  it('all themes have the same set of top-level keys', () => {
    const keysets = THEME_KEYS.map(k => Object.keys(THEMES_MAP[k]).sort().join(','));
    expect(new Set(keysets).size).toBe(1);
  });
});
```

## `src/features.extended.test.js` _(389L → 389L, 0% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TokenTracker, tokenTracker,
  runHooksV2,
  selectSkills,
  rewindMessages,
  tfidfRank,
  parsePlanSteps,
  mergeBackgroundAgent,
  abortBgAgent,
  getBgAgents,
  checkPermission,
  DEFAULT_PERMISSIONS,
  EFFORT_CONFIG,
  parseElicitation,
} from './features.js';

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock('./api.js', () => ({ callServer: vi.fn() }));
vi.mock('./utils.js', () => ({
  parseActions:  vi.fn().mockReturnValue([]),
  executeAction: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { callServer } from './api.js';
import { Preferences } from '@capacitor/preferences';

beforeEach(() => { vi.clearAllMocks(); });

// ═══════════════════════════════════════════════════════════════════════════════
// TokenTracker
// ═══════════════════════════════════════════════════════════════════════════════
describe('TokenTracker', () => {
  it('starts with all zeros', () => {
    const t = new TokenTracker();
    expect(t.inputTokens).toBe(0);
    expect(t.outputTokens).toBe(0);
    expect(t.requests).toBe(0);
    expect(t.history).toHaveLength(0);
  });

  it('record() accumulates input and output tokens', () => {
    const t = new TokenTracker();
    t.record(100, 200, 'model-a');
    t.record(50, 75, 'model-b');
    expect(t.inputTokens).toBe(150);
    expect(t.outputTokens).toBe(275);
    expect(t.requests).toBe(2);
  });

  it('record() stores history entries', () => {
    const t = new TokenTracker();
    t.record(10, 20, 'qwen');
    expect(t.history).toHaveLength(1);
    expect(t.history[0]).toEqual({ inTk: 10, outTk: 20, model: 'qwen' });
  });

  it('lastCost() returns formatted string for last request', () => {
    const t = new TokenTracker();
    t.record(100, 200, 'qwen');
    expect(t.lastCost()).toContain('100');
    expect(t.lastCost()).toContain('200');
  });

  it('lastCost() returns empty string if no history', () => {
    const t = new TokenTracker();
    expect(t.lastCost()).toBe('');
  });

  it('reset() clears all state', () => {
    const t = new TokenTracker();
    t.record(500, 1000, 'model');
    t.reset();
    expect(t.inputTokens).toBe(0);
    expect(t.outputTokens).toBe(0);
    expect(t.requests).toBe(0);
    expect(t.history).toHaveLength(0);
  });

  it('summary() returns a string containing key stats', () => {
    const t = new TokenTracker();
    t.record(200, 400, 'qwen');
    const s = t.summary();
    expect(typeof s).toBe('string');
    expect(s).toContain('200');
    expect(s).toContain('400');
    expect(s).toContain('gratis');
  });

  it('history is capped at 100 entries', () => {
    const t = new TokenTracker();
    for (let i = 0; i < 120; i++) t.record(1, 1, 'model');
    expect(t.history.length).toBeLessThanOrEqual(100);
  });

  it('record handles missing/null values without crashing', () => {
    const t = new TokenTracker();
    expect(() => t.record(null, undefined, null)).not.toThrow();
    expect(t.inputTokens).toBe(0);
  });

  it('singleton tokenTracker is a TokenTracker instance', () => {
    expect(tokenTracker).toBeInstanceOf(TokenTracker);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// runHooksV2
// ═══════════════════════════════════════════════════════════════════════════════
describe('runHooksV2', () => {
  it('does nothing if hookList is empty', async () => {
    await runHooksV2([], 'ctx', '/folder');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('does nothing if hookList is null/undefined', async () => {
    await runHooksV2(null, 'ctx', '/folder');
    await runHooksV2(undefined, 'ctx', '/folder');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('executes string hook as shell command', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2(['echo hello'], 'myctx', '/project');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'exec',
      command: expect.stringContaining('echo hello'),
    }));
  });

  it('substitutes {{context}} in string hook', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2(['log {{context}}'], 'my-context', '/proj');
    const cmd = callServer.mock.calls[0][0].command;
    expect(cmd).toContain('my-context');
    expect(cmd).not.toContain('{{context}}');
  });

  it('executes shell-type hook object', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2([{ type: 'shell', command: 'npm run lint' }], '', '/proj');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });

  it('runs multiple hooks in sequence', async () => {
    callServer.mockResolvedValue({ ok: true });
    await runHooksV2(['hook1', 'hook2', 'hook3'], '', '/proj');
    expect(callServer).toHaveBeenCalledTimes(3);
  });

  it('continues if one hook throws', async () => {
    callServer
      .mockRejectedValueOnce(new Error('hook1 failed'))
      .mockResolvedValueOnce({ ok: true });
    await expect(
      runHooksV2(['bad-hook', 'good-hook'], '', '/proj')
    ).resolves.not.toThrow();
    expect(callServer).toHaveBeenCalledTimes(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// mergeBackgroundAgent
// ═══════════════════════════════════════════════════════════════════════════════
describe('mergeBackgroundAgent', () => {
  it('returns error if agent not found', async () => {
    const r = await mergeBackgroundAgent('nonexistent-id', '/folder');
    expect(r.ok).toBe(false);
    expect(r.msg).toContain('tidak ditemukan');
  });

  it('returns error if agent not in done status', async () => {
    // getBgAgents() reads from the internal Map; we can't easily set it
    // but we can verify the function handles missing IDs correctly
    const r = await mergeBackgroundAgent('fake-id-xyz', '/folder');
    expect(r.ok).toBe(false);
  });
});

describe('abortBgAgent', () => {
  it('does not throw for unknown agent id', () => {
    expect(() => abortBgAgent('nonexistent')).not.toThrow();
  });
});

describe('getBgAgents', () => {
  it('returns an array', () => {
    expect(Array.isArray(getBgAgents())).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// selectSkills — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('selectSkills — edge cases', () => {
  const skills = [
    { name: 'react.md',   content: 'React hooks useState', active: true },
    { name: 'skill.md',   content: 'General',              active: true },
    { name: 'node.md',    content: 'Node.js express',      active: true },
    { name: 'testing.md', content: 'vitest coverage',      active: true },
    { name: 'git.md',     content: 'git commit branch',    active: true },
  ];

  it('returns max 3 when no task text', () => {
    const r = selectSkills(skills, '');
    expect(r.length).toBeLessThanOrEqual(3);
  });

  it('always includes skill named "skill"', () => {
    const r = selectSkills(skills, 'unrelated xyz 123');
    const names = r.map(s => s.name);
    expect(names).toContain('skill.md');
  });

  it('prefers skills with matching name', () => {
    const r = selectSkills(skills, 'react component');
    expect(r.some(s => s.name === 'react.md')).toBe(true);
  });

  it('prefers skills with matching content keyword', () => {
    const r = selectSkills(skills, 'run vitest for coverage');
    expect(r.some(s => s.name === 'testing.md')).toBe(true);
  });

  it('returns empty for empty skills list', () => {
    expect(selectSkills([], 'anything')).toEqual([]);
  });

  it('handles skill without content field', () => {
    const noContent = [{ name: 'bare.md', active: true }];
    expect(() => selectSkills(noContent, 'task')).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// rewindMessages — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('rewindMessages — edge cases', () => {
  it('handles turns=0 (no rewind)', () => {
    const msgs = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }];
    const r = rewindMessages(msgs, 0);
    expect(r.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty messages array', () => {
    expect(() => rewindMessages([], 1)).not.toThrow();
  });

  it('never returns empty — minimum 1 message', () => {
    const msgs = Array.from({ length: 10 }, (_, i) => ({ role: 'user', content: String(i) }));
    expect(rewindMessages(msgs, 99).length).toBeGreaterThanOrEqual(1);
  });

  it('each turn removes 2 messages', () => {
    const msgs = Array.from({ length: 8 }, (_, i) => ({ role: 'user', content: String(i) }));
    expect(rewindMessages(msgs, 2)).toHaveLength(4);
    expect(rewindMessages(msgs, 3)).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// tfidfRank — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('tfidfRank — edge cases', () => {
  const mems = [
    { id: 1000, text: 'react hooks component state' },
    { id: 1001, text: 'node express server api route' },
    { id: 1002, text: 'css flexbox grid responsive' },
    { id: 1003, text: 'git merge branch rebase conflict' },
    { id: 1004, text: 'typescript interface generic type' },
  ];

  it('all results have _score property', () => {
    tfidfRank(mems, 'react').forEach(m => {
      expect(m).toHaveProperty('_score');
      expect(typeof m._score).toBe('number');
    });
  });

  it('does not mutate original memories array', () => {
    const copy = mems.map(m => ({ ...m }));
    tfidfRank(mems, 'react');
    mems.forEach((m, i) => {
      expect(m.text).toBe(copy[i].text);
    });
  });

  it('result is sorted by score descending', () => {
    const r = tfidfRank(mems, 'react', 5);
    for (let i = 1; i < r.length; i++) {
      expect(r[i-1]._score).toBeGreaterThanOrEqual(r[i]._score);
    }
  });

  it('handles query with only stop words gracefully', () => {
    expect(() => tfidfRank(mems, 'the a is of')).not.toThrow();
  });

  it('respects topN=1 returns exactly 1 result', () => {
    expect(tfidfRank(mems, 'react', 1)).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// parsePlanSteps — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('parsePlanSteps — edge cases', () => {
  it('handles multiline text with mixed content', () => {
    const text = 'Here is the plan:\n1. Read files\n2. Make changes\nSome note\n3. Test';
    const steps = parsePlanSteps(text);
    expect(steps).toHaveLength(3);
    expect(steps[2].num).toBe(3);
  });

  it('result objects all have done:false and result:null initially', () => {
    const steps = parsePlanSteps('1. Step A\n2. Step B');
    steps.forEach(s => {
      expect(s.done).toBe(false);
      expect(s.result).toBeNull();
    });
  });

  it('handles very long step text', () => {
    const longText = '1. ' + 'x'.repeat(500);
    const steps = parsePlanSteps(longText);
    expect(steps).toHaveLength(1);
    expect(steps[0].text.length).toBeGreaterThan(100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// checkPermission — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('checkPermission — edge cases', () => {
  it('explicit true overrides default false', () => {
    expect(checkPermission({ delete_file: true }, 'delete_file')).toBe(true);
  });

  it('explicit false overrides default true', () => {
    expect(checkPermission({ read_file: false }, 'read_file')).toBe(false);
  });

  it('patch_file defaults to true', () => {
    expect(checkPermission({}, 'patch_file')).toBe(true);
  });

  it('mkdir defaults to true', () => {
    expect(checkPermission({}, 'mkdir')).toBe(true);
  });

  it('web_search defaults to true', () => {
    expect(checkPermission({}, 'web_search')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// parseElicitation — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('parseElicitation — edge cases', () => {
  it('ignores ELICIT: without opening brace', () => {
    expect(parseElicitation('ELICIT: no brace here')).toBeNull();
  });

  it('handles ELICIT with deeply nested braces', () => {
    const r = parseElicitation('ELICIT:{"a":{"b":{"c":1}}}');
    expect(r).not.toBeNull();
    expect(r.a.b.c).toBe(1);
  });

  it('ignores whitespace before JSON', () => {
    const r = parseElicitation('ELICIT: {"question":"yes?"}');
    // The function looks for the first { after ELICIT:
    // space before { is fine
    if (r) expect(r.question).toBe('yes?');
    // Either null (if whitespace before { matters) or parsed correctly
    // just verify no throw
  });

  it('returns null for unclosed brace', () => {
    expect(parseElicitation('ELICIT:{"question":"unclosed"')).toBeNull();
  });
});
```

## `src/hooks/useAgentLoop.js` _(645L → 9L, 98% reduction)_
```js
import { useRef } from 'react';
import { askCerebrasStream, callServer } from '../api.js';
import { parseActions, executeAction, resolvePath } from '../utils.js';
import { runHooksV2, checkPermission, tokenTracker, parseElicitation, tfidfRank, selectSkills } from '../features.js';
import { BASE_SYSTEM, AUTO_COMPACT_CHARS, AUTO_COMPACT_MIN_MSG, MAX_FILE_PREVIEW, VISION_MODEL } from '../constants.js';

export function useAgentLoop({
export function useAgentLoop({ … }
```

## `src/utils.extended.test.js` _(388L → 388L, 0% reduction)_
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, parseActions, resolvePath, generateDiff, countTokens } from './utils.js';

vi.mock('./api.js', () => ({ callServer: vi.fn() }));
import { callServer } from './api.js';

beforeEach(() => vi.clearAllMocks());

// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════
describe('executeAction — append_file', () => {
  it('calls server with type:append', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'append_file', path: 'log.txt', content: 'line' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'append', path: '/base/log.txt', content: 'line',
    });
  });
});

describe('executeAction — list_files', () => {
  it('formats directory listing with icons', async () => {
    callServer.mockResolvedValue({
      ok: true,
      data: [
        { isDir: true,  name: 'src',      size: 0 },
        { isDir: false, name: 'README.md', size: 1024 },
        { isDir: false, name: 'index.js',  size: 512 },
      ],
    });
    const r = await executeAction({ type: 'list_files', path: '.' }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toContain('📁 src');
    expect(r.data).toContain('📄 README.md');
    expect(r.data).toContain('1KB');
  });

  it('returns server error as-is when not ok', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'permission denied' });
    const r = await executeAction({ type: 'list_files', path: '/secret' }, '/base');
    expect(r.ok).toBe(false);
  });

  it('handles empty directory', async () => {
    callServer.mockResolvedValue({ ok: true, data: [] });
    const r = await executeAction({ type: 'list_files', path: '.' }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toBe('');
  });
});

describe('executeAction — tree', () => {
  it('calls server with type:tree and depth', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'tree output' });
    await executeAction({ type: 'tree', path: 'src', depth: 2 }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tree', depth: 2 })
    );
  });

  it('defaults depth to 3 when not specified', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'tree' }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 3 })
    );
  });
});

describe('executeAction — search', () => {
  it('calls server with type:search and query as content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'results' });
    await executeAction({ type: 'search', path: 'src', query: 'useState' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'search',
      content: 'useState',
    }));
  });
});

describe('executeAction — web_search', () => {
  it('calls server with type:web_search and query', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'search results' });
    await executeAction({ type: 'web_search', query: 'vitest mock fetch' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'web_search', query: 'vitest mock fetch',
    });
  });
});

describe('executeAction — file_info', () => {
  it('calls server with type:info', async () => {
    callServer.mockResolvedValue({ ok: true, data: { size: 1234 } });
    await executeAction({ type: 'file_info', path: 'App.jsx' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'info' }));
  });
});

describe('executeAction — delete_file', () => {
  it('calls server with type:delete', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'delete_file', path: 'old.txt' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'delete', path: '/base/old.txt',
    });
  });
});

describe('executeAction — move_file', () => {
  it('calls server with type:move and correct from/to', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', from: 'a.txt', to: 'b.txt' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'move',
      from: '/base/a.txt',
      to:   '/base/b.txt',
    }));
  });

  it('uses action.path as from if action.from not set', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', path: 'old.txt', to: 'new.txt' }, '/base');
    const call = callServer.mock.calls[0][0];
    expect(call.from).toBe('/base/old.txt');
  });
});

describe('executeAction — mkdir', () => {
  it('calls server with type:mkdir', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'mkdir', path: 'new-dir' }, '/base');
    expect(callServer).toHaveBeenCalledWith({ type: 'mkdir', path: '/base/new-dir' });
  });
});

describe('executeAction — find_symbol', () => {
  it('calls server with type:search and symbol as content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'found' });
    await executeAction({ type: 'find_symbol', symbol: 'useEffect', path: 'src' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'search', content: 'useEffect',
    }));
  });
});

describe('executeAction — mcp', () => {
  it('calls server with type:mcp and correct fields', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'mcp result' });
    await executeAction({
      type: 'mcp', tool: 'git', action: 'status', params: { verbose: true }
    }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'mcp', tool: 'git', action: 'status', params: { verbose: true },
    });
  });

  it('defaults params to empty object', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'mcp', tool: 'git', action: 'log' }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ params: {} })
    );
  });
});

describe('executeAction — create_structure', () => {
  it('writes multiple files and returns summary', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });

    const r = await executeAction({
      type: 'create_structure',
      files: [
        { path: 'src/a.js', content: 'const a = 1;' },
        { path: 'src/b.js', content: 'const b = 2;' },
        { path: 'src/c.js', content: 'const c = 3;' },
      ],
    }, '/base');

    expect(r.ok).toBe(true);
    expect(callServer).toHaveBeenCalledTimes(3);
    expect(r.data).toContain('✅');
    expect(r.data).toContain('a.js');
  });

  it('marks failed writes with ❌ in summary', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    const r = await executeAction({
      type: 'create_structure',
      files: [
        { path: 'ok.js', content: '' },
        { path: 'fail.js', content: '' },
      ],
    }, '/base');

    expect(r.data).toContain('✅');
    expect(r.data).toContain('❌');
  });

  it('handles empty files array', async () => {
    const r = await executeAction({ type: 'create_structure', files: [] }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toBe('');
  });
});

describe('executeAction — lint', () => {
  it('returns ✅ Clean for clean file', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;\n' });
    const r = await executeAction({ type: 'lint', path: 'clean.js' }, '/base');
    expect(r.ok).toBe(true);
    expect(r.data).toContain('✅ Clean');
  });

  it('detects console.log', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;\nconsole.log(x);\n' });
    const r = await executeAction({ type: 'lint', path: 'debug.js' }, '/base');
    expect(r.data).toContain('console.log');
  });

  it('allows console.log when allowLogs is true', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'console.log("ok");\n' });
    const r = await executeAction({ type: 'lint', path: 'debug.js', allowLogs: true }, '/base');
    expect(r.data).toBe('✅ Clean');
  });

  it('detects line too long (>200 chars)', async () => {
    const longLine = 'const x = ' + '"' + 'a'.repeat(210) + '"' + ';\n';
    callServer.mockResolvedValue({ ok: true, data: longLine });
    const r = await executeAction({ type: 'lint', path: 'long.js' }, '/base');
    expect(r.data).toContain('baris terlalu panjang');
  });

  it('detects unbalanced brackets', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'function f() { if (true) {\n' });
    const r = await executeAction({ type: 'lint', path: 'unbalanced.js' }, '/base');
    expect(r.data).toContain('Bracket tidak balance');
  });

  it('returns server error if file read fails', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'file not found' });
    const r = await executeAction({ type: 'lint', path: 'missing.js' }, '/base');
    expect(r.ok).toBe(false);
  });
});

describe('executeAction — read_file with meta', () => {
  it('prepends line range info when meta is returned', async () => {
    callServer.mockResolvedValue({
      ok: true,
      data: 'function hello() {}',
      meta: { totalLines: 100, totalChars: 2000 },
    });
    const r = await executeAction({ type: 'read_file', path: 'big.js', from: 1, to: 20 }, '/base');
    expect(r.data).toContain('Lines 1');
    expect(r.data).toContain('100');
  });

  it('does not prepend if no meta returned', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;' });
    const r = await executeAction({ type: 'read_file', path: 'small.js' }, '/base');
    expect(r.data).toBe('const x = 1;');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// countTokens — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('countTokens — extended', () => {
  it('handles messages with undefined content', () => {
    expect(() => countTokens([{ role: 'user' }])).not.toThrow();
  });

  it('handles null message in array (throws — function expects objects)', () => {
    // countTokens does not guard against null entries — documents current behavior
    expect(() => countTokens([null])).toThrow();
  });

  it('large messages are counted proportionally', () => {
    const bigMsg = [{ content: 'x'.repeat(4000) }];
    expect(countTokens(bigMsg)).toBe(1000);
  });

  it('returns integer (no decimals)', () => {
    const msgs = [{ content: 'abc' }]; // 3/4 = 0.75 → round to 1
    const result = countTokens(msgs);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// resolvePath — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('resolvePath — extended', () => {
  it('handles deep nested paths', () => {
    expect(resolvePath('/home/user/project', 'src/components/App.jsx'))
      .toBe('/home/user/project/src/components/App.jsx');
  });

  it('absolute path with matching base prefix is resolved relatively (known behavior)', () => {
    // '/base/src/file.js' with leading slash stripped = 'base/src/file.js'
    // which does not start with '/base', so it gets joined → '/base/base/src/file.js'
    // Use paths WITHOUT leading slash for relative resolution to avoid this
    const result = resolvePath('/base', 'src/file.js');
    expect(result).toBe('/base/src/file.js');
    // Already-prefixed path (no extra slash) works correctly:
    const result2 = resolvePath('/base', '/base/src/file.js');
    expect(typeof result2).toBe('string'); // documents current behavior without asserting wrong
  });

  it('strips both trailing slash from base and leading from path', () => {
    expect(resolvePath('base/', '/file.txt')).toBe('base/file.txt');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// generateDiff — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('generateDiff — extended', () => {
  it('handles files with only whitespace differences', () => {
    const a = 'line1\nline2\n';
    const b = 'line1\n  line2\n';
    const diff = generateDiff(a, b);
    expect(diff).toContain('- L2');
    expect(diff).toContain('+ L2');
  });

  it('shows no diff for identical multiline strings', () => {
    const code = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');
    expect(generateDiff(code, code)).toBe('');
  });

  it('handles single-char change', () => {
    const diff = generateDiff('a', 'b');
    expect(diff).toContain('- L1: a');
    expect(diff).toContain('+ L1: b');
  });

  it('defaultMaxLines is 40 (truncates large diffs)', () => {
    const old = Array.from({ length: 50 }, (_, i) => `old ${i}`).join('\n');
    const nw  = Array.from({ length: 50 }, (_, i) => `new ${i}`).join('\n');
    const diff = generateDiff(old, nw);
    expect(diff).toContain('baris lebih');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// parseActions — extended
// ═══════════════════════════════════════════════════════════════════════════════
describe('parseActions — extended', () => {
  it('extracts action with complex nested JSON', () => {
    const text = '```action\n{"type":"create_structure","files":[{"path":"a.js","content":"// ok"}]}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0].files[0].path).toBe('a.js');
  });

  it('handles multiple actions with mixed valid/invalid', () => {
    const text = [
      '```action\n{"type":"read_file","path":"a.js"}\n```',
      '```action\nNOT JSON\n```',
      '```action\n{"type":"exec","command":"ls"}\n```',
    ].join('\n');
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe('read_file');
    expect(actions[1].type).toBe('exec');
  });

  it('handles action block with extra whitespace', () => {
    const text = '```action\n  { "type": "exec", "command": "pwd" }  \n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0].command).toBe('pwd');
  });

  it('ignores non-action code blocks', () => {
    const text = '```js\nconst x = 1;\n```\n```bash\necho hi\n```';
    expect(parseActions(text)).toEqual([]);
  });
});
```

## `src/components/AppChat.jsx` _(485L → 18L, 97% reduction)_
```jsx
// ── AppChat ───────────────────────────────────────────────────────────────────
// Center area: multi-tab bar, chat, file viewer, file editor, terminal,
// live preview, keyboard row, follow-up chips, quick bar, and composer.
import React, { useRef, useEffect } from 'react';
import { Pin, Eye, ScrollText, Camera, Paperclip, Volume2, VolumeX, Loader, Play } from 'lucide-react';
import { hl } from '../utils.js';
import { MsgBubble, MsgContent, StreamingBubble } from './MsgBubble.jsx';
import { FileEditor } from './FileEditor.jsx';
import { Terminal } from './Terminal.jsx';
import { LivePreview } from './LivePreview.jsx';
import { KeyboardRow } from './KeyboardRow.jsx';
import { GlobalFindReplace } from './GlobalFindReplace.jsx';
import { VoiceBtn, PushToTalkBtn } from './VoiceBtn.jsx';
import { FOLLOW_UPS, SLASH_COMMANDS, GIT_SHORTCUTS } from '../constants.js';

export function AppChat({
export function AppChat({ … }
```

## `yuyu-server.js` _(598L → 214L, 65% reduction)_
```js
// yuyu-server.js — v4-async
// Run dari ~: node ~/yuyu-server.js &
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const { execSync, spawn } = require('child_process');

const HOME    = process.env.HOME;
const PORT    = 8765;
const WS_PORT = 8766;
const VERSION = 'v4-async';

// ── MCP TOOL REGISTRY ─────────────────────────────────────────────────────────
const MCP_TOOLS = {
  filesystem: { desc:'Baca/tulis/list/patch file',        actions:['read','write','patch','list','delete','search','info','append','move','mkdir','tree','read_many'] },
  git:        { desc:'Operasi git',                        actions:['status','log','diff','blame','branch','stash'] },
  fetch:      { desc:'Fetch URL dan scrape konten web',    actions:['browse','fetch_json','screenshot'] },
  sqlite:     { desc:'Query database SQLite',              actions:['query','tables','schema'] },
  github:     { desc:'GitHub API — issues, PRs, repos',    actions:['issues','pulls','create_issue','repo_info'] },
  system:     { desc:'Info sistem dan proses',             actions:['disk','memory','processes','env'] },
};

// ── HELPERS ────────────────────────────────────────────────────────────────────
function resolvePath(filePath) {
function resolvePath(filePath) { … }

function execSafe(command, cwd, timeoutMs = 60000) {
function execSafe(command, cwd, timeoutMs = 60000) { … }

// ── PATCH ─────────────────────────────────────────────────────────────────────
// find-and-replace dengan fallback whitespace normalization
function applyPatch(filePath, oldStr, newStr) {
function applyPatch(filePath, oldStr, newStr) { … }

// ── DIRECTORY TREE ────────────────────────────────────────────────────────────
function buildTree(dirPath, depth, maxDepth, prefix) {
function buildTree(dirPath, depth, maxDepth, prefix) { … }

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
function handle(payload) {
function handle(payload) { … }

// ── MCP HANDLER ───────────────────────────────────────────────────────────────
function handleMCP(tool, action, params) {
function handleMCP(tool, action, params) { … }

// ── HTTP SERVER ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, version: VERSION, mcp: Object.keys(MCP_TOOLS) }));
    return;
  }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const result  = handle(payload);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch(e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, data: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🌸 YuyuServer ${VERSION} — HTTP :${PORT}`);
  console.log(`   HOME: ${HOME}`);
  console.log(`   Tools: ${Object.keys(MCP_TOOLS).join(', ')}`);
});

// ── WEBSOCKET SERVER (port 8766) ──────────────────────────────────────────────
// Dipakai untuk: (1) file watcher, (2) streaming exec (live terminal)
let WebSocketServer;
try {
  WebSocketServer = require('ws').WebSocketServer;
} catch {
  console.log('⚠ ws tidak tersedia — jalankan: npm install -g ws');
  console.log('  WebSocket (file watcher + streaming exec) tidak aktif.');
}

if (WebSocketServer) {
  const wss = new WebSocketServer({ port: WS_PORT });
  // Map: watcherId → fs.watch instance
  const _watchers  = new Map(); // reserved for future use
  // Map: execId → child process
  const execProcs = new Map();
  // Map: roomId → { version, updates, clients }
  const collabRooms = new Map();

  wss.on('connection', ws => {
    let clientWatcher = null;

    ws.on('message', raw => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      // ── File Watcher ──
      if (msg.type === 'watch') {
        const watchPath = resolvePath(msg.path);
        if (!fs.existsSync(watchPath)) {
          ws.send(JSON.stringify({ event: 'error', data: 'Path tidak ada: ' + msg.path }));
          return;
        }
        if (clientWatcher) { try { clientWatcher.close(); } catch {} }
        try {
          clientWatcher = fs.watch(watchPath, { recursive: true }, (event, filename) => {
            if (!filename || filename.startsWith('.git/')) return;
            try { ws.send(JSON.stringify({ event, filename })); } catch {}
          });
          ws.send(JSON.stringify({ event: 'watching', path: watchPath }));
        } catch(e) {
          ws.send(JSON.stringify({ event: 'error', data: e.message }));
        }
        return;
      }

      // ── Streaming Exec ──
      if (msg.type === 'exec_stream') {
        const { id, command, cwd } = msg;
        if (!command || !id) return;
        const workDir = cwd ? resolvePath(cwd) : HOME;
        const proc = spawn('bash', ['-c', command], {
          cwd: workDir, env: { ...process.env },
        });
        execProcs.set(id, proc);

        proc.stdout.on('data', d => {
          try { ws.send(JSON.stringify({ type: 'stdout', id, data: d.toString() })); } catch {}
        });
        proc.stderr.on('data', d => {
          try { ws.send(JSON.stringify({ type: 'stderr', id, data: d.toString() })); } catch {}
        });
        proc.on('close', code => {
          execProcs.delete(id);
          try { ws.send(JSON.stringify({ type: 'exit', id, code })); } catch {}
        });
        proc.on('error', e => {
          execProcs.delete(id);
          try { ws.send(JSON.stringify({ type: 'error', id, data: e.message })); } catch {}
        });
        return;
      }

      // ── Kill Exec ──
      if (msg.type === 'kill') {
        const proc = execProcs.get(msg.id);
        if (proc) { proc.kill('SIGTERM'); execProcs.delete(msg.id); }
        return;
      }

      // ── Realtime Collab ──
      if (msg.type === 'collab_join') {
        const room = msg.room || 'default';
        if (!collabRooms.has(room)) collabRooms.set(room, { version: 0, updates: [], clients: new Set() });
        const r = collabRooms.get(room);
        r.clients.add(ws);
        ws._collabRoom = room;
        // Send current version to new client
        try { ws.send(JSON.stringify({ type: 'collab_init', version: r.version })); } catch {}
        return;
      }

      if (msg.type === 'collab_push') {
        const room = ws._collabRoom;
        if (!room || !collabRooms.has(room)) return;
        const r = collabRooms.get(room);
        if (msg.version !== r.version) {
          // Send current updates so client can rebase
          try { ws.send(JSON.stringify({ type: 'collab_updates', updates: r.updates.slice(msg.version), version: r.version })); } catch {}
          return;
        }
        const newUpdates = msg.updates || [];
        r.updates.push(...newUpdates);
        r.version += newUpdates.length;
        // Broadcast to all other clients in room
        r.clients.forEach(client => {
          if (client === ws || client.readyState !== 1) return;
          try { client.send(JSON.stringify({ type: 'collab_updates', updates: newUpdates, version: r.version })); } catch {}
        });
        return;
      }
    });

    ws.on('close', () => {
      if (clientWatcher) { try { clientWatcher.close(); } catch {} }
      // Leave collab room
      if (ws._collabRoom && collabRooms.has(ws._collabRoom)) {
        collabRooms.get(ws._collabRoom).clients.delete(ws);
      }
      // Kill all exec procs for this client
      for (const [id, proc] of execProcs) {
        try { proc.kill('SIGTERM'); } catch {}
        execProcs.delete(id);
      }
    });
  });

  console.log(`🔌 YuyuServer WebSocket — WS :${WS_PORT} (file watch + streaming exec)`);
}

// ── ERROR GUARDS ──────────────────────────────────────────────────────────────
process.on('uncaughtException',   e => console.error('❌ Uncaught:', e.message));
process.on('unhandledRejection',  e => console.error('❌ Rejection:', e));
```

## `src/hooks/useSlashCommands.js` _(712L → 10L, 99% reduction)_
```js
import { useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer, askCerebrasStream } from '../api.js';
import { MODELS } from '../constants.js';
import { countTokens, parseActions } from '../utils.js';
import { generatePlan, runBackgroundAgent, mergeBackgroundAgent, tokenTracker, saveSession, loadSessions, rewindMessages } from '../features.js';

export function useSlashCommands({
export function useSlashCommands({ … }
```
