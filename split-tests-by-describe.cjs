const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputBase = process.argv[3] || 'test';

if (!inputFile) {
  console.error('Usage: node split-tests-by-describe.cjs <input-file> [output-base-dir]');
  process.exit(1);
}

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

// Find first describe
let firstDescribeIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^describe\(/.test(lines[i])) {
    firstDescribeIndex = i;
    break;
  }
}
if (firstDescribeIndex === -1) {
  console.log(`No describe found in ${inputFile}, skipping.`);
  process.exit(0);
}

const header = lines.slice(0, firstDescribeIndex).join('\n');

const describeRegex = /^describe\(['"](.+?)['"],\s*\(\)\s*=>\s*\{/gm;
const describeStarts = [];
let match;
while ((match = describeRegex.exec(content)) !== null) {
  describeStarts.push({ index: match.index, name: match[1] });
}

// Find closing braces
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

// Determine output directory: mirror src path under outputBase
const relativePath = path.relative('src', inputFile).replace(/\.test\.js$/, '');
const outDir = path.join(outputBase, path.dirname(relativePath));
fs.mkdirSync(outDir, { recursive: true });

// Write each describe block
for (let i = 0; i < describeStarts.length; i++) {
  const start = describeStarts[i].index;
  const end = endIndices[i];
  const describeBlock = content.slice(start, end);
  const describeName = describeStarts[i].name;
  const fileName = describeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.test.js';
  const fullPath = path.join(outDir, fileName);
  const newContent = header + '\n\n' + describeBlock;
  fs.writeFileSync(fullPath, newContent);
  console.log(`Wrote ${fullPath}`);
}

console.log(`Split ${inputFile} into ${describeStarts.length} files.`);
