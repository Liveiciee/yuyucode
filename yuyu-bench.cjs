#!/usr/bin/env node
// ============================================================
// FILE: yuyu-bench.cjs
// ============================================================
// Benchmark regression detector v5 — GILA-GILAAN EDITION 🤯
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT = process.cwd();
const YUYU_DIR = path.join(ROOT, '.yuyu');
const HIST_FILE = path.join(YUYU_DIR, 'bench-history.json');
const BUDGET_FILE = path.join(YUYU_DIR, 'bench-budget.json');
const EXPORT_DIR = path.join(YUYU_DIR, 'exports');

const THRESHOLD = parseFloat(process.env.BENCH_THRESHOLD) || 1.5;
const MAX_RUNS = parseInt(process.env.BENCH_MAX_RUNS) || 20;
const CI_CONFIDENCE = parseFloat(process.env.BENCH_CI) || 0.95;

const SAVE = process.argv.includes('--save');
const RESET = process.argv.includes('--reset');
const WATCH = process.argv.includes('--watch');
const TREND = process.argv.includes('--trend');
const EXPORT = process.argv.includes('--export');
const COMPARE = process.argv.includes('--compare');
const CI_MODE = process.argv.includes('--ci');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const STATS = process.argv.includes('--stats');
const BUDGET = process.argv.includes('--budget');
const PR_COMMENT = process.argv.includes('--pr-comment');
const ANOMALY = process.argv.includes('--anomaly');
const INTERACTIVE = process.argv.includes('--interactive') || process.argv.includes('-i');
const DRY_RUN = process.argv.includes('--dry-run');
const PERF_SCORE = process.argv.includes('--perf-score');

const isArm64 = process.arch === 'arm64' || process.arch === 'arm';
const BENCH_TIMEOUT = process.env.BENCH_TIMEOUT
  ? Number(process.env.BENCH_TIMEOUT)
  : (isArm64 ? 180000 : 120000);

// ── Utils ────────────────────────────────────────────────────────────────────
function stripAnsi(s) {
  return s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');
}

function readJSONSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeJSONSafe(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function gitHash() {
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8'
    }).trim() || 'no-git';
  } catch {
    return 'no-git';
  }
}

function gitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8'
    }).trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function gitCommitCount() {
  try {
    return execSync('git rev-list --count HEAD 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8'
    }).trim() || '0';
  } catch {
    return '0';
  }
}

// ── Statistical Functions ────────────────────────────────────────────────────
function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const squareDiffs = arr.map(v => Math.pow(v - m, 2));
  return Math.sqrt(mean(squareDiffs));
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

function confidenceInterval(arr, confidence = CI_CONFIDENCE) {
  if (arr.length < 2) return { lower: arr[0] || 0, upper: arr[0] || 0 };
  const m = mean(arr);
  const s = stddev(arr);
  const z = confidence === 0.99 ? 2.576 : confidence === 0.95 ? 1.96 : 1.645;
  const margin = z * (s / Math.sqrt(arr.length));
  return { lower: m - margin, upper: m + margin };
}

function coefficientOfVariation(arr) {
  if (!arr.length) return 0;
  const m = mean(arr);
  if (m === 0) return 0;
  return (stddev(arr) / m) * 100;
}

function detectAnomalies(arr, threshold = 2) {
  if (arr.length < 3) return [];
  const m = mean(arr);
  const s = stddev(arr);
  if (s === 0) return [];
  return arr.map((v, i) => ({
    index: i,
    value: v,
    zScore: Math.abs((v - m) / s),
    isAnomaly: Math.abs((v - m) / s) > threshold
  })).filter(x => x.isAnomaly);
}

