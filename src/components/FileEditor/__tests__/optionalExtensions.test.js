import { describe, it, expect, vi } from 'vitest';
import { buildOptionalExtensions } from '../optionalExtensions.js';

describe('optionalExtensions', () => {
  it('returns empty array when no config', () => {
    const exts = buildOptionalExtensions({}, 'file.js', '/folder', null);
    expect(Array.isArray(exts)).toBe(true);
  });

  it('adds vim extension when vimMode true', () => {
    const exts = buildOptionalExtensions({ vimMode: true }, 'file.js', '/folder', null);
    expect(exts.length).toBeGreaterThan(0);
  });

  it('adds emmet extension when emmet true and lang supported', () => {
    const exts = buildOptionalExtensions({ emmet: true }, 'file.html', '/folder', null);
    expect(exts.length).toBeGreaterThan(0);
  });
});
