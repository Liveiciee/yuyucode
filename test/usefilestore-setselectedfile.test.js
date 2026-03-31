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
vi.mock('../src/api.js', () => ({ callServer: mockCallServer }));
// utils.js is NOT mocked as a module — use vi.spyOn per-test to avoid
// replacing the module in the shared registry (isolate:false cache pollution).

import { callServer } from '../src/api.js';
import * as utilsModule from '../src/utils.js';
import { useFileStore } from './hooks/useFileStore.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockResolvedValue({ ok: true, data: '' });
  vi.spyOn(utilsModule, 'executeAction').mockResolvedValue({ ok: true, data: 'written' });
});

// ── Multi-tab core ────────────────────────────────────────────────────────────

describe('useFileStore — setSelectedFile', () => {
  it('calls openFile when given a path', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.setSelectedFile('/project/App.jsx'); });
    expect(result.current.openTabs).toHaveLength(1);
  });

  it('closes active tab when called with null/falsy', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.setSelectedFile(null); });
    expect(result.current.openTabs).toHaveLength(0);
    expect(result.current.activeTab).toBe('chat');
  });
});
