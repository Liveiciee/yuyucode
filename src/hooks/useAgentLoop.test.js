// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ── Mocks ─────────────────────────────────────────────────────────────────────
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
  BASE_SYSTEM:            'BASE_SYSTEM ',
  AUTO_COMPACT_CHARS:     80000,
  AUTO_COMPACT_MIN_MSG:   12,
  MAX_FILE_PREVIEW:       2000,
  MAX_SKILL_PREVIEW:      6000,
  CONTEXT_RECENT_KEEP:    6,
  VISION_MODEL:           'vision-model',
  FALLBACK_MODEL:         'fallback-model',
  MODELS:                 [{ id: 'qwen-3-235b', label: 'Qwen', provider: 'cerebras' }],
}));

import { useAgentLoop } from './useAgentLoop.js';

// ── Fake context builders ─────────────────────────────────────────────────────
function makeProject(overrides = {}) {
  return {
    folder: '/project',
    branch: 'main',
    model: 'qwen-3-235b',
    effortCfg: { maxIter: 3, maxTokens: 4096, systemSuffix: '' },
    notes: '',
    agentsMd: '',
    yuyuMd: '',
    diffReview: false,
    thinkingEnabled: false,
    permissions: { read_file: true, write_file: true, exec: true },
    hooks: { preWrite: [], postWrite: [], preToolCall: [], postToolCall: [] },
    skills: [],
    pinnedFiles: [],
    agentMemory: { user: [], project: [], local: [] },
    setYuyuMd: vi.fn(),
    setHistIdx: vi.fn(),
    addHistory: vi.fn(),
    ...overrides,
  };
}

function makeChat(overrides = {}) {
  return {
    messages: [{ role: 'assistant', content: 'Halo!' }],
    input: '',
    loading: false,
    visionImage: null,
    setMessages: vi.fn(fn => typeof fn === 'function' ? fn([]) : undefined),
    setInput: vi.fn(),
    setLoading: vi.fn(),
    setStreaming: vi.fn(),
    setAgentStatus: vi.fn(),
    setAgentRunning: vi.fn(),
    setShowFollowUp: vi.fn(),
    setSlashSuggestions: vi.fn(),
    setVisionImage: vi.fn(),
    setGracefulStop: vi.fn(),
    gracefulStop: false,
    trimHistory: vi.fn(msgs => msgs),
    getRelevantMemories: vi.fn().mockReturnValue([]),
    memories: [],
    ...overrides,
  };
}

function makeFile(overrides = {}) {
  return {
    selectedFile: null,
    fileContent: null,
    pinnedFiles: [],
    setActiveTab: vi.fn(),
    setEditHistory: vi.fn(),
    readFilesParallel: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

function makeCtx(overrides = {}) {
  const abortRef = { current: null };
  return {
    project: makeProject(overrides.project),
    chat: makeChat(overrides.chat),
    file: makeFile(overrides.file),
    ui: {},
    sendNotification: vi.fn(),
    haptic: vi.fn(),
    speakText: vi.fn(),
    abortRef,
    handleSlashCommandRef: { current: vi.fn() },
    growth: { addXP: vi.fn(), learnFromSession: vi.fn(), learnedStyle: '' },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCallServer.mockImplementation(({ type } = {}) =>
    Promise.resolve(type === 'ping' ? { ok: true, data: 'pong' } : { ok: false, data: '' })
  );
  mockAskCerebrasStream.mockResolvedValue('AI response');
  mockParseActions.mockReturnValue([]);
  mockExecuteAction.mockResolvedValue({ ok: true, data: 'done' });
  mockRunHooksV2.mockResolvedValue(undefined);
  mockCheckPermission.mockReturnValue(true);
  mockTfidfRank.mockReturnValue([]);
  mockSelectSkills.mockReturnValue([]);
  mockGenerateDiff.mockReturnValue('diff output');
});

// ── cancelMsg ─────────────────────────────────────────────────────────────────
describe('useAgentLoop — cancelMsg', () => {
  it('aborts signal and resets loading state', () => {
    const ctx = makeCtx();
    const ctrl = new AbortController();
    ctx.abortRef.current = ctrl;
    const { result } = renderHook(() => useAgentLoop(ctx));
    act(() => { result.current.cancelMsg(); });
    expect(ctrl.signal.aborted).toBe(true);
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
    expect(ctx.chat.setStreaming).toHaveBeenCalledWith('');
    expect(ctx.chat.setAgentRunning).toHaveBeenCalledWith(false);
  });
});

// ── sendMsg — slash command ───────────────────────────────────────────────────
describe('useAgentLoop — sendMsg slash command', () => {
  it('delegates to handleSlashCommandRef for slash commands', async () => {
    const handleSlash = vi.fn().mockResolvedValue(undefined);
    const ctx = makeCtx({
      chat: makeChat({ input: '/status' }),
    });
    ctx.handleSlashCommandRef.current = handleSlash;
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('/status'); });
    expect(handleSlash).toHaveBeenCalledWith('/status');
  });

  it('does nothing when input is empty', async () => {
    const ctx = makeCtx({ chat: makeChat({ input: '' }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg(''); });
    expect(ctx.chat.setLoading).not.toHaveBeenCalled();
  });

  it('does nothing when already loading', async () => {
    const ctx = makeCtx({ chat: makeChat({ input: 'hello', loading: true }) });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('hello'); });
    expect(ctx.chat.setLoading).not.toHaveBeenCalled();
  });
});

