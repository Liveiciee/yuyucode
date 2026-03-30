// helpers.cjs
const path = require('path');
const { execSync } = require('child_process');
const HOME = process.env.HOME;

function resolvePath(filePath) {
  if (!filePath) return HOME;
  if (filePath.startsWith('/')) return filePath;
  return path.join(HOME, filePath);
}

function shellEsc(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\0/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$\(/g, '\\$(');
}

function isValidGitHubIdentifier(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]+$/.test(value);
}

function execSafe(command, cwd, timeoutMs = 60000) {
  try {
    const mergedCmd = command.includes('2>') ? command : `${command} 2>&1`;
    const out = execSync(mergedCmd, {
      cwd: cwd || HOME, encoding: 'utf8',
      timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024,
    });
    return { ok: true, data: out || '(selesai)' };
  } catch(e) {
    const errMsg = `${e.stdout || ''}${e.stderr || ''}` || e.message;
    if (errMsg.includes('Illegal instruction')) {
      return { ok: false, data: '⚠️ Illegal instruction — possible ARM64 incompatibility.' };
    }
    if (errMsg.includes('cannot allocate memory')) {
      return { ok: false, data: '⚠️ Out of memory — try reducing workload.' };
    }
    return { ok: false, data: errMsg.slice(0, 3000) };
  }
}

module.exports = { resolvePath, shellEsc, isValidGitHubIdentifier, execSafe, HOME };
