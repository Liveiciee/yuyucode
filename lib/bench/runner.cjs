// runner.cjs
const { spawnSync } = require('child_process');
const fs = require('fs');
const { ROOT, YUYU_DIR, BENCH_TIMEOUT, THRESHOLD, MAX_RUNS, flags, isArm64 } = require('./config.cjs');
const { stripAnsi, readJSONSafe, writeJSONSafe, gitHash, gitBranch } = require('./utils.cjs');
const { parseScoresFromOutput, parseDetailedScores } = require('./parser.cjs');
const { calculatePerfScore, detectAnomalies, trendDirection, mean } = require('./stats.cjs');
const { sparkline } = require('./charts.cjs');
const { checkBudget } = require('./budget.cjs');
const { exportJSON, exportCSV, exportMarkdown, generateStatsReport } = require('./history.cjs');
const { generatePRComment, postPRComment } = require('./pr.cjs');

function runBench() {
  const commit = gitHash();
  const branch = gitBranch();
  const isFirstRun = !fs.existsSync(YUYU_DIR);

  if (!flags.CI_MODE) {
    console.log('\n🏃 Running benchmarks...\n');
    console.log(`🔀 Commit: ${commit} (${branch})`);
    console.log(`📱 Platform: ${isArm64 ? 'ARM64 (Snapdragon 680)' : 'x86_64'}`);
    console.log(`⏱️  Timeout: ${BENCH_TIMEOUT}ms\n`);
  }

  if (flags.DRY_RUN) {
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
      env: { ...process.env, FORCE_COLOR: flags.CI_MODE ? '0' : '1' }
    }
  );

  const raw = result.stdout || '';
  if (!flags.CI_MODE) process.stdout.write(raw);

  const scores = parseScoresFromOutput(stripAnsi(raw));
  const names = Object.keys(scores);
  const detailedScores = parseDetailedScores(raw);

  if (names.length === 0) {
    console.log('\n⚠️ Could not parse bench scores, but benchmark ran successfully.');
    if (!flags.CI_MODE) console.log('💡 This is normal if vitest bench output format changed.');
    return;
  }

  console.log(`\n📊 Parsed ${names.length} benchmarks`);

  // Load history
  const history = readJSONSafe(HIST_FILE);
  const isFirst = Object.keys(history).length === 0;
  const ts = new Date().toISOString();

  let regressions = [], improvements = [];

  if (!flags.CI_MODE) {
    console.log('\n' + '─'.repeat(60));
    console.log('  BENCHMARK RESULTS');
    console.log('─'.repeat(60));
  }

  for (const name of names.sort()) {
    const cur = scores[name];
    const prev = history[name]?.baseline;
    const runs = history[name]?.runs || [];

    if (!prev || isFirst) {
      if (!flags.CI_MODE) console.log(`  ✨ NEW   ${name.padEnd(45)} ${cur.toFixed(1)}`);
    } else {
      const ratio = cur / prev;
      const change = ((ratio - 1) * 100).toFixed(1);

      if (ratio < 1 / THRESHOLD) {
        if (!flags.CI_MODE) {
          console.log(`  🔴 SLOW  ${name.padEnd(45)} ${cur.toFixed(1)} (${change}%, was ${prev.toFixed(1)})`);
        }
        regressions.push({ name, current: cur, baseline: prev, change: parseFloat(change) });
      } else if (ratio > THRESHOLD) {
        if (!flags.CI_MODE) {
          console.log(`  🟢 FAST  ${name.padEnd(45)} ${cur.toFixed(1)} (+${change}%, was ${prev.toFixed(1)})`);
        }
        improvements.push({ name, current: cur, baseline: prev, change: parseFloat(change) });
      } else {
        if (!flags.CI_MODE) {
          console.log(`  ✅ OK    ${name.padEnd(45)} ${cur.toFixed(1)} (${change}%, was ${prev.toFixed(1)})`);
        }
      }
    }
  }

  // Statistical analysis
  if (flags.STATS && !flags.CI_MODE) {
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
  if (flags.PERF_SCORE) {
    const perfScore = calculatePerfScore(history, scores);
    if (!flags.CI_MODE) {
      console.log(`\n🎯 Performance Score: ${perfScore}/100`);
    }
  }

  // Anomaly detection
  if (flags.ANOMALY) {
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
    if (anomalyReport.length > 0 && !flags.CI_MODE) {
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
  if (flags.BUDGET) {
    const violations = checkBudget(scores);
    if (violations.length > 0) {
      console.log('\n💰 Budget Violations:\n');
      for (const v of violations) {
        console.log(`  🔴 ${v.name}: ${v.current.toFixed(2)} > ${v.limit} (+${v.diff}%)`);
      }
    } else if (!flags.CI_MODE) {
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

    if (flags.SAVE || isFirst || !existing.baseline) {
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

  if ((flags.SAVE || isFirst) && !flags.CI_MODE) {
    console.log(`\n💾 ${names.length} baselines saved → .yuyu/bench-history.json`);
  }

  // Export
  if (flags.EXPORT) {
    const jsonPath = exportJSON(newHistory);
    const csvPath = exportCSV(newHistory);
    const mdPath = exportMarkdown(newHistory);
    if (!flags.CI_MODE) {
      console.log(`\n📦 Exported:`);
      console.log(`   JSON: ${jsonPath}`);
      console.log(`   CSV:  ${csvPath}`);
      console.log(`   MD:   ${mdPath}`);
    }
  }

  // PR Comment
  if (flags.PR_COMMENT) {
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
    if (!flags.CI_MODE) {
      console.log(`\n⚠️  ${regressions.length} regression(s)! Update baseline: node yuyu-bench.cjs --save`);
      if (improvements.length > 0) {
        console.log(`🟢 ${improvements.length} improvement(s) detected`);
      }
    }
    process.exitCode = 1;
  } else if (!isFirst && !flags.CI_MODE) {
    console.log(`\n✅ No regressions.${improvements.length > 0 ? ` ${improvements.length} improvement(s) 🎉` : ' All stable.'}`);
  }
}

module.exports = { runBench };
