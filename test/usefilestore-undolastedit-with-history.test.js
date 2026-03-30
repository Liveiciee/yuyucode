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

describe('useFileStore — undoLastEdit with history', () => {
  it('restores last edit and removes it from history', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.setEditHistory([{ path: '/project/A.js', content: 'old content' }]); });

    const onMsg = vi.fn();
    await act(async () => { await result.current.undoLastEdit(onMsg); });

    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'write', path: '/project/A.js', content: 'old content',
    }));
    expect(onMsg).toHaveBeenCalledWith(expect.stringContaining('Undo'));
    expect(result.current.editHistory).toHaveLength(0);
  });
});
