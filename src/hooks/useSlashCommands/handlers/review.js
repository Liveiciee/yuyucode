// review.js — handlers untuk /review, /lint, /refactor
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleReview({ parts, folder, selectedFile, fileContent, setLoading, setMessages, sendMsg }) {
  const targetPath = parts.slice(1).join(' ').trim();
  
  if (targetPath === '--all' || targetPath === '-a') {
    withLoading(setLoading, async () => {
      simpleResponse(setMessages, '🔍 Menganalisis semua file yang berubah vs HEAD...');
      const diffR = await callServer({ type: 'exec', path: folder, command: 'git diff --name-only HEAD 2>/dev/null' });
      const changedFiles = (diffR.ok ? diffR.data : '')
        .trim().split('\n').filter(f => f && /\.(js|jsx|ts|tsx|css|json)$/.test(f));
      
      if (changedFiles.length === 0) {
        simpleResponse(setMessages, '✅ Tidak ada file yang berubah vs HEAD.');
        return;
      }
      
      const toReview = changedFiles.slice(0, 8);
      const reads = await Promise.all(toReview.map(f => callServer({ type: 'read', path: folder + '/' + f })));
      const fileBlocks = toReview.map((f, i) => {
        const content = reads[i]?.ok ? reads[i].data.slice(0, 2500) : '[tidak bisa dibaca]';
        const ext = f.split('.').pop();
        return '### ' + f + '\n```' + ext + '\n' + content + '\n```';
      }).join('\n\n');
      
      await sendMsg('🔍 **Code Review — ' + toReview.length + ' file changed vs HEAD**\n\nReview setiap file di bawah. Untuk setiap file cari:\n1. 🐛 Bugs potensial\n2. ⚡ Performance issues\n3. 🔒 Security issues\n4. 🧪 Missing error handling\n5. 💡 Saran improvement\n\nFormat output: per-file dengan severity (🔴 High / 🟡 Medium / 🟢 Low).\n\n' + fileBlocks);
    });
  } else if (targetPath) {
    withLoading(setLoading, async () => {
      const r = await callServer({ type: 'read', path: folder + '/' + targetPath.replace(/^\//, '') });
      if (!r.ok) {
        simpleResponse(setMessages, '❌ File tidak ditemukan: ' + targetPath);
        return;
      }
      await sendMsg('Lakukan code review menyeluruh pada file ' + targetPath + '. Cari: bugs potensial, performance issues, security issues, dan saran improvement.\n\n```\n' + r.data.slice(0, 5000) + '\n```');
    });
  } else if (selectedFile) {
    const reviewContent = fileContent ? '\n\n```\n' + fileContent.slice(0, 5000) + '\n```' : '';
    sendMsg('Lakukan code review menyeluruh pada file ' + selectedFile + '. Cari: bugs potensial, performance issues, security issues, dan saran improvement.' + reviewContent);
  } else {
    simpleResponse(setMessages, '**`/review`** — Code review\n\n- `/review` — review file yang terbuka\n- `/review src/api.js` — review file spesifik\n- `/review --all` — review semua file changed vs HEAD');
  }
}

export function handleLint({ folder, setLoading, setMessages, sendMsg }) {
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🔍 Running lint...');
    const lintR = await callServer({ type: 'exec', path: folder, command: 'npm run lint 2>&1 || true' });
    const lintOut = lintR.data || '';
    const hasLintErr = lintOut.toLowerCase().includes('error') && !lintOut.includes('0 error');
    simpleResponse(setMessages, '```bash\n' + lintOut.slice(0, 1000) + '\n```');
    if (hasLintErr) {
      setTimeout(() => sendMsg('Ada lint error. Fix semua error ini:\n```\n' + lintOut.slice(0, 600) + '\n```'), 500);
    } else {
      simpleResponse(setMessages, '✅ Lint clean!');
    }
  });
}

export function handleRefactor({ parts, folder, setLoading, setMessages, sendMsg }) {
  const oldName = parts[1]?.trim();
  const newName = parts[2]?.trim();
  if (!oldName || !newName) {
    simpleResponse(setMessages, 'Usage: /refactor <nama_lama> <nama_baru>');
    return;
  }
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🔄 Refactor: ' + oldName + ' → ' + newName + '...');
    const searchR = await callServer({ type: 'search', path: folder + '/src', content: oldName });
    const fileList = searchR.ok
      ? [...new Set((searchR.data || '').split('\n').filter(Boolean).map(l => { const m = l.match(/^(.+?):\d+:/); return m ? m[1] : null; }).filter(Boolean))]
      : [];
    if (fileList.length === 0) {
      simpleResponse(setMessages, '❌ ' + oldName + ' tidak ditemukan di src/');
      return;
    }
    await sendMsg('REFACTOR: rename ' + oldName + ' menjadi ' + newName + ' di: ' + fileList.join(', ') + '. Baca tiap file, ganti semua occurrence, lalu write_file.');
  });
}
