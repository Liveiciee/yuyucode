// ui.js — handlers untuk /theme, /font, /color, /split, /ptt, /watch, /simplify
import { Preferences } from '@capacitor/preferences';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleTheme({ setShowThemeBuilder, setMessages }) {
  setShowThemeBuilder(true);
  simpleResponse(setMessages, '🎨 Membuka theme builder...');
}

export function handleFont({ parts, setFontSize, setMessages }) {
  const size = parseInt(parts[1]) || 14;
  setFontSize(size);
  Preferences.set({ key: 'yc_fontsize', value: String(size) });
  simpleResponse(setMessages, '🔤 Font size diubah ke ' + size + 'px~');
}

export function handleColor({ parts, sessionColor, setSessionColor, setMessages }) {
  const color = parts[1]?.trim();
  const colors = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', yellow: '#eab308', pink: '#ec4899', orange: '#f97316', off: 'off' };
  
  if (!color || !colors[color]) {
    simpleResponse(setMessages, '🎨 Session color sekarang: ' + (sessionColor || 'off') + '\nUsage: /color red|green|blue|purple|yellow|pink|orange|off');
    return;
  }
  
  const newColor = color === 'off' ? null : colors[color];
  setSessionColor(newColor);
  Preferences.set({ key: 'yc_session_color', value: newColor || '' });
  simpleResponse(setMessages, '🎨 Session color: **' + color + '**');
}

export function handleSplit({ splitView, setSplitView, setMessages }) {
  setSplitView(s => !s);
  simpleResponse(setMessages, 'Split view ' + (splitView ? 'dimatikan' : 'diaktifkan') + '~');
}

export function handlePtt({ pushToTalk, setPushToTalk, setMessages }) {
  setPushToTalk(p => !p);
  simpleResponse(setMessages, '🎙 Push-to-talk ' + (pushToTalk ? 'dimatikan' : 'diaktifkan. Tahan 🎙 untuk rekam, lepas untuk kirim.') + '.');
}

export function handleWatch({ fileWatcherActive, fileWatcherInterval, setFileWatcherActive, setFileWatcherInterval, setFileSnapshots, setMessages }) {
  if (fileWatcherActive) {
    clearInterval(fileWatcherInterval);
    setFileWatcherActive(false);
    setFileWatcherInterval(null);
    simpleResponse(setMessages, '👁 File watcher dimatikan.');
  } else {
    setFileWatcherActive(true);
    setFileSnapshots({});
    simpleResponse(setMessages, '👁 File watcher aktif. Yuyu akan notify real-time via WebSocket kalau ada file berubah dari luar app.');
  }
}

export function handleSimplify({ selectedFile, sendMsg, setMessages }) {
  if (!selectedFile) {
    simpleResponse(setMessages, 'Buka file dulu Papa~');
    return;
  }
  sendMsg('Simplifikasi kode di ' + selectedFile + '. Hapus dead code, perpendek fungsi yang terlalu panjang, perbaiki naming. Jangan ubah fungsionalitas. Gunakan write_file untuk patch minimal.');
}
