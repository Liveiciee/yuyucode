#!/usr/bin/env node
// yuyu-bench-ci.cjs — CI benchmark runner v2
// Runs vitest bench dan output JSON untuk github-action-benchmark
// Output: .yuyu/bench-ci.json
//
// Format yang diharapkan github-action-benchmark (custom tool):
//   [ { "name": "getLangExt", "unit": "ops/sec", "value": 981449 }, ... ]
//
// Features:
//   - ARM64 detection (longer timeout)
//   - Fallback parser jika format berubah
//   - Memory usage tracking
//   - Git commit info for tracking
//   - Metadata for dashboard

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const ROOT     = process.cwd();
const YUYU_DIR = path.join(ROOT, '.yuyu');
const OUT_FILE = process.env.BENCH_OUTPUT || path.join(YUYU_DIR, 'bench-ci.json');
const METADATA_FILE = path.join(YUYU_DIR, 'bench-metadata.json');

// ARM64 detection
const isArm64 = process.arch === 'arm64' || process.arch === 'arm';
const TIMEOUT = isArm64 ? 240_000 : 180_000; // 4 mins on ARM64, 3 mins otherwise

if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

console.log('🏃 Running CI benchmarks...');
console.log(`📱 Platform: ${isArm64 ? 'ARM64 (Snapdragon 680)' : 'x86_64'}`);
console.log(`⏱️  Timeout: ${TIMEOUT / 1000}s\n`);

// Get git commit info
let gitCommit = 'unknown';
let gitBranch = 'unknown';
try {
  gitCommit = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch (_e) {}

const startTime = Date.now();
const startMem = process.memoryUsage().rss;

const result = spawnSync(
  'npx', ['vitest', 'bench', '--run', '--reporter=verbose'],
  { cwd: ROOT, encoding: 'utf8', timeout: TIMEOUT, stdio: ['inherit', 'pipe', 'pipe'] }
);

const elapsed = Date.now() - startTime;
const endMem = process.memoryUsage().rss;
const memUsed = Math.round((endMem - startMem) / 1024 / 1024);

const raw      = result.stdout || '';
const stripped = raw.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');

process.stdout.write(raw);
if (result.stderr) process.stderr.write(result.stderr);

// ── Parse vitest bench output ────────────────────────────────────────────────
// Format 1 (standard):
//   · getLangExt 951,771.76 ops/sec ±0.36% (475886 samples)
// Format 2 (slow tests):
//   · large diff (500 lines, many changes) 4.24 ops/sec ±1.49% (10 samples)
const entries = [];

// Multiple patterns to handle different output formats
const patterns = [
  // Standard pattern: name + value + ops/sec
  /^\s*·\s+(.+?)\s+([\d,]+(?:\.\d+)?)\s+ops\/sec/,
  // Pattern with slow tests (value < 10)
  /^\s*·\s+(.+?)\s+([\d.]+)\s+ops\/sec/,
  // Pattern with no space after dot
  /^\s*·\s+(.+?)\s{2,}([\d,]+\.\d+)/,
];

for (const line of stripped.split('\n')) {
  for (const pattern of patterns) {
    const m = line.match(pattern);
    if (m) {
      const name = m[1].trim();
      let value = parseFloat(m[2].replace(/,/g, ''));
      
      // Handle very slow operations (<1 ops/sec) — they show as ms
      if (value === 0 && line.includes('ms')) {
        const msMatch = line.match(/([\d.]+)\s*ms/);
        if (msMatch) {
          value = 1000 / parseFloat(msMatch[1]);
        }
      }
      
      if (name && value > 0 && !entries.some(e => e.name === name)) {
        entries.push({ name, unit: 'ops/sec', value });
        break;
      }
    }
  }
}

// ── Fallback: parse BENCH Summary section ────────────────────────────────────
if (entries.length === 0) {
  console.log('\n⚠️  Standard parser failed, trying BENCH Summary fallback...');
  
  const summaryStart = stripped.indexOf('BENCH  Summary');
  if (summaryStart !== -1) {
    const summary = stripped.slice(summaryStart);
    const lines = summary.split('\n');
    let currentName = null;
    
    for (const line of lines) {
      // Winner line (e.g., "  getLangExt")
      if (/^\s{2,3}\S/.test(line) && !line.includes('x faster')) {
        currentName = line.trim();
      }
      // Ratio line (e.g., "    2.34x faster than ...")
      if (currentName && line.includes('x faster')) {
        const ratioMatch = line.match(/([\d.]+)x faster/);
        if (ratioMatch) {
          const ratio = parseFloat(ratioMatch[1]);
          // This is relative, not absolute — skip for CI
          currentName = null;
        }
      }
    }
  }
}

// ── Save metadata for dashboard ──────────────────────────────────────────────
const metadata = {
  timestamp: new Date().toISOString(),
  gitCommit,
  gitBranch,
  platform: isArm64 ? 'arm64' : 'x86_64',
  durationMs: elapsed,
  memoryMb: memUsed,
  exitCode: result.status ?? 1,
  entriesCount: entries.length,
};

fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));

// ── Output results ───────────────────────────────────────────────────────────
if (entries.length === 0) {
  console.error('\n❌ Tidak ada bench hasil yang bisa di-parse. Cek output di atas.');
  console.error('   Output file akan tetap dibuat dengan metadata saja.');
  fs.writeFileSync(OUT_FILE, JSON.stringify([], null, 2));
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2));

console.log(`\n✅ ${entries.length} bench results → ${OUT_FILE}`);
console.log(`   📊 Metadata → ${METADATA_FILE}`);
console.log(`   ⏱️  Duration: ${(elapsed / 1000).toFixed(1)}s`);
console.log(`   💾 Memory: ${memUsed}MB`);
console.log(`   🔀 Commit: ${gitCommit} (${gitBranch})`);
console.log('');

// Print summary table
console.log('📈 Results:');
console.log('─'.repeat(70));
entries.forEach(e => {
  const val = e.value >= 1000 
    ? e.value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : e.value.toFixed(2);
  console.log(`   ${e.name.padEnd(48)} ${val.padStart(12)} ${e.unit}`);
});
console.log('─'.repeat(70));

// Exit with non-zero if no entries
if (entries.length === 0) process.exit(1);
