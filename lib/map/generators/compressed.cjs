// compressed.cjs
const path = require('path');
const { CODE_EXTS } = require('../config.cjs');
const { compressSource } = require('../extractors/compress.cjs');

function generateCompressed(fileData) {
  const entries = Object.entries(fileData)
    .filter(([,d]) => CODE_EXTS.has(path.extname(d.rel)) && d.lines > 5)
    .sort(([,a],[,b]) => b.salience - a.salience);

  const sections = [
    '# YuyuCode — Compressed Source',
    `> Generated: ${new Date().toISOString()}`,
    `> Repomix-style: function bodies stripped, signatures preserved (~70% token reduction)`,
    '',
    '---',
    '',
  ];

  let originalTokens   = 0;
  let compressedTokens = 0;

  for (const [rel, d] of entries) {
    const compressed  = compressSource(d.src, d.rel);
    const origLen     = d.src.length;
    const compLen     = compressed.length;
    originalTokens   += origLen;
    compressedTokens += compLen;
    const reduction   = Math.round((1 - compLen / origLen) * 100);

    sections.push(`## \`${rel}\` _(${d.lines}L → ${compressed.split('\n').length}L, ${reduction}% reduction)_`);
    sections.push('```' + (path.extname(rel).slice(1) || 'js'));
    sections.push(compressed.trim());
    sections.push('```');
    sections.push('');
  }

  const totalReduction = Math.round((1 - compressedTokens / originalTokens) * 100);
  sections.unshift(`> Total reduction: ~${totalReduction}% (${Math.round(originalTokens/1000)}K → ${Math.round(compressedTokens/1000)}K chars)\n`);

  return sections.join('\n');
}

module.exports = { generateCompressed };
