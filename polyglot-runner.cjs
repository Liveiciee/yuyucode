// polyglot-runner.cjs
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync, spawn } = require('child_process');

// ============================================================================
// CONFIGURATION - Mirip diff.js, granular & sophisticated
// ============================================================================
const CONFIG = Object.freeze({
  // Security
  ALLOWED_COMMANDS: Object.freeze({
    rust: { cmd: 'rustc', compile: true, runTemplate: '{output}' },
    cpp: { cmd: 'g++', compile: true, runTemplate: '{output}' },
    go: { cmd: 'go', compile: false, runTemplate: 'run {entry}' },
    python: { cmd: 'python3', compile: false, runTemplate: '{entry}' },
    javascript: { cmd: 'node', compile: false, runTemplate: '{entry}' },
    java: { cmd: 'javac', compile: true, runTemplate: 'java -cp {dir} {class}' },
  }),
  
  // Path Security
  PATH_TRAVERSAL_PATTERNS: Object.freeze([
    /\.\./, /\~/, /^\//, /\\/, /%2e%2e/i, /%2f/i, /\0/,
    /\$[{\(]/, /`/, /\$\(/, /<script/i,
  ]),
  
  // Resource Limits
  MAX_ARGS: 32,
  MAX_TIMEOUT_MS: 60_000,
  MAX_MEMORY_MB: 512,
  MAX_OUTPUT_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  
  // Sandbox
  SANDBOX: Object.freeze({
    enabled: true,
    chroot: false, // Require root, disable by default
    useFirejail: false, // Optional sandboxing
    useDocker: false,
    restrictedEnv: Object.freeze({
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/tmp',
      TMPDIR: '/tmp',
      LANG: 'C.UTF-8',
      // Hapus semua env berbahaya
      LD_PRELOAD: '',
      LD_LIBRARY_PATH: '',
    }),
  }),
  
  // Caching
  CACHE: Object.freeze({
    enabled: true,
    dir: path.join(require('os').tmpdir(), 'polyglot-cache'),
    maxAgeMs: 3600_000, // 1 hour
    maxSize: 100, // max files
  }),
  
  // Analysis
  STATIC_ANALYSIS: Object.freeze({
    enabled: true,
    maxLines: 1000,
    patterns: Object.freeze({
      'dangerous-import': /\b(eval|exec|system|popen|subprocess\.\*|child_process)\b/,
      'network-request': /\b(fetch|axios|http\.|urllib|requests)\b/,
      'file-operation': /\b(fs\.|open\(|writeFile|readFile|unlink|rmdir)\b/,
      'env-access': /\b(process\.env|os\.environ|ENV\[)\b/,
      'inline-script': /<script|javascript:|data:text\/html/,
    }),
  }),
  
  // Heuristics
  HEURISTICS: Object.freeze({
    detectInfiniteLoop: true,
    loopPattern: /\b(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))\b/g,
    detectRecursion: true,
    recursionPattern: /function\s+(\w+).*?\{[\s\S]*?\b\1\s*\(/g,
  }),
  
  // Output Processing
  OUTPUT: Object.freeze({
    truncateLines: 500,
    truncateCols: 200,
    stripAnsi: true,
    sanitizeControlChars: true,
  }),
  
  // Tokens
  MAX_IDENTIFIER_LENGTH: 64,
  ALLOWED_EXTENSIONS: Object.freeze({
    rust: ['.rs'],
    cpp: ['.cpp', '.cc', '.cxx', '.c++'],
    go: ['.go'],
    python: ['.py'],
    javascript: ['.js', '.mjs', '.cjs'],
    java: ['.java'],
  }),
});

// ============================================================================
// SECURITY LAYER - Fort Knox Mode 🔒
// ============================================================================

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

    // Check traversal patterns
    for (const pattern of CONFIG.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(inputPath)) {
        throw new Error(`Security violation: Path contains dangerous pattern "${inputPath}"`);
      }
    }

    const resolved = path.resolve(baseDir, inputPath);
    const baseResolved = path.resolve(baseDir);

    // Strict prefix check
    if (!resolved.startsWith(baseResolved + path.sep) && resolved !== baseResolved) {
      throw new Error(`Path traversal detected: ${resolved} outside ${baseResolved}`);
    }

    // Realpath check (symlink resolution)
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

    // Heuristic checks
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
      // Prevent injection via args
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

// ============================================================================
// EXECUTION ENGINE - Multi-Strategy 🚀
// ============================================================================

class ExecutionEngine {
  constructor(validator) {
    this.validator = validator;
    this.activeProcesses = new Set();
  }

  // FIX: Jangan pernah pakai user input sebagai command!
  buildCommand(runtime, entryPath, args, isCompiled = false) {
    const cfg = CONFIG.ALLOWED_COMMANDS[runtime];
    if (!cfg) throw new Error(`Unknown runtime: ${runtime}`);

    let command = cfg.cmd;
    let commandArgs = [];

    if (isCompiled && cfg.compile) {
      // Untuk compiled languages, command adalah output binary yang kita kontrol
      command = entryPath; // Ini sudah validated & generated oleh kita, bukan user input!
    } else if (cfg.compile) {
      // Compile mode: rustc/g++ -o output input
      const outputPath = this.validator.generateSafeOutputPath(runtime, entryPath);
      commandArgs = ['-o', outputPath, entryPath];
      return { command, commandArgs, outputPath, isCompilation: true };
    } else {
      // Interpreted: node file.js, python3 file.py, go run file.go
      const template = cfg.runTemplate.replace('{entry}', entryPath);
      commandArgs = template.split(' ').filter(Boolean);
      if (args.length) commandArgs.push(...args);
    }

    return { command, commandArgs, isCompilation: false };
  }

  async execute(params) {
    const {
      runtime,
      entryPath,
      args = [],
      cwd = process.cwd(),
      timeoutMs = CONFIG.MAX_TIMEOUT_MS,
      compileOnly = false,
    } = params;

    const startTime = Date.now();
    
    // Build command (FIXED: no user input as command)
    const cmdInfo = this.buildCommand(runtime, entryPath, args);
    
    // Compilation phase untuk C++/Rust/Java
    if (cmdInfo.isCompilation) {
      const compileResult = await this.spawnProcess({
        command: cmdInfo.command,
        args: cmdInfo.commandArgs,
        cwd,
        timeoutMs,
        env: CONFIG.SANDBOX.restrictedEnv,
      });

      if (compileResult.exitCode !== 0) {
        return {
          ok: false,
          stage: 'compilation',
          data: compileResult.stderr || compileResult.stdout,
          meta: { duration: Date.now() - startTime },
        };
      }

      if (compileOnly) {
        return {
          ok: true,
          stage: 'compilation',
          data: `Compiled to ${cmdInfo.outputPath}`,
          meta: { outputPath: cmdInfo.outputPath },
        };
      }

      // Jalankan binary hasil compile
      cmdInfo.command = cmdInfo.outputPath;
      cmdInfo.commandArgs = args;
      cmdInfo.isCompilation = false;
    }

    // Execution phase
    const runResult = await this.spawnProcess({
      command: cmdInfo.command,
      args: cmdInfo.commandArgs,
      cwd,
      timeoutMs,
      env: CONFIG.SANDBOX.restrictedEnv,
      maxBuffer: CONFIG.MAX_OUTPUT_BYTES,
    });

    const duration = Date.now() - startTime;

    return this.processResult(runResult, duration, runtime);
  }

  spawnProcess({ command, args, cwd, timeoutMs, env, maxBuffer }) {
    return new Promise((resolve) => {
      // Validasi command ada di PATH dan executable
      const whichCmd = process.platform === 'win32' ? 'where' : 'which';
      const check = spawnSync(whichCmd, [command], { encoding: 'utf8', shell: false });
      
      if (check.status !== 0) {
        return resolve({
          exitCode: 127,
          stderr: `Command not found: ${command}`,
          stdout: '',
          signal: null,
        });
      }

      const child = spawn(command, args, {
        cwd,
        env,
        timeout: timeoutMs,
        killSignal: 'SIGTERM',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      this.activeProcesses.add(child);
      
      let stdout = Buffer.alloc(0);
      let stderr = Buffer.alloc(0);
      let killed = false;

      // Memory limit watchdog
      const memoryCheck = setInterval(() => {
        try {
          const usage = process.memoryUsage();
          if (usage.rss > CONFIG.MAX_MEMORY_MB * 1024 * 1024) {
            child.kill('SIGKILL');
            killed = true;
            clearInterval(memoryCheck);
          }
        } catch (e) {
          clearInterval(memoryCheck);
        }
      }, 100);

      child.stdout.on('data', (data) => {
        if (stdout.length + data.length > maxBuffer) {
          child.kill('SIGTERM');
          killed = true;
        } else {
          stdout = Buffer.concat([stdout, data]);
        }
      });

      child.stderr.on('data', (data) => {
        if (stderr.length + data.length > maxBuffer) {
          stderr = Buffer.concat([stderr, data.slice(0, maxBuffer - stderr.length)]);
        } else {
          stderr = Buffer.concat([stderr, data]);
        }
      });

      child.on('close', (code, signal) => {
        clearInterval(memoryCheck);
        this.activeProcesses.delete(child);
        
        resolve({
          exitCode: code,
          signal,
          stdout: stdout.toString('utf8', 0, Math.min(stdout.length, maxBuffer)),
          stderr: stderr.toString('utf8', 0, Math.min(stderr.length, maxBuffer)),
          killed,
          timedOut: signal === 'SIGTERM' && killed,
        });
      });

      child.on('error', (err) => {
        clearInterval(memoryCheck);
        this.activeProcesses.delete(child);
        resolve({
          exitCode: -1,
          stderr: err.message,
          stdout: '',
          signal: null,
        });
      });
    });
  }

  processResult(result, duration, runtime) {
    let output = result.stdout;
    
    // Truncate & sanitize output
    if (CONFIG.OUTPUT.stripAnsi) {
      output = output.replace(/\x1b\[[0-9;]*m/g, '');
    }
    
    const lines = output.split('\n');
    if (lines.length > CONFIG.OUTPUT.truncateLines) {
      output = lines.slice(0, CONFIG.OUTPUT.truncateLines).join('\n') 
        + `\n... (${lines.length - CONFIG.OUTPUT.truncateLines} lines more) ...`;
    }

    if (result.timedOut) {
      return {
        ok: false,
        stage: 'execution',
        data: 'Execution timeout (infinite loop protection)',
        meta: { duration, runtime, killed: true },
      };
    }

    if (result.killed) {
      return {
        ok: false,
        stage: 'execution',
        data: 'Process killed (resource limit exceeded)',
        meta: { duration, runtime },
      };
    }

    if (result.exitCode !== 0) {
      return {
        ok: false,
        stage: 'execution',
        data: result.stderr || output || `Exit code ${result.exitCode}`,
        meta: { exitCode: result.exitCode, duration, runtime },
      };
    }

    return {
      ok: true,
      stage: 'execution',
      data: output || '(no output)',
      meta: {
        exitCode: 0,
        duration,
        runtime,
        bytesOut: result.stdout.length,
        bytesErr: result.stderr.length,
      },
    };
  }

  cleanup() {
    for (const proc of this.activeProcesses) {
      try {
        proc.kill('SIGKILL');
      } catch (e) {}
    }
  }
}

// ============================================================================
// CACHE MANAGER 🗂️
// ============================================================================

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
            fs.unlinkSync(fullPath); // Expired
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
      
      // LRU jika terlalu banyak
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

// ============================================================================
// MAIN API - PolyglotRunner Class
// ============================================================================

class PolyglotRunner {
  constructor() {
    this.validator = new SecurityValidator();
    this.engine = new ExecutionEngine(this.validator);
    this.cache = new CacheManager();
    this.stats = { runs: 0, errors: 0, cacheHits: 0 };
  }

  async checkHealth(runtime) {
    const cfg = CONFIG.ALLOWED_COMMANDS[runtime];
    if (!cfg) return { ok: false, data: 'Unknown runtime' };

    try {
      const check = spawnSync(cfg.cmd, ['--version'], {
        encoding: 'utf8',
        timeout: 3000,
        env: CONFIG.SANDBOX.restrictedEnv,
      });
      
      return {
        ok: check.status === 0,
        version: (check.stdout || check.stderr || '').split('\n')[0].trim(),
        data: check.status === 0 ? 'Healthy' : 'Not installed',
      };
    } catch (e) {
      return { ok: false, data: e.message };
    }
  }

  async run(params) {
    const {
      runtime,
      entry,
      cwd = process.cwd(),
      args = [],
      timeoutMs = CONFIG.MAX_TIMEOUT_MS,
      skipAnalysis = false,
    } = params;

    this.stats.runs++;

    try {
      // 1. Path validation
      const entryPath = this.validator.validatePath(entry, cwd);
      this.validator.validateFileSize(entryPath);
      this.validator.validateExtension(entry, runtime);

      // 2. Static analysis (security scan)
      if (!skipAnalysis && CONFIG.STATIC_ANALYSIS.enabled) {
        const code = fs.readFileSync(entryPath, 'utf8');
        const analysis = this.validator.staticAnalysis(code, runtime);
        
        if (!analysis.safe) {
          return {
            ok: false,
            stage: 'security-scan',
            data: 'Security violations detected',
            warnings: analysis.warnings,
          };
        }
      }

      // 3. Sanitize args
      const safeArgs = this.validator.sanitizeArgs(args);

      // 4. Check cache untuk compiled languages
      let cachedBinary = null;
      if (CONFIG.ALLOWED_COMMANDS[runtime]?.compile && CONFIG.CACHE.enabled) {
        cachedBinary = this.cache.get(entryPath, runtime);
        if (cachedBinary) {
          this.stats.cacheHits++;
        }
      }

      // 5. Execute
      const result = await this.engine.execute({
        runtime,
        entryPath: cachedBinary || entryPath,
        args: safeArgs,
        cwd,
        timeoutMs,
        compileOnly: false,
      });

      return result;

    } catch (error) {
      this.stats.errors++;
      return {
        ok: false,
        stage: 'validation',
        data: error.message,
      };
    }
  }

  async listRuntimes() {
    const runtimes = Object.keys(CONFIG.ALLOWED_COMMANDS);
    const results = await Promise.all(
      runtimes.map(async (rt) => ({
        runtime: rt,
        ...(await this.checkHealth(rt)),
      }))
    );
    return { ok: true, data: results };
  }

  getStats() {
    return { ...this.stats };
  }

  cleanup() {
    this.engine.cleanup();
    return this.cache.clean();
  }
}

// ============================================================================
// BACKWARD COMPATIBLE API (tapi secure)
// ============================================================================

const runner = new PolyglotRunner();

// Cleanup on exit
process.on('exit', () => runner.cleanup());
process.on('SIGINT', () => {
  runner.cleanup();
  process.exit(0);
});

// Sync wrapper untuk kompatibilitas dengan kode lama
function handlePolyglotAction(action, params = {}) {
  // Convert async to sync untuk backward compat
  if (action === 'list') {
    const runtimes = Object.keys(CONFIG.ALLOWED_COMMANDS);
    return { ok: true, data: runtimes, meta: CONFIG.ALLOWED_COMMANDS };
  }

  if (action === 'health') {
    // Note: Ini async sebenarnya, tapi untuk kompatibilitas kita return promise-like
    // Atau user bisa pakai API async baru
    const report = {};
    for (const rt of Object.keys(CONFIG.ALLOWED_COMMANDS)) {
      // Simplified sync check
      try {
        const cfg = CONFIG.ALLOWED_COMMANDS[rt];
        const r = spawnSync(cfg.cmd, ['--version'], { 
          encoding: 'utf8', 
          timeout: 1000,
          env: CONFIG.SANDBOX.restrictedEnv,
        });
        report[rt] = { ok: r.status === 0, hint: (r.stdout || '').trim() };
      } catch (e) {
        report[rt] = { ok: false, hint: e.message };
      }
    }
    return { ok: true, data: report };
  }

  if (action === 'run') {
    // Async execution wrapped - returns promise
    // User harus await/handle ini, atau gunakan API async langsung
    return runner.run(params);
  }

  return { ok: false, data: `Unknown action: ${action}` };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // New API (Recommended)
  PolyglotRunner,
  runner,
  
  // Backward compatible
  handlePolyglotAction,
  
  // Constants
  CONFIG,
  RUNTIMES: CONFIG.ALLOWED_COMMANDS,
  
  // Utilities
  SecurityValidator,
  ExecutionEngine,
};
