// ============================================================
// FILE: yuyu-bench.cjs
// ============================================================
// Benchmark regression detector v4
// ARM64 optimized, CI mode, trend graphs, memory profiling
// ============================================================

#!/usr/bin/env node
// yuyu-bench.cjs — Benchmark regression detector v4
//
// Usage:
//   node yuyu-bench.cjs                        # run + compare ke baseline
//   node yuyu-bench.cjs --save                 # force-update baseline
//   node yuyu-bench.cjs --reset                # hapus semua history
//   node yuyu-bench.cjs --watch                # re-run tiap ada perubahan di src/
//   node yuyu-bench.cjs --compare a.json b.json # compare dua baseline file
//   node yuyu-bench.cjs --trend                 # tampilkan sparkline history semua metric
//   node yuyu-bench.cjs --export                # export history ke bench-export.json
//   node yuyu-bench.cjs --ci                    # CI mode (exit code on regression, no color)
//
// Features:
//   ① Trend graph       — ASCII sparkline dari history tiap metric
//   ② Per-commit track  — simpan git hash bareng score
//   ③ Thermal detect    — warn kalau rme tinggi (CPU throttle karena panas)
//   ④ In-app /bench     — dipanggil via callServer exec dari useSlashCommands
//   ⑤ Battery-aware     — catat battery % + charging status, warn kalau saver mode
//   ⑥ Auto-watch        — --watch: re-run tiap file src/ berubah
//   ⑦ Baseline compare  — --compare: diff dua snapshot JSON
//   ⑧ Memory profiling  — rekam heapUsed sebelum+sesudah vitest
//   ⑨ CI mode           — --ci: suppress colors, exit code on regression
//   ⑩ ARM64 detection   — lebih banyak timeout untuk Snapdragon 680

'use strict';

const fs          = require('fs');
const path        = require('path');
const { spawnSync, execSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT         = process.cwd();
const YUYU_DIR     = path.join(ROOT, '.yuyu');
const HIST_FILE    = path.join(YUYU_DIR, 'bench-history.json');
const EXPORT_FILE  = path.join(YUYU_DIR, 'bench-export.json');
const THRESHOLD    = 1.5;   // ratio drop → regresi
const RME_THERMAL  = 5.0;   // % rme → possible thermal throttle
const MAX_RUNS     = 20;    // runs tersimpan per metric (untuk sparkline)

const SAVE    = process.argv.includes('--save');
const RESET   = process.argv.includes('--reset');
const WATCH   = process.argv.includes('--watch');
const TREND   = process.argv.includes('--trend');
const EXPORT  = process.argv.includes('--export');
const COMPARE = process.argv.includes('--compare');
const CI_MODE = process.argv.includes('--ci');
const VERBOSE = process.argv.includes('--verbose');

// ARM64 detection
const isArm64 = process.arch === 'arm64' || process.arch === 'arm';
const BENCH_TIMEOUT = isArm64 ? 180000 : 120000; // 3 minutes on ARM64

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripAnsi(s) { return s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, ''); }

function readSys(filePath) {
  try { return fs.readFileSync(filePath, 'utf8').trim(); } catch { return null; }
}

function sparkline(values) {
  if (!values || values.length === 0) return '';
  const bars  = '▁▂▃▄▅▆▇█';
  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = max - min || 1;
  return values.map(v => bars[Math.round(((v - min) / range) * (bars.length - 1))]).join('');
}

function gitHash() {
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null', { cwd: ROOT, encoding: 'utf8' }).trim() || 'no-git';
  } catch { return 'no-git'; }
}

function batteryInfo() {
  const base = '/sys/class/power_supply/battery';
  const pct  = parseInt(readSys(`${base}/capacity`))  || null;
  const stat = readSys(`${base}/status`);
  const charging = stat ? (stat === 'Charging' || stat === 'Full') : null;
  const temp = readSys(`${base}/temp`);
  const tempC = temp ? (parseInt(temp) / 1000).toFixed(1) : null;
  return { pct, charging, status: stat, tempC };
}

