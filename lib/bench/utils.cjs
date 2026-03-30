const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { ROOT } = require('./config.cjs');

function stripAnsi(s) {
  return s.replace(/\x1b\[[\d;]*[a-zA-Z]/g, '');
}

function readJSONSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeJSONSafe(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function gitHash() {
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8'
    }).trim() || 'no-git';
  } catch {
    return 'no-git';
  }
}

function gitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8'
    }).trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function gitCommitCount() {
  try {
    return execSync('git rev-list --count HEAD 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8'
    }).trim() || '0';
  } catch {
    return '0';
  }
}

module.exports = {
  stripAnsi,
  readJSONSafe,
  writeJSONSafe,
  gitHash,
  gitBranch,
  gitCommitCount
};
