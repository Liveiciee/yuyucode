// cache.cjs
const SYMBOL_CACHE = new Map();
const MAX_SYMBOL_CACHE = 200;

function getCachedSymbols(cacheKey) {
  return SYMBOL_CACHE.get(cacheKey);
}

function setCachedSymbols(cacheKey, symbols) {
  if (SYMBOL_CACHE.size > MAX_SYMBOL_CACHE) {
    const firstKey = SYMBOL_CACHE.keys().next().value;
    SYMBOL_CACHE.delete(firstKey);
  }
  SYMBOL_CACHE.set(cacheKey, symbols);
}

module.exports = { getCachedSymbols, setCachedSymbols };
