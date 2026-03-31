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

describe('executeAction — find_symbol', () => {
  it.skip('calls server with type:search and symbol as content', async () => {
    callServer.mockResolvedValue({ ok: true, data: 'found' });
    await executeAction({ type: 'find_symbol', symbol: 'useEffect', path: 'src' }, '/base');
    expect(callServer).toHaveBeenCalledWith(expect.objectContaining({
      type: 'search', content: 'useEffect',
    }));
  });
});
