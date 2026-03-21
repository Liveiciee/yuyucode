import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:  vi.fn().mockResolvedValue({ value: null }),
    set:  vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('./api.js', () => ({ callServer: vi.fn() }));
vi.mock('./utils.js', () => ({
  executeAction: vi.fn(),
  resolvePath: vi.fn((base, p) => base + '/' + p),
}));

import { callServer } from './api.js';
import { useFileStore } from './hooks/useFileStore.js';

beforeEach(() => vi.clearAllMocks());

// ── Multi-tab core ────────────────────────────────────────────────────────────
describe('useFileStore — multi-tab', () => {
  it('starts with empty tabs and chat activeTab', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.openTabs).toEqual([]);
    expect(result.current.activeTab).toBe('chat');
    expect(result.current.activeTabIdx).toBe(0);
  });

  it('openFile adds a new tab and switches activeTab to file', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1;' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => {
      await result.current.openFile('/project/src/App.jsx');
    });

    expect(result.current.openTabs).toHaveLength(1);
    expect(result.current.openTabs[0].path).toBe('/project/src/App.jsx');
    expect(result.current.openTabs[0].content).toBe('const x = 1;');
    expect(result.current.openTabs[0].dirty).toBe(false);
    expect(result.current.activeTab).toBe('file');
    expect(result.current.activeTabIdx).toBe(0);
  });

  it('openFile reuses existing tab instead of duplicating', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    await act(async () => { await result.current.openFile('/project/App.jsx'); });

    expect(result.current.openTabs).toHaveLength(1);
  });

  it('openFile adds multiple distinct tabs', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });

    expect(result.current.openTabs).toHaveLength(2);
    expect(result.current.activeTabIdx).toBe(1);
  });

  it('closeTab removes tab and adjusts activeTabIdx', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });

    act(() => { result.current.closeTab(0); });

    expect(result.current.openTabs).toHaveLength(1);
    expect(result.current.openTabs[0].path).toBe('/project/B.js');
  });

  it('closeTab last tab resets to chat', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.closeTab(0); });

    expect(result.current.openTabs).toHaveLength(0);
    expect(result.current.activeTab).toBe('chat');
  });

  it('setActiveTabIdx switches active tab', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });

    act(() => { result.current.setActiveTabIdx(0); });

    expect(result.current.activeTabIdx).toBe(0);
    expect(result.current.activeTab).toBe('file');
  });

  it('updateTabContent marks tab dirty', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'original' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'modified'); });

    expect(result.current.openTabs[0].dirty).toBe(true);
    expect(result.current.openTabs[0].content).toBe('modified');
  });

  it('selectedFile derived from active tab path', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/App.jsx'); });

    expect(result.current.selectedFile).toBe('/project/App.jsx');
  });

  it('fileContent derived from active tab content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'hello world' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/App.jsx'); });

    expect(result.current.fileContent).toBe('hello world');
  });

  it('selectedFile is null when no tabs open', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.selectedFile).toBeNull();
  });

  it('saveFile writes to server and clears dirty', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'original' })
      .mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'changed'); });
    await act(async () => { await result.current.saveFile('changed'); });

    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write', content: 'changed' }));
    expect(result.current.openTabs[0].dirty).toBe(false);
  });

  it('openFile shows error content if server fails', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'not found' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/missing.js'); });

    expect(result.current.openTabs[0].content).toContain('Error:');
  });

  it('adds to recentFiles on open', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    await act(async () => { await result.current.openFile('/project/A.js'); });

    expect(result.current.recentFiles).toContain('/project/A.js');
  });

  it('recentFiles capped at 8', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'code' });
    const { result } = renderHook(() => useFileStore());

    for (let i = 0; i < 10; i++) {
      await act(async () => { await result.current.openFile(`/project/file${i}.js`); });
    }

    expect(result.current.recentFiles.length).toBeLessThanOrEqual(8);
  });
});

// ── Pinned files ──────────────────────────────────────────────────────────────
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

// ── Undo ──────────────────────────────────────────────────────────────────────
describe('useFileStore — undoLastEdit', () => {
  it('does nothing when history is empty', async () => {
    const { result } = renderHook(() => useFileStore());
    const onMsg = vi.fn();
    await act(async () => { await result.current.undoLastEdit(onMsg); });
    expect(callServer).not.toHaveBeenCalled();
    expect(onMsg).not.toHaveBeenCalled();
  });
});

// ── undoLastEdit with history ─────────────────────────────────────────────────
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

// ── readFilesParallel ─────────────────────────────────────────────────────────
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

// ── loadFilePrefs ─────────────────────────────────────────────────────────────
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
});

// ── setSelectedFile ───────────────────────────────────────────────────────────
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

// ── setFileContent ────────────────────────────────────────────────────────────
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

// ── saveFile edge cases ───────────────────────────────────────────────────────
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

// ── closeTab edge case: empty tabs ────────────────────────────────────────────
describe('useFileStore — closeTab on empty', () => {
  it('does nothing when no tabs open', () => {
    const { result } = renderHook(() => useFileStore());
    expect(() => act(() => { result.current.closeTab(0); })).not.toThrow();
  });
});

// ── setSelectedFile — no tabs, null path → setActiveTab chat ─────────────────
describe('useFileStore — setSelectedFile null with no tabs', () => {
  it('calls setActiveTab chat when no tabs open and path is null', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.setSelectedFile(null); });
    expect(result.current.activeTab).toBe('chat');
  });
});

// ── handleApprove — reject ────────────────────────────────────────────────────
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
});

// ── handleApprove — approve single file ──────────────────────────────────────
describe('useFileStore — handleApprove approve', () => {
  it('backs up, writes, and updates messages on success', async () => {
    const { executeAction } = await import('./hooks/useFileStore.js').catch(() => ({}));
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'backup content' }) // backup read
      .mockResolvedValueOnce({ ok: true });                         // write

    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const mockExecuteActionLocal = vi.fn().mockResolvedValue({ ok: true, data: 'written' });
    const { executeAction: execAct } = await import('./utils.js');
    execAct.mockResolvedValue({ ok: true, data: 'written' });

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
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'backup_a' })
      .mockResolvedValueOnce({ ok: true, data: 'backup_b' })
      .mockResolvedValue({ ok: true });

    const { executeAction: execAct } = await import('./utils.js');
    execAct.mockResolvedValueOnce({ ok: false, data: 'disk full' });

    const messages = [{ role: 'assistant', content: 'write', actions }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, '__all__', messages, setMessages, '/project', { postWrite: [] }, vi.fn(), {}
      );
    });
    // rollback → write called for backups
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });

  it('runs _verifySyntaxBatch when exec permission active', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_OK' }); // syntax check

    const { executeAction: execAct } = await import('./utils.js');
    execAct.mockResolvedValue({ ok: true, data: 'written' });

    const action = { type: 'write_file', path: 'src/App.js', executed: false };
    const messages = [{ role: 'assistant', content: 'write', actions: [action] }];
    const setMessages = vi.fn(fn => typeof fn === 'function' ? fn(messages) : undefined);

    const { result } = renderHook(() => useFileStore());
    await act(async () => {
      await result.current.handleApprove(
        0, true, null, messages, setMessages, '/project', { postWrite: [] }, vi.fn(), { exec: true }
      );
    });
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });
});
