// agent.js — handlers untuk /bg, /bgmerge, /bgstatus, /loop
import { callServer } from '../../../api.js';
import { runBackgroundAgent, mergeBackgroundAgent } from '../../../features.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleBg({ parts, folder, callAI, setShowBgAgents, setMessages, sendNotification, haptic }) {
  const task = parts.slice(1).join(' ').trim();
  if (!task) {
    simpleResponse(setMessages, 'Usage: /bg <task>\nContoh: /bg refactor api.js');
    return;
  }
  const id = runBackgroundAgent(task, folder, callAI, (id, agent) => {
    sendNotification('YuyuCode 🤖', 'Agent selesai! ' + (agent.result?.allWrites?.length || 0) + ' file siap. Buka /bgstatus untuk merge.');
    setShowBgAgents(true);
    haptic('heavy');
  });
  simpleResponse(setMessages, '🤖 Background agent started: ' + task + '\nID: ' + id);
}

export function handleBgMerge({ parts, folder, setLoading, setMessages, setMergeConflictData, setShowMergeConflict }) {
  const id = parts[1]?.trim();
  if (!id) {
    simpleResponse(setMessages, 'Usage: /bgmerge <agent-id>\nCek ID dari /bgstatus');
    return;
  }
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🔀 Merging agent ' + id + '...');
    const result = await mergeBackgroundAgent(id, folder);
    if (result.hasConflicts) {
      setMergeConflictData(result);
      setShowMergeConflict(true);
      simpleResponse(setMessages, '⚠ **Konflik di ' + result.conflicts.length + ' file:**\n' + result.conflicts.map(c => '• ' + c).join('\n') + '\n\nBuka panel konflik untuk pilih strategi resolusi.');
    } else {
      simpleResponse(setMessages, result.ok ? '✅ ' + result.msg : '❌ ' + result.msg);
    }
  });
}

export function handleBgStatus({ setShowBgAgents, setMessages }) {
  setShowBgAgents(true);
  simpleResponse(setMessages, '📋 Membuka panel background agents...');
}

export function handleLoop({ parts, folder, loopActive, loopIntervalRef, setLoopActive, setLoopIntervalRef, setMessages }) {
  const args = parts.slice(1).join(' ').trim();

  if (!args || args === 'stop') {
    if (loopActive) {
      clearInterval(loopIntervalRef);
      setLoopIntervalRef(null);
      setLoopActive(false);
      simpleResponse(setMessages, '⏹ Loop dihentikan.');
    } else {
      simpleResponse(setMessages, [
        '**`/loop`** — jalankan command berulang\n',
        '- `/loop 5m git status` — setiap 5 menit',
        '- `/loop 1h npm run test` — setiap 1 jam',
        '- `/loop stop` — hentikan loop aktif\n',
        'Loop otomatis berhenti setelah 3 error berturut-turut.'
      ].join('\n'));
    }
    return;
  }

  const lm = args.match(/^(\d+)(s|m|h)\s+(.+)/);
  if (!lm) {
    simpleResponse(setMessages, 'Format: `/loop <interval> <cmd>`. Contoh: `/loop 5m git status`');
    return;
  }

  const multipliers = { s: 1000, m: 60000, h: 3600000 };
  const loopMs = parseInt(lm[1]) * multipliers[lm[2]];
  const loopCmd = lm[3];
  const label = lm[1] + (lm[2] === 'h' ? ' jam' : lm[2] === 'm' ? ' menit' : ' detik');

  if (loopMs < 10000) {
    simpleResponse(setMessages, '⚠ Interval minimum 10 detik.');
    return;
  }

  if (loopActive) clearInterval(loopIntervalRef);

  let errorStreak = 0;
  const MAX_ERRORS = 3;

  setLoopActive(true);
  simpleResponse(setMessages, '🔄 Loop aktif: `' + loopCmd + '` setiap **' + label + '**\n_Auto-stop setelah ' + MAX_ERRORS + ' error berturut-turut. `/loop stop` untuk hentikan._');

  const iv = setInterval(async () => {
    const r = await callServer({ type: 'exec', path: folder, command: loopCmd });
    const time = new Date().toLocaleTimeString('id');
    const hasError = !r.ok || /error|exception|traceback|command not found/i.test(r.data || '');

    if (hasError) {
      errorStreak++;
      simpleResponse(setMessages, '🔄 Loop [' + time + '] ❌ Error ' + errorStreak + '/' + MAX_ERRORS + ':\n```\n' + (r.data || '').slice(0, 400) + '\n```');
      if (errorStreak >= MAX_ERRORS) {
        clearInterval(iv);
        setLoopIntervalRef(null);
        setLoopActive(false);
        simpleResponse(setMessages, '⏹ Loop auto-stop: ' + MAX_ERRORS + ' error berturut-turut pada `' + loopCmd + '`.');
      }
    } else {
      errorStreak = 0;
      simpleResponse(setMessages, '🔄 Loop [' + time + ']:\n```bash\n' + (r.data || '').slice(0, 500) + '\n```');
    }
  }, loopMs);

  setLoopIntervalRef(iv);
}
