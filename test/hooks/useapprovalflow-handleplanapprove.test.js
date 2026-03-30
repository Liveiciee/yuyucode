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

describe('useApprovalFlow — handlePlanApprove', () => {
  it('reject sends "Ubah plan" to AI', async () => {
    const sendMsgRef = { current: vi.fn() };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'Plan:\n1. step one', actions: [] }],
      sendMsgRef,
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, false);
    expect(sendMsgRef.current).toHaveBeenCalledWith('Ubah plan.');
  });

  it('approve with no steps sends simple message', async () => {
    const sendMsgRef = { current: vi.fn() };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'ok', actions: [] }],
      sendMsgRef,
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, true);
    expect(sendMsgRef.current).toHaveBeenCalledWith(
      expect.stringContaining('Plan diapprove')
    );
  });
});
