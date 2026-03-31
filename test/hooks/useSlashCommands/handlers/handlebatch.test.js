// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleBatch } from '../../../../src/hooks/useSlashCommands/handlers/batch.js';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../../src/api.js', () => ({ callServer: vi.fn() }));
vi.mock('../../../../src/hooks/useSlashCommands/helpers/withLoading.js', () => ({ withLoading: vi.fn() }));
vi.mock('../../../../src/hooks/useSlashCommands/helpers/simpleResponse.js', () => ({ simpleResponse: vi.fn() }));
vi.mock('../../../../src/hooks/useSlashCommands/helpers/processBatchFile.js', () => ({ processBatchFile: vi.fn() }));

import { simpleResponse } from '../../../../src/hooks/useSlashCommands/helpers/simpleResponse.js';
import { callServer } from '../../../../src/api.js';
import { withLoading } from '../../../../src/hooks/useSlashCommands/helpers/withLoading.js';
import { processBatchFile } from '../../../../src/hooks/useSlashCommands/helpers/processBatchFile.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

const makeFile = (name, isDir = false) => ({ name, isDir });
const jsFiles = [
  makeFile('app.js'),
  makeFile('utils.ts'),
  makeFile('component.jsx'),
  makeFile('page.tsx'),
];
const mixedFiles = [
  ...jsFiles,
  makeFile('styles.css'),
  makeFile('readme.md'),
  makeFile('dist', true),
  makeFile('.env'),
];
const defaultArgs = (overrides = {}) => ({
  parts: ['/batch', 'add', 'jsdoc'],
  folder: '/project',
  abortRef: { current: null },
  callAI: vi.fn(),
  setLoading: vi.fn(),
  setMessages: vi.fn(),
  ...overrides,
});

// ─── suite ────────────────────────────────────────────────────────────────────


