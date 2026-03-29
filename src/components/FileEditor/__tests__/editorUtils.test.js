import { describe, it, expect } from 'vitest';
import { getLang, isEmmetLang, isTsLang } from '../editorUtils.js';

describe('editorUtils', () => {
  it('getLang returns javascript for .js', () => {
    const lang = getLang('file.js');
    expect(lang).toBeDefined();
  });
  it('isEmmetLang returns true for html', () => {
    expect(isEmmetLang('index.html')).toBe(true);
  });
  it('isTsLang returns true for .tsx', () => {
    expect(isTsLang('component.tsx')).toBe(true);
  });
});
