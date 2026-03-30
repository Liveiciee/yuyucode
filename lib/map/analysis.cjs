// analysis.cjs
const fs = require('fs');
const { relPath, log } = require('./utils.cjs');
const { extractSymbols } = require('./extractors/symbols.cjs');
const { extractImports } = require('./extractors/imports.cjs');

function computeSalience(files) {
  const importCount = {};
  const fileData    = {};

  for (const f of files) {
    try {
      const src  = fs.readFileSync(f, 'utf8');
      const rel  = relPath(f);
      const syms = extractSymbols(src, f);
      const deps = extractImports(src);
      const lines = src.split('\n').length;
      fileData[rel] = { src, syms, deps, lines, rel };
    } catch (e) {
      log(`  ⚠️  Skipping ${f}: ${e.message}`);
    }
  }

  // Build import graph — count how many files import each file
  for (const [, d] of Object.entries(fileData)) {
    for (const dep of d.deps) {
      for (const key of Object.keys(fileData)) {
        const base = key.replace(/\.(jsx?|tsx?)$/, '').split('/').pop();
        if (dep === base || dep.endsWith('/' + base)) {
          importCount[key] = (importCount[key] || 0) + 1;
        }
      }
    }
  }

  for (const [rel, d] of Object.entries(fileData)) {
    const importedBy = importCount[rel] || 0;
    d.salience   = (importedBy * 3) + d.syms.length + Math.round(1000 / Math.max(d.lines, 1));
    d.importedBy = importedBy;
  }

  return fileData;
}

module.exports = { computeSalience };
