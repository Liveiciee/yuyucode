import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock CodeMirror — tidak bisa jalan di jsdom tanpa DOM penuh ───────────────
vi.mock('codemirror', () => ({ EditorView: { theme: vi.fn(() => ({})), updateListener: { of: vi.fn() }, lineWrapping: {} }, basicSetup: [] }));
vi.mock('@codemirror/state', () => ({ EditorState: { create: vi.fn() }, Compartment: vi.fn(() => ({ of: vi.fn(), reconfigure: vi.fn() })), StateEffect: { define: vi.fn(() => ({ of: vi.fn() })), appendConfig: { of: vi.fn() } }, StateField: { define: vi.fn() } }));
vi.mock('@codemirror/view', () => ({ Decoration: { none: {}, set: vi.fn(), widget: vi.fn(() => ({ range: vi.fn() })) }, WidgetType: class {}, ViewPlugin: { fromClass: vi.fn(() => ({})) }, keymap: { of: vi.fn(() => ({})) }, GutterMarker: class {}, gutter: vi.fn(() => ({})) }));
vi.mock('@codemirror/lint', () => ({ linter: vi.fn(() => ({})), lintGutter: vi.fn(() => ({})) }));
vi.mock('@codemirror/language', () => ({ syntaxTree: vi.fn(() => ({ resolveInner: vi.fn(() => null) })), language: {} }));
vi.mock('@codemirror/commands', () => ({ foldAll: vi.fn(), unfoldAll: vi.fn(), selectNextOccurrence: vi.fn(), selectSelectionMatches: vi.fn(), indentWithTab: vi.fn() }));
vi.mock('@codemirror/collab', () => ({ collab: vi.fn(() => ({})), getSyncedVersion: vi.fn(() => 0), sendableUpdates: vi.fn(() => []), receiveUpdates: vi.fn(() => ({})) }));
vi.mock('@codemirror/lang-javascript', () => ({ javascript: vi.fn(() => ({ name: 'javascript' })) }));
vi.mock('@codemirror/lang-css',        () => ({ css:        vi.fn(() => ({ name: 'css' })) }));
vi.mock('@codemirror/lang-html',       () => ({ html:       vi.fn(() => ({ name: 'html' })) }));
vi.mock('@codemirror/lang-json',       () => ({ json:       vi.fn(() => ({ name: 'json' })) }));
vi.mock('@codemirror/lang-python',     () => ({ python:     vi.fn(() => ({ name: 'python' })) }));
vi.mock('@codemirror/lang-markdown',   () => ({ markdown:   vi.fn(() => ({ name: 'markdown' })) }));
vi.mock('@replit/codemirror-vim',      () => ({ vim: vi.fn(() => ({})) }));
vi.mock('@emmetio/codemirror6-plugin', () => ({ abbreviationTracker: vi.fn(() => ({})), expandAbbreviation: vi.fn() }));
vi.mock('../api.js', () => ({ callServer: vi.fn() }));
vi.mock('lucide-react', () => ({ Save: () => null, ChevronRight: () => null }));
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return { ...actual };
});

import { javascript } from '@codemirror/lang-javascript';
import { css }        from '@codemirror/lang-css';
import { html }       from '@codemirror/lang-html';
import { json }       from '@codemirror/lang-json';
import { python }     from '@codemirror/lang-python';
import { markdown }   from '@codemirror/lang-markdown';

// ── Inline pure functions (copied dari FileEditor — tidak bisa import karena mock) ──
function getLangExt(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'mjs': case 'cjs': return javascript();
    case 'jsx':  return javascript({ jsx: true });
    case 'ts':   return javascript({ typescript: true });
    case 'tsx':  return javascript({ jsx: true, typescript: true });
    case 'css': case 'scss': case 'sass': return css();
    case 'html': case 'htm': return html();
    case 'json': return json();
    case 'py':   return python();
    case 'md': case 'mdx': return markdown();
    default:     return javascript();
  }
}

function isEmmetLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['html', 'htm', 'jsx', 'tsx', 'css', 'scss'].includes(ext);
}

function isTsLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['ts', 'tsx', 'js', 'jsx'].includes(ext);
}

// ── getLang ───────────────────────────────────────────────────────────────────
describe('getLang', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns javascript() for .js', () => {
    getLangExt('app.js');
    expect(javascript).toHaveBeenCalledWith();
  });

  it('returns javascript({jsx}) for .jsx', () => {
    getLangExt('App.jsx');
    expect(javascript).toHaveBeenCalledWith({ jsx: true });
  });

  it('returns javascript({typescript}) for .ts', () => {
    getLangExt('types.ts');
    expect(javascript).toHaveBeenCalledWith({ typescript: true });
  });

  it('returns javascript({jsx,typescript}) for .tsx', () => {
    getLangExt('App.tsx');
    expect(javascript).toHaveBeenCalledWith({ jsx: true, typescript: true });
  });

  it('returns css() for .css .scss .sass', () => {
    ['style.css', 'app.scss', 'vars.sass'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(css).toHaveBeenCalled();
    });
  });

  it('returns html() for .html .htm', () => {
    ['index.html', 'page.htm'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(html).toHaveBeenCalled();
    });
  });

  it('returns json() for .json', () => {
    getLangExt('package.json');
    expect(json).toHaveBeenCalled();
  });

  it('returns python() for .py', () => {
    getLangExt('main.py');
    expect(python).toHaveBeenCalled();
  });

  it('returns markdown() for .md .mdx', () => {
    ['README.md', 'docs.mdx'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(markdown).toHaveBeenCalled();
    });
  });

  it('falls back to javascript() for unknown extension', () => {
    getLangExt('binary.exe');
    expect(javascript).toHaveBeenCalled();
  });

  it('handles null/undefined path', () => {
    getLangExt(null);
    expect(javascript).toHaveBeenCalled();
  });

  it('handles path with no extension', () => {
    getLangExt('Makefile');
    expect(javascript).toHaveBeenCalled();
  });

  it('handles .mjs and .cjs like .js', () => {
    ['util.mjs', 'config.cjs'].forEach(f => {
      vi.clearAllMocks();
      getLangExt(f);
      expect(javascript).toHaveBeenCalledWith();
    });
  });
});

// ── isEmmetLang ───────────────────────────────────────────────────────────────
describe('isEmmetLang', () => {
  it('returns true for html/htm/jsx/tsx/css/scss', () => {
    ['index.html', 'page.htm', 'App.jsx', 'App.tsx', 'style.css', 'vars.scss']
      .forEach(f => expect(isEmmetLang(f)).toBe(true));
  });

  it('returns false for ts/js/py/json/md', () => {
    ['types.ts', 'main.js', 'app.py', 'data.json', 'README.md']
      .forEach(f => expect(isEmmetLang(f)).toBe(false));
  });

  it('returns false for null/undefined', () => {
    expect(isEmmetLang(null)).toBe(false);
    expect(isEmmetLang(undefined)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isEmmetLang('App.JSX')).toBe(true);
    expect(isEmmetLang('Style.CSS')).toBe(true);
  });
});

// ── isTsLang ──────────────────────────────────────────────────────────────────
describe('isTsLang', () => {
  it('returns true for ts/tsx/js/jsx', () => {
    ['app.ts', 'App.tsx', 'main.js', 'Comp.jsx']
      .forEach(f => expect(isTsLang(f)).toBe(true));
  });

  it('returns false for css/html/py/json/md', () => {
    ['style.css', 'index.html', 'main.py', 'data.json', 'README.md']
      .forEach(f => expect(isTsLang(f)).toBe(false));
  });

  it('returns false for null/undefined', () => {
    expect(isTsLang(null)).toBe(false);
    expect(isTsLang(undefined)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isTsLang('App.TS')).toBe(true);
    expect(isTsLang('Comp.JSX')).toBe(true);
  });
});
