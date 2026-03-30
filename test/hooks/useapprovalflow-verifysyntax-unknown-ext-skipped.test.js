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

describe('useApprovalFlow — verifySyntax unknown ext skipped', () => {
  it('skips syntax check for unknown extensions like .css', async () => {
    const action = { type: 'write_file', path: 'styles.css', executed: false };
    mockCallServer.mockResolvedValueOnce({ ok: true, data: 'backup' });
    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    // exec should NOT be called for .css (getSyntaxCmd returns null)
    const execCalls = mockCallServer.mock.calls.filter(c => c[0]?.type === 'exec');
    expect(execCalls.length).toBe(0);
  });

  it('skips syntax check for .md files', async () => {
    const action = { type: 'write_file', path: 'README.md', executed: false };
    mockCallServer.mockResolvedValueOnce({ ok: true, data: 'backup' });
    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    const execCalls = mockCallServer.mock.calls.filter(c => c[0]?.type === 'exec');
    expect(execCalls.length).toBe(0);
  });
}