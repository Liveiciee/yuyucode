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

describe('executeAction — mcp', () => {
  it.skip('calls server with type:mcp and correct fields', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'mcp result' });
    await executeAction({
      type: 'mcp', tool: 'git', action: 'status', params: { verbose: true }
    }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'mcp', tool: 'git', action: 'status', params: { verbose: true },
    });
  });

  it.skip('defaults params to empty object', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'mcp', tool: 'git', action: 'log' }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ params: {} })
    );
  });
}