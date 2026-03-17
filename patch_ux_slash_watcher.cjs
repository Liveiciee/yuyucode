// patch_ux_slash_watcher.cjs
const fs = require('fs');
const filePath = 'src/App.jsx';
const constPath = 'src/constants.js';
let c = fs.readFileSync(filePath, 'utf8');
let cc = fs.readFileSync(constPath, 'utf8');
let changed = 0;

function patch(label, from, to) {
  if (!c.includes(from)) { console.log('skip:', label); return; }
  c = c.replace(from, to);
  changed++;
  console.log('ok:', label);
}

// ── 1. Add new state ─────────────────────────────────────────────────────────
patch('add new state',
  '  const [summarizeAnchor, setSummarizeAnchor] = useState(null);',
  '  const [summarizeAnchor, setSummarizeAnchor] = useState(null);\n  const [sessionColor, setSessionColor] = useState(null);\n  const [showConfig, setShowConfig] = useState(false);\n  const [fileWatcherActive, setFileWatcherActive] = useState(false);\n  const [fileWatcherInterval, setFileWatcherInterval] = useState(null);\n  const [fileSnapshots, setFileSnapshots] = useState({});'
);

// ── 2. UX: effort symbols in header ─────────────────────────────────────────
patch('effort symbol in header',
  '        {skill&&<span style={{fontSize:\'9px\',color:\'rgba(74,222,128,.5)\',marginLeft:\'6px\',letterSpacing:\'.04em\',fontWeight:\'600\'}}>SKILL</span>}',
  '        {skill&&<span style={{fontSize:\'9px\',color:\'rgba(74,222,128,.5)\',marginLeft:\'6px\',letterSpacing:\'.04em\',fontWeight:\'600\'}}>SKILL</span>}\n          <span style={{fontSize:\'10px\',color:effort===\'low\'?\'rgba(74,222,128,.6)\':effort===\'high\'?\'rgba(248,113,113,.6)\':\' rgba(255,255,255,.2)\',marginLeft:\'4px\'}}>{effort===\'low\'?\'○\':effort===\'high\'?\'●\':\'◐\'}</span>'
);

// ── 3. UX: session color bar under header ────────────────────────────────────
patch('session color bar',
  '      {/* ── HEADER (minimal) ── */}\n      <div style={{height:\'44px\'',
  '      {/* SESSION COLOR BAR */}\n      {sessionColor&&<div style={{height:\'2px\',background:sessionColor,flexShrink:0}}/>}\n\n      {/* ── HEADER (minimal) ── */}\n      <div style={{height:\'44px\''
);

// ── 4. UX: memory timestamps in amemory view ─────────────────────────────────
patch('memory timestamps',
  "        const all = ['user','project','local'].map(s=>'**'+s+'** ('+(agentMemory[s]||[]).length+'):\\n'+((agentMemory[s]||[]).map(mx=>'• '+mx.text).join('\\n')||'kosong')).join('\\n\\n');",
  "        const all = ['user','project','local'].map(s=>'**'+s+'** ('+(agentMemory[s]||[]).length+'):\\n'+((agentMemory[s]||[]).map(mx=>'• '+mx.text+(mx.ts?' ('+mx.ts+')':'')).join('\\n')||'kosong')).join('\\n\\n');"
);

// ── 5. Add file watcher useEffect ────────────────────────────────────────────
patch('add file watcher useEffect',
  '  // ── CONTEXT WINDOW MANAGEMENT ──',
  [
    '  // ── FILE WATCHER ──',
    '  useEffect(() => {',
    '    if (!fileWatcherActive || !folder) return;',
    '    const iv = setInterval(async () => {',
    '      const r = await callServer({type:\'list\', path:folder+\'/src\'});',
    '      if (!r.ok || !Array.isArray(r.data)) return;',
    '      const changed = [];',
    '      for (const f of r.data.filter(x=>!x.isDir)) {',
    '        const key = f.name;',
    '        const mtime = f.mtime || f.size;',
    '        if (fileSnapshots[key] !== undefined && fileSnapshots[key] !== mtime) {',
    '          changed.push(f.name);',
    '        }',
    '      }',
    '      const snap = {};',
    '      r.data.forEach(f=>{ snap[f.name] = f.mtime || f.size; });',
    '      setFileSnapshots(snap);',
    '      if (changed.length > 0) {',
    "        setMessages(m=>[...m,{role:'assistant',content:'👁 **File berubah** (dari luar app):\\n'+changed.map(f=>'• '+f).join('\\n'),actions:[]}]);",
    "        sendNotification('YuyuCode 👁', changed.join(', ')+' berubah');",
    '      }',
    '    }, 30000);',
    '    setFileWatcherInterval(iv);',
    '    return () => clearInterval(iv);',
    '  }, [fileWatcherActive, folder]);',
    '',
    '  // ── CONTEXT WINDOW MANAGEMENT ──',
  ].join('\n')
);

