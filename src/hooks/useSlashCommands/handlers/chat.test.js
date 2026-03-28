// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSearch, handleClear, handleStop, handleRename } from './chat.js';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    remove: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../helpers/simpleResponse.js', () => ({
  simpleResponse: vi.fn(),
}));

import { simpleResponse } from '../helpers/simpleResponse.js';
import { Preferences } from '@capacitor/preferences';

describe('chat handlers - handleSearch', () => {
  const setMessages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows usage when query is empty', async () => {
    await handleSearch({
      parts: ['/search'],
      searchMessages: vi.fn(),
      setMessages,
    });

    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('`/search <keyword>`')
    );
  });

  it('shows no-result message when search is empty', async () => {
    const searchMessages = vi.fn().mockResolvedValue([]);

    await handleSearch({
      parts: ['/search', 'missing'],
      searchMessages,
      setMessages,
    });

    expect(searchMessages).toHaveBeenCalledWith('missing');
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Tidak ada hasil')
    );
  });

  it('formats and returns top results', async () => {
    const searchMessages = vi.fn().mockResolvedValue([
      { content: 'hasil pertama sangat penting' },
      { content: 'hasil kedua juga penting' },
    ]);

    await handleSearch({
      parts: ['/search', 'penting'],
      searchMessages,
      setMessages,
    });

    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Hasil pencarian')
    );
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('1. hasil pertama')
    );
  });

  it('handles search errors gracefully', async () => {
    const searchMessages = vi.fn().mockRejectedValue(new Error('db down'));

    await handleSearch({
      parts: ['/search', 'apa aja'],
      searchMessages,
      setMessages,
    });

    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Search gagal: db down')
    );
  });
});

describe('chat handlers - basic controls', () => {
  const setMessages = vi.fn();
  const setGracefulStop = vi.fn();
  const setSessionName = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleClear asks for confirmation when messages are long and no force flag', () => {
    handleClear({
      parts: ['/clear'],
      messages: new Array(4).fill({ role: 'user', content: 'x' }),
      setMessages,
    });

    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('/clear force')
    );
    expect(Preferences.remove).not.toHaveBeenCalled();
  });

  it('handleClear force clears and removes history from Preferences', () => {
    handleClear({
      parts: ['/clear', 'force'],
      messages: new Array(8).fill({ role: 'user', content: 'x' }),
      setMessages,
    });

    expect(setMessages).toHaveBeenCalledWith([
      expect.objectContaining({ role: 'assistant' }),
    ]);
    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'yc_history' });
  });

  it('handleStop sets graceful stop when loading is active', () => {
    handleStop({
      loading: true,
      setGracefulStop,
      setMessages,
    });

    expect(setGracefulStop).toHaveBeenCalledWith(true);
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Graceful stop')
    );
  });

  it('handleRename updates session name and persists to Preferences', () => {
    handleRename({
      parts: ['/rename', 'Sesi', 'Baru'],
      setSessionName,
      setMessages,
    });

    expect(setSessionName).toHaveBeenCalledWith('Sesi Baru');
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'yc_session_name',
      value: 'Sesi Baru',
    });
  });
});
