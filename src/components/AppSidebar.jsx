// ── AppSidebar ────────────────────────────────────────────────────────────────
// Overlay sidebar: backdrop, file tree, recent files, resize handle.
import React from 'react';
import { FileTree } from './FileTree.jsx';

export function AppSidebar({ T, ui, project, file, onSidebarDragStart }) {
  if (!ui.showSidebar) return null;
  return (
    <>
      <div onClick={()=>ui.setShowSidebar(false)}
        style={{position:'absolute',inset:0,zIndex:19,background:T.bg+'aa',backdropFilter:'blur(2px)'}}/>
      <div style={{position:'absolute',top:0,left:0,bottom:0,width:ui.sidebarWidth+'px',borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',background:T.bg2,zIndex:20}}>
        <div style={{padding:'5px 8px',borderBottom:'1px solid '+T.border,display:'flex',gap:'4px',alignItems:'center'}}>
          <span style={{fontSize:'10px',color:T.textMute,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.folder}</span>
        </div>
        {file.recentFiles.length>0&&(
          <div style={{padding:'4px 8px',borderBottom:'1px solid '+T.border}}>
            <div style={{fontSize:'9px',color:T.textMute,marginBottom:'3px',letterSpacing:'.05em'}}>RECENT</div>
            {file.recentFiles.slice(0,4).map(f=>(
              <div key={f} onClick={()=>{file.openFile(f);ui.setShowSidebar(false);}}
                style={{fontSize:'11px',color:T.textMute,padding:'2px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'3px'}}
                onMouseEnter={e=>e.currentTarget.style.color=T.text}
                onMouseLeave={e=>e.currentTarget.style.color=T.textMute}>
                {f.split('/').pop()}
              </div>
            ))}
          </div>
        )}
        <div style={{flex:1,overflow:'hidden'}}>
          <FileTree folder={project.folder} onSelectFile={p=>{file.openFile(p);ui.setShowSidebar(false);}} selectedFile={file.selectedFile} T={T}/>
        </div>
        <div onMouseDown={onSidebarDragStart} onTouchStart={onSidebarDragStart}
          style={{position:'absolute',top:0,right:-3,bottom:0,width:'6px',cursor:'col-resize',background:ui.dragging?T.accentBg:'transparent'}}/>
      </div>
    </>
  );
}
