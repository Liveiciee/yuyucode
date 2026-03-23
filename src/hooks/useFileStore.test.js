// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockCallServer      = vi.hoisted(() => vi.fn());
const mockPreferencesSet  = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockExecuteAction   = vi.hoisted(() => vi.fn().mockResolvedValue({ ok: true, data: 'written' }));
const mockBackupFiles     = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockVerifySyntax    = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: mockPreferencesSet,
  },
}));
vi.mock('../api.js', () => ({ callServer: mockCallServer }));
vi.mock('../utils.js', () => ({
  executeAction:      mockExecuteAction,
  resolvePath:        (base, p) => (p.startsWith('/') ? p : base + '/' + p),
  verifySyntaxBatch:  mockVerifySyntax,
  backupFiles:        mockBackupFiles,
}));

import { useFileStore } from './useFileStore.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockResolvedValue({ ok: true, data: 'file content' });
  mockPreferencesSet.mockResolvedValue(undefined);
  mockExecuteAction.mockResolvedValue({ ok: true, data: 'written' });
  mockBackupFiles.mockResolvedValue([]);
});

// ── initial state ──────────────────────────────────────────────────────────────
describe('useFileStore — initial state', () => {
  it('starts with no open tabs', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.openTabs).toHaveLength(0);
  });

  it('starts with activeTab = chat', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.activeTab).toBe('chat');
  });

  it('selectedFile is null with no tabs', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.selectedFile).toBeNull();
  });

  it('fileContent is null with no tabs', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.fileContent).toBeNull();
  });

  it('editHistory starts empty', () => {
    const { result } = renderHook(() => useFileStore());
    expect(result.current.editHistory).toHaveLength(0);
  });
});

// ── openFile ──────────────────────────────────────────────────────────────────
describe('useFileStore — openFile', () => {
  it('opens a new tab and sets it active', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    expect(result.current.openTabs).toHaveLength(1);
    expect(result.current.openTabs[0].path).toBe('/project/App.jsx');
    expect(result.current.openTabs[0].dirty).toBe(false);
  });

  it('switches activeTab to file', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    expect(result.current.activeTab).toBe('file');
  });

  it('does not duplicate tab for same path', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    expect(result.current.openTabs).toHaveLength(1);
  });

  it('switches to existing tab when reopening same file', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });
    await act(async () => { await result.current.openFile('/project/A.js'); });
    expect(result.current.activeTabIdx).toBe(0);
  });

  it('adds file to recentFiles', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    expect(result.current.recentFiles).toContain('/project/App.jsx');
  });

  it('deduplicates recentFiles', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });
    await act(async () => { await result.current.openFile('/project/App.jsx'); });
    const count = result.current.recentFiles.filter(f => f === '/project/App.jsx').length;
    expect(count).toBe(1);
  });

  it('stores error content when server read fails', async () => {
    mockCallServer.mockResolvedValueOnce({ ok: false, data: 'not found' });
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/missing.js'); });
    expect(result.current.openTabs[0].content).toMatch(/Error/);
  });

  it('caps recentFiles at 8 entries', async () => {
    const { result } = renderHook(() => useFileStore());
    for (let i = 0; i < 10; i++) {
      await act(async () => { await result.current.openFile(`/project/file${i}.js`); });
    }
    expect(result.current.recentFiles.length).toBeLessThanOrEqual(8);
  });
});

// ── closeTab ──────────────────────────────────────────────────────────────────
describe('useFileStore — closeTab', () => {
  it('removes tab by index', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });
    act(() => { result.current.closeTab(0); });
    expect(result.current.openTabs).toHaveLength(1);
    expect(result.current.openTabs[0].path).toBe('/project/B.js');
  });

  it('switches to chat when last tab is closed', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.closeTab(0); });
    expect(result.current.activeTab).toBe('chat');
  });

  it('does nothing when no tabs open', () => {
    const { result } = renderHook(() => useFileStore());
    expect(() => act(() => { result.current.closeTab(0); })).not.toThrow();
  });

  it('adjusts activeTabIdx when closing tab before active', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });
    await act(async () => { await result.current.openFile('/project/C.js'); });
    act(() => { result.current.closeTab(0); });
    expect(result.current.activeTabIdx).toBeGreaterThanOrEqual(0);
    expect(result.current.activeTabIdx).toBeLessThan(result.current.openTabs.length);
  });
});

// ── updateTabContent ──────────────────────────────────────────────────────────
describe('useFileStore — updateTabContent', () => {
  it('marks tab dirty', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'new content'); });
    expect(result.current.openTabs[0].dirty).toBe(true);
  });

  it('updates content', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'updated'); });
    expect(result.current.openTabs[0].content).toBe('updated');
  });

  it('only updates the targeted tab', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.openFile('/project/B.js'); });
    act(() => { result.current.updateTabContent(0, 'changed A'); });
    expect(result.current.openTabs[1].dirty).toBe(false);
  });
});

