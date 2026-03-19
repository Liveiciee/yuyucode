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
      { text: 'No content' }  // no .content field
    ];
    // only 'Hi' counts: 2 / 4 = 0.5 → rounds to 1
    expect(countTokens(msgs)).toBe(1);
  });
});

// ── TEST getFileIcon ─────────────────────────────────────────────────────────
describe('getFileIcon', () => {
  it('should return extension string for unknown extension', () => {
    expect(getFileIcon('unknown.xyz')).toBe('xyz');
  });

  it('should return correct string key for known extensions', () => {
    expect(getFileIcon('app.js')).toBe('js');
    expect(getFileIcon('style.css')).toBe('css');
    expect(getFileIcon('image.png')).toBe('img');
    expect(getFileIcon('main.py')).toBe('py');
    expect(getFileIcon('data.json')).toBe('{}');
  });

  it('should handle mixed case extensions', () => {
    expect(getFileIcon('FILE.JS')).toBe('js');
    expect(getFileIcon('image.PNG')).toBe('img');
  });

  it('should return fallback for no extension or empty', () => {
    expect(getFileIcon('Makefile')).toBe('makefile');
    expect(getFileIcon('')).toBe('?');
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
    expect(out).toMatch(/<span style="color:#79b8ff">"name"<\/span>/);
    expect(out).toMatch(/<span style="color:#f97583">true<\/span>/);
    expect(out).toMatch(/<span style="color:#d19a66">30<\/span>/);
  });

  it('should highlight bash keywords', () => {
    const code = 'echo "Hello"';
    const out = hl(code, 'bash');
    expect(out).toMatch(/<span style="color:#c678dd">echo<\/span>/);
  });

  it('should highlight python keywords', () => {
    const code = 'def hello(): return True';
    const out = hl(code, 'py');
    expect(out).toMatch(/<span style="color:#c678dd">def<\/span>/);
    expect(out).toMatch(/<span style="color:#c678dd">return<\/span>/);
    expect(out).toMatch(/<span style="color:#c678dd">True<\/span>/);
  });

  it('should highlight css selectors', () => {
    const code = '.container { color: red; }';
    const out = hl(code, 'css');
    expect(out).toMatch(/<span style="color:#79b8ff">\.container<\/span>/);
  });

  it('should highlight js keywords', () => {
    const code = 'const x = 42;';
    const out = hl(code, 'js');
    expect(out).toMatch(/<span style="color:#c678dd">const<\/span>/);
    expect(out).toMatch(/<span style="color:#d19a66">42<\/span>/);
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
  it('should return empty array if no action block', () => {
    expect(parseActions('no actions here')).toEqual([]);
  });

  it('should extract and parse valid JSON action blocks', () => {
    const text = 'Some text\n```action\n{"type":"write_file","path":"test.js"}\n```\nMore text\n```action\n{"type":"exec","command":"npm test"}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual({ type: 'write_file', path: 'test.js' });
    expect(actions[1]).toEqual({ type: 'exec', command: 'npm test' });
  });

  it('should skip invalid JSON in action blocks', () => {
    const text = '```action\nnot valid json\n```\n```action\n{"valid":true}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toEqual({ valid: true });
  });
});