function parseRme(stripped) {
  const rmeMap = {};
  const rmeRe = /·\s+(.+?)\s+(?:\d[.,\d]*\s+){5,}±\s*([\d.]+)%/g;
  let match;
  while ((match = rmeRe.exec(stripped)) !== null) {
    const name = match[1].trim();
    const rmeValue = parseFloat(match[2]);
    rmeMap[name] = rmeValue;
  }
  return rmeMap;
}

function heapMb() {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10;
}

const padR = (s, n) => String(s).slice(0, n).padEnd(n);

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Handle --reset ────────────────────────────────────────────────────────────
if (RESET) {
  if (fs.existsSync(HIST_FILE)) {
    fs.unlinkSync(HIST_FILE);
    console.log('🗑  bench history cleared.');
  } else {
    console.log('ℹ  No history to reset.');
  }
  process.exit(0);
}

if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

// ── Handle --compare a.json b.json ───────────────────────────────────────────
if (COMPARE) {
  const [, , , fileA, fileB] = process.argv;
  if (!fileA || !fileB) {
    console.error('Usage: node yuyu-bench.cjs --compare <before.json> <after.json>');
    process.exit(1);
  }
  const A = JSON.parse(fs.readFileSync(fileA, 'utf8'));
  const B = JSON.parse(fs.readFileSync(fileB, 'utf8'));
  const allKeys = new Set([...Object.keys(A), ...Object.keys(B)]);
  const W = 48;
  console.log(`\n📊 Baseline Comparison: ${path.basename(fileA)} → ${path.basename(fileB)}\n`);
  console.log('─'.repeat(W + 30));
  let improved = 0, regressed = 0;
  for (const k of [...allKeys].sort()) {
    const sa = A[k]?.baseline ?? A[k]?.score ?? null;
    const sb = B[k]?.baseline ?? B[k]?.score ?? null;
    if (sa === null && sb !== null) {
      console.log(`  ✨ NEW     ${padR(k, W)}  score ${sb.toFixed(1)}`);
    } else if (sa !== null && sb === null) {
      console.log(`  🗑  REMOVED ${padR(k, W)}  was ${sa.toFixed(1)}`);
    } else if (sa !== null && sb !== null) {
      const ratio = sb / sa;
      const tag   = ratio >= THRESHOLD ? '🟢 FASTER' : ratio <= 1/THRESHOLD ? '🔴 SLOWER' : '  ✅ STABLE';
      console.log(`  ${tag} ${padR(k, W)}  ${sb.toFixed(1)}  (${ratio.toFixed(2)}x vs ${sa.toFixed(1)})`);
      if (ratio >= THRESHOLD) improved++;
      if (ratio <= 1/THRESHOLD) regressed++;
    }
  }
  console.log('─'.repeat(W + 30));
  console.log(`\n${improved} improved, ${regressed} regressed.\n`);
  process.exit(regressed > 0 ? 1 : 0);
}

// ── Handle --trend ────────────────────────────────────────────────────────────
if (TREND) {
  const history = fs.existsSync(HIST_FILE) ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')) : {};
  if (Object.keys(history).length === 0) {
    console.log('ℹ  No history yet. Run bench dulu sekali.');
    process.exit(0);
  }
  console.log('\n📈 Score Trend (tiap karakter = 1 run, kiri = lama, kanan = terbaru)\n');
  const W = 45;
  for (const [name, data] of Object.entries(history).sort(([a], [b]) => a.localeCompare(b))) {
    const runs   = data.runs || [];
    const scores = runs.map(r => r.score);
    const spark  = scores.length >= 2 ? sparkline(scores) : '(belum cukup data)';
    const last   = runs[runs.length - 1];
    const info   = last ? `  score ${last.score.toFixed(1)}  ${last.gitHash || ''}` : '';
    console.log(`  ${padR(name, W)} ${spark}${info}`);
  }
  console.log('');
  process.exit(0);
}

// ── Handle --export ───────────────────────────────────────────────────────────
if (EXPORT) {
  const history = fs.existsSync(HIST_FILE) ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')) : {};
  fs.writeFileSync(EXPORT_FILE, JSON.stringify(history, null, 2));
  console.log(`✅ Exported ke ${EXPORT_FILE}`);
  process.exit(0);
}

