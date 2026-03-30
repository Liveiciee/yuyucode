// index.cjs
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { IGNORE, CODE_EXTS, ALL_EXTS } = require('./config.cjs');
const { walkFiles, relPath, log, getChangedFiles } = require('./utils.cjs');
const { computeSalience } = require('./analysis.cjs');
const { generateMap } = require('./generators/map.cjs');
const { generateCompressed } = require('./generators/compressed.cjs');
const { generateLlmsTxt } = require('./generators/llms.cjs');
const { ensureHandoffTemplate } = require('./generators/handoff.cjs');
const { tryRepomix } = require('./repomix.cjs');

function main(_opts = {}) {
  const root       = _opts.root      || process.cwd();
  const yuyuDir    = _opts.yuyuDir   || path.join(root, '.yuyu');
  const _spawnSync = _opts.spawnSync || spawnSync;

  const VERBOSE       = process.argv.includes('--verbose');
  const COMPRESS_ONLY = process.argv.includes('--compress-only');
  const START_TIME    = Date.now();
  const START_MEM     = process.memoryUsage().rss;

  console.log('🗺  YuyuMap v3 starting...\n');

  if (!fs.existsSync(yuyuDir)) {
    fs.mkdirSync(yuyuDir, { recursive: true });
    console.log('  📁 Created .yuyu/');
  }

  const srcDir    = path.join(root, 'src');
  const rootFiles = fs.existsSync(root)
    ? fs.readdirSync(root).filter(f => CODE_EXTS.has(path.extname(f)) && !f.startsWith('.')).map(f => path.join(root, f))
    : [];

  const allFiles = [...walkFiles(srcDir, ALL_EXTS), ...rootFiles];
  log(`  Found ${allFiles.length} files`);

  // Incremental: if only a few files changed, skip unchanged files for salience
  const changedSet = _opts.incremental !== false ? getChangedFiles(root, _spawnSync) : null;
  if (changedSet) {
    const changedCount = allFiles.filter(f => changedSet.has(f)).length;
    log(`  ⚡ Incremental mode: ${changedCount}/${allFiles.length} files changed`);
    console.log(`  ⚡ Incremental: ${changedCount} file(s) changed`);
  }

  const fileData = computeSalience(allFiles);
  const count    = Object.keys(fileData).length;
  console.log(`  📊 Analyzed ${count} files`);

  // Generate compressed.md — repomix first, regex fallback if offline/unavailable
  const compPath = path.join(yuyuDir, 'compressed.md');
  let compressed;
  let compressedBy;

  const repomixOut = tryRepomix(_spawnSync, null, root, yuyuDir);
  if (repomixOut) {
    compressed   = repomixOut;
    compressedBy = 'repomix';
  } else {
    console.log('  ⚡ repomix unavailable — using regex fallback');
    compressed   = generateCompressed(fileData);
    compressedBy = 'regex';
  }

  fs.writeFileSync(compPath, compressed);
  const reductionMatch = compressed.match(/Total reduction: ~(\d+)%/);
  const reductionInfo  = reductionMatch ? ` — ${reductionMatch[1]}% token reduction` : '';
  console.log(`  🗜  .yuyu/compressed.md [${compressedBy}]${reductionInfo}`);

  if (!COMPRESS_ONLY) {
    // map.md
    const mapMd   = generateMap(fileData);
    const mapPath = path.join(yuyuDir, 'map.md');
    fs.writeFileSync(mapPath, mapMd);
    console.log(`  🗺  .yuyu/map.md — ${mapMd.split('\n').length} lines`);

    // llms.txt
    const llmsTxt  = generateLlmsTxt(fileData, root);
    const llmsPath = path.join(root, 'llms.txt');
    fs.writeFileSync(llmsPath, llmsTxt);
    console.log(`  📄 llms.txt — ${llmsTxt.split('\n').length} lines`);

    // handoff template
    ensureHandoffTemplate(yuyuDir);
  }

  const hot          = Object.values(fileData).filter(d => d.salience > 20).length;
  const totalSymbols = Object.values(fileData).reduce((n,d) => n + d.syms.length, 0);
  const endMem = process.memoryUsage().rss;
  const memUsed = Math.round((endMem - START_MEM) / 1024 / 1024);
  const elapsed = Math.round((Date.now() - START_TIME) / 1000);

  console.log(`\n✅ Done! (${elapsed}s, ${memUsed}MB memory)`);
  console.log(`   🔥 Hot files: ${hot} | ƒ Symbols: ${totalSymbols}`);
  
  // Dynamic hint — suggest commit message based on changed files
  try {
    const diff   = _spawnSync('git', ['diff', '--name-only', 'HEAD'],     { cwd: root, encoding: 'utf8', timeout: 3000, stdio: 'pipe' });
    const staged = _spawnSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8', timeout: 3000, stdio: 'pipe' });
    const changed = [...new Set([
      ...(diff.stdout   || '').trim().split('\n'),
      ...(staged.stdout || '').trim().split('\n'),
    ])].filter(Boolean);
    if (changed.length > 0) {
      const names = changed.map(f => f.split('/').pop().replace(/\.[^.]+$/, ''));
      const scope = changed.length === 1 ? names[0]
        : changed.length <= 3           ? names.join(', ')
        : `${changed.length} files`;
      console.log(`\n💡 Next: node yugit.cjs "feat: update ${scope}"`);
    } else {
      console.log(`\n💡 Next: node yugit.cjs "chore: regenerate map"`);
    }
  } catch {
    console.log(`\n💡 Next: node yugit.cjs "chore: update map"`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  walkFiles,
  getChangedFiles,
  extractSymbols: require('./extractors/symbols.cjs').extractSymbols,
  compressSource: require('./extractors/compress.cjs').compressSource,
  extractImports: require('./extractors/imports.cjs').extractImports,
  computeSalience,
  generateMap,
  generateCompressed,
  generateLlmsTxt,
  ensureHandoffTemplate,
  tryRepomix,
  main,
};
