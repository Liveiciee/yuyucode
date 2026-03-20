#!/usr/bin/env node
// yuyu-bench.cjs — Benchmark regression detector v2
// Usage:
//   node yuyu-bench.cjs          # run + auto-save (first) or compare (subsequent)
//   node yuyu-bench.cjs --save   # force update baseline
//   node yuyu-bench.cjs --reset  # clear history

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT      = process.cwd();
const YUYU_DIR  = path.join(ROOT, '.yuyu');
const HIST_FILE = path.join(YUYU_DIR, 'bench-history.json');
const THRESHOLD = 1.5; // warn if ratio drops >1.5x from baseline
const SAVE  = process.argv.includes('--save');
const RESET = process.argv.includes('--reset');

if (RESET) {
  if (fs.existsSync(HIST_FILE)) { fs.unlinkSync(HIST_FILE); console.log('🗑  bench history cleared.'); }
  else console.log('ℹ  No history to reset.');
  process.exit(0);
}

if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

// ── Run vitest bench ──────────────────────────────────────────────────────────
console.log('🏃 Running benchmarks...\n');

const result = spawnSync(
  'npx', ['vitest', 'bench', '--run'],
  { cwd: ROOT, encoding: 'utf8', timeout: 120_000, stdio: ['inherit', 'pipe', 'inherit'], env: { ...process.env, FORCE_COLOR: '1' } }
);

const raw = result.stdout || '';
process.stdout.write(raw);

// Strip ANSI escape codes before parsing
const stripped = raw.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');

// ── Parse vitest v1 bench Summary ─────────────────────────────────────────────
// Format:
//   winner name - file > suite
//     Nx faster than loser name
//
// Strategy: for each winner, store its ratio vs each loser as score.
// Score = sum of all Nx ratios this bench wins — higher = faster overall.
// Regression = score drops significantly between runs.

const scores = {}; // name → total score (sum of ratios won)

// Find summary section
const summaryStart = stripped.indexOf('BENCH  Summary');
if (summaryStart === -1) {
  console.log('\n⚠  No BENCH Summary found in output.');
  process.exit(0);
}
const summary = stripped.slice(summaryStart);

// Parse blocks: winner line followed by "  Nx faster than loser" lines
const lines = summary.split('\n');
let currentWinner = null;

for (const line of lines) {
  // Winner line: "  name - file > suite" OR "  name  " (no file)
  const winnerMatch = line.match(/^\s{1,4}(\S.+?)\s+-\s+\S.*?>\s+\S|^\s{1,4}(.+?)\s{3,}/);
  // Simpler: winner lines start with 2 spaces, ratio lines start with 4 spaces
  const isRatio  = /^\s{4,}([\d.]+)x faster than/.test(line);
  const isWinner = /^\s{2,3}\S/.test(line) && !isRatio && line.trim().length > 0;

  if (isWinner && !isRatio) {
    // Extract bench name — strip " - file > suite" suffix
    currentWinner = line.trim().replace(/\s+-\s+\S+\.bench\.\w+\s*>\s*\S+.*$/, '').trim();
    if (!scores[currentWinner]) scores[currentWinner] = 0;
  }

  if (isRatio && currentWinner) {
    const m = line.match(/([\d.]+)x faster than/);
    if (m) {
      const ratio = parseFloat(m[1]);
      scores[currentWinner] = (scores[currentWinner] || 0) + ratio;
    }
  }
}

const names = Object.keys(scores).filter(n => scores[n] > 0);

if (names.length === 0) {
  console.log('\n⚠  Could not parse bench summary. Bench ran ok (output above ↑).');
  console.log('   History not updated this run.');
  process.exit(0);
}

console.log(`\n📊 ${names.length} benches parsed from summary\n`);

// ── Load history & compare ────────────────────────────────────────────────────
const history = fs.existsSync(HIST_FILE) ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')) : {};
const isFirst = Object.keys(history).length === 0;
const ts      = new Date().toISOString();
const W       = 52;

let regressions = 0, improvements = 0;
console.log('─'.repeat(W + 20));

for (const name of names.sort()) {
  const cur  = scores[name];
  const prev = history[name]?.score;
  const fmtScore = s => `score ${s.toFixed(1)}`;

  if (!prev || isFirst) {
    console.log(`  ✨ NEW   ${name.slice(0,W).padEnd(W)} ${fmtScore(cur)}`);
    continue;
  }

  const ratio = cur / prev;
  if (ratio < 1 / THRESHOLD) {
    console.log(`  🔴 SLOW  ${name.slice(0,W).padEnd(W)} ${fmtScore(cur)}  (${ratio.toFixed(2)}x — was ${fmtScore(prev)})`);
    regressions++;
  } else if (ratio > THRESHOLD) {
    console.log(`  🟢 FAST  ${name.slice(0,W).padEnd(W)} ${fmtScore(cur)}  (${ratio.toFixed(1)}x faster)`);
    improvements++;
  } else {
    console.log(`  ✅ OK    ${name.slice(0,W).padEnd(W)} ${fmtScore(cur)}  (${ratio.toFixed(2)}x)`);
  }
}
console.log('─'.repeat(W + 20));

// ── Save ──────────────────────────────────────────────────────────────────────
const newHistory = { ...history };
for (const name of names) {
  if (SAVE || isFirst || !newHistory[name]) {
    newHistory[name] = { score: scores[name], savedAt: ts };
  }
}
fs.writeFileSync(HIST_FILE, JSON.stringify(newHistory, null, 2));

if (SAVE || isFirst) console.log(`\n💾 ${names.length} baselines saved → .yuyu/bench-history.json`);

console.log('');
if (regressions > 0) {
  console.log(`⚠️  ${regressions} regression(s)! Lihat 🔴 di atas.`);
  console.log('   Disengaja? Update baseline: node yuyu-bench.cjs --save');
  process.exitCode = 1;
} else if (!isFirst) {
  console.log(`✅ No regressions.${improvements ? ` ${improvements} improvement(s) 🎉` : ' All stable.'}`);
}
console.log('💡 --save  update baseline  |  --reset  clear history');
