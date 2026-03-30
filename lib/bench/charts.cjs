// charts.cjs
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

module.exports = { sparkline, boxChart };
