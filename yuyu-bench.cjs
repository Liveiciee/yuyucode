#!/usr/bin/env node
// ============================================================
// FILE: yuyu-bench.cjs
// ============================================================
// Benchmark regression detector v4
// ============================================================

'use strict';

const fs          = require('fs');
const path        = require('path');
const { spawnSync, execSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT         = process.cwd();
const YUYU_DIR     = path.join(ROOT, '.yuyu');
const HIST_FILE    = path.join(YUYU_DIR, 'bench-history.json');
const EXPORT_FILE  = path.join(YUYU_DIR, 'bench-export.json');
const THRESHOLD    = 1.5;
const MAX_RUNS     = 20;

const SAVE    = process.argv.includes('--save');
const RESET   = process.argv.includes('--reset');
const WATCH   = process.argv.includes('--watch');
const TREND   = process.argv.includes('--trend');
const EXPORT  = process.argv.includes('--export');
const COMPARE = process.argv.includes('--compare');
const CI_MODE = process.argv.includes('--ci');
const VERBOSE = process.argv.includes('--verbose');

const isArm64 = process.arch === 'arm64' || process.arch === 'arm';
const BENCH_TIMEOUT = isArm64 ? 180000 : 120000;

function stripAnsi(s) { return s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, ''); }

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

function parseScoresFromOutput(output) {
  const scores = {};
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Match pattern like: "· single call — jsx    842,101.17"
    const match = line.match(/·\s+(.+?)\s+([\d,]+\.?\d*)\s+/);
    if (match) {
      let name = match[1].trim();
      let value = parseFloat(match[2].replace(/,/g, ''));
      
      // Simplify name for tracking
      name = name.replace(/[\(\),]/g, '').replace(/\s+/g, '_').slice(0, 40);
      if (!isNaN(value) && value > 0) {
        if (!scores[name] || value < scores[name]) {
          scores[name] = value;
        }
      }
    }
  }
  
  return scores;
}

function runBench() {
  console.log('🏃 Running benchmarks...\n');

  const commit  = gitHash();
  console.log(`🔀 Commit: ${commit}`);
  console.log(`📱 Platform: ${isArm64 ? 'ARM64 (Snapdragon 680)' : 'x86_64'}\n`);

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

  const raw = result.stdout || '';
  if (!CI_MODE) process.stdout.write(raw);

  const scores = parseScoresFromOutput(stripAnsi(raw));
  const names = Object.keys(scores);
  
  if (names.length === 0) {
    console.log('\n⚠️  Could not parse bench scores, but benchmark ran successfully.');
    if (!CI_MODE) console.log('💡 This is normal if vitest bench output format changed.');
    return;
  }

  console.log(`\n📊 Parsed ${names.length} benchmarks`);

  // Load history
  const history = fs.existsSync(HIST_FILE) ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')) : {};
  const isFirst = Object.keys(history).length === 0;
  const ts = new Date().toISOString();
  
  let regressions = 0, improvements = 0;

  for (const name of names.sort()) {
    const cur = scores[name];
    const prev = history[name]?.baseline;
    
    if (!prev || isFirst) {
      if (!CI_MODE) console.log(`  ✨ NEW   ${name.padEnd(45)} score ${cur.toFixed(1)}`);
    } else {
      const ratio = cur / prev;
      if (ratio < 1 / THRESHOLD) {
        if (!CI_MODE) console.log(`  🔴 SLOW  ${name.padEnd(45)} ${cur.toFixed(1)} (${ratio.toFixed(2)}x — was ${prev.toFixed(1)})`);
        regressions++;
      } else if (ratio > THRESHOLD) {
        if (!CI_MODE) console.log(`  🟢 FAST  ${name.padEnd(45)} ${cur.toFixed(1)} (${ratio.toFixed(1)}x faster)`);
        improvements++;
      } else {
        if (!CI_MODE) console.log(`  ✅ OK    ${name.padEnd(45)} ${cur.toFixed(1)} (${ratio.toFixed(2)}x)`);
      }
    }
  }

  // Save history
  const newHistory = { ...history };
  for (const name of names) {
    const existing = newHistory[name] || { runs: [] };
    const run = {
      score: scores[name],
      ts,
      gitHash: commit,
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
  
  if (regressions > 0) {
    if (!CI_MODE) console.log(`\n⚠️  ${regressions} regression(s)! Update baseline: node yuyu-bench.cjs --save`);
    process.exitCode = 1;
  } else if (!isFirst && !CI_MODE) {
    console.log(`\n✅ No regressions.${improvements ? ` ${improvements} improvement(s) 🎉` : ' All stable.'}`);
  }
}

if (RESET) {
  if (fs.existsSync(HIST_FILE)) {
    fs.unlinkSync(HIST_FILE);
    console.log('🗑  Bench history cleared.');
  } else {
    console.log('ℹ  No history to reset.');
  }
  process.exit(0);
}

if (TREND) {
  const history = fs.existsSync(HIST_FILE) ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')) : {};
  if (Object.keys(history).length === 0) {
    console.log('ℹ  No history yet. Run bench dulu sekali.');
    process.exit(0);
  }
  console.log('\n📈 Score Trend (kiri = lama, kanan = terbaru)\n');
  for (const [name, data] of Object.entries(history).sort()) {
    const runs = data.runs || [];
    const scores = runs.map(r => r.score);
    const spark = scores.length >= 2 ? sparkline(scores) : '(belum cukup data)';
    const last = runs[runs.length - 1];
    const info = last ? `  score ${last.score.toFixed(1)}  ${last.gitHash || ''}` : '';
    console.log(`  ${name.padEnd(45)} ${spark}${info}`);
  }
  console.log('');
  process.exit(0);
}

if (!fs.existsSync(YUYU_DIR)) fs.mkdirSync(YUYU_DIR, { recursive: true });

runBench();
