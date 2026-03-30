// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from './utils.js';

// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly

// ── Integration: parseActions → executeAction ─────────────────────────────────

describe('parseActions — edge cases', () => {
  it('ignores malformed JSON inside action block', () => {
    expect(parseActions('```action\n{broken json}\n```')).toEqual([]);
  });

  it('parses multiple valid blocks ignoring invalid ones', () => {
    const text = [
      '```action\n{"type":"read_file","path":"a.js"}\n```',
      '```action\n{bad}\n```',
      '```action\n{"type":"exec","command":"ls"}\n```',
    ].join('\n');
    const result = parseActions(text);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('read_file');
    expect(result[1].type).toBe('exec');
  });

  it('returns empty array for text with no action blocks', () => {
    expect(parseActions('just regular text')).toEqual([]);
    expect(parseActions('')).toEqual([]);
  });

  it('handles action blocks with extra whitespace', () => {
    expect(parseActions('```action\n  {"type":"read_file","path":"x.js"}  \n```')).toHaveLength(1);
  });
});
