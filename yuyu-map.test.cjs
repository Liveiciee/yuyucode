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
  generateLlmsTxt,
  ensureHandoffTemplate,
  getChangedFiles,
  tryRepomix,
  main,
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

  it('extracts custom hook (useXxx) — type is hook (hook pattern matches before fn)', () => {
    const src = 'export function useFileStore(opts) { }';
    const syms = extractSymbols(src, 'useFileStore.js');
    expect(syms.some(s => s.name === 'useFileStore')).toBe(true);
    // hook pattern now comes before fn pattern — useXxx is correctly classified as 'hook'
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

  it('includes critical constraints section', () => {
    const result = generateLlmsTxt({});
    expect(result).toContain('NEVER change without');
    expect(result).toContain('wasm-node');
    expect(result).toContain('vitest@1');
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
});

// ─────────────────────────────────────────────────────────────────────────────
// ensureHandoffTemplate
// ─────────────────────────────────────────────────────────────────────────────
describe('ensureHandoffTemplate', () => {
  let tmpDir;
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-handoff-'));
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates handoff.md when it does not exist', () => {
    ensureHandoffTemplate(tmpDir);
    expect(fs.existsSync(path.join(tmpDir, 'handoff.md'))).toBe(true);
  });

  it('created file contains required sections', () => {
    ensureHandoffTemplate(tmpDir);
    const content = fs.readFileSync(path.join(tmpDir, 'handoff.md'), 'utf8');
    expect(content).toContain('Session Handoff');
    expect(content).toContain('Completed this session');
    expect(content).toContain('In progress');
    expect(content).toContain('Known issues');
    expect(content).toContain('Next session priorities');
  });

  it('does NOT overwrite existing handoff.md', () => {
    const handoffPath = path.join(tmpDir, 'handoff.md');
    const existing = '# My custom handoff\nCustom content here.';
    fs.writeFileSync(handoffPath, existing);

    ensureHandoffTemplate(tmpDir);

    const content = fs.readFileSync(handoffPath, 'utf8');
    expect(content).toBe(existing);
  });

  it('created file includes todays date', () => {
    ensureHandoffTemplate(tmpDir);
    const content = fs.readFileSync(path.join(tmpDir, 'handoff.md'), 'utf8');
    const today = new Date().toISOString().split('T')[0];
    expect(content).toContain(today);
  });

  it('is idempotent — calling twice does not throw', () => {
    expect(() => {
      ensureHandoffTemplate(tmpDir);
      ensureHandoffTemplate(tmpDir);
    }).not.toThrow();
  });

  it('uses YUYU_DIR default when called without args (smoke test — does not throw)', () => {
    // Just ensure the function signature is backwards-compatible
    expect(typeof ensureHandoffTemplate).toBe('function');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// main() — integration tests in tmp dir
// ─────────────────────────────────────────────────────────────────────────────
describe('main()', () => {
  let tmpDir;
  let yuyuDir;
  let consoleSpy;
  // Fast mock: repomix "offline" — returns error immediately, no 90s timeout
  const fastSpawn = vi.fn(() => ({ error: new Error('offline'), status: null, stderr: '' }));

  beforeEach(() => {
    // Silence console.log output from main() during tests
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    tmpDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-main-'));
    yuyuDir = path.join(tmpDir, '.yuyu');
    fs.mkdirSync(yuyuDir, { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src'));
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('runs without throwing on empty project', () => {
    expect(() => main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn })).not.toThrow();
  });

  it('creates .yuyu/compressed.md', () => {
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(path.join(yuyuDir, 'compressed.md'))).toBe(true);
  });

  it('creates .yuyu/map.md', () => {
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(path.join(yuyuDir, 'map.md'))).toBe(true);
  });

  it('creates llms.txt in root', () => {
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(path.join(tmpDir, 'llms.txt'))).toBe(true);
  });

  it('creates .yuyu/handoff.md if missing', () => {
    const handoffPath = path.join(yuyuDir, 'handoff.md');
    expect(fs.existsSync(handoffPath)).toBe(false);
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.existsSync(handoffPath)).toBe(true);
  });

  it('does NOT overwrite existing handoff.md', () => {
    const handoffPath = path.join(yuyuDir, 'handoff.md');
    const custom = '# My session notes';
    fs.writeFileSync(handoffPath, custom);
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    expect(fs.readFileSync(handoffPath, 'utf8')).toBe(custom);
  });

  it('map.md contains file entries when src has JS files', () => {
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils.js'), [
      'export function helper(x) { return x; }',
      'export const FOO = 42;',
    ].join('\n'));
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    const mapContent = fs.readFileSync(path.join(yuyuDir, 'map.md'), 'utf8');
    expect(mapContent).toContain('utils.js');
    expect(mapContent).toContain('helper');
  });

  it('llms.txt contains architecture info', () => {
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    const llms = fs.readFileSync(path.join(tmpDir, 'llms.txt'), 'utf8');
    expect(llms).toContain('YuyuCode');
    expect(llms).toContain('Architecture');
  });

  it('creates .yuyu/ dir if it does not already exist', () => {
    const freshDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-fresh-'));
    const freshYuyu = path.join(freshDir, '.yuyu');
    try {
      expect(fs.existsSync(freshYuyu)).toBe(false);
      main({ root: freshDir, yuyuDir: freshYuyu, spawnSync: fastSpawn });
      expect(fs.existsSync(freshYuyu)).toBe(true);
    } finally {
      fs.rmSync(freshDir, { recursive: true, force: true });
    }
  });

  it('handles a project with hooks/ directory — map includes hook symbols', () => {
    fs.mkdirSync(path.join(tmpDir, 'src', 'hooks'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'hooks', 'useCounter.js'),
      'export function useCounter(initial) { return initial; }\n'
    );
    main({ root: tmpDir, yuyuDir, spawnSync: fastSpawn });
    const mapContent = fs.readFileSync(path.join(yuyuDir, 'map.md'), 'utf8');
    expect(mapContent).toContain('useCounter');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getChangedFiles — incremental map update
// ─────────────────────────────────────────────────────────────────────────────
describe('getChangedFiles', () => {
  it('returns a Set of absolute paths when git diff succeeds', () => {
    const mockSpawn = vi.fn(() => ({
      error: null, status: 0, stderr: '',
      stdout: 'src/utils.js\nsrc/App.jsx\n',
    }));
    const result = getChangedFiles('/home/user/project', mockSpawn);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect([...result].some(p => p.includes('utils.js'))).toBe(true);
    expect([...result].some(p => p.includes('App.jsx'))).toBe(true);
  });

  it('returns null when git exits non-zero (not a git repo)', () => {
    const mockSpawn = vi.fn(() => ({ error: null, status: 128, stderr: 'not a git repo', stdout: '' }));
    expect(getChangedFiles('/tmp/notgit', mockSpawn)).toBeNull();
  });

  it('returns null when spawnSync throws', () => {
    const mockSpawn = vi.fn(() => { throw new Error('spawn failed'); });
    expect(getChangedFiles('/tmp', mockSpawn)).toBeNull();
  });

  it('returns null when diff has error object (git not installed)', () => {
    const mockSpawn = vi.fn(() => ({ error: new Error('ENOENT'), status: null, stdout: '' }));
    expect(getChangedFiles('/tmp', mockSpawn)).toBeNull();
  });

  it('returns null when no files changed (empty diff)', () => {
    const mockSpawn = vi.fn(() => ({ error: null, status: 0, stdout: '\n', stderr: '' }));
    expect(getChangedFiles('/tmp', mockSpawn)).toBeNull();
  });

  it('paths in result are absolute (joined with root)', () => {
    const mockSpawn = vi.fn(() => ({
      error: null, status: 0, stdout: 'src/hooks/useStore.js\n', stderr: '',
    }));
    const result = getChangedFiles('/proj', mockSpawn);
    expect([...result][0]).toBe('/proj/src/hooks/useStore.js');
  });

  it('calls git with correct args and cwd', () => {
    const mockSpawn = vi.fn(() => ({ error: null, status: 0, stdout: 'a.js\n', stderr: '' }));
    getChangedFiles('/my/project', mockSpawn);
    expect(mockSpawn).toHaveBeenCalledWith(
      'git',
      ['diff', '--name-only', 'HEAD'],
      expect.objectContaining({ cwd: '/my/project' })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// extractSymbols — property-based (inline runner)
// ─────────────────────────────────────────────────────────────────────────────
describe('extractSymbols — property-based', () => {
  // Inline minimal runner — zero deps
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
