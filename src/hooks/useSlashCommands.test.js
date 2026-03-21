// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:    vi.fn().mockResolvedValue({ value: null }),
    set:    vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../api.js', () => ({
  callServer:          vi.fn().mockResolvedValue({ ok: true, data: '' }),
  askCerebrasStream:   vi.fn().mockResolvedValue(''),
}));

vi.mock('../constants.js', () => ({
  MODELS: [
    { id: 'model-a', label: 'Model A', provider: 'cerebras' },
    { id: 'model-b', label: 'Model B', provider: 'groq' },
    { id: 'model-c', label: 'Model C', provider: 'groq' },
  ],
}));

vi.mock('../utils.js', () => ({
  countTokens:  vi.fn().mockReturnValue(100),
  parseActions: vi.fn().mockReturnValue([]),
}));

vi.mock('../features.js', () => ({
  generatePlan:          vi.fn().mockResolvedValue({ steps: [{ num: 1, text: 'Do thing' }], reply: '1. Do thing' }),
  runBackgroundAgent:    vi.fn().mockResolvedValue('agent-123'),
  mergeBackgroundAgent:  vi.fn().mockResolvedValue({ ok: true, msg: 'Merged', hasConflicts: false }),
  tokenTracker: {
    summary:       vi.fn().mockReturnValue('📊 Token summary'),
    inputTokens:   1000,
    outputTokens:  500,
  },
  saveSession:    vi.fn().mockResolvedValue({ name: 'Test', id: 1 }),
  loadSessions:   vi.fn().mockResolvedValue([{ id: 1, name: 'S1' }]),
  rewindMessages: vi.fn().mockImplementation((msgs, n) => msgs.slice(0, Math.max(1, msgs.length - n * 2))),
}));

import { Preferences } from '@capacitor/preferences';
import { callServer, askCerebrasStream } from '../api.js';
import { saveSession, loadSessions } from '../features.js';
import * as featuresModule from '../features.js';
import { useSlashCommands } from './useSlashCommands.js';

// ── Default props factory ──────────────────────────────────────────────────────
function makeProps(overrides = {}) {
  return {
    model: 'model-a',
    folder: '/project',
    branch: 'main',
    messages: [{ role: 'assistant', content: 'Hi!' }],
    selectedFile: null,
    fileContent: '',
    notes: '',
    memories: [],
    checkpoints: [],
    skills: [],
    thinkingEnabled: false,
    effort: 'medium',
    loopActive: false,
    loopIntervalRef: null,
    agentMemory: { user: [], project: [], local: [] },
    splitView: false,
    pushToTalk: false,
    sessionName: 'My Session',
    sessionColor: null,
    fileWatcherActive: false,
    fileWatcherInterval: null,
    setModel: vi.fn(),
    setMessages: vi.fn(),
    setFolder: vi.fn(),
    setFolderInput: vi.fn(),
    setLoading: vi.fn(),
    setStreaming: vi.fn(),
    setThinkingEnabled: vi.fn(),
    setEffort: vi.fn(),
    setLoopActive: vi.fn(),
    setLoopIntervalRef: vi.fn(),
    setSplitView: vi.fn(),
    setPushToTalk: vi.fn(),
    setSessionName: vi.fn(),
    setSessionColor: vi.fn(),
    setSkills: vi.fn(),
    setFileWatcherActive: vi.fn(),
    setFileWatcherInterval: vi.fn(),
    setFileSnapshots: vi.fn(),
    setYuyuMd: vi.fn(),
    setPlanSteps: vi.fn(),
    setPlanTask: vi.fn(),
    setAgentMemory: vi.fn(),
    setSessionList: vi.fn(),
    setShowCheckpoints: vi.fn(),
    setShowMemory: vi.fn(),
    setShowMCP: vi.fn(),
    setShowGitHub: vi.fn(),
    setShowDeploy: vi.fn(),
    setShowSessions: vi.fn(),
    setShowPermissions: vi.fn(),
    setShowPlugins: vi.fn(),
    setShowConfig: vi.fn(),
    setShowCustomActions: vi.fn(),
    setShowFileHistory: vi.fn(),
    setShowThemeBuilder: vi.fn(),
    setShowDepGraph: vi.fn(),
    setDepGraph: vi.fn(),
    setFontSize: vi.fn(),
    setShowMergeConflict: vi.fn(),
    setMergeConflictData: vi.fn(),
    setShowSkills: vi.fn(),
    setShowBgAgents: vi.fn(),
    sendMsg: vi.fn().mockResolvedValue(undefined),
    compactContext: vi.fn().mockResolvedValue(undefined),
    saveCheckpoint: vi.fn(),
    exportChat: vi.fn(),
    searchMessages: vi.fn().mockReturnValue([]),
    setGracefulStop: vi.fn(),
    loading: false,
    editHistory: [],
    setEditHistory: vi.fn(),
    pinnedFiles: [],
    togglePin: vi.fn(),
    browseTo: vi.fn().mockResolvedValue(undefined),
    runAgentSwarm: vi.fn().mockResolvedValue(undefined),
    callAI: vi.fn().mockResolvedValue('AI reply'),
    abTest: vi.fn().mockResolvedValue(undefined),
    growth: { level: 5, xp: 200, nextXp: 300, progress: 66, streak: 3, badges: [], learnedStyle: null },
    sendNotification: vi.fn(),
    haptic: vi.fn(),
    abortRef: { current: null },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
  Preferences.get.mockResolvedValue({ value: null });
  Preferences.set.mockResolvedValue(undefined);
  // Restore tokenTracker.summary after clearAllMocks
  featuresModule.tokenTracker.summary.mockReturnValue('📊 Token summary');
});

