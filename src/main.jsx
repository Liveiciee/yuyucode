import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class EB extends React.Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return {err:e};}
  render(){
    if(this.state.err) return React.createElement('div',
      {style:{color:'red',padding:'20px',fontFamily:'monospace',fontSize:'12px',whiteSpace:'pre-wrap'}},
      'CRASH: '+this.state.err.message+'

'+this.state.err.stack
    );
    return this.props.children;
  }
}

import React from 'react'
createRoot(document.getElementById('root')).render(
  React.createElement(EB, null, React.createElement(App))
)