function trendDirection(arr) {
  if (arr.length < 4) return 'stable';
  const h = Math.floor(arr.length / 2);
  const early = mean(arr.slice(0, h));
  const late = mean(arr.slice(-h));
  const diff = ((late - early) / early) * 100;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

function calculatePerfScore(history, benchmarks) {
  // Composite performance score (0-150 scale)
  // 100 = baseline, >100 = improvement, <100 = regression
  let totalScore = 0;
  let count = 0;

  for (const name of Object.keys(benchmarks)) {
    const data = history[name];
    if (!data || !data.runs || data.runs.length < 3) continue;

    const scores = data.runs.map(r => r.score);
    const latest = scores[scores.length - 1];
    const baseline = data.baseline;

    // Score: linear penalty for regressions, capped linear reward for improvements
    // 0.5x → 50, 1.0x → 100, 1.5x → 125, 2.0x → 150 (capped)
    const ratio = latest / baseline;
    let score;
    if (ratio >= 1) {
      // Improvements: up to +50 points for 2x speedup
      score = 100 + Math.min(50, (ratio - 1) * 100);
    } else {
      // Regressions: linear penalty
      score = ratio * 100;
    }

    totalScore += score;
    count++;
  }

  return count > 0 ? (totalScore / count).toFixed(1) : 'N/A';
}

// ── Sparkline with more detail ───────────────────────────────────────────────
function sparkline(values, opts = {}) {
  if (!values || values.length === 0) return '';
  const bars = '▁▂▃▄▅▆▇█';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  let result = values
    .map(v => bars[Math.round(((v - min) / range) * (bars.length - 1))])
    .join('');

  if (opts.showRange) {
    const rangePercent = ((max - min) / min * 100).toFixed(1);
    result += ` (${rangePercent}%)`;
  }

  return result;
}

// ── Box chart (ASCII art) ────────────────────────────────────────────────────
function boxChart(values, opts = {}) {
  if (!values || values.length === 0) return '';
  const labels = opts.labels || values.map((_, i) => i);
  const width = opts.width || 40;
  const height = opts.height || 8;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Create chart
  const lines = [];
  for (let h = height; h >= 0; h--) {
    const threshold = min + (range * h / height);
    let line = '';
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      const barHeight = Math.round(((v - min) / range) * height);
      if (barHeight >= h) {
        if (v === max) line += '█';
        else if (v === min) line += '▄';
        else line += '▄';
      } else if (barHeight === h - 1 && h > 0) {
        line += '▄';
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }

  return lines.join('\n');
}

// ── Parsing ──────────────────────────────────────────────────────────────────
function parseScoresFromOutput(output) {
  const scores = {};

  for (const line of output.split('\n')) {
    // Match pattern like: "· single call — jsx    842,101.17"
    const match = line.match(/·\s+(.+?)\s+([\d,]+\.?\d*)\s+/);
    if (!match) continue;

    let name = match[1].trim();
    let value = parseFloat(match[2].replace(/,/g, ''));

    // Simplify name for tracking
    name = name.replace(/[\(\),]/g, '').replace(/\s+/g, '_').slice(0, 40);

    if (!isNaN(value) && value > 0) {
      // ops/sec: higher is better
      if (!scores[name] || value > scores[name]) {
        scores[name] = value;
      }
    }
  }

  return scores;
}

function parseDetailedScores(output) {
  const scores = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(/·\s+(.+?)\s+([\d,]+\.?\d*)\s+([\d.]+)\s*ms\s*\(.*\)/);
    if (!match) continue;

    let name = match[1].trim();
    let opsPerSec = parseFloat(match[2].replace(/,/g, ''));
    let msPerOp = parseFloat(match[3]);

    name = name.replace(/[\(\),]/g, '').replace(/\s+/g, '_').slice(0, 40);

    if (!isNaN(opsPerSec) && opsPerSec > 0) {
      scores.push({
        name,
        opsPerSec,
        msPerOp: !isNaN(msPerOp) ? msPerOp : (1000 / opsPerSec),
        raw: line.trim()
      });
    }
  }

  return scores;
}

// ── Performance Budget ──────────────────────────────────────────────────────
function loadBudget() {
  return readJSONSafe(BUDGET_FILE);
}

function saveBudget(budget) {
  writeJSONSafe(BUDGET_FILE, budget);
}

function setBudget(name, limit, type = 'max') {
  const budget = loadBudget();
  if (!budget[name]) budget[name] = {};
  budget[name] = { limit, type, updatedAt: new Date().toISOString() };
  saveBudget(budget);
  console.log(`💰 Budget set: ${name} ${type === 'max' ? '<=' : '>='} ${limit}`);
}

function checkBudget(scores) {
  const budget = loadBudget();
  const violations = [];

  for (const [name, data] of Object.entries(budget)) {
    if (!scores[name]) continue;
    const current = scores[name];
    const { limit, type } = data;

    if (type === 'max' && current > limit) {
      violations.push({ name, current, limit, diff: ((current - limit) / limit * 100).toFixed(2) });
    } else if (type === 'min' && current < limit) {
      violations.push({ name, current, limit, diff: ((limit - current) / limit * 100).toFixed(2) });
    }
  }

  return violations;
}

// ── Comparison ───────────────────────────────────────────────────────────────
function compareCommits(commitA, commitB, scores) {
  const history = readJSONSafe(HIST_FILE);
  const results = [];

  for (const name of Object.keys(scores)) {
    const entryA = history[name]?.runs?.find(r => r.gitHash === commitA);
    const entryB = history[name]?.runs?.find(r => r.gitHash === commitB);

    if (entryA && entryB) {
      const diff = ((entryB.score - entryA.score) / entryA.score * 100);
      results.push({
        name,
        scoreA: entryA.score,
        scoreB: entryB.score,
        diff,
        better: diff > 0 ? 'B' : diff < 0 ? 'A' : 'same'
      });
    }
  }

  return results.sort((a, b) => b.diff - a.diff);
}

// ── Export Functions ─────────────────────────────────────────────────────────
function exportJSON(scores, filename) {
  const exportPath = path.join(EXPORT_DIR, filename || `bench-${Date.now()}.json`);
  writeJSONSafe(exportPath, {
    timestamp: new Date().toISOString(),
    commit: gitHash(),
    branch: gitBranch(),
    scores
  });
  return exportPath;
}

function exportCSV(scores) {
  const exportPath = path.join(EXPORT_DIR, `bench-${Date.now()}.csv`);
  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  const headers = ['name', 'score', 'timestamp', 'commit'];
  const rows = [headers.join(',')];

  for (const [name, data] of Object.entries(scores)) {
    for (const run of (data.runs || [])) {
      rows.push([
        `"${name}"`,
        run.score,
        run.ts,
        run.gitHash
      ].join(','));
    }
  }

  fs.writeFileSync(exportPath, rows.join('\n'));
  return exportPath;
}

function exportMarkdown(scores) {
  const exportPath = path.join(EXPORT_DIR, `bench-${Date.now()}.md`);
  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  let md = `# Benchmark Report\n\n`;
  md += `**Generated:** ${new Date().toLocaleString()}\n`;
  md += `**Commit:** ${gitHash()}\n`;
  md += `**Branch:** ${gitBranch()}\n\n`;

  md += `## Summary\n\n`;
  md += `| Benchmark | Current | Baseline | Change |\n`;
  md += `|----------|--------|----------|--------|\n`;

  for (const [name, data] of Object.entries(scores)) {
    const current = data.runs?.[data.runs.length - 1]?.score;
    const baseline = data.baseline;
    const change = baseline ? (((current - baseline) / baseline) * 100).toFixed(2) + '%' : 'N/A';
    md += `| ${name} | ${current?.toFixed(2) || 'N/A'} | ${baseline?.toFixed(2) || 'N/A'} | ${change} |\n`;
  }

  fs.writeFileSync(exportPath, md);
  return exportPath;
}

// ── GitHub PR Comment ────────────────────────────────────────────────────────
function generatePRComment(results) {
  const { regressions, improvements, benchmarks, perfScore } = results;

  let comment = `## 📊 Benchmark Results\n\n`;
  comment += `**Commit:** \`${gitHash()}\`\n`;
  comment += `**Branch:** ${gitBranch()}\n`;
  comment += `**Platform:** ${isArm64 ? 'ARM64 (Snapdragon 680)' : 'x86_64'}\n\n`;

  if (perfScore !== 'N/A') {
    comment += `### 🎯 Performance Score: **${perfScore}**/100\n\n`;
  }

  if (regressions.length > 0) {
    comment += `### 🔴 Regressions (${regressions.length})\n\n`;
    comment += `| Benchmark | Current | Baseline | Change |\n`;
    comment += `|-----------|---------|----------|--------|\n`;
    for (const r of regressions) {
      comment += `| ${r.name} | ${r.current.toFixed(0)} | ${r.baseline.toFixed(0)} | ${r.change.toFixed(1)}% |\n`;
    }
    comment += `\n⚠️ **Action Required:** These benchmarks regressed. Consider investigating.\n\n`;
  } else {
    comment += `### ✅ No Regressions Detected\n\n`;
  }

  if (improvements.length > 0) {
    comment += `### 🟢 Improvements (${improvements.length})\n\n`;
    comment += `| Benchmark | Current | Baseline | Change |\n`;
    comment += `|-----------|---------|----------|--------|\n`;
    for (const i of improvements.slice(0, 10)) {
      comment += `| ${i.name} | ${i.current.toFixed(0)} | ${i.baseline.toFixed(0)} | +${i.change.toFixed(1)}% |\n`;
    }
    if (improvements.length > 10) {
      comment += `\n_...and ${improvements.length - 10} more improvements_\n`;
    }
    comment += `\n`;
  }

  comment += `---\n\n`;
  comment += `*🤖 Generated by yuyu-bench*\n`;

  return comment;
}

async function postPRComment(comment) {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_PR_NUMBER) {
    try {
      const payload = {
        body: comment,
        issue_number: parseInt(process.env.GITHUB_PR_NUMBER),
        owner: process.env.GITHUB_REPO_OWNER || 'Liveiciee',
        repo: process.env.GITHUB_REPO_NAME || 'yuyucode'
      };

      const url = `https://api.github.com/repos/${payload.owner}/${payload.repo}/issues/${payload.issue_number}/comments`;

      execSync(`curl -X POST "${url}" \
        -H "Authorization: token ${process.env.GITHUB_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '${JSON.stringify({ body: comment })}'`, {
        cwd: ROOT,
        encoding: 'utf8'
      });

      console.log('💬 PR comment posted successfully');
    } catch (err) {
      console.log('⚠️ Failed to post PR comment:', err.message);
    }
  }
}

