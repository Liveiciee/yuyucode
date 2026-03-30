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

describe('useFileStore — pinned files', () => {
  it('togglePin adds file to pinnedFiles', async () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.togglePin('/project/App.jsx'); });
    expect(result.current.pinnedFiles).toContain('/project/App.jsx');
  });

  it('togglePin removes already-pinned file', async () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.togglePin('/project/App.jsx'); });
    act(() => { result.current.togglePin('/project/App.jsx'); });
    expect(result.current.pinnedFiles).not.toContain('/project/App.jsx');
  });
});
