// validator.js
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CONFIG } = require('../config.cjs');

class SecurityValidator {
  constructor() {
    this.violations = [];
    this.cacheDir = CONFIG.CACHE.dir;
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!CONFIG.CACHE.enabled) return;
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true, mode: 0o700 });
      }
    } catch (e) {
      throw new Error(`Failed to create cache: ${e.message}`);
    }
  }

  validatePath(inputPath, baseDir) {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Invalid path: empty or non-string');
    }

    for (const pattern of CONFIG.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(inputPath)) {
        throw new Error(`Security violation: Path contains dangerous pattern "${inputPath}"`);
      }
    }

    const resolved = path.resolve(baseDir, inputPath);
    const baseResolved = path.resolve(baseDir);

    if (!resolved.startsWith(baseResolved + path.sep) && resolved !== baseResolved) {
      throw new Error(`Path traversal detected: ${resolved} outside ${baseResolved}`);
    }

    try {
      const realPath = fs.realpathSync(resolved);
      const realBase = fs.realpathSync(baseResolved);
      if (!realPath.startsWith(realBase + path.sep)) {
        throw new Error('Symlink traversal detected');
      }
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }

    return resolved;
  }

  validateFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > CONFIG.MAX_FILE_SIZE_BYTES) {
        throw new Error(`File too large: ${stats.size} bytes (max ${CONFIG.MAX_FILE_SIZE_BYTES})`);
      }
      return stats;
    } catch (e) {
      throw new Error(`File validation failed: ${e.message}`);
    }
  }

  validateExtension(fileName, runtime) {
    const ext = path.extname(fileName).toLowerCase();
    const allowed = CONFIG.ALLOWED_EXTENSIONS[runtime];
    if (!allowed || !allowed.includes(ext)) {
      throw new Error(`Invalid extension "${ext}" for ${runtime}. Allowed: ${allowed?.join(', ')}`);
    }
    return ext;
  }

  staticAnalysis(code, runtime) {
    if (!CONFIG.STATIC_ANALYSIS.enabled) return { safe: true, warnings: [] };
    
    const warnings = [];
    const lines = code.split('\n').slice(0, CONFIG.STATIC_ANALYSIS.maxLines);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const [category, pattern] of Object.entries(CONFIG.STATIC_ANALYSIS.patterns)) {
        if (pattern.test(line)) {
          warnings.push({
            line: i + 1,
            category,
            snippet: line.trim().substring(0, 50),
            severity: category === 'inline-script' ? 'error' : 'warning',
          });
        }
      }
    }

    if (CONFIG.HEURISTICS.detectInfiniteLoop) {
      const loopMatches = code.match(CONFIG.HEURISTICS.loopPattern);
      if (loopMatches && loopMatches.length > 5) {
        warnings.push({
          line: 0,
          category: 'suspicious-loop',
          snippet: 'Multiple infinite loop patterns detected',
          severity: 'warning',
        });
      }
    }

    return {
      safe: !warnings.some(w => w.severity === 'error'),
      warnings,
    };
  }

  sanitizeArgs(args) {
    if (!Array.isArray(args)) return [];
    
    return args.slice(0, CONFIG.MAX_ARGS).map(arg => {
      const str = String(arg).substring(0, 512);
      if (/[;&|`$]/.test(str)) {
        throw new Error(`Dangerous character in argument: ${str}`);
      }
      return str;
    });
  }

  generateSafeOutputPath(runtime, entryPath) {
    const hash = crypto.createHash('sha256')
      .update(entryPath + fs.statSync(entryPath).mtime.getTime())
      .digest('hex')
      .substring(0, 16);
    
    const base = path.basename(entryPath, path.extname(entryPath));
    return path.join(this.cacheDir, `${runtime}_${base}_${hash}`);
  }
}

module.exports = { SecurityValidator };
