// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePlanSteps,
  selectSkills,
  rewindMessages,
  checkPermission,
  parseElicitation,
  tfidfRank,
  DEFAULT_PERMISSIONS,
  EFFORT_CONFIG,
} from './features.js';

// ── parsePlanSteps ────────────────────────────────────────────────────────────
describe('parsePlanSteps', () => {
  it('should parse numbered plan steps', () => {
    const reply = '1. Baca file App.jsx\n2. Tambah fitur baru\n3. Test hasilnya';
    const steps = parsePlanSteps(reply);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toEqual({ num: 1, text: 'Baca file App.jsx', done: false, result: null });
    expect(steps[2]).toEqual({ num: 3, text: 'Test hasilnya', done: false, result: null });
  });

  it('should return empty array for non-numbered text', () => {
    expect(parsePlanSteps('tidak ada plan di sini')).toEqual([]);
  });

  it('should skip non-numbered lines', () => {
    const reply = '1. Langkah pertama\nini bukan langkah\n2. Langkah kedua';
    const steps = parsePlanSteps(reply);
    expect(steps).toHaveLength(2);
    expect(steps[1].num).toBe(2);
  });

  it('should handle empty string', () => {
    expect(parsePlanSteps('')).toEqual([]);
  });
});

// ── selectSkills ─────────────────────────────────────────────────────────────
describe('selectSkills', () => {
  const skills = [
    { name: 'react.md',   content: 'React hooks useState useEffect component', active: true },
    { name: 'nodejs.md',  content: 'Node.js server express api route', active: true },
    { name: 'testing.md', content: 'vitest jest unit test coverage', active: true },
    { name: 'skill.md',   content: 'General skill', active: true },
  ];

  it('should return empty array if no skills', () => {
    expect(selectSkills([], 'some task')).toEqual([]);
  });

  it('should return first 3 if no task text', () => {
    const result = selectSkills(skills, '');
    expect(result).toHaveLength(3);
  });

  it('should always include skill named "skill"', () => {
    const result = selectSkills(skills, 'unrelated task');
    expect(result.some(s => s.name === 'skill.md')).toBe(true);
  });

  it('should match skill by name keyword in task', () => {
    const result = selectSkills(skills, 'butuh bantuan react');
    expect(result.some(s => s.name === 'react.md')).toBe(true);
  });

  it('should match skill by content keyword', () => {
    const result = selectSkills(skills, 'setup vitest untuk project');
    expect(result.some(s => s.name === 'testing.md')).toBe(true);
  });
});

// ── rewindMessages ───────────────────────────────────────────────────────────
describe('rewindMessages', () => {
  const msgs = [
    { role: 'user',      content: 'pesan 1' },
    { role: 'assistant', content: 'balas 1' },
    { role: 'user',      content: 'pesan 2' },
    { role: 'assistant', content: 'balas 2' },
    { role: 'user',      content: 'pesan 3' },
    { role: 'assistant', content: 'balas 3' },
  ];

  it('should rewind 1 turn (2 messages)', () => {
    const result = rewindMessages(msgs, 1);
    expect(result).toHaveLength(4);
    expect(result[result.length - 1].content).toBe('balas 2');
  });

  it('should rewind 2 turns (4 messages)', () => {
    const result = rewindMessages(msgs, 2);
    expect(result).toHaveLength(2);
  });

  it('should never return empty array (min 1 message)', () => {
    const result = rewindMessages(msgs, 99);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle single message', () => {
    const result = rewindMessages([{ role: 'user', content: 'hi' }], 1);
    expect(result).toHaveLength(1);
  });
});

