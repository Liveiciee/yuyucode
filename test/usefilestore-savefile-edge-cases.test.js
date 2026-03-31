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

describe('useFileStore — saveFile edge cases', () => {
  it('does nothing when no tab is open', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.saveFile('content'); });
    expect(callServer).not.toHaveBeenCalled();
  });

  it('calls onMsg callback after successful save', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'code' })
      .mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    const onMsg = vi.fn();
    await act(async () => { await result.current.saveFile('new content', onMsg); });
    expect(onMsg).toHaveBeenCalledWith(expect.stringContaining('Saved'));
  });
});
