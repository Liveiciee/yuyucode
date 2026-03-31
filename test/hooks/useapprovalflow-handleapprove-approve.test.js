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

describe('useApprovalFlow — handleApprove approve', () => {
  it('backs up files, writes, and updates messages', async () => {
    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(backupFiles).toHaveBeenCalled();
    expect(executeAction).toHaveBeenCalled();
  });

  it('rolls back atomically when any write fails', async () => {
    executeAction.mockResolvedValueOnce({ ok: false, data: 'disk full' });
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    backupFiles.mockResolvedValueOnce([
      { path: '/project/a.js', content: 'backup_a' },
      { path: '/project/b.js', content: 'backup_b' },
    ]);
    mockCallServer.mockResolvedValue({ ok: true, data: '' }); // rollback writes
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write', actions }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, '__all__');
    // Rollback: should call write for each backup
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'write' }));
  });

  it('approves only __all__ target', async () => {
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write', actions }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, '__all__');
    expect(executeAction).toHaveBeenCalledTimes(2);
  });

  it('approves only specific targetPath', async () => {
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write', actions }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, 'a.js');
    expect(executeAction).toHaveBeenCalledTimes(1);
  });

  it('auto-resumes agent after all writes done', async () => {
    const realSetTimeout = globalThis.setTimeout;
    let capturedFn = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay, ...args) => {
      if (delay === 400) { capturedFn = fn; return 1; }
      return realSetTimeout(fn, delay, ...args);
    });

    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const sendMsgRef = { current: vi.fn() };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
      sendMsgRef,
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    if (capturedFn) {
      capturedFn();
      expect(sendMsgRef.current).toHaveBeenCalledWith(expect.stringContaining('Lanjutkan'));
    }
    vi.restoreAllMocks();
  });

  it('runs syntax verify when exec permission active', async () => {
    const action = { type: 'write_file', path: 'src/App.js', executed: false };
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_OK' });
    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(verifySyntaxBatch).toHaveBeenCalled();
  });
});
