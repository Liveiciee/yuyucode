// tree.cjs
const fs = require('fs');
const path = require('path');

const CODE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const IGNORE    = new Set(['node_modules', '.git', 'android', 'dist', '__snapshots__']);

function buildTree(dirPath, depth, maxDepth, prefix) {
  if (depth > maxDepth) return '';
  let entries;
  try { entries = fs.readdirSync(dirPath, { withFileTypes: true }); }
  catch { return ''; }
  const skip = new Set(['.git','node_modules','dist','build','.gradle','.idea','__pycache__','.DS_Store']);
  entries = entries.filter(e => !skip.has(e.name)).sort((a,b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  let out = '';
  entries.forEach((e, i) => {
    const last   = i === entries.length - 1;
    const branch = last ? '└── ' : '├── ';
    const child  = last ? '    ' : '│   ';
    out += prefix + branch + e.name + (e.isDirectory() ? '/' : '') + '\n';
    if (e.isDirectory()) {
      out += buildTree(path.join(dirPath, e.name), depth + 1, maxDepth, prefix + child);
    }
  });
  return out;
}

function walkSync(dir) {
  const out = [];
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORE.has(e.name) || e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...walkSync(full));
      else if (CODE_EXTS.has(path.extname(e.name))) out.push(full);
    }
  } catch (_) {}
  return out;
}

function extractSigs(src, _filePath) {
  const sigs = [];
  const re1 = /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]{0,120})\)/gm;
  const re2 = /^export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]{0,80})\)\s*=>/gm;
  const re3 = /^(?:export\s+)?(?:default\s+)?function\s+([A-Za-z]\w+)\s*\(([^)]{0,80})\)/gm;
  for (const re of [re1, re2, re3]) {
    let m;
    while ((m = re.exec(src)) !== null) {
      if (!sigs.find(s => s.name === m[1])) {
        const icon = /^use[A-Z]/.test(m[1]) ? '🪝' : /^[A-Z]/.test(m[1]) ? '⚛' : 'ƒ';
        sigs.push({ name: m[1], sig: '(' + m[2].trim() + ')', icon });
      }
    }
  }
  return sigs;
}

module.exports = { buildTree, walkSync, extractSigs };
