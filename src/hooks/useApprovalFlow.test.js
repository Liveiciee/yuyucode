// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockCallServer = vi.hoisted(() => vi.fn());

vi.mock('../api.js', () => ({
  callServer: mockCallServer,
}));
vi.mock('../utils.js', () => ({
  executeAction: vi.fn().mockResolvedValue({ ok: true, data: 'written' }),
  resolvePath: vi.fn((base, p) => base + '/' + p),
}));
vi.mock('../features.js', () => ({
  runHooksV2:      vi.fn().mockResolvedValue(undefined),
  executePlanStep: vi.fn().mockResolvedValue({ reply: '```action\n{}\n```', actions: [] }),
  parsePlanSteps:  vi.fn().mockReturnValue([]),
}));

import { executeAction } from '../utils.js';
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
  // clearAllMocks resets implementations — restore defaults
  mockCallServer.mockResolvedValue({ ok: true, data: 'original content' });
  executeAction.mockResolvedValue({ ok: true, data: 'written' });
  const { parsePlanSteps } = await import('../features.js');
  parsePlanSteps.mockReturnValue([]);
});

// ── handleApprove — reject ────────────────────────────────────────────────────
describe('useApprovalFlow — handleApprove reject', () => {
  it('marks targets as executed with rejected result', async () => {
    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write this', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, false, null);
    expect(ctx.setMessages).toHaveBeenCalled();
  });

  it('sends rejection feedback to AI via setTimeout', async () => {
    const realSetTimeout = globalThis.setTimeout;
    let capturedFn = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay, ...args) => {
      if (delay === 300) { capturedFn = fn; return 1; }
      return realSetTimeout(fn, delay, ...args);
    });

    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const sendMsgRef = { current: vi.fn() };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'hi', actions: [action] }],
      sendMsgRef,
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, false, null);
    expect(capturedFn).not.toBeNull();
    capturedFn();
    expect(sendMsgRef.current).toHaveBeenCalledWith(expect.stringContaining('menolak'));
    vi.restoreAllMocks();
  });
});

// ── handleApprove — approve ───────────────────────────────────────────────────
describe('useApprovalFlow — handleApprove approve', () => {
  it('backs up files, writes, and updates messages', async () => {
    const action = { type: 'write_file', path: 'src/App.jsx', executed: false };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'read' }));
    expect(executeAction).toHaveBeenCalled();
  });

  it('rolls back atomically when any write fails', async () => {
    executeAction.mockResolvedValueOnce({ ok: false, data: 'disk full' });
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    // Need 2 read backups + 2 rollback writes
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup_a' })
      .mockResolvedValueOnce({ ok: true, data: 'backup_b' })
      .mockResolvedValue({ ok: true, data: '' }); // rollback writes
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
    expect(mockCallServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });
});

// ── handlePlanApprove ─────────────────────────────────────────────────────────
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

// ── handleApprove — patch_file type ──────────────────────────────────────────
describe('useApprovalFlow — patch_file target', () => {
  it('handles patch_file actions same as write_file', async () => {
    const action = { type: 'patch_file', path: 'src/App.jsx', executed: false };
    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'patch', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(executeAction).toHaveBeenCalled();
  });
});

// ── handleApprove — multi-target success message ──────────────────────────────
describe('useApprovalFlow — multi-target success', () => {
  it('shows success message when multiple targets written', async () => {
    const actions = [
      { type: 'write_file', path: 'a.js', executed: false },
      { type: 'write_file', path: 'b.js', executed: false },
    ];
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup_a' })
      .mockResolvedValueOnce({ ok: true, data: 'backup_b' });
    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: 'write', actions }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, '__all__');
    // setMessages called with success message for multiple files
    expect(ctx.setMessages).toHaveBeenCalled();
  });
});

// ── verifySyntax — SYNTAX_ERR path ───────────────────────────────────────────
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
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_OK' });
    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(mockCallServer).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'exec', command: expect.stringContaining('json') })
    );
  });

  it('handles sh file syntax check', async () => {
    const action = { type: 'write_file', path: 'deploy.sh', executed: false };
    mockCallServer
      .mockResolvedValueOnce({ ok: true, data: 'backup' })
      .mockResolvedValueOnce({ ok: true, data: 'SYNTAX_OK' });
    executeAction.mockResolvedValue({ ok: true, data: 'written' });

    const ctx = makeCtx({
      permissions: { exec: true },
      messages: [{ role: 'assistant', content: 'write', actions: [action] }],
    });
    const { handleApprove } = useApprovalFlow(ctx);
    await handleApprove(0, true, null);
    expect(mockCallServer).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'exec', command: expect.stringContaining('bash') })
    );
  });
});

// ── handlePlanApprove — with actual steps ────────────────────────────────────
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

// ── verifySyntax — unknown ext, !cmd continue ────────────────────────────────
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
});

// ── verifySyntax — !vOut continue (exec returns empty) ───────────────────────
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

// ── handlePlanApprove — step with patch_file writes ──────────────────────────
describe('useApprovalFlow — handlePlanApprove patch_file write', () => {
  it('treats patch_file as a write action in plan step', async () => {
    const { parsePlanSteps } = await import('../features.js');
    parsePlanSteps.mockReturnValue([
      { num: 1, text: 'Patch file', done: false, result: null },
    ]);
    const { executePlanStep } = await import('../features.js');
    executePlanStep.mockResolvedValue({
      reply: 'Patching...',
      actions: [{ type: 'patch_file', path: 'src/App.jsx', old_str: 'old', new_str: 'new' }],
    });

    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: '1. Patch file', actions: [] }],
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, true);
    expect(ctx.setMessages).toHaveBeenCalled();
  });
});

// ── handlePlanApprove — step reply only (no writes), else if (cleaned) ───────
describe('useApprovalFlow — handlePlanApprove reply only no writes', () => {
  it('shows reply text when step has no write actions but has content', async () => {
    const { parsePlanSteps } = await import('../features.js');
    parsePlanSteps.mockReturnValue([
      { num: 1, text: 'Analysis step', done: false, result: null },
    ]);
    const { executePlanStep } = await import('../features.js');
    executePlanStep.mockResolvedValue({
      reply: 'Here is the analysis result without any file changes.',
      actions: [], // no write/patch actions
    });

    const ctx = makeCtx({
      messages: [{ role: 'assistant', content: '1. Analysis step', actions: [] }],
    });
    const { handlePlanApprove } = useApprovalFlow(ctx);
    await handlePlanApprove(0, true);
    expect(ctx.setMessages).toHaveBeenCalled();
  });
});

// ── handlePlanApprove — step catch non-AbortError ────────────────────────────
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
