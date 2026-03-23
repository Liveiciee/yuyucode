// ── ApiKeySettings — ganti API key tanpa rebuild ──────────────────────────────
import { useState } from 'react';
import { getRuntimeCerebrasKey, getRuntimeGroqKey, saveRuntimeKeys } from '../runtimeKeys.js';

export function ApiKeySettings({ T, onClose }) {
  const [cerebras, setCerebras] = useState(() => getRuntimeCerebrasKey());
  const [groq,     setGroq]     = useState(() => getRuntimeGroqKey());
  const [saved,    setSaved]    = useState(false);
  const [showC,    setShowC]    = useState(false);
  const [showG,    setShowG]    = useState(false);


  async function handleSave() {
    await saveRuntimeKeys(cerebras.trim(), groq.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle = {
    width: '100%', background: T.bg, border: '1px solid ' + T.border,
    borderRadius: '8px', padding: '10px 12px', color: T.text,
    fontSize: '13px', fontFamily: 'monospace', outline: 'none', letterSpacing: '0.03em',
  };
  const btnPrimary = {
    flex: 1, background: saved ? T.success + '22' : T.accentBg,
    border: '1px solid ' + (saved ? T.success : T.accentBorder),
    borderRadius: '8px', padding: '10px', color: saved ? T.success : T.accent,
    cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all .2s',
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,padding:'20px'}}>
      <div style={{background:T.bg2,border:'1px solid '+T.border,borderRadius:'16px',padding:'24px',width:'100%',maxWidth:'420px',boxShadow:'0 24px 64px rgba(0,0,0,.6)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <div>
            <div style={{fontSize:'15px',fontWeight:'700',color:T.text}}>🔑 API Keys</div>
            <div style={{fontSize:'11px',color:T.textSec,marginTop:'2px'}}>Runtime — tidak perlu rebuild APK</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.textMute,cursor:'pointer',fontSize:'18px'}}>×</button>
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'11px',color:T.textSec,marginBottom:'6px',display:'block'}}>Cerebras API Key</label>
          <div style={{position:'relative'}}>
            <input type={showC?'text':'password'} value={cerebras} onChange={e=>setCerebras(e.target.value)}
              placeholder="csk-…" style={inputStyle} />
            <button style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.textMute,cursor:'pointer',fontSize:'13px'}}
              onClick={()=>setShowC(v=>!v)}>{showC?'🙈':'👁'}</button>
          </div>
          <div style={{fontSize:'10px',color:T.textMute,marginTop:'4px'}}>platform.cerebras.ai → API Keys</div>
        </div>

        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'11px',color:T.textSec,marginBottom:'6px',display:'block'}}>Groq API Key</label>
          <div style={{position:'relative'}}>
            <input type={showG?'text':'password'} value={groq} onChange={e=>setGroq(e.target.value)}
              placeholder="gsk-…" style={inputStyle} />
            <button style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.textMute,cursor:'pointer',fontSize:'13px'}}
              onClick={()=>setShowG(v=>!v)}>{showG?'🙈':'👁'}</button>
          </div>
          <div style={{fontSize:'10px',color:T.textMute,marginTop:'4px'}}>console.groq.com → API Keys</div>
        </div>

        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={handleSave} style={btnPrimary}>{saved?'✅ Tersimpan':'Simpan'}</button>
          <button onClick={onClose} style={{background:'none',border:'1px solid '+T.border,borderRadius:'8px',padding:'10px 16px',color:T.textSec,cursor:'pointer',fontSize:'13px'}}>Batal</button>
        </div>
        {(!cerebras&&!groq)&&<div style={{marginTop:'14px',padding:'10px 12px',background:T.bg,borderRadius:'8px',fontSize:'11px',color:T.textMute,border:'1px solid '+T.border}}>💡 Kosong = pakai key bawaan APK. Isi di sini untuk override.</div>}
      </div>
    </div>
  );
}
