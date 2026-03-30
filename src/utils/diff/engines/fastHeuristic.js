import CONFIG from '../config.js';

export function* fastHeuristicDiff(aLines, bLines, ctx = {}) {
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
    yield { type: 'info', lines: [`... (${hiddenLines} baris lebih) ...`] };
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
    yield { type: 'info', lines: [`... (${hiddenNew} baris lebih) ...`] };
  }
  
  if (bLines.length > head && tail > 0) {
    yield { type: 'info', lines: ['@@ Last ' + Math.min(tail, bLines.length - head) + ' baris @@'] };
    yield { type: 'add', lines: bLines.slice(-tail), offset: prefixLen + bLines.length - tail };
  }
}