// ── 6. Add new slash commands before /self-edit ──────────────────────────────
patch('add batch simplify color config watch',
  "    } else if (base==='/self-edit') {",
  [
    "    } else if (base==='/batch') {",
    "      const batchCmd = parts.slice(1).join(' ').trim();",
    "      if (!batchCmd) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /batch <command>\\nContoh: /batch tambah console.log di setiap fungsi\\nAkan dijalankan ke semua file di src/',actions:[]}]); return; }",
    "      setLoading(true);",
    "      setMessages(m=>[...m,{role:'assistant',content:'📦 Batch operation: **'+batchCmd+'**\\nMengambil daftar file...',actions:[]}]);",
    "      const listR = await callServer({type:'list', path:folder+'/src'});",
    "      if (!listR.ok) { setMessages(m=>[...m,{role:'assistant',content:'❌ Tidak bisa list src/',actions:[]}]); setLoading(false); return; }",
    "      const files = (listR.data||[]).filter(f=>!f.isDir && (f.name.endsWith('.jsx')||f.name.endsWith('.js')||f.name.endsWith('.ts')));",
    "      setMessages(m=>[...m,{role:'assistant',content:'📦 **'+files.length+' file** ditemukan. Mengirim ke AI...',actions:[]}]);",
    "      await sendMsg('BATCH OPERATION pada '+files.length+' file di src/:\\n'+files.map(f=>f.name).join(', ')+'\\n\\nTask: '+batchCmd+'\\n\\nUntuk setiap file, gunakan read_file lalu write_file jika perlu perubahan. Lakukan per file satu-satu.');",
    "      setLoading(false);",
    "    } else if (base==='/simplify') {",
    "      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }",
    "      await sendMsg('Simplifikasi kode di '+selectedFile+'. Hapus dead code, perpendek fungsi yang terlalu panjang, perbaiki naming. Jangan ubah fungsionalitas. Gunakan write_file untuk patch minimal.');",
    "    } else if (base==='/color') {",
    "      const color = parts[1]?.trim();",
    "      const colors = {red:'#ef4444',green:'#22c55e',blue:'#3b82f6',purple:'#a855f7',yellow:'#eab308',pink:'#ec4899',orange:'#f97316',off:'off'};",
    "      if (!color || !colors[color]) {",
    "        setMessages(m=>[...m,{role:'assistant',content:'🎨 Session color sekarang: '+(sessionColor||'off')+'\\nUsage: /color red|green|blue|purple|yellow|pink|orange|off',actions:[]}]);",
    "        return;",
    "      }",
    "      const newColor = color==='off' ? null : colors[color];",
    "      setSessionColor(newColor);",
    "      Preferences.set({key:'yc_session_color',value:newColor||''});",
    "      setMessages(m=>[...m,{role:'assistant',content:'🎨 Session color: **'+color+'**',actions:[]}]);",
    "    } else if (base==='/config') {",
    "      setShowConfig(true);",
    "    } else if (base==='/watch') {",
    "      if (fileWatcherActive) {",
    "        clearInterval(fileWatcherInterval);",
    "        setFileWatcherActive(false);",
    "        setFileWatcherInterval(null);",
    "        setMessages(m=>[...m,{role:'assistant',content:'👁 File watcher dimatikan.',actions:[]}]);",
    "      } else {",
    "        setFileWatcherActive(true);",
    "        setFileSnapshots({});",
    "        setMessages(m=>[...m,{role:'assistant',content:'👁 File watcher aktif. Yuyu akan notify kalau ada file yang berubah dari luar app (check tiap 30 detik).',actions:[]}]);",
    "      }",
    "    } else if (base==='/self-edit') {",
  ].join('\n')
);

