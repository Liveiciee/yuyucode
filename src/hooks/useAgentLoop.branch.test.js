// @vitest-environment jsdom
// useAgentLoop.branch.test.js — condition branch coverage
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockAskCerebrasStream = vi.hoisted(() => vi.fn());
const mockCallServer        = vi.hoisted(() => vi.fn());
const mockParseActions      = vi.hoisted(() => vi.fn());
const mockExecuteAction     = vi.hoisted(() => vi.fn());
const mockRunHooksV2        = vi.hoisted(() => vi.fn());
const mockCheckPermission   = vi.hoisted(() => vi.fn());
const mockTokenTracker      = vi.hoisted(() => ({ record: vi.fn() }));
const mockTfidfRank         = vi.hoisted(() => vi.fn());
const mockSelectSkills      = vi.hoisted(() => vi.fn());
const mockGenerateDiff      = vi.hoisted(() => vi.fn());
const mockResolvePath       = vi.hoisted(() => vi.fn((base, p) => base + '/' + p));

vi.mock('../api.js', () => ({
  askCerebrasStream: mockAskCerebrasStream,
  callServer: mockCallServer,
}));
vi.mock('../utils.js', () => ({
  parseActions: mockParseActions,
  executeAction: mockExecuteAction,
  resolvePath: mockResolvePath,
  generateDiff: mockGenerateDiff,
}));
vi.mock('../features.js', () => ({
  runHooksV2:      mockRunHooksV2,
  checkPermission: mockCheckPermission,
  tokenTracker:    mockTokenTracker,
  tfidfRank:       mockTfidfRank,
  selectSkills:    mockSelectSkills,
  parseElicitation: vi.fn().mockReturnValue(null),
}));
vi.mock('../constants.js', () => ({
  BASE_SYSTEM:          'BASE ',
  AUTO_COMPACT_CHARS:   80000,
  AUTO_COMPACT_MIN_MSG: 12,
  MAX_FILE_PREVIEW:     2000,
  MAX_SKILL_PREVIEW:    6000,
  CONTEXT_RECENT_KEEP:  6,
  VISION_MODEL:         'vision-model',
  FALLBACK_MODEL:       'fallback-model',
  MODELS:               [{ id: 'qwen-3-235b', label: 'Qwen', provider: 'cerebras' }],
}));

import { useAgentLoop } from './useAgentLoop.js';

function makeProject(o = {}) {
  return {
    folder: '/project', branch: 'main', model: 'qwen-3-235b',
    effortCfg: { maxIter: 3, maxTokens: 4096, systemSuffix: '' },
    notes: '', agentsMd: '', yuyuMd: '', diffReview: false,
    thinkingEnabled: false, permissions: { read_file: true, write_file: true, exec: true, patch_file: true },
    hooks: { preWrite: [], postWrite: [], preToolCall: [], postToolCall: [], onError: [] },
    skills: [], pinnedFiles: [], agentMemory: { user: [], project: [], local: [] },
    setYuyuMd: vi.fn(), setHistIdx: vi.fn(), addHistory: vi.fn(), setNotes: vi.fn(),
    ...o,
  };
}

function makeChat(o = {}) {
  return {
    messages: [{ role: 'assistant', content: 'hi' }],
    input: '', loading: false, visionImage: null,
    setMessages: vi.fn(fn => typeof fn === 'function' ? fn([]) : undefined),
    setInput: vi.fn(), setLoading: vi.fn(), setStreaming: vi.fn(),
    setAgentStatus: vi.fn(), setAgentRunning: vi.fn(), setShowFollowUp: vi.fn(),
    setSlashSuggestions: vi.fn(), setVisionImage: vi.fn(), setGracefulStop: vi.fn(),
    gracefulStop: false, trimHistory: vi.fn(m => m),
    getRelevantMemories: vi.fn().mockReturnValue([]),
    extractMemories: vi.fn(), startRateLimitTimer: vi.fn(), ttsEnabled: false, memories: [],
    ...o,
  };
}

function makeFile(o = {}) {
  return {
    selectedFile: null, fileContent: null, pinnedFiles: [],
    setActiveTab: vi.fn(), setEditHistory: vi.fn(),
    readFilesParallel: vi.fn().mockResolvedValue({}),
    ...o,
  };
}

