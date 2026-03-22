// ── useGrowth — Yuyu yang tumbuh + Gamifikasi ─────────────────────────────────

import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { askCerebrasStream } from '../api.js';

// ── XP table ──
const XP_TABLE = {
  message_sent:   10,
  file_written:   50,
  patch_applied:  30,
  exec_success:   20,
  test_passed:   100,
  commit_made:   150,
  bug_fixed:      80,
};

const BADGES = [
  { id: 'first_blood',  label: '🩸 First Blood',    desc: 'Pesan pertama',          req: xp => xp >= 10 },
  { id: 'apprentice',   label: '🌱 Apprentice',      desc: '500 XP',                 req: xp => xp >= 500 },
  { id: 'coder',        label: '⚡ Coder',            desc: '2000 XP',                req: xp => xp >= 2000 },
  { id: 'hacker',       label: '🔥 Hacker',           desc: '5000 XP',                req: xp => xp >= 5000 },
  { id: 'streak_3',     label: '📅 Konsisten',        desc: '3 hari berturut-turut',  req: (_, s) => s >= 3 },
  { id: 'streak_7',     label: '🗓 Seminggu Penuh',   desc: '7 hari berturut-turut',  req: (_, s) => s >= 7 },
  { id: 'streak_30',    label: '👑 One Month',        desc: '30 hari berturut-turut', req: (_, s) => s >= 30 },
];

export function useGrowth() {
  const [xp, setXpRaw]               = useState(0);
  const [streak, setStreakRaw]        = useState(0);
  const [_lastActive, setLastActiveRaw] = useState('');
  const [badges, setBadgesRaw]        = useState([]);
  const [learnedStyle, setLearnedStyleRaw] = useState('');
  const [newBadge, setNewBadge]       = useState(null); // untuk toast notif

  // ── Load on mount ──
  useEffect(() => {
    (async () => {
      const [xpR, streakR, lastR, badgesR, styleR] = await Promise.all([
        Preferences.get({ key: 'yc_xp' }),
        Preferences.get({ key: 'yc_streak' }),
        Preferences.get({ key: 'yc_last_active' }),
        Preferences.get({ key: 'yc_badges' }),
        Preferences.get({ key: 'yc_learned_style' }),
      ]);
      if (xpR.value)      setXpRaw(parseInt(xpR.value) || 0);
      if (streakR.value)  setStreakRaw(parseInt(streakR.value) || 0);
      if (lastR.value)    setLastActiveRaw(lastR.value);
      if (badgesR.value)  { try { setBadgesRaw(JSON.parse(badgesR.value)); } catch (_e) {} }
      if (styleR.value)   setLearnedStyleRaw(styleR.value);

      const today = new Date().toLocaleDateString('id');
      const last  = lastR.value || '';
      if (last !== today) {
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('id');
        const newStreak = last === yesterday ? (parseInt(streakR.value) || 0) + 1 : 1;
        setStreakRaw(newStreak);
        setLastActiveRaw(today);
        Preferences.set({ key: 'yc_streak', value: String(newStreak) });
        Preferences.set({ key: 'yc_last_active', value: today });
      }
    })();
  }, []);

  function setXp(val) {
    setXpRaw(val);
    Preferences.set({ key: 'yc_xp', value: String(val) });
  }
  function setBadges(val) {
    setBadgesRaw(val);
    Preferences.set({ key: 'yc_badges', value: JSON.stringify(val) });
  }
  function setLearnedStyle(val) {
    setLearnedStyleRaw(val);
    Preferences.set({ key: 'yc_learned_style', value: val });
  }

  // ── addXP — tambah XP + cek badge baru ──
  function addXP(event) {
    const gain = XP_TABLE[event] || 0;
    if (!gain) return;
    const newXp = xp + gain;
    setXp(newXp);

    const earned = BADGES.filter(b =>
      !badges.includes(b.id) && b.req(newXp, streak)
    );
    if (earned.length) {
      const newIds = [...badges, ...earned.map(b => b.id)];
      setBadges(newIds);
      setNewBadge(earned[earned.length - 1]); // toast badge terakhir
      setTimeout(() => setNewBadge(null), 4000);
    }
  }

  // ── learnFromSession — analisis pola coding, update learnedStyle ──
  async function learnFromSession(messages, folder) {
    const hasFileActivity = messages.some(m =>
      m.content?.includes('write_file') || m.content?.includes('patch_file')
    );
    if (messages.length < 5 || !hasFileActivity) return;

    const userMsgs = messages
      .filter(m => m.role === 'user')
      .slice(-8)
      .map(m => m.content.slice(0, 200))
      .join('\n---\n');

    const codeActivity = messages
      .filter(m => m.role === 'assistant' && m.content?.includes('```'))
      .slice(-5)
      .map(m => m.content.slice(0, 300))
      .join('\n---\n');

    try {
      const ctrl = new AbortController();
      const reply = await askCerebrasStream([
        {
          role: 'system',
          content: `Analisis pola coding dari sesi ini. Extract 3-5 preferensi spesifik yang bisa dijadikan instruksi untuk AI.
Format output HANYA berupa bullet points instruksi, contoh:
• Selalu pakai single quote untuk string
• Prefer arrow function daripada function declaration
• Naming: camelCase untuk variable, PascalCase untuk komponen
Singkat, konkret, actionable. Bahasa Indonesia.`
        },
        {
          role: 'user',
          content: `Folder: ${folder}\n\nPerintah user:\n${userMsgs}\n\nKode yang dibuat:\n${codeActivity}`
        },
      ], 'llama3.1-8b', () => {}, ctrl.signal, { maxTokens: 300 });

      if (!reply.includes('•')) return;

      const oldLines = learnedStyle.split('\n').filter(l => l.startsWith('•'));
      const newLines = reply.split('\n').filter(l => l.startsWith('•'));
      const merged   = [...new Set([...oldLines, ...newLines])].slice(0, 15);
      setLearnedStyle(merged.join('\n'));
    } catch (_e) {}
  }

  // ── summary untuk display ──
  const level = xp < 500 ? 'Apprentice' : xp < 2000 ? 'Coder' : xp < 5000 ? 'Hacker' : 'Legend';
  const nextXp = xp < 500 ? 500 : xp < 2000 ? 2000 : xp < 5000 ? 5000 : null;
  const progress = nextXp ? Math.round((xp / nextXp) * 100) : 100;

  return {
    xp, streak, badges, learnedStyle, newBadge,
    level, nextXp, progress,
    addXP, learnFromSession,
    XP_TABLE,
  };
}
