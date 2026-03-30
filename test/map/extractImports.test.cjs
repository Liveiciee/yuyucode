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
// extractImports — with dynamic import support
// ─────────────────────────────────────────────────────────────────────────────
describe('extractImports', () => {
  it('extracts npm package names from static import', () => {
    const src = "import React from 'react';\nimport { vi } from 'vitest';";
    const deps = extractImports(src);
    expect(deps).toContain('react');
    expect(deps).toContain('vitest');
  });

  it('ignores relative imports', () => {
    const src = "import { foo } from './foo.js';\nimport bar from '../bar';";
    const deps = extractImports(src);
    expect(deps).toHaveLength(0);
  });

  it('handles require() calls with space', () => {
    const src = "const x = require ('fs');";
    const deps = extractImports(src);
    expect(deps).toContain('fs');
  });

  it('handles dynamic import()', () => {
    const src = "import('lodash').then(_ => {})";
    const deps = extractImports(src);
    expect(deps).toContain('lodash');
  });

  it('handles dynamic import with variable (not extractable)', () => {
    const src = "import(`./${moduleName}`).then(_ => {})";
    const deps = extractImports(src);
    expect(deps).toHaveLength(0);
  });

  it('handles multiple dynamic imports', () => {
    const src = "import('react').then(r => r); import('lodash').then(l => l);";
    const deps = extractImports(src);
    expect(deps).toContain('react');
    expect(deps).toContain('lodash');
  });

  it('deduplicates repeated imports', () => {
    const src = "import a from 'react';\nimport b from 'react';";
    const deps = extractImports(src);
    expect(deps.filter(d => d === 'react')).toHaveLength(1);
  });

  it('returns empty array for no imports', () => {
    expect(extractImports('const x = 1;')).toEqual([]);
  });

  it('strips sub-path (e.g. @codemirror/state → @codemirror)', () => {
    const src = "import { EditorState } from '@codemirror/state';";
    const deps = extractImports(src);
    expect(deps).toContain('@codemirror');
  });
});
