import { CONFIG } from './config.js';
import { logger } from '../utils.js';

export class ResponseCache {
  constructor(config = CONFIG.CACHE) {
    this.cache = new Map();
    this.config = config;
  }

  getKey(messages, model, options) {
    const hash = `${model}:${JSON.stringify(messages)}:${JSON.stringify(options)}`;
    let hashSum = 0;
    for (let i = 0; i < hash.length; i++) {
      hashSum = ((hashSum << 5) - hashSum) + hash.charCodeAt(i);
      hashSum = Math.trunc(hashSum);
    }
    return `cache_${Math.abs(hashSum)}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.config.ttlMs,
    });
  }

  clear() {
    this.cache.clear();
    logger.info?.('Response cache cleared');
  }
}

export const responseCache = new ResponseCache();

export function clearCache() {
  responseCache.clear();
}
