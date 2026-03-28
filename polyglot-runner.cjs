'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RUNTIMES = Object.freeze({
  rust: { command: 'command', args: ['-v', 'rustc'], mode: 'binary' },
  cpp: { command: 'command', args: ['-v', 'g++'], mode: 'binary' },
  go: { command: 'command', args: ['-v', 'go'], mode: 'source' },
  python: { command: 'command', args: ['-v', 'python3'], mode: 'source' },
  javascript: { command: 'command', args: ['-v', 'node'], mode: 'source' },
});

const MAX_ARGS = 32;
const MAX_TIMEOUT_MS = 60_000;

function normalizeArgs(args) {
  if (!Array.isArray(args)) return [];
  return args
    .slice(0, MAX_ARGS)
    .map(a => String(a))
    .filter(a => a.length <= 512);
}

function safeResolve(baseDir, entry) {
  const base = path.resolve(baseDir || process.cwd());
  const resolved = path.resolve(base, String(entry || ''));
  if (!resolved.startsWith(base)) {
    throw new Error('Entry path must stay inside working directory');
  }
  if (!fs.existsSync(resolved)) {
    throw new Error('Entry file not found: ' + resolved);
  }
  return resolved;
}

function checkRuntime(runtime) {
  const cfg = RUNTIMES[runtime];
  if (!cfg) return { ok: false, data: 'Unknown runtime: ' + runtime };
  const r = spawnSync(cfg.command, cfg.args, { encoding: 'utf8', shell: false, timeout: 3000 });
  return { ok: r.status === 0, data: (r.stdout || r.stderr || '').trim() };
}

function runRuntime(runtime, params = {}) {
  const cfg = RUNTIMES[runtime];
  if (!cfg) return { ok: false, data: 'Unknown runtime: ' + runtime };

  let entryPath;
  try {
    entryPath = safeResolve(params.cwd || process.cwd(), params.entry);
  } catch (error) {
    return { ok: false, data: error.message };
  }

  const args = normalizeArgs(params.args);
  const timeoutMs = Math.max(1000, Math.min(Number(params.timeoutMs) || 15_000, MAX_TIMEOUT_MS));

  let command = '';
  let commandArgs = [];
  if (runtime === 'go') {
    command = 'go';
    commandArgs = ['run', entryPath, ...args];
  } else if (runtime === 'python') {
    command = 'python3';
    commandArgs = [entryPath, ...args];
  } else if (runtime === 'javascript') {
    command = 'node';
    commandArgs = [entryPath, ...args];
  } else {
    // rust/cpp -> expect compiled binary entry path.
    command = entryPath;
    commandArgs = args;
  }

  const result = spawnSync(command, commandArgs, {
    cwd: params.cwd || process.cwd(),
    encoding: 'utf8',
    shell: false,
    timeout: timeoutMs,
    env: process.env,
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join('').trim();
  if (result.error) {
    return { ok: false, data: `Runtime execution failed: ${result.error.message}` };
  }
  if (result.status !== 0) {
    return { ok: false, data: output || `Process exited with code ${result.status}` };
  }
  return { ok: true, data: output || '(done)', meta: { exitCode: result.status, runtime } };
}

function handlePolyglotAction(action, params = {}) {
  if (action === 'list') {
    return { ok: true, data: Object.keys(RUNTIMES), meta: RUNTIMES };
  }
  if (action === 'health') {
    const report = {};
    for (const runtime of Object.keys(RUNTIMES)) {
      const r = checkRuntime(runtime);
      report[runtime] = { ok: r.ok, hint: r.data };
    }
    return { ok: true, data: report };
  }
  if (action === 'run') {
    return runRuntime(params.runtime, params);
  }
  return { ok: false, data: `Unknown polyglot action: ${action}` };
}

module.exports = {
  handlePolyglotAction,
  runRuntime,
  checkRuntime,
  RUNTIMES,
};
