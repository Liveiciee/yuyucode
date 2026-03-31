// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, parseActions, resolvePath, generateDiff, countTokens } from '../src/utils.js';

vi.mock('../src/api.js', () => ({ callServer: vi.fn() }));
import { callServer } from '../src/api.js';

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════

describe('executeAction — append_file', () => {
  it.skip('calls server with type:append', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'append_file', path: 'log.txt', content: 'line' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'append', path: '/base/log.txt', content: 'line',
    });
  });
});
