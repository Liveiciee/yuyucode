// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleBg, handleBgStatus } from './agent.js';

vi.mock('../../../features.js', () => ({
  runBackgroundAgent: vi.fn(() => 'agent-123'),
  mergeBackgroundAgent: vi.fn(),
}));

vi.mock('../helpers/simpleResponse.js', () => ({
  simpleResponse: vi.fn(),
}));

import { runBackgroundAgent } from '../../../features.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

describe('agent handlers', () => {
  const setMessages = vi.fn();
  const setShowBgAgents = vi.fn();
  const callAI = vi.fn();
  const sendNotification = vi.fn();
  const haptic = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleBg shows usage when no task is provided', () => {
    handleBg({
      parts: ['/bg'],
      folder: '/project',
      callAI,
      setShowBgAgents,
      setMessages,
      sendNotification,
      haptic,
    });

    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Usage: /bg')
    );
    expect(runBackgroundAgent).not.toHaveBeenCalled();
  });

  it('handleBg starts background agent and reports ID', () => {
    handleBg({
      parts: ['/bg', 'fix', 'api.js'],
      folder: '/project',
      callAI,
      setShowBgAgents,
      setMessages,
      sendNotification,
      haptic,
    });

    expect(runBackgroundAgent).toHaveBeenCalledWith(
      'fix api.js',
      '/project',
      callAI,
      expect.any(Function)
    );
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('agent-123')
    );
  });

  it('handleBgStatus opens panel and sends status message', () => {
    handleBgStatus({ setShowBgAgents, setMessages });
    expect(setShowBgAgents).toHaveBeenCalledWith(true);
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('background agents')
    );
  });
});
