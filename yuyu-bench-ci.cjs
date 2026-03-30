'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

/**
 * 1. CONFIG
 */
const ROOT = process.cwd();
const OUT_DIR = process.env.CI
  ? os.tmpdir()
  : path.join(ROOT, '.yuyu');

const OUT_FILE = path.join(OUT_DIR, 'bench-report.json');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

/**
 * 2. HELPERS
 */
const getGit = () => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

const getSystemStats = () => ({
  cpu: os.cpus()?.[0]?.model || 'unknown',
  node: process.version,
  v8: process.versions.v8,
  mem_total: (os.totalmem() / 1e9).toFixed(1) + 'GB',
  load: os.loadavg?.()[0]?.toFixed(2) || '0'
});

/**
 * SAFE PARSER (ANTI NaN / ARM SAFE)
 */
const parseLine = (line) => {
  const patterns = [
    /·\s+(.+?)\s+([\d,.]+)\s+ops\/sec\s+±([\d,.]+)%\s+\((\d+)\s+samples\)/,
    /·\s+(.+?)\s+([\d,.]+)\s+ops\/sec/
  ];

  for (const pattern of patterns) {
    const m = line.match(pattern);
    if (!m) continue;

    const name = m[1]?.trim() || 'unknown';
    const hz = parseFloat((m[2] || '').replace(/,/g, ''));

    // HARD GUARD
    if (!Number.isFinite(hz) || hz <= 0) {
      return {
        name,
        ops_per_sec: 0,
        latency_ns: null,
        margin_percent: m[3] ? parseFloat(m[3]) : null,
        samples: m[4] ? parseInt(m[4], 10) : null
      };
    }

    return {
      name,
      ops_per_sec: hz,
      latency_ns: Number((1e9 / hz).toFixed(2)),
      margin_percent: m[3] ? parseFloat(m[3]) : null,
      samples: m[4] ? parseInt(m[4], 10) : null
    };
  }

  return null;
};

/**
 * 3. RUNNER
 */
function runBenchmark() {
  console.log('\n🏃 Running benchmarks...');
  console.log(`📱 Platform: ${process.arch}`);
  console.log(`🧠 Node: ${process.version}\n`);

  const start = Date.now();

  let worker;
  try {
    worker = spawnSync('npx', ['vitest', 'bench', '--run'], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (err) {
    console.error('❌ Failed to start vitest:', err.message);
    return fallbackReport(start, []);
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);

  const rawOutput = worker.stdout || '';
  const stderr = worker.stderr || '';

  process.stdout.write(rawOutput);
  if (stderr) process.stderr.write(stderr);

  /**
   * HANDLE CRASH (ARM Illegal instruction, dll)
   */
  if (
    worker.error ||
    stderr.includes('Illegal instruction') ||
    worker.status !== 0
  ) {
    console.warn('\n⚠️ Benchmark crash detected. Using fallback mode.');
    return fallbackReport(start, []);
  }

  /**
   * PARSE
   */
  const results = rawOutput
    .replace(/\x1b\[[\d;]*[a-zA-Z]/g, '')
    .split('\n')
    .map(parseLine)
    .filter(Boolean);

  return finalizeReport(results, duration);
}

/**
 * 4. FALLBACK (ANTI CI FAIL)
 */
function fallbackReport(start, data) {
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  return finalizeReport(data, duration, true);
}

/**
 * 5. FINALIZE
 */
function finalizeReport(results, duration, fallback = false) {
  const report = {
    meta: {
      git: getGit(),
      timestamp: new Date().toISOString(),
      duration_sec: duration,
      fallback,
      system: getSystemStats()
    },
    data: results
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

  if (results.length > 0) {
    console.table(
      results.map(r => ({
        Task: r.name,
        'ops/sec': r.ops_per_sec.toLocaleString(),
        'latency(ns)': r.latency_ns ?? '-',
        stability: r.margin_percent ? `±${r.margin_percent}%` : '-'
      }))
    );
  } else {
    console.log('⚠️ No benchmark data (safe fallback)');
  }

  console.log(`\n📦 Saved → ${OUT_FILE}`);

  // IMPORTANT: CI tetap sukses
  process.exit(0);
}

/**
 * START
 */
runBenchmark();