// ── 7. Add config panel before closing div ───────────────────────────────────
patch('add config panel',
  '      {/* DEPLOY PANEL */}',
  [
    '      {/* CONFIG PANEL */}',
    '      {showConfig&&(',
    '        <div style={{position:\'absolute\',top:0,left:0,right:0,bottom:0,background:\'rgba(0,0,0,.95)\',zIndex:99,display:\'flex\',flexDirection:\'column\',padding:\'16px\'}}>',
    '          <div style={{display:\'flex\',alignItems:\'center\',marginBottom:\'16px\'}}>',
    '            <span style={{fontSize:\'14px\',fontWeight:\'600\',color:\'#f0f0f0\',flex:1}}>⚙️ Config</span>',
    '            <button onClick={()=>setShowConfig(false)} style={{background:\'none\',border:\'none\',color:\'rgba(255,255,255,.4)\',fontSize:\'16px\',cursor:\'pointer\'}}>×</button>',
    '          </div>',
    '          <div style={{flex:1,overflowY:\'auto\',display:\'flex\',flexDirection:\'column\',gap:\'12px\'}}>',
    '            {[',
    '              {label:\'Effort Level\',value:effort,options:[\'low\',\'medium\',\'high\'],onChange:v=>{setEffort(v);Preferences.set({key:\'yc_effort\',value:v});}},',
    '              {label:\'Font Size\',value:String(fontSize),options:[\'12\',\'13\',\'14\',\'15\',\'16\'],onChange:v=>{setFontSize(parseInt(v));Preferences.set({key:\'yc_fontsize\',value:v});}},',
    '              {label:\'Theme\',value:theme,options:[\'dark\',\'darker\',\'midnight\'],onChange:v=>{setTheme(v);Preferences.set({key:\'yc_theme\',value:v});}},',
    '              {label:\'Model\',value:model,options:MODELS.map(m=>m.id),onChange:v=>{setModel(v);Preferences.set({key:\'yc_model\',value:v});}},',
    '            ].map(cfg=>(',
    '              <div key={cfg.label} style={{padding:\'10px 12px\',background:\'rgba(255,255,255,.04)\',border:\'1px solid rgba(255,255,255,.08)\',borderRadius:\'8px\'}}>',
    '                <div style={{fontSize:\'11px\',color:\'rgba(255,255,255,.4)\',marginBottom:\'6px\'}}>{cfg.label}</div>',
    '                <div style={{display:\'flex\',gap:\'6px\',flexWrap:\'wrap\'}}>',
    '                  {cfg.options.map(opt=>(',
    '                    <button key={opt} onClick={()=>cfg.onChange(opt)}',
    '                      style={{background:cfg.value===opt?\'rgba(124,58,237,.3)\':\' rgba(255,255,255,.05)\',border:\'1px solid \'+(cfg.value===opt?\'rgba(124,58,237,.5)\':\' rgba(255,255,255,.08)\'),borderRadius:\'6px\',padding:\'4px 10px\',color:cfg.value===opt?\'#a78bfa\':\'rgba(255,255,255,.5)\',fontSize:\'11px\',cursor:\'pointer\',fontFamily:\'monospace\'}}>',
    '                      {opt.length > 20 ? opt.slice(0,20)+\'…\' : opt}',
    '                    </button>',
    '                  ))}',
    '                </div>',
    '              </div>',
    '            ))}',
    '            <div style={{padding:\'10px 12px\',background:\'rgba(255,255,255,.04)\',border:\'1px solid rgba(255,255,255,.08)\',borderRadius:\'8px\'}}>',
    '              <div style={{fontSize:\'11px\',color:\'rgba(255,255,255,.4)\',marginBottom:\'6px\'}}>Extended Thinking</div>',
    '              <button onClick={()=>{const n=!thinkingEnabled;setThinkingEnabled(n);Preferences.set({key:\'yc_thinking\',value:n?\'1\':\'0\'});}}',
    '                style={{background:thinkingEnabled?\'rgba(124,58,237,.3)\':\' rgba(255,255,255,.05)\',border:\'1px solid \'+(thinkingEnabled?\'rgba(124,58,237,.5)\':\' rgba(255,255,255,.08)\'),borderRadius:\'6px\',padding:\'4px 10px\',color:thinkingEnabled?\'#a78bfa\':\'rgba(255,255,255,.5)\',fontSize:\'11px\',cursor:\'pointer\'}}>',
    '                {thinkingEnabled?\'✅ ON\':\'○ OFF\'}',
    '              </button>',
    '            </div>',
    '            <div style={{padding:\'10px 12px\',background:\'rgba(255,255,255,.04)\',border:\'1px solid rgba(255,255,255,.08)\',borderRadius:\'8px\'}}>',
    '              <div style={{fontSize:\'11px\',color:\'rgba(255,255,255,.4)\',marginBottom:\'6px\'}}>File Watcher</div>',
    '              <button onClick={()=>{if(fileWatcherActive){clearInterval(fileWatcherInterval);setFileWatcherActive(false);}else{setFileWatcherActive(true);setFileSnapshots({});}}}',
    '                style={{background:fileWatcherActive?\'rgba(74,222,128,.15)\':\' rgba(255,255,255,.05)\',border:\'1px solid \'+(fileWatcherActive?\'rgba(74,222,128,.3)\':\' rgba(255,255,255,.08)\'),borderRadius:\'6px\',padding:\'4px 10px\',color:fileWatcherActive?\'#4ade80\':\'rgba(255,255,255,.5)\',fontSize:\'11px\',cursor:\'pointer\'}}>',
    '                {fileWatcherActive?\'👁 ACTIVE\':\'○ OFF\'}',
    '              </button>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      )}',
    '',
    '      {/* DEPLOY PANEL */}',
  ].join('\n')
);

