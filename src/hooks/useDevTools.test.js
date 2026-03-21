// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('../api.js', () => ({
  callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }),
  execStream: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../utils.js', () => ({
  executeAction: vi.fn().mockResolvedValue({ ok: true, data: 'exec output' }),
}));

import { callServer, execStream } from '../api.js';
import { useDevTools } from './useDevTools.js';

function makeCtx(overrides = {}) {
  return {
    folder: '/project',
    githubRepo: 'user/repo',
    githubToken: 'ghp_test',
    setGithubData: vi.fn(),
    setMessages: vi.fn(),
    setLoading: vi.fn(),
    setStreaming: vi.fn(),
    setDeployLog: vi.fn(),
    callAI: vi.fn().mockResolvedValue('feat: add feature'),
    sendMsgRef: { current: vi.fn() },
    sendNotification: vi.fn(),
    haptic: vi.fn(),
    abortRef: { current: null },
    addHistory: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

// ── fetchGitHub ───────────────────────────────────────────────────────────────
describe('useDevTools — fetchGitHub', () => {
  it('calls callServer with github mcp and sets github data', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: JSON.stringify({ issues: [] }) });
    const ctx = makeCtx();
    const { fetchGitHub } = useDevTools(ctx);
    await fetchGitHub('issues');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mcp', tool: 'github', action: 'issues' })
    );
    expect(ctx.setGithubData).toHaveBeenCalled();
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });

  it('does nothing when githubRepo is empty', async () => {
    const ctx = makeCtx({ githubRepo: '' });
    const { fetchGitHub } = useDevTools(ctx);
    await fetchGitHub('issues');
    expect(callServer).not.toHaveBeenCalled();
  });

  it('handles non-JSON response gracefully', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'not json' });
    const ctx = makeCtx();
    const { fetchGitHub } = useDevTools(ctx);
    await expect(fetchGitHub('issues')).resolves.not.toThrow();
    expect(ctx.setGithubData).toHaveBeenCalledWith({ action: 'issues', data: 'not json' });
  });
});

// ── generateCommitMsg ─────────────────────────────────────────────────────────
describe('useDevTools — generateCommitMsg', () => {
  it('generates commit message from git diff', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: 'diff --git a/src...' });
    const ctx = makeCtx();
    ctx.callAI.mockResolvedValueOnce('feat: add new button');
    const { generateCommitMsg } = useDevTools(ctx);
    await generateCommitMsg();
    expect(ctx.callAI).toHaveBeenCalled();
    expect(ctx.setMessages).toHaveBeenCalled();
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });

  it('skips when no diff output', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '   ' });
    const ctx = makeCtx();
    const { generateCommitMsg } = useDevTools(ctx);
    await generateCommitMsg();
    expect(ctx.callAI).not.toHaveBeenCalled();
    expect(ctx.setMessages).toHaveBeenCalledWith(expect.any(Function));
  });
});

// ── runTests ─────────────────────────────────────────────────────────────────
describe('useDevTools — runTests', () => {
  it('runs lint and test commands, shows output', async () => {
    callServer
      .mockResolvedValueOnce({ ok: true, data: '0 warnings' })
      .mockResolvedValueOnce({ ok: true, data: '✓ 42 tests passed' });
    const ctx = makeCtx();
    const { runTests } = useDevTools(ctx);
    await runTests();
    expect(callServer).toHaveBeenCalledTimes(2);
    expect(ctx.setMessages).toHaveBeenCalled();
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });

  it('triggers auto-fix when tests fail', async () => {
    const realSetTimeout = globalThis.setTimeout;
    let capturedFn = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay, ...args) => {
      if (delay === 300) { capturedFn = fn; return 1; }
      return realSetTimeout(fn, delay, ...args);
    });

    callServer
      .mockResolvedValueOnce({ ok: true, data: '0 warnings' })
      .mockResolvedValueOnce({ ok: true, data: 'FAIL: 3 tests failed' });
    const ctx = makeCtx();
    const { runTests } = useDevTools(ctx);
    await runTests();

    expect(capturedFn).not.toBeNull();
    capturedFn();
    expect(ctx.sendMsgRef.current).toHaveBeenCalledWith(expect.stringContaining('error'));

    vi.restoreAllMocks();
  });
});

// ── browseTo ──────────────────────────────────────────────────────────────────
describe('useDevTools — browseTo', () => {
  it('fetches and shows page content', async () => {
    callServer.mockResolvedValueOnce({ ok: true, data: '<html>page content</html>' });
    const ctx = makeCtx();
    const { browseTo } = useDevTools(ctx);
    await browseTo('https://example.com');
    expect(callServer).toHaveBeenCalledWith({ type: 'browse', url: 'https://example.com' });
    expect(ctx.setMessages).toHaveBeenCalled();
  });

  it('shows error message on failure', async () => {
    callServer.mockResolvedValueOnce({ ok: false, data: 'Connection refused' });
    const ctx = makeCtx();
    const { browseTo } = useDevTools(ctx);
    await browseTo('https://fail.com');
    expect(ctx.setMessages).toHaveBeenCalledWith(expect.any(Function));
  });
});

// ── runShortcut ───────────────────────────────────────────────────────────────
describe('useDevTools — runShortcut', () => {
  it('executes command and shows output', async () => {
    const { executeAction } = await import('../utils.js');
    executeAction.mockResolvedValueOnce({ ok: true, data: 'command output' });
    const ctx = makeCtx();
    const { runShortcut } = useDevTools(ctx);
    await runShortcut('git status');
    expect(ctx.addHistory).toHaveBeenCalledWith('git status');
    expect(ctx.setMessages).toHaveBeenCalled();
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });

  it('auto-fixes error output (non-git commands)', async () => {
    const realSetTimeout = globalThis.setTimeout;
    let capturedFn = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay, ...args) => {
      if (delay === 500) { capturedFn = fn; return 1; }
      return realSetTimeout(fn, delay, ...args);
    });

    const { executeAction } = await import('../utils.js');
    executeAction.mockResolvedValueOnce({ ok: true, data: 'Error: module not found' });
    const ctx = makeCtx();
    const { runShortcut } = useDevTools(ctx);
    await runShortcut('node index.js');

    expect(capturedFn).not.toBeNull();
    capturedFn();
    expect(ctx.sendMsgRef.current).toHaveBeenCalledWith(expect.stringContaining('error'));

    vi.restoreAllMocks();
  });
});

// ── runDeploy ─────────────────────────────────────────────────────────────────
describe('useDevTools — runDeploy', () => {
  it('streams deploy output and notifies on completion', async () => {
    execStream.mockResolvedValueOnce(undefined);
    const ctx = makeCtx();
    const { runDeploy } = useDevTools(ctx);
    await runDeploy('vercel');
    expect(execStream).toHaveBeenCalledWith(
      expect.stringContaining('vercel'),
      '/project',
      expect.any(Function),
      expect.any(AbortSignal),
    );
    expect(ctx.sendNotification).toHaveBeenCalled();
    expect(ctx.haptic).toHaveBeenCalledWith('heavy');
    expect(ctx.setLoading).toHaveBeenCalledWith(false);
  });
});
