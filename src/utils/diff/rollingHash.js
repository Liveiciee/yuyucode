import CONFIG from './config.js';
import { tokenize, getWeightedStructuralSignature, extractIdentifiers } from './tokenizer.js';

export function rollingHash(lines, blockSize) {
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

export function computeBlockSimilarity(aLines, bLines) {
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
