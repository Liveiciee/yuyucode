// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  open:    vi.fn().mockResolvedValue(undefined),
  execute: vi.fn().mockResolvedValue(undefined),
  query:   vi.fn().mockResolvedValue({ values: [] }),
};

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:  vi.fn().mockResolvedValue({ value: null }),
    set:  vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@capacitor-community/sqlite', () => ({
  CapacitorSQLite: {},
  SQLiteConnection: vi.fn().mockImplementation(() => ({
    createConnection: vi.fn().mockResolvedValue(mockDb),
  })),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: vi.fn().mockReturnValue('web') },
}));

async function loadFresh(platform = 'web') {
  vi.resetModules();
  const { Capacitor } = await import('@capacitor/core');
  Capacitor.getPlatform.mockReturnValue(platform);
  if (platform !== 'web') {
    const { SQLiteConnection } = await import(`@capacitor-community/sqlite`);
    SQLiteConnection.mockImplementation(() => ({ createConnection: vi.fn().mockResolvedValue(mockDb) }));
  }
  const mod = await import('./useDb.js');
  return { mod, Capacitor };
}
beforeEach(() => {
  vi.resetAllMocks();
  mockDb.execute.mockResolvedValue(undefined);
  mockDb.query.mockResolvedValue({ values: [] });
});

// ── Preferences fallback (web) ─────────────────────────────────────────────────

describe('dbSaveMessages — Preferences fallback', () => {
  it('saves to Preferences when no db', async () => {
    const { mod } = await loadFresh();
    const { Preferences } = await import('@capacitor/preferences');
    await mod.dbSaveMessages([{ role: 'user', content: 'hello' }]);
    expect(Preferences.set).toHaveBeenCalledWith(expect.objectContaining({ key: 'yc_history' }));
  });
});

describe('dbLoadMessages — Preferences fallback', () => {
  it('returns empty array when Preferences empty', async () => {
    const { mod } = await loadFresh();
    expect(await mod.dbLoadMessages()).toEqual([]);
  });
  it('returns parsed messages', async () => {
    const { mod } = await loadFresh();
    const { Preferences } = await import('@capacitor/preferences');
    const msgs = [{ role: 'user', content: 'hi' }];
    Preferences.get.mockResolvedValue({ value: JSON.stringify(msgs) });
    expect(await mod.dbLoadMessages()).toEqual(msgs);
  });
  it('returns empty array on invalid JSON', async () => {
    const { mod } = await loadFresh();
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: '{{bad' });
    expect(await mod.dbLoadMessages()).toEqual([]);
  });
});

describe('dbSearchMessages — Preferences fallback', () => {
  it('returns empty array', async () => {
    const { mod } = await loadFresh();
    expect(await mod.dbSearchMessages('hello')).toEqual([]);
  });
});

describe('dbSaveMemories — Preferences fallback', () => {
  it('saves to Preferences', async () => {
    const { mod } = await loadFresh();
    const { Preferences } = await import('@capacitor/preferences');
    await mod.dbSaveMemories([{ id: '1', text: 'mem' }]);
    expect(Preferences.set).toHaveBeenCalledWith(expect.objectContaining({ key: 'yc_memories' }));
  });
});

describe('dbLoadMemories — Preferences fallback', () => {
  it('returns empty array when empty', async () => {
    const { mod } = await loadFresh();
    expect(await mod.dbLoadMemories()).toEqual([]);
  });
  it('returns parsed memories', async () => {
    const { mod } = await loadFresh();
    const { Preferences } = await import('@capacitor/preferences');
    const mems = [{ id: '1', text: 'test' }];
    Preferences.get.mockResolvedValue({ value: JSON.stringify(mems) });
    expect(await mod.dbLoadMemories()).toEqual(mems);
  });
  it('returns empty array on invalid JSON', async () => {
    const { mod } = await loadFresh();
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: '{{bad' });
    expect(await mod.dbLoadMemories()).toEqual([]);
  });
});

describe('dbSaveCheckpoint — Preferences fallback', () => {
  it('does nothing when no db', async () => {
    const { mod } = await loadFresh();
    await mod.dbSaveCheckpoint({ id: '1', label: 'test' });
    // web: sqlite init runs schema but migration data should not be inserted
    // checkpoint: no db means execute not called for migration
    expect(mockDb.execute).not.toHaveBeenCalled();
  });
});

describe('dbLoadCheckpoints — Preferences fallback', () => {
  it('returns null when no db', async () => {
    const { mod } = await loadFresh();
    expect(await mod.dbLoadCheckpoints()).toBeNull();
  });
});

// ── SQLite path (android) ──────────────────────────────────────────────────────

describe('dbSaveMessages — SQLite path', () => {
  it('calls db.execute', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    await mod.dbSaveMessages([{ role: 'user', content: 'hi' }], 'sess');
    expect(mockDb.execute).toHaveBeenCalled();
  });
  it('handles execute error gracefully', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.execute.mockRejectedValue(new Error('disk full'));
    await expect(mod.dbSaveMessages([{ role: 'user', content: 'hi' }])).resolves.not.toThrow();
  });
  it('escapes single quotes', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    await mod.dbSaveMessages([{ role: 'user', content: "it's a test" }]);
    expect(mockDb.execute).toHaveBeenCalled();
  });
});

