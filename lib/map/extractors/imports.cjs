// imports.cjs
function extractImports(src) {
  const deps = new Set();
  
  const reStatic = /(?:import|require)\s+.*?['"]([^'"]+)['"]/g;
  const reDynamic = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  let m;
  while ((m = reStatic.exec(src)) !== null) {
    const imp = m[1];
    if (!imp.startsWith('.')) deps.add(imp.split('/')[0]);
  }
  while ((m = reDynamic.exec(src)) !== null) {
    const imp = m[1];
    if (!imp.startsWith('.')) deps.add(imp.split('/')[0]);
  }
  return [...deps];
}

module.exports = { extractImports };
