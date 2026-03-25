'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const ROOT     = process.cwd();
const YUYU_DIR = path.join(ROOT, '.yuyu');
const OUT_FILE = process.env.BENCH_OUTPUT || path.join(YUYU_DIR, 'bench-ci.json');
const METADATA_FILE = path.join(YUYU_DIR, 'bench-metadata.json');

const isArm64 = process.arch === 'arm64' || process.arch === 'arm';
const TIMEOUT = isArm64 ? 240_000 : 180_000;

if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

console.log('🏃 Running CI benchmarks...');
console.log(`📱 Platform: ${isArm64 ? 'ARM64' : 'x86_64'}`);
console.log(`⏱️  Timeout: ${TIMEOUT / 1000}s\n`);

let gitCommit = 'unknown', gitBranch = 'unknown';
try {
  gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch (_) {}

const startTime = Date.now();
const startMem = process.memoryUsage().rss;

const result = spawnSync(
  'npx', ['vitest', 'bench', '--run', '--reporter=verbose'],
  { cwd: ROOT, encoding: 'utf8', timeout: TIMEOUT, stdio: ['inherit', 'pipe', 'pipe'] }
);

const elapsed = Date.now() - startTime;
const memUsed = Math.round((process.memoryUsage().rss - startMem) / 1024 / 1024);

const raw = result.stdout || '';
const stripped = raw.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');

process.stdout.write(raw);
if (result.stderr) process.stderr.write(result.stderr);

// ── PARSER BARU (sudah di-update untuk output Vitest terbaru) ───────────────
const entries = [];

const patterns = [
  /^\s*·\s+(.+?)\s+([\d,]+(?:\.\d+)?)/,           // format baru dengan koma
  /^\s*·\s+(.+?)\s+([\d.]+)\s+ops\/sec/,         // format lama
];

for (const line of stripped.split('\n')) {
  for (const pattern of patterns) {
    const m = line.match(pattern);
    if (m) {
      let name = m[1].trim();
      let value = parseFloat(m[2].replace(/,/g, ''));

      if (name && value > 0 && !name.includes('BENCH') && !name.includes('Summary') && !entries.some(e => e.name === name)) {
        entries.push({ name, unit: 'ops/sec', value });
        break;
      }
    }
  }
}

if (entries.length === 0) {
  console.error('\n❌ Masih gagal parse benchmark. Cek output di atas.');
  fs.writeFileSync(OUT_FILE, JSON.stringify([], null, 2));
  process.exit(1);
}

const metadata = {
  timestamp: new Date().toISOString(),
  gitCommit,
  gitBranch,
  platform: isArm64 ? 'arm64' : 'x86_64',
  durationMs: elapsed,
  memoryMb: memUsed,
  entriesCount: entries.length,
};

fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2));

console.log(`\n✅ ${entries.length} benchmarks saved → ${OUT_FILE}`);
