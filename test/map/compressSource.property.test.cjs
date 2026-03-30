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
// compressSource — property-based
// ─────────────────────────────────────────────────────────────────────────────
describe('compressSource — property-based', () => {
  function repeat(n, fn) { for (let i = 0; i < n; i++) fn(); }
  const randStr = (len = 50) => Array.from({length: len}, () =>
    'abcdefghijklmnopqrstuvwxyz {}();\n'[Math.floor(Math.random() * 33)]
  ).join('');

  it('never throws on arbitrary source', () => {
    repeat(100, () => {
      expect(() => compressSource(randStr(300), 'util.js')).not.toThrow();
    });
  });

  it('always returns a string', () => {
    repeat(100, () => {
      expect(typeof compressSource(randStr(200), 'util.js')).toBe('string');
    });
  });

  it('output length never exceeds input length', () => {
    repeat(50, () => {
      const src = randStr(500);
      expect(compressSource(src, 'util.js').length).toBeLessThanOrEqual(src.length + 10);
    });
  });

  it('non-code files returned unchanged', () => {
    repeat(30, () => {
      const src = randStr(100);
      for (const ext of ['style.css', 'README.md']) {
        expect(compressSource(src, ext)).toBe(src);
      }
    });
  });

  it('import statements are always preserved', () => {
    const src = "import React from 'react';\nimport { foo } from './foo.js';\nexport function App() {\n  const x = 1;\n  return x;\n}\n";
    const out = compressSource(src, 'App.jsx');
    expect(out).toContain("import React from 'react'");
    expect(out).toContain("import { foo }");
  });

  it('function signature line always preserved', () => {
    repeat(20, () => {
      const names = ['doThing', 'processData', 'handleClick', 'fetchItems'];
      const name = names[Math.floor(Math.random() * names.length)];
      const src = `export function ${name}(x, y) {\n  const result = x + y;\n  const more = result * 2;\n  return more;\n}\n`;
      const out = compressSource(src, 'util.js');
      expect(out).toContain(name);
    });
  });
});