// ── checkPermission ───────────────────────────────────────────────────────────
describe('checkPermission', () => {
  it('should return false if permissions is null/undefined', () => {
    expect(checkPermission(null, 'read_file')).toBe(false);
    expect(checkPermission(undefined, 'read_file')).toBe(false);
  });

  it('should return explicit permission value', () => {
    expect(checkPermission({ read_file: true },  'read_file')).toBe(true);
    expect(checkPermission({ read_file: false }, 'read_file')).toBe(false);
  });

  it('should fall back to DEFAULT_PERMISSIONS', () => {
    // read_file default = true
    expect(checkPermission({}, 'read_file')).toBe(DEFAULT_PERMISSIONS.read_file);
    // delete_file default = false
    expect(checkPermission({}, 'delete_file')).toBe(DEFAULT_PERMISSIONS.delete_file);
  });

  it('should return false for unknown action not in defaults', () => {
    expect(checkPermission({}, 'unknown_action')).toBe(false);
  });

  it('default permissions should match expected values', () => {
    expect(DEFAULT_PERMISSIONS.read_file).toBe(true);
    expect(DEFAULT_PERMISSIONS.write_file).toBe(true);
    expect(DEFAULT_PERMISSIONS.exec).toBe(true);
    expect(DEFAULT_PERMISSIONS.delete_file).toBe(false);
    expect(DEFAULT_PERMISSIONS.mcp).toBe(false);
    expect(DEFAULT_PERMISSIONS.browse).toBe(false);
  });
});

// ── parseElicitation ─────────────────────────────────────────────────────────
describe('parseElicitation', () => {
  it('should return null if no ELICIT: marker', () => {
    expect(parseElicitation('response biasa tanpa elicitation')).toBeNull();
  });

  it('should parse valid elicitation JSON', () => {
    const reply = 'Sebelum lanjut, ELICIT:{"question":"Mau pakai framework apa?","options":["React","Vue"]}';
    const result = parseElicitation(reply);
    expect(result).not.toBeNull();
    expect(result.question).toBe('Mau pakai framework apa?');
    expect(result.options).toEqual(['React', 'Vue']);
  });

  it('should return null for malformed JSON after ELICIT:', () => {
    expect(parseElicitation('ELICIT: ini bukan json')).toBeNull();
  });

  it('should handle nested JSON correctly', () => {
    const reply = 'ELICIT:{"question":"pilih","data":{"a":1,"b":2}}';
    const result = parseElicitation(reply);
    expect(result.data).toEqual({ a: 1, b: 2 });
  });
});

// ── tfidfRank ─────────────────────────────────────────────────────────────────
describe('tfidfRank', () => {
  const memories = [
    { id: Date.now(), text: 'react hooks useState useEffect' },
    { id: Date.now(), text: 'node server express api' },
    { id: Date.now(), text: 'git commit push pull merge' },
    { id: Date.now(), text: 'css flexbox grid layout' },
    { id: Date.now(), text: 'react component props state' },
  ];

  it('should return empty array for empty memories', () => {
    expect(tfidfRank([], 'react')).toEqual([]);
  });

  it('should return slice if no query', () => {
    const result = tfidfRank(memories, '', 3);
    expect(result).toHaveLength(3);
  });

  it('should rank react-related memories higher for react query', () => {
    const result = tfidfRank(memories, 'react hooks', 3);
    const texts = result.map(m => m.text);
    expect(texts.some(t => t.includes('react'))).toBe(true);
  });

  it('should respect topN limit', () => {
    expect(tfidfRank(memories, 'react', 2)).toHaveLength(2);
    expect(tfidfRank(memories, 'react', 10)).toHaveLength(memories.length);
  });

  it('should return memories with _score field', () => {
    const result = tfidfRank(memories, 'react');
    expect(result[0]).toHaveProperty('_score');
  });
});

// ── EFFORT_CONFIG ─────────────────────────────────────────────────────────────
describe('EFFORT_CONFIG', () => {
  it('should have low, medium, high levels', () => {
    expect(EFFORT_CONFIG.low).toBeDefined();
    expect(EFFORT_CONFIG.medium).toBeDefined();
    expect(EFFORT_CONFIG.high).toBeDefined();
  });

  it('should have increasing maxIter and maxTokens', () => {
    expect(EFFORT_CONFIG.low.maxIter).toBeLessThan(EFFORT_CONFIG.medium.maxIter);
    expect(EFFORT_CONFIG.medium.maxIter).toBeLessThan(EFFORT_CONFIG.high.maxIter);
    expect(EFFORT_CONFIG.low.maxTokens).toBeLessThan(EFFORT_CONFIG.high.maxTokens);
  });
});
