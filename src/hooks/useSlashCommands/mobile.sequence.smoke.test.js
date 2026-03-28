// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlashCommands } from './index.js';

const mockedHandlers = vi.hoisted(() => ({
  handleBg: vi.fn(({ setMessages }) => setMessages(prev => [...prev, { role: 'assistant', content: 'bg:ok' }])),
  handleStatus: vi.fn(({ setMessages }) => setMessages(prev => [...prev, { role: 'assistant', content: 'status:ok' }])),
  handlePlan: vi.fn(({ setMessages }) => setMessages(prev => [...prev, { role: 'assistant', content: 'plan:ok' }])),
  handleDb: vi.fn(({ setMessages }) => setMessages(prev => [...prev, { role: 'assistant', content: 'db:ok' }])),
}));

vi.mock('./handlers/index.js', async () => {
  const actual = await vi.importActual('./handlers/index.js');
  return {
    ...actual,
    ...mockedHandlers,
  };
});

function createProps(setMessages, messagesRef) {
  return {
    setMessages,
    setLoading: vi.fn(),
    setShowMCP: vi.fn(),
    setShowBgAgents: vi.fn(),
    setPlanSteps: vi.fn(),
    setPlanTask: vi.fn(),
    setGracefulStop: vi.fn(),
    setShowCheckpoints: vi.fn(),
    setShowCustomActions: vi.fn(),
    setShowThemeBuilder: vi.fn(),
    setShowGitHub: vi.fn(),
    setShowDeploy: vi.fn(),
    setShowSkills: vi.fn(),
    setShowPermissions: vi.fn(),
    setShowSessions: vi.fn(),
    setShowPlugins: vi.fn(),
    setShowConfig: vi.fn(),
    setPushToTalk: vi.fn(),
    setSessionList: vi.fn(),
    setShowApiKeys: vi.fn(),
    folder: '/project',
    get messages() {
      return messagesRef.current;
    },
    model: 'qwen-cerebras',
    effort: 'medium',
    thinkingEnabled: false,
    loading: false,
    callAI: vi.fn(),
    sendMsg: vi.fn(),
    sendNotification: vi.fn(),
    haptic: vi.fn(),
  };
}

describe('useSlashCommands mobile sequence smoke', () => {
  it('keeps critical mobile command sequence alive (/bg -> /status -> /plan -> /db)', async () => {
    const messagesRef = { current: [{ role: 'user', content: 'boot' }] };
    const setMessages = vi.fn((updater) => {
      messagesRef.current = typeof updater === 'function' ? updater(messagesRef.current) : updater;
    });
    const props = createProps(setMessages, messagesRef);
    const { result } = renderHook(() => useSlashCommands(props));

    await act(async () => { await result.current.handleSlashCommand('/bg fix memory'); });
    await act(async () => { await result.current.handleSlashCommand('/status'); });
    await act(async () => { await result.current.handleSlashCommand('/plan optimize startup'); });
    await act(async () => { await result.current.handleSlashCommand('/db SELECT 1'); });

    expect(mockedHandlers.handleBg).toHaveBeenCalledTimes(1);
    expect(mockedHandlers.handleStatus).toHaveBeenCalledTimes(1);
    expect(mockedHandlers.handlePlan).toHaveBeenCalledTimes(1);
    expect(mockedHandlers.handleDb).toHaveBeenCalledTimes(1);

    expect(messagesRef.current.map((m) => m.content)).toEqual([
      'boot',
      'bg:ok',
      'status:ok',
      'plan:ok',
      'db:ok',
    ]);
  });
});
