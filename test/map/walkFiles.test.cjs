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
// walkFiles
// ─────────────────────────────────────────────────────────────────────────────
describe('walkFiles', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-walk-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns empty array for empty dir', () => {
    const exts = new Set(['.js']);
    expect(walkFiles(tmpDir, exts)).toEqual([]);
  });

  it('returns empty array for non-existent dir', () => {
    expect(walkFiles('/nonexistent/path/xyz', new Set(['.js']))).toEqual([]);
  });

  it('finds files matching extension', () => {
    fs.writeFileSync(path.join(tmpDir, 'app.js'), 'const x = 1;');
    fs.writeFileSync(path.join(tmpDir, 'style.css'), 'body{}');
    const results = walkFiles(tmpDir, new Set(['.js']));
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('app.js');
  });

  it('recurses into subdirectories', () => {
    fs.mkdirSync(path.join(tmpDir, 'src'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils.js'), '');
    const results = walkFiles(tmpDir, new Set(['.js']));
    expect(results.some(f => f.includes('utils.js'))).toBe(true);
  });

  it('skips node_modules and .git', () => {
    fs.mkdirSync(path.join(tmpDir, 'node_modules'));
    fs.writeFileSync(path.join(tmpDir, 'node_modules', 'evil.js'), '');
    fs.mkdirSync(path.join(tmpDir, '.git'));
    fs.writeFileSync(path.join(tmpDir, '.git', 'config'), '');
    const results = walkFiles(tmpDir, new Set(['.js']));
    expect(results).toHaveLength(0);
  });

  it('skips dot-files', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'SECRET=123');
    const results = walkFiles(tmpDir, new Set(['.env']));
    expect(results).toHaveLength(0);
  });
});
