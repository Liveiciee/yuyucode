#!/usr/bin/env node
// patch_fix_tokens.cjs — naikkan low effort tokens
'use strict';
const fs = require('fs');
const target = process.argv[2];
if (!target) { console.error('Usage: node patch_fix_tokens.cjs src/App.jsx'); process.exit(1); }
let src = fs.readFileSync(target, 'utf8');
fs.writeFileSync(target + '.bak_tok', src);

const OLD = "    const effortTokens = { low: 512, medium: 1500, high: 3500 };";
const NEW = "    const effortTokens = { low: 1024, medium: 2048, high: 4000 };";

if (src.includes(OLD)) {
  src = src.replace(OLD, NEW);
  fs.writeFileSync(target, src);
  console.log('OK: low:1024 medium:2048 high:4000');
} else {
  console.warn('SKIP: tidak ditemukan');
}
