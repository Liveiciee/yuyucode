import { describe, it, expect } from "vitest";
import { countTokens, getFileIcon, hl, resolvePath, parseActions } from "./utils.js";

// ── TEST countTokens ─────────────────────────────────────────────────────────
describe('countTokens', () => {
  it('should return 0 for empty messages', () => {
    expect(countTokens([])).toBe(0);
  });

  it('should calculate token count from content length', () => {
    const msgs = [
      { content: 'Hello' },
      { content: 'World!' }
    ];
    // (5 + 6) / 4 = 2.75 → rounded to 3
    expect(countTokens(msgs)).toBe(3);
  });

  it('should handle missing content', () => {
    const msgs = [
      { content: 'Hi' },
      { text: 'No content' }
    ];
    expect(countTokens(msgs)).toBe(0); // only counts .content
  });
});

// ── TEST getFileIcon ─────────────────────────────────────────────────────────
describe('getFileIcon', () => {
  it('should return default icon for unknown extension', () => {
    expect(getFileIcon('unknown.xyz')).toBe('📄');
  });

  it('should return correct icon for known extensions', () => {
    expect(getFileIcon('app.js')).toBe('📜');
    expect(getFileIcon('style.css')).toBe('🎨');
    expect(getFileIcon('image.png')).toBe('🖼');
    expect(getFileIcon('main.py')).toBe('🐍');
    expect(getFileIcon('Cargo.toml')).toBe('⚙️');
  });

  it('should handle mixed case extensions', () => {
    expect(getFileIcon('FILE.JS')).toBe('📜');
    expect(getFileIcon('image.PNG')).toBe('🖼');
  });

  it('should return default icon for no extension', () => {
    expect(getFileIcon('Makefile')).toBe('📄');
    expect(getFileIcon('')).toBe('📄');
  });
});

// ── TEST hl (syntax highlight) ───────────────────────────────────────────────
describe('hl', () => {
  it('should escape HTML characters', () => {
    expect(hl('<script>alert()</script>'))
      .toContain('&lt;script&gt;alert()&lt;/script&gt;');
  });

  it('should highlight JSON keys and values', () => {
    const code = '"name": "John", "age": 30, "valid": true';
    const out = hl(code, 'json');
    expect(out).toMatch(/<span style="color:#79b8ff">"name"</span>:"John"/);
    expect(out).toMatch(/<span style="color:#98c379">"John"</span>/);
    expect(out).toMatch(/<span style="color:#f97583">true</span>/);
  });

  it('should highlight bash keywords and strings', () => {
    const code = '#!/bin/bash\necho "Hello $USER"';
    const out = hl(code, 'bash');
    expect(out).toMatch(/<span style="color:#6a737d">#!\/bin\/bash</span>/);
    expect(out).toMatch(/<span style="color:#c678dd">echo</span>/);
    expect(out).toMatch(/<span style="color:#98c379">"Hello \$USER"</span>/);
    expect(out).toMatch(/<span style="color:#79b8ff">\$USER</span>/);
  });

  it('should highlight python keywords and strings', () => {
    const code = 'def hello():\n    return "Hello" if True else None';
    const out = hl(code, 'py');
    expect(out).toMatch(/<span style="color:#c678dd">def</span>/);
    expect(out).toMatch(/<span style="color:#c678dd">return</span>/);
    expect(out).toMatch(/<span style="color:#c678dd">True</span>/);
    expect(out).toMatch(/<span style="color:#c678dd">None</span>/);
    expect(out).toMatch(/<span style="color:#98c379">"Hello"</span>/);
  });

  it('should highlight css selectors and values', () => {
    const code = '.container { color: red; margin: 10px; }';
    const out = hl(code, 'css');
    expect(out).toMatch(/<span style="color:#79b8ff">\.container</span> \{/);
    expect(out).toMatch(/<span style="color:#b392f0">color</span>:/);
    expect(out).toMatch(/<span style="color:#98c379">red</span>/);
    expect(out).toMatch(/<span style="color:#d19a66">10px</span>/);
  });

  it('should highlight js keywords, strings, numbers, and types', () => {
    const code = `const App = () => {\n  return \`Hello \${name}\`;\n};`;
    const out = hl(code, 'js');
    expect(out).toMatch(/<span style="color:#c678dd">const</span>/);
    expect(out).toMatch(/<span style="color:#79b8ff">App</span>/);
    expect(out).toMatch(/<span style="color:#98c379">\`Hello \$\{name\}\`</span>/);
    expect(out).toMatch(/<span style="color:#79b8ff">\$\{name\}<\/span>/);
  });

  it('should handle empty code', () => {
    expect(hl('', 'js')).toBe('');
  });
});

// ── TEST resolvePath ─────────────────────────────────────────────────────────
describe('resolvePath', () => {
  it('should return base if no path', () => {
    expect(resolvePath('base', '')).toBe('base');
    expect(resolvePath('base', null)).toBe('base');
  });

  it('should return path if no base', () => {
    expect(resolvePath('', 'path')).toBe('path');
  });

  it('should return path if equal to base', () => {
    expect(resolvePath('base', 'base')).toBe('base');
  });

  it('should return path if already prefixed', () => {
    expect(resolvePath('base', 'base/file')).toBe('base/file');
  });

  it('should concatenate base and path correctly', () => {
    expect(resolvePath('base', 'file')).toBe('base/file');
    expect(resolvePath('base', '/file')).toBe('base/file');
    expect(resolvePath('base/', 'file')).toBe('base/file');
  });
});

// ── TEST parseActions ────────────────────────────────────────────────────────
describe('parseActions', () => {
  it('should return empty array if no match', () => {
    expect(parseActions('no actions here')).toEqual([]);
  });

  it('should extract and parse valid JSON actions', () => {
    const text = `Some text before\n\n\n\n{\"action\":\"create\",\"file\":\"test.js\"}\n\nMore text\n\n{\"action\":\"delete\",\"file\":\"old.js\"}`;
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual({ action: 'create', file: 'test.js' });
    expect(actions[1]).toEqual({ action: 'delete', file: 'old.js' });
  });

  it('should skip invalid JSON', () => {
    const text = '{"action":"create","file":} {"valid":true}';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toEqual({ valid: true });
  });
});
