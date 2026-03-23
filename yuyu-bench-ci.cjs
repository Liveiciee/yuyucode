#!/usr/bin/env node
// yuyu-bench-ci.cjs — CI benchmark runner
// Runs vitest bench dan output JSON untuk github-action-benchmark
// Output: .yuyu/bench-ci.json
//
// Format yang diharapkan github-action-benchmark (custom tool):
//   [ { "name": "getLangExt", "unit": "ops/sec", "value": 981449 }, ... ]

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT     = process.cwd();
const YUYU_DIR = path.join(ROOT, '.yuyu');
const OUT_FILE = process.env.BENCH_OUTPUT || path.join(YUYU_DIR, 'bench-ci.json');

if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

console.log('🏃 Running CI benchmarks...\n');

const result = spawnSync(
  'npx', ['vitest', 'bench', '--run', '--reporter=verbose'],
  { cwd: ROOT, encoding: 'utf8', timeout: 180_000, stdio: ['inherit', 'pipe', 'pipe'] }
);

const raw      = result.stdout || '';
const stripped = raw.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');

process.stdout.write(raw);
if (result.stderr) process.stderr.write(result.stderr);

// Parse tiap bench line:
// "   · single call — jsx    981,449.94  0.0009  ..."
// → name + hz
const entries = [];
const seenNames = new Set();
const lineRe  = /^\s+·\s+(.+?)\s{2,}([\d,]+\.\d+)\s+[\d.]+/;

for (const line of stripped.split('\n')) {
  const m = line.match(lineRe);
  if (!m) continue;
  const name  = m[1].trim();
  const value = parseFloat(m[2].replace(/,/g, ''));
  if (name && value > 0) {
    entries.push({ name, unit: 'ops/sec', value });
  }
}

if (entries.length === 0) {
  console.error('\n❌ Tidak ada bench hasil yang bisa di-parse. Cek output di atas.');
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2));
console.log(`\n✅ ${entries.length} bench results → ${OUT_FILE}`);
entries.forEach(e => console.log(`   ${e.name.padEnd(48)} ${e.value.toLocaleString()} ops/sec`));
