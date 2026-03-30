// map.cjs
function generateMap(fileData) {
  const entries = Object.entries(fileData).sort(([,a],[,b]) => b.salience - a.salience);
  const lines   = [
    '# YuyuCode — Codebase Map',
    `> Generated: ${new Date().toISOString()}`,
    `> Files: ${entries.length} | Symbols: ${entries.reduce((n,[,d])=>n+d.syms.length,0)}`,
    '',
    '---',
    '',
  ];

  for (const [rel, d] of entries) {
    if (d.syms.length === 0 && d.lines < 10) continue;
    const badge = d.salience > 20 ? '🔥' : d.salience > 10 ? '⭐' : '·';
    lines.push(`## ${badge} \`${rel}\` _(${d.lines}L, salience:${d.salience})_`);
    if (d.importedBy > 0) lines.push(`> imported by ${d.importedBy} file(s)`);
    for (const s of d.syms) {
      const icon = s.type === 'component' ? '⚛' : s.type === 'hook' ? '🪝' : s.type === 'fn' ? 'ƒ' : '◆';
      lines.push(`- ${icon} \`${s.name}${s.sig}\``);
    }
    lines.push('');
  }
  return lines.join('\n');
}

module.exports = { generateMap };
