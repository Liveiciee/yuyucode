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

describe('executeAction — web_search', () => {
  it.skip('calls server with type:web_search and query', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'search results' });
    await executeAction({ type: 'web_search', query: 'vitest mock fetch' }, '/base');
    expect(callServer).toHaveBeenCalledWith({
      type: 'web_search', query: 'vitest mock fetch',
    });
  });
});
