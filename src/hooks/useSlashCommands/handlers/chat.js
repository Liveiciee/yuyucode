// chat.js — handlers untuk /clear, /save, /restore, /rewind, /stop, /compact, /handoff
import { Preferences } from '@capacitor/preferences';
import { callServer, askCerebrasStream } from '../../../api.js';
import { saveSession, rewindMessages } from '../../../features.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleClear({ parts, messages, setMessages }) {
  const force = parts[1] === 'force';
  if (!force && messages.length > 3) {
    simpleResponse(setMessages, '🗑 **Mau clear chat?**\n\n- `/save` dulu untuk simpan sesi ini\n- `/clear force` untuk langsung hapus tanpa simpan\n\n_Ketik salah satu atau lanjut ngobrol._');
  } else {
    setMessages([{ role: 'assistant', content: 'Chat dibersihkan. Mau ngerjain apa Papa? 🌸' }]);
    Preferences.remove({ key: 'yc_history' });
  }
}

export function handleStop({ loading, setGracefulStop, setMessages }) {
  if (loading) {
    setGracefulStop(true);
    simpleResponse(setMessages, '⏸ **Graceful stop** — Yuyu akan menyelesaikan iterasi ini lalu berhenti.');
  } else {
    simpleResponse(setMessages, '✅ Tidak ada yang berjalan sekarang.');
  }
}

export function handleSave({ parts, sessionName, messages, folder, branch, setSessionName, setMessages }) {
  const name = parts.slice(1).join(' ').trim() || sessionName || 'Session ' + new Date().toLocaleString('id');
  saveSession(name, messages, folder, branch).then(s => {
    setSessionName(name);
    simpleResponse(setMessages, '💾 Sesi disimpan: **' + s.name + '**');
  });
}

export function handleRewind({ parts, messages, setMessages }) {
  const turns = parseInt(parts[1]) || 1;
  const rewound = rewindMessages(messages, turns);
  setMessages(rewound);
  simpleResponse(setMessages, '⏪ Rewind ' + turns + ' turn. ' + rewound.length + ' pesan tersisa.');
}

export function handleRename({ parts, setSessionName, setMessages }) {
  const name = parts.slice(1).join(' ').trim();
  setSessionName(name);
  Preferences.set({ key: 'yc_session_name', value: name });
  simpleResponse(setMessages, '✏️ Sesi: **' + name + '**');
}

export function handleCompact({ parts, compactContext, setMessages }) {
  if (parts[1] === 'force') {
    compactContext();
  } else {
    simpleResponse(setMessages, '⚠️ **/compact** pakai recursive summary — accuracy bisa turun di sesi panjang.\n\n💡 Coba **/handoff** — generate session brief yang structured dan disimpan ke `.yuyu/handoff.md`, lalu di-load otomatis di sesi berikutnya.\n\nMau tetap compact? Ketik `/compact force`');
  }
}

export function handleHandoff({ folder, messages, setLoading, setMessages }) {
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '📋 Generating session handoff...');
    const recentMsgs = messages.slice(-20);
    const ctrl2 = new AbortController();
    let handoffMd = '';
    try {
      await askCerebrasStream([
        { role: 'system', content: 'You are a technical writer. Output ONLY markdown, no preamble.' },
        { role: 'user', content: `Based on this conversation, write a session handoff for the next Claude session.\nFormat EXACTLY as:\n# YuyuCode — Session Handoff\n> Last updated: ${new Date().toISOString().split('T')[0]}\n\n## Completed this session\n- (bullet list of what was done)\n\n## In progress / pending\n- (what was started but not finished)\n\n## Architectural decisions made\n- (any important decisions or patterns established)\n\n## Known issues\n- (bugs or problems discovered)\n\n## Next session priorities\n1. (ordered list)\n\n## Hot files touched recently\n- (file paths that were changed)\n\nConversation:\n${recentMsgs.map(m => m.role + ': ' + (m.content || '').slice(0, 400)).join('\n\n')}` },
      ], 'llama3.1-8b', chunk => { handoffMd = chunk; }, ctrl2.signal);

      if (folder && handoffMd) {
        const handoffPath = folder + '/.yuyu/handoff.md';
        await callServer({ type: 'mkdir', path: folder + '/.yuyu' });
        await callServer({ type: 'write', path: handoffPath, content: handoffMd });
        simpleResponse(setMessages, '✅ **Handoff saved** to `.yuyu/handoff.md`\n\nPaste this at the start of your next Claude session, or it will be auto-loaded by `gatherProjectContext`.\n\n---\n\n' + handoffMd);
      } else {
        simpleResponse(setMessages, '📋 **Session Handoff:**\n\n' + handoffMd + '\n\n> Tip: set a project folder to auto-save.');
      }
    } catch (e) {
      simpleResponse(setMessages, '❌ Handoff gagal: ' + e.message);
    }
  });
}
