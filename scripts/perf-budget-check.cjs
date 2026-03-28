#!/usr/bin/env node
/**
 * Performance budget gate for mobile release confidence.
 * Reads built JS assets in dist/assets and fails when hard limits are exceeded.
 */
const fs = require('fs');
const path = require('path');

const DIST_ASSETS = path.resolve(__dirname, '..', 'dist', 'assets');
const MB = 1024 * 1024;
const KB = 1024;

const BUDGETS = Object.freeze({
  maxTotalJsBytes: 6.5 * MB,
  maxLargestChunkBytes: 4.7 * MB,
  maxCodemirrorChunkBytes: 4.6 * MB,
});

function formatSize(bytes) {
  return bytes > MB ? `${(bytes / MB).toFixed(2)} MB` : `${(bytes / KB).toFixed(1)} KB`;
}

function readJsFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Build artifacts not found: ${dir}. Run npm run build first.`);
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => {
      const abs = path.join(dir, name);
      return {
        name,
        bytes: fs.statSync(abs).size,
      };
    });
}

function assertBudget(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const files = readJsFiles(DIST_ASSETS);
  const totalJsBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  const largest = files.reduce((acc, file) => (file.bytes > acc.bytes ? file : acc), files[0]);
  const codemirror = files.find((file) => file.name.startsWith('codemirror-'));

  assertBudget(totalJsBytes <= BUDGETS.maxTotalJsBytes, `Total JS too large: ${formatSize(totalJsBytes)} > ${formatSize(BUDGETS.maxTotalJsBytes)}`);
  assertBudget(largest.bytes <= BUDGETS.maxLargestChunkBytes, `Largest JS chunk too large: ${largest.name} (${formatSize(largest.bytes)}) > ${formatSize(BUDGETS.maxLargestChunkBytes)}`);
  if (codemirror) {
    assertBudget(codemirror.bytes <= BUDGETS.maxCodemirrorChunkBytes, `CodeMirror chunk too large: ${formatSize(codemirror.bytes)} > ${formatSize(BUDGETS.maxCodemirrorChunkBytes)}`);
  }

  console.log(`✅ Perf budget OK: total=${formatSize(totalJsBytes)}, largest=${largest.name}:${formatSize(largest.bytes)}${codemirror ? `, codemirror=${formatSize(codemirror.bytes)}` : ''}`);
}

main();
