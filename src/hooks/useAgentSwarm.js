import { parseActions } from '../utils.js';

export function useAgentSwarm({
  callAI, folder,
  setSwarmRunning, setSwarmLog, setMessages,
  sendNotification, haptic, abortRef,
}) {
  async function runAgentSwarm(task) {
    setSwarmRunning(true);
    setSwarmLog([]);
    const log = msg => setSwarmLog(prev => [...prev, msg]);
    const ctrl = new AbortController();
    if (abortRef) abortRef.current = ctrl;

    try {
      log('🏗 Architect planning...');
      const archReply = await callAI([
        { role: 'system', content: 'Software Architect. Buat rencana implementasi singkat dan konkret. Max 5 poin.' },
        { role: 'user',   content: 'Task: ' + task + '\nFolder: ' + folder },
      ], () => {}, ctrl.signal);

      log('⚛ Frontend + ⚙ Backend Agent (parallel)...');
      const [feReply, beReply] = await Promise.all([
        callAI([
          { role: 'system', content: 'Frontend Engineer. Implementasikan UI/React. Gunakan write_file action dengan path lengkap dimulai dari ' + folder + '.' },
          { role: 'user',   content: 'Plan:\n' + (archReply || '') + '\n\nTask: ' + task },
        ], () => {}, ctrl.signal),
        callAI([
          { role: 'system', content: 'Backend Engineer. Implementasikan server/API/logic. Gunakan write_file action dengan path lengkap dimulai dari ' + folder + '.' },
          { role: 'user',   content: 'Plan:\n' + archReply + '\n\nTask: ' + task },
        ], () => {}, ctrl.signal),
      ]);

      log('🧪 QA Review...');
      const qaReply = await callAI([
        { role: 'system', content: 'QA Engineer. Review kode dari FE dan BE. List bug kritis dengan format "BUG: [FE|BE] <deskripsi>" satu per baris. Kalau tidak ada bug, tulis "NO_BUGS".' },
        { role: 'user',   content: 'FE:\n' + feReply + '\n\nBE:\n' + beReply },
      ], () => {}, ctrl.signal);

      let fixedFeReply = feReply, fixedBeReply = beReply;
      const qaBugs = (qaReply || '').split('\n').filter(l => l.startsWith('BUG:'));
      if (qaBugs.length > 0 && !ctrl.signal.aborted) {
        log('🔧 QA found ' + qaBugs.length + ' bug(s), running fix pass...');
        const feBugs = qaBugs.filter(l => l.includes('[FE]')).join('\n');
        const beBugs = qaBugs.filter(l => l.includes('[BE]')).join('\n');
        if (feBugs) {
          fixedFeReply = await callAI([
            { role: 'system', content: 'Frontend Engineer. Fix bugs berikut. Gunakan write_file. Path dimulai dari ' + folder + '.' },
            { role: 'user',   content: 'Kode FE:\n' + feReply.slice(0, 2000) + '\n\nBugs:\n' + feBugs },
          ], () => {}, ctrl.signal);
        }
        if (beBugs) {
          fixedBeReply = await callAI([
            { role: 'system', content: 'Backend Engineer. Fix bugs berikut. Gunakan write_file. Path dimulai dari ' + folder + '.' },
            { role: 'user',   content: 'Kode BE:\n' + beReply.slice(0, 2000) + '\n\nBugs:\n' + beBugs },
          ], () => {}, ctrl.signal);
        }
      }

      const feWrites = parseActions(fixedFeReply || '').filter(a => a.type === 'write_file' || a.type === 'patch_file');
      const beWrites = parseActions(fixedBeReply || '').filter(a => a.type === 'write_file' || a.type === 'patch_file');
      const bePaths  = new Set(beWrites.map(a => a.path));
      const dedupedWrites = [...feWrites.filter(a => !bePaths.has(a.path)), ...beWrites]  || [];

      log('👀 ' + dedupedWrites.length + ' file siap — menunggu approval...');
      setMessages(m => [...m, {
        role: 'assistant',
        content:
          `🐝 **Swarm selesai!** (${dedupedWrites.length} file)` +
          (qaBugs.length > 0 ? ' — QA fixed ' + qaBugs.length + ' bug(s)' : ' — QA clean ✅') +
          `\n\n**Plan:**\n${(archReply || "").slice(0, 400)}\n\n**QA Notes:**\n${(qaReply || "").slice(0, 300)}\n\nTinjau dan approve file di bawah~`,
        actions: dedupedWrites.map(a => ({ ...a, executed: false })),
      }]);
      sendNotification('YuyuCode 🐝', 'Swarm siap! ' + dedupedWrites.length + ' file menunggu approval.');
      haptic('heavy');
    } catch (e) {
      if (e.name !== 'AbortError') log('❌ ' + e.message);
    }
    setSwarmRunning(false);
  }

  return { runAgentSwarm };
}
