#!/usr/bin/env node
// yuyu-bench.cjs — Benchmark regression detector
// Usage:
//   node yuyu-bench.cjs          # run bench + compare to history
//   node yuyu-bench.cjs --save   # run bench + save as new baseline
//   node yuyu-bench.cjs --reset  # clear history
//
// Saves results to .yuyu/bench-history.json
// Warns when any bench is 2x slower than baseline.

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT      = process.cwd();
const YUYU_DIR  = path.join(ROOT, '.yuyu');
const HIST_FILE = path.join(YUYU_DIR, 'bench-history.json');
const THRESHOLD = 2.0; // warn if Nx slower than baseline

const SAVE  = process.argv.includes('--save');
const RESET = process.argv.includes('--reset');

if (RESET) {
  if (fs.existsSync(HIST_FILE)) {
    fs.unlinkSync(HIST_FILE);
    console.log('🗑  bench-history.json cleared.');
  } else {
    console.log('ℹ  No history to reset.');
  }
  process.exit(0);
}

// ── Run vitest bench with JSON reporter ───────────────────────────────────────
console.log('🏃 Running benchmarks...\n');

const result = spawnSync(
  'npx', ['vitest', 'bench', '--run', '--reporter=json'],
  { cwd: ROOT, encoding: 'utf8', timeout: 120_000, stdio: 'pipe' }
);

if (result.error || result.status !== 0) {
  console.error('❌ vitest bench failed:\n' + (result.stderr || result.stdout || '').slice(0, 500));
  process.exit(1);
}

// ── Parse JSON output ─────────────────────────────────────────────────────────
let benchData;
try {
  // vitest JSON reporter outputs to stdout — find the JSON blob
  const stdout = result.stdout || '';
  const jsonStart = stdout.indexOf('{');
  const jsonEnd   = stdout.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found in output');
  benchData = JSON.parse(stdout.slice(jsonStart, jsonEnd + 1));
} catch (e) {
  console.error('❌ Could not parse vitest bench output:', e.message);
  console.log('Raw stdout (first 300 chars):', (result.stdout || '').slice(0, 300));
  process.exit(1);
}

// ── Extract bench results: { name -> hz (ops/sec) } ──────────────────────────
function extractBenches(data, out = {}) {
  if (!data) return out;
  if (Array.isArray(data)) { data.forEach(d => extractBenches(d, out)); return out; }
  if (data.type === 'bench' && data.name && data.result?.hz) {
    out[data.name] = { hz: data.result.hz, mean: data.result.mean };
  }
  if (data.tasks)    extractBenches(data.tasks, out);
  if (data.children) extractBenches(data.children, out);
  return out;
}

const current = extractBenches(benchData);
const names   = Object.keys(current);

if (names.length === 0) {
  console.log('⚠  No bench results found. Run: npx vitest bench --run');
  process.exit(0);
}

console.log(`📊 ${names.length} benchmarks found.\n`);

// ── Load or create history ────────────────────────────────────────────────────
if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

const history = fs.existsSync(HIST_FILE)
  ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8'))
  : {};

// ── Compare ───────────────────────────────────────────────────────────────────
const timestamp = new Date().toISOString();
let regressions = 0;
let improvements = 0;

console.log('═'.repeat(60));
for (const name of names) {
  const cur = current[name];
  const prev = history[name];
  const hzStr = cur.hz >= 1e6
    ? (cur.hz / 1e6).toFixed(2) + 'M ops/s'
    : cur.hz >= 1e3
    ? (cur.hz / 1e3).toFixed(1) + 'K ops/s'
    : cur.hz.toFixed(0) + ' ops/s';

  if (!prev) {
    console.log(`  ✨ NEW   ${name.padEnd(45)} ${hzStr}`);
    continue;
  }

  const ratio = cur.hz / prev.hz;
  if (ratio < 1 / THRESHOLD) {
    console.log(`  🔴 SLOW  ${name.padEnd(45)} ${hzStr}  (${ratio.toFixed(2)}x — was ${(prev.hz/1e3).toFixed(1)}K)`);
    regressions++;
  } else if (ratio > THRESHOLD) {
    console.log(`  🟢 FAST  ${name.padEnd(45)} ${hzStr}  (${ratio.toFixed(1)}x faster)`);
    improvements++;
  } else {
    console.log(`  ✅ OK    ${name.padEnd(45)} ${hzStr}  (${ratio.toFixed(2)}x)`);
  }
}
console.log('═'.repeat(60));

// ── Save / update history ─────────────────────────────────────────────────────
if (SAVE || Object.keys(history).length === 0) {
  const newHistory = {};
  for (const name of names) {
    newHistory[name] = { hz: current[name].hz, savedAt: timestamp };
  }
  fs.writeFileSync(HIST_FILE, JSON.stringify(newHistory, null, 2));
  console.log(`\n💾 Saved ${names.length} baselines → .yuyu/bench-history.json`);
} else {
  // Update history with new results (rolling — keep existing baselines)
  for (const name of names) {
    if (!history[name]) {
      history[name] = { hz: current[name].hz, savedAt: timestamp };
    }
  }
  fs.writeFileSync(HIST_FILE, JSON.stringify(history, null, 2));
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('');
if (regressions > 0) {
  console.log(`⚠️  ${regressions} regression(s) detected! Check 🔴 entries above.`);
  console.log('   Kalau disengaja (refactor): node yuyu-bench.cjs --save');
  process.exitCode = 1;
} else {
  console.log(`✅ No regressions. ${improvements > 0 ? improvements + ' improvement(s)!' : 'All stable.'}`);
}
console.log(`\n💡 Tip: node yuyu-bench.cjs --save   # update baseline`);
console.log(`        node yuyu-bench.cjs --reset  # clear history`);
