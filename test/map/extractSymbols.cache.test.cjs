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
// extractSymbols — cache tests
// ─────────────────────────────────────────────────────────────────────────────
describe('extractSymbols cache', () => {
  it('caches repeated calls with same content and path', () => {
    const src = 'export function foo() { return 1; }';
    const filePath = 'utils.js';
    
    const first = extractSymbols(src, filePath);
    const second = extractSymbols(src, filePath);
    
    expect(first).toEqual(second);
    expect(first.length).toBe(1);
    expect(first[0].name).toBe('foo');
  });

  it('different files with same content get different cache keys', () => {
    const src = 'export function bar() { return 2; }';
    const first = extractSymbols(src, 'file1.js');
    const second = extractSymbols(src, 'file2.js');
    
    expect(first).toEqual(second);
    expect(first[0].name).toBe('bar');
  });

  it('cache respects LRU limit (max 200 entries)', () => {
    for (let i = 0; i < 250; i++) {
      const src = `export function fn${i}() { return ${i}; }`;
      extractSymbols(src, `file${i}.js`);
    }
    const result = extractSymbols('export function last() { return 0; }', 'last.js');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('last');
  });
});
