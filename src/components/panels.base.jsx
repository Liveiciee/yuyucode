import React, { useState, useRef, useEffect } from "react";
import { Search, Plug, Github, Key, Puzzle, Brain, MapPin, Scissors, Bookmark, Zap, Save, Upload, Settings, List, History, GitCompare, Plus, Palette, MessageSquare, Play, Package, X } from 'lucide-react';
import { MODELS } from '../constants.js';

export function BottomSheet({ children, onClose, height='88%', noPad:_noPad=false, T }) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(null);

  function onTouchStart(e) { startY.current = e.touches[0].clientY; setDragging(true); }
  function onTouchMove(e) {
    if (startY.current === null) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    setDragY(delta);
  }
  function onTouchEnd() {
    if (dragY > 110) { onClose(); } else { setDragY(0); }
    setDragging(false); startY.current = null;
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:99,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.55)'}} />
      <div style={{
        position:'relative', background:T?.bg2||'#111113',
        borderRadius:'18px 18px 0 0',
        maxHeight:height, display:'flex', flexDirection:'column',
        transform:`translateY(${dragY}px)`,
        transition: dragging ? 'none' : 'transform .3s cubic-bezier(.32,.72,0,1)',
        boxShadow:'0 -8px 40px rgba(0,0,0,.6)',
      }}>
        {/* drag handle zone */}
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{padding:'10px 0 4px',display:'flex',justifyContent:'center',flexShrink:0,touchAction:'none',cursor:'grab'}}>
          <div style={{width:'40px',height:'4px',borderRadius:'2px',background:(T?.border||'rgba(255,255,255,.18)')}} />
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',paddingBottom:'env(safe-area-inset-bottom,8px)'}}>
          {children}
        </div>
      </div>
    </div>
  );
}