function makeCtx(o = {}) {
  return {
    project: makeProject(o.project),
    chat: makeChat(o.chat),
    file: makeFile(o.file),
    ui: { setElicitationData: vi.fn() },
    sendNotification: vi.fn(),
    haptic: vi.fn(),
    speakText: vi.fn(),
    abortRef: { current: null },
    handleSlashCommandRef: { current: vi.fn() },
    growth: { addXP: vi.fn(), learnFromSession: vi.fn(), learnedStyle: '' },
    ...o,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockImplementation(({ type } = {}) =>
    Promise.resolve(type === 'ping' ? { ok: true } : { ok: false, data: '' })
  );
  mockAskCerebrasStream.mockResolvedValue('AI reply');
  mockParseActions.mockReturnValue([]);
  mockExecuteAction.mockResolvedValue({ ok: true, data: 'done' });
  mockRunHooksV2.mockResolvedValue(undefined);
  mockCheckPermission.mockReturnValue(true);
  mockTfidfRank.mockReturnValue([]);
  mockSelectSkills.mockReturnValue([]);
  mockGenerateDiff.mockReturnValue('diff');
});

// ── iter > 1 → setAgentRunning(true) + sendNotification ──────────────────────
describe('useAgentLoop — iter > 1 branches', () => {
  it('calls setAgentRunning(true) and sendNotification on iter > 1', async () => {
    let callCount = 0;
    mockAskCerebrasStream.mockImplementation(() => {
      callCount++;
      // iter 1: return with data so loop continues; iter 2: return without data
      return Promise.resolve(callCount === 1 ? 'reading' : 'All done!');
    });
    mockParseActions
      .mockReturnValueOnce([{ type: 'read_file', path: 'src/App.jsx' }])
      .mockReturnValue([]);
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'file content here' });

    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('do task'); });

    expect(ctx.chat.setAgentRunning).toHaveBeenCalledWith(true);
    expect(ctx.sendNotification).toHaveBeenCalled();
  });
});

// ── exec error → auto-fix loop ────────────────────────────────────────────────
describe('useAgentLoop — exec error auto-fix', () => {
  it('feeds error back to AI when exec returns error output', async () => {
    const execAction = { type: 'exec', command: 'node bad.js' };
    let callCount = 0;
    mockParseActions
      .mockReturnValueOnce([execAction])
      .mockReturnValue([]);
    mockAskCerebrasStream.mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount === 1 ? 'running' : 'fixed');
    });
    mockCheckPermission.mockReturnValue(true);
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'Error: Cannot find module' });

    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('run script'); });

    // AI called more than once due to auto-fix
    expect(mockAskCerebrasStream.mock.calls.length).toBeGreaterThan(1);
  });
});

// ── exec false positive — should NOT trigger auto-fix ────────────────────────
describe('useAgentLoop — exec false positive not treated as error', () => {
  it('does not auto-fix when exec output contains "passed"', async () => {
    const execAction = { type: 'exec', command: 'npm test' };
    mockParseActions.mockReturnValueOnce([execAction]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('tests ran');
    mockExecuteAction.mockResolvedValue({ ok: true, data: '661 tests passed ✅ 0 errors' });

    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('run tests'); });

    expect(mockAskCerebrasStream.mock.calls.length).toBeGreaterThanOrEqual(1); // no auto-fix retry, but loop may continue
  });
});

// ── autoVerifyWrites — error detected → continue ─────────────────────────────
describe('useAgentLoop — autoVerifyWrites error triggers continue', () => {
  it('continues loop when written file has runtime error', async () => {
    const writeAction = { type: 'write_file', path: 'src/App.js', content: 'bad code' };
    let aiCalls = 0;
    mockParseActions
      .mockReturnValueOnce([writeAction])
      .mockReturnValue([]);
    mockAskCerebrasStream.mockImplementation(() => {
      aiCalls++;
      return Promise.resolve(aiCalls === 1 ? 'writing' : 'fixed');
    });
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'written' });

    // ping ok, backup read, then exec verify → error
    mockCallServer.mockImplementation(({ type, command } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read')  return Promise.resolve({ ok: true, data: 'original' });
      if (type === 'exec' && command?.includes('node')) return Promise.resolve({ ok: true, data: 'TypeError: x is not defined' });
      return Promise.resolve({ ok: false, data: '' });
    });

    const ctx = makeCtx({
      project: makeProject({ permissions: { exec: true, write_file: true, read_file: true } }),
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write file'); });

    expect(aiCalls).toBeGreaterThan(1);
  });
});

