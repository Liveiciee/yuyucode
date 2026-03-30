// cache.cjs
const fs = require('fs');
const { READ_CACHE_TTL, MAX_CACHE_SIZE, MAX_CACHE_FILE_SIZE } = require('./config.cjs');

const _readCache = new Map();

function getCached(filePath) {
  const e = _readCache.get(filePath);
  if (!e) return null;
  if (Date.now() - e.ts > READ_CACHE_TTL) { _readCache.delete(filePath); return null; }
  return e;
}

function setCache(filePath, data, meta) {
  if (data.length > MAX_CACHE_FILE_SIZE) return;
  _readCache.set(filePath, { data, meta, ts: Date.now() });
  if (_readCache.size > MAX_CACHE_SIZE) _readCache.delete(_readCache.keys().next().value);
}

function invalidateCache(filePath) {
  _readCache.delete(filePath);
}

module.exports = { getCached, setCache, invalidateCache, _readCache };
