// stats.cjs
const { CI_CONFIDENCE } = require('./config.cjs');

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

module.exports = {
  mean,
  median,
  stddev,
  percentile,
  confidenceInterval,
  coefficientOfVariation,
  detectAnomalies,
  trendDirection,
  calculatePerfScore
};
