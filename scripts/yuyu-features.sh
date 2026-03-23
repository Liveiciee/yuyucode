#!/bin/bash
# yuyu-features.sh — apply 4 missing features ke YuyuCode
# Jalankan dari root project: bash yuyu-features.sh

set -e
echo "🌸 Applying 4 missing features..."

# ── 1. runtimeKeys.js ─────────────────────────────────────────────────────────
cat > src/runtimeKeys.js << 'ENDOFFILE'
// ── Runtime key store — overrides baked-in env vars at runtime ───────────────
import { Preferences } from '@capacitor/preferences';

let _cerebras = '';
let _groq      = '';

export async function loadRuntimeKeys() {
  const [c, g] = await Promise.all([
    Preferences.get({ key: 'yc_cerebras_key' }),
    Preferences.get({ key: 'yc_groq_key' }),
  ]);
  _cerebras = c.value || '';
  _groq      = g.value || '';
}

export async function saveRuntimeKeys(cerebras, groq) {
  _cerebras = cerebras || '';
  _groq      = groq     || '';
  await Promise.all([
    Preferences.set({ key: 'yc_cerebras_key', value: _cerebras }),
    Preferences.set({ key: 'yc_groq_key',      value: _groq }),
  ]);
}

export function getRuntimeCerebrasKey() { return _cerebras; }
export function getRuntimeGroqKey()     { return _groq; }
ENDOFFILE
echo "✅ src/runtimeKeys.js"

# ── 2. ApiKeySettings.jsx ─────────────────────────────────────────────────────
cat > src/components/ApiKeySettings.jsx << 'ENDOFFILE'
// ── ApiKeySettings — ganti API key tanpa rebuild ──────────────────────────────
import { useState, useEffect } from 'react';
import { getRuntimeCerebrasKey, getRuntimeGroqKey, saveRuntimeKeys } from '../runtimeKeys.js';

export function ApiKeySettings({ T, onClose }) {
  const [cerebras, setCerebras] = useState('');
  const [groq,     setGroq]     = useState('');
  const [saved,    setSaved]    = useState(false);
  const [showC,    setShowC]    = useState(false);
  const [showG,    setShowG]    = useState(false);

  useEffect(() => {
    setCerebras(getRuntimeCerebrasKey());
    setGroq(getRuntimeGroqKey());
  }, []);

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
ENDOFFILE
echo "✅ src/components/ApiKeySettings.jsx"

# ── 3. OnboardingWizard.jsx ───────────────────────────────────────────────────
cat > src/components/OnboardingWizard.jsx << 'ENDOFFILE'
// ── OnboardingWizard — setup pertama kali ─────────────────────────────────────
import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer } from '../api.js';
import { saveRuntimeKeys } from '../runtimeKeys.js';

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
          <div style={{background:T.bg2,border:'1px solid '+T.border,borderRadius:'10px',padding:'12px 14px',fontFamily:'monospace',fontSize:'13px',color:T.accent,marginBottom:'16px'}}>node yuyu-server.js</div>
          <button onClick={checkServer} disabled={pinging} style={{...btnP,marginTop:'0',opacity:pinging?.6:1,background:ping==='ok'?T.success+'22':ping==='fail'?'#f8717122':T.accentBg,borderColor:ping==='ok'?T.success:ping==='fail'?'#f87171':T.accentBorder,color:ping==='ok'?T.success:ping==='fail'?'#f87171':T.accent}}>
            {pinging?'⏳ Checking...':ping==='ok'?'✅ Server OK':ping==='fail'?'❌ Tidak terdeteksi':'🔍 Cek koneksi'}
          </button>
          {ping==='fail'&&<div style={{fontSize:'11px',color:T.textMute,marginTop:'8px',textAlign:'center'}}>Server belum jalan? Bisa skip dulu.</div>}
          <button onClick={()=>setStep(2)} style={btnS}>{ping==='ok'?'Lanjut →':'Skip untuk sekarang'}</button>
        </div>}

        {step===2&&<div>
          <div style={{fontSize:'18px',fontWeight:'700',color:T.text,marginBottom:'8px'}}>🔑 API Keys</div>
          <div style={{fontSize:'13px',color:T.textSec,lineHeight:'1.6',marginBottom:'16px'}}>Opsional — APK sudah punya key bawaan.</div>
          <div style={{marginBottom:'12px'}}>
            <div style={{fontSize:'11px',color:T.textMute}}>Cerebras</div>
            <input type="password" value={cerebras} onChange={e=>setCerebras(e.target.value)} placeholder="csk-… (opsional)" style={inputStyle}/>
          </div>
          <div>
            <div style={{fontSize:'11px',color:T.textMute}}>Groq</div>
            <input type="password" value={groq} onChange={e=>setGroq(e.target.value)} placeholder="gsk-… (opsional)" style={inputStyle}/>
          </div>
          <button onClick={()=>setStep(3)} style={btnP}>Lanjut →</button>
          <button onClick={()=>setStep(3)} style={btnS}>Skip</button>
        </div>}

        {step===3&&<div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🚀</div>
          <div style={{fontSize:'20px',fontWeight:'700',color:T.text,marginBottom:'10px'}}>Siap!</div>
          <div style={{fontSize:'13px',color:T.textSec,lineHeight:'1.6',marginBottom:'24px'}}>
            Set project folder dari panel kiri, lalu mulai coding.<br/><br/>
            Ketik <span style={{color:T.accent,fontFamily:'monospace'}}>/help</span> untuk lihat semua command.
          </div>
          <button onClick={finish} style={btnP}>Mulai coding 🌸</button>
        </div>}
      </div>
    </div>
  );
}
ENDOFFILE
echo "✅ src/components/OnboardingWizard.jsx"

