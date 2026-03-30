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

describe('executeAction — delete_file', () => {
  it.skip('calls server with type:delete', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'delete_file', path: 'old.txt' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'delete', path: '/base/old.txt',
    });
  });
});
