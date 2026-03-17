#!/usr/bin/env node
'use strict';
const fs = require('fs');
const target = process.argv[2];
if (!target) { console.error('Usage: node patch_rm_think_prompt.cjs src/constants.js'); process.exit(1); }
let src = fs.readFileSync(target, 'utf8');
fs.writeFileSync(target + '.bak_rmt', src);

const OLD = "  '',\n  '## THINKING',\n  'Sebelum setiap respons, tulis reasoning dalam <think>...</think>. Maks 1-2 kalimat.',";
if (src.includes(OLD)) {
  src = src.replace(OLD, '');
  fs.writeFileSync(target, src);
  console.log('OK: thinking instruction dihapus dari BASE_SYSTEM');
} else {
  console.warn('SKIP: tidak ditemukan');
}