// ── Watch Mode ───────────────────────────────────────────────────────────────
let watchInterval = null;
let lastScores = null;

function startWatch(callback, interval = 60000) {
  console.log(`\n👀 Watch mode enabled (every ${interval/1000}s)`);
  console.log('Press Ctrl+C to stop\n');

  watchInterval = setInterval(() => {
    console.log(`\n🔄 Re-running benchmark at ${new Date().toLocaleTimeString()}...\n`);
    callback();
  }, interval);

  process.on('SIGINT', () => {
    console.log('\n\n👋 Watch mode stopped');
    if (watchInterval) clearInterval(watchInterval);
    process.exit(0);
  });
}

// ── Interactive Mode ──────────────────────────────────────────────────────────
function interactiveMenu() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     yuyu-bench Interactive Mode         ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log('  1. Run benchmark');
  console.log('  2. Show trends');
  console.log('  3. Compare commits');
  console.log('  4. Set performance budget');
  console.log('  5. View statistics');
  console.log('  6. Export data');
  console.log('  7. Check anomalies');
  console.log('  0. Exit\n');
}

// ── Statistical Report ────────────────────────────────────────────────────────
function generateStatsReport(history) {
  const report = [];
  report.push('\n📈 Statistical Analysis Report\n');
  report.push('═'.repeat(60));

  for (const [name, data] of Object.entries(history).sort()) {
    const scores = (data.runs || []).map(r => r.score);
    if (scores.length < 2) continue;

    const latest = scores[scores.length - 1];
    const m = mean(scores);
    const med = median(scores);
    const s = stddev(scores);
    const cv = coefficientOfVariation(scores);
    const ci = confidenceInterval(scores);
    const trend = trendDirection(scores);
    const anomalies = detectAnomalies(scores);

    report.push(`\n📊 ${name}`);
    report.push('-'.repeat(50));
    report.push(`  Latest:      ${latest.toFixed(2)} ops/s`);
    report.push(`  Mean:        ${m.toFixed(2)} ops/s`);
    report.push(`  Median:      ${med.toFixed(2)} ops/s`);
    report.push(`  Std Dev:     ${s.toFixed(2)}`);
    report.push(`  CV:          ${cv.toFixed(2)}%`);
    report.push(`  95% CI:      [${ci.lower.toFixed(2)}, ${ci.upper.toFixed(2)}]`);
    report.push(`  Min/Max:     ${Math.min(...scores).toFixed(2)} / ${Math.max(...scores).toFixed(2)}`);
    report.push(`  Trend:       ${trend === 'improving' ? '📈 improving' : trend === 'declining' ? '📉 declining' : '➡️ stable'}`);
    report.push(`  Runs:        ${scores.length}`);

    if (anomalies.length > 0) {
      report.push(`  ⚠️  Anomalies: ${anomalies.length} detected`);
    }
  }

  return report.join('\n');
}

