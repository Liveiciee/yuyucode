#!/usr/bin/env node
// patch_agentic_v1b.cjs — shorten DECISION_HINT to save tokens
'use strict';
const fs = require('fs');

const target = process.argv[2];
if (!target) { console.error('Usage: node patch_agentic_v1b.cjs src/App.jsx'); process.exit(1); }

let src = fs.readFileSync(target, 'utf8');
const backup = target + '.bak_v1b';
fs.writeFileSync(backup, src);

const OLD = "        const DECISION_HINT = iter === 1 ? [\n" +
"          '',\n" +
"          'AGENTIC DECISION PROTOCOL \u2014 baca sebelum respons:',\n" +
"          'Sebelum melakukan apapun, tentukan: apakah request ini benar-benar butuh tool?',\n" +
"          '',\n" +
"          'JAWAB LANGSUNG (tanpa action block) jika:',\n" +
"          '- Pertanyaan/penjelasan yang bisa dijawab dari context yang sudah ada',\n" +
"          '- Review/analisis kode yang sudah terlihat di context',\n" +
"          '- Saran arsitektur, debugging hypothesis, atau diskusi teknis',\n" +
"          '',\n" +
"          'GUNAKAN TOOL jika:',\n" +
"          '- Perlu baca file yang belum ada di context -> read_file',\n" +
"          '- Perlu jalankan perintah / check output nyata -> exec',\n" +
"          '- Perlu tulis/edit file -> write_file',\n" +
"          '',\n" +
"          'ATURAN: Kalau bisa jawab tanpa tool, JANGAN pakai tool.'\n" +
"        ].join('\\n') : '';";

const NEW = "        // Hint singkat: hemat token\n" +
"        const DECISION_HINT = iter === 1 ? '\\n[TOOL RULE: Jawab langsung jika bisa. Pakai tool HANYA jika butuh info baru dari filesystem.]' : '';";

if (src.includes(OLD)) {
  src = src.replace(OLD, NEW);
  fs.writeFileSync(target, src);
  console.log('OK: DECISION_HINT diperpendek (~150 token -> ~15 token)');
  console.log('Backup: ' + backup);
} else {
  console.warn('SKIP: string tidak ditemukan');
}
