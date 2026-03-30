import CONFIG from './config.js';

export function boundedLevenshtein(s1, s2, maxDist = CONFIG.TOKEN_LEVENSHTEIN_MAX) {
  if (Math.abs(s1.length - s2.length) > maxDist) return maxDist + 1;
  if (s1 === s2) return 0;
  
  const m = s1.length, n = s2.length;
  let prev = Array(n + 1).fill(0);
  let curr = Array(n + 1).fill(0);
  
  for (let j = 0; j <= n; j++) prev[j] = j;
  
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let minInRow = i;
    
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      minInRow = Math.min(minInRow, curr[j]);
    }
    
    if (minInRow > maxDist) return maxDist + 1;
    [prev, curr] = [curr, prev];
  }
  
  return prev[n] > maxDist ? maxDist + 1 : prev[n];
}

export function similarityScore(s1, s2) {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = boundedLevenshtein(s1, s2);
  return 1 - (dist / maxLen);
}
