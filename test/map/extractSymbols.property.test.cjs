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
// extractSymbols — property-based
// ─────────────────────────────────────────────────────────────────────────────
describe('extractSymbols — property-based', () => {
  function repeat(n, fn) { for (let i = 0; i < n; i++) fn(); }
  const randStr = (len = 20) => Array.from({length: len}, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 (){};=>\n'[
      Math.floor(Math.random() * 70)
    ]).join('');

  it('never throws on arbitrary JS source', () => {
    repeat(100, () => {
      expect(() => extractSymbols(randStr(200), 'test.js')).not.toThrow();
    });
  });

  it('always returns an array', () => {
    repeat(100, () => {
      expect(Array.isArray(extractSymbols(randStr(200), 'test.js'))).toBe(true);
    });
  });

  it('always returns empty array for non-code extensions', () => {
    repeat(50, () => {
      for (const ext of ['style.css', 'README.md', 'data.json', 'config.yml']) {
        expect(extractSymbols(randStr(100), ext)).toEqual([]);
      }
    });
  });

  it('no duplicate names in result', () => {
    repeat(50, () => {
      const src = randStr(300);
      const syms = extractSymbols(src, 'util.js');
      const names = syms.map(s => s.name);
      expect(names.length).toBe(new Set(names).size);
    });
  });

  it('every symbol has name, type, and sig fields', () => {
    const src = [
      'export function foo(a, b) { return a + b; }',
      'export const bar = (x) => x * 2;',
      'export function useCount() {}',
      'function MyComp({ title }) { return null; }',
    ].join('\n');
    const syms = extractSymbols(src, 'comp.jsx');
    for (const s of syms) {
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('type');
      expect(s).toHaveProperty('sig');
      expect(typeof s.name).toBe('string');
    }
  });

  it('hook type is always "hook" for use-prefixed functions', () => {
    const hooks = ['useCount', 'useMyStore', 'useAgentLoop', 'useFileStore'];
    for (const name of hooks) {
      const src = `export function ${name}(opts) { return opts; }`;
      const syms = extractSymbols(src, 'hook.js');
      const found = syms.find(s => s.name === name);
      expect(found?.type).toBe('hook');
    }
  });
});