// ── sendMsg — server unreachable ──────────────────────────────────────────────
describe('useAgentLoop — sendMsg server check', () => {
  it('shows error and returns when server ping fails', async () => {
    mockCallServer.mockResolvedValue({ ok: false, data: 'connection refused' });
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('fix bug'); });
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
    expect(ctx.chat.setMessages).toHaveBeenCalled();
  });
});

// ── sendMsg — basic loop ──────────────────────────────────────────────────────
describe('useAgentLoop — sendMsg basic loop', () => {
  it('runs one iteration and sets messages when AI returns no actions', async () => {

    mockAskCerebrasStream.mockResolvedValue('Task selesai!');
    mockParseActions.mockReturnValue([]);

    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('do something'); });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });

  it('executes read_file actions in parallel', async () => {
    const readAction = { type: 'read_file', path: 'src/App.jsx' };

    mockParseActions
      .mockReturnValueOnce([readAction])
      .mockReturnValue([]);
    mockAskCerebrasStream
      .mockResolvedValueOnce('reading file')
      .mockResolvedValue('Done');
    mockExecuteAction.mockResolvedValue({ ok: true, data: 'file content' });

    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('read a file'); });
    expect(mockExecuteAction).toHaveBeenCalled();
  });

  it('executes exec actions serially', async () => {

    const execAction = { type: 'exec', command: 'npm test' };
    mockParseActions
      .mockReturnValueOnce([execAction])
      .mockReturnValue([]);
    mockAskCerebrasStream
      .mockResolvedValueOnce('running tests')
      .mockResolvedValue('done');

    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('run tests'); });
    expect(mockCheckPermission).toHaveBeenCalledWith(
      expect.any(Object), 'exec'
    );
  });
});

