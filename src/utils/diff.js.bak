// src/utils/diff.js
import { diffLines } from 'diff';

const CONFIG = {
  MIN_SIMILARITY: 0.25,
  MYERS_LIMIT: 1500,
  BASE_LIMIT: 120,
  MAX_EDIT_RATIO: 1.3,
  SAMPLE_SIZE: 120,
  MAX_OPS: 400000,
  BLOCK_SIZE: 5,
  ANCHOR_FREQ_THRESHOLD: 3,
  ANCHOR_MAX_MATCHES_PER_LINE: 2,
  RECENT_WINDOW: 40,
  STOPWORDS: new Set(['the', 'a', 'an', 'to', 'of', 'in', 'for', 'and', 'or', 'is', 'it', 'if', 'else', 'return', 'const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'async', 'await']),
  HASH_MOD: 2147483647,
  BASE1: 31,
  BASE2: 37,
  ANCHOR_DENSITY_LOW: 0.01,
  ANCHOR_DENSITY_HIGH: 0.3,
  MIN_LINES_FOR_DENSITY: 50,
  REPLACE_SIMILARITY_THRESHOLD: 0.6,
  REORDER_PENALTY_FACTOR: 0.5,
  HEURISTIC_HEAD_LINES: 6,
  HEURISTIC_TAIL_LINES: 6,
  TOKEN_LEVENSHTEIN_MAX: 100,
  IDENTIFIER_MAP_THRESHOLD: 0.8,
  MOVE_BLOCK_MIN_LINES: 3,
  TOKEN_WEIGHTS: {
    keyword: 2.0,
    punct: 1.8,
    operator: 1.5,
    identifier: 1.0,
    string: 1.0,
    number: 1.0,
    other: 0.8
  }
};

function boundedLevenshtein(s1, s2, maxDist = CONFIG.TOKEN_LEVENSHTEIN_MAX) {
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

function similarityScore(s1, s2) {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = boundedLevenshtein(s1, s2);
  return 1 - (dist / maxLen);
}

function tokenize(line) {
  const tokens = [];
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    if (char === '`' || char === '"' || char === "'") {
      const quote = char;
      let j = i + 1;
      let escaped = false;
      
      while (j < line.length) {
        if (escaped) {
          escaped = false;
          j++;
        } else if (line[j] === '\\') {
          escaped = true;
          j++;
        } else if (line[j] === quote) {
          j++;
          break;
        } else if (quote === '`' && line[j] === '$' && line[j + 1] === '{') {
          break;
        } else {
          j++;
        }
      }
      
      const value = line.slice(i, j);
      tokens.push({ value, type: 'string' });
      i = j;
      continue;
    }
    
    if (/\d/.test(char) || (char === '.' && /\d/.test(line[i + 1]))) {
      const numRegex = /^\d[\d.eE+xX]*$/;
      let j = i;
      while (j < line.length && numRegex.test(line.slice(i, j + 1))) j++;
      tokens.push({ value: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }
    
    if (/[a-zA-Z_$]/.test(char)) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const value = line.slice(i, j);
      const type = CONFIG.STOPWORDS.has(value) ? 'keyword' : 'identifier';
      tokens.push({ value, type });
      i = j;
      continue;
    }
    
    const ops = ['===', '!==', '==', '!=', '<=', '>=', '=>', '**', '++', '--', '&&', '||', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^='];
    let foundOp = false;
    for (const op of ops) {
      if (line.slice(i, i + op.length) === op) {
        tokens.push({ value: op, type: 'operator' });
        i += op.length;
        foundOp = true;
        break;
      }
    }
    if (foundOp) continue;
    
    if (/[+\-*/%=<>!&|^~?:]/.test(char)) {
      tokens.push({ value: char, type: 'operator' });
      i++;
      continue;
    }
    
    if (/[{}()\[\];,]/.test(char)) {
      tokens.push({ value: char, type: 'punct' });
      i++;
      continue;
    }
    
    tokens.push({ value: char, type: 'other' });
    i++;
  }
  
  return tokens;
}

function getWeightedStructuralSignature(tokens) {
  const parts = [];
  let totalWeight = 0;
  
  for (const t of tokens) {
    const weight = CONFIG.TOKEN_WEIGHTS[t.type] || 1;
    totalWeight += weight;
    
    if (t.type === 'identifier') parts.push('$ID');
    else if (t.type === 'string') parts.push('$STR');
    else if (t.type === 'number') parts.push('$NUM');
    else parts.push(t.value);
  }
  
  return { signature: parts.join(' '), weight: totalWeight };
}

function extractIdentifiers(tokens) {
  return tokens.filter(t => t.type === 'identifier').map(t => t.value);
}

function rollingHash(lines, blockSize) {
  const MOD = CONFIG.HASH_MOD;
  const B1 = CONFIG.BASE1;
  const B2 = CONFIG.BASE2;
  const blocks = new Map();
  
  if (lines.length < blockSize) return blocks;

  let hash1 = 0, hash2 = 0;
  let pow1 = 1, pow2 = 1;

  for (let i = 0; i < blockSize - 1; i++) {
    pow1 = (pow1 * B1) % MOD;
    pow2 = (pow2 * B2) % MOD;
  }

  const lineData = lines.map(l => {
    const tokens = tokenize(l);
    const { signature, weight } = getWeightedStructuralSignature(tokens);
    return {
      raw: l,
      tokens,
      structural: signature,
      weight,
      identifiers: extractIdentifiers(tokens)
    };
  });

  const hashString = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = (h * 33) ^ s.charCodeAt(i);
    }
    return h >>> 0;
  };

  const blockFingerprint = (startIdx) => {
    const first = lineData[startIdx];
    const last = lineData[startIdx + blockSize - 1];
    return {
      startStruct: first.structural,
      totalWeight: first.weight + last.weight,
      identifiers: lineData.slice(startIdx, startIdx + blockSize).flatMap(d => d.identifiers)
    };
  };

  for (let i = 0; i < blockSize; i++) {
    const h = hashString(lineData[i].structural);
    hash1 = (hash1 * B1 + h) % MOD;
    hash2 = (hash2 * B2 + ((h >> 16) ^ (h & 0xFFFF))) % MOD;
  }
  
  const fp0 = blockFingerprint(0);
  blocks.set(`${hash1}:${hash2}`, {
    startIdx: 0,
    structural: fp0.startStruct,
    weight: fp0.totalWeight,
    identifiers: fp0.identifiers
  });

  for (let i = blockSize; i < lines.length; i++) {
    const outHash = hashString(lineData[i - blockSize].structural);
    const inHash = hashString(lineData[i].structural);
    
    hash1 = (hash1 - (outHash * pow1) % MOD + MOD) % MOD;
    hash1 = (hash1 * B1 + inHash) % MOD;
    
    hash2 = (hash2 - (((outHash >> 16) ^ (outHash & 0xFFFF)) * pow2) % MOD + MOD) % MOD;
    hash2 = (hash2 * B2 + ((inHash >> 16) ^ (inHash & 0xFFFF))) % MOD;

    const fp = blockFingerprint(i - blockSize + 1);
    blocks.set(`${hash1}:${hash2}`, {
      startIdx: i - blockSize + 1,
      structural: fp.startStruct,
      weight: fp.totalWeight,
      identifiers: fp.identifiers
    });
  }
  return blocks;
}

function computeBlockSimilarity(aLines, bLines) {
  if (aLines.length < CONFIG.BLOCK_SIZE || bLines.length < CONFIG.BLOCK_SIZE) {
    return { score: 0, moves: [] };
  }
  
  const aBlocks = rollingHash(aLines, CONFIG.BLOCK_SIZE);
  const bBlocks = rollingHash(bLines, CONFIG.BLOCK_SIZE);
  
  let matches = 0;
  let totalWeight = 0;
  const moves = [];
  
  for (const [hash, aData] of aBlocks) {
    if (bBlocks.has(hash)) {
      matches++;
      const bData = bBlocks.get(hash);
      totalWeight += aData.weight;
      
      const posA = aData.startIdx;
      const posB = bData.startIdx;
      const drift = Math.abs(posA - posB);
      
      if (drift > CONFIG.MOVE_BLOCK_MIN_LINES) {
        const moveScore = (aData.weight * CONFIG.BLOCK_SIZE) / (drift + 1);
        moves.push({
          from: posA,
          to: posB,
          size: CONFIG.BLOCK_SIZE,
          weight: aData.weight,
          drift,
          confidence: Math.min(1, moveScore),
          identifiers: aData.identifiers
        });
      }
    }
  }
  
  const rawScore = matches / Math.max(aBlocks.size, 1);
  const maxPossibleDrift = Math.max(aLines.length, bLines.length);
  const avgDrift = matches > 0 ? maxPossibleDrift / matches : 0;
  const driftRatio = maxPossibleDrift > 0 ? avgDrift / maxPossibleDrift : 0;
  
  const score = rawScore * (1 - (driftRatio * CONFIG.REORDER_PENALTY_FACTOR));
  
  moves.sort((a, b) => b.confidence - a.confidence);
  
  return { score, moves };
}

function trimCommon(aLines, bLines) {
  let start = 0;
  const minLen = Math.min(aLines.length, bLines.length);
  while (start < minLen && aLines[start] === bLines[start]) start++;

  let endA = aLines.length - 1;
  let endB = bLines.length - 1;
  while (endA >= start && endB >= start && aLines[endA] === bLines[endB]) {
    endA--;
    endB--;
  }

  return {
    a: aLines.slice(start, endA + 1),
    b: bLines.slice(start, endB + 1),
    prefixLen: start,
    suffixLen: aLines.length - endA - 1,
  };
}

function normalizeLine(line) {
  return line.trim().replace(/\s+/g, ' ').replace(/[;:,]$/, '').toLowerCase();
}

function isWeakAnchor(line) {
  const normalized = normalizeLine(line);
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) return true;
  if (words.length <= 2 && words.every(w => CONFIG.STOPWORDS.has(w))) return true;
  
  const uniqueWords = new Set(words);
  if (uniqueWords.size <= 2 && words.length > 3) return true;
  
  return false;
}

function analyzeChange(originalALines, originalBLines, deterministic = false) {
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

function getSample(lines, size) {
  if (lines.length <= size) return lines;
  const step = Math.max(1, Math.floor(lines.length / size));
  const result = [];
  for (let i = 0; i < lines.length && result.length < size; i += step) {
    result.push(lines[i]);
  }
  return result;
}

// FIX: Ganti "lines hidden" jadi "baris lebih"
function* fastHeuristicDiff(aLines, bLines, ctx = {}) {
  const { prefixLen = 0 } = ctx;
  const head = CONFIG.HEURISTIC_HEAD_LINES;
  const tail = CONFIG.HEURISTIC_TAIL_LINES;
  
  yield { type: 'info', lines: [`--- OLD (${aLines.length} baris) [Semantic View] ---`] };
  
  if (aLines.length > 0) {
    yield { type: 'info', lines: ['@@ First ' + Math.min(head, aLines.length) + ' baris @@'] };
    yield { type: 'remove', lines: aLines.slice(0, head), offset: prefixLen };
  }
  
  const hiddenLines = aLines.length - head - tail;
  if (hiddenLines > 0) {
    yield { type: 'info', lines: [`... (${hiddenLines} baris lebih) ...`] }; // FIX HERE
  }
  
  if (aLines.length > head && tail > 0) {
    yield { type: 'info', lines: ['@@ Last ' + Math.min(tail, aLines.length - head) + ' baris @@'] };
    yield { type: 'remove', lines: aLines.slice(-tail), offset: prefixLen + aLines.length - tail };
  }
  
  yield { type: 'info', lines: [`+++ NEW (${bLines.length} baris) [Semantic View] +++`] };
  
  if (bLines.length > 0) {
    yield { type: 'info', lines: ['@@ First ' + Math.min(head, bLines.length) + ' baris @@'] };
    yield { type: 'add', lines: bLines.slice(0, head), offset: prefixLen };
  }
  
  const hiddenNew = bLines.length - head - tail;
  if (hiddenNew > 0) {
    yield { type: 'info', lines: [`... (${hiddenNew} baris lebih) ...`] }; // FIX HERE
  }
  
  if (bLines.length > head && tail > 0) {
    yield { type: 'info', lines: ['@@ Last ' + Math.min(tail, bLines.length - head) + ' baris @@'] };
    yield { type: 'add', lines: bLines.slice(-tail), offset: prefixLen + bLines.length - tail };
  }
}

function* guardedMyers(aLines, bLines, ctx = {}) {
  const { prefixLen = 0, opsCounter = {count: 0} } = ctx;
  
  if (aLines.length === 0 && bLines.length === 0) return;

  const maxDim = Math.max(aLines.length, bLines.length);
  const minDim = Math.min(aLines.length, bLines.length);
  const estimatedMatrix = maxDim * minDim;
  
  if (estimatedMatrix > CONFIG.MAX_OPS * 4) {
    yield { type: 'info', lines: ['... (Matrix too large, using heuristic)'] };
    yield* fastHeuristicDiff(aLines, bLines, ctx);
    return;
  }

  const raw = diffLines(aLines.join('\n'), bLines.join('\n'));
  let changedLines = 0;
  const hunks = [];

  for (const h of raw) {
    opsCounter.count += h.value.length * 2;
    if (opsCounter.count > CONFIG.MAX_OPS) {
      yield { type: 'info', lines: ['... (Operation budget exceeded)'] };
      yield* fastHeuristicDiff(aLines, bLines, ctx);
      return;
    }

    let lines = h.value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    if (h.added || h.removed) changedLines += lines.length;

    const type = h.added ? 'add' : h.removed ? 'remove' : 'context';
    hunks.push({ type, lines, offset: prefixLen });
  }

  if (changedLines > aLines.length * CONFIG.MAX_EDIT_RATIO) {
    yield* fastHeuristicDiff(aLines, bLines, ctx);
  } else {
    for (const hunk of hunks) yield hunk;
  }
}

function findAnchors(aLines, bLines) {
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

function* patienceSegmentedEngine(aLines, bLines, ctx = {}) {
  const { prefixLen = 0, opsCounter = {count: 0}, meta } = ctx;
  
  const anchors = meta.getAnchors();
  
  let pA = 0, pB = 0;
  const contextBuffer = [];

  for (const anchor of anchors) {
    opsCounter.count += 20;
    if (opsCounter.count > CONFIG.MAX_OPS) break;

    const subA = aLines.slice(pA, anchor.a);
    const subB = bLines.slice(pB, anchor.b);

    if (subA.length || subB.length) {
      if (contextBuffer.length) {
        yield { type: 'context', lines: contextBuffer, offset: prefixLen };
        contextBuffer.length = 0;
      }
      if (Math.max(subA.length, subB.length) > 600) {
        yield* fastHeuristicDiff(subA, subB, { prefixLen: prefixLen + pA });
      } else {
        yield* guardedMyers(subA, subB, { prefixLen: prefixLen + pA, opsCounter });
      }
    }

    contextBuffer.push(anchor.line);
    pA = anchor.a + 1;
    pB = anchor.b + 1;
  }

  if (contextBuffer.length) yield { type: 'context', lines: contextBuffer, offset: prefixLen };

  const tailA = aLines.slice(pA);
  const tailB = bLines.slice(pB);
  if (tailA.length || tailB.length) {
    yield* guardedMyers(tailA, tailB, { prefixLen: prefixLen + pA, opsCounter });
  }
}

class DiffFormatter {
  constructor(limit, startLine = 1) {
    this.limit = limit;
    this.oldL = startLine;
    this.newL = startLine;
    this.shown = 0;
    this.tips = new Set();
    this.removedVarCount = 0;
    this.removedLooseEqCount = 0;
    this.recentRemoved = [];
    this.blockMovedDetected = false;
    this._buffer = null;
    this.identifierMap = new Map();
  }

  *_flushBuffer(highlight) {
    if (!this._buffer) return;
    const hunk = this._buffer;
    
    if (hunk.type === 'remove') {
      const color = highlight ? '\x1b[31m' : '';
      for (const line of hunk.lines) {
        if (this.shown >= this.limit) {
          yield "... (baris lebih)";
          return;
        }
        this.indexRemovedLine(line);
        yield `${color}- L${this.oldL++}: ${line}${highlight ? '\x1b[0m' : ''}`;
        this.shown++;
      }
    }
    this._buffer = null;
  }

  *stream(hunks, highlight) {
    for (const hunk of hunks) {
      if (hunk.type === 'info') {
        yield* this._flushBuffer(highlight);
        for (const line of hunk.lines) yield `\x1b[36m${line}\x1b[0m`;
        continue;
      }
      
      if (hunk.type === 'context') {
        yield* this._flushBuffer(highlight);
        const lineCount = hunk.lines.length;
        this.oldL += lineCount;
        this.newL += lineCount;
        continue;
      }

      if (hunk.type === 'remove') {
        if (this._buffer && this._buffer.type === 'remove') {
          yield* this._flushBuffer(highlight);
        }
        if (!this._buffer) {
          this._buffer = hunk;
        } else {
          yield* this._flushBuffer(highlight);
          this._buffer = hunk;
        }
      } else if (hunk.type === 'add') {
        if (this._buffer && this._buffer.type === 'remove') {
          const similarity = this._calculateSemanticSimilarity(this._buffer.lines, hunk.lines);
          
          if (similarity.score >= CONFIG.REPLACE_SIMILARITY_THRESHOLD) {
            yield* this._yieldReplace(this._buffer.lines, hunk.lines, similarity, highlight);
            this._buffer = null;
            continue;
          }
        }
        yield* this._flushBuffer(highlight);
        yield* this._yieldAdd(hunk.lines, highlight);
      }
    }
    yield* this._flushBuffer(highlight);
  }

  _calculateSemanticSimilarity(oldLines, newLines) {
    if (oldLines.length === 0 || newLines.length === 0) return { score: 0, isRename: false, mappings: [] };
    
    const minLen = Math.min(oldLines.length, newLines.length);
    let totalSim = 0;
    let totalWeight = 0;
    const idPairs = [];
    
    for (let i = 0; i < minLen; i++) {
      const oldTokens = tokenize(oldLines[i]);
      const newTokens = tokenize(newLines[i]);
      
      const oldStruct = getWeightedStructuralSignature(oldTokens);
      const newStruct = getWeightedStructuralSignature(newTokens);
      const structSim = similarityScore(oldStruct.signature, newStruct.signature);
      
      const lineWeight = (oldStruct.weight + newStruct.weight) / 2;
      totalSim += structSim * lineWeight;
      totalWeight += lineWeight;
      
      if (structSim > 0.7) {
        const oldIds = extractIdentifiers(oldTokens);
        const newIds = extractIdentifiers(newTokens);
        
        if (oldIds.length === newIds.length && oldIds.length > 0) {
          for (let j = 0; j < oldIds.length; j++) {
            if (oldIds[j] !== newIds[j]) {
              idPairs.push({ from: oldIds[j], to: newIds[j] });
            }
          }
        }
      }
    }
    
    const avgSim = totalWeight > 0 ? totalSim / totalWeight : 0;
    const lenDiff = Math.abs(oldLines.length - newLines.length);
    const penalty = lenDiff * 0.05;
    const finalScore = Math.max(0, avgSim - penalty);
    
    const mappings = this._computeReliableMappings(idPairs);
    const isRename = mappings.length > 0;
    
    return { score: finalScore, isRename, mappings };
  }
  
  _computeReliableMappings(pairs) {
    if (pairs.length === 0) return [];
    
    const freq = new Map();
    for (const p of pairs) {
      const key = `${p.from}→${p.to}`;
      freq.set(key, (freq.get(key) || 0) + 1);
    }
    
    const fromCounts = new Map();
    for (const p of pairs) {
      fromCounts.set(p.from, (fromCounts.get(p.from) || 0) + 1);
    }
    
    const reliable = [];
    for (const [key, count] of freq) {
      const [from, to] = key.split('→');
      const totalFrom = fromCounts.get(from) || 1;
      if (count / totalFrom >= 0.5) {
        reliable.push({ from, to, confidence: count / totalFrom });
        this.identifierMap.set(from, to);
      }
    }
    
    return reliable;
  }

  *_yieldReplace(oldLines, newLines, similarity, highlight) {
    const color = highlight ? '\x1b[33m' : '';
    const simPercent = Math.round(similarity.score * 100);
    
    // FIX: rename.to (not rename.name)
    if (similarity.isRename && similarity.mappings.length > 0) {
      const primary = similarity.mappings[0];
      yield `${color}~ [${similarity.mappings.length} rename: ${primary.from}→${primary.to} ${Math.round(primary.confidence * 100)}%] ${simPercent}%${highlight ? '\x1b[0m' : ''}`;
    } else {
      yield `${color}~ [${simPercent}% similar]${highlight ? '\x1b[0m' : ''}`;
    }
    
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      if (this.shown >= this.limit) {
        yield "... (baris lebih)";
        return;
      }
      
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      
      if (oldLine !== undefined && newLine !== undefined) {
        const oldTokens = tokenize(oldLine);
        const newTokens = tokenize(newLine);
        const oldStruct = getWeightedStructuralSignature(oldTokens);
        const newStruct = getWeightedStructuralSignature(newTokens);
        const structSim = similarityScore(oldStruct.signature, newStruct.signature);
        
        if (structSim > 0.7 && oldLine !== newLine) {
          yield `${color}  ~ ${oldLine}${highlight ? '\x1b[0m' : ''}`;
          yield `${color}    → ${newLine}${highlight ? '\x1b[0m' : ''}`;
        } else if (oldLine !== newLine) {
          yield `${color}  - ${oldLine}${highlight ? '\x1b[0m' : ''}`;
          yield `${color}  + ${newLine}${highlight ? '\x1b[0m' : ''}`;
        }
        this.oldL++;
        this.newL++;
      } else if (oldLine !== undefined) {
        yield `${color}  - ${oldLine}${highlight ? '\x1b[0m' : ''}`;
        this.oldL++;
      } else if (newLine !== undefined) {
        yield `${color}  + ${newLine}${highlight ? '\x1b[0m' : ''}`;
        this.newL++;
      }
      this.shown++;
    }
  }

  *_yieldAdd(lines, highlight) {
    const color = highlight ? '\x1b[32m' : '';
    for (const line of lines) {
      if (this.shown >= this.limit) {
        yield "... (baris lebih)";
        return;
      }
      this.analyzeAddedLine(line);
      yield `${color}+ L${this.newL++}: ${line}${highlight ? '\x1b[0m' : ''}`;
      this.shown++;
    }
  }

  indexRemovedLine(line) {
    const trimmed = line.trim();
    this.recentRemoved.push(trimmed);
    if (this.recentRemoved.length > CONFIG.RECENT_WINDOW) this.recentRemoved.shift();

    if (trimmed.startsWith('var ')) this.removedVarCount++;
    if (trimmed.includes('==') && !trimmed.includes('===')) this.removedLooseEqCount++;
    
    if (this.recentRemoved.filter(r => r === trimmed).length > 2) {
      this.blockMovedDetected = true;
    }
  }

  analyzeAddedLine(line) {
    const trimmed = line.trim();
    if ((trimmed.startsWith('const ') || trimmed.startsWith('let ')) && this.removedVarCount > 0) {
      this.tips.add("✨ Good Refactor: var → const/let");
    }
    if (trimmed.includes('===') && this.removedLooseEqCount > 0) {
      this.tips.add("✨ Good Fix: == → ===");
    }
    if (trimmed.includes('innerHTML =')) this.tips.add("🔒 Security: Prefer textContent over innerHTML");
    
    if (this.recentRemoved.includes(trimmed)) {
      this.tips.add("📝 Note: Line appears in both removed and added (potential move)");
    }
  }
  
  getExtendedInsights(meta) {
    const insights = [];
    
    if (meta.isWhitespaceOnly) {
      insights.push("🎨 Style: Changes are whitespace-only");
    }
    
    if (this.blockMovedDetected) {
      insights.push("🔄 Block Move: Detected repeated lines");
    }
    
    if (meta.moves && meta.moves.length > 0) {
      const highConfMoves = meta.moves.filter(m => m.confidence > 0.7).length;
      insights.push(`📦 ${meta.moves.length} block move(s) detected (${highConfMoves} high confidence)`);
    }
    
    if (this.identifierMap.size > 0) {
      const renames = Array.from(this.identifierMap.entries())
        .slice(0, 3)
        .map(([k, v]) => `${k}→${v}`).join(', ');
      const more = this.identifierMap.size > 3 ? ` (+${this.identifierMap.size - 3} more)` : '';
      insights.push(`🏷️  Renames: ${renames}${more}`);
    }
    
    if (meta.prefixLen > 10 || meta.suffixLen > 10) {
      insights.push(`🚀 Skipped ${meta.prefixLen}+${meta.suffixLen} identical lines`);
    }
    
    if (meta.totalLines > 200) {
      insights.push("📏 Large diff: consider breaking into smaller commits");
    }
    
    if (meta.trimmedLines >= CONFIG.MIN_LINES_FOR_DENSITY) {
      if (meta.anchorDensity < CONFIG.ANCHOR_DENSITY_LOW) {
        insights.push(`🌊 Low anchor density: ${(meta.anchorDensity * 100).toFixed(1)}%`);
      } else if (meta.anchorDensity > CONFIG.ANCHOR_DENSITY_HIGH) {
        insights.push(`⚡ High anchor density: ${(meta.anchorDensity * 100).toFixed(1)}%`);
      }
    }
    
    return insights;
  }
}

function chooseEngine(meta) {
  const effectiveDensity = meta.trimmedLines >= CONFIG.MIN_LINES_FOR_DENSITY 
    ? meta.anchorDensity 
    : 0.15;
  
  if (meta.isChaos || meta.similarity < 0.15) {
    return { fn: fastHeuristicDiff, name: "Heuristic" };
  }
  
  if (effectiveDensity > CONFIG.ANCHOR_DENSITY_HIGH && meta.similarity < 0.4) {
    return { fn: patienceSegmentedEngine, name: "Patience (Noisy)" };
  }
  
  if (meta.similarity < 0.55 && meta.totalLines > CONFIG.MYERS_LIMIT) {
    return { fn: patienceSegmentedEngine, name: "Patience" };
  }
  
  return { fn: guardedMyers, name: "GuardedMyers" };
}

// Core generator
export function* executeDiff(original, patched, options = {}) {
  const { highlight = false, deterministic = false } = options;
  const aLines = (original || "").split('\n');
  const bLines = (patched || "").split('\n');
  
  const meta = analyzeChange(aLines, bLines, deterministic);
  const engineInfo = chooseEngine(meta);
  
  const formatter = new DiffFormatter(meta.limit, meta.prefixLen + 1);
  
  let anchorDensity = 0;
  if (engineInfo.fn === patienceSegmentedEngine || meta.trimmedLines >= CONFIG.MIN_LINES_FOR_DENSITY) {
    const anchors = meta.getAnchors();
    anchorDensity = anchors.length / meta.trimmedLines;
    meta.anchorDensity = anchorDensity;
  }
  
  yield `📊 Confidence: ${(meta.confidence * 100).toFixed(0)}% | Engine: ${engineInfo.name} | Limit: ${meta.limit} | Structural: ${(meta.blockScore * 100).toFixed(0)}% | Moves: ${meta.moves?.length || 0}`;
  
  const ctx = { 
    prefixLen: meta.prefixLen, 
    opsCounter: { count: 0 }, 
    meta 
  };
  
  yield* formatter.stream(engineInfo.fn(meta.trimmedA, meta.trimmedB, ctx), highlight);
  
  const extendedTips = formatter.getExtendedInsights(meta);
  if (extendedTips.length) {
    yield `\n💡 INSIGHTS:\n- ${extendedTips.join('\n- ')}`;
  }
  
  if (formatter.tips.size) {
    yield `\n💡 QUALITY:\n- ${Array.from(formatter.tips).join('\n- ')}`;
  }
}

// FIX: Wrapper dengan truncation marker "baris lebih"
export function generateDiff(original, patched, maxLines) {
  if (!original || !patched) return '';
  if (original === patched) return '';

  const parts = [];
  for (const chunk of executeDiff(original, patched)) {
    parts.push(chunk);
  }

  const contentLines = parts.filter(
    p => !p.startsWith('📊') && !p.startsWith('\n💡')
  );
  if (contentLines.length === 0) return '';

  const result = parts.join('\n');
  
  if (maxLines) {
    const lines = result.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + '\n... (baris lebih)';
    }
  }
  
  return result;
}
