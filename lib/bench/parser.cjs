// parser.cjs
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

module.exports = { parseScoresFromOutput, parseDetailedScores };