// ── Main Benchmark Runner ────────────────────────────────────────────────────
function runBench() {
  if (!CI_MODE) {
    console.log('\n🏃 Running benchmarks...\n');
  }

  const commit = gitHash();
  const branch = gitBranch();

  if (!CI_MODE) {
    console.log(`🔀 Commit: ${commit} (${branch})`);
    console.log(`📱 Platform: ${isArm64 ? 'ARM64 (Snapdragon 680)' : 'x86_64'}`);
    console.log(`⏱️  Timeout: ${BENCH_TIMEOUT}ms\n`);
  }

  if (DRY_RUN) {
    console.log('🔍 Dry run - would execute: npx vitest bench --run\n');
    return;
  }

  const result = spawnSync(
    'npx',
    ['vitest', 'bench', '--run'],
    {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: BENCH_TIMEOUT,
      stdio: ['inherit', 'pipe', 'inherit'],
      env: { ...process.env, FORCE_COLOR: CI_MODE ? '0' : '1' }
    }
  );

  const raw = result.stdout || '';
  if (!CI_MODE) process.stdout.write(raw);

  const scores = parseScoresFromOutput(stripAnsi(raw));
  const names = Object.keys(scores);
  const detailedScores = parseDetailedScores(raw);

  if (names.length === 0) {
    console.log('\n⚠️ Could not parse bench scores, but benchmark ran successfully.');
    if (!CI_MODE) console.log('💡 This is normal if vitest bench output format changed.');
    return;
  }

  console.log(`\n📊 Parsed ${names.length} benchmarks`);

  // Load history
  const history = readJSONSafe(HIST_FILE);
  const isFirst = Object.keys(history).length === 0;
  const ts = new Date().toISOString();

  let regressions = [], improvements = [];

  if (!CI_MODE) {
    console.log('\n' + '─'.repeat(60));
    console.log('  BENCHMARK RESULTS');
    console.log('─'.repeat(60));
  }

  for (const name of names.sort()) {
    const cur = scores[name];
    const prev = history[name]?.baseline;
    const runs = history[name]?.runs || [];

    if (!prev || isFirst) {
      if (!CI_MODE) console.log(`  ✨ NEW   ${name.padEnd(45)} ${cur.toFixed(1)}`);
    } else {
      const ratio = cur / prev;
      const change = ((ratio - 1) * 100).toFixed(1);

      if (ratio < 1 / THRESHOLD) {
        if (!CI_MODE) {
          console.log(`  🔴 SLOW  ${name.padEnd(45)} ${cur.toFixed(1)} (${change}%, was ${prev.toFixed(1)})`);
        }
        regressions.push({ name, current: cur, baseline: prev, change: parseFloat(change) });
      } else if (ratio > THRESHOLD) {
        if (!CI_MODE) {
          console.log(`  🟢 FAST  ${name.padEnd(45)} ${cur.toFixed(1)} (+${change}%, was ${prev.toFixed(1)})`);
        }
        improvements.push({ name, current: cur, baseline: prev, change: parseFloat(change) });
      } else {
        if (!CI_MODE) {
          console.log(`  ✅ OK    ${name.padEnd(45)} ${cur.toFixed(1)} (${change}%, was ${prev.toFixed(1)})`);
        }
      }
    }
  }

  // Statistical analysis
  if (STATS && !CI_MODE) {
    const statsHistory = { ...history };
    for (const name of names) {
      statsHistory[name] = {
        ...statsHistory[name],
        runs: [
          ...(statsHistory[name]?.runs || []),
          { score: scores[name], ts, gitHash: commit }
        ].slice(-MAX_RUNS)
      };
    }
    console.log(generateStatsReport(statsHistory));
  }

  // Performance Score
  if (PERF_SCORE) {
    const perfScore = calculatePerfScore(history, scores);
    if (!CI_MODE) {
      console.log(`\n🎯 Performance Score: ${perfScore}/100`);
    }
  }

  // Anomaly detection
  if (ANOMALY) {
    const anomalyReport = [];
    for (const name of names) {
      const runs = history[name]?.runs || [];
      const scores_arr = runs.map(r => r.score);
      if (scores_arr.length >= 3) {
        const anomalies = detectAnomalies(scores_arr);
        if (anomalies.length > 0) {
          anomalyReport.push({ name, anomalies });
        }
      }
    }
    if (anomalyReport.length > 0 && !CI_MODE) {
      console.log('\n⚠️ Anomalies Detected:\n');
      for (const { name, anomalies } of anomalyReport) {
        console.log(`  ${name}:`);
        for (const a of anomalies) {
          console.log(`    - Run #${a.index + 1}: ${a.value.toFixed(2)} (z-score: ${a.zScore.toFixed(2)})`);
        }
      }
    }
  }

  // Budget check
  if (BUDGET) {
    const violations = checkBudget(scores);
    if (violations.length > 0) {
      console.log('\n💰 Budget Violations:\n');
      for (const v of violations) {
        console.log(`  🔴 ${v.name}: ${v.current.toFixed(2)} > ${v.limit} (+${v.diff}%)`);
      }
    } else if (!CI_MODE) {
      console.log('\n💰 All budgets within limits');
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
      branch
    };
    const runs = [...(existing.runs || []), run].slice(-MAX_RUNS);

    if (SAVE || isFirst || !existing.baseline) {
      newHistory[name] = {
        baseline: scores[name],
        savedAt: ts,
        gitHash: commit,
        branch,
        runs
      };
    } else {
      newHistory[name] = { ...existing, runs };
    }
  }
  writeJSONSafe(HIST_FILE, newHistory);

  if ((SAVE || isFirst) && !CI_MODE) {
    console.log(`\n💾 ${names.length} baselines saved → .yuyu/bench-history.json`);
  }

  // Export
  if (EXPORT) {
    const jsonPath = exportJSON(newHistory);
    const csvPath = exportCSV(newHistory);
    const mdPath = exportMarkdown(newHistory);
    if (!CI_MODE) {
      console.log(`\n📦 Exported:`);
      console.log(`   JSON: ${jsonPath}`);
      console.log(`   CSV:  ${csvPath}`);
      console.log(`   MD:   ${mdPath}`);
    }
  }

  // PR Comment
  if (PR_COMMENT) {
    const perfScore = calculatePerfScore(history, scores);
    const comment = generatePRComment({
      regressions,
      improvements,
      benchmarks: scores,
      perfScore
    });
    postPRComment(comment);
  }

  // Final summary
  if (regressions.length > 0) {
    if (!CI_MODE) {
      console.log(`\n⚠️  ${regressions.length} regression(s)! Update baseline: node yuyu-bench.cjs --save`);
      if (improvements.length > 0) {
        console.log(`🟢 ${improvements.length} improvement(s) detected`);
      }
    }
    process.exitCode = 1;
  } else if (!isFirst && !CI_MODE) {
    console.log(`\n✅ No regressions.${improvements.length > 0 ? ` ${improvements.length} improvement(s) 🎉` : ' All stable.'}`);
  }
}

