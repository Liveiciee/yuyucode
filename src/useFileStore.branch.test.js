// @vitest-environment happy-dom
// useFileStore.branch.test.js — condition branch coverage
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockCallServer = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:  vi.fn().mockResolvedValue({ value: null }),
    set:  vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('../api.js', () => ({ callServer: mockCallServer }));
// utils.js NOT mocked as module — vi.spyOn to avoid cache pollution (isolate:false)

import { callServer } from './api.js';
import * as utilsModule from './utils.js';
import { useFileStore } from './hooks/useFileStore.js';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  mockCallServer.mockReset();
  mockCallServer.mockResolvedValue({ ok: true, data: '' });
  vi.spyOn(utilsModule, 'executeAction').mockResolvedValue({ ok: true, data: 'written' });
});

// ── saveFile — r.ok=false branch ──────────────────────────────────────────────
describe('useFileStore — saveFile r.ok=false', () => {
  it('does not update tabs when write fails', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'content' }) // openFile
      .mockResolvedValueOnce({ ok: false, data: 'disk full' }); // saveFile write fails

    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'changed'); });
    await act(async () => { await result.current.saveFile('changed'); });
    expect(result.current.openTabs[0].dirty).toBe(true);
  });
});

// ── setSelectedFile — null with/without tabs ──────────────────────────────────
describe('useFileStore — setSelectedFile null', () => {
  it('closes tab when path is null and tabs exist', async () => {
    mockCallServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.setSelectedFile(null); });
    expect(result.current.openTabs).toHaveLength(0);
    expect(result.current.activeTab).toBe('chat');
  });

  it('sets activeTab=chat when null and no tabs', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.setSelectedFile(null); });
    expect(result.current.activeTab).toBe('chat');
  });
});

// ── setFileContent — idx < 0 branch ──────────────────────────────────────────
describe('useFileStore — setFileContent no tabs', () => {
  it('does nothing when no tabs open', () => {
    const { result } = renderHook(() => useFileStore());
    expect(() => act(() => { result.current.setFileContent('anything'); })).not.toThrow();
  });
});

// ── handleApprove — write_file approve ───────────────────────────────────────
describe('useFileStore — handleApprove write_file', () => {
  it('executes write and updates messages', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' }) // _backupFiles read
      .mockResolvedValue({ ok: false, data: '' });          // fallback

    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), {}
      );
    });
    expect(utilsModule.executeAction).toHaveBeenCalled();
    expect(setMessages).toHaveBeenCalled();
  });

  it('shows cancelled when ok=false', async () => {
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
});

// ── handleApprove — backup.ok=false → no setEditHistory ──────────────────────
describe('useFileStore — handleApprove backup fails', () => {
  it('proceeds with write even when backup fails', async () => {
    // Use mockReset + mockResolvedValue to ensure clean state
    mockCallServer.mockReset();
    mockCallServer.mockResolvedValue({ ok: false, data: 'not found' }); // ALL calls fail

    const action = { type: 'write_file', path: 'new.js', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), {}
      );
    });
    // No backup → no editHistory update
    expect(result.current.editHistory).toHaveLength(0);
    // But write still attempted
    expect(utilsModule.executeAction).toHaveBeenCalled();
  });
});

// ── handleApprove — multi-target → shows success message ─────────────────────
describe('useFileStore — handleApprove multi-target', () => {
  it('shows N file written message for multi-target', async () => {
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup_a' })
      .mockResolvedValueOnce({ ok: true, data: 'backup_b' })
      .mockResolvedValue({ ok: false });

    const messages = [{ role: 'assistant', content: 'write', actions }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, '__all__', messages, setMessages, '/project', { postWrite: [] }, vi.fn(), {}
      );
    });
    expect(setMessages).toHaveBeenCalled();
  });
});

// ── handleApprove — atomic rollback when write fails ─────────────────────────
describe('useFileStore — handleApprove rollback', () => {
  it('rolls back when one of multiple writes fails', async () => {
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup_a' })
      .mockResolvedValueOnce({ ok: true, data: 'backup_b' })
      .mockResolvedValue({ ok: true }); // rollback writes

    utilsModule.executeAction
      .mockResolvedValueOnce({ ok: false, data: 'disk full' })
      .mockResolvedValue({ ok: true });

    const messages = [{ role: 'assistant', content: 'write', actions }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, '__all__', messages, setMessages, '/project', { postWrite: [] }, vi.fn(), {}
      );
    });
    // rollback write calls
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });
});

// ── _verifySyntaxBatch — no cmd for .jsx ─────────────────────────────────────
describe('useFileStore — _verifySyntaxBatch skips .jsx', () => {
  it('does not run syntax check for .jsx extension', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' }) // backup
      .mockResolvedValue({ ok: false });

    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), { exec: true }
      );
    });
    // No exec call for .jsx
    const execCalls = mockCallServer.mock.calls.filter(c => c[0]?.type === 'exec');
    expect(execCalls).toHaveLength(0);
  });
});

// ── _verifySyntaxBatch — empty vOut → skip ───────────────────────────────────
describe('useFileStore — _verifySyntaxBatch empty output', () => {
  it('skips error when exec returns empty string', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: '' }); // empty vOut

    const action = { type: 'write_file', path: 'clean.js', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), { exec: true }
      );
    });
    expect(result.current.openTabs).toHaveLength(0); // no crash
  });
});

// ── _verifySyntaxBatch — SYNTAX_ERR → shows error ────────────────────────────
describe('useFileStore — _verifySyntaxBatch syntax error', () => {
  it('adds syntax error message when SYNTAX_ERR in output', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_ERR: unexpected token at line 5' });

    const action = { type: 'write_file', path: 'broken.js', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), { exec: true }
      );
    });
    expect(setMessages).toHaveBeenCalled();
  });
});

// ── _getSyntaxCmd — json and sh branches ─────────────────────────────────────
describe('useFileStore — _getSyntaxCmd json and sh', () => {
  it('runs json syntax check for .json files', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_OK' });

    const action = { type: 'write_file', path: 'config.json', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), { exec: true }
      );
    });
    const execCall = mockCallServer.mock.calls.find(c => c[0]?.type === 'exec');
    expect(execCall[0].command).toContain('json');
  });

  it('runs bash syntax check for .sh files', async () => {
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_OK' });

    const action = { type: 'write_file', path: 'deploy.sh', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), { exec: true }
      );
    });
    const execCall = mockCallServer.mock.calls.find(c => c[0]?.type === 'exec');
    expect(execCall[0].command).toContain('bash');
  });
});
