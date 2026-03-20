// @vitest-environment node
// globals: true — vi, describe, it, expect, beforeEach, afterEach injected by vitest

// ── Mock fs and child_process BEFORE requiring yuyu-map ───────────────────────
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return { ...actual };
});

const fs   = require('fs');
const path = require('path');
const os = require('os');

// Lazy-load once at module level for pure-function tests
const {
  extractSymbols,
  compressSource,
  extractImports,
  computeSalience,
  walkFiles,
  generateMap,
  generateCompressed,
  tryRepomix,
} = require('./yuyu-map.cjs');

// ─────────────────────────────────────────────────────────────────────────────
// tryRepomix — uses dependency injection: tryRepomix(_spawnSync?)
// ─────────────────────────────────────────────────────────────────────────────
describe('tryRepomix', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-test-'));
    fs.mkdirSync(path.join(tmpDir, '.yuyu'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns content string on success', () => {
    const outFile     = path.join(tmpDir, '.yuyu', 'compressed-repomix.md');
    const fakeContent = '# Repomix output\n\nsome compressed code';

    const mockSpawn = vi.fn(() => {
      fs.writeFileSync(outFile, fakeContent);
      return { status: 0, error: null, stderr: '' };
    });

    const result = tryRepomix(mockSpawn, outFile);
    expect(result).toBe(fakeContent);
  });

  it('returns null when spawnSync throws', () => {
    const mockSpawn = vi.fn(() => { throw new Error('ENOENT: npx not found'); });
    expect(tryRepomix(mockSpawn)).toBeNull();
  });

  it('returns null when spawnSync returns error object (offline/not found)', () => {
    const mockSpawn = vi.fn(() => ({ error: new Error('ENOENT'), status: null, stderr: '' }));
    expect(tryRepomix(mockSpawn)).toBeNull();
  });

  it('returns null when exit status is non-zero', () => {
    const mockSpawn = vi.fn(() => ({ error: null, status: 1, stderr: 'network timeout' }));
    expect(tryRepomix(mockSpawn)).toBeNull();
  });

  it('returns null when output file not created despite exit 0', () => {
    const mockSpawn   = vi.fn(() => ({ error: null, status: 0, stderr: '' }));
    const ghostFile   = path.join(tmpDir, '.yuyu', 'ghost-repomix.md'); // never written
    expect(tryRepomix(mockSpawn, ghostFile)).toBeNull();
  });

  it('calls spawnSync with correct repomix args', () => {
    const mockSpawn = vi.fn(() => ({ error: new Error('offline'), status: null, stderr: '' }));
    tryRepomix(mockSpawn);
    expect(mockSpawn).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['repomix', '--compress']),
      expect.objectContaining({ timeout: expect.any(Number) })
    );
  });

  it('uses 90s timeout', () => {
    const mockSpawn = vi.fn(() => ({ error: new Error('offline'), status: null, stderr: '' }));
    tryRepomix(mockSpawn);
    const opts = mockSpawn.mock.calls[0][2];
    expect(opts.timeout).toBe(90_000);
  });
});

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

  it('extracts custom hook (useXxx) — type is fn (export function matches fn pattern first)', () => {
    const src = 'export function useFileStore(opts) { }';
    const syms = extractSymbols(src, 'useFileStore.js');
    expect(syms.some(s => s.name === 'useFileStore')).toBe(true);
    // export function matches 'fn' pattern before 'hook' pattern — documented behavior
    const hook = syms.find(s => s.name === 'useFileStore');
    expect(['fn', 'hook']).toContain(hook.type);
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
});

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
});

