#!/usr/bin/env node
// patch_models.cjs — tambah llama-3.3-70b ke MODELS list
'use strict';
const fs = require('fs');

const target = process.argv[2];
if (!target) { console.error('Usage: node patch_models.cjs src/constants.js'); process.exit(1); }

let src = fs.readFileSync(target, 'utf8');
fs.writeFileSync(target + '.bak_models', src);

const OLD = "  { id: 'llama3.1-8b', label: 'Llama 3.1 8B ⚡', provider:'cerebras' },";
const NEW = "  { id: 'llama-3.3-70b', label: 'Llama 3.3 70B 🚀', provider:'cerebras' },\n" +
            "  { id: 'llama3.1-8b', label: 'Llama 3.1 8B ⚡', provider:'cerebras' },";

if (src.includes(OLD)) {
  src = src.replace(OLD, NEW);
  fs.writeFileSync(target, src);
  console.log('OK: llama-3.3-70b ditambahkan ke MODELS');
} else {
  console.warn('SKIP: target tidak ditemukan');
}
