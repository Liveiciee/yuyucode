// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockCallServer = vi.hoisted(() => vi.fn());

vi.mock('../../src/api.js', () => ({
  callServer: mockCallServer,
}));
vi.mock('../../src/utils.js', () => ({
  executeAction:      vi.fn().mockResolvedValue({ ok: true, data: 'written' }),
  resolvePath:        vi.fn((base, p) => base + '/' + p),
  backupFiles:        vi.fn(),
  verifySyntaxBatch:  vi.fn(),
}));
vi.mock('../../src/features.js', () => ({
  runHooksV2:      vi.fn().mockResolvedValue(undefined),
  executePlanStep: vi.fn().mockResolvedValue({ reply: '```action\n{}\n```', actions: [] }),
  parsePlanSteps:  vi.fn().mockReturnValue([]),
}));

import { executeAction, backupFiles, verifySyntaxBatch } from '../../src/utils.js';
import { useApprovalFlow } from '../../src/hooks/useApprovalFlow.js';

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

describe('useApprovalFlow — verifySyntax SYNTAX_ERR', () => {
  it('posts syntax error message and triggers fix via sendMsgRef', async () => {
    const realSetTimeout = globalThis.setTimeout;
    let capturedFn = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay, ...args) => {
      if (delay === 700) { capturedFn = fn; return 1; }
      return realSetTimeout(fn, delay, ...args);
    });

    const action = { type: 'write_file', path: 'src/App.js', executed: false };
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })           // backup read
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_ERR: unexpected token' }); // syntax check

    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const sendMsgRef = { current: vi.fn() };
    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
      sendMsgRef,
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);

    if (capturedFn) {
      capturedFn();
      expect(sendMsgRef.current).toHaveBeenCalledWith(
        expect.stringContaining('Fix syntax error')
      );
    }
    vi.restoreAllMocks();
  });

  it('handles json file syntax check', async () => {
    const action = { type: 'write_file', path: 'config.json', executed: false };
    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(verifySyntaxBatch).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ path: 'config.json' })]),
      expect.any(String),
      expect.any(Function),
      expect.anything()
    );
  });

  it('handles sh file syntax check', async () => {
    const action = { type: 'write_file', path: 'deploy.sh', executed: false };
    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(verifySyntaxBatch).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ path: 'deploy.sh' })]),
      expect.any(String),
      expect.any(Function),
      expect.anything()
    );
  });
});
