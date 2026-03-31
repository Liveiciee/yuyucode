// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock dependencies ─────────────────────────────────────────────────────────
const mockCallServer = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('../src/api.js', () => ({ callServer: mockCallServer }));
// utils.js is NOT mocked as a module — use vi.spyOn per-test to avoid
// replacing the module in the shared registry (isolate:false cache pollution).

import { callServer } from '../src/api.js';
import * as utilsModule from '../src/utils.js';
import { useFileStore } from '../src/hooks/useFileStore.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockResolvedValue({ ok: true, data: '' });
  vi.spyOn(utilsModule, 'executeAction').mockResolvedValue({ ok: true, data: 'written' });
});

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
