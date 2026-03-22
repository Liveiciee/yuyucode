// @vitest-environment happy-dom
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

// ═══════════════════════════════════════════════════════════════════════════════
// /batch
// ═══════════════════════════════════════════════════════════════════════════════
describe('/batch', () => {
  it('shows usage when no command given', async () => {
    const props = makeProps();
    await runCmd(props, '/batch');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('lists src files and processes them', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [
        { name: 'App.jsx', isDir: false },
        { name: 'utils.js', isDir: false },
      ]})
      .mockResolvedValueOnce({ ok: true, data: 'file content' })
      .mockResolvedValueOnce({ ok: true, data: 'file content' });
    const props = makeProps({ callAI: vi.fn().mockResolvedValue('SKIP') });
    await runCmd(props, '/batch tambah JSDoc');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows error when list src fails', async () => {
    callServer.mockResolvedValueOnce({ ok: false, data: 'permission denied' });
    const props = makeProps();
    await runCmd(props, '/batch tambah JSDoc');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /handoff
// ═══════════════════════════════════════════════════════════════════════════════
describe('/handoff', () => {
  it('generates and saves handoff when folder is set', async () => {
    callServer.mockResolvedValue({ ok: true, data: '' });
    const props = makeProps({
      folder: '/project',
      askCerebrasStream: vi.fn().mockResolvedValue('# Handoff content'),
    });
    // askCerebrasStream is called directly — mock via api module
    const { askCerebrasStream: ask } = await import('../api.js');
    ask.mockResolvedValue('# Handoff content');
    await runCmd(props, '/handoff');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows handoff in chat when no folder', async () => {
    const { askCerebrasStream: ask } = await import('../api.js');
    ask.mockResolvedValue('# Handoff content');
    const props = makeProps({ folder: null });
    await runCmd(props, '/handoff');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /deps
// ═══════════════════════════════════════════════════════════════════════════════
describe('/deps', () => {
  it('shows error when no file selected', async () => {
    const props = makeProps({ selectedFile: null });
    await runCmd(props, '/deps');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('builds dep graph when file selected', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: "import React from 'react';\nimport { useState } from 'react';" })
      .mockResolvedValue({ ok: false, data: '' });
    const props = makeProps({ selectedFile: '/project/src/App.jsx' });
    await runCmd(props, '/deps');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /refactor
// ═══════════════════════════════════════════════════════════════════════════════
describe('/refactor', () => {
  it('shows usage when args missing', async () => {
    const props = makeProps();
    await runCmd(props, '/refactor');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('sends refactor message when args provided', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '/project/src/App.jsx:10: OldName' });
    const props = makeProps({ sendMsg: vi.fn().mockResolvedValue(undefined) });
    await runCmd(props, '/refactor OldName NewName');
    expect(props.sendMsg).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /loop edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/loop edge cases', () => {
  it('shows usage when format is invalid', async () => {
    const props = makeProps();
    await runCmd(props, '/loop badformat');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('stops active loop when no args', async () => {
    const props = makeProps({ loopActive: true, loopIntervalRef: { current: setInterval(() => {}, 9999) } });
    await runCmd(props, '/loop');
    expect(props.setLoopActive).toHaveBeenCalledWith(false);
  });

  it('starts loop with hour unit', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'ok' });
    const props = makeProps({ loopActive: false });
    await runCmd(props, '/loop 1h git status');
    expect(props.setLoopActive).toHaveBeenCalledWith(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /search edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/search edge cases', () => {
  it('shows usage when no query', async () => {
    const props = makeProps();
    await runCmd(props, '/search');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows no results message when empty', async () => {
    const props = makeProps({ searchMessages: vi.fn().mockReturnValue([]) });
    await runCmd(props, '/search nonexistent');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /undo edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/undo edge cases', () => {
  it('shows message when history is empty', async () => {
    const props = makeProps({ editHistory: [] });
    await runCmd(props, '/undo');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('undoes N edits from history', async () => {
    callServer.mockResolvedValue({ ok: true, data: '' });
    const props = makeProps({
      editHistory: [
        { path: '/project/a.js', content: 'old a' },
        { path: '/project/b.js', content: 'old b' },
      ],
    });
    await runCmd(props, '/undo 2');
    expect(callServer).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /amemory edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/amemory edge cases', () => {
  it('shows all memories when sub is show', async () => {
    const props = makeProps({
      agentMemory: { user: [{ text: 'mem1', ts: '2024' }], project: [], local: [] },
    });
    await runCmd(props, '/amemory show');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('clears scope memory', async () => {
    const props = makeProps({
      agentMemory: { user: [{ text: 'mem1', ts: '2024' }], project: [], local: [] },
    });
    await runCmd(props, '/amemory clear user');
    expect(props.setAgentMemory).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /rules edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/rules edge cases', () => {
  it('clear command resets YUYU.md', async () => {
    callServer.mockResolvedValue({ ok: true, data: '' });
    const props = makeProps({ folder: '/project' });
    await runCmd(props, '/rules clear');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });

  it('edit command sends msg to read YUYU.md', async () => {
    const props = makeProps({ sendMsg: vi.fn().mockResolvedValue(undefined) });
    await runCmd(props, '/rules edit');
    expect(props.sendMsg).toHaveBeenCalled();
  });

  it('unknown subcommand shows help', async () => {
    const props = makeProps();
    await runCmd(props, '/rules unknown');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /bgmerge edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/bgmerge edge cases', () => {
  it('shows usage when no id', async () => {
    const props = makeProps();
    await runCmd(props, '/bgmerge');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows conflict info on conflict result', async () => {
    featuresModule.mergeBackgroundAgent.mockResolvedValueOnce({
      ok: false,
      hasConflicts: true,
      conflicts: ['src/App.jsx'],
      previews: [],
      msg: 'Konflik di 1 file.',
    });
    const props = makeProps();
    await runCmd(props, '/bgmerge agent-123');
    expect(props.setShowMergeConflict).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /diff edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/diff edge cases', () => {
  it('shows no diff message when output is empty', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/diff');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows large diff with full read', async () => {
    const manyLines = Array.from({ length: 35 }, (_, i) => `line${i}`).join('\n');
    callServer
      .mockResolvedValueOnce({ ok: true, data: manyLines })
      .mockResolvedValueOnce({ ok: true, data: 'full diff output' });
    const props = makeProps();
    await runCmd(props, '/diff HEAD~1');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /mcp sub-commands
// ═══════════════════════════════════════════════════════════════════════════════
describe('/mcp list', () => {
  it('fetches and shows mcp tools', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: { mytool: { desc: 'My tool', actions: ['run'] } } });
    const props = makeProps();
    await runCmd(props, '/mcp list');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mcp_list' }));
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows error when mcp_list fails', async () => {
    callServer.mockResolvedValueOnce({ ok: false, data: 'server error' });
    const props = makeProps();
    await runCmd(props, '/mcp list');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

describe('/mcp connect', () => {
  it('shows usage when name or url missing', async () => {
    const props = makeProps();
    await runCmd(props, '/mcp connect');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('connects a new mcp server', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: '[]' })
      .mockResolvedValueOnce({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/mcp connect myapi http://localhost:3001 My API');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows error when write fails', async () => {
    callServer
      .mockResolvedValueOnce({ ok: false, data: '' })
      .mockResolvedValueOnce({ ok: false, data: 'disk full' });
    const props = makeProps();
    await runCmd(props, '/mcp connect myapi http://localhost:3001');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

describe('/mcp disconnect', () => {
  it('shows usage when no name', async () => {
    const props = makeProps();
    await runCmd(props, '/mcp disconnect');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('removes existing server', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: JSON.stringify([{ name: 'myapi', url: 'http://localhost:3001' }]) })
      .mockResolvedValueOnce({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/mcp disconnect myapi');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows not found when server missing', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: '[]' })
      .mockResolvedValueOnce({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/mcp disconnect ghost');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /init
// ═══════════════════════════════════════════════════════════════════════════════
describe('/init', () => {
  it('generates SKILL.md when none exists', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: '{"name":"yuyucode"}' }) // package.json
      .mockResolvedValueOnce({ ok: true, data: [{ isDir: false, name: 'App.jsx' }] }) // list src
      .mockResolvedValueOnce({ ok: true, data: 'abc123 feat: init' }) // git log
      .mockResolvedValueOnce({ ok: false, data: '' }); // SKILL.md not found
    const props = makeProps();
    await runCmd(props, '/init');
    expect(props.sendMsg).toHaveBeenCalled();
  });

  it('warns when SKILL.md exists without overwrite', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: '{}' })
      .mockResolvedValueOnce({ ok: true, data: [] })
      .mockResolvedValueOnce({ ok: true, data: '' })
      .mockResolvedValueOnce({ ok: true, data: '# existing SKILL' });
    const props = makeProps();
    await runCmd(props, '/init');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.sendMsg).not.toHaveBeenCalled();
  });

  it('overwrites when overwrite flag given', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: '{}' })
      .mockResolvedValueOnce({ ok: true, data: [] })
      .mockResolvedValueOnce({ ok: true, data: '' })
      .mockResolvedValueOnce({ ok: true, data: '# existing SKILL' });
    const props = makeProps();
    await runCmd(props, '/init overwrite');
    expect(props.sendMsg).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /scaffold
// ═══════════════════════════════════════════════════════════════════════════════
describe('/scaffold', () => {
  it('shows usage for unknown template', async () => {
    const props = makeProps();
    await runCmd(props, '/scaffold vue');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.sendMsg).not.toHaveBeenCalled();
  });

  it('shows usage when no template given', async () => {
    const props = makeProps();
    await runCmd(props, '/scaffold');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('scaffolds react project', async () => {
    const props = makeProps();
    await runCmd(props, '/scaffold react');
    expect(props.sendMsg).toHaveBeenCalledWith(expect.stringContaining('react'));
  });

  it('scaffolds node project', async () => {
    const props = makeProps();
    await runCmd(props, '/scaffold node');
    expect(props.sendMsg).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /bench
// ═══════════════════════════════════════════════════════════════════════════════
describe('/bench', () => {
  it('runs benchmark with no subcommand', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'ops/sec: 1234' });
    const props = makeProps();
    await runCmd(props, '/bench');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('runs bench save', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'saved' });
    const props = makeProps();
    await runCmd(props, '/bench save');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows regression icon when output has regression', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '🔴 regression detected' });
    const props = makeProps();
    await runCmd(props, '/bench');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows help for unknown subcommand', async () => {
    const props = makeProps();
    await runCmd(props, '/bench unknown');
    expect(props.setMessages).toHaveBeenCalled();
    expect(callServer).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /self-edit
// ═══════════════════════════════════════════════════════════════════════════════
describe('/self-edit', () => {
  it('starts self-edit with default task', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'import React...' });
    const props = makeProps();
    await runCmd(props, '/self-edit');
    expect(props.sendMsg).toHaveBeenCalledWith(expect.stringContaining('SELF-EDIT'));
  });

  it('uses custom task when provided', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'import React...' });
    const props = makeProps();
    await runCmd(props, '/self-edit optimasi render');
    expect(props.sendMsg).toHaveBeenCalledWith(expect.stringContaining('optimasi render'));
  });

  it('shows error when App.jsx cannot be read', async () => {
    callServer.mockResolvedValueOnce({ ok: false, data: '' });
    const props = makeProps();
    await runCmd(props, '/self-edit');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.sendMsg).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /summarize
// ═══════════════════════════════════════════════════════════════════════════════
describe('/summarize', () => {
  it('shows not enough messages when slice too small', async () => {
    const props = makeProps();
    await runCmd(props, '/summarize');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('summarizes messages when enough exist', async () => {
    const manyMsgs = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: 'msg ' + i }));
    const props = makeProps({ messages: manyMsgs });
    askCerebrasStream.mockResolvedValueOnce('ringkasan singkat');
    await runCmd(props, '/summarize');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('summarizes from specific index', async () => {
    const manyMsgs = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: 'msg ' + i }));
    const props = makeProps({ messages: manyMsgs });
    askCerebrasStream.mockResolvedValueOnce('ringkasan dari index 3');
    await runCmd(props, '/summarize 3');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /lint
// ═══════════════════════════════════════════════════════════════════════════════
describe('/lint', () => {
  it('shows clean when no errors', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '0 errors found' });
    const props = makeProps();
    await runCmd(props, '/lint');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('triggers fix when lint errors found', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'error: unexpected token on line 5' });
    const props = makeProps();
    await runCmd(props, '/lint');
    // sendMsg called via setTimeout — just verify setMessages was called
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /test
// ═══════════════════════════════════════════════════════════════════════════════
describe('/test', () => {
  it('shows usage when no file open and no arg', async () => {
    const props = makeProps({ selectedFile: null });
    await runCmd(props, '/test');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.sendMsg).not.toHaveBeenCalled();
  });

  it('generates tests for selectedFile', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'export function add(a,b){return a+b}' });
    const props = makeProps({ selectedFile: '/project/src/utils.js' });
    await runCmd(props, '/test');
    expect(props.sendMsg).toHaveBeenCalled();
  });

  it('generates tests for explicit path', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'export function foo(){}' });
    const props = makeProps();
    await runCmd(props, '/test src/api.js');
    expect(props.sendMsg).toHaveBeenCalled();
  });

  it('shows error when file cannot be read', async () => {
    callServer.mockResolvedValueOnce({ ok: false, data: '' });
    const props = makeProps();
    await runCmd(props, '/test src/missing.js');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.sendMsg).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /rules init
// ═══════════════════════════════════════════════════════════════════════════════
describe('/rules init', () => {
  it('calls sendMsg to generate YUYU.md when none exists', async () => {
    callServer.mockResolvedValueOnce({ ok: false, data: '' }); // YUYU.md not found
    const props = makeProps();
    await runCmd(props, '/rules init');
    expect(props.sendMsg).toHaveBeenCalledWith(expect.stringContaining('YUYU.md'));
  });

  it('warns when YUYU.md already exists', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '# existing rules' });
    const props = makeProps();
    await runCmd(props, '/rules init');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.sendMsg).not.toHaveBeenCalled();
  });

  it('overwrites when overwrite flag given', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '# existing rules' });
    const props = makeProps();
    await runCmd(props, '/rules init overwrite');
    expect(props.sendMsg).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /db edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/db edge cases', () => {
  it('sets active db with /db use <name>', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: [{ isDir: false, name: 'app.db' }] });
    const props = makeProps();
    await runCmd(props, '/db use app.db');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('auto-selects single db file', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [{ isDir: false, name: 'app.db' }] })
      .mockResolvedValueOnce({ ok: true, data: 'id|name\n1|test' });
    const props = makeProps();
    await runCmd(props, '/db SELECT * FROM users');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mcp' }));
  });

  it('shows multi-db message when multiple dbs found', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [{ isDir: false, name: 'app.db' }, { isDir: false, name: 'test.db' }] })
      .mockResolvedValueOnce({ ok: true, data: 'result' });
    const props = makeProps();
    await runCmd(props, '/db SELECT 1');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /loop interval ticks & edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/loop interval behavior', () => {
  it('rejects interval below 10 seconds', async () => {
    const props = makeProps();
    await runCmd(props, '/loop 5s git status');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.setLoopActive).not.toHaveBeenCalled();
  });

  it('clears existing loop when starting new one', async () => {
    const props = makeProps({ loopActive: true, loopIntervalRef: 99 });
    await runCmd(props, '/loop 10s git status');
    expect(props.setLoopActive).toHaveBeenCalledWith(true);
  });

  it('executes interval tick on success', async () => {
    const realSetInterval = globalThis.setInterval;
    let capturedFn = null;
    vi.spyOn(globalThis, 'setInterval').mockImplementation((fn, ms) => {
      capturedFn = fn; return 1;
    });
    callServer.mockResolvedValue({ ok: true, data: 'ok output' });
    const props = makeProps();
    await runCmd(props, '/loop 30s git status');
    if (capturedFn) await capturedFn();
    expect(props.setMessages).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('increments error streak on failed tick', async () => {
    vi.spyOn(globalThis, 'setInterval').mockImplementation((fn) => { return 1; });
    const props = makeProps();
    await runCmd(props, '/loop 30s git status');
    vi.restoreAllMocks();
  });

  it('auto-stops loop after MAX_ERRORS', async () => {
    let capturedFn = null;
    vi.spyOn(globalThis, 'setInterval').mockImplementation((fn) => { capturedFn = fn; return 1; });
    callServer.mockResolvedValue({ ok: false, data: 'error' });
    const props = makeProps();
    await runCmd(props, '/loop 30s git status');
    if (capturedFn) {
      await capturedFn(); await capturedFn(); await capturedFn();
    }
    expect(props.setLoopActive).toHaveBeenCalledWith(false);
    vi.restoreAllMocks();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /bench thermal warning
// ═══════════════════════════════════════════════════════════════════════════════
describe('/bench thermal warning', () => {
  it('shows thermal icon when THERMAL WARNING in output', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'THERMAL WARNING: CPU throttled' });
    const props = makeProps();
    await runCmd(props, '/bench');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('runs bench trend subcommand', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '▁▂▃▄▅' });
    const props = makeProps();
    await runCmd(props, '/bench trend');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('runs bench export subcommand', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '[{"ops":1234}]' });
    const props = makeProps();
    await runCmd(props, '/bench export');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('runs bench reset subcommand', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'reset done' });
    const props = makeProps();
    await runCmd(props, '/bench reset');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AbortError paths
// ═══════════════════════════════════════════════════════════════════════════════
describe('AbortError handling', () => {
  it('/summarize silently ignores AbortError', async () => {
    const manyMsgs = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: 'msg ' + i }));
    askCerebrasStream.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const props = makeProps({ messages: manyMsgs });
    await expect(runCmd(props, '/summarize')).resolves.not.toThrow();
  });

  it('/plan silently ignores AbortError', async () => {
    featuresModule.generatePlan.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const props = makeProps();
    await expect(runCmd(props, '/plan build something')).resolves.not.toThrow();
  });

  it('/summarize shows error for non-AbortError', async () => {
    const manyMsgs = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: 'msg ' + i }));
    askCerebrasStream.mockRejectedValueOnce(new Error('network error'));
    const props = makeProps({ messages: manyMsgs });
    await runCmd(props, '/summarize');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /handoff error path
// ═══════════════════════════════════════════════════════════════════════════════
describe('/handoff error path', () => {
  it('shows error message when stream fails', async () => {
    askCerebrasStream.mockRejectedValueOnce(new Error('stream failed'));
    const props = makeProps({ messages: Array(5).fill({ role: 'user', content: 'hi' }) });
    await runCmd(props, '/handoff');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.setLoading).toHaveBeenCalledWith(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /deps resolveLocalImport — no candidate found
// ═══════════════════════════════════════════════════════════════════════════════
describe('/deps import resolution', () => {
  it('handles external imports in dep graph', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: "import React from 'react';\nimport { useState } from 'react';" })
      .mockResolvedValue({ ok: false, data: '' });
    const props = makeProps({ selectedFile: '/project/src/App.jsx' });
    await runCmd(props, '/deps');
    expect(props.setDepGraph).toHaveBeenCalled();
  });

  it('handles local import where no candidate resolves', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: "import utils from './utils';" })
      .mockResolvedValue({ ok: false, data: '' });
    const props = makeProps({ selectedFile: '/project/src/App.jsx' });
    await runCmd(props, '/deps');
    expect(props.setDepGraph).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /batch edge cases
// ═══════════════════════════════════════════════════════════════════════════════
describe('/batch edge cases', () => {
  it('handles aborted batch', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: [{ isDir: false, name: 'App.jsx' }] })
      .mockResolvedValueOnce({ ok: true, data: 'code here' });
    const { parseActions } = await import('../utils.js');
    parseActions.mockReturnValueOnce([{ type: 'write_file', path: 'src/App.jsx', content: 'new' }]);
    const props = makeProps();
    // Simulate abort by having callAI throw AbortError
    props.callAI.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    await runCmd(props, '/batch add comments');
    expect(props.setMessages).toHaveBeenCalled();
  });

  it('shows no changes message when all files skipped', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: [{ isDir: false, name: 'App.jsx' }] });
    callServer.mockResolvedValueOnce({ ok: true, data: 'code' });
    props => props;
    const { parseActions } = await import('../utils.js');
    parseActions.mockReturnValueOnce([]);
    const props = makeProps();
    props.callAI.mockResolvedValueOnce('SKIP');
    await runCmd(props, '/batch add comments');
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /diff — large diff (no full read when lines >= 30)
// ═══════════════════════════════════════════════════════════════════════════════
describe('/diff large output', () => {
  it('skips full diff read when stat output has 30+ lines', async () => {
    const bigStat = Array.from({ length: 35 }, (_, i) => `file${i}.js | 1 +`).join('\n');
    callServer.mockResolvedValueOnce({ ok: true, data: bigStat });
    const props = makeProps();
    await runCmd(props, '/diff');
    // Should NOT call callServer a second time for full diff
    expect(callServer).toHaveBeenCalledTimes(1);
    expect(props.setMessages).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /amemory — add without content falls to show
// ═══════════════════════════════════════════════════════════════════════════════
describe('/amemory add without content', () => {
  it('shows memory list when add has no text', async () => {
    const props = makeProps();
    await runCmd(props, '/amemory add user');
    // Falls to else branch — shows all memories
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.setAgentMemory).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /mcp — open panel (default/unknown sub)
// ═══════════════════════════════════════════════════════════════════════════════
describe('/mcp open panel', () => {
  it('opens MCP panel for unknown subcommand', async () => {
    const props = makeProps();
    await runCmd(props, '/mcp open');
    expect(props.setShowMCP).toHaveBeenCalledWith(true);
  });

  it('opens MCP panel with no subcommand', async () => {
    const props = makeProps();
    await runCmd(props, '/mcp');
    expect(props.setShowMCP).toHaveBeenCalledWith(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /refactor — file not found path
// ═══════════════════════════════════════════════════════════════════════════════
describe('/refactor not found', () => {
  it('shows error when symbol not found in src', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '' }); // empty search results
    const props = makeProps();
    await runCmd(props, '/refactor OldName NewName');
    expect(props.setMessages).toHaveBeenCalled();
    expect(props.sendMsg).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /mcp connect — existing servers parsed correctly
// ═══════════════════════════════════════════════════════════════════════════════
describe('/mcp connect with existing servers', () => {
  it('replaces server with same name', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: JSON.stringify([{ name: 'myapi', url: 'http://old.com' }]) })
      .mockResolvedValueOnce({ ok: true, data: '' });
    const props = makeProps();
    await runCmd(props, '/mcp connect myapi http://new.com Updated API');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });
});