export function CommandPalette({ onClose, onRun:_onRun, folder:_folder, memories, checkpoints, model, models, T,
  onModelChange, onNewChat, theme, onThemeChange, showSidebar, onToggleSidebar,
  onShowMemory, onShowCheckpoints, onShowMCP, onShowGitHub, onShowDeploy,
  onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  onShowSessions, onShowPermissions, onShowPlugins, onShowConfig,
  onShowSkills,
  runTests, generateCommitMsg, exportChat, compactContext }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(()=>{ setTimeout(()=>inputRef.current?.focus(),50); }, []);

  const sections = [
    { label: 'Chat', items: [
      { icon:'chat', label:'New chat', sub:'Mulai sesi baru', action:()=>{ onNewChat(); onClose(); } },
      { icon:'upload', label:'Export chat', sub:'Simpan ke .md', action:()=>{ exportChat(); onClose(); } },
      { icon:'package', label:'Compact context', sub:'Kompres history', action:()=>{ compactContext(); onClose(); } },
    ]},
    { label: 'Git', items: [
      { icon:'gitdiff', label:'Git diff', sub:'Lihat perubahan', action:()=>{ onShowDiff(); onClose(); } },
      { icon:'plus', label:'Generate commit', sub:'AI-powered commit msg', action:()=>{ generateCommitMsg(); onClose(); } },
      { icon:'play', label:'Run tests', sub:'npm test + lint', action:()=>{ runTests(); onClose(); } },
    ]},
    { label: 'Tools', items: [
      { icon:'plug', label:'MCP Tools', sub:'Model Context Protocol', action:()=>{ onShowMCP(); onClose(); } },
      { icon:'github', label:'GitHub', sub:'Issues & PRs', action:()=>{ onShowGitHub(); onClose(); } },
      { icon:'rocket', label:'Deploy', sub:'Vercel / Netlify / Railway', action:()=>{ onShowDeploy(); onClose(); } },
      { icon:'save', label:'Sessions', sub:'Sesi tersimpan', action:()=>{ onShowSessions&&onShowSessions(); onClose(); } },
      { icon:'key', label:'Permissions', sub:'Kelola tool permissions', action:()=>{ onShowPermissions&&onShowPermissions(); onClose(); } },
      { icon:'plug', label:'Plugins', sub:'Plugin marketplace', action:()=>{ onShowPlugins&&onShowPlugins(); onClose(); } },
      { icon:'settings', label:'Config', sub:'Settings interaktif', action:()=>{ onShowConfig&&onShowConfig(); onClose(); } },
      { icon:'puzzle', label:'Skills', sub:'Kelola & upload skill files', action:()=>{ onShowSkills&&onShowSkills(); onClose(); } },
      { icon:'scissors', label:'Snippets', sub:'Code snippet library', action:()=>{ onShowSnippets(); onClose(); } },
      { icon:'zap', label:'Custom actions', sub:'Shortcut commands', action:()=>{ onShowCustomActions(); onClose(); } },
    ]},
    { label: 'Memory', items: [
      { icon:'brain', label:`Memories (${memories.length})`, sub:'Auto-learned patterns', action:()=>{ onShowMemory(); onClose(); } },
      { icon:'mappin', label:`Checkpoints (${checkpoints.length})`, sub:'Session snapshots', action:()=>{ onShowCheckpoints(); onClose(); } },
    ]},
    { label: 'View', items: [
      { icon:'search', label:'Search files', sub:'Grep across project', action:()=>{ onShowSearch(); onClose(); } },
      { icon:'menu', label:'Toggle sidebar', sub: showSidebar?'Sembunyikan':'Tampilkan', action:()=>{ onToggleSidebar(); onClose(); } },
      { icon:'palette', label:'Theme: '+theme, sub:'obsidian / aurora / ink / neon', action:()=>{ const themes=['obsidian','aurora','ink','neon']; const i=themes.indexOf(theme); onThemeChange(themes[(i+1)%themes.length]); onClose(); } },
    ]},
    { label: 'AI Model', items: models.map(m=>({
      icon: model===m.id ? '●' : '○',
      label: m.label,
      sub: m.provider||'cerebras',
      action:()=>{ onModelChange(m.id); onClose(); }
    }))}
  ];

  const allItems = sections.flatMap(s=>s.items.map(i=>({...i,_section:s.label})));
  const filtered = q ? allItems.filter(i=>
    i.label.toLowerCase().includes(q.toLowerCase()) ||
    i.sub.toLowerCase().includes(q.toLowerCase())
  ) : null;

  const display = filtered ? [{label:'Results', items:filtered}] : sections;

  return (
    <BottomSheet onClose={onClose} height='95%'>
      <div style={{width:'100%',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',borderBottom:'1px solid '+border}}>
          <span style={{fontSize:'13px',color:textMute}}>⌘</span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Escape') onClose(); }}
            placeholder="Cari action atau ketik command..."
            style={{flex:1,background:'none',border:'none',outline:'none',color:text,fontSize:'13px',fontFamily:'inherit'}}/>
          {q && <button onClick={()=>setQ('')} style={{background:'none',border:'none',color:textMute,cursor:'pointer',fontSize:'12px'}}><X size={14}/></button>}
        </div>
        <div style={{maxHeight:'60vh',overflowY:'auto',padding:'6px'}}>
          {display.map(section=>(
            <div key={section.label}>
              {!q && <div style={{padding:'6px 10px 3px',fontSize:'9px',letterSpacing:'.08em',color:textMute,textTransform:'uppercase',fontWeight:'600'}}>{section.label}</div>}
              {section.items.map((item,i)=>(
                <div key={i} onClick={item.action}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'7px',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background=bg3}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontSize:'14px',width:'20px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{(()=>{
                    const iconMap = {
                      chat:<MessageSquare size={14}/>, upload:<Upload size={14}/>, package:<Package size={14}/>,
                      plug:<Plug size={14}/>, save:<Save size={14}/>, key:<Key size={14}/>,
                      puzzle:<Puzzle size={14}/>, zap:<Zap size={14}/>, search:<Search size={14}/>,
                      menu:<List size={14}/>, settings:<Settings size={14}/>, eye:<Eye size={14}/>,
                      gitdiff:<GitCompare size={14}/>, plus:<Plus size={14}/>, play:<Play size={14}/>,
                      github:<Github size={14}/>, rocket:<Zap size={14}/>, scissors:<Scissors size={14}/>,
                      brain:<Brain size={14}/>, mappin:<MapPin size={14}/>, history:<History size={14}/>, palette:<Palette size={14}/>,
                    };
                    return iconMap[item.icon] || <span style={{fontSize:'13px'}}>{item.icon}</span>;
                  })()}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',color:text,fontWeight:'500'}}>{item.label}</div>
                    <div style={{fontSize:'10px',color:textMute,marginTop:'1px'}}>{item.sub}</div>
                  </div>
                  {item._section&&q&&<span style={{fontSize:'9px',color:textMute,flexShrink:0}}>{item._section}</span>}
                </div>
              ))}
            </div>
          ))}
          {filtered&&filtered.length===0&&<div style={{padding:'16px',textAlign:'center',color:textMute,fontSize:'12px'}}>Tidak ada hasil untuk "{q}"</div>}
        </div>
        <div style={{padding:'6px 14px',borderTop:'1px solid '+border,display:'flex',gap:'12px'}}>
          <span style={{fontSize:'10px',color:textMute}}>↵ pilih</span>
          <span style={{fontSize:'10px',color:textMute}}>esc tutup</span>
          <span style={{fontSize:'10px',color:textMute}}>/ untuk slash commands</span>
        </div>
      </div>
  </BottomSheet>
  );
}

// ─── DEP GRAPH PANEL (d3 force layout) ───────────────────────────────────────
