// index.js - Polyglot Runner main entry point
'use strict';

const { CONFIG } = require('./config.cjs');
const { RUNTIMES } = require('./runtimes.cjs');
const { SecurityValidator } = require('./security/validator.cjs');
const { ExecutionEngine } = require('./execution/engine.cjs');
const { CacheManager } = require('./cache/manager.cjs');
const { spawnProcess } = require('./execution/spawn.cjs'); // for health checks
const { spawnSync } = require('child_process');

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
      const entryPath = this.validator.validatePath(entry, cwd);
      this.validator.validateFileSize(entryPath);
      this.validator.validateExtension(entry, runtime);

      if (!skipAnalysis && CONFIG.STATIC_ANALYSIS.enabled) {
        const code = require('fs').readFileSync(entryPath, 'utf8');
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

      const safeArgs = this.validator.sanitizeArgs(args);

      let cachedBinary = null;
      if (CONFIG.ALLOWED_COMMANDS[runtime]?.compile && CONFIG.CACHE.enabled) {
        cachedBinary = this.cache.get(entryPath, runtime);
        if (cachedBinary) this.stats.cacheHits++;
      }

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

const runner = new PolyglotRunner();

process.on('exit', () => runner.cleanup());
process.on('SIGINT', () => {
  runner.cleanup();
  process.exit(0);
});

function handlePolyglotAction(action, params = {}) {
  if (action === 'list') {
    const runtimes = Object.keys(CONFIG.ALLOWED_COMMANDS);
    return { ok: true, data: runtimes, meta: CONFIG.ALLOWED_COMMANDS };
  }

  if (action === 'health') {
    const report = {};
    for (const rt of Object.keys(CONFIG.ALLOWED_COMMANDS)) {
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
    return runner.run(params);
  }

  return { ok: false, data: `Unknown action: ${action}` };
}

module.exports = {
  PolyglotRunner,
  runner,
  handlePolyglotAction,
  CONFIG,
  RUNTIMES,
  SecurityValidator,
  ExecutionEngine,
};
