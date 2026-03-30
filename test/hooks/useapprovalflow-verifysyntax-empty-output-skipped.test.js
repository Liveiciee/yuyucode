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

describe('useApprovalFlow — verifySyntax empty output skipped', () => {
  it('skips error check when exec returns empty vOut', async () => {
    const action = { type: 'write_file', path: 'src/App.js', executed: false };
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: '   ' }); // empty/whitespace output

    executeAction.mockResolvedValue({ ok: true, data: 'written' });
    const sendMsgRef = { current: vi.fn() };
    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
      sendMsgRef,
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    // No syntax error message should be posted
    const allCalls = ctx.setMessages.mock.calls.flat();
    const msgs = allCalls.map(c => typeof c === 'function' ? c([]) : c).flat();
    const hasSyntaxErr = msgs.some(m => m?.content?.includes('Syntax error'));
    expect(hasSyntaxErr).toBe(false);
  });
});
