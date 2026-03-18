import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{position:'fixed',inset:0,background:'#0d0d0e',color:'#f87171',padding:'24px',fontFamily:'monospace',fontSize:'13px',overflowY:'auto'}}>
          <div style={{fontSize:'16px',fontWeight:'bold',marginBottom:'12px'}}>🔴 App Crash</div>
          <div style={{color:'#fbbf24',marginBottom:'8px'}}>{this.state.error.message}</div>
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