describe('handleBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withLoading.mockImplementation(async (setLoading, fn) => {
      setLoading(true);
      try { return await fn(); }
      finally { setLoading(false); }
    });
  });

  // ── guard: no command ────────────────────────────────────────────────────────

  it('shows usage when parts has no command', () => {
    handleBatch(defaultArgs({ parts: ['/batch'] }));
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('Usage')
    );
  });

  it('shows usage when parts is empty after /batch', () => {
    handleBatch(defaultArgs({ parts: ['/batch', '   '] }));
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('Usage')
    );
  });

  it('usage message includes example', () => {
    handleBatch(defaultArgs({ parts: ['/batch'] }));
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('Contoh')
    );
  });

  it('does NOT call withLoading when no command', () => {
    handleBatch(defaultArgs({ parts: ['/batch'] }));
    expect(withLoading).not.toHaveBeenCalled();
  });
  it('does NOT call callServer when no command', () => {
    handleBatch(defaultArgs({ parts: ['/batch'] }));
    expect(callServer).not.toHaveBeenCalled();
  });

  // ── list failure ─────────────────────────────────────────────────────────────

  it('shows error when list fails', async () => {
    callServer.mockResolvedValue({ ok: false });
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('Tidak bisa list src/')
    );
  });

  it('shows ❌ emoji on list failure', async () => {
    callServer.mockResolvedValue({ ok: false });
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('❌')
    );
  });

  it('does NOT call processBatchFile when list fails', async () => {
    callServer.mockResolvedValue({ ok: false });
    await handleBatch(defaultArgs());
    expect(processBatchFile).not.toHaveBeenCalled();
  });

  it('calls list with correct path (folder + /src)', async () => {
    callServer.mockResolvedValue({ ok: false });
    await handleBatch(defaultArgs({ folder: '/myproject' }));
    expect(callServer).toHaveBeenCalledWith({ type: 'list', path: '/myproject/src' });
  });

  // ── file filtering ───────────────────────────────────────────────────────────

  it('filters only .js files', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.css')] });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(1);
    expect(processBatchFile).toHaveBeenCalledWith(
      makeFile('a.js'), expect.any(String), expect.any(String),
      expect.any(Function), expect.any(Object), expect.any(Function)
    );
  });

  it('filters .ts files', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.ts'), makeFile('b.md')] });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(1);
  });

  it('filters .jsx files', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.jsx'), makeFile('b.json')] });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(1);
  });

  it('filters .tsx files', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.tsx'), makeFile('b.env')] });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(1);
  });

  it('excludes directories', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('src', true), makeFile('app.js')] });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(1);
    expect(processBatchFile).toHaveBeenCalledWith(makeFile('app.js'), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything());
  });

  it('excludes .css, .md, .env, .json files', async () => {
    callServer.mockResolvedValue({ ok: true, data: [
      makeFile('a.css'), makeFile('b.md'), makeFile('c.env'), makeFile('d.json'),
    ]});
    await handleBatch(defaultArgs());
    expect(processBatchFile).not.toHaveBeenCalled();
  });

  it('processes all 4 JS/JSX/TS/TSX from mixed list', async () => {
    callServer.mockResolvedValue({ ok: true, data: mixedFiles });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(4);
  });

  it('handles empty file list (no src files)', async () => {
    callServer.mockResolvedValue({ ok: true, data: [] });
    await handleBatch(defaultArgs());
    expect(processBatchFile).not.toHaveBeenCalled();
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('tidak ada perubahan')
    );
  });

  it('handles null data from list gracefully', async () => {
    callServer.mockResolvedValue({ ok: true, data: null });
    await handleBatch(defaultArgs());
    expect(processBatchFile).not.toHaveBeenCalled();
  });

  // ── announcement message ─────────────────────────────────────────────────────

  it('announces batch command and file count', async () => {
    callServer.mockResolvedValue({ ok: true, data: jsFiles });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs({ parts: ['/batch', 'tambah', 'jsdoc'] }));
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('tambah jsdoc')
    );
  });

  it('announcement includes file count', async () => {
    callServer.mockResolvedValue({ ok: true, data: jsFiles });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('4 file')
    );
  });

  it('multi-word command is joined correctly', async () => {
    callServer.mockResolvedValue({ ok: true, data: [] });
    await handleBatch(defaultArgs({ parts: ['/batch', 'tambah', 'JSDoc', 'ke', 'fungsi'] }));
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('tambah JSDoc ke fungsi')
    );
  });

  // ── abortRef ─────────────────────────────────────────────────────────────────

  it('sets abortRef.current to AbortController', async () => {
    callServer.mockResolvedValue({ ok: true, data: jsFiles });
    processBatchFile.mockResolvedValue([]);
    const abortRef = { current: null };
    await handleBatch(defaultArgs({ abortRef }));
    expect(abortRef.current).toBeInstanceOf(AbortController);
  });

  it('abortRef.current is set before loop starts', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js')] });
    let capturedAbortRef;
    processBatchFile.mockImplementation((f, folder, cmd, callAI, signal) => {
      capturedAbortRef = signal;
      return Promise.resolve([]);
    });
    const abortRef = { current: null };
    await handleBatch(defaultArgs({ abortRef }));
    expect(capturedAbortRef).toBeInstanceOf(AbortSignal);
  });

  // ── processBatchFile args ────────────────────────────────────────────────────

  it('passes correct args to processBatchFile', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('app.js')] });
    processBatchFile.mockResolvedValue([]);
    const callAI = vi.fn();
    await handleBatch(defaultArgs({ folder: '/proj', parts: ['/batch', 'refactor'], callAI }));
    expect(processBatchFile).toHaveBeenCalledWith(
      makeFile('app.js'),
      '/proj',
      'refactor',
      callAI,
      expect.any(AbortSignal),
      expect.any(Function)
    );
  });

  it('passes setMessages to processBatchFile', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js')] });
    processBatchFile.mockResolvedValue([]);
    const setMessages = vi.fn();
    await handleBatch(defaultArgs({ setMessages }));
    expect(processBatchFile).toHaveBeenCalledWith(
      expect.anything(), expect.anything(), expect.anything(),
      expect.anything(), expect.anything(), setMessages
    );
  });

  // ── result: 'aborted' ────────────────────────────────────────────────────────

  it('stops loop on aborted result', async () => {
    callServer.mockResolvedValue({ ok: true, data: jsFiles });
    processBatchFile
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce('aborted')
      .mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(2);
  });

  it('stops immediately if aborted on first file', async () => {
    callServer.mockResolvedValue({ ok: true, data: jsFiles });
    processBatchFile.mockResolvedValue('aborted');
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(1);
  });

  // ── result: 'failed' ─────────────────────────────────────────────────────────

  it('counts failed files', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.ts')] });
    processBatchFile.mockResolvedValue('failed');
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('2 gagal')
    );
  });

  it('continues loop after failed file', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.ts')] });
    processBatchFile.mockResolvedValue('failed');
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(2);
  });

  it('failed files do not contribute to allWrites', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js')] });
    processBatchFile.mockResolvedValue('failed');
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('tidak ada perubahan')
    );
  });

  // ── result: 'skipped' ────────────────────────────────────────────────────────

  it('counts skipped files', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.ts')] });
    processBatchFile.mockResolvedValue('skipped');
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('2 di-skip')
    );
  });

  it('continues loop after skipped file', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.ts')] });
    processBatchFile.mockResolvedValue('skipped');
    await handleBatch(defaultArgs());
    expect(processBatchFile).toHaveBeenCalledTimes(2);
  });

  // ── result: writes array ─────────────────────────────────────────────────────

  it('shows "Batch siap" when writes exist', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('app.js')] });
    processBatchFile.mockResolvedValue([{ path: '/project/src/app.js', content: 'new' }]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('Batch siap — menunggu approval')
    );
  });

  it('shows total write count in summary', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.ts')] });
    processBatchFile
      .mockResolvedValueOnce([{ path: '/s/a.js', content: '' }, { path: '/s/a.js', content: '' }])
      .mockResolvedValueOnce([{ path: '/s/b.ts', content: '' }]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('3 perubahan')
    );
  });

  it('counts unique files by path in summary', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js')] });
    processBatchFile.mockResolvedValue([
      { path: '/src/a.js', content: 'v1' },
      { path: '/src/a.js', content: 'v2' },
    ]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('1 file')
    );
  });

  it('shows ✅ emoji per-file when file has writes', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('app.js')] });
    processBatchFile.mockResolvedValue([{ path: '/src/app.js', content: '' }]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('✅')
    );
  });

  it('shows ⏭ emoji per-file when file has no writes', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('app.js')] });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('⏭')
    );
  });

  it('per-file message includes filename', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('utils.ts')] });
    processBatchFile.mockResolvedValue([{ path: '/src/utils.ts', content: '' }]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('utils.ts')
    );
  });

  // ── summary: no changes ──────────────────────────────────────────────────────

  it('shows "tidak ada perubahan" when all files return empty writes', async () => {
    callServer.mockResolvedValue({ ok: true, data: jsFiles });
    processBatchFile.mockResolvedValue([]);
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('tidak ada perubahan diperlukan')
    );
  });

  it('mixed skipped+failed with no writes → "tidak ada perubahan"', async () => {
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.ts')] });
    processBatchFile
      .mockResolvedValueOnce('skipped')
      .mockResolvedValueOnce('failed');
    await handleBatch(defaultArgs());
    expect(simpleResponse).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining('tidak ada perubahan')
    );
  });

  it('summary includes skip and fail counts', async () => {
    callServer.mockResolvedValue({ ok: true, data: [
      makeFile('a.js'), makeFile('b.ts'), makeFile('c.tsx'),
    ]});
    processBatchFile
      .mockResolvedValueOnce([{ path: '/s/a.js', content: '' }])
      .mockResolvedValueOnce('skipped')
      .mockResolvedValueOnce('failed');
    await handleBatch(defaultArgs());
    const msg = simpleResponse.mock.calls.at(-1)[1];
    expect(msg).toContain('1 di-skip');
    expect(msg).toContain('1 gagal');
  });

  // ── withLoading ──────────────────────────────────────────────────────────────

  it('calls withLoading with setLoading', async () => {
    callServer.mockResolvedValue({ ok: false });
    const setLoading = vi.fn();
    await handleBatch(defaultArgs({ setLoading }));
    expect(withLoading).toHaveBeenCalledWith(setLoading, expect.any(Function));
  });

  it('returns a promise', () => {
    callServer.mockResolvedValue({ ok: false });
    const result = handleBatch(defaultArgs());
    expect(result).toBeInstanceOf(Promise);
  });

  it('setLoading called true then false', async () => {
    callServer.mockResolvedValue({ ok: false });
    const setLoading = vi.fn();
    await handleBatch(defaultArgs({ setLoading }));
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  // ── ctrl.signal.aborted check ────────────────────────────────────────────────

  it('stops loop if AbortController aborted externally before iteration', async () => {
    const abortRef = { current: null };
    callServer.mockResolvedValue({ ok: true, data: [makeFile('a.js'), makeFile('b.ts')] });

    processBatchFile.mockImplementationOnce(async () => {
      abortRef.current.abort(); // abort after first file
      return [];
    });
    processBatchFile.mockResolvedValue([]);

    await handleBatch(defaultArgs({ abortRef }));
    // second file skipped because signal.aborted = true
    expect(processBatchFile).toHaveBeenCalledTimes(1);
  });
});
