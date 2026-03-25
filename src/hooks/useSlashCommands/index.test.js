// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlashCommands } from './index.js';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('src/features.js', () => ({
  loadSessions: vi.fn().mockResolvedValue([]),
}));

describe('useSlashCommands', () => {
  const createMockProps = () => ({
    setMessages: vi.fn(),
    setModel: vi.fn(),
    setEffort: vi.fn(),
    setThinkingEnabled: vi.fn(),
    setSessionName: vi.fn(),
    setShowThemeBuilder: vi.fn(),
    setShowGitHub: vi.fn(),
    setShowDeploy: vi.fn(),
    setShowSkills: vi.fn(),
    setShowPermissions: vi.fn(),
    setShowSessions: vi.fn(),
    setShowPlugins: vi.fn(),
    setShowConfig: vi.fn(),
    setShowBgAgents: vi.fn(),
    setPushToTalk: vi.fn(),
    setLoading: vi.fn(),
    setGracefulStop: vi.fn(),
    setShowFileHistory: vi.fn(),
    setShowCheckpoints: vi.fn(),
    setShowCustomActions: vi.fn(),
    setShowApiKeys: vi.fn(),
    setFileWatcherActive: vi.fn(),
    setFileWatcherInterval: vi.fn(),
    setFileSnapshots: vi.fn(),
    setFontSize: vi.fn(),
    setShowDepGraph: vi.fn(),
    setDepGraph: vi.fn(),
    setMergeConflictData: vi.fn(),
    setShowMergeConflict: vi.fn(),
    setShowMCP: vi.fn(),
    setPlanSteps: vi.fn(),
    setPlanTask: vi.fn(),
    setEditHistory: vi.fn(),
    setSplitView: vi.fn(),
    setLoopActive: vi.fn(),
    setLoopIntervalRef: vi.fn(),
    setAgentMemory: vi.fn(),
    setSessionList: vi.fn(),
    togglePin: vi.fn(),
    saveCheckpoint: vi.fn(),
    exportChat: vi.fn(),
    runAgentSwarm: vi.fn(),
    sendMsg: vi.fn(),
    browseTo: vi.fn(),
    searchMessages: vi.fn(),
    compactContext: vi.fn(),
    model: 'gpt-4',
    effort: 'medium',
    thinkingEnabled: false,
    sessionName: 'test-session',
    folder: '/test/folder',
    messages: [{ role: 'user', content: 'hello' }],
    loading: false,
    selectedFile: 'test.js',
    fileContent: 'console.log("test")',
    pinnedFiles: [],
    pushToTalk: false,
    loopActive: false,
    loopIntervalRef: { current: null },
    agentMemory: { user: [], project: [], local: [] },
    growth: { level: 1, xp: 0 },
    abTest: { group: 'A' },
    splitView: false,
    fileWatcherActive: false,
    fileWatcherInterval: null,
    editHistory: [],
    callAI: vi.fn(),
    sendNotification: vi.fn(),
    haptic: vi.fn(),
  });

  let props;
  beforeEach(() => {
    vi.clearAllMocks();
    props = createMockProps();
  });

  it('should handle /model', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/model');
    });
    expect(props.setModel).toHaveBeenCalled();
  });

  it('should handle /effort without arg (shows current)', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/effort');
    });
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('should handle /effort high', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/effort high');
    });
    expect(props.setEffort).toHaveBeenCalledWith('high');
  });

  it('should handle /thinking', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/thinking');
    });
    expect(props.setThinkingEnabled).toHaveBeenCalledWith(true);
  });

  it('should handle /clear', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/clear');
    });
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('should handle /stop when loading', async () => {
    props.loading = true;
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/stop');
    });
    expect(props.setGracefulStop).toHaveBeenCalledWith(true);
  });

  it('should handle /swarm with task', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/swarm build feature');
    });
    expect(props.runAgentSwarm).toHaveBeenCalledWith('build feature');
  });

  it('should handle /swarm without task', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/swarm');
    });
    expect(props.runAgentSwarm).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('should handle unknown command', async () => {
    const { result } = renderHook(() => useSlashCommands(props));
    await act(async () => {
      await result.current.handleSlashCommand('/unknown');
    });
    expect(props.setMessages).toHaveBeenCalled();
  });
});
