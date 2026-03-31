// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from '../src/utils.js';

// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly

// ── Integration: parseActions → executeAction ─────────────────────────────────

describe('parseActions — property-based (100 random inputs each)', () => {
  it('never throws on arbitrary string input', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      expect(() => parseActions(s)).not.toThrow();
    }));
  });

  it('always returns an array', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      expect(Array.isArray(parseActions(s))).toBe(true);
    }));
  });

  it('every parsed action is a plain object', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      for (const a of parseActions(s)) {
        expect(typeof a).toBe('object');
        expect(a).not.toBeNull();
      }
    }));
  });

  it('count never exceeds number of ```action blocks', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      const blockCount = (s.match(/```action/g) || []).length;
      expect(parseActions(s).length).toBeLessThanOrEqual(blockCount);
    }));
  });

  it('valid JSON action blocks are always parsed correctly', () => {
    const typeArb = fc.constantFrom('read_file', 'write_file', 'exec', 'search', 'tree');
    const pathArb = fc.filteredString(s => !s.includes('\n') && !s.includes('`'));
    fc.assert(fc.property(fc.record({ type: typeArb, path: pathArb }), (action) => {
      const text = '```action\n' + JSON.stringify(action) + '\n```';
      const result = parseActions(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(action.type);
    }));
  });

  it('idempotent — parsing same string twice gives identical result', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      expect(parseActions(s)).toEqual(parseActions(s));
    }));
  });
});
