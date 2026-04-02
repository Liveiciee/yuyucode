// ── AppPanels ─────────────────────────────────────────────────────────────────
import React, { Fragment } from 'react';
import { Trash2, Brain, MapPin, Plus, Zap, X } from 'lucide-react';
import { loadSessions, getBgAgents, mergeBackgroundAgent, abortBgAgent } from '../features.js';
import { callServer } from '../api.js';
import { MODELS } from '../constants.js';
import { SearchBar } from './SearchBar.jsx';
import {
  BottomSheet, CommandPalette,
  GitComparePanel, FileHistoryPanel, GitBlamePanel, SnippetLibrary, CustomActionsPanel,
  ShortcutsPanel, ThemeBuilder, DepGraphPanel, ElicitationPanel, MergeConflictPanel,
  SkillsPanel, DeployPanel, McpPanel, GitHubPanel, SessionsPanel,
  PermissionsPanel, PluginsPanel, ConfigPanel, BgAgentPanel,
} from './panels.jsx';

export function AppPanels({
  T, ui, project, file, chat,
  sendMsg, compactContext, runShortcut,
  fetchGitHub, runDeploy, runTests, generateCommitMsg,
  haptic, saveCheckpoint, restoreCheckpoint,
  fileInputRef, handleImageAttach,
}) {
  return (
    <>
      {/* Search */}
      {ui.showSearch&&<SearchBar T={T} folder={project.folder} onSelectFile={p=>file.openFile(p)} onClose={()=>ui.setShowSearch(false)}/>}

      {/* Light overlays */}
      {ui.showShortcuts&&<ShortcutsPanel T={T} onClose={()=>ui.setShowShortcuts(false)}/>}
      {ui.showDiff&&<GitComparePanel folder={project.folder} T={T} onClose={()=>ui.setShowDiff(false)}/>}
      {ui.showBlame&&file.selectedFile&&<GitBlamePanel T={T} folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowBlame(false)}/>}
      {ui.showSnippets&&<SnippetLibrary T={T} onInsert={code=>{chat.setInput(i=>i?i+'\n'+code:code);ui.setShowSnippets(false);}} onClose={()=>ui.setShowSnippets(false)}/>}
      {ui.showFileHistory&&file.selectedFile&&<FileHistoryPanel T={T} folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowFileHistory(false)}/>}
      {ui.showCustomActions&&<CustomActionsPanel T={T} folder={project.folder} onRun={cmd=>runShortcut(cmd)} onClose={()=>ui.setShowCustomActions(false)}/>}

      {/* Command Palette */}
      {ui.showPalette&&(
        <CommandPalette T={T} onClose={()=>ui.setShowPalette(false)}
          folder={project.folder} memories={chat.memories} checkpoints={chat.checkpoints} model={project.model} models={MODELS}
          onModelChange={id=>project.setModel(id)}
          onNewChat={()=>chat.clearChat()}
          theme={ui.theme} onThemeChange={t=>ui.setTheme(t)}
          showSidebar={ui.showSidebar} onToggleSidebar={()=>ui.setShowSidebar(s=>!s)}
          onShowMemory={()=>ui.setShowMemory(true)} onShowCheckpoints={()=>ui.setShowCheckpoints(true)}
          onShowMCP={()=>ui.setShowMCP(true)} onShowGitHub={()=>ui.setShowGitHub(true)} onShowDeploy={()=>ui.setShowDeploy(true)}
          onShowSessions={()=>{loadSessions().then(s=>{ui.setSessionList(s);ui.setShowSessions(true);});}}
          onShowPermissions={()=>ui.setShowPermissions(true)} onShowPlugins={()=>ui.setShowPlugins(true)} onShowConfig={()=>ui.setShowConfig(true)}
          onShowSkills={()=>ui.setShowSkills(true)}
          onShowDiff={()=>ui.setShowDiff(true)} onShowSearch={()=>ui.setShowSearch(true)}
          onShowSnippets={()=>ui.setShowSnippets(true)} onShowCustomActions={()=>ui.setShowCustomActions(true)}
          runTests={runTests} generateCommitMsg={generateCommitMsg} exportChat={chat.exportChat} compactContext={compactContext}
        />
      )}

      {/* Memory */}
      {ui.showMemory&&(
        <BottomSheet onClose={()=>ui.setShowMemory(false)} T={T}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'14px'}}>
              <span style={{fontSize:'13px',fontWeight:'600',color:T.text,flex:1,display:'flex',alignItems:'center',gap:'6px'}}><Brain size={13} style={{color:T.accent}}/> Auto Memories <span style={{color:T.textMute,fontWeight:'400'}}>({chat.memories.length})</span></span>
              <button onClick={()=>chat.setMemories([])} style={{background:T.errorBg,border:'1px solid '+T.error+'33',borderRadius:'8px',padding:'4px 10px',color:T.error,fontSize:'11px',cursor:'pointer',marginRight:'8px',display:'flex',alignItems:'center',gap:'4px'}}><Trash2 size={10}/> Clear</button>
              <button onClick={()=>ui.setShowMemory(false)} style={{background:'none',border:'none',color:T.textMute,fontSize:'18px',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'6px'}}>
              {chat.memories.length===0&&<div style={{color:T.textMute,fontSize:'12px',textAlign:'center',padding:'24px 0'}}>Belum ada memories~</div>}
              {chat.memories.map(m=>(
                <div key={m.id} style={{display:'flex',gap:'8px',padding:'10px 12px',background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px',alignItems:'flex-start'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12.5px',color:T.text,lineHeight:'1.5'}}>{m.text}</div>
                    <div style={{fontSize:'10px',color:T.textMute,marginTop:'4px'}}>{m.folder} · {m.ts}</div>
                  </div>
                  <button onClick={()=>chat.setMemories(chat.memories.filter(x=>x.id!==m.id))} style={{background:'none',border:'none',color:T.error,opacity:.5,fontSize:'14px',cursor:'pointer',flexShrink:0,padding:'0 2px',lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='.5'}>×</button>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Checkpoints */}
      {ui.showCheckpoints&&(
        <BottomSheet onClose={()=>ui.setShowCheckpoints(false)} T={T}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'14px'}}>
              <span style={{fontSize:'13px',fontWeight:'600',color:T.text,flex:1,display:'flex',alignItems:'center',gap:'6px'}}><MapPin size={13} style={{color:T.accent}}/> Checkpoints <span style={{color:T.textMute,fontWeight:'400'}}>({chat.checkpoints.length})</span></span>
              <button onClick={saveCheckpoint} style={{background:T.accentBg,border:'1px solid '+T.accentBorder,borderRadius:'8px',padding:'4px 10px',color:T.accent,fontSize:'11px',cursor:'pointer',marginRight:'8px',display:'flex',alignItems:'center',gap:'4px'}}><Plus size={10}/> Save</button>
              <button onClick={()=>ui.setShowCheckpoints(false)} style={{background:'none',border:'none',color:T.textMute,fontSize:'18px',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {chat.checkpoints.length===0&&<div style={{color:T.textMute,fontSize:'12px'}}>Belum ada checkpoint~</div>}
              {chat.checkpoints.map(cp=>(
                <div key={cp.id} style={{display:'flex',gap:'8px',alignItems:'center',padding:'10px 12px',marginBottom:'6px',background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'12px',color:T.text}}>{cp.label}</div>
                    <div style={{fontSize:'10px',color:T.textMute}}>{cp.folder} · {cp.messages.length} pesan</div>
                  </div>
                  <button onClick={()=>restoreCheckpoint(cp)} style={{background:T.accentBg,border:'1px solid '+T.accentBorder,borderRadius:'5px',padding:'2px 8px',color:T.accent,fontSize:'10px',cursor:'pointer'}}>restore</button>
                  <button onClick={()=>chat.setCheckpoints(chat.checkpoints.filter(x=>x.id!==cp.id))} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Swarm log */}
      {chat.swarmRunning&&(
        <div style={{position:'fixed',bottom:'80px',right:'12px',background:T.bg2,border:'1px solid '+T.accentBorder,borderRadius:'10px',padding:'12px',zIndex:98,maxWidth:'280px',maxHeight:'200px',overflowY:'auto'}}>
          <div style={{fontSize:'11px',fontWeight:'600',color:T.accent,marginBottom:'6px'}}><Zap size={13}/> Agent Swarm Running···</div>
          {chat.swarmLog.map((l,i)=><div key={i} style={{fontSize:'10px',color:T.textSec,marginBottom:'2px'}}>{l}</div>)}
        </div>
      )}

      {ui.showDepGraph&&ui.depGraph&&<DepGraphPanel T={T} depGraph={ui.depGraph} onClose={()=>ui.setShowDepGraph(false)}/>}

      {ui.elicitationData&&(
        <ElicitationPanel T={T} data={ui.elicitationData}
          onSubmit={result=>{ui.setElicitationData(null);sendMsg(result);}}
          onDismiss={()=>ui.setElicitationData(null)}/>
      )}

      {ui.showMergeConflict&&ui.mergeConflictData&&(
        <MergeConflictPanel T={T} data={ui.mergeConflictData} folder={project.folder}
          onResolved={strategy=>{ui.setShowMergeConflict(false);ui.setMergeConflictData(null);chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Konflik resolved via **'+strategy+'**.',actions:[]}]);}}
          onAborted={()=>{ui.setShowMergeConflict(false);ui.setMergeConflictData(null);chat.setMessages(m=>[...m,{role:'assistant',content:'↩ Merge dibatalkan.',actions:[]}]);}}
          onClose={()=>ui.setShowMergeConflict(false)}/>
      )}

      {ui.showThemeBuilder&&<ThemeBuilder T={T} themeKey={ui.theme} themesMap={ui.THEMES_MAP} themeKeys={ui.THEME_KEYS} onTheme={t=>ui.setTheme(t)} onClose={()=>ui.setShowThemeBuilder(false)}/>}

      {/* Onboarding → redirect ke ProjectManager */}
      {ui.showOnboarding&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:T.bg,zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🌸</div>
          <div style={{fontSize:'22px',fontWeight:'700',color:T.text,marginBottom:'8px'}}>Halo! Yuyu siap~</div>
          <div style={{fontSize:'13px',color:T.textSec,marginBottom:'32px',textAlign:'center',lineHeight:'1.6',maxWidth:'280px'}}>
            Mulai dengan membuka project folder yang ada,<br/>atau buat project baru.
          </div>
          <button onClick={()=>{ui.setShowOnboarding(false);ui.setShowProjectManager(true);haptic('medium');}}
            style={{background:T.accent,border:'none',borderRadius:'12px',padding:'14px 32px',color:'white',fontSize:'15px',cursor:'pointer',fontWeight:'700',marginBottom:'16px',minWidth:'200px'}}>
            Buka / Buat Project
          </button>
          <div style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'8px',padding:'10px 16px',fontFamily:'monospace',fontSize:'11px',color:T.success,maxWidth:'320px',width:'100%',marginTop:'8px'}}>
            <div style={{color:T.textMute,fontSize:'10px',marginBottom:'4px'}}>💡 Pastikan server jalan:</div>
            node ~/yuyu-server.cjs &
          </div>
        </div>
      )}

      {/* Panels */}
      {ui.showMCP&&(<McpPanel T={T} mcpTools={project.mcpTools} folder={project.folder}
        onResult={async(tool,act)=>{const r=await callServer({type:'mcp',tool,action:act,params:{path:project.folder}});chat.setMessages(m=>[...m,{role:'assistant',content:`🔌 ${tool}/${act}:\n\`\`\`\n${(r.data||'').slice(0,1000)}\n\`\`\``,actions:[]}]);ui.setShowMCP(false);}}
        onClose={()=>ui.setShowMCP(false)}/>)}

      {ui.showGitHub&&(<GitHubPanel T={T} githubRepo={project.githubRepo} githubToken={project.githubToken} githubData={project.githubData}
        onRepoChange={v=>project.setGithubRepo(v)} onTokenChange={v=>project.setGithubToken(v)}
        onFetch={fetchGitHub}
        onAskYuyu={item=>{chat.setMessages(m=>[...m,{role:'user',content:'Bantu fix issue: #'+item.number+' '+item.title+'\n\n'+item.body?.slice(0,300)}]);ui.setShowGitHub(false);}}
        onClose={()=>ui.setShowGitHub(false)}/>)}

      {ui.showSessions&&(<SessionsPanel T={T} sessions={ui.sessionList}
        onRestore={s=>{chat.setMessages(s.messages||[]);project.setFolder(s.folder||'');project.setFolderInput(s.folder||'');ui.setShowSessions(false);chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Sesi **'+s.name+'** dipulihkan.',actions:[]}]);}}
        onClose={()=>ui.setShowSessions(false)}/>)}

      {ui.showPermissions&&(<PermissionsPanel T={T} permissions={project.permissions} accentColor={T.accent}
        onToggle={tool=>project.setPermissions({...project.permissions,[tool]:!project.permissions[tool]})}
        onReset={()=>project.setPermissions({read_file:true,write_file:true,exec:true,list_files:true,search:true,mcp:false,delete_file:false,browse:false})}
        onClose={()=>ui.setShowPermissions(false)}/>)}

      {ui.showPlugins&&(<PluginsPanel T={T} activePlugins={project.activePlugins} folder={project.folder}
        onToggle={(p,isActive,folder)=>{
          const newActive={...project.activePlugins,[p.id]:!isActive};
          project.setActivePlugins(newActive);
          project.setHooks(prev=>{
            const hooksForType=[...(prev[p.hookType]||[])];
            const idx=hooksForType.findIndex(h=>typeof h==='object'&&h._pluginId===p.id);
            if(!isActive){if(idx===-1) hooksForType.push({type:'shell',command:p.cmd.replace('{{context}}',folder),_pluginId:p.id});}
            else{if(idx!==-1) hooksForType.splice(idx,1);}
            return {...prev,[p.hookType]:hooksForType};
          });
          chat.setMessages(m=>[...m,{role:'assistant',content:(isActive?'🔌 Plugin **'+p.name+'** dinonaktifkan.':'✅ Plugin **'+p.name+'** aktif!'),actions:[]}]);
        }}
        onClose={()=>ui.setShowPlugins(false)}/>)}

      {ui.showBgAgents&&(<BgAgentPanel T={T} agents={getBgAgents()}
        onMerge={async id=>{
          chat.setLoading(true);
          const result=await mergeBackgroundAgent(id,project.folder);
          if(result.hasConflicts){ui.setMergeConflictData(result);ui.setShowMergeConflict(true);}
          else{chat.setMessages(m=>[...m,{role:'assistant',content:result.ok?'✅ '+result.msg:'❌ '+result.msg,actions:[]}]);}
          ui.setShowBgAgents(false);chat.setLoading(false);
        }}
        onAbort={id=>abortBgAgent(id)}
        onSpawn={task=>{ui.setShowBgAgents(false);sendMsg('/bg '+task);}}
        onClose={()=>ui.setShowBgAgents(false)}/>)}

      {ui.showSkills&&(<SkillsPanel T={T} skills={project.skills}
        onToggle={name=>project.toggleSkill(name)}
        onUpload={async(name,text)=>{const r=await project.uploadSkill(name,text);chat.setMessages(m=>[...m,{role:'assistant',content:r.ok?'🧩 Skill **'+name+'** di-upload!':'❌ Upload gagal: '+r.data,actions:[]}]);}}
        onAdd={async(name,text)=>{const r=await project.uploadSkill(name,text);chat.setMessages(m=>[...m,{role:'assistant',content:r.ok?'🧩 Skill **'+name+'.md** disimpan!':'❌ Gagal: '+r.data,actions:[]}]);}}
        onRemove={async name=>{const r=await project.removeSkill(name);if(r.ok) chat.setMessages(m=>[...m,{role:'assistant',content:'🗑 Skill **'+name+'** dihapus.',actions:[]}]);}}
        onClose={()=>ui.setShowSkills(false)} accentColor={T.accent}/>)}

      {ui.showConfig&&(<ConfigPanel T={T} effort={project.effort} fontSize={ui.fontSize} theme={ui.theme}
        model={project.model} thinkingEnabled={project.thinkingEnabled} models={MODELS}
        onEffort={v=>project.setEffort(v)} onFontSize={v=>ui.setFontSize(v)} onTheme={v=>ui.setTheme(v)}
        onModel={v=>project.setModel(v)} onThinking={()=>project.setThinkingEnabled(!project.thinkingEnabled)}
        vimMode={ui.vimMode} onVimMode={v=>ui.setVimMode(v)}
        showMinimap={ui.showMinimap} onMinimap={v=>ui.setShowMinimap(v)}
        ghostTextEnabled={ui.ghostTextEnabled} onGhostText={v=>ui.setGhostTextEnabled(v)}
        lintEnabled={ui.lintEnabled} onLint={v=>ui.setLintEnabled(v)}
        tsLspEnabled={ui.tsLspEnabled} onTsLsp={v=>ui.setTsLspEnabled(v)}
        blameEnabled={ui.blameEnabled} onBlame={v=>ui.setBlameEnabled(v)}
        multiCursor={ui.multiCursor} onMultiCursor={v=>ui.setMultiCursor(v)}
        stickyScroll={ui.stickyScroll} onStickyScroll={v=>ui.setStickyScroll(v)}
        collabEnabled={ui.collabEnabled} onCollab={v=>ui.setCollabEnabled(v)}
        diffReview={project.diffReview} onDiffReview={v=>project.setDiffReview(v)}
        onClose={()=>ui.setShowConfig(false)}/>)}

      {ui.showDeploy&&(<DeployPanel T={T} deployLog={ui.deployLog} loading={chat.loading}
        onDeploy={runDeploy} onClose={()=>ui.setShowDeploy(false)}/>)}

      {/* File input (hidden) */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageAttach}/>

      {/* Commit modal */}
      {ui.commitModal&&(
        <div style={{position:'fixed',inset:0,background:T.bg+'bf',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:T.bg2,border:'1px solid '+T.border,borderRadius:'14px',padding:'20px',width:'100%',maxWidth:'380px',boxShadow:'0 20px 60px rgba(0,0,0,.7)'}}>
            <div style={{fontSize:'14px',fontWeight:'600',color:T.text,marginBottom:'4px'}}>↑ Push ke Remote</div>
            <div style={{fontSize:'11px',color:T.textMute,marginBottom:'14px'}}>node yugit.cjs "..."</div>
            <input autoFocus value={ui.commitMsg} onChange={e=>ui.setCommitMsg(e.target.value)}
              onKeyDown={e=>{
                if(e.key==='Enter'&&ui.commitMsg.trim()){ui.setCommitModal(false);const cm=ui.commitMsg.trim().replace(/\\/g,'\\\\').replace(/"/g,'\\"');runShortcut('node yugit.cjs "'+cm+'"');}
                if(e.key==='Escape') ui.setCommitModal(false);
              }}
              placeholder="commit message..."
              style={{width:'100%',background:T.bg3,border:'1px solid '+T.borderMed,borderRadius:'8px',padding:'10px 12px',color:T.text,fontSize:'13px',outline:'none',fontFamily:'monospace',marginBottom:'12px',boxSizing:'border-box'}}/>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>ui.setCommitModal(false)} style={{flex:1,background:T.bg3,border:'1px solid '+T.border,borderRadius:'8px',padding:'9px',color:T.textMute,fontSize:'12px',cursor:'pointer'}}><X size={13}/> Batal</button>
              <button disabled={!ui.commitMsg.trim()} onClick={()=>{ui.setCommitModal(false);const cm=ui.commitMsg.trim().replace(/\\/g,'\\\\').replace(/"/g,'\\"');runShortcut('node yugit.cjs "'+cm+'"');}}
                style={{flex:2,background:ui.commitMsg.trim()?T.accent:'rgba(255,255,255,.05)',border:'none',borderRadius:'8px',padding:'9px',color:'white',fontSize:'12px',cursor:ui.commitMsg.trim()?'pointer':'default',fontWeight:'600',opacity:ui.commitMsg.trim()?1:.4}}>
                ↑ Push
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
