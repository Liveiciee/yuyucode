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
// ensureHandoffTemplate
// ─────────────────────────────────────────────────────────────────────────────
describe('ensureHandoffTemplate', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-handoff-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates handoff.md when it does not exist', () => {
    ensureHandoffTemplate(tmpDir);
    expect(fs.existsSync(path.join(tmpDir, 'handoff.md'))).toBe(true);
  });

  it('created file contains required sections', () => {
    ensureHandoffTemplate(tmpDir);
    const content = fs.readFileSync(path.join(tmpDir, 'handoff.md'), 'utf8');
    expect(content).toContain('Session Handoff');
    expect(content).toContain('Completed this session');
    expect(content).toContain('In progress');
    expect(content).toContain('Known issues');
    expect(content).toContain('Next session priorities');
  });

  it('does NOT overwrite existing handoff.md', () => {
    const handoffPath = path.join(tmpDir, 'handoff.md');
    const existing = '# My custom handoff\nCustom content here.';
    fs.writeFileSync(handoffPath, existing);

    ensureHandoffTemplate(tmpDir);

    const content = fs.readFileSync(handoffPath, 'utf8');
    expect(content).toBe(existing);
  });

  it('created file includes todays date', () => {
    ensureHandoffTemplate(tmpDir);
    const content = fs.readFileSync(path.join(tmpDir, 'handoff.md'), 'utf8');
    const today = new Date().toISOString().split('T')[0];
    expect(content).toContain(today);
  });

  it('is idempotent — calling twice does not throw', () => {
    expect(() => {
      ensureHandoffTemplate(tmpDir);
      ensureHandoffTemplate(tmpDir);
    }).not.toThrow();
  });
});