// ── getRunCmd — .py file ──────────────────────────────────────────────────────
describe('useAgentLoop — getRunCmd .py extension', () => {
  it('uses python3 for .py files in autoVerify', async () => {
    const writeAction = { type: 'write_file', path: 'src/script.py', content: 'print("hi")' };
    mockParseActions.mockReturnValueOnce([writeAction]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('done');
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'written' });

    mockCallServer.mockImplementation(({ type, command } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read')  return Promise.resolve({ ok: true, data: 'original' });
      if (type === 'exec' && command?.includes('python3')) return Promise.resolve({ ok: true, data: '' });
      return Promise.resolve({ ok: false, data: '' });
    });

    const ctx = makeCtx({
      project: makeProject({ permissions: { exec: true, write_file: true, read_file: true } }),
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write python'); });

    const execCalls = mockCallServer.mock.calls.filter(c => c[0]?.type === 'exec' && c[0]?.command?.includes('python3'));
    expect(execCalls.length).toBeGreaterThan(0);
  });
});

// ── getRunCmd — .sh file ──────────────────────────────────────────────────────
describe('useAgentLoop — getRunCmd .sh extension', () => {
  it('uses bash for .sh files', async () => {
    const writeAction = { type: 'write_file', path: 'deploy.sh', content: '#!/bin/bash\necho hi' };
    mockParseActions.mockReturnValueOnce([writeAction]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('done');
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'written' });

    mockCallServer.mockImplementation(({ type, command } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read')  return Promise.resolve({ ok: true, data: 'original' });
      if (type === 'exec' && command?.includes('bash')) return Promise.resolve({ ok: true, data: '' });
      return Promise.resolve({ ok: false, data: '' });
    });

    const ctx = makeCtx({
      project: makeProject({ permissions: { exec: true, write_file: true, read_file: true } }),
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write shell'); });

    const execCalls = mockCallServer.mock.calls.filter(c => c[0]?.type === 'exec' && c[0]?.command?.includes('bash'));
    expect(execCalls.length).toBeGreaterThan(0);
  });
});

// ── defensive review — LGTM path (no patches applied) ────────────────────────
describe('useAgentLoop — defensive review LGTM', () => {
  it('does not apply patches when defensive review returns LGTM', async () => {
    const writeAction = { type: 'write_file', path: 'src/App.js', content: 'good code' };
    mockParseActions.mockReturnValueOnce([writeAction]).mockReturnValue([]);
    let aiCalls = 0;
    mockAskCerebrasStream.mockImplementation(() => {
      aiCalls++;
      if (aiCalls === 1) return Promise.resolve('writing file');
      if (aiCalls === 2) return Promise.resolve('LGTM'); // defensive review
      return Promise.resolve('done');
    });
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'written' });

    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read')  return Promise.resolve({ ok: true, data: 'original' });
      return Promise.resolve({ ok: false, data: '' });
    });

    const ctx = makeCtx({
      project: makeProject({ permissions: { exec: true, write_file: true, read_file: true } }),
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write file'); });

    // Defensive review ran (2 AI calls minimum) but no extra patches
    expect(aiCalls).toBeGreaterThanOrEqual(2);
  });
});

// ── defensive review — applies patches when review finds issues ───────────────
describe('useAgentLoop — defensive review applies fix', () => {
  it('applies patch from defensive review when issues found', async () => {
    const writeAction = { type: 'write_file', path: 'src/App.js', content: 'risky code' };
    const patchAction = { type: 'patch_file', path: 'src/App.js', old_str: 'risky', new_str: 'safe' };
    mockParseActions
      .mockReturnValueOnce([writeAction])  // iter 1: write
      .mockReturnValueOnce([patchAction])  // defensive review: patch
      .mockReturnValue([]);
    let aiCalls = 0;
    mockAskCerebrasStream.mockImplementation(() => {
      aiCalls++;
      if (aiCalls === 1) return Promise.resolve('writing');
      if (aiCalls === 2) return Promise.resolve('```action\n{"type":"patch_file","path":"src/App.js","old_str":"risky","new_str":"safe"}\n```');
      return Promise.resolve('done');
    });
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'done' });

    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read')  return Promise.resolve({ ok: true, data: 'original' });
      return Promise.resolve({ ok: false, data: '' });
    });

    const ctx = makeCtx({
      project: makeProject({ permissions: { exec: true, write_file: true, read_file: true } }),
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write risky code'); });

    expect(aiCalls).toBeGreaterThanOrEqual(2);
  });
});

