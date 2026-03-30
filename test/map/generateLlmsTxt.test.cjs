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
// generateLlmsTxt
// ─────────────────────────────────────────────────────────────────────────────
describe('generateLlmsTxt', () => {
  it('returns a string', () => {
    expect(typeof generateLlmsTxt({})).toBe('string');
  });

  it('includes project title and architecture overview', () => {
    const result = generateLlmsTxt({});
    expect(result).toContain('YuyuCode');
    expect(result).toContain('Architecture overview');
  });

  it('includes critical constraints section with correct vitest version', () => {
    const result = generateLlmsTxt({});
    expect(result).toContain('NEVER change without');
    expect(result).toContain('wasm-node');
    expect(result).toContain('vitest@3');
  });

  it('lists hot files (salience > 15)', () => {
    const fileData = {
      'src/hot.js': {
        rel: 'src/hot.js', lines: 50, salience: 20, importedBy: 3,
        syms: [{ name: 'hotFn' }, { name: 'hotFn2' }, { name: 'hotFn3' }, { name: 'hotFn4' }],
      },
      'src/cold.js': {
        rel: 'src/cold.js', lines: 10, salience: 5, importedBy: 0,
        syms: [{ name: 'coldFn' }],
      },
    };
    const result = generateLlmsTxt(fileData);
    expect(result).toContain('src/hot.js');
    expect(result).not.toContain('src/cold.js');
  });

  it('limits hot files to 10', () => {
    const fileData = {};
    for (let i = 0; i < 15; i++) {
      fileData[`src/file${i}.js`] = {
        rel: `src/file${i}.js`, lines: 50, salience: 20 + i, importedBy: 2,
        syms: [{ name: `fn${i}` }],
      };
    }
    const result = generateLlmsTxt(fileData);
    const matches = (result.match(/src\/file\d+\.js/g) || []);
    expect(matches.length).toBeLessThanOrEqual(10);
  });

  it('lists hooks section from hooks/ directory', () => {
    const fileData = {
      'src/hooks/useAgentLoop.js': {
        rel: 'src/hooks/useAgentLoop.js', lines: 100, salience: 5, importedBy: 1,
        syms: [{ name: 'useAgentLoop' }],
      },
    };
    const result = generateLlmsTxt(fileData);
    expect(result).toContain('## Hooks');
    expect(result).toContain('useAgentLoop.js');
  });

  it('lists components section from components/ directory', () => {
    const fileData = {
      'src/components/AppHeader.jsx': {
        rel: 'src/components/AppHeader.jsx', lines: 80, salience: 10, importedBy: 1,
        syms: [{ name: 'AppHeader' }],
      },
    };
    const result = generateLlmsTxt(fileData);
    expect(result).toContain('## Components');
    expect(result).toContain('AppHeader.jsx');
  });

  it('includes agent loop flow section', () => {
    const result = generateLlmsTxt({});
    expect(result).toContain('Agent loop flow');
    expect(result).toContain('gatherProjectContext');
  });

  it('includes generated timestamp', () => {
    const result = generateLlmsTxt({});
    expect(result).toMatch(/Generated: \d{4}-\d{2}-\d{2}/);
  });

  it('shows +N more when a file has more than 3 symbols', () => {
    const fileData = {
      'src/big.js': {
        rel: 'src/big.js', lines: 200, salience: 25, importedBy: 4,
        syms: [
          { name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' },
        ],
      },
    };
    const result = generateLlmsTxt(fileData);
    expect(result).toContain('+2 more');
  });

  it('includes yuyu-server index endpoint section', () => {
    const result = generateLlmsTxt({});
    expect(result).toContain('yuyu-server index endpoint');
    expect(result).toContain('callServer({ type: \'index\'');
  });
});
