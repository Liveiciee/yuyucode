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

describe('executeAction — file_info', () => {
  it.skip('calls server with type:info', async () => {
    callServer.mockResolvedValue({ ok: true, data: { size: 1234 } });
    await executeAction({ type: 'file_info', path: 'App.jsx' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({ type: 'info' }));
  });
}