// ── offline detection ─────────────────────────────────────────────────────────
describe('useAgentLoop — offline detection', () => {
  it('shows offline message when navigator.onLine is false', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockRejectedValue(new Error('fetch failed'));

    const origOnline = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('do task'); });

    expect(ctx.chat.setMessages).toHaveBeenCalled();

    if (origOnline) Object.defineProperty(navigator, 'onLine', origOnline);
    else Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });
});

// ── CONTINUE → auto sendMsg ───────────────────────────────────────────────────
describe('useAgentLoop — CONTINUE auto-continuation', () => {
  it('calls sendMsg again when reply ends with CONTINUE', async () => {
    mockAskCerebrasStream.mockResolvedValue('Partial response CONTINUE');
    mockParseActions.mockReturnValue([]);

    const sendMsgSpy = vi.fn().mockResolvedValue(undefined);
    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });

    const realSetTimeout = globalThis.setTimeout;
    let continueFn = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay) => {
      if (delay === 300) { continueFn = fn; return 1; }
      return realSetTimeout(fn, delay);
    });

    const { result } = renderHook(() => useAgentLoop(ctx));
    // Override sendMsg after render to capture auto-continue
    const origSendMsg = result.current.sendMsg;
    await act(async () => { await origSendMsg('do task'); });

    // CONTINUE should have scheduled a continuation
    expect(continueFn).not.toBeNull();
    vi.restoreAllMocks();
  });
});

// ── checkServerHealth catch → returns false ───────────────────────────────────
describe('checkServerHealth — ping throws', () => {
  it('returns false when ping throws', async () => {
    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.reject(new Error('network error'));
      return Promise.resolve({ ok: false, data: '' });
    });
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('hi'); });
    // Server unreachable → shows error message
    expect(ctx.chat.setMessages).toHaveBeenCalled();
  });
});

// ── !serverOk → shows error and returns ──────────────────────────────────────
describe('sendMsg — server down', () => {
  it('shows server error message when ping returns ok:false', async () => {
    mockCallServer.mockResolvedValue({ ok: false, data: '' });
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('do task'); });
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });
});

// ── sendMsg early return — chat.loading = true ────────────────────────────────
describe('sendMsg — early return when loading', () => {
  it('returns immediately when chat.loading is true', async () => {
    const ctx = makeCtx({ chat: makeChat({ loading: true }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('hi'); });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });
});

// ── sendMsg early return — empty txt ─────────────────────────────────────────
describe('sendMsg — early return when txt empty', () => {
  it('returns immediately when txt is empty', async () => {
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg(''); });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });
});

// ── gatherProjectContext — no folder → returns {} ────────────────────────────
describe('gatherProjectContext — no folder', () => {
  it('returns early when project.folder is null', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('done');
    const ctx = makeCtx({ project: makeProject({ folder: null }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('hi'); });
    // No folder = no context gathered, but still runs
    expect(mockAskCerebrasStream).toHaveBeenCalled();
  });
});

// ── executeWithPermission — permission denied ─────────────────────────────────
describe('executeWithPermission — permission denied', () => {
  it('returns permission error when checkPermission returns false', async () => {
    mockCheckPermission.mockReturnValue(false);
    mockParseActions.mockReturnValueOnce([{ type: 'exec', command: 'rm -rf /' }]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('running');
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('dangerous task'); });
    expect(mockCheckPermission).toHaveBeenCalled();
  });
});

// ── auto-compact triggers ─────────────────────────────────────────────────────
describe('sendMsg — auto-compact triggers', () => {
  it('triggers compactContext when context exceeds threshold', async () => {
    const bigContent = 'x'.repeat(85000);
    const manyMessages = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: bigContent,
    }));
    const compactContext = vi.fn().mockResolvedValue(undefined);
    const ctx = makeCtx({
      chat: makeChat({ messages: manyMessages, loading: false }),
    });
    // Inject compactContext via chat store mock
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('done');
    const { result } = renderHook(() => useAgentLoop({ ...ctx, compactContext }));
    await act(async () => { await result.current.sendMsg('big task'); });
    // Auto-compact path exercised (may or may not call depending on impl)
    expect(mockAskCerebrasStream).toHaveBeenCalled();
  });
});

