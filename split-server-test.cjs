const fs = require('fs');
const path = require('path');

const inputFile = 'yuyu-server.test.cjs';
const outputDir = 'test/server';

const content = fs.readFileSync(inputFile, 'utf8');

// Extract the server setup and helpers (everything before the first describe)
const lines = content.split('\n');
let firstDescribeIndex = lines.findIndex(l => /^describe\(/.test(l));
if (firstDescribeIndex === -1) throw new Error('No describe found');

const header = lines.slice(0, firstDescribeIndex).join('\n');

// Create output directory
fs.mkdirSync(outputDir, { recursive: true });

// Find all top-level describe blocks
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
  const fileName = describeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.test.cjs';
  const fullPath = path.join(outputDir, fileName);

  // Each file gets its own copy of the server setup (so it can run independently)
  const newContent = header + '\n\n' + describeBlock;
  fs.writeFileSync(fullPath, newContent);
  console.log(`Wrote ${fullPath}`);
}

console.log('Splitting complete.');
