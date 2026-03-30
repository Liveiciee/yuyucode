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

describe('useApprovalFlow — handlePlanApprove step throws non-AbortError', () => {
  it('shows error message when step throws non-AbortError', async () => {
    const { parsePlanSteps } = await import('../features.js');
    parsePlanSteps.mockReturnValue([
      { num: 1, text: 'Failing step', done: false, result: null },
    ]);
    const { executePlanStep } = await import('../features.js');
    executePlanStep.mockRejectedValue(new Error('AI call failed'));

    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: '1. Failing step', actions: [] }],
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, true);
    // Should show error message and continue
    const allCalls = ctx.setMessages.mock.calls.flat();
    const msgs = allCalls.map(c => typeof c === 'function' ? c([]) : c).flat();
    const hasErr = msgs.some(m => m?.content?.includes('error') || m?.content?.includes('❌'));
    expect(hasErr).toBe(true);
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });
});
