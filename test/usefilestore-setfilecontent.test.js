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

describe('useFileStore — setFileContent', () => {
  it('updates content of active tab', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'original' });
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.setFileContent('updated'); });
    expect(result.current.openTabs[0].content).toBe('updated');
    expect(result.current.openTabs[0].dirty).toBe(true);
  });

  it('does nothing when no tabs open', () => {
    const { result } = renderHook(() => useFileStore());
    expect(() => {
      act(() => { result.current.setFileContent('anything'); });
    }).not.toThrow();
  });
});
