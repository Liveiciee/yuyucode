// patch_skills.cjs
const fs = require('fs');
const filePath = 'src/App.jsx';
let c = fs.readFileSync(filePath, 'utf8');

// Cek apakah /skills sudah ada
if (c.includes("base==='/skills'")) {
  console.log('✅ /skills sudah ada, skip insert');
} else {
  // Insert sebelum /self-edit
  const anchor = "    } else if (base==='/self-edit') {";
  const insert = `    } else if (base==='/skills') {
      const loaded = await loadSkills(folder);
      setSkills(loaded);
      const list = loaded.map(s=>'• '+s.name+' ('+Math.round(s.content.length/100)/10+'KB)').join('\n');
      setMessages(m=>[...m,{role:'assistant',content:'🧩 **Skills loaded ('+loaded.length+'):**\n\n'+(list||'Tidak ada skill files.'),actions:[]}]);
    } else if (base==='/thinking') {
      const next = !thinkingEnabled;
      setThinkingEnabled(next);
      Preferences.set({key:'yc_thinking',value:next?'1':'0'});
      setMessages(m=>[...m,{role:'assistant',content:'🧠 Extended thinking '+(next?'aktif':'nonaktif'),actions:[]}]);
    } else if (base==='/permissions') {
      setShowPermissions(true);
    } else if (base==='/sessions') {
      const sessions = await loadSessions();
      setSessionList(sessions);
      setShowSessions(true);
    } else if (base==='/save') {
      const name = parts.slice(1).join(' ').trim() || sessionName || 'Session '+new Date().toLocaleString('id');
      const s = await saveSession(name, messages, folder, branch);
      setSessionName(name);
      setMessages(m=>[...m,{role:'assistant',content:'💾 Sesi disimpan: **'+s.name+'**',actions:[]}]);
    } else if (base==='/debug') {
      const info = [
        '**Debug Info**',
        'Model: '+model,
        'Effort: '+effort,
        'Thinking: '+(thinkingEnabled?'on':'off'),
        'Messages: '+messages.length,
        'Tokens (est): ~'+countTokens(messages)+'tk',
        'Skills: '+skills.length,
        'Folder: '+folder,
        'Branch: '+branch,
        'Server: '+(serverOk?'OK':'offline'),
      ].join('\n');
      setMessages(m=>[...m,{role:'assistant',content:info,actions:[]}]);
    } else if (base==='/plugin') {
      setShowPlugins(true);
    } else if (base==='/self-edit') {`;

  if (!c.includes(anchor)) {
    console.log('⚠ anchor /self-edit tidak ditemukan');
  } else {
    c = c.replace(anchor, insert);
    console.log('✅ slash commands baru ditambahkan');
  }
}

// Fix parallel swarm jika belum ada
if (c.includes('Promise.all([\n        callAI([\n          {role:\'system\',content:\'Kamu adalah Frontend')) {
  console.log('✅ parallel swarm sudah ada');
} else if (c.includes("log('\u26db Frontend Agent: Mulai coding UI...');")) {
  c = c.replace(
    "log('\u26db Frontend Agent: Mulai coding UI...');",
    "log('\u26a1 Frontend + Backend parallel...');"
  );
  console.log('⚠ parallel swarm partial — manual check needed');
}

fs.writeFileSync(filePath, c);
console.log('done. lines:', c.split('\n').length);
