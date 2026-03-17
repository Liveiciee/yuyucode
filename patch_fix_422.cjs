#!/usr/bin/env node
// patch_fix_422.cjs — hapus enable_thinking yang bikin HTTP 422
'use strict';
const fs = require('fs');

const target = process.argv[2];
if (!target) { console.error('Usage: node patch_fix_422.cjs src/api.js'); process.exit(1); }

let src = fs.readFileSync(target, 'utf8');
fs.writeFileSync(target + '.bak_422', src);

const OLD = "    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true, ...(model.includes('qwen') ? { enable_thinking: true } : {}) }),";
const NEW = "    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true }),";

if (src.includes(OLD)) {
  src = src.replace(OLD, NEW);
  fs.writeFileSync(target, src);
  console.log('OK: enable_thinking dihapus');
} else {
  console.warn('SKIP: tidak ditemukan');
}
