import CONFIG from './config.js';
import { tokenize, getWeightedStructuralSignature, extractIdentifiers } from './tokenizer.js';
import { similarityScore } from './levenshtein.js';

export class DiffFormatter {
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
