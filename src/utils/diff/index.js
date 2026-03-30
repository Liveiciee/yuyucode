import { analyzeChange } from './analyzer.js';
import { chooseEngine } from './engines/index.js';
import { DiffFormatter } from './formatter.js';

export function* executeDiff(original, patched, options = {}) {
  const { highlight = false, deterministic = false } = options;
  const aLines = (original || "").split('\n');
  const bLines = (patched || "").split('\n');
  
  const meta = analyzeChange(aLines, bLines, deterministic);
  const engineInfo = chooseEngine(meta);
  
  const formatter = new DiffFormatter(meta.limit, meta.prefixLen + 1);
  
  let anchorDensity = 0;
  if (engineInfo.fn.name === 'patienceSegmentedEngine' || meta.trimmedLines >= 50) {
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
