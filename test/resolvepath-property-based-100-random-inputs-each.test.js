// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from '../src/utils.js';

// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly

// ── Integration: parseActions → executeAction ─────────────────────────────────

describe('resolvePath — property-based (100 random inputs each)', () => {
  it('never throws on arbitrary base + path', () => {
    fc.assert(fc.property2(fc.string(), fc.string(), (base, p) => {
      expect(() => resolvePath(base, p)).not.toThrow();
    }));
  });

  it('always returns a string', () => {
    fc.assert(fc.property2(fc.string(), fc.string(), (base, p) => {
      expect(typeof resolvePath(base, p)).toBe('string');
    }));
  });

  it('result contains non-empty arg when the other is empty', () => {
    const safe = fc.filteredString(s => !s.includes('/') && !s.startsWith('.'));
    fc.assert(fc.property(safe, (s) => {
      expect(resolvePath('', s)).toContain(s);
      expect(resolvePath(s, '')).toContain(s);
    }));
  });
});
