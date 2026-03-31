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

describe('useFileStore — readFilesParallel', () => {
  it('reads multiple files in parallel and returns keyed results', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'content A' })
      .mockResolvedValueOnce({ ok: true, data: 'content B' });

    const { result } = renderHook(() => useFileStore());
    let out;
    await act(async () => {
      out = await result.current.readFilesParallel(['/src/A.js', '/src/B.js'], '/project');
    });

    expect(out['/src/A.js'].data).toBe('content A');
    expect(out['/src/B.js'].data).toBe('content B');
  });
});
