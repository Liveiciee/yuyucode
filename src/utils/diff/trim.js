export function trimCommon(aLines, bLines) {
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

export function getSample(lines, size) {
  if (lines.length <= size) return lines;
  const step = Math.max(1, Math.floor(lines.length / size));
  const result = [];
  for (let i = 0; i < lines.length && result.length < size; i += step) {
    result.push(lines[i]);
  }
  return result;
}
