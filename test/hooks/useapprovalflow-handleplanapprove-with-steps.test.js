// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockCallServer = vi.hoisted(() => vi.fn());

vi.mock('../api.js', () => ({
  callServer: mockCallServer,
}));
vi.mock('../utils.js', () => ({
  executeAction:      vi.fn().mockResolvedValue({ ok: true, data: 'written' }),
  resolvePath:        vi.fn((base, p) => base + '/' + p),
  backupFiles:        vi.fn(),
  verifySyntaxBatch:  vi.fn(),
}));
vi.mock('../features.js', () => ({
  runHooksV2:      vi.fn().mockResolvedValue(undefined),
  executePlanStep: vi.fn().mockResolvedValue({ reply: '```action\n{}\n```', actions: [] }),
  parsePlanSteps:  vi.fn().mockReturnValue([]),
}));

import { executeAction, backupFiles, verifySyntaxBatch } from '../utils.js';
import { useApprovalFlow } from './useApprovalFlow.js';

function makeCtx(overrides = {}) {
  const messages = overrides.messages || [];
  const setMessages = vi.fn(fn => {
    if (typeof fn === 'function') fn(messages);
  });
  return {
    messages,
    setMessages,
    folder: '/project',
    hooks: { postWrite: [] },
    permissions: { exec: false },
    _editHistory: [],
    setEditHistory: vi.fn(),
    sendMsgRef: { current: vi.fn() },
    callAI: vi.fn().mockResolvedValue('AI reply'),
    abortRef: { current: null },
    setLoading: vi.fn(),
    ...overrides,
  };
}

beforeEach(async () => {
  vi.clearAllMocks();
  mockCallServer.mockResolvedValue({ ok: true, data: 'original content' });
  executeAction.mockResolvedValue({ ok: true, data: 'written' });
  backupFiles.mockResolvedValue([]);
  verifySyntaxBatch.mockResolvedValue(undefined);
  const { parsePlanSteps } = await import('../features.js');
  parsePlanSteps.mockReturnValue([]);
});

// ── handleApprove — reject ────────────────────────────────────────────────────

describe('useApprovalFlow — handlePlanApprove with steps', () => {
  it('executes steps and shows completion message', async () => {
    const { parsePlanSteps } = await import('../features.js');
    parsePlanSteps.mockReturnValue([
      { num: 1, text: 'Read files', done: false, result: null },
      { num: 2, text: 'Make changes', done: false, result: null },
    ]);

    const { executePlanStep } = await import('../features.js');
    executePlanStep.mockResolvedValue({ reply: 'Done step.', actions: [] });

    const sendMsgRef = { current: vi.fn() };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: '1. Read files\n2. Make changes', actions: [] }],
      sendMsgRef,
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, true);

    expect(ctx.setMessages).toHaveBeenCalled();
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });

  it('aborts plan execution on signal abort', async () => {
    const { parsePlanSteps } = await import('../features.js');
    parsePlanSteps.mockReturnValue([
      { num: 1, text: 'Slow step', done: false, result: null },
    ]);

    const { executePlanStep } = await import('../features.js');
    executePlanStep.mockImplementation((_step, _folder, _callAI, signal) => {
      if (signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
      return Promise.resolve({ reply: 'done', actions: [] });
    });

    const abortRef = { current: null };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: '1. Slow step', actions: [] }],
      abortRef,
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, true);
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });

  it('handles step with write actions — shows diff review card', async () => {
    const { parsePlanSteps } = await import('../features.js');
    parsePlanSteps.mockReturnValue([
      { num: 1, text: 'Write file', done: false, result: null },
    ]);

    const { executePlanStep } = await import('../features.js');
    executePlanStep.mockResolvedValue({
      reply: 'Writing file...',
      actions: [{ type: 'write_file', path: 'src/App.jsx', content: 'new code' }],
    });

    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: '1. Write file', actions: [] }],
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, true);
    expect(ctx.setMessages).toHaveBeenCalled();
  });
});
