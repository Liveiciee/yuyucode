// ── OnboardingWizard — setup pertama kali ─────────────────────────────────────
import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer } from '../api.js';
import { saveRuntimeKeys } from '../runtimeKeys/index.js';

export function OnboardingWizard({ T, onDone }) {
  const [step,     setStep]     = useState(0);
  const [cerebras, setCerebras] = useState('');
  const [groq,     setGroq]     = useState('');
  const [ping,     setPing]     = useState(null);
  const [pinging,  setPinging]  = useState(false);

  async function checkServer() {
    setPinging(true);
    const r = await callServer({ type: 'ping' }).catch(() => ({ ok: false }));
    setPing(r.ok ? 'ok' : 'fail');
    setPinging(false);
  }

  async function finish() {
    if (cerebras.trim() || groq.trim()) await saveRuntimeKeys(cerebras.trim(), groq.trim());
    await Preferences.set({ key: 'yc_onboarded', value: '1' });
    onDone();
  }

  const inputStyle = { width:'100%',background:T.bg,border:'1px solid '+T.border,borderRadius:'8px',padding:'10px 12px',color:T.text,fontSize:'13px',fontFamily:'monospace',outline:'none',marginTop:'6px' };
  const btnP = { width:'100%',background:T.accentBg,border:'1px solid '+T.accentBorder,borderRadius:'10px',padding:'12px',color:T.accent,cursor:'pointer',fontSize:'14px',fontWeight:'600',marginTop:'16px' };
  const btnS = { width:'100%',background:'none',border:'1px solid '+T.border,borderRadius:'10px',padding:'10px',color:T.textSec,cursor:'pointer',fontSize:'13px',marginTop:'8px' };

  return (
    <div style={{position:'fixed',inset:0,background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:600,padding:'24px'}}>
      <div style={{display:'flex',gap:'8px',marginBottom:'32px'}}>
        {['Selamat datang','Server','API Keys','Selesai'].map((s,i)=>(
          <div key={s} style={{width:i===step?'24px':'8px',height:'8px',borderRadius:'99px',transition:'all .3s',background:i<=step?T.accent:T.border}}/>
        ))}
      </div>
      <div style={{width:'100%',maxWidth:'360px'}}>
        {step===0&&<div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🌸</div>
          <div style={{fontSize:'22px',fontWeight:'700',color:T.text,marginBottom:'10px'}}>Halo! Aku Yuyu</div>
          <div style={{fontSize:'14px',color:T.textSec,lineHeight:'1.6',marginBottom:'8px'}}>Partner coding kamu — bukan sekadar tool.</div>
          <div style={{fontSize:'13px',color:T.textMute,lineHeight:'1.6'}}>Dibangun untuk Android · Termux-compatible · Jalan dari HP.</div>
          <button onClick={()=>setStep(1)} style={btnP}>Mulai setup →</button>
        </div>}

        {step===1&&<div>
          <div style={{fontSize:'18px',fontWeight:'700',color:T.text,marginBottom:'8px'}}>🖥 Yuyu Server</div>
          <div style={{fontSize:'13px',color:T.textSec,lineHeight:'1.6',marginBottom:'16px'}}>Yuyu butuh server lokal untuk baca/tulis file. Jalankan dulu di Termux:</div>
          <div style={{background:T.bg2,border:'1px solid '+T.border,borderRadius:'10px',padding:'12px 14px',fontFamily:'monospace',fontSize:'13px',color:T.accent,marginBottom:'16px'}}>node ~/yuyu-server.cjs &amp;</div>
          <button onClick={checkServer} disabled={pinging} style={{...btnP,marginTop:'0',opacity:pinging?.6:1,background:ping==='ok'?T.success+'22':ping==='fail'?'#f8717122':T.accentBg,borderColor:ping==='ok'?T.success:ping==='fail'?'#f87171':T.accentBorder,color:ping==='ok'?T.success:ping==='fail'?'#f87171':T.accent}}>
            {pinging?'⏳ Checking...':ping==='ok'?'✅ Server OK':ping==='fail'?'❌ Tidak terdeteksi':'🔍 Cek koneksi'}
          </button>
          {ping==='fail'&&<div style={{fontSize:'11px',color:T.textMute,marginTop:'8px',textAlign:'center'}}>Server belum jalan? Bisa skip dulu.</div>}
          <button onClick={()=>setStep(2)} style={btnS}>{ping==='ok'?'Lanjut →':'Skip untuk sekarang'}</button>
        </div>}

        {step===2&&<div>
          <div style={{fontSize:'18px',fontWeight:'700',color:T.text,marginBottom:'8px'}}>🔑 API Keys</div>
          <div style={{fontSize:'13px',color:T.textSec,lineHeight:'1.6',marginBottom:'16px'}}>
            Semua free tier. Cerebras + Groq wajib. Tavily opsional untuk web search.
          </div>
          <div style={{marginBottom:'10px'}}>
            <div style={{fontSize:'11px',color:T.textMute,marginBottom:'2px'}}>Cerebras <span style={{color:T.error,fontSize:'9px'}}>WAJIB</span> — <span style={{color:T.accent,fontFamily:'monospace',fontSize:'10px'}}>cloud.cerebras.ai</span></div>
            <input type="password" value={cerebras} onChange={e=>setCerebras(e.target.value)} placeholder="csk-…" style={inputStyle}/>
          </div>
          <div style={{marginBottom:'10px'}}>
            <div style={{fontSize:'11px',color:T.textMute,marginBottom:'2px'}}>Groq <span style={{color:T.error,fontSize:'9px'}}>WAJIB</span> — <span style={{color:T.accent,fontFamily:'monospace',fontSize:'10px'}}>console.groq.com</span></div>
            <input type="password" value={groq} onChange={e=>setGroq(e.target.value)} placeholder="gsk-…" style={inputStyle}/>
          </div>
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'11px',color:T.textMute,marginBottom:'2px'}}>Tavily <span style={{opacity:.6,fontSize:'9px'}}>opsional</span> — web search (<span style={{color:T.accent,fontFamily:'monospace',fontSize:'10px'}}>tavily.com</span>)</div>
            <input type="password" value={''} onChange={()=>{}} placeholder="tvly-… (opsional, bisa isi nanti via /apikeys)" style={inputStyle}/>
          </div>
          <button onClick={()=>setStep(3)} style={btnP}>Lanjut →</button>
          <button onClick={()=>setStep(3)} style={btnS}>Skip</button>
        </div>}

        {step===3&&<div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🚀</div>
          <div style={{fontSize:'20px',fontWeight:'700',color:T.text,marginBottom:'10px'}}>Siap!</div>
          <div style={{fontSize:'13px',color:T.textSec,lineHeight:'1.6',marginBottom:'24px'}}>
            Project Manager akan terbuka otomatis — pilih atau buat project pertama kamu.<br/><br/>
            Ketik <span style={{color:T.accent,fontFamily:'monospace'}}>/help</span> untuk lihat semua command, atau <span style={{color:T.accent,fontFamily:'monospace'}}>/rules</span> untuk edit YUYU.md.
          </div>
          <button onClick={finish} style={btnP}>Mulai coding 🌸</button>
        </div>}
      </div>
    </div>
  );
}
