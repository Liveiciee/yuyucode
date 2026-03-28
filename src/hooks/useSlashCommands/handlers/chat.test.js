// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSearch } from './chat.js';

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
