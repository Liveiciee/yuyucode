const fs = require('fs');
const path = require('path');

const inputFile = 'src/editor.bench.js';
const outputDir = 'test/bench';
const helperFile = path.join(outputDir, '_helpers.js');

// Read the entire benchmark file
const content = fs.readFileSync(inputFile, 'utf8');

// Extract helper functions (everything before the first describe)
const lines = content.split('\n');
let firstDescribeIndex = lines.findIndex(l => /^describe\(/.test(l));
if (firstDescribeIndex === -1) throw new Error('No describe found');

const helpers = lines.slice(0, firstDescribeIndex).join('\n');
const rest = lines.slice(firstDescribeIndex).join('\n');

// Create output directory
fs.mkdirSync(outputDir, { recursive: true });

// Write the helpers file (with import adjustments)
let helperContent = helpers;
// Replace the imports that might reference local files – keep them as is
// Also ensure we export the functions for use in the test files
helperContent = helperContent.replace(
  /import \{ generateDiff, parseActions \} from '\.\/utils\.js';/,
  `import { generateDiff, parseActions } from '../../../src/utils.js';`
);
helperContent = helperContent.replace(
  /import \{\n  extractSymbols,\n  compressSource,\n  extractImports,\n  computeSalience,\n\} from '\.\.\/yuyu-map\.cjs';/,
  `import {\n  extractSymbols,\n  compressSource,\n  extractImports,\n  computeSalience,\n} from '../../../yuyu-map.cjs';`
);
fs.writeFileSync(helperFile, helperContent);
console.log(`Wrote ${helperFile}`);

// Now find all top-level describe blocks
const describeRegex = /^describe\(['"](.+?)['"],\s*\(\)\s*=>\s*\{/gm;
const describeStarts = [];
let match;
while ((match = describeRegex.exec(content)) !== null) {
  describeStarts.push({ index: match.index, name: match[1] });
}

// Find end indices for each describe block
const endIndices = [];
for (let i = 0; i < describeStarts.length; i++) {
  let braceCount = 0;
  let endIndex = describeStarts[i].index;
  const startLine = content.indexOf('{', describeStarts[i].index);
  for (let j = startLine; j < content.length; j++) {
    if (content[j] === '{') braceCount++;
    if (content[j] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = j + 1;
        break;
      }
    }
  }
  endIndices.push(endIndex);
}

// Write each describe block to its own file
for (let i = 0; i < describeStarts.length; i++) {
  const start = describeStarts[i].index;
  const end = endIndices[i];
  const describeBlock = content.slice(start, end);
  const describeName = describeStarts[i].name;
  // Generate a safe filename: lowercase, replace spaces and special chars
  const fileName = describeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.bench.js';
  const fullPath = path.join(outputDir, fileName);

  // The new file content includes the helpers import and the describe block
  const newContent = `// @vitest-environment node
import { describe, bench } from 'vitest';
import {
  getLangExt,
  isEmmetLang,
  isTsLang,
  buildSrcdoc,
  generateDiff,
  parseActions,
  extractSymbols,
  compressSource,
  extractImports,
  computeSalience,
} from './_helpers.js';

// Fixtures (keep them defined per file to avoid cross-contamination)
${describeBlock}
`;
  fs.writeFileSync(fullPath, newContent);
  console.log(`Wrote ${fullPath}`);
}

console.log('Splitting complete.');
