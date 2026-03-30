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
// main() — integration tests
// ─────────────────────────────────────────────────────────────────────────────
describe('main()', () => {
  let tmpDir;
  let yuyuDir;
  const fastSpawn = vi.fn(() => ({ error: new Error('offline'), status: null, stderr: '' }));

  beforeEach(() => {
    tmpDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-main-'));
    yuyuDir = path.join(tmpDir, '.yuyu');
    fs.mkdirSync(yuyuDir, { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('runs without throwing on empty project', () => {
    expect(() => main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn })).not.toThrow();
  });

  it('creates .yuyu/compressed.md', () => {
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(path.join(yuyuDir, 'compressed.md'))).toBe(true);
  });

  it('creates .yuyu/map.md', () => {
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(path.join(yuyuDir, 'map.md'))).toBe(true);
  });

  it('creates llms.txt in root', () => {
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(path.join(tmpDir, 'llms.txt'))).toBe(true);
  });

  it('creates .yuyu/handoff.md if missing', () => {
    const handoffPath = path.join(yuyuDir, 'handoff.md');
    expect(fs.existsSync(handoffPath)).toBe(false);
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(handoffPath)).toBe(true);
  });

  it('does NOT overwrite existing handoff.md', () => {
    const handoffPath = path.join(yuyuDir, 'handoff.md');
    const custom = '# My session notes';
    fs.writeFileSync(handoffPath, custom);
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.readFileSync(handoffPath, 'utf8')).toBe(custom);
  });

  it('map.md contains file entries when src has JS files', () => {
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils.js'), [
      'export function helper(x) { return x; }',
      'export const FOO = 42;',
    ].join('\n'));
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    const mapContent = fs.readFileSync(path.join(yuyuDir, 'map.md'), 'utf8');
    expect(mapContent).toContain('utils.js');
    expect(mapContent).toContain('helper');
  });

  it('handles a project with hooks/ directory', () => {
    fs.mkdirSync(path.join(tmpDir, 'src', 'hooks'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'hooks', 'useCounter.js'),
      'export function useCounter(initial) { return initial; }\n'
    );
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    const mapContent = fs.readFileSync(path.join(yuyuDir, 'map.md'), 'utf8');
    expect(mapContent).toContain('useCounter');
  });

  it('uses repomix output when tryRepomix succeeds', () => {
    const repomixContent = '# Repomix compressed output\nsome content here\n';
    const repomixSpawn = vi.fn((_cmd, _args) => {
      const outIdx = (_args || []).indexOf('--output');
      if (outIdx !== -1 && _args[outIdx + 1]) {
        const outFile = _args[outIdx + 1];
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, repomixContent);
      }
      return { error: null, status: 0, stderr: '' };
    });
    main({ root: tmpDir, yuyuDir, spawnSync: repomixSpawn });
    const compressed = fs.readFileSync(path.join(yuyuDir, 'compressed.md'), 'utf8');
    expect(compressed).toBe(repomixContent);
  });
});