// ── Helper: run a command ──────────────────────────────────────────────────────
async function runCmd(props, cmd) {
  const { result } = renderHook(() => useSlashCommands(props));
  await act(async () => {
    await result.current.handleSlashCommand(cmd);
  });
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// /model
// ═══════════════════════════════════════════════════════════════════════════════
describe('/model', () => {
  it('cycles to the next model', async () => {
    const props = makeProps({ model: 'model-a' });
    await runCmd(props, '/model');
    expect(props.setModel).toHaveBeenCalledWith('model-b');
  });

  it('wraps around to first model from last', async () => {
    const props = makeProps({ model: 'model-c' });
    await runCmd(props, '/model');
    expect(props.setModel).toHaveBeenCalledWith('model-a');
  });

  it('persists model to Preferences', async () => {
    const props = makeProps({ model: 'model-a' });
    await runCmd(props, '/model');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_model', value: 'model-b' });
  });

  it('sends confirmation message', async () => {
    const props = makeProps({ model: 'model-a' });
    await runCmd(props, '/model');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /compact
// ═══════════════════════════════════════════════════════════════════════════════
describe('/compact', () => {
  it('shows warning without force flag', async () => {
    const props = makeProps();
    await runCmd(props, '/compact');
    expect(props.compactContext).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('calls compactContext with force flag', async () => {
    const props = makeProps();
    await runCmd(props, '/compact force');
    expect(props.compactContext).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /checkpoint / /restore
// ═══════════════════════════════════════════════════════════════════════════════
describe('/checkpoint', () => {
  it('calls saveCheckpoint', async () => {
    const props = makeProps();
    await runCmd(props, '/checkpoint');
    expect(props.saveCheckpoint).toHaveBeenCalled();
  });
});

describe('/restore', () => {
  it('opens checkpoints panel', async () => {
    const props = makeProps();
    await runCmd(props, '/restore');
    expect(props.setShowCheckpoints).toHaveBeenCalledWith(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /cost
// ═══════════════════════════════════════════════════════════════════════════════
describe('/cost', () => {
  it('sends token summary message', async () => {
    const props = makeProps();
    await runCmd(props, '/cost');
    expect(props.setMessages).toHaveBeenCalled();
    expect(featuresModule.tokenTracker.summary).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /stop
// ═══════════════════════════════════════════════════════════════════════════════
describe('/stop', () => {
  it('triggers graceful stop when loading', async () => {
    const props = makeProps({ loading: true });
    await runCmd(props, '/stop');
    expect(props.setGracefulStop).toHaveBeenCalledWith(true);
  });

  it('sends idle message when not loading', async () => {
    const props = makeProps({ loading: false });
    await runCmd(props, '/stop');
    expect(props.setGracefulStop).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /clear
// ═══════════════════════════════════════════════════════════════════════════════
describe('/clear', () => {
  it('shows confirmation warning when messages exist', async () => {
    const props = makeProps({ messages: Array(5).fill({ role: 'user', content: 'hi' }) });
    await runCmd(props, '/clear');
    expect(Preferences.remove).not.toHaveBeenCalled();
  });

  it('clears immediately with force flag', async () => {
    const props = makeProps({ messages: Array(5).fill({ role: 'user', content: 'hi' }) });
    await runCmd(props, '/clear force');
    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'yc_history' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /export
// ═══════════════════════════════════════════════════════════════════════════════
describe('/export', () => {
  it('calls exportChat', async () => {
    const props = makeProps();
    await runCmd(props, '/export');
    expect(props.exportChat).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /search
// ═══════════════════════════════════════════════════════════════════════════════
describe('/search', () => {
  it('shows usage when no query', async () => {
    const props = makeProps();
    await runCmd(props, '/search');
    expect(props.searchMessages).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('calls searchMessages with query', async () => {
    const props = makeProps();
    props.searchMessages.mockReturnValue([{ idx: 0, role: 'user', content: 'hello world' }]);
    await runCmd(props, '/search hello');
    expect(props.searchMessages).toHaveBeenCalledWith('hello');
  });

  it('shows no results message when empty', async () => {
    const props = makeProps();
    props.searchMessages.mockReturnValue([]);
    await runCmd(props, '/search nothing');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /split
// ═══════════════════════════════════════════════════════════════════════════════
describe('/split', () => {
  it('toggles split view', async () => {
    const props = makeProps();
    await runCmd(props, '/split');
    expect(props.setSplitView).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /diff
// ═══════════════════════════════════════════════════════════════════════════════
describe('/diff', () => {
  it('calls server for git diff HEAD', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'file.js | 5 ++' });
    const props = makeProps();
    await runCmd(props, '/diff');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });

  it('shows no diff message when output empty', async () => {
    callServer.mockResolvedValue({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/diff');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('accepts a range argument', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'file.js | 3 +' });
    const props = makeProps();
    await runCmd(props, '/diff v1..v2');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      command: expect.stringContaining('v1..v2'),
    }));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /font
// ═══════════════════════════════════════════════════════════════════════════════
describe('/font', () => {
  it('sets font size and persists', async () => {
    const props = makeProps();
    await runCmd(props, '/font 16');
    expect(props.setFontSize).toHaveBeenCalledWith(16);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_fontsize', value: '16' });
  });

  it('defaults to 14 without argument', async () => {
    const props = makeProps();
    await runCmd(props, '/font');
    expect(props.setFontSize).toHaveBeenCalledWith(14);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /theme / /mcp / /github / /deploy / /config / /skills / /permissions / /plugin
// ═══════════════════════════════════════════════════════════════════════════════
describe('panel toggle commands', () => {
  const cases = [
    ['/theme',       'setShowThemeBuilder', true],
    ['/mcp',         'setShowMCP',          true],
    ['/github',      'setShowGitHub',       true],
    ['/deploy',      'setShowDeploy',       true],
    ['/config',      'setShowConfig',       true],
    ['/skills',      'setShowSkills',       true],
    ['/permissions', 'setShowPermissions',  true],
    ['/plugin',      'setShowPlugins',      true],
    ['/bgstatus',    'setShowBgAgents',     true],
    ['/actions',     'setShowCustomActions',true],
  ];

  it.each(cases)('%s opens correct panel', async (cmd, setter) => {
    const props = makeProps();
    await runCmd(props, cmd);
    expect(props[setter]).toHaveBeenCalledWith(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /status
// ═══════════════════════════════════════════════════════════════════════════════
describe('/status', () => {
  it('calls server for ping, git, node, disk in parallel', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'ok' });
    const props = makeProps();
    await runCmd(props, '/status');
    expect(callServer).toHaveBeenCalledTimes(4);
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /tokens
// ═══════════════════════════════════════════════════════════════════════════════
describe('/tokens', () => {
  it('shows token breakdown', async () => {
    const props = makeProps({ messages: [{ role: 'user', content: 'hello' }] });
    await runCmd(props, '/tokens');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /pin / /unpin
// ═══════════════════════════════════════════════════════════════════════════════
describe('/pin', () => {
  it('shows pinned files list when no argument', async () => {
    const props = makeProps({ pinnedFiles: ['/project/src/api.js'] });
    await runCmd(props, '/pin');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.togglePin).not.toHaveBeenCalled();
  });

  it('shows empty pin message when no pins', async () => {
    const props = makeProps({ pinnedFiles: [] });
    await runCmd(props, '/pin');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('toggles pin for file argument', async () => {
    const props = makeProps({ pinnedFiles: [] });
    await runCmd(props, '/pin src/api.js');
    expect(props.togglePin).toHaveBeenCalledWith('/project/src/api.js');
  });
});

describe('/unpin', () => {
  it('unpins with explicit target', async () => {
    const props = makeProps();
    await runCmd(props, '/unpin src/api.js');
    expect(props.togglePin).toHaveBeenCalled();
  });

  it('unpins selectedFile when no argument', async () => {
    const props = makeProps({ selectedFile: '/project/src/api.js' });
    await runCmd(props, '/unpin');
    expect(props.togglePin).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /thinking
// ═══════════════════════════════════════════════════════════════════════════════
describe('/thinking', () => {
  it('toggles thinking and persists', async () => {
    const props = makeProps({ thinkingEnabled: false });
    await runCmd(props, '/thinking');
    expect(props.setThinkingEnabled).toHaveBeenCalledWith(true);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_thinking', value: '1' });
  });

  it('disables thinking when already on', async () => {
    const props = makeProps({ thinkingEnabled: true });
    await runCmd(props, '/thinking');
    expect(props.setThinkingEnabled).toHaveBeenCalledWith(false);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_thinking', value: '0' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /sessions / /save
// ═══════════════════════════════════════════════════════════════════════════════
describe('/sessions', () => {
  it('loads sessions and opens panel', async () => {
    const props = makeProps();
    await runCmd(props, '/sessions');
    expect(loadSessions).toHaveBeenCalled();
    expect(props.setShowSessions).toHaveBeenCalledWith(true);
  });
});

describe('/save', () => {
  it('saves session with given name', async () => {
    const props = makeProps();
    await runCmd(props, '/save My Great Session');
    expect(saveSession).toHaveBeenCalledWith('My Great Session', expect.any(Array), '/project', 'main');
  });

  it('uses sessionName as fallback', async () => {
    const props = makeProps({ sessionName: 'Fallback Name' });
    await runCmd(props, '/save');
    expect(saveSession).toHaveBeenCalledWith('Fallback Name', expect.any(Array), '/project', 'main');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /debug
// ═══════════════════════════════════════════════════════════════════════════════
describe('/debug', () => {
  it('sends debug info message', async () => {
    const props = makeProps();
    await runCmd(props, '/debug');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /effort
// ═══════════════════════════════════════════════════════════════════════════════
describe('/effort', () => {
  it('sets effort level and persists', async () => {
    const props = makeProps();
    await runCmd(props, '/effort high');
    expect(props.setEffort).toHaveBeenCalledWith('high');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_effort', value: 'high' });
  });

  it('shows current effort with invalid level', async () => {
    const props = makeProps({ effort: 'medium' });
    await runCmd(props, '/effort ultramax');
    expect(props.setEffort).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it.each(['low', 'medium', 'high'])('accepts %s', async (lvl) => {
    const props = makeProps();
    await runCmd(props, `/effort ${lvl}`);
    expect(props.setEffort).toHaveBeenCalledWith(lvl);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /undo
// ═══════════════════════════════════════════════════════════════════════════════
describe('/undo', () => {
  it('shows message when no history', async () => {
    const props = makeProps({ editHistory: [] });
    await runCmd(props, '/undo');
    expect(props.setMessages).toHaveBeenCalled();
    expect(callServer).not.toHaveBeenCalled();
  });

  it('restores last file edit', async () => {
    const props = makeProps({
      editHistory: [{ path: '/project/src/api.js', content: 'old content' }],
    });
    await runCmd(props, '/undo');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
    expect(props.setEditHistory).toHaveBeenCalled();
  });

  it('undoes N edits', async () => {
    const props = makeProps({
      editHistory: [
        { path: '/p/a.js', content: 'a' },
        { path: '/p/b.js', content: 'b' },
      ],
    });
    await runCmd(props, '/undo 2');
    expect(callServer).toHaveBeenCalledTimes(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /rewind
// ═══════════════════════════════════════════════════════════════════════════════
describe('/rewind', () => {
  it('calls rewindMessages and updates state', async () => {
    const props = makeProps({
      messages: Array(6).fill({ role: 'user', content: 'msg' }),
    });
    await runCmd(props, '/rewind 1');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /rename
// ═══════════════════════════════════════════════════════════════════════════════
describe('/rename', () => {
  it('renames session and persists', async () => {
    const props = makeProps();
    await runCmd(props, '/rename New Name');
    expect(props.setSessionName).toHaveBeenCalledWith('New Name');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_session_name', value: 'New Name' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /bg / /bgstatus / /bgmerge
// ═══════════════════════════════════════════════════════════════════════════════
describe('/bg', () => {
  it('runs background agent with task', async () => {
    const { runBackgroundAgent } = await import('../features.js');
    const props = makeProps();
    await runCmd(props, '/bg fix all bugs');
    expect(runBackgroundAgent).toHaveBeenCalledWith(
      'fix all bugs', '/project', props.callAI, expect.any(Function)
    );
  });
});

describe('/bgmerge', () => {
  it('shows usage when no id', async () => {
    const props = makeProps();
    await runCmd(props, '/bgmerge');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.setLoading).not.toHaveBeenCalled();
  });

  it('merges agent by id', async () => {
    const { mergeBackgroundAgent } = await import('../features.js');
    const props = makeProps();
    await runCmd(props, '/bgmerge agent-123');
    expect(mergeBackgroundAgent).toHaveBeenCalledWith('agent-123', '/project');
  });

  it('shows conflict panel when merge has conflicts', async () => {
    const { mergeBackgroundAgent } = await import('../features.js');
    mergeBackgroundAgent.mockResolvedValueOnce({
      hasConflicts: true,
      conflicts: ['src/api.js'],
      ok: false,
    });
    const props = makeProps();
    await runCmd(props, '/bgmerge agent-456');
    expect(props.setShowMergeConflict).toHaveBeenCalledWith(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /loop
// ═══════════════════════════════════════════════════════════════════════════════
describe('/loop', () => {
  it('shows usage when no args and not active', async () => {
    const props = makeProps({ loopActive: false });
    await runCmd(props, '/loop');
    expect(props.setLoopActive).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('stops loop when active', async () => {
    const props = makeProps({ loopActive: true, loopIntervalRef: 42 });
    await runCmd(props, '/loop');
    expect(props.setLoopActive).toHaveBeenCalledWith(false);
  });

  it('shows format error for invalid interval', async () => {
    const props = makeProps();
    await runCmd(props, '/loop badformat cmd');
    expect(props.setLoopActive).not.toHaveBeenCalled();
  });

  it('starts loop with valid interval', async () => {
    const props = makeProps({ loopActive: false });
    await runCmd(props, '/loop 5m git status');
    expect(props.setLoopActive).toHaveBeenCalledWith(true);
    expect(props.setLoopIntervalRef).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /amemory
// ═══════════════════════════════════════════════════════════════════════════════
describe('/amemory', () => {
  it('shows memory list with no subcommand', async () => {
    const props = makeProps();
    await runCmd(props, '/amemory');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('adds memory to user scope', async () => {
    const props = makeProps();
    await runCmd(props, '/amemory add user always use TypeScript');
    expect(props.setAgentMemory).toHaveBeenCalled();
    expect(Preferences.set).toHaveBeenCalled();
  });

  it('clears memory for scope', async () => {
    const props = makeProps({ agentMemory: { user: [{ text: 'old', id: 1 }], project: [], local: [] } });
    await runCmd(props, '/amemory clear user');
    expect(props.setAgentMemory).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /ptt
// ═══════════════════════════════════════════════════════════════════════════════
describe('/ptt', () => {
  it('toggles push to talk', async () => {
    const props = makeProps({ pushToTalk: false });
    await runCmd(props, '/ptt');
    expect(props.setPushToTalk).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /color
// ═══════════════════════════════════════════════════════════════════════════════
describe('/color', () => {
  it('shows current color with no arg', async () => {
    const props = makeProps();
    await runCmd(props, '/color');
    expect(props.setSessionColor).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('sets valid color', async () => {
    const props = makeProps();
    await runCmd(props, '/color red');
    expect(props.setSessionColor).toHaveBeenCalledWith('#ef4444');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_session_color', value: '#ef4444' });
  });

  it('sets null for off', async () => {
    const props = makeProps({ sessionColor: '#ef4444' });
    await runCmd(props, '/color off');
    expect(props.setSessionColor).toHaveBeenCalledWith(null);
  });

  it('ignores invalid color', async () => {
    const props = makeProps();
    await runCmd(props, '/color rainbow');
    expect(props.setSessionColor).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /watch
// ═══════════════════════════════════════════════════════════════════════════════
describe('/watch', () => {
  it('enables file watcher when inactive', async () => {
    const props = makeProps({ fileWatcherActive: false });
    await runCmd(props, '/watch');
    expect(props.setFileWatcherActive).toHaveBeenCalledWith(true);
  });

  it('disables file watcher when active', async () => {
    const props = makeProps({ fileWatcherActive: true, fileWatcherInterval: 99 });
    await runCmd(props, '/watch');
    expect(props.setFileWatcherActive).toHaveBeenCalledWith(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /tree
// ═══════════════════════════════════════════════════════════════════════════════
describe('/tree', () => {
  it('calls server for tree', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'src/\n  api.js' });
    const props = makeProps();
    await runCmd(props, '/tree');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'tree', depth: 2 }));
  });

  it('accepts depth argument', async () => {
    callServer.mockResolvedValue({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/tree 3');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ depth: 3 }));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /ask
// ═══════════════════════════════════════════════════════════════════════════════
describe('/ask', () => {
  it('shows usage when no model or prompt', async () => {
    const props = makeProps();
    await runCmd(props, '/ask');
    expect(props.sendMsg).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('resolves kimi alias and sends msg', async () => {
    const props = makeProps();
    await runCmd(props, '/ask kimi review this code');
    expect(props.sendMsg).toHaveBeenCalledWith(
      'review this code',
      expect.objectContaining({ overrideModel: 'moonshotai/kimi-k2-instruct-0905' })
    );
  });

  it('resolves llama8b alias', async () => {
    const props = makeProps();
    await runCmd(props, '/ask llama8b explain this');
    expect(props.sendMsg).toHaveBeenCalledWith(
      'explain this',
      expect.objectContaining({ overrideModel: 'llama-3.1-8b-instant' })
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /xp
// ═══════════════════════════════════════════════════════════════════════════════
describe('/xp', () => {
  it('shows growth stats', async () => {
    const props = makeProps();
    await runCmd(props, '/xp');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows inactive message when growth is null', async () => {
    const props = makeProps({ growth: null });
    await runCmd(props, '/xp');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows badges when present', async () => {
    const props = makeProps({ growth: { level: 3, xp: 100, nextXp: 200, progress: 50, streak: 5, badges: ['first_blood', 'coder'], learnedStyle: 'concise' } });
    await runCmd(props, '/xp');
    const call = props.setMessages.mock.calls[0][0];
    const content = call([]).at(-1).content;
    expect(content).toContain('First Blood');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /plan
// ═══════════════════════════════════════════════════════════════════════════════
describe('/plan', () => {
  it('calls generatePlan and shows steps', async () => {
    const { generatePlan } = await import('../features.js');
    const props = makeProps();
    await runCmd(props, '/plan build auth feature');
    expect(generatePlan).toHaveBeenCalled();
    expect(props.setPlanSteps).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /usage
// ═══════════════════════════════════════════════════════════════════════════════
describe('/usage', () => {
  it('shows token tracker summary', async () => {
    const props = makeProps();
    await runCmd(props, '/usage');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /index
// ═══════════════════════════════════════════════════════════════════════════════
describe('/index', () => {
  it('calls server for symbol index', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'function foo()', meta: { files: 5, symbols: 12 } });
    const props = makeProps();
    await runCmd(props, '/index');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'index' }));
  });

  it('shows error on failure', async () => {
    callServer.mockResolvedValueOnce({ ok: false, data: 'not found' })
              .mockResolvedValue({ ok: false, data: 'not found' });
    const props = makeProps();
    await runCmd(props, '/index');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /review
// ═══════════════════════════════════════════════════════════════════════════════
describe('/review', () => {
  it('shows help when no file open and no arg', async () => {
    const props = makeProps({ selectedFile: null });
    await runCmd(props, '/review');
    expect(props.sendMsg).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('reviews selected file', async () => {
    const props = makeProps({ selectedFile: '/project/src/api.js', fileContent: 'const x = 1' });
    await runCmd(props, '/review');
    expect(props.sendMsg).toHaveBeenCalled();
  });

  it('reviews specific file by path', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'const x = 1' });
    const props = makeProps();
    await runCmd(props, '/review src/api.js');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'read' }));
    expect(props.sendMsg).toHaveBeenCalled();
  });

  it('handles --all flag', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: 'src/api.js\nsrc/utils.js' })
      .mockResolvedValue({ ok: true, data: 'file content' });
    const props = makeProps();
    await runCmd(props, '/review --all');
    expect(props.sendMsg).toHaveBeenCalled();
  });

  it('shows empty message when no changed files for --all', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/review --all');
    expect(props.sendMsg).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /db
// ═══════════════════════════════════════════════════════════════════════════════
describe('/db', () => {
  it('shows usage when no query', async () => {
    const props = makeProps();
    await runCmd(props, '/db');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.setLoading).not.toHaveBeenCalled();
  });

  it('executes query', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [] })
      .mockResolvedValue({ ok: true, data: 'id|name\n1|test' });
    const props = makeProps();
    await runCmd(props, '/db SELECT * FROM users');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mcp' }));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /ab
// ═══════════════════════════════════════════════════════════════════════════════
describe('/ab', () => {
  it('shows usage when no task', async () => {
    const props = makeProps();
    await runCmd(props, '/ab');
    expect(props.abTest).not.toHaveBeenCalled();
  });

  it('runs ab test with two models', async () => {
    const props = makeProps();
    await runCmd(props, '/ab implement dark mode');
    expect(props.abTest).toHaveBeenCalledWith(
      'implement dark mode',
      expect.any(String),
      expect.any(String)
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /open
// ═══════════════════════════════════════════════════════════════════════════════
describe('/open', () => {
  it('shows usage when no url', async () => {
    const props = makeProps();
    await runCmd(props, '/open');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('opens url in new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const props = makeProps();
    await runCmd(props, '/open https://example.com');
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
    openSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /websearch
// ═══════════════════════════════════════════════════════════════════════════════
describe('/websearch', () => {
  it('shows usage when no query', async () => {
    const props = makeProps();
    await runCmd(props, '/websearch');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('calls server for web search', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'Search results here' });
    const props = makeProps();
    await runCmd(props, '/websearch react hooks best practices');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'web_search' }));
  });

  it('shows error on failed search', async () => {
    callServer.mockResolvedValue({ ok: false, data: 'timeout' });
    const props = makeProps();
    await runCmd(props, '/websearch something');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /history / /simplify
// ═══════════════════════════════════════════════════════════════════════════════
describe('/history', () => {
  it('shows error when no file open', async () => {
    const props = makeProps({ selectedFile: null });
    await runCmd(props, '/history');
    expect(props.setShowFileHistory).not.toHaveBeenCalled();
  });

  it('opens file history when file is open', async () => {
    const props = makeProps({ selectedFile: '/project/src/api.js' });
    await runCmd(props, '/history');
    expect(props.setShowFileHistory).toHaveBeenCalledWith(true);
  });
});

describe('/simplify', () => {
  it('shows error when no file open', async () => {
    const props = makeProps({ selectedFile: null });
    await runCmd(props, '/simplify');
    expect(props.sendMsg).not.toHaveBeenCalled();
  });

  it('sends simplify message for open file', async () => {
    const props = makeProps({ selectedFile: '/project/src/api.js' });
    await runCmd(props, '/simplify');
    expect(props.sendMsg).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /swarm / /browse
// ═══════════════════════════════════════════════════════════════════════════════
describe('/swarm', () => {
  it('shows usage when no task', async () => {
    const props = makeProps();
    await runCmd(props, '/swarm');
    expect(props.runAgentSwarm).not.toHaveBeenCalled();
  });

  it('runs swarm with task', async () => {
    const props = makeProps();
    await runCmd(props, '/swarm build login feature');
    expect(props.runAgentSwarm).toHaveBeenCalledWith('build login feature');
  });
});

describe('/browse', () => {
  it('shows usage when no url', async () => {
    const props = makeProps();
    await runCmd(props, '/browse');
    expect(props.browseTo).not.toHaveBeenCalled();
  });

  it('calls browseTo with url', async () => {
    const props = makeProps();
    await runCmd(props, '/browse https://docs.react.dev');
    expect(props.browseTo).toHaveBeenCalledWith('https://docs.react.dev');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /rules
// ═══════════════════════════════════════════════════════════════════════════════
describe('/rules', () => {
  it('shows existing YUYU.md', async () => {
    callServer.mockResolvedValue({ ok: true, data: '# Rules\n- always use TypeScript' });
    const props = makeProps();
    await runCmd(props, '/rules');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows not found message when no YUYU.md', async () => {
    callServer.mockResolvedValue({ ok: false, data: '' });
    const props = makeProps();
    await runCmd(props, '/rules');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('adds a rule', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: '# YUYU.md\n\n## Rules\n' })
      .mockResolvedValue({ ok: true });
    const props = makeProps();
    await runCmd(props, '/rules add always use strict mode');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });

  it('shows usage when add with no text', async () => {
    const props = makeProps();
    await runCmd(props, '/rules add');
    expect(callServer).not.toHaveBeenCalled();
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('clears rules', async () => {
    callServer.mockResolvedValue({ ok: true });
    const props = makeProps();
    await runCmd(props, '/rules clear');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });

  it('shows help for unknown subcommand', async () => {
    const props = makeProps();
    await runCmd(props, '/rules unknown');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// unknown command — should not throw
// ═══════════════════════════════════════════════════════════════════════════════
describe('unknown command', () => {
  it('does nothing for unrecognized command', async () => {
    const props = makeProps();
    await expect(runCmd(props, '/doesnotexist')).resolves.not.toThrow();
  });
});
