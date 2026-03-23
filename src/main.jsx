import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null, copied: false }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(error, info) {
    const log = JSON.stringify({ ts: new Date().toISOString(), msg: error.message, stack: error.stack, component: info?.componentStack?.slice(0,400) }, null, 2);
    try { localStorage.setItem('yuyu_last_crash', log); } catch(_e) {}
  }
  render() {
    if (this.state.error) {
      const log = `[${new Date().toISOString()}]\n${this.state.error.message}\n\n${this.state.error.stack}`;
      return (
        <div style={{position:'fixed',inset:0,background:'#0d0d0e',color:'#f87171',padding:'24px',fontFamily:'monospace',fontSize:'13px',overflowY:'auto'}}>
          <div style={{fontSize:'16px',fontWeight:'bold',marginBottom:'12px'}}>🔴 App Crash</div>
          <div style={{color:'#fbbf24',marginBottom:'8px'}}>{this.state.error.message}</div>
          <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
            <button onClick={()=>{navigator.clipboard?.writeText(log);this.setState({copied:true});setTimeout(()=>this.setState({copied:false}),2000);}}
              style={{background:'#1a1a1e',border:'1px solid #333',borderRadius:'6px',color:this.state.copied?'#4ade80':'#a78bfa',padding:'6px 12px',cursor:'pointer',fontSize:'12px'}}>
              {this.state.copied ? '✅ Copied' : '📋 Copy log'}
            </button>
            <button onClick={()=>window.location.reload()}
              style={{background:'#1a1a1e',border:'1px solid #333',borderRadius:'6px',color:'#fbbf24',padding:'6px 12px',cursor:'pointer',fontSize:'12px'}}>
              🔄 Reload
            </button>
          </div>
          <pre style={{color:'rgba(255,255,255,.5)',fontSize:'11px',whiteSpace:'pre-wrap'}}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)

