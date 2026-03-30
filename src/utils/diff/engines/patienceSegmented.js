import { fastHeuristicDiff } from './fastHeuristic.js';
import { guardedMyers } from './guardedMyers.js';
import CONFIG from '../config.js';

export function* patienceSegmentedEngine(aLines, bLines, ctx = {}) {
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
