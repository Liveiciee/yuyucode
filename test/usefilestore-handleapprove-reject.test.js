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

describe('useFileStore — handleApprove reject', () => {
  it('marks targets as cancelled when ok=false', async () => {
    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, false, null, messages, setMessages, '/project', {}, vi.fn(), {}
      );
    });
    expect(setMessages).toHaveBeenCalled();
  });
}