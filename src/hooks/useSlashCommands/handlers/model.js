// model.js — handlers untuk /model, /effort, /thinking
import { Preferences } from '@capacitor/preferences';
import { MODELS } from '../../../constants.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleModel({ model, setModel, setMessages }) {
  const idx = MODELS.findIndex(m => m.id === model);
  const next = MODELS[(idx + 1) % MODELS.length];
  setModel(next.id);
  Preferences.set({ key: 'yc_model', value: next.id });
  simpleResponse(setMessages, '🔄 Model: **' + next.label + '** (' + ((idx + 1) % MODELS.length + 1) + '/' + MODELS.length + ')');
}

export function handleEffort({ parts, effort, setEffort, setMessages }) {
  const lvl = parts[1]?.toLowerCase();
  if (!['low', 'medium', 'high'].includes(lvl)) {
    simpleResponse(setMessages, '⚡ Effort sekarang: **' + effort + '**\nUsage: /effort low|medium|high');
    return;
  }
  setEffort(lvl);
  Preferences.set({ key: 'yc_effort', value: lvl });
  simpleResponse(setMessages, '⚡ Effort: **' + lvl + '**');
}

export function handleThinking({ thinkingEnabled, setThinkingEnabled, setMessages }) {
  const next = !thinkingEnabled;
  setThinkingEnabled(next);
  Preferences.set({ key: 'yc_thinking', value: next ? '1' : '0' });
  simpleResponse(setMessages, '🧠 Think-aloud mode ' + (next ? 'aktif — Yuyu akan tulis reasoning singkat dalam <think> sebelum jawab.' : 'nonaktif.'));
}
