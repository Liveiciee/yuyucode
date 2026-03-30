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
// generateMap
// ─────────────────────────────────────────────────────────────────────────────
describe('generateMap', () => {
  it('returns a markdown string', () => {
    const fileData = {};
    const result = generateMap(fileData);
    expect(typeof result).toBe('string');
    expect(result).toContain('# YuyuCode');
  });

  it('includes file entries with symbols', () => {
    const fileData = {
      'src/utils.js': {
        rel: 'src/utils.js',
        lines: 50,
        salience: 25,
        importedBy: 3,
        syms: [{ type: 'fn', name: 'parseActions', sig: '(text)' }],
      },
    };
    const result = generateMap(fileData);
    expect(result).toContain('utils.js');
    expect(result).toContain('parseActions');
  });

  it('sorts by salience descending', () => {
    const fileData = {
      'low.js':  { rel: 'low.js',  lines: 10, salience: 5,  importedBy: 0, syms: [{ type: 'fn', name: 'low', sig: '' }] },
      'high.js': { rel: 'high.js', lines: 10, salience: 30, importedBy: 5, syms: [{ type: 'fn', name: 'high', sig: '' }] },
    };
    const result = generateMap(fileData);
    const highIdx = result.indexOf('high.js');
    const lowIdx  = result.indexOf('low.js');
    expect(highIdx).toBeLessThan(lowIdx);
  });

  it('skips files with no symbols and <10 lines', () => {
    const fileData = {
      'tiny.js': { rel: 'tiny.js', lines: 5, salience: 1, importedBy: 0, syms: [] },
    };
    const result = generateMap(fileData);
    expect(result).not.toContain('tiny.js');
  });

  it('uses 🔥 badge for salience > 20', () => {
    const fileData = {
      'hot.js': { rel: 'hot.js', lines: 100, salience: 25, importedBy: 5, syms: [{ type: 'fn', name: 'hot', sig: '' }] },
    };
    expect(generateMap(fileData)).toContain('🔥');
  });

  it('uses ⭐ badge for salience 11-20', () => {
    const fileData = {
      'medium.js': { rel: 'medium.js', lines: 50, salience: 15, importedBy: 2, syms: [{ type: 'fn', name: 'med', sig: '' }] },
    };
    expect(generateMap(fileData)).toContain('⭐');
  });

  it('shows imported by count when >0', () => {
    const fileData = {
      'imported.js': { rel: 'imported.js', lines: 20, salience: 10, importedBy: 3, syms: [{ type: 'fn', name: 'fn', sig: '' }] },
    };
    const result = generateMap(fileData);
    expect(result).toContain('imported by 3 file(s)');
  });
});