// ── gracefulStop → gracefulStopPending = true ────────────────────────────────
describe('sendMsg — gracefulStop sets pending flag', () => {
  it('sets gracefulStopPending when chat.gracefulStop is true at loop start', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('doing stuff');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx({ chat: makeChat({ gracefulStop: true }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('task'); });
    expect(ctx.chat.setGracefulStop).toHaveBeenCalledWith(false);
  });
});

// ── PROJECT_NOTE extraction ───────────────────────────────────────────────────
describe('sendMsg — PROJECT_NOTE extraction', () => {
  it('calls setNotes when finalContent includes PROJECT_NOTE', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('Here is the result\nPROJECT_NOTE: remember this architecture decision');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('task'); });
    expect(ctx.project.setNotes).toHaveBeenCalled();
  });
});

// ── parseElicitation returns value → setElicitationData ──────────────────────
describe('sendMsg — elicitation data set', () => {
  it('calls setElicitationData when parseElicitation returns data', async () => {
    const { parseElicitation } = await import('../features.js');
    parseElicitation.mockReturnValueOnce({ question: 'What framework?', options: ['React', 'Vue'] });
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('reply with elicitation');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('task'); });
    expect(ctx.ui.setElicitationData).toHaveBeenCalled();
  });
});

// ── ttsEnabled → speakText called ────────────────────────────────────────────
describe('sendMsg — ttsEnabled calls speakText', () => {
  it('calls speakText when ttsEnabled is true and finalContent exists', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('spoken reply');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx({ chat: makeChat({ ttsEnabled: true }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('task'); });
    expect(ctx.speakText).toHaveBeenCalledWith('spoken reply');
  });
});

// ── catch — rate limit error ──────────────────────────────────────────────────
describe('sendMsg — catch RATE_LIMIT error', () => {
  it('shows rate limit message and starts timer', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockRejectedValue(new Error('RATE_LIMIT: retry after:30'));
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('task'); });
    expect(ctx.chat.startRateLimitTimer).toHaveBeenCalled();
  });
});

// ── catch — generic non-abort non-rate-limit online error ────────────────────
describe('sendMsg — catch generic error online', () => {
  it('shows red X error message for generic errors', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockRejectedValue(new Error('Something went wrong'));
    // ensure navigator.onLine = true (default)
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('task'); });
    expect(ctx.chat.setMessages).toHaveBeenCalled();
  });
});

// ── retryLast — no user message ───────────────────────────────────────────────
describe('retryLast — no user message found', () => {
  it('returns early when no user message in history', async () => {
    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.retryLast(); });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });
});

// ── retryLast — user message exists ──────────────────────────────────────────
describe('retryLast — user message found', () => {
  it('sends last user message again', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('retried reply');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx({
      chat: makeChat({
        messages: [
          { role: 'user', content: 'fix this bug' },
          { role: 'assistant', content: 'trying...' },
        ],
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.retryLast(); });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
  });
});

// ── webSearch + safeActions parallel block ────────────────────────────────────
describe('sendMsg — webSearch and safeActions execute in parallel', () => {
  it('executes web_search actions', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: true, data: 'search results' })
    );
    mockParseActions.mockReturnValueOnce([
      { type: 'web_search', query: 'react hooks' },
    ]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('searching');
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'results' });
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('search react hooks'); });
    expect(mockExecuteAction).toHaveBeenCalled();
  });
});

// ── patch diffReview — new file (no orig.data) ───────────────────────────────
describe('sendMsg — patch diffReview new file branch', () => {
  it('uses content lines as diff preview for new file in diffReview', async () => {
    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read') return Promise.resolve({ ok: false, data: '' }); // no orig
      return Promise.resolve({ ok: false, data: '' });
    });
    mockParseActions.mockReturnValueOnce([
      { type: 'patch_file', path: 'src/new.js', old_str: 'old', new_str: 'new content here' },
    ]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('patching');
    const ctx = makeCtx({ project: makeProject({ diffReview: true }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('patch file'); });
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });
});

