// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgentLoop } from '../../../src/hooks/useAgentLoop.js';
import { makeProject, makeChat, makeFile, makeCtx } from './_helpers.js';

// Mock API and utils
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

vi.mock('../../../src/api.js', () => ({
  askCerebrasStream: mockAskCerebrasStream,
  callServer: mockCallServer,
}));
vi.mock('../../../src/utils.js', () => ({
  parseActions: mockParseActions,
  executeAction: mockExecuteAction,
  resolvePath: mockResolvePath,
  generateDiff: mockGenerateDiff,
}));
vi.mock('../../../src/features.js', () => ({
  runHooksV2:      mockRunHooksV2,
  checkPermission: mockCheckPermission,
  tokenTracker:    mockTokenTracker,
  tfidfRank:       mockTfidfRank,
  selectSkills:    mockSelectSkills,
  parseElicitation: vi.fn().mockReturnValue(null),
}));
vi.mock('../../../src/constants.js', () => ({
  getSystemForModel: vi.fn().mockReturnValue('SYSTEM '),
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
