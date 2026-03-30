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

describe('executeAction — tree', () => {
  it.skip('calls server with type:tree and depth', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'tree output' });
    await executeAction({ type: 'tree', path: 'src', depth: 2 }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tree', depth: 2 })
    );
  });

  it.skip('defaults depth to 3 when not specified', async () => {
    callServer.mockResolvedValue({ ok: true });
    await executeAction({ type: 'tree' }, '/base');
    expect(callServer).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 3 })
    );
  });
}