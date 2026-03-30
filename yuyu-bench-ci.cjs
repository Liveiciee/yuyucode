'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

// ── CONFIG ─────────────────────────────────────────
const ROOT = process.cwd();

const CI_OUT = process.env.BENCH_OUTPUT || path.join(os.tmpdir(), 'bench-ci.json');
const REPORT_OUT = path.join(ROOT, '.yuyu', 'bench-report.json');

// ensure dirs
fs.mkdirSync(path.dirname(CI_OUT), { recursive: true });
fs.mkdirSync(path.dirname(REPORT_OUT), { recursive: true });

// ── UTILS ──────────────────────────────────────────
const stripAnsi = s => s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');
const parseHz = s => parseFloat(s.replace(/,/g, ''));
const gitsha = () => {
  try { return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); }
  catch { return 'unknown'; }
};

// platform lebih akurat di CI
const platform = process.env.RUNNER_ARCH || process.arch;

// ── RUN ────────────────────────────────────────────
console.log('🏃 Running benchmarks...');
console.log(`📱 Platform: ${platform}`);
console.log(`🧠 Node: ${process.version}\n`);

const result = spawnSync(
  'npx',
  ['vitest', 'bench', '--run', '--reporter=verbose'],
  { cwd: ROOT, encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] }
);

const stdout = result.stdout || '';
const stderr = result.stderr || '';

stdout && process.stdout.write(stdout);
stderr && process.stderr.write(stderr);

// ── PARSE (ANTI DUPLICATE + STRICT) ────────────────
const entries = [];
const seen = new Set();

let inSummary = false;

for (const line of stripAnsi(stdout).split('\n')) {
  if (line.includes('BENCH') && line.includes('Summary')) {
    inSummary = true;
    continue;
  }

  if (inSummary) continue;

  const m = line.match(/^\s*·\s+(.+?)\s+([\d,]+(?:\.\d+)?)/);
  if (!m) continue;

  const name = m[1].trim();
  const hz = parseHz(m[2]);

  if (!name || !hz || !isFinite(hz)) continue;
  if (seen.has(name)) continue;

  seen.add(name);

  entries.push({
    name,
    unit: 'ops/sec',
    value: hz
  });
}

// ── SAFE FALLBACK ──────────────────────────────────
if (!entries.length) {
  console.warn('\n⚠️ No benchmark parsed. Writing empty array (CI safe)');
  fs.writeFileSync(CI_OUT, JSON.stringify([], null, 2));
  process.exit(0);
}

// ── ENRICH (FITUR KAMU BALIK) ──────────────────────
const max = Math.max(...entries.map(e => e.value));

const enriched = entries.map(e => {
  const score = e.value / max;
  return {
    ...e,
    score: Number(score.toFixed(4)),
    slow: score < 0.1
  };
});

// ── SORT ───────────────────────────────────────────
enriched.sort((a, b) => b.value - a.value);

// ── OUTPUT 1: CI (STRICT FORMAT) ───────────────────
fs.writeFileSync(CI_OUT, JSON.stringify(entries, null, 2));

// ── OUTPUT 2: FULL REPORT (FITUR KAMU) ─────────────
fs.writeFileSync(REPORT_OUT, JSON.stringify({
  meta: {
    git: gitsha(),
    platform,
    node: process.version,
    timestamp: new Date().toISOString(),
    count: enriched.length
  },
  benchmarks: enriched
}, null, 2));

// ── LOG ────────────────────────────────────────────
console.log('\n📊 Benchmark Summary:\n');
console.table(enriched.map(e => ({
  Name: e.name,
  'Ops/sec': e.value.toLocaleString(),
  Score: e.score,
  Slow: e.slow ? '⚠️' : ''
})));

console.log(`\n✅ CI → ${CI_OUT}`);
console.log(`📦 Full report → ${REPORT_OUT}`);
