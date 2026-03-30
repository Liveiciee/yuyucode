'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

// ── CONFIG ─────────────────────────────────────────────────────────────
const ROOT = process.cwd();
const OUT_FILE = process.env.BENCH_OUTPUT || path.join(os.tmpdir(), 'bench-ci.json');
const FULL_REPORT = path.join(ROOT, '.yuyu', 'bench-report.json');
const TMP_JSON = path.join(os.tmpdir(), 'vitest-bench.json');

// ── UTILS ──────────────────────────────────────────────────────────────
const stripAnsi = s => s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');
const parseHz = s => parseFloat(String(s).replace(/,/g, ''));
const mkdir = p => fs.mkdirSync(p, { recursive: true });

const gitsha = () => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

// detect platform REAL (bukan label doang)
const platform =
  process.arch === 'arm64' ? 'arm64' :
  process.arch.startsWith('arm') ? 'arm' :
  'x86_64';

// ── RUN VITEST ─────────────────────────────────────────────────────────
function runVitest() {
  return spawnSync(
    'npx',
    [
      'vitest',
      'bench',
      '--run',
      '--reporter=verbose',
      '--reporter=json',
      `--outputFile=${TMP_JSON}`
    ],
    {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe']
    }
  );
}

// ── PARSERS ────────────────────────────────────────────────────────────

// PRIORITAS: JSON (paling valid)
function parseJSON() {
  try {
    const raw = fs.readFileSync(TMP_JSON, 'utf8');
    const data = JSON.parse(raw);

    if (!Array.isArray(data?.benchmarks)) return [];

    return data.benchmarks
      .filter(b => b && b.name && typeof b.hz === 'number' && isFinite(b.hz) && b.hz > 0)
      .map(b => ({
        name: b.name.trim(),
        unit: 'ops/sec',
        value: b.hz,
        ...(b.rme ? { range: `±${b.rme}%` } : {})
      }));
  } catch {
    return [];
  }
}

// FALLBACK: CLI parsing
function parseCLI(stdout) {
  const clean = stripAnsi(stdout || '');

  return clean
    .split('\n')
    .map(line => {
      const m = line.match(/^\s*·\s+(.+?)\s+([\d,]+(?:\.\d+)?)/);
      if (!m) return null;

      const name = m[1].trim();
      const hz = parseHz(m[2]);

      if (!name || !isFinite(hz) || hz <= 0) return null;

      return {
        name,
        unit: 'ops/sec',
        value: hz
      };
    })
    .filter(Boolean);
}

// ── CLEANING ───────────────────────────────────────────────────────────

// FIX DUPLICATE (ini yang kena kamu tadi)
function dedupe(entries) {
  const map = new Map();

  for (const e of entries) {
    // ambil yg paling tinggi kalau duplicate
    if (!map.has(e.name) || map.get(e.name).value < e.value) {
      map.set(e.name, e);
    }
  }

  return Array.from(map.values());
}

// SORT + SCORE
function normalize(entries) {
  const max = Math.max(...entries.map(e => e.value));

  return entries.map(e => ({
    ...e,
    score: Number((e.value / max).toFixed(4)),
    ...(e.value / max < 0.1 ? { slow: true } : {})
  }));
}

// ── MAIN ───────────────────────────────────────────────────────────────
mkdir(path.dirname(OUT_FILE));
mkdir(path.dirname(FULL_REPORT));

console.log('🏃 Running benchmarks...');
console.log(`📱 Platform: ${platform}`);
console.log(`🧠 Node: ${process.version}\n`);

const { stdout, stderr } = runVitest();

if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);

// ambil data
let entries = parseJSON();

// fallback kalau JSON gagal
if (!entries.length) {
  entries = parseCLI(stdout);
}

// HARD GUARD (tapi gak fail CI keras)
if (!entries.length) {
  fs.writeFileSync(OUT_FILE, JSON.stringify([], null, 2));
  console.error('\n⚠️ No valid benchmark data (safe fallback)');
  process.exit(0);
}

// FIX DUPLICATE + CLEAN
entries = dedupe(entries);

// SORT + SCORE
entries = normalize(
  entries.sort((a, b) => b.value - a.value)
);

// ── OUTPUT ─────────────────────────────────────────────────────────────

// format buat github-action-benchmark (WAJIB flat array)
const ciOutput = entries.map(({ name, value, unit, range }) => ({
  name,
  unit,
  value,
  ...(range ? { range } : {})
}));

fs.writeFileSync(OUT_FILE, JSON.stringify(ciOutput, null, 2));

// full report (optional, buat kamu)
const fullReport = {
  meta: {
    git: gitsha(),
    platform,
    node: process.version,
    timestamp: new Date().toISOString(),
    count: entries.length
  },
  benchmarks: entries
};

fs.writeFileSync(FULL_REPORT, JSON.stringify(fullReport, null, 2));

// display
console.log('\n📊 Benchmark Summary:\n');
console.table(entries.map(e => ({
  Name: e.name,
  'Ops/sec': e.value.toLocaleString(),
  Score: e.score,
  Stability: e.range || 'N/A',
  Slow: e.slow ? '⚠️' : ''
})));

console.log(`\n✅ CI → ${OUT_FILE}`);
console.log(`📦 Full report → ${FULL_REPORT}`);
