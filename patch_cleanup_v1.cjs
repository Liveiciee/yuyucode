#!/usr/bin/env node
// patch_cleanup_v1.cjs
// 1. Hapus Gemini + Ollama dari MODELS (constants.js)
// 2. Hapus askGeminiStream + askOllamaStream (api.js)
// 3. Dynamic max_tokens per effort (api.js + App.jsx)
// 4. Prompt-based thinking di BASE_SYSTEM (constants.js)
// Usage: node patch_cleanup_v1.cjs src/App.jsx src/api.js src/constants.js
'use strict';
const fs = require('fs');

const [appPath, apiPath, constPath] = process.argv.slice(2);
if (!appPath || !apiPath || !constPath) {
  console.error('Usage: node patch_cleanup_v1.cjs src/App.jsx src/api.js src/constants.js');
  process.exit(1);
}

let app = fs.readFileSync(appPath, 'utf8');
let api = fs.readFileSync(apiPath, 'utf8');
let con = fs.readFileSync(constPath, 'utf8');

fs.writeFileSync(appPath + '.bak_cu', app);
fs.writeFileSync(apiPath + '.bak_cu', api);
fs.writeFileSync(constPath + '.bak_cu', con);
console.log('Backup dibuat.');

let patched = 0;

// ─── PATCH 1 — constants.js: hapus Gemini + Ollama dari MODELS ───
const C1_OLD = "  { id: 'gemini-2.0-flash', label: 'Gemini Flash 👁', provider:'gemini', vision:true },\n" +
"  { id: 'ollama:llama3', label: 'Ollama Local 🏠', provider:'ollama' },\n";
const C1_NEW = "";

if (con.includes(C1_OLD)) {
  con = con.replace(C1_OLD, C1_NEW);
  patched++;
  console.log('[1/5] constants.js: Gemini + Ollama dihapus dari MODELS');
} else {
  console.warn('[1/5] SKIP: MODELS entries not found');
}

// ─── PATCH 2 — constants.js: hapus import Gemini+Ollama di BASE_SYSTEM + tambah thinking prompt ───
const C2_OLD = "'10. Jangan tulis ulang file besar — gunakan string replace minimal',";
const C2_NEW = "'10. Jangan tulis ulang file besar — gunakan string replace minimal',\n" +
"  '',\n" +
"  '## THINKING',\n" +
"  'Sebelum setiap respons, tulis reasoning dalam <think>...</think>. Maks 1-2 kalimat.',";

if (con.includes(C2_OLD)) {
  con = con.replace(C2_OLD, C2_NEW);
  patched++;
  console.log('[2/5] constants.js: thinking instruction ditambahkan ke BASE_SYSTEM');
} else {
  console.warn('[2/5] SKIP: BASE_SYSTEM tail not found');
}

fs.writeFileSync(constPath, con);

// ─── PATCH 3 — api.js: hapus askGeminiStream ───
const API_GEMINI_START = "\nexport async function askGeminiStream(";
const API_GEMINI_END = "\nexport async function askOllamaStream(";
const giStart = api.indexOf(API_GEMINI_START);
const giEnd = api.indexOf(API_GEMINI_END);
if (giStart !== -1 && giEnd !== -1) {
  api = api.slice(0, giStart) + '\n' + api.slice(giEnd);
  patched++;
  console.log('[3/5] api.js: askGeminiStream dihapus');
} else {
  console.warn('[3/5] SKIP: askGeminiStream not found');
}

// ─── PATCH 4 — api.js: hapus askOllamaStream ───
const API_OLLAMA_START = "\nexport async function askOllamaStream(";
const API_OLLAMA_END = "\nexport async function callServer(";
const oiStart = api.indexOf(API_OLLAMA_START);
const oiEnd = api.indexOf(API_OLLAMA_END);
if (oiStart !== -1 && oiEnd !== -1) {
  api = api.slice(0, oiStart) + '\n' + api.slice(oiEnd);
  patched++;
  console.log('[4/5] api.js: askOllamaStream dihapus');
} else {
  console.warn('[4/5] SKIP: askOllamaStream not found');
}

// ─── PATCH 4b — api.js: dynamic max_tokens ───
const API_TOK_OLD = "    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true }),";
const API_TOK_NEW = "    body: JSON.stringify({ model, messages, max_tokens: options.maxTokens || 1500, stream: true }),";
if (api.includes(API_TOK_OLD)) {
  api = api.replace(API_TOK_OLD, API_TOK_NEW);
  console.log('      api.js: max_tokens sekarang dynamic dari options');
}

// Tambah options param ke signature
const API_SIG_OLD = "export async function askCerebrasStream(messages, model, onChunk, signal) {";
const API_SIG_NEW = "export async function askCerebrasStream(messages, model, onChunk, signal, options = {}) {";
if (api.includes(API_SIG_OLD)) {
  api = api.replace(API_SIG_OLD, API_SIG_NEW);
}

fs.writeFileSync(apiPath, api);

// ─── PATCH 5 — App.jsx: callAI hapus Gemini/Ollama + inject effort ke askCerebrasStream ───
const APP_OLD = "  // ── UNIVERSAL AI ROUTER ──\n" +
"  async function callAI(msgs, onChunk, signal, imgBase64=null) {\n" +
"    const m = MODELS.find(x=>x.id===model)||MODELS[0];\n" +
"    if (m.provider==='gemini') return askGeminiStream(msgs, model, onChunk, signal, imgBase64);\n" +
"    if (m.provider==='ollama') return askOllamaStream(msgs, model, onChunk, signal, ollamaHost);\n" +
"    return askCerebrasStream(msgs, model, onChunk, signal);\n" +
"  }";

const APP_NEW = "  // ── UNIVERSAL AI ROUTER ──\n" +
"  async function callAI(msgs, onChunk, signal, imgBase64=null) {\n" +
"    const effortTokens = { low: 512, medium: 1500, high: 3500 };\n" +
"    const maxTokens = effortTokens[effort] || 1500;\n" +
"    return askCerebrasStream(msgs, model, onChunk, signal, { maxTokens });\n" +
"  }";

if (app.includes(APP_OLD)) {
  app = app.replace(APP_OLD, APP_NEW);
  patched++;
  console.log('[5/5] App.jsx: callAI disederhanakan + dynamic max_tokens per effort');
} else {
  console.warn('[5/5] SKIP: callAI not found');
}

// App.jsx: hapus import askGeminiStream + askOllamaStream
app = app.replace(", askGeminiStream, askOllamaStream", "");
app = app.replace(", askGeminiStream", "");
app = app.replace(", askOllamaStream", "");

fs.writeFileSync(appPath, app);

console.log('\nSelesai! ' + patched + '/5 patch diterapkan.');
console.log('Perubahan:');
console.log('  1. Gemini + Ollama dihapus dari MODELS');
console.log('  2. Thinking prompt ditambah ke BASE_SYSTEM');
console.log('  3. askGeminiStream dihapus dari api.js');
console.log('  4. askOllamaStream dihapus dari api.js');
console.log('  5. callAI: dynamic max_tokens (low:512 medium:1500 high:3500)');