// ── Run bench (core) ──────────────────────────────────────────────────────────
function runBench() {
  const startTime = Date.now();
  console.log('🏃 Running benchmarks...\n');

  const commit  = gitHash();
  const batt    = batteryInfo();
  
  if (batt.pct !== null) {
    const icon = batt.charging ? '🔌' : '🔋';
    console.log(`${icon} Battery: ${batt.pct}%${batt.charging ? ' (charging)' : ''}${batt.tempC ? `  🌡️ ${batt.tempC}°C` : ''}`);
    if (!batt.charging && batt.pct < 20) {
      console.log('⚠️  Battery rendah — performa mungkin dibatasi battery saver. Hasil mungkin tidak akurat.');
    }
    if (batt.tempC && parseFloat(batt.tempC) > 45) {
      console.log('⚠️  Device hot — CPU mungkin throttle. Let it cool down for accurate results.');
    }
  }
  console.log(`🔀 Commit: ${commit}`);
  console.log(`📱 Platform: ${isArm64 ? 'ARM64 (Snapdragon 680)' : 'x86_64'}\n`);

  const memBefore = heapMb();

  const result = spawnSync(
    'npx', ['vitest', 'bench', '--run'],
    {
      cwd:      ROOT,
      encoding: 'utf8',
      timeout:  BENCH_TIMEOUT,
      stdio:    ['inherit', 'pipe', 'inherit'],
      env:      { ...process.env, FORCE_COLOR: CI_MODE ? '0' : '1' },
    }
  );

  const raw      = result.stdout || '';
  if (!CI_MODE) process.stdout.write(raw);

  const memAfter  = heapMb();
  const memDelta  = Math.round((memAfter - memBefore) * 10) / 10;
  const elapsed = Date.now() - startTime;

  const stripped  = stripAnsi(raw);
  const rmeMap   = parseRme(stripped);

  // ── Parse scores dari BENCH Summary ─────────────────────────────────────────
  const scores = {};
  const summaryStart = stripped.indexOf('BENCH  Summary');
  if (summaryStart === -1) {
    console.log('\n⚠  No BENCH Summary found in output.');
    return;
  }
  const summary = stripped.slice(summaryStart);
  const lines   = summary.split('\n');
  let   winner  = null;

  for (const line of lines) {
    const isRatio  = /^\s{4,}[\d.]+x faster than/.test(line);
    const isWinner = /^\s{2,3}\S/.test(line) && !isRatio && line.trim().length > 0;

    if (isWinner) {
      winner = line.trim().replace(/\s+-\s+\S+\.bench\.\w+\s*>\s*\S+.*$/, '').trim();
      if (!scores[winner]) scores[winner] = 0;
    }
    if (isRatio && winner) {
      const m = line.match(/([\d.]+)x faster than/);
      if (m) scores[winner] = (scores[winner] || 0) + parseFloat(m[1]);
    }
  }

  const names = Object.keys(scores).filter(n => scores[n] > 0);
  if (names.length === 0) {
    console.log('\n⚠  Could not parse bench summary.');
    return;
  }

  console.log(`\n📊 ${names.length} benches parsed from summary`);
  console.log(`⏱️  Duration: ${formatTime(elapsed)}  |  💾 Memory: ${memDelta >= 0 ? '+' : ''}${memDelta} MB (${memBefore} → ${memAfter} MB heap)`);

  // Thermal warning per bench
  const thermalWarnings = [];
  for (const [name, rme] of Object.entries(rmeMap)) {
    if (rme > RME_THERMAL) thermalWarnings.push({ name, rme });
  }
  if (thermalWarnings.length > 0 && !CI_MODE) {
    console.log('\n🌡️  THERMAL WARNING — high variance detected (CPU mungkin throttle karena panas):');
    for (const { name, rme } of thermalWarnings) {
      console.log(`     ±${rme.toFixed(2)}%  →  ${name}`);
    }
    console.log('   💡 Coba matikan charging, istirahat dulu 5 menit, lalu re-run.\n');
  }

  // ── Load history & compare ──────────────────────────────────────────────────
  const history = fs.existsSync(HIST_FILE) ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')) : {};
  const isFirst = Object.keys(history).length === 0;
  const ts      = new Date().toISOString();
  const W       = 52;

  let regressions = 0, improvements = 0;
  if (!CI_MODE) console.log('─'.repeat(W + 24));

  for (const name of names.sort()) {
    const cur      = scores[name];
    const prev     = history[name]?.baseline;
    const runs     = history[name]?.runs || [];
    const spark    = runs.length >= 2 ? `  ${sparkline(runs.map(r => r.score))}` : '';
    const fmtScore = s => `score ${s.toFixed(1)}`;

    if (!prev || isFirst) {
      if (!CI_MODE) console.log(`  ✨ NEW   ${padR(name, W)} ${fmtScore(cur)}${spark}`);
    } else {
      const ratio = cur / prev;
      if (ratio < 1 / THRESHOLD) {
        if (!CI_MODE) console.log(`  🔴 SLOW  ${padR(name, W)} ${fmtScore(cur)}  (${ratio.toFixed(2)}x — was ${fmtScore(prev)})${spark}`);
        regressions++;
      } else if (ratio > THRESHOLD) {
        if (!CI_MODE) console.log(`  🟢 FAST  ${padR(name, W)} ${fmtScore(cur)}  (${ratio.toFixed(1)}x faster)${spark}`);
        improvements++;
      } else {
        if (!CI_MODE) console.log(`  ✅ OK    ${padR(name, W)} ${fmtScore(cur)}  (${ratio.toFixed(2)}x)${spark}`);
      }
    }
  }
  if (!CI_MODE) console.log('─'.repeat(W + 24));

  // ── Save history ─────────────────────────────────────────────────────────────
  const newHistory = { ...history };
  for (const name of names) {
    const existing = newHistory[name] || { runs: [] };
    const run      = {
      score:   scores[name],
      ts,
      gitHash: commit,
      memMb:   memAfter,
      rme:     rmeMap[name] ?? null,
      battPct: batt.pct,
      charging: batt.charging,
      tempC: batt.tempC ? parseFloat(batt.tempC) : null,
      elapsedMs: elapsed,
    };

    const runs = [...(existing.runs || []), run].slice(-MAX_RUNS);

    if (SAVE || isFirst || !existing.baseline) {
      newHistory[name] = { baseline: scores[name], savedAt: ts, gitHash: commit, runs };
    } else {
      newHistory[name] = { ...existing, runs };
    }
  }
  fs.writeFileSync(HIST_FILE, JSON.stringify(newHistory, null, 2));

  if ((SAVE || isFirst) && !CI_MODE) console.log(`\n💾 ${names.length} baselines saved → .yuyu/bench-history.json`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  if (!CI_MODE) console.log('');
  if (regressions > 0) {
    if (!CI_MODE) console.log(`⚠️  ${regressions} regression(s)! Lihat 🔴 di atas.`);
    if (!CI_MODE) console.log('   Disengaja? Update baseline: node yuyu-bench.cjs --save');
    process.exitCode = 1;
  } else if (!isFirst && !CI_MODE) {
    console.log(`✅ No regressions.${improvements ? ` ${improvements} improvement(s) 🎉` : ' All stable.'}`);
  }
  if (!CI_MODE) console.log('💡 --save  update baseline  |  --reset  clear history  |  --trend  lihat grafik  |  --compare a.json b.json');
}

// ── --watch mode ─────────────────────────────────────────────────────────────
if (WATCH) {
  const SRC_DIR = path.join(ROOT, 'src');
  if (!fs.existsSync(SRC_DIR)) {
    console.error('❌ Folder src/ tidak ditemukan.');
    process.exit(1);
  }

  console.log(`👁  Watching ${SRC_DIR} — bench akan re-run tiap file berubah...\n`);
  runBench();

  let debounce = null;
  fs.watch(SRC_DIR, { recursive: true }, (event, filename) => {
    if (!filename || !/\.(js|jsx|ts|tsx)$/.test(filename)) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log(`\n🔄 File changed: ${filename} — re-running bench...\n`);
      runBench();
    }, 1000);
  });

  process.stdin.resume();
} else {
  runBench();
}
