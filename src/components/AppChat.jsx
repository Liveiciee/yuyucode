// ── AppChat ───────────────────────────────────────────────────────────────────
// Center area: tabs, chat view, file viewer, file editor, terminal,
// follow-up chips, quick bar, and composer input.
import React, { useRef, useEffect } from 'react';
import { Pin, Eye, ScrollText, Camera, Paperclip, Volume2, VolumeX } from 'lucide-react';
import { hl } from '../utils.js';
import { MsgBubble, MsgContent } from './MsgBubble.jsx';
import { FileEditor } from './FileEditor.jsx';
import { Terminal } from './Terminal.jsx';
import { VoiceBtn, PushToTalkBtn } from './VoiceBtn.jsx';
import { FOLLOW_UPS, SLASH_COMMANDS, GIT_SHORTCUTS } from '../constants.js';

export function AppChat({
  T, ui, project, file, chat,
  sendMsg, cancelMsg, retryLast, continueMsg,
  handleApprove, handlePlanApprove,
  handleCameraCapture, fileInputRef,
  runShortcut, stopTts,
  visibleMessages,
}) {
  const chatRef   = useRef(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [chat.messages, chat.streaming]);

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* TABS */}
      <div style={{display:'flex',borderBottom:'1px solid '+T.border,flexShrink:0,background:T.bg,height:'48px',alignItems:'center',padding:'0 8px',gap:'4px'}}>
        <button onClick={()=>file.setActiveTab('chat')}
          style={{padding:'0 14px',background:file.activeTab==='chat'?T.accentBg:'none',border:file.activeTab==='chat'?'1px solid '+T.accentBorder:'1px solid transparent',borderRadius:'8px',color:file.activeTab==='chat'?T.accent:T.textMute,fontSize:'13px',cursor:'pointer',fontWeight:file.activeTab==='chat'?'600':'400',minHeight:'36px',transition:'all .15s'}}>
          Chat
        </button>
        {file.selectedFile&&(
          <>
            <button onClick={()=>{file.setActiveTab('file');file.setEditMode(false);}}
              style={{padding:'0 12px',background:file.activeTab==='file'&&!file.editMode?T.bg3:'none',border:file.activeTab==='file'&&!file.editMode?'1px solid '+T.border:'1px solid transparent',borderRadius:'8px',color:file.activeTab==='file'&&!file.editMode?T.text:T.textMute,fontSize:'12px',cursor:'pointer',maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',minHeight:'36px',transition:'all .15s'}}>
              {file.selectedFile.split('/').pop()}
            </button>
            <button onClick={()=>{file.setActiveTab('file');file.setEditMode(true);}}
              style={{padding:'0 10px',background:file.editMode?'rgba(245,158,11,.1)':'none',border:file.editMode?'1px solid rgba(245,158,11,.25)':'1px solid transparent',borderRadius:'8px',color:file.editMode?'#f59e0b':T.textMute,fontSize:'11px',cursor:'pointer',minHeight:'36px',transition:'all .15s'}}>
              edit
            </button>
          </>
        )}
        <div style={{flex:1}}/>
        <button onClick={()=>ui.setShowTerminal(!ui.showTerminal)}
          style={{padding:'0 12px',background:ui.showTerminal?T.bg3:'none',border:ui.showTerminal?'1px solid '+T.border:'1px solid transparent',borderRadius:'8px',color:ui.showTerminal?T.textSec:T.textMute,fontSize:'13px',cursor:'pointer',fontFamily:'monospace',minHeight:'36px',transition:'all .15s'}}>
          $
        </button>
      </div>

      {/* CHAT */}
      {file.activeTab==='chat'&&!ui.showTerminal&&(
        <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'20px 0 8px'}}>
          <div style={{maxWidth:'720px',margin:'0 auto',padding:'0 4px'}}>
            {visibleMessages.map((m,i)=>(
              <MsgBubble key={i} msg={m} isLast={i===chat.messages.length-1} T={T}
                onApprove={m.actions?.some(a=>(a.type==='write_file'||a.type==='patch_file')&&!a.executed)?(ok,path)=>handleApprove(i,ok,path):null}
                onPlanApprove={m.content?.includes('📋 **Plan (')&&!m.planApproved?(ok)=>handlePlanApprove(i,ok):null}
                onRetry={i===chat.messages.length-1&&m.role==='user'?retryLast:null}
                onContinue={i===chat.messages.length-1&&m.role==='assistant'&&m.content.trim().endsWith('CONTINUE')?continueMsg:null}
                onAutoFix={i===chat.messages.length-1?()=>sendMsg('Ada error di output. Analisis dan fix otomatis.'):null}
                onDelete={()=>chat.deleteMessage(i)}
                onEdit={(newContent)=>chat.editMessage(i,newContent)}
              />
            ))}
            {chat.streaming&&(
              <div style={{padding:'2px 16px'}}>
                <div style={{maxWidth:'92%',fontSize:'14px',lineHeight:'1.7',color:'#e0e0e0'}}>
                  <MsgContent text={chat.streaming}/>
                  <span style={{display:'inline-block',width:'2px',height:'14px',background:'rgba(255,255,255,.6)',marginLeft:'2px',verticalAlign:'middle',animation:'blink 1s infinite'}}/>
                </div>
              </div>
            )}
            {chat.loading&&!chat.streaming&&<div style={{padding:'2px 16px'}}><div style={{color:T.textMute,fontSize:'13px'}}>Yuyu lagi mikir···</div></div>}
            <div ref={bottomRef}/>
          </div>
        </div>
      )}

      {/* FILE VIEWER */}
      {file.activeTab==='file'&&file.selectedFile&&!file.editMode&&!ui.showTerminal&&(
        <div style={{flex:1,overflow:'auto'}}>
          <div style={{height:'44px',padding:'0 12px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'6px',background:T.bg2,position:'sticky',top:0}}>
            <span style={{fontSize:'11px',color:T.textMute,fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.selectedFile}</span>
            {[
              {label:<Pin size={12}/>,active:file.pinnedFiles.includes(file.selectedFile),color:T.accent,bg:T.accentBg,border:T.accentBorder,onClick:()=>file.togglePin(file.selectedFile)},
              {label:<Eye size={12}/>,active:false,color:T.textSec,bg:T.bg3,border:T.border,onClick:()=>ui.setShowBlame(true)},
              {label:<ScrollText size={12}/>,active:false,color:T.textSec,bg:T.bg3,border:T.border,onClick:()=>ui.setShowFileHistory(true)},
              {label:'+ctx',active:false,color:T.success,bg:T.successBg,border:T.success+'33',onClick:()=>{chat.setMessages(m=>[...m,{role:'user',content:'Yu, ini konteks file '+file.selectedFile+':\n```\n'+(file.fileContent||'').slice(0,2000)+'\n```'}]);file.setActiveTab('chat');}},
              {label:'Tanya',active:false,color:T.accent,bg:T.accentBg,border:T.accentBorder,onClick:()=>sendMsg('Yu, jelaskan file '+file.selectedFile)},
            ].map((b,i)=>(
              <button key={i} onClick={b.onClick}
                style={{background:b.active?b.bg:T.bg3,border:'1px solid '+(b.active?b.border:T.border),borderRadius:'8px',padding:'5px 10px',color:b.active?b.color:T.textSec,fontSize:'11px',cursor:'pointer',flexShrink:0,minHeight:'32px',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=b.bg;e.currentTarget.style.borderColor=b.border;e.currentTarget.style.color=b.color;}}
                onMouseLeave={e=>{e.currentTarget.style.background=b.active?b.bg:T.bg3;e.currentTarget.style.borderColor=b.active?b.border:T.border;e.currentTarget.style.color=b.active?b.color:T.textSec;}}>
                {b.label}
              </button>
            ))}
            <button onClick={()=>{file.setSelectedFile(null);file.setFileContent(null);file.setActiveTab('chat');}}
              style={{background:'none',border:'none',color:T.textMute,fontSize:'16px',cursor:'pointer',flexShrink:0,minWidth:'32px',minHeight:'32px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'8px'}}
              onMouseEnter={e=>e.currentTarget.style.color=T.text}
              onMouseLeave={e=>e.currentTarget.style.color=T.textMute}>×</button>
          </div>
          <div style={{display:'flex',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6'}}>
            <div style={{padding:'8px 6px',color:T.textMute,textAlign:'right',userSelect:'none',borderRight:'1px solid '+T.border,minWidth:'36px',flexShrink:0,background:T.bg3}}>
              {(file.fileContent||'').split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
            </div>
            <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:T.textSec,flex:1}} dangerouslySetInnerHTML={{__html:hl(file.fileContent||'',file.selectedFile?.split('.').pop()||'')}}/>
          </div>
        </div>
      )}

      {/* FILE EDITOR */}
      {file.activeTab==='file'&&file.selectedFile&&file.editMode&&!ui.showTerminal&&(
        <div style={{flex:1,overflow:'hidden',display:'flex'}}>
          {file.splitView?(
            <>
              <div style={{flex:1,overflow:'hidden',borderRight:'1px solid '+T.border}}>
                <FileEditor T={T} path={file.selectedFile} content={file.fileContent||''} onSave={c=>file.saveFile(c,msg=>chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}]))} onClose={()=>file.setEditMode(false)}/>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
                {chat.messages.slice(-10).map((m,i)=>(
                  <div key={i} style={{padding:'4px 12px'}}>
                    <div style={{fontSize:'10px',color:T.textMute,marginBottom:'2px'}}>{m.role==='user'?'Papa':'Yuyu'}</div>
                    <div style={{fontSize:'12px',color:T.textSec,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{m.content.replace(/```action[\s\S]*?```/g,'').slice(0,300)}</div>
                  </div>
                ))}
              </div>
            </>
          ):(
            <FileEditor T={T} path={file.selectedFile} content={file.fileContent||''} onSave={c=>file.saveFile(c,msg=>chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}]))} onClose={()=>file.setEditMode(false)}/>
          )}
        </div>
      )}

      {/* TERMINAL */}
      {ui.showTerminal&&<div style={{flex:1,overflow:'hidden'}}><Terminal folder={project.folder} cmdHistory={project.cmdHistory} addHistory={project.addHistory} T={T} onSendToAI={txt=>{ui.setShowTerminal(false);file.setActiveTab('chat');sendMsg(txt);}}/></div>}

      {/* FOLLOW UPS */}
      {chat.showFollowUp&&!chat.loading&&file.activeTab==='chat'&&!ui.showTerminal&&(
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap',padding:'6px 14px 8px',flexShrink:0}}>
          {FOLLOW_UPS.map(p=>(
            <button key={p} onClick={()=>sendMsg(p)}
              style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'20px',padding:'6px 14px',color:T.textMute,fontSize:'12px',cursor:'pointer',minHeight:'34px',transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.background=T.accentBg;e.currentTarget.style.borderColor=T.accentBorder;e.currentTarget.style.color=T.accent;}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.bg3;e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMute;}}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* QUICK BAR */}
      {!ui.showTerminal&&(
        <div style={{height:'40px',padding:'0 10px',borderTop:'1px solid '+T.borderSoft,display:'flex',alignItems:'center',gap:'2px',flexShrink:0,overflowX:'auto',background:T.bg}}>
          {GIT_SHORTCUTS.map(s=>(
            <button key={s.label} disabled={chat.loading}
              onClick={()=>{ if(s.cmd.includes('yugit.cjs')){ui.setCommitMsg('');ui.setCommitModal(true);}else{runShortcut(s.cmd);} }}
              style={{background:'none',border:'none',padding:'4px 10px',color:T.textMute,fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',borderRadius:'6px',display:'flex',alignItems:'center',gap:'4px',minHeight:'32px',flexShrink:0}}
              onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <span style={{opacity:.5,fontSize:'10px'}}>{s.icon}</span><span>{s.label}</span>
            </button>
          ))}
          <div style={{flex:1}}/>
          {file.pinnedFiles.map(f=>(
            <button key={f} onClick={()=>file.openFile(f)}
              style={{background:T.accentBg,border:'none',borderRadius:'6px',padding:'3px 8px',color:T.accent,fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',minHeight:'28px',opacity:.7}}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'}
              onMouseLeave={e=>e.currentTarget.style.opacity='.7'}>
              {f.split('/').pop()}
            </button>
          ))}
        </div>
      )}

      {/* INPUT COMPOSER */}
      {!ui.showTerminal&&(
        <div style={{padding:'8px 12px',paddingBottom:'calc(8px + env(safe-area-inset-bottom, 0px))',background:T.bg,flexShrink:0,position:'relative'}}>
          {chat.slashSuggestions.length>0&&(
            <div style={{position:'absolute',bottom:'100%',left:'12px',right:'12px',background:T.bg2,border:'1px solid '+T.border,borderRadius:'14px',zIndex:99,marginBottom:'6px',boxShadow:'0 16px 40px rgba(0,0,0,.7)',maxHeight:'280px',overflowY:'auto'}}>
              {chat.slashSuggestions.map(s=>(
                <div key={s.cmd} onClick={()=>{chat.setInput(s.cmd);chat.setSlashSuggestions([]);inputRef.current?.focus();}}
                  style={{display:'flex',gap:'12px',padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid '+T.borderSoft,alignItems:'center',minHeight:'44px'}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{color:T.accent,fontFamily:'monospace',fontSize:'13px',flexShrink:0,minWidth:'110px',fontWeight:'500'}}>{s.cmd}</span>
                  <span style={{color:T.textMute,fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.desc}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{background:T.bg2,border:'1px solid '+T.border,borderRadius:'20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,.25)',transition:'border-color .15s'}}
            onFocusCapture={e=>{e.currentTarget.style.borderColor=T.accentBorder;}}
            onBlurCapture={e=>{e.currentTarget.style.borderColor=T.border;}}>
            {chat.visionImage&&(
              <div style={{padding:'10px 14px 0',display:'flex'}}>
                <div style={{position:'relative',display:'inline-block'}}>
                  <img src={'data:image/jpeg;base64,'+chat.visionImage} alt="attached"
                    style={{width:'52px',height:'52px',borderRadius:'10px',objectFit:'cover',border:'1px solid '+T.accentBorder+'55',display:'block'}}/>
                  <button onClick={()=>chat.setVisionImage(null)}
                    style={{position:'absolute',top:'-5px',right:'-5px',background:T.bg,border:'1px solid '+T.border,borderRadius:'50%',width:'16px',height:'16px',color:T.textMute,fontSize:'9px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,lineHeight:1}}>×</button>
                </div>
              </div>
            )}
            <textarea ref={inputRef} value={chat.input}
              onChange={e=>{
                chat.setInput(e.target.value);
                e.target.style.height='auto';
                e.target.style.height=Math.min(e.target.scrollHeight,160)+'px';
                if(e.target.value.startsWith('/')) chat.setSlashSuggestions(SLASH_COMMANDS.filter(s=>s.cmd.startsWith(e.target.value)));
                else chat.setSlashSuggestions([]);
              }}
              onKeyDown={e=>{
                if(e.key==='ArrowUp'&&!chat.input){const i=Math.min(project.histIdx+1,project.cmdHistory.length-1);project.setHistIdx(i);chat.setInput(project.cmdHistory[i]||'');}
                if(e.key==='ArrowDown'&&project.histIdx>-1){const i=project.histIdx-1;project.setHistIdx(i);chat.setInput(i>=0?project.cmdHistory[i]:'');}
              }}
              placeholder="Tanya Yuyu, atau / untuk commands"
              disabled={chat.loading} rows={1}
              style={{width:'100%',background:'transparent',border:'none',outline:'none',resize:'none',padding:'12px 16px 4px',color:chat.loading?T.textMute:T.text,fontSize:'14px',fontFamily:'inherit',lineHeight:'1.6',display:'block',boxSizing:'border-box'}}
            />
            <div style={{display:'flex',alignItems:'center',padding:'4px 8px 8px',gap:'2px'}}>
              <button onClick={handleCameraCapture} title="Kamera"
                style={{background:'none',border:'none',color:T.textMute,cursor:'pointer',borderRadius:'10px',width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'color .15s,background .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=T.bg3;e.currentTarget.style.color=T.textSec;}}
                onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color=T.textMute;}}
              ><Camera size={16}/></button>
              <button onClick={()=>fileInputRef.current?.click()} title="Lampirkan"
                style={{background:'none',border:'none',color:T.textMute,cursor:'pointer',borderRadius:'10px',width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'color .15s,background .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=T.bg3;e.currentTarget.style.color=T.textSec;}}
                onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color=T.textMute;}}
              ><Paperclip size={16}/></button>
              <div style={{flex:1}}/>
              <VoiceBtn disabled={chat.loading} T={T} onResult={txt=>{chat.setInput(i=>i?i+' '+txt:txt);inputRef.current?.focus();}}/>
              {project.pushToTalk&&<PushToTalkBtn onResult={v=>{ if(v?.trim()) { chat.setInput(''); sendMsg(v.trim()); } else { chat.setInput(v); } }} disabled={chat.loading} T={T}/>}
              <button onClick={()=>{if(chat.ttsEnabled){stopTts();chat.setTtsEnabled(false);}else chat.setTtsEnabled(true);}} title={chat.ttsEnabled?'TTS aktif':'TTS mati'}
                style={{background:chat.ttsEnabled?T.accentBg:'none',border:'none',borderRadius:'10px',width:'34px',height:'34px',color:chat.ttsEnabled?T.accent:T.textMute,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
                {chat.ttsEnabled?<Volume2 size={15}/>:<VolumeX size={15}/>}
              </button>
              {chat.loading
                ?<button onClick={cancelMsg} title="Batalkan"
                    style={{background:T.errorBg,border:'none',borderRadius:'12px',color:T.error,cursor:'pointer',flexShrink:0,width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',marginLeft:'4px'}}>■</button>
                :<button onClick={()=>sendMsg()} title="Kirim"
                    style={{background:chat.input.trim()?T.accent:'rgba(255,255,255,.08)',border:'none',borderRadius:'12px',color:chat.input.trim()?'white':T.textMute,cursor:chat.input.trim()?'pointer':'default',flexShrink:0,width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',marginLeft:'4px',transition:'background .15s,color .15s'}}>↑</button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
