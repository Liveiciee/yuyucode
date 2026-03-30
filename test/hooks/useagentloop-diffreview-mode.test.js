// @vitest-environment happy-dom
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
  getSystemForModel:      vi.fn().mockReturnValue('BASE_SYSTEM '),
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
    extractMemories: vi.fn(),
    startRateLimitTimer: vi.fn(),
    ttsEnabled: false,
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
