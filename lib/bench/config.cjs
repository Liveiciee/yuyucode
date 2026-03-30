// config.cjs
const path = require('path');

const ROOT = process.cwd();
const YUYU_DIR = path.join(ROOT, '.yuyu');
const HIST_FILE = path.join(YUYU_DIR, 'bench-history.json');
const BUDGET_FILE = path.join(YUYU_DIR, 'bench-budget.json');
const EXPORT_DIR = path.join(YUYU_DIR, 'exports');

const THRESHOLD = parseFloat(process.env.BENCH_THRESHOLD) || 1.5;
const MAX_RUNS = parseInt(process.env.BENCH_MAX_RUNS) || 20;
const CI_CONFIDENCE = parseFloat(process.env.BENCH_CI) || 0.95;

const isArm64 = process.arch === 'arm64' || process.arch === 'arm';
const BENCH_TIMEOUT = process.env.BENCH_TIMEOUT
  ? Number(process.env.BENCH_TIMEOUT)
  : (isArm64 ? 180000 : 120000);

// Parse CLI flags for use in other modules
const flags = {
  SAVE: process.argv.includes('--save'),
  RESET: process.argv.includes('--reset'),
  WATCH: process.argv.includes('--watch'),
  TREND: process.argv.includes('--trend'),
  EXPORT: process.argv.includes('--export'),
  COMPARE: process.argv.includes('--compare'),
  CI_MODE: process.argv.includes('--ci'),
  VERBOSE: process.argv.includes('--verbose') || process.argv.includes('-v'),
  STATS: process.argv.includes('--stats'),
  BUDGET: process.argv.includes('--budget'),
  PR_COMMENT: process.argv.includes('--pr-comment'),
  ANOMALY: process.argv.includes('--anomaly'),
  INTERACTIVE: process.argv.includes('--interactive') || process.argv.includes('-i'),
  DRY_RUN: process.argv.includes('--dry-run'),
  PERF_SCORE: process.argv.includes('--perf-score'),
};

module.exports = {
  ROOT,
  YUYU_DIR,
  HIST_FILE,
  BUDGET_FILE,
  EXPORT_DIR,
  THRESHOLD,
  MAX_RUNS,
  CI_CONFIDENCE,
  isArm64,
  BENCH_TIMEOUT,
  flags
};
