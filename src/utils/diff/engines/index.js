import CONFIG from '../config.js';
import { fastHeuristicDiff } from './fastHeuristic.js';
import { guardedMyers } from './guardedMyers.js';
import { patienceSegmentedEngine } from './patienceSegmented.js';

export function chooseEngine(meta) {
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
