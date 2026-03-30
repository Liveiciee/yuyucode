// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock dependencies ─────────────────────────────────────────────────────────
const mockCallServer = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:  vi.fn().mockResolvedValue({ value: null }),
    set:  vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('./api.js', () => ({ callServer: mockCallServer }));
// utils.js is NOT mocked as a module — use vi.spyOn per-test to avoid
// replacing the module in the shared registry (isolate:false cache pollution).

import { callServer } from './api.js';
import * as utilsModule from './utils.js';
import { useFileStore } from './hooks/useFileStore.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockResolvedValue({ ok: true, data: '' });
  vi.spyOn(utilsModule, 'executeAction').mockResolvedValue({ ok: true, data: 'written' });
});

// ── Multi-tab core ────────────────────────────────────────────────────────────

describe('useFileStore — loadFilePrefs', () => {
  it('loads pinned and recent from JSON strings', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => {
      result.current.loadFilePrefs({
        pinned: JSON.stringify(['/project/App.jsx']),
        recent: JSON.stringify(['/project/utils.js']),
      });
    });
    expect(result.current.pinnedFiles).toContain('/project/App.jsx');
    expect(result.current.recentFiles).toContain('/project/utils.js');
  });

  it('silently ignores invalid JSON', () => {
    const { result } = renderHook(() => useFileStore());
    expect(() => {
      act(() => { result.current.loadFilePrefs({ pinned: 'bad json', recent: null }); });
    }).not.toThrow();
  });
}