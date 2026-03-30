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

describe('executeAction — search', () => {
  it.skip('calls server with type:search and query as content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'results' });
    await executeAction({ type: 'search', path: 'src', query: 'useState' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'search',
      content: 'useState',
    }));
  });
}