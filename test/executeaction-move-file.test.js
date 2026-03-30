// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, parseActions, resolvePath, generateDiff, countTokens } from './utils.js';

vi.mock('./api.js', () => ({ callServer: vi.fn() }));
import { callServer } from './api.js';

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════

describe('executeAction — move_file', () => {
  it.skip('calls server with type:move and correct from/to', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', from: 'a.txt', to: 'b.txt' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'move',
      from: '/base/a.txt',
      to:   '/base/b.txt',
    }));
  });

  it.skip('uses action.path as from if action.from not set', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'move_file', path: 'old.txt', to: 'new.txt' }, '/base');
    const call = callServer.mock.calls[0][0];
    expect(call.from).toBe('/base/old.txt');
  });
}