// history.cjs
const fs = require('fs');
const path = require('path');
const { readJSONSafe, writeJSONSafe, gitHash, gitBranch } = require('./utils.cjs');
const { HIST_FILE, EXPORT_DIR, flags, ROOT, isArm64, THRESHOLD } = require('./config.cjs');
const { parseScoresFromOutput, parseDetailedScores } = require('./parser.cjs');
const { mean } = require('./stats.cjs');
const { spawnSync } = require('child_process');

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

function generateStatsReport(history) {
  const { mean, median, stddev, coefficientOfVariation, confidenceInterval, trendDirection, detectAnomalies } = require('./stats.cjs');
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

module.exports = {
  compareCommits,
  exportJSON,
  exportCSV,
  exportMarkdown,
  generateStatsReport
};
