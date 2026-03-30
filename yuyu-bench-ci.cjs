'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

// --- utils ---
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const tap = fn => x => { fn(x); return x; };
const prop = k => o => o[k];
const read = p => fs.readFileSync(p, 'utf8');
const write = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));
const mkdir = p => fs.mkdirSync(p, { recursive: true });
const stripAnsi = s => s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');
const parseHz = s => parseFloat(s.replace(/,/g, ''));
const gitsha = () => { 
  try { return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } 
  catch { return 'unknown'; } 
};

// --- config ---
const ROOT = process.cwd();
const OUT_FILE = process.env.BENCH_OUTPUT || path.join(os.tmpdir(), 'bench-ci.json');
const TMP_JSON = path.join(os.tmpdir(), 'vitest-bench.json');

// --- platform ---
const platform = 
  process.arch === 'arm64' ? 'arm64' :
  process.arch.startsWith('arm') ? 'arm' :
  'x86_64';

// --- parsers ---
const parseJSON = () => {
  try {
    const data = JSON.parse(read(TMP_JSON));
    if (!Array.isArray(data?.benchmarks)) return [];
    return data.benchmarks
      .filter(b => b.name && typeof b.hz === 'number')
      .map(({ name, hz, rme }) => ({
        name,
        unit: 'ops/sec',
        value: hz,
        ...(rme && { range: `±${rme}%` })
      }));
  } catch { return []; }
};

const parseCLI = stdout => stripAnsi(stdout)
  .split('\n')
  .map(l => l.match(/^\s*·\s+(.+?)\s+([\d,]+(?:\.\d+)?)/))
  .filter(Boolean)
  .map(([, name, hz]) => ({
    name: name.trim(),
    value: parseHz(hz),
    unit: 'ops/sec'
  }))
  .filter(({ value }) => isFinite(value));

// --- transforms ---
const sortByPerf = xs => [...xs].sort((a, b) => b.value - a.value);

const normalize = entries => {
  if (!entries.length) return entries;
  const max = Math.max(...entries.map(prop('value')));
  return entries.map(e => ({
    ...e,
    score: Number((e.value / max).toFixed(4))
  }));
};

const tagSlow = xs => xs.map(e => 
  e.score < 0.1 ? { ...e, slow: true } : e
);

// --- io ---
const toReport = benchmarks => ({
  meta: {
    git: gitsha(),
    platform,
    node: process.version,
    timestamp: new Date().toISOString(),
    count: benchmarks.length
  },
  benchmarks
});

const formatRow = ({ name, value, score, range, slow }) => ({
  Name: name,
  'Ops/sec': value.toLocaleString(),
  Score: score,
  Stability: range || 'N/A',
  Slow: slow ? '⚠️' : ''
});

// --- runner (FIXED) ---
const runVitest = () => spawnSync('npx', [
  'vitest',
  'bench',
  '--run',
  '--reporter=verbose',
  `--outputFile=${TMP_JSON}`
], {
  cwd: ROOT,
  encoding: 'utf8',
  stdio: ['inherit', 'pipe', 'pipe']
});

// --- main ---
mkdir(path.dirname(OUT_FILE));

console.log('🏃 Running benchmarks...');
console.log(`📱 Platform: ${platform}`);
console.log(`🧠 Node: ${process.version}\n`);

const { stdout, stderr } = runVitest();
stdout && process.stdout.write(stdout);
stderr && process.stderr.write(stderr);

// parsing
const json = parseJSON();
const entries = json.length ? json : parseCLI(stdout);

if (!entries.length) {
  write(OUT_FILE, []);
  console.error('\n⚠️ No valid benchmark data (safe fallback)');
  process.exit(0);
}

// pipeline
pipe(
  sortByPerf,
  normalize,
  tagSlow,
  tap(es => write(OUT_FILE, toReport(es))),
  tap(es => {
    console.log('\n📊 Benchmark Summary:\n');
    console.table(es.map(formatRow));
    console.log(`\n✅ CI → ${OUT_FILE}`);
    console.log(`📦 Full report → ${path.join(ROOT, '.yuyu/bench-report.json')}`);
  })
)(entries);
