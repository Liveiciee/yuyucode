// repomix.cjs
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { log } = require('./utils.cjs');

function tryRepomix(_spawnSync = spawnSync, _outFile, root = process.cwd(), yuyuDir = path.join(root, '.yuyu')) {
  const outFile = _outFile || path.join(yuyuDir, 'compressed-repomix.md');
  const isArm64 = process.arch === 'arm64' || process.arch === 'arm';
  const ignore  = [
    'android', 'dist', '.yuyu', 'coverage',
    '.gradle', 'build', 'public', '__snapshots__', 'node_modules', 'tmp', 'patch',
  ].join(',');

  log('  🔄 Trying repomix --compress...');

  try {
    const result = _spawnSync(
      'npx',
      [
        '--yes', 'repomix',
        '--compress',
        '--output', outFile,
        '--ignore', ignore,
      ],
      {
        cwd:      root,
        timeout:  isArm64 ? 120000 : 90000,
        stdio:    'pipe',
        encoding: 'utf8',
      }
    );

    if (result.error) {
      log(`  ⚠  repomix spawn error: ${result.error.message}`);
      return null;
    }
    if (result.status !== 0) {
      log(`  ⚠  repomix exited ${result.status}: ${(result.stderr || '').slice(0, 200)}`);
      return null;
    }
    if (!fs.existsSync(outFile)) {
      log('  ⚠  repomix succeeded but output file missing');
      return null;
    }

    const content = fs.readFileSync(outFile, 'utf8');
    log(`  ✅ repomix OK — ${Math.round(content.length / 1024)}KB`);
    return content;

  } catch (err) {
    log(`  ⚠  repomix threw: ${err.message}`);
    return null;
  }
}

module.exports = { tryRepomix };
