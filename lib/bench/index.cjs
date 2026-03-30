#!/usr/bin/env node
// index.cjs – main entry point for yuyu-bench
'use strict';

const fs = require('fs');
const { flags, YUYU_DIR, HIST_FILE, BUDGET_FILE } = require('./config.cjs');
const { readJSONSafe, writeJSONSafe, gitHash, gitBranch } = require('./utils.cjs');
const { mean, trendDirection } = require('./stats.cjs');
const { sparkline } = require('./charts.cjs');
const { checkBudget, setBudget } = require('./budget.cjs');
const { compareCommits, generateStatsReport } = require('./history.cjs');
const { startWatch } = require('./ui.cjs');
const { runBench } = require('./runner.cjs');

// Ensure .yuyu directory exists
if (!fs.existsSync(YUYU_DIR)) {
  fs.mkdirSync(YUYU_DIR, { recursive: true });
}

// Handle special commands
if (flags.RESET) {
  if (fs.existsSync(HIST_FILE)) {
    fs.unlinkSync(HIST_FILE);
    console.log('🗑  Bench history cleared.');
  }
  if (fs.existsSync(BUDGET_FILE)) {
    fs.unlinkSync(BUDGET_FILE);
    console.log('🗑  Bench budgets cleared.');
  }
  process.exit(0);
}

if (flags.TREND) {
  const history = readJSONSafe(HIST_FILE);
  if (Object.keys(history).length === 0) {
    console.log('ℹ  No history yet. Run bench dulu sekali.');
    process.exit(0);
  }

  console.log('\n📈 Score Trend (kiri = lama, kanan = terbaru)\n');
  console.log('─'.repeat(70));

  for (const [name, data] of Object.entries(history).sort()) {
    const runs = data.runs || [];
    const scores_arr = runs.map(r => r.score);
    const spark = scores_arr.length >= 2 ? sparkline(scores_arr, { showRange: true }) : '(belum cukup data)';
    const last = runs[runs.length - 1];
    const trend = trendDirection(scores_arr);
    const trendIcon = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';

    const info = last ? `  ${last.score.toFixed(1)} ops/s  ${last.gitHash || ''}` : '';
    console.log(`  ${trendIcon} ${name.padEnd(42)} ${spark}${info}`);
  }

  console.log('─'.repeat(70));
  console.log('');
  process.exit(0);
}

if (flags.COMPARE) {
  const args = process.argv.slice(3);
  if (args.length < 2) {
    console.log('Usage: node yuyu-bench.cjs --compare <commitA> <commitB>');
    process.exit(1);
  }

  const [commitA, commitB] = args;
  const history = readJSONSafe(HIST_FILE);

  // Create mock scores for comparison
  const scores = {};
  for (const [name, data] of Object.entries(history)) {
    scores[name] = mean(data.runs?.map(r => r.score) || []);
  }

  const results = compareCommits(commitA, commitB, scores);

  console.log(`\n🔄 Comparing ${commitA} vs ${commitB}\n`);
  console.log('─'.repeat(70));

  for (const r of results) {
    const icon = r.diff > 5 ? '🟢' : r.diff < -5 ? '🔴' : '⚪';
    const sign = r.diff > 0 ? '+' : '';
    console.log(`  ${icon} ${r.name.padEnd(40)} ${sign}${r.diff.toFixed(1)}%`);
  }

  console.log('─'.repeat(70));
  process.exit(0);
}

if (flags.STATS) {
  const history = readJSONSafe(HIST_FILE);
  if (Object.keys(history).length === 0) {
    console.log('ℹ  No history yet.');
    process.exit(0);
  }
  console.log(generateStatsReport(history));
  process.exit(0);
}

// If no special flags, run the benchmark
if (flags.WATCH) {
  const interval = parseInt(process.env.BENCH_WATCH_INTERVAL) || 60000;
  startWatch(runBench, interval);
} else {
  runBench();
}
