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

describe('useFileStore — handleApprove approve', () => {
  it('backs up, writes, and updates messages on success', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup content' }) // backup read
      .mockResolvedValueOnce({ ok: true });                         // write

    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), {}
      );
    });
    expect(setMessages).toHaveBeenCalled();
  });

  it('rolls back atomically when write fails with multiple targets', async () => {
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup_a' })
      .mockResolvedValueOnce({ ok: true, data: 'backup_b' })
      .mockResolvedValue({ ok: true });

    utilsModule.executeAction.mockResolvedValueOnce({ ok: false, data: 'disk full' });

    const messages = [{ role: 'assistant', content: 'write', actions }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, '__all__', messages, setMessages, '/project', { postWrite: [] }, vi.fn(), {}
      );
    });
    // rollback → write called for backups
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });

  it('runs _verifySyntaxBatch when exec permission active', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_OK' }); // syntax check

    const action = { type: 'write_file', path: 'src/App.js', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), { exec: true }
      );
    });
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });
});
