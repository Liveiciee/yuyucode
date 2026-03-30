// symbols.cjs
const path = require('path');
const { CODE_EXTS, SYMBOL_PATTERNS } = require('../config.cjs');
const { getCachedSymbols, setCachedSymbols } = require('../cache.cjs');

function extractSymbols(src, filePath) {
  if (!CODE_EXTS.has(path.extname(filePath))) return [];
  
  const cacheKey = `${filePath}:${src.length}:${src.slice(-100)}`;
  const cached = getCachedSymbols(cacheKey);
  if (cached) return cached;
  
  const symbols = [];
  for (const { re, type } of SYMBOL_PATTERNS) {
    let m;
    const regex = new RegExp(re.source, re.flags);
    while ((m = regex.exec(src)) !== null) {
      if (!symbols.find(s => s.name === m[1])) {
        symbols.push({ type, name: m[1], sig: m[2] ? '(' + m[2].trim() + ')' : '' });
      }
    }
  }
  setCachedSymbols(cacheKey, symbols);
  return symbols;
}

module.exports = { extractSymbols };