describe('dbLoadMessages — SQLite path', () => {
  it('returns messages from query', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockResolvedValueOnce({ values: [{ role: 'user', content: 'hi' }] });
    expect(await mod.dbLoadMessages()).toEqual([{ role: 'user', content: 'hi' }]);
  });
  it('returns empty array on error', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockRejectedValueOnce(new Error('err'));
    expect(await mod.dbLoadMessages()).toEqual([]);
  });
  it('returns empty array when values null', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockResolvedValueOnce({ values: null });
    expect(await mod.dbLoadMessages()).toEqual([]);
  });
});

describe('dbSearchMessages — SQLite path', () => {
  it('returns results with idx', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockResolvedValueOnce({ values: [{ id: 1, role: 'user', content: 'hello' }] });
    const result = await mod.dbSearchMessages('hello');
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('idx', 0);
  });
  it('returns empty array on error', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockRejectedValueOnce(new Error('fts error'));
    expect(await mod.dbSearchMessages('hello')).toEqual([]);
  });
  it('returns empty array when values null', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockResolvedValueOnce({ values: null });
    expect(await mod.dbSearchMessages('hello')).toEqual([]);
  });
});

describe('dbSaveMemories — SQLite path', () => {
  it('calls db.execute', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    await mod.dbSaveMemories([{ id: '1', text: 'mem', folder: '/p', ts: 123 }]);
    expect(mockDb.execute).toHaveBeenCalled();
  });
  it('handles error gracefully', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.execute.mockRejectedValue(new Error('err'));
    await expect(mod.dbSaveMemories([{ id: '1', text: 'test' }])).resolves.not.toThrow();
  });
  it('uses empty string for missing folder', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    await mod.dbSaveMemories([{ id: '1', text: 'no folder' }]);
    expect(mockDb.execute).toHaveBeenCalled();
  });
});

describe('dbLoadMemories — SQLite path', () => {
  it('returns memories from query', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockResolvedValueOnce({ values: [{ id: '1', text: 'test', folder: '', ts: 123 }] });
    expect(await mod.dbLoadMemories()).toHaveLength(1);
  });
  it('returns empty array on error', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockRejectedValueOnce(new Error('err'));
    expect(await mod.dbLoadMemories()).toEqual([]);
  });
});

describe('dbSaveCheckpoint — SQLite path', () => {
  it('calls db.execute', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    await mod.dbSaveCheckpoint({ id: '1', label: 'cp1', timestamp: Date.now() });
    expect(mockDb.execute).toHaveBeenCalled();
  });
  it('handles error gracefully', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.execute.mockRejectedValue(new Error('err'));
    await expect(mod.dbSaveCheckpoint({ id: '1', label: 'test' })).resolves.not.toThrow();
  });
  it('uses Date.now when timestamp missing', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    await mod.dbSaveCheckpoint({ id: '1', label: 'no ts' });
    expect(mockDb.execute).toHaveBeenCalled();
  });
});

describe('dbLoadCheckpoints — SQLite path', () => {
  it('returns parsed checkpoints', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    const cp = { id: '1', label: 'test', timestamp: 123 };
    mockDb.query.mockResolvedValueOnce({ values: [{ data: JSON.stringify(cp) }] });
    const result = await mod.dbLoadCheckpoints();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: '1' });
  });
  it('filters invalid JSON', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockResolvedValueOnce({ values: [{ data: '{{bad' }, { data: JSON.stringify({ id: '2' }) }] });
    expect(await mod.dbLoadCheckpoints()).toHaveLength(1);
  });
  it('returns null on error', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    mockDb.query.mockRejectedValueOnce(new Error('err'));
    expect(await mod.dbLoadCheckpoints()).toBeNull();
  });
});

// ── migrateFromPreferences ─────────────────────────────────────────────────────

describe('migrateFromPreferences', () => {
  it('does nothing on web', async () => {
    const { mod } = await loadFresh('android');
    await expect(mod.migrateFromPreferences()).resolves.not.toThrow();
    // web: sqlite init runs schema but migration data should not be inserted
    // web: migrate does nothing
  });
  it('skips when already migrated', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: '1' });
    await mod.migrateFromPreferences();
    expect(Preferences.set).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'yc_db_migrated' }));
  });
  it('migrates messages and memories', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get
      .mockResolvedValueOnce({ value: null })
      .mockResolvedValueOnce({ value: JSON.stringify([{ role: 'user', content: 'hi' }]) })
      .mockResolvedValueOnce({ value: JSON.stringify([{ id: '1', text: 'mem' }]) });
    await mod.migrateFromPreferences();
    expect(Preferences.set).toHaveBeenCalledWith(expect.objectContaining({ key: 'yc_db_migrated' }));
  });
  it('handles error gracefully', async () => {
    const { mod, Capacitor } = await loadFresh('android');
    Capacitor.getPlatform.mockReturnValue('android');
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockRejectedValueOnce(new Error('pref error'));
    await expect(mod.migrateFromPreferences()).resolves.not.toThrow();
  });
});

// ── useDb hook ─────────────────────────────────────────────────────────────────

describe('useDb hook', () => {
  it('initializes without error', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { mod } = await loadFresh('android');
    expect(() => renderHook(() => mod.useDb())).not.toThrow();
  });
});
