// ── useDb — SQLite layer for chat history + memories ─────────────────────────
// @capacitor-community/sqlite v8
// Falls back to Preferences if SQLite unavailable (web/emulator)

import { useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';

// ── Schema ────────────────────────────────────────────────────────────────────
const DB_NAME    = 'yuyu.db';
const DB_VERSION = 1;

const SCHEMA = `
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS messages (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  role     TEXT    NOT NULL,
  content  TEXT    NOT NULL,
  ts       INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
  session  TEXT    DEFAULT 'default'
);

CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
  content,
  content='messages',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
  INSERT INTO messages_fts(rowid, content) VALUES (new.id, new.content);
END;

CREATE TABLE IF NOT EXISTS memories (
  id      TEXT    PRIMARY KEY,
  text    TEXT    NOT NULL,
  folder  TEXT    DEFAULT '',
  ts      INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id       TEXT    PRIMARY KEY,
  label    TEXT    NOT NULL,
  data     TEXT    NOT NULL,
  ts       INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);
`;

// ── Singleton db handle ───────────────────────────────────────────────────────
let _db   = null;
let _init = null; // Promise — prevents double-init

async function getDb() {
  if (_db) return _db;
  if (_init) return _init;

  _init = (async () => {
    try {
      const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');
      const sqlite = new SQLiteConnection(CapacitorSQLite);

      // Check native availability
      const platform = (await import('@capacitor/core')).Capacitor.getPlatform();
      if (platform === 'web') {
        // Web needs jeep-sqlite — skip for now
        console.warn('[useDb] Web platform — SQLite not available, using Preferences');
        return null;
      }

      const db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);
      await db.open();

      // Run schema
      for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
        await db.execute(stmt + ';');
      }

      _db = db;
      return db;
    } catch (e) {
      console.warn('[useDb] SQLite init failed, falling back to Preferences:', e.message);
      return null;
    }
  })();

  return _init;
}

// ── Public API ────────────────────────────────────────────────────────────────

// Messages

