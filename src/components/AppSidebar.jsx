// ── AppSidebar ────────────────────────────────────────────────────────────────
import React from 'react';
import { FileTree } from './FileTree.jsx';
import { Pin } from 'lucide-react';

export function AppSidebar({ T, ui, project, file, onSidebarDragStart }) {
  if (!ui.showSidebar) return null;
  return (
    <>
      <div onClick={()=>ui.setShowSidebar(false)}
        style={{position:'absolute',inset:0,zIndex:19,background:T.bg+'aa',backdropFilter:'blur(2px)'}}/>
      <div style={{position:'absolute',top:0,left:0,bottom:0,width:ui.sidebarWidth+'px',borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',background:T.bg2,zIndex:20}}>

        {/* Header — folder path + server dot */}
        <div style={{padding:'8px 10px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'6px',flexShrink:0}}>
          <span style={{display:'inline-block',width:'5px',height:'5px',borderRadius:'50%',background:project.serverOk?T.success:T.error,flexShrink:0}}/>
          <span style={{fontSize:'10px',color:T.textMute,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'monospace'}}>
            {project.folder||'no folder'}
          </span>
        </div>

        {/* Pinned files */}
        {file.pinnedFiles?.length > 0 && (
          <div style={{padding:'6px 8px',borderBottom:'1px solid '+T.border,flexShrink:0}}>
            <div style={{fontSize:'9px',color:T.textMute,marginBottom:'4px',letterSpacing:'.07em',display:'flex',alignItems:'center',gap:'4px'}}>
              <Pin size={8}/> PINNED
            </div>
            {file.pinnedFiles.map(f=>(
              <div key={f}
                onClick={()=>{file.openFile(f);ui.setShowSidebar(false);}}
                style={{fontSize:'11px',color:T.accent,padding:'3px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'4px',display:'flex',alignItems:'center',gap:'5px'}}
                onMouseEnter={e=>e.currentTarget.style.background=T.accentBg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <Pin size={8} style={{flexShrink:0,opacity:.6}}/>
                {f.split('/').pop()}
              </div>
            ))}
          </div>
        )}

        {/* Recent files */}
        {file.recentFiles.length > 0 && (
          <div style={{padding:'6px 8px',borderBottom:'1px solid '+T.border,flexShrink:0}}>
            <div style={{fontSize:'9px',color:T.textMute,marginBottom:'4px',letterSpacing:'.07em'}}>RECENT</div>
            {file.recentFiles.slice(0,4).map(f=>(
              <div key={f} onClick={()=>{file.openFile(f);ui.setShowSidebar(false);}}
                style={{fontSize:'11px',color:T.textMute,padding:'3px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'4px'}}
                onMouseEnter={e=>e.currentTarget.style.color=T.text}
                onMouseLeave={e=>e.currentTarget.style.color=T.textMute}>
                {f.split('/').pop()}
              </div>
            ))}
          </div>
        )}

        {/* File tree */}
        <div style={{flex:1,overflow:'hidden'}}>
          <FileTree folder={project.folder} onSelectFile={p=>{file.openFile(p);ui.setShowSidebar(false);}} selectedFile={file.selectedFile} T={T}/>
        </div>

        {/* Drag handle */}
        <div onMouseDown={onSidebarDragStart} onTouchStart={onSidebarDragStart}
          style={{position:'absolute',top:0,right:-3,bottom:0,width:'6px',cursor:'col-resize',background:ui.dragging?T.accentBg:'transparent'}}/>
      </div>
    </>
  );
}
