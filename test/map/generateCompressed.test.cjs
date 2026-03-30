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
// generateCompressed
// ─────────────────────────────────────────────────────────────────────────────
describe('generateCompressed', () => {
  it('returns a markdown string with header', () => {
    const result = generateCompressed({});
    expect(typeof result).toBe('string');
    expect(result).toContain('# YuyuCode');
  });

  it('includes compressed source per file', () => {
    const fileData = {
      'src/utils.js': {
        rel: 'src/utils.js',
        lines: 10,
        salience: 15,
        src: 'export function doThing(x) {\n  return x * 2;\n}\n',
      },
    };
    const result = generateCompressed(fileData);
    expect(result).toContain('utils.js');
    expect(result).toContain('doThing');
  });

  it('skips files with <= 5 lines', () => {
    const fileData = {
      'tiny.js': {
        rel: 'tiny.js',
        lines: 3,
        salience: 5,
        src: 'const x = 1;\n',
      },
    };
    const result = generateCompressed(fileData);
    expect(result).not.toContain('tiny.js');
  });

  it('includes total reduction stat in header', () => {
    const fileData = {
      'src/big.js': {
        rel: 'src/big.js',
        lines: 100,
        salience: 20,
        src: Array.from({ length: 100 }, (_, i) => `export function fn${i}() { const x = ${i}; return x; }`).join('\n'),
      },
    };
    const result = generateCompressed(fileData);
    expect(result).toMatch(/Total reduction: ~\d+%/);
  });

  it('shows per-file reduction percentage', () => {
    const fileData = {
      'src/utils.js': {
        rel: 'src/utils.js',
        lines: 10,
        salience: 15,
        src: 'export function longFn() {\n  const a = 1;\n  const b = 2;\n  const c = 3;\n  return a + b + c;\n}\n',
      },
    };
    const result = generateCompressed(fileData);
    expect(result).toMatch(/\d+% reduction/);
  });
});