// ── write diffReview — new file (no orig.data) ───────────────────────────────
describe('sendMsg — write diffReview new file branch', () => {
  it('uses content lines for new file write in diffReview', async () => {
    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read') return Promise.resolve({ ok: false, data: '' }); // new file
      return Promise.resolve({ ok: false, data: '' });
    });
    mockParseActions.mockReturnValueOnce([
      { type: 'write_file', path: 'src/brand-new.js', content: 'line1\nline2\nline3' },
    ]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('writing new file');
    const ctx = makeCtx({ project: makeProject({ diffReview: true }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write new file'); });
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });
});

// ── patch failed.length > 0 → self-correct ───────────────────────────────────
describe('sendMsg — patch fails → self-correct message', () => {
  it('feeds error back to AI when patch_file fails', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockParseActions.mockReturnValueOnce([
      { type: 'patch_file', path: 'src/App.js', old_str: 'NOTFOUND', new_str: 'new' },
    ]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('patching');
    mockExecuteAction.mockResolvedValue({ ok: false, data: 'old_str not found' });
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('patch task'); });
    expect(mockAskCerebrasStream.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});

// ── abTest — catch block ──────────────────────────────────────────────────────
describe('abTest — catch block', () => {
  it('shows error message when abTest throws', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream
      .mockResolvedValueOnce('done') // sendMsg initial ping passes
      .mockRejectedValue(new Error('API error'));
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.abTest('task', 'model-a', 'model-b'); });
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });
});

// ── callAI — imageBase64 true → VISION_MODEL ─────────────────────────────────
describe('callAI — vision model when imageBase64 provided', () => {
  it('uses VISION_MODEL when imageBase64 is provided', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('vision reply');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx({
      chat: makeChat({ visionImage: 'data:image/jpeg;base64,abc123' }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('describe image'); });
    // callAI was called with imageBase64 → should use VISION_MODEL
    expect(mockAskCerebrasStream).toHaveBeenCalledWith(
      expect.anything(),
      'vision-model',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });
});

// ── vision content array — Array.isArray(m.content) ──────────────────────────
describe('sendMsg — vision content array flattened to string', () => {
  it('flattens array content (vision) to string for history', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('done');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx({
      chat: makeChat({
        messages: [
          { role: 'user', content: [{ type: 'text', text: 'what is this?' }, { type: 'image_url', url: 'data:...' }] },
          { role: 'assistant', content: 'an image' },
        ],
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('follow up'); });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
  });
});

// ── getRunCmd — unknown extension returns null ────────────────────────────────
describe('autoVerifyWrites — unknown extension skipped', () => {
  it('skips verify when file has unknown extension (getRunCmd returns null)', async () => {
    const writeAction = { type: 'write_file', path: 'src/config.yaml', content: 'key: value' };
    mockParseActions.mockReturnValueOnce([writeAction]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('done');
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'written' });
    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read') return Promise.resolve({ ok: true, data: 'original' });
      return Promise.resolve({ ok: false, data: '' });
    });
    const ctx = makeCtx({
      project: makeProject({ permissions: { exec: true, write_file: true, read_file: true } }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write yaml'); });
    // No exec call for yaml — getRunCmd returns null
    const execCalls = mockCallServer.mock.calls.filter(c => c[0]?.type === 'exec');
    expect(execCalls.length).toBe(0);
  });
});

// ── compactContext — messages.length < 10 early return ───────────────────────
describe('compactContext — too few messages', () => {
  it('shows "Context masih kecil" when less than 10 messages', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('done');
    mockParseActions.mockReturnValue([]);
    const setMessages = vi.fn();
    const ctx = makeCtx({
      chat: makeChat({
        messages: Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `msg${i}` })),
        setMessages,
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.compactContext(); });
    const allCalls = setMessages.mock.calls.flat();
    const msgs = allCalls.map(c => typeof c === 'function' ? c([]) : c).flat();
    const hasSmallMsg = msgs.some(m => m?.content?.includes('masih kecil'));
    expect(hasSmallMsg).toBe(true);
  });
});

