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

describe('executeAction — mkdir', () => {
  it.skip('calls server with type:mkdir', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'mkdir', path: 'new-dir' }, '/base');
    expect(callServer).toHaveBeenCalledWith({ type: 'mkdir', path: '/base/new-dir' });
  });
});
