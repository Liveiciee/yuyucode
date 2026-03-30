const fs = require('fs');
const path = require('path');

const inputFile = 'src/hooks/useAgentLoop.test.js';
const outputDir = 'test/hooks';

const content = fs.readFileSync(inputFile, 'utf8');

// Find the first top-level describe (line that starts with 'describe(')
const lines = content.split('\n');
let firstDescribeIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^describe\(/.test(lines[i])) {
    firstDescribeIndex = i;
    break;
  }
}
if (firstDescribeIndex === -1) throw new Error('No top-level describe found');

const header = lines.slice(0, firstDescribeIndex).join('\n');

// Find all top-level describe blocks using regex
const describeRegex = /^describe\(['"](.+?)['"],\s*\(\)\s*=>\s*\{/gm;
const describeStarts = [];
let match;
while ((match = describeRegex.exec(content)) !== null) {
  describeStarts.push({ index: match.index, name: match[1] });
}

// Find the closing brace for each describe
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

// Create output directory
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Write each describe block to its own file
for (let i = 0; i < describeStarts.length; i++) {
  const start = describeStarts[i].index;
  const end = endIndices[i];
  const describeBlock = content.slice(start, end);
  const describeName = describeStarts[i].name;
  const fileName = describeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.test.js';
  const fullPath = path.join(outputDir, fileName);
  const newContent = header + '\n\n' + describeBlock;
  fs.writeFileSync(fullPath, newContent);
  console.log(`Wrote ${fullPath}`);
}

console.log('Splitting complete.');
