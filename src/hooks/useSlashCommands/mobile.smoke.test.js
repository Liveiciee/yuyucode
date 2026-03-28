// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlashCommands } from './index.js';

const mockedHandlers = vi.hoisted(() => ({
  handleBg: vi.fn(),
  handleDb: vi.fn(),
  handleMcp: vi.fn(),
  handlePlan: vi.fn(),
}));

vi.mock('./handlers/index.js', async () => {
  const actual = await vi.importActual('./handlers/index.js');
  return {
    ...actual,
    ...mockedHandlers,
  };
});

function createProps() {
  return {
    setMessages: vi.fn(),
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
    messages: [{ role: 'user', content: 'hai' }],
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

describe('useSlashCommands mobile smoke dispatch', () => {
  it('dispatches /bg, /db, /mcp, and /plan without runtime errors', async () => {
    const props = createProps();
    const { result } = renderHook(() => useSlashCommands(props));

    await act(async () => { await result.current.handleSlashCommand('/bg fix memory leak'); });
    await act(async () => { await result.current.handleSlashCommand('/db SELECT 1'); });
    await act(async () => { await result.current.handleSlashCommand('/mcp list'); });
    await act(async () => { await result.current.handleSlashCommand('/plan mobile optimisasi startup'); });

    expect(mockedHandlers.handleBg).toHaveBeenCalled();
    expect(mockedHandlers.handleDb).toHaveBeenCalled();
    expect(mockedHandlers.handleMcp).toHaveBeenCalled();
    expect(mockedHandlers.handlePlan).toHaveBeenCalled();
  });
});
