// @vitest-environment happy-dom

import { describe, it, expect } from 'vitest';
import { extractMentionedFiles } from './useAgentLoop.js';

describe('extractMentionedFiles', () => {
  it('extracts common source file mentions from prompt text', () => {
    const result = extractMentionedFiles('cek src/api.js dan docs/guide.md lalu perbaiki styles/main.css');
    expect(result).toEqual(['src/api.js', 'docs/guide.md', 'styles/main.css']);
  });

  it('supports cjs and mjs extensions', () => {
    const result = extractMentionedFiles('debug yuyu-server.cjs dan scripts/build.mjs sekarang');
    expect(result).toEqual(['yuyu-server.cjs', 'scripts/build.mjs']);
  });

  it('returns empty array when there are no file mentions', () => {
    expect(extractMentionedFiles('tolong rapikan arsitektur project ini')).toEqual([]);
  });
});
