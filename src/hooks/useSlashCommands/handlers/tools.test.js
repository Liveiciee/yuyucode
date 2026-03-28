// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleMcp, handleDb } from './tools.js';

vi.mock('../../../api.js', () => ({
  callServer: vi.fn(),
}));

vi.mock('../helpers/withLoading.js', () => ({
  withLoading: async (setLoading, fn) => {
    setLoading?.(true);
    await fn();
    setLoading?.(false);
  },
}));

vi.mock('../helpers/simpleResponse.js', () => ({
  simpleResponse: vi.fn(),
}));

import { callServer } from '../../../api.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

describe('tools handlers', () => {
  const setMessages = vi.fn();
  const setLoading = vi.fn();
  const setShowMCP = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleMcp open shows MCP panel', () => {
    handleMcp({ parts: ['/mcp'], setShowMCP, setLoading, setMessages });
    expect(setShowMCP).toHaveBeenCalledWith(true);
  });

  it('handleMcp list shows tool output', async () => {
    callServer.mockResolvedValueOnce({
      ok: true,
      data: { sqlite: { desc: 'DB tools', actions: ['query'] } },
    });

    await handleMcp({ parts: ['/mcp', 'list'], setShowMCP, setLoading, setMessages });
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('MCP Tools')
    );
  });

  it('handleDb shows usage for empty query', () => {
    handleDb({ parts: ['/db'], folder: '/project', setLoading, setMessages });
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Usage: /db')
    );
  });

  it('handleDb supports /db use <name>', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: [] });
    await handleDb({
      parts: ['/db', 'use', 'main.db'],
      folder: '/project',
      setLoading,
      setMessages,
    });
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('DB aktif')
    );
  });
});