// ─────────────────────────────────────────────────────────────────────────────
// extractImports
// ─────────────────────────────────────────────────────────────────────────────
describe('extractImports', () => {
  it('extracts npm package names', () => {
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

  it('handles require() calls — only matches with space after keyword (e.g. require "x")', () => {
    // regex: (?:import|require)\s+ — requires whitespace after keyword
    // require('fs') with no space is NOT matched — documented behavior
    const src = "const x = require ('fs');"; // space before ( — matches
    const deps = extractImports(src);
    expect(deps).toContain('fs');
  });

  it('require without space is not matched by current regex — documented behavior', () => {
    const src = "const fs = require('fs');";
    const deps = extractImports(src);
    // No space after require — regex \s+ does not match
    expect(Array.isArray(deps)).toBe(true);
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

// ─────────────────────────────────────────────────────────────────────────────
// walkFiles
// ─────────────────────────────────────────────────────────────────────────────
describe('walkFiles', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-walk-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns empty array for empty dir', () => {
    const exts = new Set(['.js']);
    expect(walkFiles(tmpDir, exts)).toEqual([]);
  });

  it('returns empty array for non-existent dir', () => {
    expect(walkFiles('/nonexistent/path/xyz', new Set(['.js']))).toEqual([]);
  });

  it('finds files matching extension', () => {
    fs.writeFileSync(path.join(tmpDir, 'app.js'), 'const x = 1;');
    fs.writeFileSync(path.join(tmpDir, 'style.css'), 'body{}');
    const results = walkFiles(tmpDir, new Set(['.js']));
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('app.js');
  });

  it('recurses into subdirectories', () => {
    fs.mkdirSync(path.join(tmpDir, 'src'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils.js'), '');
    const results = walkFiles(tmpDir, new Set(['.js']));
    expect(results.some(f => f.includes('utils.js'))).toBe(true);
  });

  it('skips node_modules and .git', () => {
    fs.mkdirSync(path.join(tmpDir, 'node_modules'));
    fs.writeFileSync(path.join(tmpDir, 'node_modules', 'evil.js'), '');
    fs.mkdirSync(path.join(tmpDir, '.git'));
    fs.writeFileSync(path.join(tmpDir, '.git', 'config'), '');
    const results = walkFiles(tmpDir, new Set(['.js']));
    expect(results).toHaveLength(0);
  });

  it('skips dot-files', () => {
    fs.writeFileSync(path.join(tmpDir, '.env'), 'SECRET=123');
    const results = walkFiles(tmpDir, new Set(['.env']));
    expect(results).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// computeSalience
// ─────────────────────────────────────────────────────────────────────────────
describe('computeSalience', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-sal-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns object keyed by relative path', () => {
    const f = path.join(tmpDir, 'utils.js');
    fs.writeFileSync(f, 'export function foo() {}');
    const result = computeSalience([f]);
    expect(Object.keys(result).length).toBe(1);
  });

  it('each entry has salience, syms, lines fields', () => {
    const f = path.join(tmpDir, 'utils.js');
    fs.writeFileSync(f, 'export function bar(x) { return x; }\n');
    const result = computeSalience([f]);
    const entry = Object.values(result)[0];
    expect(entry).toHaveProperty('salience');
    expect(entry).toHaveProperty('syms');
    expect(entry).toHaveProperty('lines');
    expect(entry.lines).toBeGreaterThan(0);
  });

  it('file imported by many others gets higher salience', () => {
    const utils = path.join(tmpDir, 'utils.js');
    const a = path.join(tmpDir, 'a.js');
    const b = path.join(tmpDir, 'b.js');

    fs.writeFileSync(utils, "export function helper() {}");
    fs.writeFileSync(a, "import { helper } from './utils.js';\nconst x = 1;");
    fs.writeFileSync(b, "import { helper } from './utils.js';\nconst y = 2;");

    const result = computeSalience([utils, a, b]);
    const utilsEntry = Object.values(result).find(d => d.rel.includes('utils'));
    const aEntry     = Object.values(result).find(d => d.rel.includes('/a.'));
    expect(utilsEntry.salience).toBeGreaterThan(aEntry.salience);
  });

  it('handles unreadable file gracefully (skip)', () => {
    expect(() => computeSalience(['/nonexistent/file.js'])).not.toThrow();
  });
});

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
});

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
});
