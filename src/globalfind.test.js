// @vitest-environment node
import { describe, it, expect } from 'vitest';

// ── Pure logic extracted dari GlobalFindReplace ───────────────────────────────

function parseGrepOutput(raw, folder) {
  const fileMap = new Map();
  (raw || '').split('\n').filter(Boolean).forEach(line => {
    const m = line.match(/^(.+?):(\d+):\s*(.*)/);
    if (!m) return;
    const [, filePath, lineNum, content] = m;
    const rel = filePath.startsWith(folder) ? filePath.slice(folder.length + 1) : filePath;
    if (!fileMap.has(rel)) fileMap.set(rel, []);
    fileMap.get(rel).push({ line: parseInt(lineNum), text: content.trim() });
  });
  return Array.from(fileMap.entries()).map(([file, matches]) => ({ file, matches }));
}

function buildSearchPattern(query, useRegex, matchCase) {
  const flags = matchCase ? 'g' : 'gi';
  const pattern = useRegex
    ? new RegExp(query, flags)
    : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  return pattern;
}

function applyReplace(content, query, replaceStr, useRegex, matchCase) {
  const pattern = buildSearchPattern(query, useRegex, matchCase);
  return content.replace(pattern, replaceStr);
}

// ── parseGrepOutput ───────────────────────────────────────────────────────────
describe('parseGrepOutput', () => {
  it('parses single result', () => {
    const raw = '/project/src/App.jsx:42:  const x = 1;';
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/App.jsx');
    expect(result[0].matches[0]).toEqual({ line: 42, text: 'const x = 1;' });
  });

  it('groups multiple matches from same file', () => {
    const raw = [
      '/project/src/App.jsx:1:import React',
      '/project/src/App.jsx:5:export default',
    ].join('\n');
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(1);
    expect(result[0].matches).toHaveLength(2);
  });

  it('separates matches from different files', () => {
    const raw = [
      '/project/src/App.jsx:1:import React',
      '/project/src/utils.js:10:export function',
    ].join('\n');
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(parseGrepOutput('', '/project')).toEqual([]);
    expect(parseGrepOutput(null, '/project')).toEqual([]);
  });

  it('skips malformed lines', () => {
    const raw = 'not-a-grep-line\n/project/file.js:1:valid';
    const result = parseGrepOutput(raw, '/project');
    expect(result).toHaveLength(1);
    expect(result[0].matches[0].line).toBe(1);
  });

  it('handles path not starting with folder', () => {
    const raw = 'relative/path.js:3:code';
    const result = parseGrepOutput(raw, '/project');
    expect(result[0].file).toBe('relative/path.js');
  });

  it('trims whitespace from match text', () => {
    const raw = '/project/a.js:1:   lots of spaces   ';
    const result = parseGrepOutput(raw, '/project');
    expect(result[0].matches[0].text).toBe('lots of spaces');
  });
});

// ── buildSearchPattern ────────────────────────────────────────────────────────
describe('buildSearchPattern', () => {
  it('escapes special chars in non-regex mode', () => {
    const pat = buildSearchPattern('a.b', false, true);
    expect('axb'.match(pat)).toBeNull();
    expect('a.b'.match(pat)).not.toBeNull();
  });

  it('uses raw regex in regex mode', () => {
    const pat = buildSearchPattern('a.b', true, true);
    expect('axb'.match(pat)).not.toBeNull();
  });

  it('is case-insensitive when matchCase=false', () => {
    const pat = buildSearchPattern('hello', false, false);
    expect('HELLO'.match(pat)).not.toBeNull();
    expect('Hello'.match(pat)).not.toBeNull();
  });

  it('is case-sensitive when matchCase=true', () => {
    const pat = buildSearchPattern('hello', false, true);
    expect('HELLO'.match(pat)).toBeNull();
    expect('hello'.match(pat)).not.toBeNull();
  });

  it('has global flag for replace-all', () => {
    const pat = buildSearchPattern('x', false, true);
    const result = 'x and x'.replace(pat, 'y');
    expect(result).toBe('y and y');
  });
});

// ── applyReplace ──────────────────────────────────────────────────────────────
describe('applyReplace', () => {
  it('replaces all occurrences', () => {
    const result = applyReplace('foo foo foo', 'foo', 'bar', false, true);
    expect(result).toBe('bar bar bar');
  });

  it('replace is case-insensitive when matchCase=false', () => {
    const result = applyReplace('Foo FOO foo', 'foo', 'baz', false, false);
    expect(result).toBe('baz baz baz');
  });

  it('does not replace when case mismatch and matchCase=true', () => {
    const result = applyReplace('FOO', 'foo', 'bar', false, true);
    expect(result).toBe('FOO');
  });

  it('regex replace with capture group', () => {
    const result = applyReplace('hello world', '(\\w+)', '[$1]', true, true);
    expect(result).toBe('[hello] [world]');
  });

  it('returns unchanged string when no match', () => {
    const result = applyReplace('no match here', 'xyz', 'abc', false, true);
    expect(result).toBe('no match here');
  });

  it('handles empty replacement string (deletion)', () => {
    const result = applyReplace('remove this word', 'this ', '', false, true);
    expect(result).toBe('remove word');
  });
});
