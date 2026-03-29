// src/utils/diff.js
import { diffLines } from 'diff';

const MYERS_THRESHOLD  = 2000;
const MIN_ANCHOR_RATIO = 0.3;
const MAX_CHUNK_SIZE   = 500;
const MAX_DIFF_RATIO   = 1.5;

function findStrictAnchors(aLines, bLines) {
  const aFreq = new Map(), bFreq = new Map();
  for (const l of aLines) aFreq.set(l, (aFreq.get(l) || 0) + 1);
  for (const l of bLines) bFreq.set(l, (bFreq.get(l) || 0) + 1);

  const bMap = new Map();
  bLines.forEach((l, i) => { if (bFreq.get(l) === 1) bMap.set(l, i); });

  const anchors = [];
  let lastB = -1;
  for (let ai = 0; ai < aLines.length; ai++) {
    const line = aLines[ai];
    if (aFreq.get(line) === 1 && bMap.has(line)) {
      const bi = bMap.get(line);
      if (bi > lastB) { anchors.push({ a: ai, b: bi }); lastB = bi; }
    }
  }
  return anchors;
}

function segmentedDiff(aLines, bLines) {
  const maxLines = Math.max(aLines.length, bLines.length);
  const anchors  = findStrictAnchors(aLines, bLines);

  if (anchors.length < maxLines * MIN_ANCHOR_RATIO) {
    return diffLines(aLines.join('\n'), bLines.join('\n'));
  }

  const result = [];
  let prevA = 0, prevB = 0;

  for (const { a, b } of anchors) {
    if ((a - prevA) > MAX_CHUNK_SIZE || (b - prevB) > MAX_CHUNK_SIZE) {
      return diffLines(aLines.join('\n'), bLines.join('\n'));
    }
    const aChunk = aLines.slice(prevA, a), bChunk = bLines.slice(prevB, b);
    if (aChunk.length || bChunk.length) {
      result.push(...diffLines(aChunk.join('\n'), bChunk.join('\n')));
    }
    result.push({ value: aLines[a] + '\n', added: false, removed: false });
    prevA = a + 1; prevB = b + 1;
  }

  const aTail = aLines.slice(prevA), bTail = bLines.slice(prevB);
  if (aTail.length || bTail.length) result.push(...diffLines(aTail.join('\n'), bTail.join('\n')));

  if (result.length > maxLines * MAX_DIFF_RATIO) {
    return diffLines(aLines.join('\n'), bLines.join('\n'));
  }

  return result;
}

function formatDiffLine(hunk, line, oldLine, newLine) {
  if (hunk.removed) return { text: `- L${oldLine}: ${line}`, oldInc: 1, newInc: 0 };
  if (hunk.added)   return { text: `+ L${newLine}: ${line}`, oldInc: 0, newInc: 1 };
  return null;
}

function advanceContext(hunk, hunkLines) {
  const len = hunkLines.length;
  return {
    oldInc: hunk.removed ? 0 : len,
    newInc: hunk.added   ? 0 : len,
  };
}

export function generateDiff(original, patched, maxLines = 40) {
  if (!original || !patched || original === patched) return '';

  const aLines = original.split('\n');
  const bLines = patched.split('\n');

  // Early bailout untuk file sangat besar (>5000 baris)
  if (aLines.length > 5000 && bLines.length > 5000) {
    const diffLinesCount = Math.abs(aLines.length - bLines.length);
    if (diffLinesCount > 2000) {
      return `⚠️ File terlalu besar (${aLines.length} vs ${bLines.length} baris).\nGunakan /review --all untuk analisis terbatas.`;
    }
  }

  const hunks = (aLines.length > MYERS_THRESHOLD || bLines.length > MYERS_THRESHOLD)
    ? segmentedDiff(aLines, bLines)
    : diffLines(original, patched);

  const result = [];
  let shown = 0, oldLine = 1, newLine = 1;

  for (const hunk of hunks) {
    const hunkLines = hunk.value.split('\n').filter((l, i, a) => !(i === a.length - 1 && l === ''));

    if (!hunk.added && !hunk.removed) {
      const adv = advanceContext(hunk, hunkLines);
      oldLine += adv.oldInc;
      newLine += adv.newInc;
      continue;
    }

    for (const line of hunkLines) {
      if (shown >= maxLines) { result.push('... (baris lebih)'); return result.join('\n'); }
      const fmt = formatDiffLine(hunk, line, oldLine, newLine);
      if (fmt) { result.push(fmt.text); oldLine += fmt.oldInc; newLine += fmt.newInc; shown++; }
    }
  }
  return result.join('\n');
}