# ── 4. Patch api.js, main.jsx, App.jsx via Python ─────────────────────────────
python3 << 'PYEOF'
import sys

# --- api.js ---
with open('src/api.js', 'r') as f: c = f.read()
c = c.replace(
  "import { CEREBRAS_KEY, GROQ_KEY, YUYU_SERVER, WS_SERVER, MODELS, FALLBACK_MODEL } from './constants.js';",
  "import { CEREBRAS_KEY, GROQ_KEY, YUYU_SERVER, WS_SERVER, MODELS, FALLBACK_MODEL } from './constants.js';\nimport { getRuntimeCerebrasKey, getRuntimeGroqKey } from './runtimeKeys.js';\nfunction getCerebrasKey() { return getRuntimeCerebrasKey() || CEREBRAS_KEY; }\nfunction getGroqKey()     { return getRuntimeGroqKey()     || GROQ_KEY; }",
  1)
c = c.replace("'Authorization': 'Bearer ' + CEREBRAS_KEY", "'Authorization': 'Bearer ' + getCerebrasKey()")
c = c.replace("'Authorization': 'Bearer ' + GROQ_KEY", "'Authorization': 'Bearer ' + getGroqKey()")
c = c.replace("e.message.startsWith('RATE_LIMIT:') && GROQ_KEY", "e.message.startsWith('RATE_LIMIT:') && getGroqKey()")
with open('src/api.js', 'w') as f: f.write(c)
print("✅ src/api.js")

# --- main.jsx ---
with open('src/main.jsx', 'r') as f: c = f.read()
c = c.replace(
  "class ErrorBoundary extends React.Component {\n  constructor(props) { super(props); this.state = { error: null }; }\n  static getDerivedStateFromError(e) { return { error: e }; }\n  render() {\n    if (this.state.error) {\n      return (\n        <div style={{position:'fixed',inset:0,background:'#0d0d0e',color:'#f87171',padding:'24px',fontFamily:'monospace',fontSize:'13px',overflowY:'auto'}}>\n          <div style={{fontSize:'16px',fontWeight:'bold',marginBottom:'12px'}}>🔴 App Crash</div>\n          <div style={{color:'#fbbf24',marginBottom:'8px'}}>{this.state.error.message}</div>\n          <pre style={{color:'rgba(255,255,255,.5)',fontSize:'11px',whiteSpace:'pre-wrap'}}>{this.state.error.stack}</pre>\n        </div>",
  "class ErrorBoundary extends React.Component {\n  constructor(props) { super(props); this.state = { error: null, copied: false }; }\n  static getDerivedStateFromError(e) { return { error: e }; }\n  componentDidCatch(error, info) {\n    const log = JSON.stringify({ ts: new Date().toISOString(), msg: error.message, stack: error.stack, component: info?.componentStack?.slice(0,400) }, null, 2);\n    try { localStorage.setItem('yuyu_last_crash', log); } catch(_e) {}\n  }\n  render() {\n    if (this.state.error) {\n      const log = `[${new Date().toISOString()}]\\n${this.state.error.message}\\n\\n${this.state.error.stack}`;\n      return (\n        <div style={{position:'fixed',inset:0,background:'#0d0d0e',color:'#f87171',padding:'24px',fontFamily:'monospace',fontSize:'13px',overflowY:'auto'}}>\n          <div style={{fontSize:'16px',fontWeight:'bold',marginBottom:'12px'}}>🔴 App Crash</div>\n          <div style={{color:'#fbbf24',marginBottom:'8px'}}>{this.state.error.message}</div>\n          <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>\n            <button onClick={()=>{navigator.clipboard?.writeText(log);this.setState({copied:true});setTimeout(()=>this.setState({copied:false}),2000);}}\n              style={{background:'#1a1a1e',border:'1px solid #333',borderRadius:'6px',color:this.state.copied?'#4ade80':'#a78bfa',padding:'6px 12px',cursor:'pointer',fontSize:'12px'}}>\n              {this.state.copied ? '✅ Copied' : '📋 Copy log'}\n            </button>\n            <button onClick={()=>window.location.reload()}\n              style={{background:'#1a1a1e',border:'1px solid #333',borderRadius:'6px',color:'#fbbf24',padding:'6px 12px',cursor:'pointer',fontSize:'12px'}}>\n              🔄 Reload\n            </button>\n          </div>\n          <pre style={{color:'rgba(255,255,255,.5)',fontSize:'11px',whiteSpace:'pre-wrap'}}>{this.state.error.stack}</pre>\n        </div>",
  1)
