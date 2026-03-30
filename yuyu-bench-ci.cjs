'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const OUT_FILE = process.env.BENCH_OUTPUT || path.join(os.tmpdir(), 'bench-ci.json');

// ensure dir
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

// --- utils ---
const stripAnsi = s => s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');
const parseHz = s => parseFloat(s.replace(/,/g, ''));

// --- platform (fix misleading log) ---
const platform =
  process.env.RUNNER_ARCH ||
  process.arch;

console.log('🏃 Running benchmarks...');
console.log(`📱 Platform: ${platform}`);
console.log(`🧠 Node: ${process.version}\n`);

// --- run vitest ---
const result = spawnSync(
  'npx',
  ['vitest', 'bench', '--run', '--reporter=verbose'],
  {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe']
  }
);

const stdout = result.stdout || '';
const stderr = result.stderr || '';

stdout && process.stdout.write(stdout);
stderr && process.stderr.write(stderr);

// --- parse CLI (MOST STABLE) ---
const entries = [];

for (const line of stripAnsi(stdout).split('\n')) {
  const m = line.match(/^\s*·\s+(.+?)\s+([\d,]+(?:\.\d+)?)/);
  if (!m) continue;

  const name = m[1].trim();
  const hz = parseHz(m[2]);

  if (!name || !hz || !isFinite(hz)) continue;

  entries.push({
    name,
    unit: 'ops/sec',
    value: hz
  });
}

// --- SAFETY FALLBACK (NO FAIL HARD) ---
if (!entries.length) {
  console.warn('\n⚠️ No benchmark parsed. Writing empty array (CI safe)');
  fs.writeFileSync(OUT_FILE, JSON.stringify([], null, 2));
  process.exit(0);
}

// --- SAVE (IMPORTANT: ARRAY ONLY) ---
fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2));

// --- LOG ---
console.log('\n📊 Benchmark Summary:\n');
console.table(entries.map(e => ({
  Name: e.name,
  'Ops/sec': e.value.toLocaleString()
})));

console.log(`\n✅ ${entries.length} benchmarks saved → ${OUT_FILE}`);