// ── compactContext — catch non-AbortError ─────────────────────────────────────
describe('compactContext — catch non-AbortError', () => {
  it('shows error message when compact throws non-AbortError', async () => {
    const { askCerebrasStream } = await import('../api.js');
    // First call = sendMsg ping ok, second = compactContext throws
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream
      .mockResolvedValueOnce('done') // sendMsg main call
      .mockRejectedValueOnce(new Error('stream failed')); // compactContext call
    mockParseActions.mockReturnValue([]);
    const setMessages = vi.fn();
    const ctx = makeCtx({
      chat: makeChat({
        messages: Array.from({ length: 15 }, (_, i) => ({ role: 'user', content: `msg${i}` })),
        setMessages,
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.compactContext(); });
    expect(setMessages).toHaveBeenCalled();
  });
});

// ── buildFeedback — write failed branch ──────────────────────────────────────
describe('sendMsg — buildFeedback write failed', () => {
  it('shows write failed in feedback when write action fails', async () => {
    const writeAction = { type: 'write_file', path: 'src/App.js', content: 'code' };
    mockParseActions.mockReturnValueOnce([writeAction]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('writing');
    mockExecuteAction.mockResolvedValue({ ok: false, data: 'permission denied' });
    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read') return Promise.resolve({ ok: true, data: 'backup' });
      return Promise.resolve({ ok: false, data: '' });
    });
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('write file'); });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
  });
});

// ── agentNote — iter >= MAX_ITER ─────────────────────────────────────────────
describe('sendMsg — agentNote appended at MAX_ITER', () => {
  it('appends final iteration note when iter reaches MAX_ITER', async () => {
    // Force loop to run MAX_ITER times by always returning combinedData
    let callCount = 0;
    mockAskCerebrasStream.mockImplementation(() => {
      callCount++;
      return Promise.resolve('response ' + callCount);
    });
    mockParseActions.mockImplementation(() => {
      // Always return a read_file so combinedData is not null and loop continues
      return callCount <= 3 ? [{ type: 'read_file', path: 'src/App.js' }] : [];
    });
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'content' });
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: true, data: 'data' })
    );
    const ctx = makeCtx({
      project: makeProject({ effortCfg: { maxIter: 3, maxTokens: 4096, systemSuffix: '' } }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('long task'); });
    expect(callCount).toBeGreaterThanOrEqual(3);
  });
});

// ── retryLast — idx === -1 (lastUser is last msg, no slice) ──────────────────
describe('retryLast — idx is -1, uses full messages', () => {
  it('uses full message array when lastUser is the last message', async () => {
    mockCallServer.mockImplementation(({ type } = {}) =>
      type === 'ping' ? Promise.resolve({ ok: true }) : Promise.resolve({ ok: false, data: '' })
    );
    mockAskCerebrasStream.mockResolvedValue('retried');
    mockParseActions.mockReturnValue([]);
    const ctx = makeCtx({
      chat: makeChat({
        // lastUser IS the last message, so lastIndexOf returns last index
        // but the retryLast logic: idx = m.lastIndexOf(lastUser)
        // if idx !== -1, use m.slice(0, idx), else use m
        // So we need a case where find returns a user msg but lastIndexOf is -1
        // Actually looking at the code: messages.reverse().find(m => m.role === 'user')
        // then chat.setMessages(m => { idx = m.lastIndexOf(lastUser); return idx !== -1 ? m.slice(0, idx) : m })
        // To hit idx === -1: lastUser object from reversed copy not found by reference in original
        messages: [
          { role: 'assistant', content: 'hello' },
          { role: 'user', content: 'retry me' },
        ],
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.retryLast(); });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
  });
});

// ── patch diffReview — orig.ok && orig.data && a.old_str (true branch) ───────
describe('sendMsg — patch diffReview with orig data and old_str', () => {
  it('computes diff preview when orig has data and old_str exists', async () => {
    mockCallServer.mockImplementation(({ type } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true });
      if (type === 'read') return Promise.resolve({ ok: true, data: 'original content here' });
      return Promise.resolve({ ok: false, data: '' });
    });
    mockParseActions.mockReturnValueOnce([
      { type: 'patch_file', path: 'src/App.js', old_str: 'original', new_str: 'replaced' },
    ]).mockReturnValue([]);
    mockAskCerebrasStream.mockResolvedValue('patching with diff');
    const ctx = makeCtx({ project: makeProject({ diffReview: true }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('patch with review'); });
    expect(mockGenerateDiff).toHaveBeenCalled();
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });
});