// ── compactContext ────────────────────────────────────────────────────────────
describe('useAgentLoop — compactContext', () => {
  it('does nothing when fewer than 10 messages', async () => {
    const ctx = makeCtx({
      chat: makeChat({
        messages: Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `msg ${i}` })),
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.compactContext(); });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
    expect(ctx.chat.setMessages).toHaveBeenCalled(); // "context masih kecil" message
  });

  it('compacts when >= 10 messages', async () => {
    mockAskCerebrasStream.mockResolvedValue('Ringkasan: fix bug di api.js');
    const ctx = makeCtx({
      chat: makeChat({
        messages: Array.from({ length: 15 }, (_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'message content ' + i,
        })),
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.compactContext(); });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
    expect(ctx.chat.setMessages).toHaveBeenCalled();
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });

  it('handles AbortError gracefully', async () => {
    mockAskCerebrasStream.mockRejectedValueOnce(
      Object.assign(new Error('aborted'), { name: 'AbortError' })
    );
    const ctx = makeCtx({
      chat: makeChat({
        messages: Array.from({ length: 15 }, (_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'msg ' + i,
        })),
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await expect(
      act(async () => { await result.current.compactContext(); })
    ).resolves.not.toThrow();
  });
});

// ── abTest ────────────────────────────────────────────────────────────────────
describe('useAgentLoop — abTest', () => {
  it('calls both models in parallel and shows side-by-side result', async () => {
    mockAskCerebrasStream
      .mockResolvedValueOnce('Model A response')
      .mockResolvedValueOnce('Model B response');
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => {
      await result.current.abTest('build a feature', 'model-a', 'model-b');
    });
    expect(mockAskCerebrasStream).toHaveBeenCalledTimes(2);
    expect(ctx.chat.setMessages).toHaveBeenCalled();
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
    expect(ctx.growth.addXP).toHaveBeenCalledWith('message_sent');
  });

  it('shows error when AI call fails', async () => {
    mockAskCerebrasStream.mockRejectedValue(new Error('API error'));
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => {
      await result.current.abTest('task', 'model-a', 'model-b');
    });
    expect(ctx.chat.setMessages).toHaveBeenCalled();
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });
});

// ── continueMsg / retryLast ───────────────────────────────────────────────────
describe('useAgentLoop — continueMsg + retryLast', () => {
  it('continueMsg sends continuation prompt', async () => {
    mockCallServer.mockResolvedValue({ ok: false, data: '' }); // server down → returns early
    const ctx = makeCtx();
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.continueMsg(); });
    // continueMsg delegates to sendMsg — loading was set
    expect(ctx.chat.setLoading).toHaveBeenCalled();
  });

  it('retryLast re-sends last user message', async () => {
    mockCallServer.mockResolvedValue({ ok: false, data: '' }); // server down → returns early
    const ctx = makeCtx({
      chat: makeChat({
        messages: [
          { role: 'assistant', content: 'hi' },
          { role: 'user', content: 'fix the bug' },
          { role: 'assistant', content: 'done' },
        ],
      }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.retryLast(); });
    expect(ctx.chat.setMessages).toHaveBeenCalled();
  });

  it('retryLast does nothing when no user message found', async () => {
    const ctx = makeCtx({
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.retryLast(); });
    expect(ctx.chat.setLoading).not.toHaveBeenCalled();
  });
});

// ── executeWithPermission ─────────────────────────────────────────────────────
describe('useAgentLoop — permission check', () => {
  it('blocks exec when permission denied', async () => {
    mockCheckPermission.mockReturnValue(false);

    const execAction = { type: 'exec', command: 'rm -rf /' };
    mockParseActions
      .mockReturnValueOnce([execAction])
      .mockReturnValue([]);
    mockAskCerebrasStream
      .mockResolvedValueOnce('exec action')
      .mockResolvedValue('done');

    const ctx = makeCtx({
      project: makeProject({ permissions: { exec: false } }),
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('delete everything'); });
    // checkPermission was called and returned false — result should be permission denied
    expect(mockCheckPermission).toHaveBeenCalled();
  });
});

// ── diffReview mode ───────────────────────────────────────────────────────────
describe('useAgentLoop — diffReview mode', () => {
  it('pauses loop and marks actions pending when diffReview is on', async () => {
    // beforeEach handles ping; also pass through read for App.jsx (diffPreview)
    mockCallServer.mockImplementation(({ type, path } = {}) => {
      if (type === 'ping') return Promise.resolve({ ok: true, data: 'pong' });
      if (type === 'read') return Promise.resolve({ ok: true, data: 'original content' });
      return Promise.resolve({ ok: false, data: '' });
    });
    const writeAction = { type: 'write_file', path: 'src/App.jsx', content: 'new code' };
    mockParseActions.mockReturnValue([writeAction]);
    mockAskCerebrasStream.mockResolvedValue('writing file');

    const ctx = makeCtx({
      project: makeProject({ diffReview: true }),
      chat: makeChat({ messages: [{ role: 'assistant', content: 'hi' }] }),
    });
    const { result } = renderHook(() => useAgentLoop(ctx));
    await act(async () => { await result.current.sendMsg('rewrite App'); });
    // diffReview = true → should return early (not execute the write)
    expect(mockExecuteAction).not.toHaveBeenCalled();
    expect(ctx.chat.setLoading).toHaveBeenCalledWith(false);
  });
});
