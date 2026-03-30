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
// compressSource
// ─────────────────────────────────────────────────────────────────────────────
describe('compressSource', () => {
  it('returns src unchanged for non-code files', () => {
    const css = 'body { color: red; }';
    expect(compressSource(css, 'style.css')).toBe(css);
  });

  it('strips function bodies and replaces with { … }', () => {
    const src = [
      'export function add(a, b) {',
      '  const result = a + b;',
      '  return result;',
      '}',
    ].join('\n');
    const out = compressSource(src, 'utils.js');
    expect(out).toContain('{ … }');
    expect(out).not.toContain('const result');
  });

  it('keeps import statements', () => {
    const src = "import React from 'react';\nexport function App() { return null; }";
    const out = compressSource(src, 'App.jsx');
    expect(out).toContain("import React from 'react'");
  });

  it('keeps blank lines', () => {
    const src = 'export function a() { return 1; }\n\nexport function b() { return 2; }';
    const out = compressSource(src, 'utils.js');
    expect(out).toContain('\n\n');
  });

  it('output is shorter than input for large functions', () => {
    const body = Array.from({ length: 50 }, (_, i) => `  const v${i} = ${i};`).join('\n');
    const src = `export function bigFn(x) {\n${body}\n  return x;\n}`;
    const out = compressSource(src, 'utils.js');
    expect(out.length).toBeLessThan(src.length);
  });

  it('handles empty source', () => {
    expect(compressSource('', 'utils.js')).toBe('');
  });

  it('truncates long export const line over 100 chars', () => {
    const longValue = 'x'.repeat(90);
    const src = `export const LONG_CONSTANT = '${longValue}';\nexport function foo() { return 1; }`;
    const out = compressSource(src, 'utils.js');
    expect(out).toContain('…');
  });

  it('skips compression for files >100KB', () => {
    const largeContent = 'x'.repeat(150 * 1024);
    const result = compressSource(largeContent, 'large.js');
    expect(result.length).toBeLessThan(largeContent.length);
    expect(result).toContain('(file truncated for performance)');
  });

  it('handles 100KB boundary correctly', () => {
    const justUnder = 'x'.repeat(99 * 1024);
    const result = compressSource(justUnder, 'utils.js');
    expect(result).not.toContain('(file truncated)');
  });
});
