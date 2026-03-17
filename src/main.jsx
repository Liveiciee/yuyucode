import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = '<pre style="color:red;padding:20px;font-size:11px;white-space:pre-wrap">CRASH:\n'+msg+'\n'+src+':'+line+'\n'+(err&&err.stack||'')+'</pre>';
};
window.onunhandledrejection = (e) => {
  document.body.innerHTML = '<pre style="color:orange;padding:20px;font-size:11px;white-space:pre-wrap">PROMISE CRASH:\n'+(e.reason?.stack||e.reason)+'</pre>';
};

createRoot(document.getElementById('root')).render(<App />)
