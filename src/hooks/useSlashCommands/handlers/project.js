// project.js — handlers untuk /init, /scaffold, /rules
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleInit({ parts, folder, setLoading, setMessages, sendMsg }) {
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🌱 Menganalisis project untuk generate SKILL.md...');
    
    const [pkgR, structR, gitR, existR] = await Promise.all([
      callServer({ type: 'read', path: folder + '/package.json' }),
      callServer({ type: 'list', path: folder + '/src' }),
      callServer({ type: 'exec', path: folder, command: 'git log --oneline -5 2>/dev/null || echo "no git"' }),
      callServer({ type: 'read', path: folder + '/SKILL.md' }),
    ]);
    
    if (existR.ok && existR.data && parts[1] !== 'overwrite') {
      simpleResponse(setMessages, '⚠️ SKILL.md sudah ada. Ketik `/init overwrite` untuk timpa.');
      return;
    }
    
    const pkgInfo = pkgR.ok ? pkgR.data.slice(0, 800) : 'tidak ada package.json';
    const srcFiles = structR.ok && Array.isArray(structR.data) ? structR.data.filter(f => !f.isDir).map(f => f.name).join(', ') : 'tidak diketahui';
    const gitLog = gitR.ok ? gitR.data.trim() : '';
    
    await sendMsg(`Generate SKILL.md untuk project ini. Analisis:\n\npackage.json:\n\`\`\`\n${pkgInfo}\n\`\`\`\nFile di src/: ${srcFiles}\nGit log: ${gitLog}\n\nBuat SKILL.md yang berisi:\n1. Tentang project (1-2 baris)\n2. Stack & dependencies utama\n3. Struktur file penting\n4. Aturan coding project ini (naming convention, dll)\n5. Command penting (dev, build, test)\n\nTulis ke SKILL.md menggunakan write_file. Format singkat, padat, max 50 baris.`);
  });
}

export function handleScaffold({ parts, folder, setLoading, setMessages, sendMsg }) {
  const tpl = parts[1]?.toLowerCase();
  const validTemplates = ['react', 'node', 'express'];
  
  if (!tpl || !validTemplates.includes(tpl)) {
    simpleResponse(setMessages, '🏗 Usage: /scaffold react|node|express\n\n**react** — Vite + React 19\n**node** — Node.js CLI app\n**express** — Express REST API');
    return;
  }
  
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🏗 Scaffolding **' + tpl + '** project di ' + folder + '...');
    await sendMsg('Scaffold project ' + tpl + ' di folder ' + folder + '. Buat struktur file lengkap dengan write_file: package.json, file utama, README.md singkat. Pakai dependencies terbaru 2025. Langsung buat tanpa tanya.');
  });
}

export function handleRules({ parts, folder, setLoading, setMessages, sendMsg }) {
  const subCmd = parts[1];
  
  if (!subCmd || subCmd === 'show') {
    withLoading(setLoading, async () => {
      const r = await callServer({ type: 'read', path: folder + '/YUYU.md' });
      if (r.ok && r.data) {
        simpleResponse(setMessages, '📋 **YUYU.md** — Project rules aktif:\n\n```markdown\n' + r.data + '\n```\n\n*Edit: `/rules add "..."` atau `/rules edit`*');
      } else {
        simpleResponse(setMessages, '📋 **YUYU.md belum ada.**\n\nBuat dengan `/rules add "rule pertama kamu"` atau `/rules init` untuk template lengkap.');
      }
    });
  } else if (subCmd === 'add') {
    const ruleText = parts.slice(2).join(' ').replace(/^["']|["']$/g, '');
    if (!ruleText) {
      simpleResponse(setMessages, 'Usage: `/rules add "selalu pakai TypeScript strict mode"`');
      return;
    }
    withLoading(setLoading, async () => {
      const existing = await callServer({ type: 'read', path: folder + '/YUYU.md' });
      const currentContent = (existing.ok && existing.data) ? existing.data : '# YUYU.md — Project Rules\n\n## Rules\n';
      const newContent = currentContent.includes('## Rules')
        ? currentContent.replace(/## Rules\n/, '## Rules\n- ' + ruleText + '\n')
        : currentContent.trimEnd() + '\n\n## Rules\n- ' + ruleText + '\n';
      const wr = await callServer({ type: 'write', path: folder + '/YUYU.md', content: newContent });
      if (wr.ok) {
        simpleResponse(setMessages, '✅ Rule ditambahkan ke YUYU.md:\n> `' + ruleText + '`\n\nAktif di sesi berikutnya dan setiap agent loop.');
      } else {
        simpleResponse(setMessages, '❌ Gagal tulis YUYU.md: ' + (wr.data || '?'));
      }
    });
  } else if (subCmd === 'clear') {
    withLoading(setLoading, async () => {
      const wr = await callServer({ type: 'write', path: folder + '/YUYU.md', content: '# YUYU.md — Project Rules\n\n## Rules\n' });
      simpleResponse(setMessages, wr.ok ? '🗑 YUYU.md di-reset. Rules lama dihapus.' : '❌ Gagal reset: ' + (wr.data || '?'));
    });
  } else if (subCmd === 'init') {
    withLoading(setLoading, async () => {
      const existR = await callServer({ type: 'read', path: folder + '/YUYU.md' });
      if (existR.ok && existR.data && parts[2] !== 'overwrite') {
        simpleResponse(setMessages, '⚠️ YUYU.md sudah ada. Ketik `/rules init overwrite` untuk timpa.');
        return;
      }
      await sendMsg('Buat YUYU.md di root project ini. Analisis codebase sebentar (tree + package.json), lalu tulis YUYU.md berisi:\n\n## Coding Standards\n(naming convention, strict TS, dll)\n\n## Architecture Decisions\n(state management, file structure, dll)\n\n## Forbidden Patterns\n(anti-patterns yang harus dihindari)\n\n## Preferred Libraries\n(library yang sudah dipilih untuk tiap kategori)\n\n## Commands\n(dev, build, test, deploy)\n\nSingkat, padat, max 60 baris. Tulis dengan write_file ke YUYU.md.');
    });
  } else if (subCmd === 'edit') {
    sendMsg('Baca YUYU.md lalu bantu aku edit. Tampilkan isinya dulu.');
  } else {
    simpleResponse(setMessages, '**`/rules`** — Manage project rules (YUYU.md)\n\n- `/rules` — lihat rules aktif\n- `/rules add "..."` — tambah rule\n- `/rules clear` — hapus semua\n- `/rules init` — generate dari project\n- `/rules edit` — edit via AI');
  }
}