export async function dbSaveMessages(msgs, session = 'default') {
  const db = await getDb();
  if (!db) {
    // Fallback: Preferences
    await Preferences.set({ key: 'yc_history', value: JSON.stringify(msgs.slice(-200).map(m => ({ role: m.role, content: m.content }))) });
    return;
  }
  try {
    // Clear session and reinsert — simplest consistency strategy
    await db.execute(`DELETE FROM messages WHERE session = '${session.replace(/'/g, "''")}'`);
    for (const m of msgs.slice(-500)) {
      const role    = (m.role || 'user').replace(/'/g, "''");
      const content = (m.content || '').replace(/'/g, "''");
      const sess    = session.replace(/'/g, "''");
      await db.execute(`INSERT INTO messages (role, content, session) VALUES ('${role}', '${content}', '${sess}')`);
    }
  } catch (e) {
    console.warn('[useDb] saveMessages failed:', e.message);
  }
}

export async function dbLoadMessages(session = 'default') {
  const db = await getDb();
  if (!db) {
    const r = await Preferences.get({ key: 'yc_history' });
    try { return r.value ? JSON.parse(r.value) : []; } catch { return []; }
  }
  try {
    const sess = session.replace(/'/g, "''");
    const res  = await db.query(`SELECT role, content FROM messages WHERE session = '${sess}' ORDER BY id ASC LIMIT 500`);
    return (res.values || []);
  } catch (e) {
    console.warn('[useDb] loadMessages failed:', e.message);
    return [];
  }
}

export async function dbSearchMessages(query, session = 'default') {
  const db = await getDb();
  if (!db) return []; // Fallback handled by in-memory search
  try {
    const q    = query.replace(/'/g, "''");
    const sess = session.replace(/'/g, "''");
    const res  = await db.query(
      `SELECT m.rowid as id, m.role, m.content
       FROM messages_fts f
       JOIN messages m ON m.id = f.rowid
       WHERE messages_fts MATCH '${q}*' AND m.session = '${sess}'
       ORDER BY rank
       LIMIT 30`
    );
    return (res.values || []).map((r, i) => ({ ...r, idx: i }));
  } catch (e) {
    console.warn('[useDb] searchMessages failed:', e.message);
    return [];
  }
}

// Memories

export async function dbSaveMemories(memories) {
  const db = await getDb();
  if (!db) {
    await Preferences.set({ key: 'yc_memories', value: JSON.stringify(memories) });
    return;
  }
  try {
    await db.execute('DELETE FROM memories');
    for (const m of memories.slice(0, 100)) {
      const id     = (m.id || '').toString().replace(/'/g, "''");
      const text   = (m.text || '').replace(/'/g, "''");
      const folder = (m.folder || '').replace(/'/g, "''");
      const ts     = m.ts || Date.now();
      await db.execute(`INSERT OR REPLACE INTO memories (id, text, folder, ts) VALUES ('${id}', '${text}', '${folder}', ${ts})`);
    }
  } catch (e) {
    console.warn('[useDb] saveMemories failed:', e.message);
  }
}

export async function dbLoadMemories() {
  const db = await getDb();
  if (!db) {
    const r = await Preferences.get({ key: 'yc_memories' });
    try { return r.value ? JSON.parse(r.value) : []; } catch { return []; }
  }
  try {
    const res = await db.query('SELECT id, text, folder, ts FROM memories ORDER BY ts DESC LIMIT 100');
    return (res.values || []);
  } catch (e) {
    console.warn('[useDb] loadMemories failed:', e.message);
    return [];
  }
}

// Checkpoints

export async function dbSaveCheckpoint(cp) {
  const db = await getDb();
  if (!db) return; // handled by Preferences in useChatStore
  try {
    const id    = (cp.id || '').toString().replace(/'/g, "''");
    const label = (cp.label || '').replace(/'/g, "''");
    const data  = JSON.stringify(cp).replace(/'/g, "''");
    const ts    = cp.timestamp || Date.now();
    await db.execute(`INSERT OR REPLACE INTO checkpoints (id, label, data, ts) VALUES ('${id}', '${label}', '${data}', ${ts})`);
    // Keep last 10
    await db.execute(`DELETE FROM checkpoints WHERE id NOT IN (SELECT id FROM checkpoints ORDER BY ts DESC LIMIT 10)`);
  } catch (e) {
    console.warn('[useDb] saveCheckpoint failed:', e.message);
  }
}

export async function dbLoadCheckpoints() {
  const db = await getDb();
  if (!db) return null; // signal to use Preferences
  try {
    const res = await db.query('SELECT data FROM checkpoints ORDER BY ts DESC LIMIT 10');
    return (res.values || []).map(r => { try { return JSON.parse(r.data); } catch { return null; } }).filter(Boolean);
  } catch (e) {
    console.warn('[useDb] loadCheckpoints failed:', e.message);
    return null;
  }
}

// ── Migration from Preferences on first run ───────────────────────────────────
export async function migrateFromPreferences() {
  const db = await getDb();
  if (!db) return;

  try {
    // Check if already migrated
    const migrated = await Preferences.get({ key: 'yc_db_migrated' });
    if (migrated.value === '1') return;

    // Migrate messages
    const histR = await Preferences.get({ key: 'yc_history' });
    if (histR.value) {
      const msgs = JSON.parse(histR.value);
      await dbSaveMessages(msgs, 'default');
    }

    // Migrate memories
    const memR = await Preferences.get({ key: 'yc_memories' });
    if (memR.value) {
      const mems = JSON.parse(memR.value);
      await dbSaveMemories(mems);
    }

    await Preferences.set({ key: 'yc_db_migrated', value: '1' });
    console.warn('[useDb] Migration from Preferences complete');
  } catch (e) {
    console.warn('[useDb] Migration failed:', e.message);
  }
}

// ── Hook — init DB on mount ───────────────────────────────────────────────────
export function useDb() {
  const ready = useRef(false);

  useEffect(() => {
    if (ready.current) return;
    ready.current = true;
    getDb().then(db => {
      if (db) migrateFromPreferences();
    });
  }, []);
}
