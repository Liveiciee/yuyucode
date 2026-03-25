// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleUndo, handleRewind } from './undo.js';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../api.js', () => ({
  callServer: vi.fn(),
}));

vi.mock('../../../features.js', () => ({
  rewindMessages: vi.fn(),
}));

vi.mock('../helpers/withLoading.js', () => ({
  withLoading: vi.fn(),
}));

vi.mock('../helpers/simpleResponse.js', () => ({
  simpleResponse: vi.fn(),
}));

import { simpleResponse } from '../helpers/simpleResponse.js';
import { callServer } from '../../../api.js';
import { rewindMessages } from '../../../features.js';
import { withLoading } from '../helpers/withLoading.js';

describe('undo handlers', () => {
  let mockSetMessages;
  let mockSetEditHistory;
  let mockSetLoading;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetMessages = vi.fn();
    mockSetEditHistory = vi.fn();
    mockSetLoading = vi.fn();

    withLoading.mockImplementation(async (setLoading, fn) => {
      setLoading(true);
      try {
        await fn();
      } finally {
        setLoading(false);
      }
    });
  });

  describe('handleUndo', () => {
    it('shows message when no edit history', () => {
      handleUndo({
        parts: ['/undo'],
        editHistory: [],
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        'Tidak ada edit yang bisa diundo.'
      );
      expect(callServer).not.toHaveBeenCalled();
      expect(withLoading).not.toHaveBeenCalled();
    });

    it('calls withLoading with setLoading', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      const editHistory = [{ path: 'file1.js', content: 'content1' }];

      await handleUndo({
        parts: ['/undo'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(withLoading).toHaveBeenCalledWith(mockSetLoading, expect.any(Function));
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('undoes last edit with default n=1', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      const editHistory = [
        { path: 'file1.js', content: 'content1' },
        { path: 'file2.js', content: 'content2' },
      ];

      await handleUndo({
        parts: ['/undo'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(callServer).toHaveBeenCalledTimes(1);
      expect(callServer).toHaveBeenCalledWith({
        type: 'write',
        path: 'file2.js',
        content: 'content2',
      });
      expect(mockSetEditHistory).toHaveBeenCalledWith(expect.any(Function));
    });

    it('undoes N edits', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      const editHistory = [
        { path: 'file1.js', content: 'content1' },
        { path: 'file2.js', content: 'content2' },
        { path: 'file3.js', content: 'content3' },
      ];

      await handleUndo({
        parts: ['/undo', '2'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(callServer).toHaveBeenCalledTimes(2);
    });

    it('handles n greater than history length', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      const editHistory = [{ path: 'file1.js', content: 'content1' }];

      await handleUndo({
        parts: ['/undo', '5'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(callServer).toHaveBeenCalledTimes(1);
    });

    it('handles invalid parts[1] as NaN - defaults to n=1', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      const editHistory = [
        { path: 'file1.js', content: 'content1' },
        { path: 'file2.js', content: 'content2' },
      ];

      await handleUndo({
        parts: ['/undo', 'abc'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(callServer).toHaveBeenCalledTimes(1);
      expect(callServer).toHaveBeenCalledWith({
        type: 'write',
        path: 'file2.js',
        content: 'content2',
      });
    });

    it('shows success message with file names', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      const editHistory = [
        { path: 'file1.js', content: 'content1' },
        { path: 'file2.js', content: 'content2' },
      ];

      await handleUndo({
        parts: ['/undo', '2'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('file2.js')
      );
      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('file1.js')
      );
    });

    it('handles failed callServer - shows Berhasil undo with empty list', async () => {
      callServer.mockResolvedValue({ ok: false, data: '' });
      const editHistory = [{ path: 'file1.js', content: 'content1' }];

      await handleUndo({
        parts: ['/undo'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(callServer).toHaveBeenCalled();
      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('Berhasil undo: ')
      );
    });

    it('handles all callServer rejected (throws)', async () => {
      callServer.mockRejectedValue(new Error('network error'));
      const editHistory = [{ path: 'file1.js', content: 'content1' }];

      await handleUndo({
        parts: ['/undo'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(callServer).toHaveBeenCalled();
      // setEditHistory still called even on rejection
      expect(mockSetEditHistory).toHaveBeenCalled();
    });

    it('handles mixed success and failure', async () => {
      callServer
        .mockResolvedValueOnce({ ok: true, data: '' })
        .mockResolvedValueOnce({ ok: false, data: '' })
        .mockResolvedValueOnce({ ok: true, data: '' });

      const editHistory = [
        { path: 'file1.js', content: 'content1' },
        { path: 'file2.js', content: 'content2' },
        { path: 'file3.js', content: 'content3' },
      ];

      await handleUndo({
        parts: ['/undo', '3'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(callServer).toHaveBeenCalledTimes(3);
      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('file3.js, file1.js')
      );
    });

    it('calls setEditHistory with correct callback', async () => {
      callServer.mockResolvedValue({ ok: true, data: '' });
      const editHistory = [
        { path: 'file1.js', content: 'content1' },
        { path: 'file2.js', content: 'content2' },
      ];

      await handleUndo({
        parts: ['/undo'],
        editHistory,
        setEditHistory: mockSetEditHistory,
        setLoading: mockSetLoading,
        setMessages: mockSetMessages,
      });

      expect(mockSetEditHistory).toHaveBeenCalledWith(expect.any(Function));
      const callback = mockSetEditHistory.mock.calls[0][0];
      const result = callback(editHistory);
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('file1.js');
    });
  });

  describe('handleRewind', () => {
    const messages = [
      { role: 'user', content: 'msg1' },
      { role: 'assistant', content: 'reply1' },
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
    ];

    beforeEach(() => {
      rewindMessages.mockReturnValue([]);
    });

    it('rewinds 1 turn by default', () => {
      handleRewind({
        parts: ['/rewind'],
        messages,
        setMessages: mockSetMessages,
      });

      expect(rewindMessages).toHaveBeenCalledWith(messages, 1);
      expect(mockSetMessages).toHaveBeenCalled();
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, 'Rewind 1 turn');
    });

    it('rewinds specified number of turns', () => {
      handleRewind({
        parts: ['/rewind', '2'],
        messages,
        setMessages: mockSetMessages,
      });

      expect(rewindMessages).toHaveBeenCalledWith(messages, 2);
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, 'Rewind 2 turn');
    });

    it('handles invalid turns - defaults to 1', () => {
      handleRewind({
        parts: ['/rewind', 'abc'],
        messages,
        setMessages: mockSetMessages,
      });

      expect(rewindMessages).toHaveBeenCalledWith(messages, 1);
    });

    it('sets messages to result of rewindMessages', () => {
      const rewound = [{ role: 'user', content: 'msg1' }];
      rewindMessages.mockReturnValue(rewound);

      handleRewind({
        parts: ['/rewind'],
        messages,
        setMessages: mockSetMessages,
      });

      expect(mockSetMessages).toHaveBeenCalledWith(rewound);
    });
  });
});
