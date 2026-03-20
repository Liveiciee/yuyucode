#!/usr/bin/env node
// yuyu-bench.cjs — Benchmark regression detector v2
//
// Satu command untuk segalanya:
//   node yuyu-bench.cjs          # run + auto-save (first time) atau compare (subsequent)
//   node yuyu-bench.cjs --save   # force update baseline
//   node yuyu-bench.cjs --reset  # clear history
//
// Simpan hasil ke .yuyu/bench-history.json
// Flag 🔴 kalau ada bench 2x lebih lambat dari baseline.

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT      = process.cwd();
const YUYU_DIR  = path.join(ROOT, '.yuyu');
const HIST_FILE = path.join(YUYU_DIR, 'bench-history.json');
const OUT_FILE  = path.join(YUYU_DIR, 'bench-results.json');
const THRESHOLD = 2.0;

const SAVE  = process.argv.includes('--save');
const RESET = process.argv.includes('--reset');

if (RESET) {
  [HIST_FILE, OUT_FILE].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  console.log('🗑  bench history cleared.');
  process.exit(0);
}

if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

// ── Run vitest bench → write JSON to file (clean, no stdout parse) ────────────
console.log('🏃 Running benchmarks...\n');

const result = spawnSync(
  'npx',
  ['vitest', 'bench', '--run', '--reporter=json', `--outputFile=${OUT_FILE}`],
  { cwd: ROOT, encoding: 'utf8', timeout: 120_000, stdio: 'inherit' }
);

if (result.error) {
  console.error('❌ spawn error:', result.error.message);
  process.exit(1);
}

if (!fs.existsSync(OUT_FILE)) {
  console.error('❌ Output file not created. Mungkin tidak ada bench files.');
  process.exit(1);
}

// ── Parse output JSON ─────────────────────────────────────────────────────────
let benchData;
try {
  benchData = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
} catch (e) {
  console.error('❌ Parse bench output gagal:', e.message);
  process.exit(1);
}

// ── Extract: { "desc > name" → hz } ──────────────────────────────────────────
function extract(node, suite = '', out = {}) {
  if (!node) return out;
  const nodes = Array.isArray(node) ? node : [node];
  for (const n of nodes) {
    const name = suite ? `${suite} > ${n.name}` : (n.name || '');
    if (n.result?.hz)                   out[name] = { hz: n.result.hz };
    if (n.tasks)    extract(n.tasks,    name, out);
    if (n.children) extract(n.children, name, out);
    if (n.testResults) extract(n.testResults, suite, out);
  }
  return out;
}

const current = extract(benchData?.testResults || benchData);
const names   = Object.keys(current);

if (names.length === 0) {
  // Fallback: try flat structure
  console.log('⚠  No benchmark results parsed. Check editor.bench.js exists.');
  process.exit(0);
}

console.log(`\n📊 ${names.length} benchmarks\n`);

// ── Load history ──────────────────────────────────────────────────────────────
const history  = fs.existsSync(HIST_FILE) ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')) : {};
const isFirst  = Object.keys(history).length === 0;
const timestamp = new Date().toISOString();

// ── Compare & print ───────────────────────────────────────────────────────────
let regressions = 0, improvements = 0;
const W = 50;

console.log('─'.repeat(W + 25));
for (const name of names) {
  const cur  = current[name];
  const prev = history[name];
  const fmt  = hz => hz >= 1e6 ? (hz/1e6).toFixed(2)+'M/s'
                    : hz >= 1e3 ? (hz/1e3).toFixed(1)+'K/s'
                    : hz.toFixed(0)+'/s';

  if (!prev || isFirst) {
    console.log(`  ✨ NEW   ${name.slice(0,W).padEnd(W)} ${fmt(cur.hz)}`);
    continue;
  }

  const ratio = cur.hz / prev.hz;
  if (ratio < 1 / THRESHOLD) {
    console.log(`  🔴 SLOW  ${name.slice(0,W).padEnd(W)} ${fmt(cur.hz)}  (${ratio.toFixed(2)}x vs ${fmt(prev.hz)})`);
    regressions++;
  } else if (ratio > THRESHOLD) {
    console.log(`  🟢 FAST  ${name.slice(0,W).padEnd(W)} ${fmt(cur.hz)}  (${ratio.toFixed(1)}x)`);
    improvements++;
  } else {
    console.log(`  ✅ OK    ${name.slice(0,W).padEnd(W)} ${fmt(cur.hz)}  (${ratio.toFixed(2)}x)`);
  }
}
console.log('─'.repeat(W + 25));

// ── Save history ──────────────────────────────────────────────────────────────
const newHistory = { ...history };
for (const name of names) {
  if (SAVE || isFirst || !newHistory[name]) {
    newHistory[name] = { hz: current[name].hz, savedAt: timestamp };
  }
}
fs.writeFileSync(HIST_FILE, JSON.stringify(newHistory, null, 2));

if (SAVE || isFirst) {
  console.log(`\n💾 ${names.length} baselines saved → .yuyu/bench-history.json`);
} else {
  const newOnes = names.filter(n => !history[n]).length;
  if (newOnes > 0) console.log(`\n💾 ${newOnes} new bench(es) added to history`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('');
if (regressions > 0) {
  console.log(`⚠️  ${regressions} regression(s)! See 🔴 above.`);
  console.log('   Disengaja? Update baseline: node yuyu-bench.cjs --save');
  process.exitCode = 1;
} else if (!isFirst) {
  console.log(`✅ No regressions.${improvements ? ` ${improvements} improvement(s) 🎉` : ' All stable.'}`);
}
console.log('\n💡 node yuyu-bench.cjs --save    # update baseline after intentional change');
console.log('   node yuyu-bench.cjs --reset   # clear all history');
