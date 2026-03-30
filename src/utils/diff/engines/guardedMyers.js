import { diffLines } from 'diff';
import CONFIG from '../config.js';
import { fastHeuristicDiff } from './fastHeuristic.js';

export function* guardedMyers(aLines, bLines, ctx = {}) {
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

    const lines = h.value.split('\n');
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
