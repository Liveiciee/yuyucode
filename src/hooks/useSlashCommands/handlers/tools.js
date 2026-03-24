// tools.js — handlers untuk /mcp, /db, /websearch, /browse, /open
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

let activeDbRef = {};

export function handleMcp({ parts, setShowMCP, setLoading, setMessages }) {
  const sub = parts[1]?.toLowerCase();

  if (!sub || sub === 'open') {
    setShowMCP(true);
    return;
  }

  if (sub === 'list') {
    withLoading(setLoading, async () => {
      const r = await callServer({ type: 'mcp_list' });
      if (!r.ok) {
        simpleResponse(setMessages, '❌ ' + r.data);
        return;
      }
      const tools = r.data;
      const lines = Object.entries(tools).map(([name, info]) =>
        '**' + name + '** — ' + (info.desc || '') + '\n  Actions: `' + (info.actions || []).join('`, `') + '`'
      ).join('\n\n');
      simpleResponse(setMessages, '🔧 **MCP Tools:**\n\n' + lines);
    });
    return;
  }

  if (sub === 'connect') {
    const name = parts[2];
    const url = parts[3];
    const desc = parts.slice(4).join(' ') || '';
    if (!name || !url) {
      simpleResponse(setMessages, 'Usage: `/mcp connect <name> <url> [description]`\nContoh: `/mcp connect myapi http://localhost:3001 My custom API`');
      return;
    }
    withLoading(setLoading, async () => {
      const readR = await callServer({ type: 'read', path: '~/.yuyu/mcp-servers.json' });
      let servers = [];
      if (readR.ok) { try { servers = JSON.parse(readR.data); } catch(_e){} }
      servers = servers.filter(s => s.name !== name);
      servers.push({ name, url, description: desc, actions: [] });
      const writeR = await callServer({ type: 'write', path: '~/.yuyu/mcp-servers.json', content: JSON.stringify(servers, null, 2) });
      if (writeR.ok) {
        simpleResponse(setMessages, '✅ MCP server **' + name + '** tersambung → `' + url + '`\nGunakan `/mcp list` untuk lihat semua, atau `/mcp connect` lagi untuk update.');
      } else {
        simpleResponse(setMessages, '❌ Gagal simpan: ' + writeR.data);
      }
    });
    return;
  }

  if (sub === 'disconnect') {
    const name = parts[2];
    if (!name) {
      simpleResponse(setMessages, 'Usage: `/mcp disconnect <name>`');
      return;
    }
    withLoading(setLoading, async () => {
      const readR = await callServer({ type: 'read', path: '~/.yuyu/mcp-servers.json' });
      let servers = [];
      if (readR.ok) { try { servers = JSON.parse(readR.data); } catch(_e){} }
      const before = servers.length;
      servers = servers.filter(s => s.name !== name);
      await callServer({ type: 'write', path: '~/.yuyu/mcp-servers.json', content: JSON.stringify(servers, null, 2) });
      simpleResponse(setMessages, before > servers.length ? '✅ **' + name + '** dihapus dari MCP servers.' : '⚠ Server **' + name + '** tidak ditemukan.');
    });
    return;
  }

  setShowMCP(true);
}

export function handleDb({ parts, folder, setLoading, setMessages }) {
  const q = parts.slice(1).join(' ');
  if (!q) {
    simpleResponse(setMessages, 'Usage: /db SELECT * FROM table\n\nAtau /db use <nama.db> untuk pilih database aktif');
    return;
  }
  
  withLoading(setLoading, async () => {
    const listR = await callServer({ type: 'list', path: folder });
    const dbFiles = listR.ok && Array.isArray(listR.data)
      ? listR.data.filter(f => !f.isDir && f.name.endsWith('.db')).map(f => folder + '/' + f.name)
      : [];
    
    if (parts[1] === 'use' && parts[2]) {
      activeDbRef[folder] = folder + '/' + parts[2];
      simpleResponse(setMessages, '🗄 DB aktif: **' + parts[2] + '** (sesi ini). Query berikutnya pakai file ini.');
      return;
    }
    
    let dbPath = activeDbRef[folder] || folder + '/data.db';
    if (!activeDbRef[folder] && dbFiles.length === 1) {
      dbPath = dbFiles[0];
    } else if (!activeDbRef[folder] && dbFiles.length > 1) {
      simpleResponse(setMessages, '🗄 Ditemukan ' + dbFiles.length + ' DB: ' + dbFiles.map(f => f.split('/').pop()).join(', ') + '\nUsage: /db <query> — pakai `/db use <nama.db>` untuk pilih.\nAktif: ' + dbPath.split('/').pop());
      return;
    }
    
    const r = await callServer({ type: 'mcp', tool: 'sqlite', action: 'query', params: { dbPath, query: q } });
    simpleResponse(setMessages, '🗄 **' + dbPath.split('/').pop() + '** → `' + q + '`\n```\n' + (r.data || 'kosong') + '\n```');
  });
}

export function handleWebsearch({ parts, setLoading, setMessages }) {
  const query = parts.slice(1).join(' ').trim();
  if (!query) {
    simpleResponse(setMessages, 'Usage: /websearch <query>\nContoh: /websearch react useEffect cleanup');
    return;
  }
  
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🔍 Searching: **' + query + '**...');
    const r = await callServer({ type: 'web_search', query });
    if (r.ok && r.data) {
      simpleResponse(setMessages, '🌐 **Web Search: ' + query + '**\n\n' + r.data);
    } else {
      simpleResponse(setMessages, '❌ Search gagal: ' + (r.data || 'unknown error'));
    }
  });
}

export function handleBrowse({ parts, browseTo, setMessages }) {
  const url = parts.slice(1).join(' ');
  if (!url) {
    simpleResponse(setMessages, 'Usage: /browse https://...');
    return;
  }
  browseTo(url);
}

export function handleOpen({ parts, setMessages }) {
  const url = parts.slice(1).join(' ').trim();
  if (!url) {
    simpleResponse(setMessages, 'Usage: /open https://...');
    return;
  }
  window.open(url, '_blank');
  simpleResponse(setMessages, '🌐 Membuka: ' + url);
}
