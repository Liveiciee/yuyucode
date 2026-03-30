// @vitest-environment node
// globals: true — vi, describe, it, expect, beforeEach, afterEach injected by vitest

const fs   = require('fs');
const path = require('path');
const os = require('os');

const _yuyuMap = require('../../yuyu-map.cjs');
const extractSymbols      = _yuyuMap.extractSymbols;
const compressSource      = _yuyuMap.compressSource;
const extractImports      = _yuyuMap.extractImports;
const computeSalience     = _yuyuMap.computeSalience;
const walkFiles           = _yuyuMap.walkFiles;
const generateMap         = _yuyuMap.generateMap;
const generateCompressed  = _yuyuMap.generateCompressed;
const generateLlmsTxt     = _yuyuMap.generateLlmsTxt;
const ensureHandoffTemplate = _yuyuMap.ensureHandoffTemplate;
const getChangedFiles     = _yuyuMap.getChangedFiles;
const tryRepomix          = _yuyuMap.tryRepomix;
const main                = _yuyuMap.main;

// ─────────────────────────────────────────────────────────────────────────────
// computeSalience
// ─────────────────────────────────────────────────────────────────────────────
describe('computeSalience', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-sal-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns object keyed by relative path', () => {
    const f = path.join(tmpDir, 'utils.js');
    fs.writeFileSync(f, 'export function foo() {}');
    const result = computeSalience([f]);
    expect(Object.keys(result).length).toBe(1);
  });

  it('each entry has salience, syms, lines fields', () => {
    const f = path.join(tmpDir, 'utils.js');
    fs.writeFileSync(f, 'export function bar(x) { return x; }\n');
    const result = computeSalience([f]);
    const entry = Object.values(result)[0];
    expect(entry).toHaveProperty('salience');
    expect(entry).toHaveProperty('syms');
    expect(entry).toHaveProperty('lines');
    expect(entry.lines).toBeGreaterThan(0);
  });

  it('file imported by many others gets higher salience', () => {
    const utils = path.join(tmpDir, 'utils.js');
    const a = path.join(tmpDir, 'a.js');
    const b = path.join(tmpDir, 'b.js');

    fs.writeFileSync(utils, "export function helper() {}");
    fs.writeFileSync(a, "import { helper } from './utils.js';\nconst x = 1;");
    fs.writeFileSync(b, "import { helper } from './utils.js';\nconst y = 2;");

    const result = computeSalience([utils, a, b]);
    const utilsEntry = Object.values(result).find(d => d.rel.includes('utils'));
    const aEntry     = Object.values(result).find(d => d.rel.includes('/a.'));
    expect(utilsEntry.salience).toBeGreaterThan(aEntry.salience);
  });

  it('handles unreadable file gracefully (skip)', () => {
    expect(() => computeSalience(['/nonexistent/file.js'])).not.toThrow();
  });
});
