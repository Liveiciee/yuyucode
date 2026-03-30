const fs = require('fs');
const path = require('path');

const inputFile = 'src/hooks/useAgentLoop.branch.test.js';
const outputDir = 'test/hooks';
const helperFile = path.join(outputDir, '_helpers.js');

// Read the entire test file
const content = fs.readFileSync(inputFile, 'utf8');

// Extract the mock/import section (everything before the first describe)
const lines = content.split('\n');
let firstDescribeIndex = lines.findIndex(l => l.trim().startsWith('describe('));
if (firstDescribeIndex === -1) throw new Error('No describe found');

const header = lines.slice(0, firstDescribeIndex).join('\n');

// Write the shared helper file
// We'll move the helpers (makeProject, makeChat, etc.) into it
// Also include the mocks, but note they need to be hoisted; we'll keep them in each test file for simplicity.
// Actually, to avoid duplication, we'll create a file that exports the helpers and also sets up the mocks.
// But since the mocks are vi.hoisted and must be defined before the tests, we'll keep them in each test file.
// Instead, we'll export only the helper functions and let each test file import them.

// Let's extract the helper functions (makeProject, makeChat, makeFile, makeCtx)
const helperFuncs = {};
const helperStart = lines.findIndex(l => l.includes('function makeProject('));
if (helperStart === -1) throw new Error('No helper functions found');

// Find the end of the last helper (after makeCtx)
let helperEnd = helperStart;
let braceCount = 0;
for (let i = helperStart; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('{')) braceCount++;
  if (line.includes('}')) braceCount--;
  if (braceCount === 0 && i > helperStart && line.trim() === '}') {
    helperEnd = i;
    break;
  }
}
const helpersCode = lines.slice(helperStart, helperEnd + 1).join('\n');

// Also extract the beforeAll/beforeEach? The file has a beforeEach that sets up mocks.
// We'll keep that in each test file as well.

// Write helper file
fs.writeFileSync(helperFile, `// Shared helpers for useAgentLoop tests
${helpersCode}
`);
console.log(`Wrote ${helperFile}`);

// Now split by describe blocks
const describeRegex = /^(\s*)describe\(['"](.+?)['"],\s*\(\)\s*=>\s*\{/gm;
const describeStarts = [];
let match;
while ((match = describeRegex.exec(content)) !== null) {
  describeStarts.push({ index: match.index, name: match[2], indent: match[1] });
}

// Find end indices
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
  const fileName = describeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.test.js';
  const fullPath = path.join(outputDir, fileName);

  // Create the new file content
  const newContent = `// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgentLoop } from '../../../src/hooks/useAgentLoop.js';
import { makeProject, makeChat, makeFile, makeCtx } from './_helpers.js';

// Mock API and utils
const mockAskCerebrasStream = vi.hoisted(() => vi.fn());
const mockCallServer        = vi.hoisted(() => vi.fn());
const mockParseActions      = vi.hoisted(() => vi.fn());
const mockExecuteAction     = vi.hoisted(() => vi.fn());
const mockRunHooksV2        = vi.hoisted(() => vi.fn());
const mockCheckPermission   = vi.hoisted(() => vi.fn());
const mockTokenTracker      = vi.hoisted(() => ({ record: vi.fn() }));
const mockTfidfRank         = vi.hoisted(() => vi.fn());
const mockSelectSkills      = vi.hoisted(() => vi.fn());
const mockGenerateDiff      = vi.hoisted(() => vi.fn());
const mockResolvePath       = vi.hoisted(() => vi.fn((base, p) => base + '/' + p));

vi.mock('../../../src/api.js', () => ({
  askCerebrasStream: mockAskCerebrasStream,
  callServer: mockCallServer,
}));
vi.mock('../../../src/utils.js', () => ({
  parseActions: mockParseActions,
  executeAction: mockExecuteAction,
  resolvePath: mockResolvePath,
  generateDiff: mockGenerateDiff,
}));
vi.mock('../../../src/features.js', () => ({
  runHooksV2:      mockRunHooksV2,
  checkPermission: mockCheckPermission,
  tokenTracker:    mockTokenTracker,
  tfidfRank:       mockTfidfRank,
  selectSkills:    mockSelectSkills,
  parseElicitation: vi.fn().mockReturnValue(null),
}));
vi.mock('../../../src/constants.js', () => ({
  getSystemForModel: vi.fn().mockReturnValue('SYSTEM '),
  BASE_SYSTEM:          'BASE ',
  AUTO_COMPACT_CHARS:   80000,
  AUTO_COMPACT_MIN_MSG: 12,
  MAX_FILE_PREVIEW:     2000,
  MAX_SKILL_PREVIEW:    6000,
  CONTEXT_RECENT_KEEP:  6,
  VISION_MODEL:         'vision-model',
  FALLBACK_MODEL:       'fallback-model',
  MODELS:               [{ id: 'qwen-3-235b', label: 'Qwen', provider: 'cerebras' }],
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockImplementation(({ type } = {}) =>
    Promise.resolve(type === 'ping' ? { ok: true } : { ok: false, data: '' })
  );
  mockAskCerebrasStream.mockResolvedValue('AI reply');
  mockParseActions.mockReturnValue([]);
  mockExecuteAction.mockResolvedValue({ ok: true, data: 'done' });
  mockRunHooksV2.mockResolvedValue(undefined);
  mockCheckPermission.mockReturnValue(true);
  mockTfidfRank.mockReturnValue([]);
  mockSelectSkills.mockReturnValue([]);
  mockGenerateDiff.mockReturnValue('diff');
});

${describeBlock}
`;
  fs.writeFileSync(fullPath, newContent);
  console.log(`Wrote ${fullPath}`);
}

console.log('Splitting complete.');