with open('src/main.jsx', 'w') as f: f.write(c)
print("✅ src/main.jsx")

# --- App.jsx ---
with open('src/App.jsx', 'r') as f: c = f.read()
c = c.replace("import { AppPanels }",
  "import { OnboardingWizard }  from './components/OnboardingWizard.jsx';\nimport { ApiKeySettings }   from './components/ApiKeySettings.jsx';\nimport { loadRuntimeKeys }  from './runtimeKeys.js';\nimport { AppPanels }", 1)
c = c.replace("  const ui      = useUIStore();",
  "  const ui      = useUIStore();\n  const [showApiKeys, setShowApiKeys] = React.useState(false);\n  const [onboarded,   setOnboarded]   = React.useState(true);", 1)
c = c.replace("    callServer({type:'ping'}).then(r => {",
  "    loadRuntimeKeys();\n    callServer({type:'ping'}).then(r => {", 1)
c = c.replace("      ui.loadUIPrefs({theme:th.value",
  "      if (!ob.value) setOnboarded(false);\n      ui.loadUIPrefs({theme:th.value", 1)
c = c.replace(
  "  useEffect(() => {\n    const iv = setInterval(async () => {\n      const r = await callServer({type:'ping'});\n      project.setServerOk(r.ok);\n      project.setReconnectTimer(t => r.ok ? 0 : t + 5);\n    }, 5000);\n    return () => clearInterval(iv);\n  }, []); // eslint-disable-line react-hooks/exhaustive-deps",
  "  useEffect(() => {\n    let delay = 5000;\n    let tid;\n    async function doPing() {\n      const r = await callServer({type:'ping'}).catch(()=>({ok:false}));\n      project.setServerOk(r.ok);\n      if (r.ok) { delay = 5000; project.setReconnectTimer(0); }\n      else { project.setReconnectTimer(t => t + Math.round(delay/1000)); delay = Math.min(delay*2, 60000); }\n      tid = setTimeout(doPing, delay);\n    }\n    doPing();\n    return () => clearTimeout(tid);\n  }, []); // eslint-disable-line react-hooks/exhaustive-deps",
  1)
c = c.replace("      {ui.showProjectManager && (",
  "      {!onboarded && <OnboardingWizard T={T} onDone={()=>setOnboarded(true)} />}\n      {showApiKeys && <ApiKeySettings T={T} onClose={()=>setShowApiKeys(false)} />}\n\n      {ui.showProjectManager && (", 1)
with open('src/App.jsx', 'w') as f: f.write(c)
print("✅ src/App.jsx")
PYEOF

echo ""
echo "✅ Done! 4 features applied:"
echo "   1. 🔑 API Key UI     — ApiKeySettings (panggil setShowApiKeys(true) dari header/settings)"
echo "   2. 🌸 Onboarding     — OnboardingWizard auto-tampil di first run"  
echo "   3. 🔄 Reconnect backoff — 5s → 10s → 20s → ... → 60s max"
echo "   4. 💥 Crash log      — copy button + tersimpan di localStorage"
echo ""
echo "💡 Untuk buka API Key settings, expose setShowApiKeys lewat prop ke AppHeader"
echo "   atau tambah slash command /apikeys di useSlashCommands.js"