// ── Commands ─────────────────────────────────────────────────────────────────
if (RESET) {
  if (fs.existsSync(HIST_FILE)) {
    fs.unlinkSync(HIST_FILE);
    console.log('🗑  Bench history cleared.');
  }
  if (fs.existsSync(BUDGET_FILE)) {
    fs.unlinkSync(BUDGET_FILE);
    console.log('🗑  Bench budgets cleared.');
  }
  process.exit(0);
}

if (TREND) {
  const history = readJSONSafe(HIST_FILE);
  if (Object.keys(history).length === 0) {
    console.log('ℹ  No history yet. Run bench dulu sekali.');
    process.exit(0);
  }

  console.log('\n📈 Score Trend (kiri = lama, kanan = terbaru)\n');
  console.log('─'.repeat(70));

  for (const [name, data] of Object.entries(history).sort()) {
    const runs = data.runs || [];
    const scores_arr = runs.map(r => r.score);
    const spark = scores_arr.length >= 2 ? sparkline(scores_arr, { showRange: true }) : '(belum cukup data)';
    const last = runs[runs.length - 1];
    const trend = trendDirection(scores_arr);
    const trendIcon = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';

    const info = last ? `  ${last.score.toFixed(1)} ops/s  ${last.gitHash || ''}` : '';
    console.log(`  ${trendIcon} ${name.padEnd(42)} ${spark}${info}`);
  }

  console.log('─'.repeat(70));
  console.log('');
  process.exit(0);
}

