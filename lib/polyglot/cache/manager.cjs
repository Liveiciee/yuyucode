// manager.js
'use strict';

const fs = require('fs');
const path = require('path');
const { CONFIG } = require('../config.cjs');

class CacheManager {
  constructor() {
    this.dir = CONFIG.CACHE.dir;
  }

  get(entryPath, runtime) {
    if (!CONFIG.CACHE.enabled) return null;
    
    try {
      const files = fs.readdirSync(this.dir);
      const base = path.basename(entryPath, path.extname(entryPath));
      const pattern = new RegExp(`^${runtime}_${base}_[a-f0-9]{16}$`);
      
      for (const file of files) {
        if (pattern.test(file)) {
          const fullPath = path.join(this.dir, file);
          const stats = fs.statSync(fullPath);
          const age = Date.now() - stats.mtime.getTime();
          
          if (age < CONFIG.CACHE.maxAgeMs) {
            return fullPath;
          } else {
            fs.unlinkSync(fullPath);
          }
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  clean() {
    if (!CONFIG.CACHE.enabled) return;
    try {
      const files = fs.readdirSync(this.dir);
      let deleted = 0;
      
      for (const file of files) {
        const fullPath = path.join(this.dir, file);
        const stats = fs.statSync(fullPath);
        if (Date.now() - stats.mtime.getTime() > CONFIG.CACHE.maxAgeMs) {
          fs.unlinkSync(fullPath);
          deleted++;
        }
      }
      
      if (files.length > CONFIG.CACHE.maxSize) {
        const sorted = files
          .map(f => ({ name: f, path: path.join(this.dir, f), stat: fs.statSync(path.join(this.dir, f)) }))
          .sort((a, b) => a.stat.atime - b.stat.atime);
        
        const toDelete = sorted.slice(0, sorted.length - CONFIG.CACHE.maxSize);
        for (const f of toDelete) {
          fs.unlinkSync(f.path);
          deleted++;
        }
      }
      
      return { cleaned: deleted };
    } catch (e) {
      return { error: e.message };
    }
  }
}

module.exports = { CacheManager };
