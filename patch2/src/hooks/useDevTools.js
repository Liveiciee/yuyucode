import { callServer, execStream } from '../api.js';
import { executeAction } from '../utils.js';

export function useDevTools({
  folder, githubRepo, githubToken, setGithubData,
  setMessages, setLoading, setStreaming, setDeployLog,
  callAI, sendMsgRef,
  sendNotification, haptic, abortRef,
  addHistory,
}) {
  async function fetchGitHub(action) {
    if (!githubRepo) return;
    const [owner, repo] = githubRepo.split('/');
    setLoading(true);
    const r = await callServer({ type: 'mcp', tool: 'github', action, params: { owner, repo, token: githubToken } });
    try { setGithubData({ action, data: JSON.parse(r.data) }); }
    catch { setGithubData({ action, data: r.data }); }
    setLoading(false);
  }

  async function runDeploy(platform) {
    setDeployLog('🚀 Deploying to ' + platform + '...\n');
    setLoading(true);
    const cmds = {
      vercel:  'vercel --prod --yes',
      netlify: 'netlify deploy --prod',
      github:  'git add -A && git commit -m "deploy: ' + new Date().toLocaleDateString('id') + '" && git push',
      railway: 'railway up',
    };
    const cmd = cmds[platform] || 'echo "Platform tidak dikenal"';
    const ctrl = new AbortController();
    if (abortRef) abortRef.current = ctrl;
    try {
      await execStream(cmd, folder, (line) => {
        setDeployLog(prev => (prev || '') + line);
      }, ctrl.signal);
    } catch (e) {
      if (e.name !== 'AbortError')
        setDeployLog(prev => (prev || '') + '\n❌ ' + e.message);
    }
    setLoading(false);
    sendNotification('YuyuCode 🚀', 'Deploy ' + platform + ' selesai!');
    haptic('heavy');
  }

  async function generateCommitMsg() {
    setLoading(true);
    const diff = await callServer({ type: 'exec', path: folder, command: 'git diff HEAD' });
    if (!diff.ok || !diff.data.trim()) {
      setMessages(m => [...m, { role: 'assistant', content: 'Tidak ada perubahan~', actions: [] }]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const reply = await callAI([
        { role: 'system', content: 'Generate satu baris commit message format "tipe: deskripsi". Hanya commit message, tanpa penjelasan.' },
        { role: 'user',   content: diff.data.slice(0, 3000) },
      ], setStreaming, ctrl.signal);
      setStreaming('');
      const msg = reply.trim().replace(/^["'`]|["'`]$/g, '');
      setMessages(m => [...m, {
        role: 'assistant',
        content: '💬 Commit message:\n```\n' + msg + '\n```\n```action\n{"type":"exec","command":"git add -A && git commit -m \\"' + msg.replace(/"/g, '\\"') + '\\" && git push"}\n```',
        actions: [],
      }]);
    } catch (e) {
      if (e.name !== 'AbortError') setMessages(m => [...m, { role: 'assistant', content: '❌ ' + e.message }]);
    }
    setLoading(false);
  }

  async function runTests() {
    setLoading(true);
    setMessages(m => [...m, { role: 'user', content: 'Jalankan test & lint' }]);
    const lint = await callServer({ type: 'exec', path: folder, command: 'npm run lint 2>&1 || echo "no lint script"' });
    const test = await callServer({ type: 'exec', path: folder, command: 'npx vitest run 2>&1 | tail -30 || echo "no test script"' });
    const combined = '=== LINT ===\n' + (lint.data || 'ok') + '\n\n=== TEST ===\n' + (test.data || 'ok');
    setMessages(m => [...m, { role: 'assistant', content: '```bash\n' + combined + '\n```', actions: [] }]);
    if (combined.toLowerCase().includes('error') || combined.includes('FAIL'))
      setTimeout(() => sendMsgRef.current?.('Ada error di test/lint:\n' + combined.slice(0, 600) + '\nDiagnosa dan fix.'), 300);
    setLoading(false);
  }

  async function browseTo(url) {
    setLoading(true);
    setMessages(m => [...m, { role: 'user', content: 'Browse: ' + url }]);
    const r = await callServer({ type: 'browse', url });
    if (!r.ok)
      setMessages(m => [...m, { role: 'assistant', content: '❌ Browse gagal: ' + r.data, actions: [] }]);
    else {
      setMessages(m => [...m, { role: 'assistant', content: '🌐 **' + url + '**\n\n```\n' + (r.data || '').slice(0, 3000) + '\n```', actions: [] }]);
      setTimeout(() => sendMsgRef.current?.('Analisis konten halaman ini.'), 300);
    }
    setLoading(false);
  }

  async function runShortcut(cmd) {
    addHistory(cmd);
    setMessages(m => [...m, { role: 'user', content: cmd }]);
    setLoading(true);
    const r      = await executeAction({ type: 'exec', command: cmd }, folder);
    const output = r.data || 'selesai';
    setMessages(m => [...m, { role: 'assistant', content: '```bash\n' + output + '\n```', actions: [] }]);
    setLoading(false);
    if ((output.toLowerCase().includes('error') || output.includes('❌')) && !cmd.includes('git'))
      setTimeout(() => sendMsgRef.current?.('Ada error di terminal:\n' + output.slice(0, 300) + '\nDiagnosa dan fix.'), 500);
  }

  return { fetchGitHub, runDeploy, generateCommitMsg, runTests, browseTo, runShortcut };
}
