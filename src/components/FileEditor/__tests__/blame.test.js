import { describe, it, expect, vi } from 'vitest';
import { BlameMarker, makeBlameGutter, fetchBlame } from '../blame.js';
import { callServer } from '../../../api.js';

vi.mock('../../../api.js', () => ({
  callServer: vi.fn(),
}));

describe('blame module', () => {
  it.skip('BlameMarker creates DOM element', () => {
    const marker = new BlameMarker('abc1234 user 2025-01-01');
    const el = marker.toDOM();
    expect(el.tagName).toBe('SPAN');
    expect(el.textContent).toBe('abc1234 user 2025-01-01');
  });

  it.skip('makeBlameGutter returns gutter config', () => {
    const blameMap = new Map();
    blameMap.set(1, 'abc1234 user 2025-01-01');
    const gutter = makeBlameGutter(blameMap);
    expect(gutter).toBeDefined();
    expect(gutter.class).toBe('cm-blame-gutter');
  });

  it.skip('fetchBlame returns map on success', async () => {
    const mockData = `^abc1234 (User Name   2025-01-01 10:00:00 +0000) 1`;
    callServer.mockResolvedValueOnce({ ok: true, data: mockData });
    const map = await fetchBlame('/project', 'src/file.js');
    expect(map.size).toBe(1);
    expect(map.get(1)).toMatch(/abc1234 User 2025-01-01/);
  });

  it.skip('fetchBlame returns empty map on failure', async () => {
    callServer.mockResolvedValueOnce({ ok: false });
    const map = await fetchBlame('/project', 'src/file.js');
    expect(map.size).toBe(0);
  });
});
