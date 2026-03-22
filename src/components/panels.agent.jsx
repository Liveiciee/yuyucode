import React, { useState, useEffect } from "react";
import { Puzzle, X, Plus, Upload } from 'lucide-react';
import { BottomSheet } from './panels.base.jsx';

export function ElicitationPanel({ data, onSubmit, onDismiss, T }) {

  const bg2        = T?.bg2        || '#131108';
  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text       = T?.text       || '#f0f0f0';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const [values, setValues] = useState(() => {
    const init = {};
    (data.fields || []).forEach(f => { init[f.name] = f.default || ''; });
    return init;
  });

  function set(name, val) { setValues(v => ({ ...v, [name]: val })); }

  function handleSubmit() {
    const result = Object.entries(values)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    onSubmit(result);
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.78)',zIndex:210,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:bg2,border:'1px solid '+accentBorder,borderRadius:'14px',padding:'20px',width:'100%',maxWidth:'380px',boxShadow:'0 24px 60px rgba(0,0,0,.8)'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'14px'}}>
          <span style={{fontSize:'18px'}}><Plus size={13}/></span>
          <div style={{flex:1}}>
            <div style={{fontSize:'14px',fontWeight:'600',color:text}}>{data.title || 'Input diperlukan'}</div>
            {data.description && <div style={{fontSize:'11px',color:textMute,marginTop:'3px'}}>{data.description}</div>}
          </div>
          <button onClick={onDismiss} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer',flexShrink:0}}><X size={16}/></button>
        </div>

        {/* Fields */}
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px'}}>
          {(data.fields || []).map(field => (
            <div key={field.name}>
              <div style={{fontSize:'11px',color:textSec,marginBottom:'4px'}}>{field.label}</div>
              {field.type === 'select' ? (
                <select value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  style={{width:'100%',background:bg3,border:'1px solid '+borderMed,borderRadius:'8px',padding:'8px 10px',color:text,fontSize:'13px',outline:'none',boxSizing:'border-box'}}>
                  <option value="">Pilih···</option>
                  {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'checkbox' ? (
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',padding:'4px 0'}}>
                  <input type="checkbox" checked={!!values[field.name]}
                    onChange={e => set(field.name, e.target.checked)}
                    style={{width:'15px',height:'15px',accentColor:'#7c3aed'}} />
                  <span style={{fontSize:'12px',color:textSec}}>{field.placeholder || field.label}</span>
                </label>
              ) : field.type === 'textarea' ? (
                <textarea value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  placeholder={field.placeholder || ''} rows={3}
                  style={{width:'100%',background:bg3,border:'1px solid '+borderMed,borderRadius:'8px',padding:'8px 10px',color:text,fontSize:'12px',outline:'none',resize:'none',fontFamily:'inherit',boxSizing:'border-box'}} />
              ) : (
                <input value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={{width:'100%',background:bg3,border:'1px solid '+borderMed,borderRadius:'8px',padding:'8px 10px',color:text,fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={onDismiss}
            style={{flex:1,background:bg3,border:'1px solid '+border,borderRadius:'8px',padding:'9px',color:textMute,fontSize:'12px',cursor:'pointer'}}>
            Batal
          </button>
          <button onClick={handleSubmit}
            style={{flex:2,background:'#7c3aed',border:'none',borderRadius:'8px',padding:'9px',color:'white',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}>
            Kirim →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MERGE CONFLICT PANEL ─────────────────────────────────────────────────────


export function SkillsPanel({ skills, onToggle, onUpload, onRemove, onAdd, onClose, accentColor:_accentColor, T }) {
  const [adding, setAdding]       = useState(false);
  const [newName, setNewName]     = useState('');
  const [newContent, setNewContent] = useState('');
  const [busy, setBusy]           = useState(false);

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const text = await file.text();
    await onUpload(file.name, text);
    setBusy(false);
    onClose();
  }

  async function handleAdd() {
    if (!newName.trim() || !newContent.trim()) return;
    setBusy(true);
    await onAdd(newName.trim(), newContent.trim());
    setNewName(''); setNewContent(''); setAdding(false);
    setBusy(false);
  }

  const inputStyle = {
    background:'rgba(255,255,255,.06)', border:'1px solid '+borderMed,
    borderRadius:'7px', padding:'8px 10px', color:text, fontSize:'12px',
    outline:'none', fontFamily:'monospace', width:'100%', boxSizing:'border-box',
  };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px', flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', marginBottom:'12px', gap:'6px'}}>
          <span style={{fontSize:'14px', fontWeight:'600', color:'#f0f0f0', flex:1}}><Puzzle size={14}/> Skills</span>
          <label style={{background:accentBg, border:'1px solid '+accentBorder, borderRadius:'7px', padding:'6px 10px', color:'#a78bfa', fontSize:'11px', cursor:'pointer', minHeight:'32px', display:'flex', alignItems:'center'}}>
            ↑ Upload .md
            <input type="file" accept=".md,text/markdown,text/plain" style={{display:'none'}} disabled={busy} onChange={handleUpload}/>
          </label>
          <button onClick={()=>setAdding(a=>!a)}
            style={{background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.18)', borderRadius:'7px', padding:'6px 10px', color:'#4ade80', fontSize:'11px', cursor:'pointer', minHeight:'32px'}}>
            {adding ? 'Batal' : '+ Baru'}
          </button>
          <button onClick={onClose} style={{background:'none', border:'none', color:'rgba(255,255,255,.4)', fontSize:'16px', cursor:'pointer', padding:'4px'}}><X size={16}/></button>
        </div>

        {/* Inline add form */}
        {adding && (
          <div style={{marginBottom:'12px', display:'flex', flexDirection:'column', gap:'6px', padding:'10px', background:bg3, borderRadius:'8px', border:'1px solid '+border}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)}
              placeholder="nama-skill  (tanpa .md)" style={inputStyle}/>
            <textarea value={newContent} onChange={e=>setNewContent(e.target.value)}
              placeholder="Isi skill dalam Markdown&#10;&#10;Gunakan frontmatter:&#10;---&#10;name: nama&#10;description: ...&#10;---"
              style={{...inputStyle, resize:'vertical', minHeight:'120px', lineHeight:'1.6'}}/>
            <button onClick={handleAdd} disabled={!newName.trim()||!newContent.trim()||busy}
              style={{background:accentBg, border:'1px solid '+accentBorder, borderRadius:'7px', padding:'9px', color:accent, fontSize:'12px', cursor:'pointer', fontWeight:'500', opacity:(!newName.trim()||!newContent.trim()||busy)?0.45:1}}>
              {busy ? 'Menyimpan...' : 'Simpan ke .yuyu/skills/'}
            </button>
          </div>
        )}

        {/* Skill list */}
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px'}}>
          {skills.length === 0 && (
            <div style={{color:textMute, fontSize:'12px', padding:'8px 0'}}>
              Belum ada skill.<br/>Upload .md atau ketik <code style={{color:accent}}>/init</code> untuk generate dari project ini.
            </div>
          )}
          {skills.map(s => (
            <div key={s.name} style={{
              padding:'10px 12px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'10px',
              background: s.active ? accentBg : bg3,
              border: '1px solid ' + (s.active ? accentBorder : border),
            }}>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:'13px', fontWeight:'500', color: s.active ? accent : textMute, marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {s.name}
                </div>
                <div style={{fontSize:'10px', color:textMute, fontFamily:'monospace'}}>
                  {Math.round((s.content||'').length/100)/10}KB
                  {s.builtin ? ' · SKILL.md (root)' : ' · .yuyu/skills/'}
                  {!s.active && <span style={{color:textMute}}> · dimatikan</span>}
                </div>
              </div>

              {/* Delete — hanya non-builtin */}
              {!s.builtin && (
                <button onClick={()=>{ if(window.confirm('Hapus '+s.name+'?')) onRemove(s.name); }}
                  style={{background:'rgba(248,113,113,.07)', border:'1px solid rgba(248,113,113,.14)', borderRadius:'6px', padding:'4px 8px', color:'#f87171', fontSize:'10px', cursor:'pointer', flexShrink:0}}>
                  hapus
                </button>
              )}

              {/* Toggle */}
              <div onClick={()=>onToggle(s.name)}
                style={{width:'42px', height:'24px', borderRadius:'12px', background: s.active ? T.accent : 'rgba(255,255,255,.1)', cursor:'pointer', position:'relative', transition:'all .2s', flexShrink:0}}>
                <div style={{position:'absolute', top:'3px', left: s.active ? '21px' : '3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'all .2s'}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{marginTop:'10px', fontSize:'10px', color:textMute, textAlign:'center'}}>
          Skill aktif otomatis di-inject ke context AI berdasarkan relevansi task
        </div>
      </div>
    </BottomSheet>
  );
}

// ── DeployPanel ───────────────────────────────────────────────────────────────


// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime({ startedAt }) {
  const [now, setNow] = React.useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const elapsed = Math.round((now - startedAt) / 1000);
  return <span>{elapsed > 60 ? Math.floor(elapsed/60) + 'm' : elapsed + 's'}</span>;
}



export function BgAgentPanel({ agents, onMerge, onAbort, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const bg2        = T?.bg2        || '#131108';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const statusColor = { preparing:'#fbbf24', running:'#60a5fa', done:'#4ade80', error:'#f87171', aborted:'rgba(255,255,255,.3)', merged:'rgba(255,255,255,.2)', conflict:'#f97316' };
  const statusIcon  = { preparing:'…', running:'↻', done:'✓', error:'✗', aborted:'⏹', merged:'⇄', conflict:'!' };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>Background Agents</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        {agents.length === 0 && (
          <div style={{color:textMute,fontSize:'12px',padding:'8px 0'}}>
            Tidak ada agent aktif. Jalankan dengan <code style={{color:accent}}>/bg &lt;task&gt;</code>
          </div>
        )}
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'}}>
          {agents.map(agent => {
            const color = statusColor[agent.status] || '#f0f0f0';
            const icon  = statusIcon[agent.status]  || '?';
            return (
              <div key={agent.id} style={{padding:'12px',background:bg3,border:'1px solid '+border,borderRadius:'10px'}}>
                {/* Header row */}
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{fontSize:'13px'}}>{icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',color:text,fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{agent.task}</div>
                    <div style={{fontSize:'10px',color:textMute,fontFamily:'monospace',marginTop:'1px'}}>
                      {agent.id.slice(-8)} · <ElapsedTime startedAt={agent.startedAt}/> · branch: {agent.branch?.slice(-12)}
                    </div>
                  </div>
                  <span style={{fontSize:'11px',color,fontWeight:'600',textTransform:'uppercase',letterSpacing:'.04em'}}>{agent.status}</span>
                </div>

                {/* Progress bar for running */}
                {agent.status === 'running' && (
                  <div style={{height:'2px',background:bg3,borderRadius:'2px',marginBottom:'8px',overflow:'hidden'}}>
                    <div style={{height:'100%',background:'#60a5fa',borderRadius:'2px',animation:'pulse 1.5s ease-in-out infinite',width:'60%'}}/>
                  </div>
                )}

                {/* Log — last 4 entries */}
                {agent.log?.length > 0 && (
                  <div style={{background:bg2,borderRadius:'6px',padding:'6px 8px',marginBottom:'8px',maxHeight:'80px',overflowY:'auto'}}>
                    {agent.log.slice(-4).map((l,i) => (
                      <div key={i} style={{fontSize:'10px',color:textSec,fontFamily:'monospace',lineHeight:'1.6'}}>{l}</div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{display:'flex',gap:'6px'}}>
                  {agent.status === 'done' && (
                    <button onClick={()=>onMerge(agent.id)} style={{flex:1,background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'7px',padding:'6px',color:'#4ade80',fontSize:'11px',cursor:'pointer',fontWeight:'500'}}>
                      🔀 Merge ({agent.result?.allWrites?.length || 0} file)
                    </button>
                  )}
                  {agent.status === 'conflict' && (
                    <button onClick={()=>onMerge(agent.id)} style={{flex:1,background:'rgba(249,115,22,.1)',border:'1px solid rgba(249,115,22,.2)',borderRadius:'7px',padding:'6px',color:'#f97316',fontSize:'11px',cursor:'pointer',fontWeight:'500'}}>
                      ⚠️ Resolve Conflict
                    </button>
                  )}
                  {['preparing','running'].includes(agent.status) && (
                    <button onClick={()=>onAbort(agent.id)} style={{background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.14)',borderRadius:'7px',padding:'6px 10px',color:'#f87171',fontSize:'11px',cursor:'pointer'}}>
                      ⏹ Abort
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

