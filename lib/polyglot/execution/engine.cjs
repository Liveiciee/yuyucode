// engine.js
'use strict';

const { CONFIG } = require('../config.cjs');
const { spawnProcess } = require('./spawn.cjs');

class ExecutionEngine {
  constructor(validator) {
    this.validator = validator;
    this.activeProcesses = new Set();
  }

  buildCommand(runtime, entryPath, args, isCompiled = false) {
    const cfg = CONFIG.ALLOWED_COMMANDS[runtime];
    if (!cfg) throw new Error(`Unknown runtime: ${runtime}`);

    let command = cfg.cmd;
    let commandArgs = [];

    if (isCompiled && cfg.compile) {
      command = entryPath;
    } else if (cfg.compile) {
      const outputPath = this.validator.generateSafeOutputPath(runtime, entryPath);
      commandArgs = ['-o', outputPath, entryPath];
      return { command, commandArgs, outputPath, isCompilation: true };
    } else {
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
    
    const cmdInfo = this.buildCommand(runtime, entryPath, args);
    
    if (cmdInfo.isCompilation) {
      const compileResult = await spawnProcess({
        command: cmdInfo.command,
        args: cmdInfo.commandArgs,
        cwd,
        timeoutMs,
        env: CONFIG.SANDBOX.restrictedEnv,
        maxBuffer: CONFIG.MAX_OUTPUT_BYTES,
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

      cmdInfo.command = cmdInfo.outputPath;
      cmdInfo.commandArgs = args;
      cmdInfo.isCompilation = false;
    }

    const runResult = await spawnProcess({
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

  processResult(result, duration, runtime) {
    let output = result.stdout;
    
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
      try { proc.kill('SIGKILL'); } catch (e) {}
    }
  }
}

module.exports = { ExecutionEngine };
