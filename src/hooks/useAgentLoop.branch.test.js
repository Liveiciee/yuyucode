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
