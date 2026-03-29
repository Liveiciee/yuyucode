// src/components/FileEditor/editorUtils.js
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';

export function getLang(path) {
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

export function isEmmetLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['html', 'htm', 'jsx', 'tsx', 'css', 'scss'].includes(ext);
}

export function isTsLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['ts', 'tsx', 'js', 'jsx'].includes(ext);
}

export function buildTheme(T) {
  const bg        = T?.bg        || '#0d0d0e';
  const bg2       = T?.bg2       || '#111116';
  const bg3       = T?.bg3       || 'rgba(255,255,255,.04)';
  const border    = T?.border    || 'rgba(255,255,255,.06)';
  const text      = T?.text      || 'rgba(255,255,255,.85)';
  const textMute  = T?.textMute  || 'rgba(255,255,255,.3)';
  const accent    = T?.accent    || '#a78bfa';
  const accentBg  = T?.accentBg  || 'rgba(124,58,237,.15)';
  const error     = T?.error     || '#f87171';
  const warning   = T?.warning   || '#fbbf24';

  return EditorView.theme({
    '&': { backgroundColor: bg, color: text, height: '100%',
      fontFamily: '"JetBrains Mono","Fira Code",monospace', fontSize: '13px' },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': { overflow: 'auto', lineHeight: '1.65' },
    '.cm-content': { padding: '8px 0', caretColor: accent },
    '.cm-gutters': { backgroundColor: bg3, borderRight: '1px solid ' + border,
      color: textMute, minWidth: '38px', padding: '0 4px' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 6px 0 4px' },
    '.cm-activeLineGutter': { backgroundColor: accentBg + '66' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,.015)' },
    '.cm-cursor': { borderLeftColor: accent, borderLeftWidth: '2px' },
    '.cm-selectionBackground': { backgroundColor: accentBg + ' !important' },
    '&.cm-focused .cm-selectionBackground': { backgroundColor: accentBg + ' !important' },
    '.cm-matchingBracket': { backgroundColor: accentBg,
      outline: '1px solid ' + accent + '44', borderRadius: '2px' },
    '.cm-searchMatch': { backgroundColor: accentBg, borderRadius: '2px' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: accent + '44' },
    '.cm-tooltip': { backgroundColor: bg2, border: '1px solid ' + border,
      borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.5)', zIndex: 200 },
    '.cm-tooltip-autocomplete > ul > li': { padding: '4px 10px' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: accentBg, color: accent },
    '.cm-panels': { backgroundColor: bg2, borderBottom: '1px solid ' + border },
    '.cm-panel.cm-search': { padding: '6px 10px', gap: '6px' },
    '.cm-panel.cm-search input': { backgroundColor: bg3, border: '1px solid ' + border,
      borderRadius: '6px', color: text, padding: '4px 8px', outline: 'none' },
    '.cm-panel.cm-search button': { backgroundColor: bg3, border: '1px solid ' + border,
      borderRadius: '6px', color: text, padding: '4px 10px', cursor: 'pointer' },
    '.cm-gutter-lint': { width: '14px' },
    '.cm-lint-marker-error': { color: error },
    '.cm-lint-marker-warning': { color: warning },
    '.cm-vim-panel': { backgroundColor: bg2, borderTop: '1px solid ' + border,
      color: textMute, fontSize: '11px', padding: '2px 8px', fontFamily: 'monospace' },
    '.cm-vim-panel input': { backgroundColor: 'transparent', border: 'none', color: text,
      outline: 'none', fontFamily: 'monospace' },
    '.cm-blame-gutter': { minWidth: '150px', fontSize: '9px', padding: '0 6px 0 2px',
      color: textMute, fontFamily: 'monospace', cursor: 'default', userSelect: 'none' },
    '.cm-stickyLines': { backgroundColor: bg + 'ee', borderBottom: '1px solid ' + border,
      backdropFilter: 'blur(4px)', zIndex: 10 },
  }, { dark: true });
}
