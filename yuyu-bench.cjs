#!/usr/bin/env node
// yuyu-bench.cjs — Benchmark regression detector v3
//
// Usage:
//   node yuyu-bench.cjs                        # run + compare ke baseline
//   node yuyu-bench.cjs --save                 # force-update baseline
//   node yuyu-bench.cjs --reset                # hapus semua history
//   node yuyu-bench.cjs --watch                # re-run tiap ada perubahan di src/
//   node yuyu-bench.cjs --compare a.json b.json # compare dua baseline file
//   node yuyu-bench.cjs --trend                 # tampilkan sparkline history semua metric
//   node yuyu-bench.cjs --export                # export history ke bench-export.json
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Hilangkan ANSI escape codes */
const stripAnsi = s => s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');

/** Baca satu baris dari file /sys (Android sysfs), return null kalau gagal */
function readSys(filePath) {
  try { return fs.readFileSync(filePath, 'utf8').trim(); } catch { return null; }
}

/** ① Sparkline ASCII dari array angka */
function sparkline(values) {
  if (!values || values.length === 0) return '';
  const bars  = '▁▂▃▄▅▆▇█';
  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = max - min || 1;
  return values.map(v => bars[Math.round(((v - min) / range) * (bars.length - 1))]).join('');
}

/** ② Ambil git short hash; return 'no-git' kalau bukan repo */
function gitHash() {
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null', { cwd: ROOT, encoding: 'utf8' }).trim() || 'no-git';
  } catch { return 'no-git'; }
}

/** ⑤ Baca battery info dari Android sysfs (Termux-friendly) */
function batteryInfo() {
  // Path umum di Android kernel
  const base = '/sys/class/power_supply/battery';
  const pct  = parseInt(readSys(`${base}/capacity`))  || null;
  const stat = readSys(`${base}/status`);              // "Charging" | "Discharging" | "Full"
  // Beberapa kernel pakai /sys/class/power_supply/usb/present untuk detect charger
  const charging = stat ? (stat === 'Charging' || stat === 'Full') : null;
  return { pct, charging, status: stat };
}

/** ③ Parse rme per bench dari raw vitest output */
function parseRme(stripped) {
  const rmeMap = {};
  const rmeRe = /·\s+(.+?)\s+(?:\d[.,\d]*\s+){5,}±\s*([\d.]+)%/g;  // ← FIX
  let match;
  while ((match = rmeRe.exec(stripped)) !== null) {
    const name = match[1].trim();
    const rmeValue = parseFloat(match[2]);
    rmeMap[name] = rmeValue;
  }
  return rmeMap;
}

/** ⑧ Ambil heap usage dalam MB */
function heapMb() {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10;
}

/** Pad kanan dengan spasi */
const padR = (s, n) => String(s).slice(0, n).padEnd(n);

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
  const W = 40;
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
  console.log('🏃 Running benchmarks...\n');

  // ② git hash sebelum run
  const commit  = gitHash();

  // ⑤ Battery info
  const batt    = batteryInfo();
  if (batt.pct !== null) {
    const icon = batt.charging ? '🔌' : '🔋';
    console.log(`${icon} Battery: ${batt.pct}%${batt.charging ? ' (charging)' : ''}`);
    if (!batt.charging && batt.pct < 20) {
      console.log('⚠️  Battery rendah — performa mungkin dibatasi battery saver. Hasil mungkin tidak akurat.');
    }
  }
  console.log(`🔀 Commit: ${commit}\n`);

  // ⑧ Memory sebelum
  const memBefore = heapMb();

  const result = spawnSync(
    'npx', ['vitest', 'bench', '--run'],
    {
      cwd:      ROOT,
      encoding: 'utf8',
      timeout:  120_000,
      stdio:    ['inherit', 'pipe', 'inherit'],
      env:      { ...process.env, FORCE_COLOR: '1' },
    }
  );

  const raw      = result.stdout || '';
  process.stdout.write(raw);

  // ⑧ Memory sesudah
  const memAfter  = heapMb();
  const memDelta  = Math.round((memAfter - memBefore) * 10) / 10;

  const stripped  = stripAnsi(raw);

  // ③ Parse rme map
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
  console.log(`💾 Memory delta: ${memDelta >= 0 ? '+' : ''}${memDelta} MB (${memBefore} → ${memAfter} MB heap)\n`);

  // ③ Thermal warning per bench
  const thermalWarnings = [];
  for (const [name, rme] of Object.entries(rmeMap)) {
    if (rme > RME_THERMAL) thermalWarnings.push({ name, rme });
  }
  if (thermalWarnings.length > 0) {
    console.log('🌡  THERMAL WARNING — high variance detected (CPU mungkin throttle karena panas):');
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
  console.log('─'.repeat(W + 24));

  for (const name of names.sort()) {
    const cur      = scores[name];
    const prev     = history[name]?.baseline;
    const runs     = history[name]?.runs || [];
    const spark    = runs.length >= 2 ? `  ${sparkline(runs.map(r => r.score))}` : '';
    const fmtScore = s => `score ${s.toFixed(1)}`;

    if (!prev || isFirst) {
      console.log(`  ✨ NEW   ${padR(name, W)} ${fmtScore(cur)}${spark}`);
    } else {
      const ratio = cur / prev;
      if (ratio < 1 / THRESHOLD) {
        console.log(`  🔴 SLOW  ${padR(name, W)} ${fmtScore(cur)}  (${ratio.toFixed(2)}x — was ${fmtScore(prev)})${spark}`);
        regressions++;
      } else if (ratio > THRESHOLD) {
        console.log(`  🟢 FAST  ${padR(name, W)} ${fmtScore(cur)}  (${ratio.toFixed(1)}x faster)${spark}`);
        improvements++;
      } else {
        console.log(`  ✅ OK    ${padR(name, W)} ${fmtScore(cur)}  (${ratio.toFixed(2)}x)${spark}`);
      }
    }
  }
  console.log('─'.repeat(W + 24));

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
    };

    // Append ke runs array (max MAX_RUNS)
    const runs = [...(existing.runs || []), run].slice(-MAX_RUNS);

    if (SAVE || isFirst || !existing.baseline) {
      newHistory[name] = { baseline: scores[name], savedAt: ts, gitHash: commit, runs };
    } else {
      newHistory[name] = { ...existing, runs };
    }
  }
  fs.writeFileSync(HIST_FILE, JSON.stringify(newHistory, null, 2));

  if (SAVE || isFirst) console.log(`\n💾 ${names.length} baselines saved → .yuyu/bench-history.json`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('');
  if (regressions > 0) {
    console.log(`⚠️  ${regressions} regression(s)! Lihat 🔴 di atas.`);
    console.log('   Disengaja? Update baseline: node yuyu-bench.cjs --save');
    process.exitCode = 1;
  } else if (!isFirst) {
    console.log(`✅ No regressions.${improvements ? ` ${improvements} improvement(s) 🎉` : ' All stable.'}`);
  }
  console.log('💡 --save  update baseline  |  --reset  clear history  |  --trend  lihat grafik  |  --compare a.json b.json');
}

// ── ⑥ --watch mode ───────────────────────────────────────────────────────────
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
    }, 1000); // 1s debounce
  });

  // Keep alive
  process.stdin.resume();
} else {
  runBench();
}
