// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TokenTracker, tokenTracker,
  runHooksV2,
  selectSkills,
  rewindMessages,
  tfidfRank,
  parsePlanSteps,
  mergeBackgroundAgent,
  abortBgAgent,
  getBgAgents,
  checkPermission,
  DEFAULT_PERMISSIONS,
  EFFORT_CONFIG,
  parseElicitation,
} from './features.js';

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock('./api.js', () => ({ callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }) }));
vi.mock('./utils.js', () => ({
  parseActions:  vi.fn().mockReturnValue([]),
  executeAction: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { callServer } from './api.js';
import { Preferences } from '@capacitor/preferences'; // used via vi.mock above — CodeQL false positive

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TokenTracker
// ═══════════════════════════════════════════════════════════════════════════════

describe('runHooksV2', () => {
  beforeEach(() => {
    callServer.mockResolvedValue({ ok: true, data: '' });
  });

  it('does nothing if hookList is empty', async () => {
    await runHooksV2([], 'ctx', '/folder');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('does nothing if hookList is null/undefined', async () => {
    await runHooksV2(null, 'ctx', '/folder');
    await runHooksV2(undefined, 'ctx', '/folder');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('executes string hook as shell command', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2(['echo hello'], 'myctx', '/project');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'exec',
      command: expect.stringContaining('echo hello'),
    }));
  });

  it('substitutes {{context}} in string hook', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2(['log {{context}}'], 'my-context', '/proj');
    const cmd = callServer.mock.calls[0][0].command;
    expect(cmd).toContain('my-context');
    expect(cmd).not.toContain('{{context}}');
  });

  it('executes shell-type hook object', async () => {
    callServer.mockResolvedValueOnce({ ok: true });
    await runHooksV2([{ type: 'shell', command: 'npm run lint' }], '', '/proj');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'exec' }));
  });

  it('runs multiple hooks in sequence', async () => {
    callServer.mockResolvedValue({ ok: true });
    await runHooksV2(['hook1', 'hook2', 'hook3'], '', '/proj');
    expect(callServer).toHaveBeenCalledTimes(3);
  });

  it('continues if one hook throws', async () => {
    callServer
      .mockRejectedValueOnce(new Error('hook1 failed'))
      .mockResolvedValueOnce({ ok: true });
    await expect(
      runHooksV2(['bad-hook', 'good-hook'], '', '/proj')
    ).resolves.not.toThrow();
    expect(callServer).toHaveBeenCalledTimes(2);
  });
}