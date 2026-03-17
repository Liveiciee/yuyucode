import React from 'react'
import { createRoot } from 'react-dom/client'

window.onerror = (msg,src,line,col,err) => {
  document.body.style.background='red';
  document.body.innerHTML='<pre style="color:white;padding:20px;font-size:11px">'+msg+'\n'+src+':'+line+'</pre>';
};
window.onunhandledrejection = (e) => {
  document.body.style.background='orange';
  document.body.innerHTML='<pre style="color:black;padding:20px;font-size:11px">'+(e.reason?.stack||e.reason)+'</pre>';
};

createRoot(document.getElementById('root')).render(
  <div style={{color:'lime',background:'black',padding:'20px',fontSize:'20px'}}>
    React OK — loading App...
  </div>
);

setTimeout(()=>{
  import('./App.jsx').then(({default:App})=>{
    createRoot(document.getElementById('root')).render(<App/>);
  }).catch(e=>{
    document.body.style.background='purple';
    document.body.innerHTML='<pre style="color:white;padding:20px;font-size:11px">IMPORT FAIL:\n'+e.message+'\n'+e.stack+'</pre>';
  });
},100);
