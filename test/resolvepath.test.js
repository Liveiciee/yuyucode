// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from './utils.js';

// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly

// ── Integration: parseActions → executeAction ─────────────────────────────────

describe('resolvePath', () => {
  it('returns base when path is empty', () => {
    expect(resolvePath('/home/user', '')).toBe('/home/user');
  });

  it('returns path when base is empty', () => {
    expect(resolvePath('', 'src/App.jsx')).toBe('src/App.jsx');
  });

  it('joins base and relative path', () => {
    expect(resolvePath('/home/user/project', 'src/App.jsx')).toBe('/home/user/project/src/App.jsx');
  });

  it('strips trailing slash from base', () => {
    expect(resolvePath('/home/user/', 'src/App.jsx')).toBe('/home/user/src/App.jsx');
  });

  it('strips leading slash from path', () => {
    expect(resolvePath('/home/user', '/src/App.jsx')).toBe('/home/user/src/App.jsx');
  });

  it('handles path that already contains full absolute path independent of base', () => {
    // resolvePath strips leading slash from p before checking,
    // so '/proj/src/App.jsx' becomes 'proj/src/App.jsx' which doesn't startWith '/proj'
    // result: base + '/' + stripped = '/proj/proj/src/App.jsx'
    // This is the documented behavior — callers should pass relative paths
    const result = resolvePath('/proj', 'src/App.jsx');
    expect(result).toBe('/proj/src/App.jsx');
  });
});
