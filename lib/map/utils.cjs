// utils.cjs
const fs = require('fs');
const path = require('path');
const { IGNORE, CODE_EXTS, ALL_EXTS } = require('./config.cjs');

function walkFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full, exts));
    else if (exts.has(path.extname(entry.name))) results.push(full);
  }
  return results;
}

function relPath(p, root = process.cwd()) {
  return p.replace(root + '/', '');
}

function log(...args) {
  if (process.argv.includes('--verbose')) console.log(...args);
}

function getChangedFiles(root, _spawnSync = require('child_process').spawnSync) {
  try {
    const result = _spawnSync('git', ['diff', '--name-only', 'HEAD'], {
      cwd: root, encoding: 'utf8', timeout: 5000, stdio: 'pipe',
    });
    if (result.error || result.status !== 0) return null;
    const lines = (result.stdout || '').trim().split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return new Set(lines.map(f => path.join(root, f)));
  } catch {
    return null;
  }
}

module.exports = { walkFiles, relPath, log, getChangedFiles };
