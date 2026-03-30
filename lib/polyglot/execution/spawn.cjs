// spawn.js
'use strict';

const { spawnSync, spawn } = require('child_process');

function checkCommandExists(command) {
  const whichCmd = process.platform === 'win32' ? 'where' : 'which';
  const check = spawnSync(whichCmd, [command], { encoding: 'utf8', shell: false });
  return check.status === 0;
}

function spawnProcess({ command, args, cwd, timeoutMs, env, maxBuffer }) {
  return new Promise((resolve) => {
    if (!checkCommandExists(command)) {
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

    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let killed = false;

    // Memory limit watchdog
    const memoryCheck = setInterval(() => {
      try {
        const usage = process.memoryUsage();
        if (usage.rss > (process.env.MAX_MEMORY_MB || 512) * 1024 * 1024) {
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
      resolve({
        exitCode: -1,
        stderr: err.message,
        stdout: '',
        signal: null,
      });
    });
  });
}

module.exports = { spawnProcess };