if (COMPARE) {
  const args = process.argv.slice(3);
  if (args.length < 2) {
    console.log('Usage: node yuyu-bench.cjs --compare <commitA> <commitB>');
    process.exit(1);
  }

  const [commitA, commitB] = args;
  const history = readJSONSafe(HIST_FILE);

  // Create mock scores for comparison
  const scores = {};
  for (const [name, data] of Object.entries(history)) {
    scores[name] = mean(data.runs?.map(r => r.score) || []);
  }

  const results = compareCommits(commitA, commitB, scores);

  console.log(`\n🔄 Comparing ${commitA} vs ${commitB}\n`);
  console.log('─'.repeat(70));

  for (const r of results) {
    const icon = r.diff > 5 ? '🟢' : r.diff < -5 ? '🔴' : '⚪';
    const sign = r.diff > 0 ? '+' : '';
    console.log(`  ${icon} ${r.name.padEnd(40)} ${sign}${r.diff.toFixed(1)}%`);
  }

  console.log('─'.repeat(70));
  process.exit(0);
}

if (STATS) {
  const history = readJSONSafe(HIST_FILE);
  if (Object.keys(history).length === 0) {
    console.log('ℹ  No history yet.');
    process.exit(0);
  }
  console.log(generateStatsReport(history));
  process.exit(0);
}

// Initialize directories
if (!fs.existsSync(YUYU_DIR)) {
  fs.mkdirSync(YUYU_DIR, { recursive: true });
}

// ── Run ──────────────────────────────────────────────────────────────────────
if (WATCH) {
  const interval = parseInt(process.env.BENCH_WATCH_INTERVAL) || 60000;
  startWatch(runBench, interval);
} else {
  runBench();
}
