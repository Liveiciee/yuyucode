// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleDiff, handleHistory, handleStatus } from '../../../../src/hooks/useSlashCommands/handlers/git.js';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../api.js', () => ({
  callServer: vi.fn(),
}));

vi.mock('../../../constants.js', () => ({
  MODELS: [
    { id: 'gpt-4', label: 'GPT-4' },
    { id: 'claude-3', label: 'Claude 3' },
  ],
}));

vi.mock('../helpers/withLoading.js', () => ({
  withLoading: vi.fn(),
}));

vi.mock('../helpers/simpleResponse.js', () => ({
  simpleResponse: vi.fn(),
}));

import { simpleResponse } from '../helpers/simpleResponse.js';
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';


describe('git handlers', () => {
  let mockSetMessages;
  let mockSetLoading;
  let mockSetShowFileHistory;
  let mockFolder;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetMessages = vi.fn();
    mockSetLoading = vi.fn();
    mockSetShowFileHistory = vi.fn();
    mockFolder = '/test/folder';

    withLoading.mockImplementation(async (setLoading, fn) => {
      setLoading(true);
      try {
        return await fn();
      } finally {
        setLoading(false);
      }
    });
  });

  // helper: stat dengan banyak baris (>= 50) agar tidak trigger full diff fetch
  const bigStat = () => Array(60).fill('file.js | 1 +').join('\n');
  // helper: stat kecil (< 50 baris) + full diff sekaligus
  const mockStatAndFull = (statData, fullData = '-old\n+new\n') => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: statData })
      .mockResolvedValueOnce({ ok: true, data: fullData });
  };

  // ─── handleDiff ────────────────────────────────────────────────

  describe('handleDiff', () => {
    it('returns a promise', () => {
      callServer.mockResolvedValue({ ok: false, data: '' });
      const result = handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(result).toBeInstanceOf(Promise);
    });

    it('calls withLoading with setLoading', async () => {
      callServer.mockResolvedValue({ ok: false, data: '' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(withLoading).toHaveBeenCalledWith(mockSetLoading, expect.any(Function));
    });

    it('shows no-diff message when ok:false', async () => {
      callServer.mockResolvedValue({ ok: false, data: '' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('Tidak ada diff'));
    });

    it('shows no-diff message when data is empty string', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('Tidak ada diff'));
    });

    it('shows no-diff message when data is only whitespace', async () => {
      callServer.mockResolvedValue({ ok: true, data: '   \n  ' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('Tidak ada diff'));
    });

    it('no-diff message includes usage hint', async () => {
      callServer.mockResolvedValue({ ok: false, data: '' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('Usage'));
    });

    it('calls git diff HEAD --stat by default (no range)', async () => {
      callServer.mockResolvedValue({ ok: true, data: bigStat() });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith({
        type: 'exec',
        path: mockFolder,
        command: 'git diff HEAD --stat',
      });
    });

    it('calls git diff with range when provided', async () => {
      callServer.mockResolvedValue({ ok: true, data: bigStat() });
      await handleDiff({ parts: ['/diff', 'v3.0..v3.1'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith({
        type: 'exec',
        path: mockFolder,
        command: 'git diff v3.0..v3.1 --stat',
      });
    });

    it('handles multi-word range via parts', async () => {
      callServer.mockResolvedValue({ ok: true, data: bigStat() });
      await handleDiff({ parts: ['/diff', 'main', 'feature'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith({
        type: 'exec',
        path: mockFolder,
        command: 'git diff main feature --stat',
      });
    });

    it('uses correct folder path in callServer', async () => {
      callServer.mockResolvedValue({ ok: true, data: bigStat() });
      const customFolder = '/my/project';
      await handleDiff({ parts: ['/diff'], folder: customFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ path: customFolder }));
    });

    it('fetches full diff when stat lines < 50', async () => {
      mockStatAndFull(Array(10).fill('file.js | 1 +').join('\n'));
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledTimes(2);
      expect(callServer).toHaveBeenNthCalledWith(2, {
        type: 'exec',
        path: mockFolder,
        command: 'git diff HEAD',
      });
    });

    it('fetches full diff with range when lines < 50', async () => {
      mockStatAndFull(Array(5).fill('x | 1 +').join('\n'));
      await handleDiff({ parts: ['/diff', 'v1..v2'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenNthCalledWith(2, {
        type: 'exec',
        path: mockFolder,
        command: 'git diff v1..v2',
      });
    });

    it('does NOT fetch full diff when stat lines >= 50', async () => {
      callServer.mockResolvedValueOnce({ ok: true, data: bigStat() });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledTimes(1);
    });

    it('includes ```diff block in response when lines < 50', async () => {
      mockStatAndFull(Array(5).fill('x | 1 +').join('\n'));
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('```diff'));
    });

    it('does NOT include ```diff block when full diff fetch fails', async () => {
      callServer
        .mockResolvedValueOnce({ ok: true, data: Array(5).fill('x | 1 +').join('\n') })
        .mockResolvedValueOnce({ ok: false, data: '' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse.mock.calls[0][1]).not.toContain('```diff');
    });

    it('truncates full diff to 3000 chars', async () => {
      mockStatAndFull('x | 1 +\n', 'x'.repeat(5000));
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      const msg = simpleResponse.mock.calls[0][1];
      expect(msg).toContain('x'.repeat(3000));
      expect(msg).not.toContain('x'.repeat(3001));
    });

    it('response includes stat data', async () => {
      // stat 1 baris → lines < 50 → butuh mock ke-2 untuk full diff
      callServer
        .mockResolvedValueOnce({ ok: true, data: 'src/app.js | 10 ++++------\n' })
        .mockResolvedValueOnce({ ok: true, data: '-old\n+new\n' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('src/app.js'));
    });

    it('response includes range in header when range provided', async () => {
      callServer.mockResolvedValue({ ok: true, data: bigStat() });
      await handleDiff({ parts: ['/diff', 'v1..v2'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('v1..v2'));
    });

    it('response includes HEAD when no range', async () => {
      callServer.mockResolvedValue({ ok: true, data: bigStat() });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('HEAD'));
    });

    it('does not call simpleResponse twice when no diff', async () => {
      callServer.mockResolvedValue({ ok: false, data: '' });
      await handleDiff({ parts: ['/diff'], folder: mockFolder, setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledTimes(1);
    });
  });

  // ─── handleHistory ─────────────────────────────────────────────

  describe('handleHistory', () => {
    it('shows message when no file selected', () => {                                          handleHistory({ selectedFile: null, setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('Buka file dulu'));
    });

    it('shows message when selectedFile is undefined', () => {
      handleHistory({ selectedFile: undefined, setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.any(String));
    });

    it('shows message when selectedFile is empty string', () => {
      handleHistory({ selectedFile: '', setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.any(String));
    });

    it('does NOT call setShowFileHistory when no file selected', () => {
      handleHistory({ selectedFile: null, setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(mockSetShowFileHistory).not.toHaveBeenCalled();
    });

    it('calls setShowFileHistory(true) when file is selected', () => {
      handleHistory({ selectedFile: 'src/app.js', setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(mockSetShowFileHistory).toHaveBeenCalledWith(true);
    });

    it('does NOT call simpleResponse when file is selected', () => {
      handleHistory({ selectedFile: 'src/app.js', setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(simpleResponse).not.toHaveBeenCalled();
    });

    it('does NOT use withLoading', () => {
      handleHistory({ selectedFile: 'src/app.js', setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(withLoading).not.toHaveBeenCalled();
    });

    it('works with any truthy selectedFile value', () => {
      handleHistory({ selectedFile: '/deep/nested/path/file.ts', setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(mockSetShowFileHistory).toHaveBeenCalledWith(true);
      expect(simpleResponse).not.toHaveBeenCalled();
    });

    it('setShowFileHistory called exactly once', () => {
      handleHistory({ selectedFile: 'file.js', setShowFileHistory: mockSetShowFileHistory, setMessages: mockSetMessages });
      expect(mockSetShowFileHistory).toHaveBeenCalledTimes(1);
    });
  });

  // ─── handleStatus ──────────────────────────────────────────────

  describe('handleStatus', () => {
    const defaultMocks = () => {
      callServer
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, data: 'M src/app.js\n' })
        .mockResolvedValueOnce({ ok: true, data: 'v20.0.0\n' })
        .mockResolvedValueOnce({ ok: true, data: '/dev/sda1 50G 20G 30G 40% /\n' });
    };

    it('returns a promise', () => {
      defaultMocks();
      const result = handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(result).toBeInstanceOf(Promise);
    });

    it('calls withLoading with setLoading', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(withLoading).toHaveBeenCalledWith(mockSetLoading, expect.any(Function));
    });

    it('calls callServer exactly 4 times', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledTimes(4);
    });

    it('calls ping without path', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith({ type: 'ping' });
    });

    it('calls git status with correct command and folder', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith({ type: 'exec', path: mockFolder, command: 'git status --short 2>&1 | head -5' });
    });

    it('calls node --version with correct folder', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith({ type: 'exec', path: mockFolder, command: 'node --version 2>&1' });
    });

    it('calls df -h with correct folder', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(callServer).toHaveBeenCalledWith({ type: 'exec', path: mockFolder, command: 'df -h . 2>&1 | tail -1' });
    });

    it('shows ✅ Online when ping ok', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('✅ Online'));
    });

    it('shows ❌ Offline when ping fails', async () => {
      callServer
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, data: '' })
        .mockResolvedValueOnce({ ok: true, data: 'v20\n' })
        .mockResolvedValueOnce({ ok: true, data: 'disk\n' });
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('❌ Offline'));
    });

    it('shows model label when model found in MODELS', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('GPT-4'));
    });

    it('falls back to raw model id when not found in MODELS', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'unknown-model', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('unknown-model'));
    });

    it('includes git status data in response', async () => {
      callServer
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, data: 'M src/app.js\n' })
        .mockResolvedValueOnce({ ok: true, data: 'v20.0.0\n' })
        .mockResolvedValueOnce({ ok: true, data: 'disk info\n' });
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('M src/app.js'));
    });

    it('includes node version in response', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('v20.0.0'));
    });

    it('includes disk info in response', async () => {
      callServer
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, data: '' })
        .mockResolvedValueOnce({ ok: true, data: 'v18\n' })
        .mockResolvedValueOnce({ ok: true, data: '40%\n' });
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('40%'));
    });

    it('truncates git status to 60 chars', async () => {
      callServer
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, data: 'M ' + 'x'.repeat(100) })
        .mockResolvedValueOnce({ ok: true, data: 'v20\n' })
        .mockResolvedValueOnce({ ok: true, data: 'disk\n' });
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      const msg = simpleResponse.mock.calls[0][1];
      const gitLine = msg.split('\n').find(l => l.startsWith('**Git:**'));
      expect(gitLine.replace('**Git:** ', '').length).toBeLessThanOrEqual(60);
    });

    it('handles empty git data gracefully', async () => {
      callServer
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, data: '' })
        .mockResolvedValueOnce({ ok: true, data: 'v20\n' })
        .mockResolvedValueOnce({ ok: true, data: 'disk\n' });
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledTimes(1);
    });

    it('handles null data fields gracefully (no crash)', async () => {
      callServer
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, data: null })
        .mockResolvedValueOnce({ ok: true, data: null })
        .mockResolvedValueOnce({ ok: true, data: null });
      await expect(
        handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages })
      ).resolves.not.toThrow();
    });

    it('calls simpleResponse exactly once', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledTimes(1);
    });

    it('uses 📊 emoji in response header', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, expect.stringContaining('📊'));
    });

    it('response contains all 5 sections: Server, Model, Git, Node, Disk', async () => {
      defaultMocks();
      await handleStatus({ folder: mockFolder, model: 'gpt-4', setLoading: mockSetLoading, setMessages: mockSetMessages });
      const msg = simpleResponse.mock.calls[0][1];
      ['**Server:**', '**Model:**', '**Git:**', '**Node:**', '**Disk:**'].forEach(section => {
        expect(msg).toContain(section);
      });
    });
  });
});