// ── 8. Load session color on startup ─────────────────────────────────────────
patch('load session color',
  "      if(oh.value) setOllamaHost(oh.value);",
  "      if(oh.value) setOllamaHost(oh.value);\n      const scr = await Preferences.get({key:'yc_session_color'});\n      if(scr.value) setSessionColor(scr.value||null);"
);

// ── 9. Add /config to command palette tools ───────────────────────────────────
patch('add config to palette',
  "      { icon:'🔌', label:'Plugins', sub:'Plugin marketplace', action:()=>{ onShowPlugins&&onShowPlugins(); onClose(); } },",
  "      { icon:'🔌', label:'Plugins', sub:'Plugin marketplace', action:()=>{ onShowPlugins&&onShowPlugins(); onClose(); } },\n      { icon:'⚙️', label:'Config', sub:'Settings interaktif', action:()=>{ onShowConfig&&onShowConfig(); onClose(); } },"
);

patch('pass config handler to palette',
  "              onShowPlugins={()=>setShowPlugins(true)}",
  "              onShowPlugins={()=>setShowPlugins(true)}\n              onShowConfig={()=>setShowConfig(true)}"
);

patch('palette accept config handler',
  "  onShowSessions, onShowPermissions, onShowPlugins,",
  "  onShowSessions, onShowPermissions, onShowPlugins, onShowConfig,"
);

// ── 10. Update constants.js ───────────────────────────────────────────────────
if (!cc.includes("'/batch'")) {
  cc = cc.replace(
    "  { cmd:'/memory',      desc:'Lihat/edit auto memories' },",
    "  { cmd:'/memory',      desc:'Lihat/edit auto memories' },\n  { cmd:'/batch',       desc:'Operasi AI ke semua file di src/' },\n  { cmd:'/simplify',    desc:'Simplifikasi file yang sedang dibuka' },\n  { cmd:'/color',       desc:'Set warna bar sesi (red/green/blue/off)' },\n  { cmd:'/config',      desc:'Panel settings interaktif' },\n  { cmd:'/watch',       desc:'Toggle file watcher (notify perubahan eksternal)' },"
  );
  fs.writeFileSync(constPath, cc);
  console.log('ok: constants updated');
}

fs.writeFileSync(filePath, c);
console.log('\ndone. changes:', changed, '| lines:', c.split('\n').length);
