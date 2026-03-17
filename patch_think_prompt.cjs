#!/usr/bin/env node
// patch_think_prompt.cjs — inject <think> instruction into systemPrompt
'use strict';
const fs = require('fs');

const target = process.argv[2];
if (!target) { console.error('Usage: node patch_think_prompt.cjs src/App.jsx'); process.exit(1); }

let src = fs.readFileSync(target, 'utf8');
fs.writeFileSync(target + '.bak_thinkprompt', src);

const OLD = "      const systemPrompt=BASE_SYSTEM+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillCtx+pinnedCtx+fileCtx+memCtx+agentMemCtx+visionCtx;";

const NEW = "      const thinkInstruction = '\\n\\nSebelum respons, tulis reasoning singkat dalam <think>...</think>. Singkat, max 2 kalimat.';\n" +
"      const systemPrompt=BASE_SYSTEM+thinkInstruction+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillCtx+pinnedCtx+fileCtx+memCtx+agentMemCtx+visionCtx;";

if (src.includes(OLD)) {
  src = src.replace(OLD, NEW);
  fs.writeFileSync(target, src);
  console.log('OK: think instruction injected ke systemPrompt');
} else {
  console.warn('SKIP: target string tidak ditemukan');
}
