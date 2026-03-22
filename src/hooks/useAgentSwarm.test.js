// @vitest-environment happy-dom
// ── useAgentSwarm ─────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils.js', () => ({
  parseActions: vi.fn().mockReturnValue([
    { type: 'write_file', path: 'src/App.jsx', content: 'code' },
  ]),
}));

import { useAgentSwarm } from './useAgentSwarm.js';

function makeSwarmCtx(overrides = {}) {
  return {
    callAI: vi.fn()
      .mockResolvedValueOnce('1. Build UI\n2. Build API') // architect
      .mockResolvedValueOnce('```action\n{"type":"write_file","path":"src/App.jsx","content":"fe"}\n```') // FE
      .mockResolvedValueOnce('```action\n{"type":"write_file","path":"server.js","content":"be"}\n```')  // BE
      .mockResolvedValueOnce('NO_BUGS'), // QA
    folder: '/project',
    setSwarmRunning: vi.fn(),
    setSwarmLog: vi.fn(),
    setMessages: vi.fn(),
    sendNotification: vi.fn(),
    haptic: vi.fn(),
    abortRef: { current: null },
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

describe('useAgentSwarm — runAgentSwarm', () => {
  it('runs full pipeline: architect → fe+be → qa → output', async () => {
    const ctx = makeSwarmCtx();
    const { runAgentSwarm } = useAgentSwarm(ctx);
    await runAgentSwarm('build a todo app');

    // architect + fe + be + qa = 4 AI calls
    expect(ctx.callAI).toHaveBeenCalledTimes(4);
    expect(ctx.setMessages).toHaveBeenCalled();
    expect(ctx.sendNotification).toHaveBeenCalled();
    expect(ctx.haptic).toHaveBeenCalledWith('heavy');
    expect(ctx.setSwarmRunning).toHaveBeenCalledWith(false);
  });

  it('runs fix pass when QA finds bugs', async () => {
    const ctx = makeSwarmCtx();
    ctx.callAI = vi.fn()
      .mockResolvedValueOnce('Plan...')          // architect
      .mockResolvedValueOnce('write_file fe')     // FE
      .mockResolvedValueOnce('write_file be')     // BE
      .mockResolvedValueOnce('BUG: [FE] missing key\nBUG: [BE] null ref') // QA
      .mockResolvedValueOnce('fixed fe code')    // FE fix
      .mockResolvedValueOnce('fixed be code');   // BE fix

    const { runAgentSwarm } = useAgentSwarm(ctx);
    await runAgentSwarm('buggy task');

    // 4 base calls + 2 fix calls = 6
    expect(ctx.callAI).toHaveBeenCalledTimes(6);
    expect(ctx.setSwarmRunning).toHaveBeenCalledWith(false);
  });

  it('handles abort gracefully', async () => {
    const abortRef = { current: null };
    const ctx = makeSwarmCtx({ abortRef });
    ctx.callAI = vi.fn().mockImplementation(() => {
      abortRef.current?.abort();
      return Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    });

    const { runAgentSwarm } = useAgentSwarm(ctx);
    await expect(runAgentSwarm('task')).resolves.not.toThrow();
    expect(ctx.setSwarmRunning).toHaveBeenCalledWith(false);
  });
});
