#!/usr/bin/env node
// patch_big_v1.cjs — native Qwen thinking + decision layer fix
// Target: src/api.js + src/App.jsx
'use strict';
const fs = require('fs');
const path = require('path');

const appPath = process.argv[2];
const apiPath = process.argv[3];
if (!appPath || !apiPath) {
  console.error('Usage: node patch_big_v1.cjs src/App.jsx src/api.js');
  process.exit(1);
}

let appSrc = fs.readFileSync(appPath, 'utf8');
let apiSrc = fs.readFileSync(apiPath, 'utf8');
fs.writeFileSync(appPath + '.bak_big', appSrc);
fs.writeFileSync(apiPath + '.bak_big', apiSrc);
console.log('Backup dibuat.');

let patched = 0;

// ─── PATCH 1 — api.js: native Qwen thinking via enable_thinking + reasoning_content ───
const API_OLD = "    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true }),\n" +
"  });\n" +
"  if (resp.status === 429) {\n" +
"    const retry = parseInt(resp.headers.get('retry-after') || '60');\n" +
"    throw new Error('RATE_LIMIT:' + retry);\n" +
"  }\n" +
"  if (!resp.ok) throw new Error('Cerebras error: HTTP ' + resp.status);\n" +
"  const reader = resp.body.getReader();\n" +
"  const decoder = new TextDecoder();\n" +
"  let full = '';\n" +
"  while (true) {\n" +
"    const { done, value } = await reader.read();\n" +
"    if (done) break;\n" +
"    for (const line of decoder.decode(value).split('\\n')) {\n" +
"      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;\n" +
"      try {\n" +
"        const d = JSON.parse(line.slice(6)).choices[0].delta.content || '';\n" +
"        full += d;\n" +
"        onChunk(full);\n" +
"      } catch {}\n" +
"    }\n" +
"  }\n" +
"  return full;";

const API_NEW = "    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true }),\n" +
"  });\n" +
"  if (resp.status === 429) {\n" +
"    const retry = parseInt(resp.headers.get('retry-after') || '60');\n" +
"    throw new Error('RATE_LIMIT:' + retry);\n" +
"  }\n" +
"  if (!resp.ok) throw new Error('Cerebras error: HTTP ' + resp.status);\n" +
"  const reader = resp.body.getReader();\n" +
"  const decoder = new TextDecoder();\n" +
"  let full = '';\n" +
"  let thinking = '';\n" +
"  while (true) {\n" +
"    const { done, value } = await reader.read();\n" +
"    if (done) break;\n" +
"    for (const line of decoder.decode(value).split('\\n')) {\n" +
"      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;\n" +
"      try {\n" +
"        const delta = JSON.parse(line.slice(6)).choices[0].delta;\n" +
"        if (delta.reasoning_content) thinking += delta.reasoning_content;\n" +
"        if (delta.content) { full += delta.content; onChunk(thinking ? '<think>' + thinking + '</think>' + full : full); }\n" +
"      } catch {}\n" +
"    }\n" +
"  }\n" +
"  return thinking ? '<think>' + thinking + '</think>' + full : full;";

if (apiSrc.includes(API_OLD)) {
  apiSrc = apiSrc.replace(API_OLD, API_NEW);
  fs.writeFileSync(apiPath, apiSrc);
  patched++;
  console.log('[1/3] api.js: native reasoning_content parser added');
} else {
  console.warn('[1/3] SKIP: api.js P1 not found');
}

// ─── PATCH 2 — api.js: enable_thinking param untuk Qwen ───
const API2_OLD = "    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true }),";
const API2_NEW = "    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true, ...(model.includes('qwen') ? { enable_thinking: true } : {}) }),";

// Re-read after patch 1
apiSrc = fs.readFileSync(apiPath, 'utf8');
if (apiSrc.includes(API2_OLD)) {
  apiSrc = apiSrc.replace(API2_OLD, API2_NEW);
  fs.writeFileSync(apiPath, apiSrc);
  patched++;
  console.log('[2/3] api.js: enable_thinking injected for Qwen models');
} else {
  console.warn('[2/3] SKIP: api.js P2 not found');
}

// ─── PATCH 3 — App.jsx: fix decision layer — lebih tegas, tidak tanya balik ───
const APP_OLD = "        // Hint singkat: hemat token\n" +
"        const DECISION_HINT = iter === 1 ? '\\n[TOOL RULE: Jawab langsung jika bisa. Pakai tool HANYA jika butuh info baru dari filesystem.]' : '';";

const APP_NEW = "        // Decision layer: tegas, tidak tanya balik\n" +
"        const DECISION_HINT = iter === 1 ? '\\n[ATURAN: Kalau pertanyaan bisa dijawab dari context di atas, JAWAB LANGSUNG sekarang. DILARANG tanya balik \"mau lihat kode?\" atau \"mau aku baca file?\". Kalau butuh file yang belum ada di context, baca sendiri pakai read_file tanpa izin.]' : '';";

if (appSrc.includes(APP_OLD)) {
  appSrc = appSrc.replace(APP_OLD, APP_NEW);
  fs.writeFileSync(appPath, appSrc);
  patched++;
  console.log('[3/3] App.jsx: decision layer dipertegas');
} else {
  console.warn('[3/3] SKIP: App.jsx decision layer not found');
}

console.log('\nSelesai! ' + patched + '/3 patch diterapkan.');
console.log('Perubahan:');
console.log('  1. Cerebras stream: parse reasoning_content native');
console.log('  2. Qwen models: enable_thinking: true di API request');
console.log('  3. Decision layer: tidak tanya balik, langsung act atau jawab');
