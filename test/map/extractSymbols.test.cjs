// @vitest-environment node
// globals: true — vi, describe, it, expect, beforeEach, afterEach injected by vitest

const fs   = require('fs');
const path = require('path');
const os = require('os');

// Lazy-load once at module level for pure-function tests
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
// extractSymbols
// ─────────────────────────────────────────────────────────────────────────────
describe('extractSymbols', () => {
  it('returns empty array for non-code files', () => {
    expect(extractSymbols('body { color: red }', 'style.css')).toEqual([]);
    expect(extractSymbols('# Readme', 'README.md')).toEqual([]);
    expect(extractSymbols('{}', 'package.json')).toEqual([]);
  });

  it('extracts exported function', () => {
    const src = 'export function doThing(a, b) { return a + b; }';
    const syms = extractSymbols(src, 'utils.js');
    expect(syms.some(s => s.name === 'doThing')).toBe(true);
  });

  it('extracts exported async function', () => {
    const src = 'export async function fetchData(url) { }';
    const syms = extractSymbols(src, 'api.js');
    expect(syms.some(s => s.name === 'fetchData')).toBe(true);
  });

  it('extracts arrow function export', () => {
    const src = 'export const transform = (input) => input.trim();';
    const syms = extractSymbols(src, 'utils.js');
    expect(syms.some(s => s.name === 'transform')).toBe(true);
  });

  it('extracts React component (Uppercase)', () => {
    const src = 'function AppHeader({ title }) { return null; }';
    const syms = extractSymbols(src, 'AppHeader.jsx');
    expect(syms.some(s => s.name === 'AppHeader')).toBe(true);
  });

  it('extracts custom hook (useXxx) — type is hook', () => {
    const src = 'export function useFileStore(opts) { }';
    const syms = extractSymbols(src, 'useFileStore.js');
    expect(syms.some(s => s.name === 'useFileStore')).toBe(true);
    const hook = syms.find(s => s.name === 'useFileStore');
    expect(hook.type).toBe('hook');
  });

  it('deduplicates symbols with same name', () => {
    const src = [
      'export function foo() {}',
      'export const foo = () => {}',
    ].join('\n');
    const syms = extractSymbols(src, 'utils.js');
    const foos = syms.filter(s => s.name === 'foo');
    expect(foos).toHaveLength(1);
  });

  it('returns empty for empty source', () => {
    expect(extractSymbols('', 'utils.js')).toEqual([]);
  });

  it('extracts named exports', () => {
    const src = 'export const API_URL = "https://api.example.com";';
    const syms = extractSymbols(src, 'constants.js');
    expect(syms.some(s => s.name === 'API_URL')).toBe(true);
  });
});
