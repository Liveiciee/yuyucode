import CONFIG from './config.js';
import { trimCommon, getSample } from './trim.js';
import { computeBlockSimilarity } from './rollingHash.js';
import { normalizeLine, isWeakAnchor, tokenize, getWeightedStructuralSignature, extractIdentifiers } from './tokenizer.js';
import { similarityScore } from './levenshtein.js';

export function findAnchors(aLines, bLines) {
  const freqA = new Map();
  const freqB = new Map();
  
  aLines.forEach((l, idx) => {
    if (isWeakAnchor(l)) return;
    const norm = normalizeLine(l);
    freqA.set(norm, (freqA.get(norm) || 0) + 1);
    freqA.set(`__idx_${norm}`, idx);
  });
  
  bLines.forEach((l, idx) => {
    if (isWeakAnchor(l)) return;
    const norm = normalizeLine(l);
    freqB.set(norm, (freqB.get(norm) || 0) + 1);
    freqB.set(`__idx_${norm}`, idx);
  });

  const candidates = [];
  const bIndex = new Map();

  bLines.forEach((line, idx) => {
    if (isWeakAnchor(line)) return;
    const norm = normalizeLine(line);
    if (!bIndex.has(norm)) bIndex.set(norm, []);
    bIndex.get(norm).push(idx);
  });

  for (let i = 0; i < aLines.length; i++) {
    const line = aLines[i];
    if (isWeakAnchor(line)) continue;
    
    const norm = normalizeLine(line);
    const freq = Math.max(freqA.get(norm) || 0, freqB.get(norm) || 0);
    
    if (freq > 0 && freq <= CONFIG.ANCHOR_FREQ_THRESHOLD) {
      const positions = bIndex.get(norm) || [];
      const limited = positions
        .map(j => ({ a: i, b: j, line, dist: Math.abs(i - j) }))
        .sort((x, y) => x.dist - y.dist)
        .slice(0, CONFIG.ANCHOR_MAX_MATCHES_PER_LINE);

      for (const m of limited) {
        candidates.push({ a: m.a, b: m.b, line });
      }
    }
  }

  candidates.sort((x, y) => x.a - y.a || x.b - y.b);

  const tailsIdx = [];
  const prev = new Array(candidates.length).fill(-1);
  
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    c.idx = i;
    
    let lo = 0, hi = tailsIdx.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (candidates[tailsIdx[mid]].b < c.b) lo = mid + 1;
      else hi = mid;
    }
    
    if (lo === tailsIdx.length) tailsIdx.push(i);
    else tailsIdx[lo] = i;

    if (lo > 0) prev[i] = tailsIdx[lo - 1];
  }

  const anchors = [];
  let currentIdx = tailsIdx[tailsIdx.length - 1];
  while (currentIdx !== undefined && currentIdx !== -1) {
    anchors.unshift(candidates[currentIdx]);
    currentIdx = prev[currentIdx];
  }
  return anchors;
}

export function analyzeChange(originalALines, originalBLines, deterministic = false) {
  const trimmed = trimCommon(originalALines, originalBLines);
  const aLines = trimmed.a;
  const bLines = trimmed.b;

  const maxLines = Math.max(originalALines.length, originalBLines.length);
  if (maxLines === 0) return { 
    similarity: 1, isChaos: false, limit: CONFIG.BASE_LIMIT, 
    confidence: 1, editDensity: 0, blockScore: 0, 
    prefixLen: 0, suffixLen: 0, isWhitespaceOnly: false,
    anchorDensity: 0, trimmedA: [], trimmedB: [],
    trimmedLines: 0, moves: [],
    _anchors: null,
    getAnchors: function() {
      if (this._anchors === null) {
        this._anchors = findAnchors(this.trimmedA, this.trimmedB);
      }
      return this._anchors;
    }
  };

  const aSample = deterministic ? aLines : getSample(aLines, CONFIG.SAMPLE_SIZE);
  const bSample = deterministic ? bLines : getSample(bLines, CONFIG.SAMPLE_SIZE);

  const aSet = new Set(aSample);
  const common = bSample.filter(l => aSet.has(l)).length;
  const membershipScore = common / Math.max(aSample.length, bSample.length);

  let orderMatches = 0;
  const minLen = Math.min(aSample.length, bSample.length);
  for (let i = 0; i < minLen; i++) {
    if (aSample[i] === bSample[i]) orderMatches++;
  }
  const orderScore = minLen ? orderMatches / minLen : 0;

  const blockAnalysis = computeBlockSimilarity(aLines, bLines);
  const blockScore = blockAnalysis.score;
  const moves = blockAnalysis.moves;

  const similarity = (membershipScore * 0.4) + (orderScore * 0.2) + (blockScore * 0.4);

  let whitespaceOnlyCount = 0;
  let totalChanges = 0;
  const sampleSize = Math.min(aLines.length, bLines.length);
  for (let i = 0; i < sampleSize; i++) {
    if (aLines[i] !== bLines[i]) {
      totalChanges++;
      if (aLines[i].trim() === bLines[i].trim() && aLines[i] !== bLines[i]) whitespaceOnlyCount++;
    }
  }
  const isWhitespaceOnly = totalChanges > 0 && (whitespaceOnlyCount / totalChanges) > 0.8;
  const editDensity = Math.max(0, 1 - similarity);
  const scale = Math.max(1, Math.log10(maxLines + 20));
  const adaptiveLimit = Math.floor((CONFIG.BASE_LIMIT * (1 + similarity * 1.5)) / scale);

  const trimmedLines = Math.max(aLines.length, bLines.length);

  return {
    similarity: Math.min(1, Math.max(0, similarity)),
    isChaos: similarity < CONFIG.MIN_SIMILARITY,
    totalLines: maxLines,
    limit: Math.max(40, adaptiveLimit),
    confidence: similarity,
    editDensity,
    blockScore,
    moves,
    prefixLen: trimmed.prefixLen,
    suffixLen: trimmed.suffixLen,
    isWhitespaceOnly,
    trimmedA: aLines,
    trimmedB: bLines,
    trimmedLines,
    _anchors: null,
    getAnchors: function() {
      if (this._anchors === null) {
        this._anchors = findAnchors(this.trimmedA, this.trimmedB);
      }
      return this._anchors;
    }
  };
}