// ── saveFile ──────────────────────────────────────────────────────────────────
describe('useFileStore — saveFile', () => {
  it('writes to server', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.saveFile('saved content'); });
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write', path: '/project/A.js' }));
  });

  it('marks tab clean after save', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    act(() => { result.current.updateTabContent(0, 'changed'); });
    await act(async () => { await result.current.saveFile('changed'); });
    expect(result.current.openTabs[0].dirty).toBe(false);
  });

  it('calls onMsg callback with filename', async () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.saveFile('content', onMsg); });
    expect(onMsg).toHaveBeenCalledWith(expect.stringContaining('A.js'));
  });

  it('does nothing when no tab is open', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.saveFile('content'); });
    expect(mockCallServer).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });

  it('adds to editHistory before save', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.saveFile('new content'); });
    expect(result.current.editHistory).toHaveLength(1);
    expect(result.current.editHistory[0].path).toBe('/project/A.js');
  });
});

// ── togglePin ─────────────────────────────────────────────────────────────────
describe('useFileStore — togglePin', () => {
  it('pins a file', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.togglePin('/project/A.js'); });
    expect(result.current.pinnedFiles).toContain('/project/A.js');
  });

  it('unpins an already-pinned file', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.togglePin('/project/A.js'); });
    act(() => { result.current.togglePin('/project/A.js'); });
    expect(result.current.pinnedFiles).not.toContain('/project/A.js');
  });

  it('persists to Preferences', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.togglePin('/project/A.js'); });
    expect(mockPreferencesSet).toHaveBeenCalledWith(expect.objectContaining({ key: 'yc_pinned' }));
  });
});

// ── undoLastEdit ──────────────────────────────────────────────────────────────
describe('useFileStore — undoLastEdit', () => {
  it('restores last saved content', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.saveFile('v1'); });
    await act(async () => { await result.current.undoLastEdit(); });
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write', path: '/project/A.js' }));
  });

  it('removes entry from editHistory after undo', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.saveFile('v1'); });
    await act(async () => { await result.current.undoLastEdit(); });
    expect(result.current.editHistory).toHaveLength(0);
  });

  it('calls onMsg callback', async () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.saveFile('v1'); });
    await act(async () => { await result.current.undoLastEdit(onMsg); });
    expect(onMsg).toHaveBeenCalledWith(expect.stringContaining('A.js'));
  });

  it('does nothing when history is empty', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.undoLastEdit(); });
    expect(mockCallServer).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });
});

// ── loadFilePrefs ─────────────────────────────────────────────────────────────
describe('useFileStore — loadFilePrefs', () => {
  it('loads pinned files from JSON string', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.loadFilePrefs({ pinned: JSON.stringify(['/project/A.js']), recent: null }); });
    expect(result.current.pinnedFiles).toContain('/project/A.js');
  });

  it('loads recent files from JSON string', () => {
    const { result } = renderHook(() => useFileStore());
    act(() => { result.current.loadFilePrefs({ pinned: null, recent: JSON.stringify(['/project/B.js']) }); });
    expect(result.current.recentFiles).toContain('/project/B.js');
  });

  it('silently ignores invalid JSON', () => {
    const { result } = renderHook(() => useFileStore());
    expect(() => act(() => { result.current.loadFilePrefs({ pinned: 'not-json', recent: null }); })).not.toThrow();
  });

  it('silently ignores null values', () => {
    const { result } = renderHook(() => useFileStore());
    expect(() => act(() => { result.current.loadFilePrefs({ pinned: null, recent: null }); })).not.toThrow();
  });
});

// ── readFilesParallel ─────────────────────────────────────────────────────────
describe('useFileStore — readFilesParallel', () => {
  it('reads multiple files in parallel', async () => {
    mockCallServer.mockResolvedValue({ ok: true, data: 'content' });
    const { result } = renderHook(() => useFileStore());
    let res;
    await act(async () => { res = await result.current.readFilesParallel(['A.js', 'B.js'], '/project'); });
    expect(Object.keys(res)).toHaveLength(2);
    expect(mockCallServer).toHaveBeenCalledTimes(2);
  });
});

// ── setSelectedFile (compat) ──────────────────────────────────────────────────
describe('useFileStore — setSelectedFile (compat)', () => {
  it('opens file when path given', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.setSelectedFile('/project/A.js'); });
    expect(result.current.openTabs).toHaveLength(1);
  });

  it('closes active tab when null given with open tabs', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.openFile('/project/A.js'); });
    await act(async () => { await result.current.setSelectedFile(null); });
    expect(result.current.openTabs).toHaveLength(0);
  });

  it('switches to chat when null given with no tabs', async () => {
    const { result } = renderHook(() => useFileStore());
    await act(async () => { await result.current.setSelectedFile(null); });
    expect(result.current.activeTab).toBe('chat');
  });
});
