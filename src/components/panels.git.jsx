import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { callServer } from '../api.js';
import { AlertTriangle, Eye, ScrollText, X, Network, GitMerge } from 'lucide-react';
import { BottomSheet } from './panels.base.jsx';

export function GitComparePanel({ folder, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const [diff, setDiff]       = useState('');
  const [loading, setLoading] = useState(true);
  const [staged, setStaged]   = useState(false);
  const [view, setView]       = useState('unified'); // 'unified' | 'split'
  const [stats, setStats]     = useState({ added:0, removed:0, files:0 });

  async function load(s) {
    setLoading(true);
    const cmd = s ? 'git diff --cached' : 'git diff';
    const r   = await callServer({ type:'exec', path:folder, command: cmd });
    const raw = r.data || '';
    setDiff(raw);
    // Compute stats
    const lines   = raw.split('\n');
    const added   = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
    const removed = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
    const files   = lines.filter(l => l.startsWith('diff --git')).length;
    setStats({ added, removed, files });
    setLoading(false);
  }

  useEffect(() => { load(false); }, []); // eslint-disable-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

  function lineStyle(line) {
    if (line.startsWith('diff --git'))  return { color:'#60a5fa', bg:'rgba(96,165,250,.06)',   bold:true };
    if (line.startsWith('@@'))           return { color:'#a78bfa', bg:'rgba(124,58,237,.08)',  bold:false };
    if (line.startsWith('+++') || line.startsWith('---')) return { color:'rgba(255,255,255,.3)', bg:'transparent', bold:false };
    if (line.startsWith('+'))            return { color:'#4ade80', bg:'rgba(74,222,128,.07)',   bold:false };
    if (line.startsWith('-'))            return { color:'#f87171', bg:'rgba(248,113,113,.07)',  bold:false };
    return { color:textSec, bg:'transparent', bold:false };
  }

  function renderUnified() {
    let _fileHeader = '';
    return diff.split('\n').map((line, i) => {
      if (line.startsWith('diff --git')) _fileHeader = line.replace('diff --git a/', '').split(' b/')[0];
      const { color, bg, bold } = lineStyle(line);
      const lineNum = line.startsWith('@@') ? null :
        line.startsWith('+') ? <span style={{color:'rgba(74,222,128,.4)',userSelect:'none',marginRight:'8px',fontSize:'9px'}}>+</span> :
        line.startsWith('-') ? <span style={{color:'rgba(248,113,113,.4)',userSelect:'none',marginRight:'8px',fontSize:'9px'}}>-</span> : null;
      return (
        <div key={i} style={{background:bg, display:'flex', alignItems:'flex-start'}}>
          <div style={{width:'3px',flexShrink:0,background:line.startsWith('+')?'#4ade80':line.startsWith('-')?'#f87171':'transparent',alignSelf:'stretch'}}/>
          <div style={{padding:'0 8px 0 6px',flex:1,fontFamily:'monospace',fontSize:'11px',lineHeight:'1.7',color,fontWeight:bold?'600':'400',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
            {lineNum}{line||' '}
          </div>
        </div>
      );
    });
  }

  function renderSplit() {
    // Parse hunk into left (old) and right (new) columns
    const hunks = [];
    let currentFile = '';
    diff.split('\n').forEach(line => {
      if (line.startsWith('diff --git')) { currentFile = line.replace('diff --git a/', '').split(' b/')[0]; return; }
      if (line.startsWith('---') || line.startsWith('+++')) return;
      if (line.startsWith('@@')) { hunks.push({ file: currentFile, header: line, pairs: [] }); return; }
      if (!hunks.length) return;
      const last = hunks[hunks.length - 1];
      if (line.startsWith('+')) last.pairs.push({ left: null, right: line.slice(1) });
      else if (line.startsWith('-')) {
        // Try to pair with next + line
        const nextUnpaired = last.pairs.findIndex(p => p.left === null && p.right !== null);
        if (nextUnpaired !== -1) last.pairs[nextUnpaired].left = line.slice(1);
        else last.pairs.push({ left: line.slice(1), right: null });
      }
      else last.pairs.push({ left: line, right: line });
    });

    return hunks.map((hunk, hi) => (
      <div key={hi} style={{marginBottom:'12px'}}>
        <div style={{padding:'4px 10px',background:accentBg,color:accent,fontSize:'10px',fontFamily:'monospace',borderBottom:'1px solid '+accentBorder}}>
          {hunk.file} {hunk.header}
        </div>
        <div style={{display:'flex'}}>
          {/* Left (old) */}
          <div style={{flex:1,borderRight:'1px solid '+border}}>
            {hunk.pairs.map((p,i) => (
              <div key={i} style={{padding:'0 8px',background:p.left===null?'rgba(74,222,128,.03)':p.right===null?'rgba(248,113,113,.07)':'transparent',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.7',color:p.right===null?'#f87171':'rgba(255,255,255,.5)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                {p.left ?? <span style={{opacity:.2}}>···</span>}
              </div>
            ))}
          </div>
          {/* Right (new) */}
          <div style={{flex:1}}>
            {hunk.pairs.map((p,i) => (
              <div key={i} style={{padding:'0 8px',background:p.right===null?'rgba(248,113,113,.03)':p.left===null?'rgba(74,222,128,.07)':'transparent',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.7',color:p.left===null?'#4ade80':'rgba(255,255,255,.55)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                {p.right ?? <span style={{opacity:.2}}>···</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    ));
  }

  const tabBtn = (label, active, onClick) => (
    <button onClick={onClick} style={{background:active?'rgba(255,255,255,.1)':'none',border:'1px solid '+(active?borderMed:border),borderRadius:'5px',padding:'3px 9px',color:active?text:textMute,fontSize:'11px',cursor:'pointer'}}>{label}</button>
  );

  return (
    <BottomSheet onClose={onClose}>
      {/* Header */}
      <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',gap:'6px',background:bg3,flexShrink:0,flexWrap:'wrap'}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:text,marginRight:'4px'}}>◐ Git Diff</span>
        {/* Stats */}
        {!loading&&<>
          <span style={{fontSize:'10px',color:textMute}}>{stats.files} file</span>
          <span style={{fontSize:'10px',color:'#4ade80',fontFamily:'monospace'}}>+{stats.added}</span>
          <span style={{fontSize:'10px',color:'#f87171',fontFamily:'monospace'}}>-{stats.removed}</span>
        </>}
        <div style={{flex:1}}/>
        {tabBtn('unstaged', !staged, ()=>{setStaged(false);load(false);})}
        {tabBtn('staged',    staged, ()=>{setStaged(true);load(true);})}
        <div style={{width:'1px',height:'16px',background:borderMed}}/>
        {tabBtn('unified', view==='unified', ()=>setView('unified'))}
        {tabBtn('split',   view==='split',   ()=>setView('split'))}
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer',marginLeft:'2px'}}><X size={16}/></button>
      </div>
      {/* Diff content */}
      <div style={{flex:1,overflowY:'auto',padding:'4px 0'}}>
        {loading
          ? <div style={{padding:'16px',color:textMute,fontSize:'12px'}}>Loading···</div>
          : !diff.trim()
          ? <div style={{padding:'16px',color:textMute,fontSize:'12px'}}>Tidak ada perubahan~</div>
          : view==='split' ? renderSplit() : renderUnified()
        }
      </div>
    </BottomSheet>
  );
}

// ─── FILE HISTORY PANEL ───────────────────────────────────────────────────────


export function FileHistoryPanel({ folder, filePath, onClose, T }) {

  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(null);

  useEffect(() => {
    const rel = filePath.replace(folder+'/', '');
    callServer({type:'exec', path:folder, command:`git log --oneline -20 -- "${rel}"`}).then(r => {
      if (r.ok && r.data) {
        const lines = r.data.trim().split('\n').filter(Boolean).map(l => {
          const [hash, ...rest] = l.split(' ');
          return { hash, msg: rest.join(' ') };
        });
        setCommits(lines);
      }
      setLoading(false);
    });
  }, [filePath, folder]);

  async function preview(hash) {
    const rel = filePath.replace(folder+'/', '');
    const r = await callServer({type:'exec', path:folder, command:`git show ${hash}:"${rel}" 2>/dev/null`});
    if (r.ok) setPreviewing({ hash, content: r.data });
  }

  async function restore(hash) {
    const rel = filePath.replace(folder+'/', '');
    await callServer({type:'exec', path:folder, command:`git checkout ${hash} -- "${rel}"`});
    onClose();
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{display:'flex',flexDirection:'row',flex:1,overflow:'hidden'}}>
      <div style={{width:'200px',borderRight:'1px solid '+border,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center'}}>
          <span style={{fontSize:'12px',fontWeight:'600',color:text,flex:1}}><ScrollText size={14}/> File History</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'14px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {loading&&<div style={{padding:'8px',color:textMute,fontSize:'11px'}}>Loading···</div>}
          {commits.map(c=>(
            <div key={c.hash} onClick={()=>preview(c.hash)}
              style={{padding:'7px 10px',borderBottom:'1px solid '+border,cursor:'pointer',background:previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
              onMouseLeave={e=>e.currentTarget.style.background=previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}>
              <div style={{fontSize:'10px',color:accent,fontFamily:'monospace'}}>{c.hash}</div>
              <div style={{fontSize:'11px',color:textSec,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.msg}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {previewing ? (
          <>
            <div style={{padding:'6px 12px',borderBottom:'1px solid '+border,display:'flex',gap:'8px',alignItems:'center',flexShrink:0}}>
              <span style={{fontSize:'11px',color:textMute,fontFamily:'monospace',flex:1}}>{previewing.hash}</span>
              <button onClick={()=>restore(previewing.hash)} style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer'}}>⏪ Restore</button>
            </div>
            <div style={{flex:1,overflow:'auto',display:'flex',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6'}}>
              <div style={{padding:'8px 6px',color:textMute,textAlign:'right',userSelect:'none',borderRight:'1px solid '+border,minWidth:'32px',flexShrink:0}}>
                {(previewing.content||'').split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
              </div>
              <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:textSec,flex:1}}>{previewing.content}</pre>
            </div>
          </>
        ) : (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:textMute,fontSize:'12px'}}>Pilih commit untuk preview</div>
        )}
      </div>
      </div>
  </BottomSheet>
  );
}

// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────


export function GitBlamePanel({ folder, filePath, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const [blame, setBlame] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rel = filePath.replace(folder+'/', '');
    callServer({type:'exec', path:folder, command:`git blame --line-porcelain "${rel}" 2>/dev/null | grep -E "^(author |author-time |summary )" | paste - - - | head -200`}).then(r => {
      if (!r.ok || !r.data) { setLoading(false); return; }
      const lines = r.data.trim().split('\n').map(line => {
        const parts = line.split('\t');
        const author = (parts[0]||'').replace('author ','');
        const time = new Date(parseInt((parts[1]||'').replace('author-time ',''))*1000).toLocaleDateString('id');
        const summary = (parts[2]||'').replace('summary ','').slice(0,30);
        return { author, time, summary };
      });
      setBlame(lines);
      setLoading(false);
    });
  }, [filePath, folder]);

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',background:bg3,flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:text,flex:1}}><Eye size={14}/> Git Blame — {filePath.split('/').pop()}</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>
      <div style={{flex:1,overflowY:'auto',fontFamily:'monospace',fontSize:'11px'}}>
        {loading && <div style={{padding:'16px',color:textMute}}>Loading···</div>}
        {blame.map((b,i) => (
          <div key={i} style={{display:'flex',gap:'8px',padding:'2px 12px',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{color:'rgba(99,102,241,.7)',minWidth:'70px',flexShrink:0}}>{b.time}</span>
            <span style={{color:'rgba(74,222,128,.6)',minWidth:'80px',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.author}</span>
            <span style={{color:textMute,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.summary}</span>
          </div>
        ))}
      </div>
  </BottomSheet>
  );
}

// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────


export function DepGraphPanel({ depGraph, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!depGraph || !containerRef.current) return;
    const el = containerRef.current;
    const W = el.clientWidth || 340;
    const H = el.clientHeight || 420;

    d3.select(el).selectAll('*').remove();

    // Support both new {nodes, edges} format and legacy {file, imports} format
    let nodes, links;
    if (depGraph.nodes && depGraph.edges) {
      nodes = depGraph.nodes.map(n => ({ ...n }));
      links = depGraph.edges.map(e => ({ source: e.source, target: e.target }));
    } else {
      // Legacy fallback
      nodes = [
        { id: depGraph.file, type: 'root', label: depGraph.file },
        ...(depGraph.imports||[]).map(imp => ({
          id: imp,
          type: imp.startsWith('.') ? 'local' : 'external',
          label: imp.split('/').pop().replace(/\.(jsx?|tsx?)$/, ''),
        })),
      ];
      links = (depGraph.imports||[]).map(imp => ({ source: depGraph.file, target: imp }));
    }

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'dep-arrow').attr('viewBox', '0 -4 8 8')
      .attr('refX', 22).attr('refY', 0)
      .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
      .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', 'rgba(124,58,237,.45)');

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(28));

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', 'rgba(124,58,237,.3)').attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#dep-arrow)');

    const COLOR = { root: '#7c3aed', local: '#059669', external: '#1d4ed8' };
    const RADIUS = { root: 18, local: 13, external: 10 };

    const node = svg.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('mouseenter', (_, d) => setHovered(d.id))
      .on('mouseleave', () => setHovered(null));

    node.append('circle')
      .attr('r', d => RADIUS[d.type] || 10)
      .attr('fill', d => COLOR[d.type])
      .attr('fill-opacity', 0.85)
      .attr('stroke', T?.border||'rgba(255,255,255,.2)').attr('stroke-width', 1.5);

    node.append('text')
      .text(d => d.label.length > 14 ? d.label.slice(0, 12) + '…' : d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => (RADIUS[d.type] || 10) + 13)
      .attr('fill', T?.textSec||'rgba(255,255,255,.65)')
      .attr('font-size', '9px').attr('font-family', 'monospace')
      .style('pointer-events', 'none');

    sim.on('tick', () => {
      link
        .attr('x1', d => Math.max(20, Math.min(W - 20, d.source.x)))
        .attr('y1', d => Math.max(20, Math.min(H - 20, d.source.y)))
        .attr('x2', d => Math.max(20, Math.min(W - 20, d.target.x)))
        .attr('y2', d => Math.max(20, Math.min(H - 20, d.target.y)));
      node.attr('transform', d =>
        `translate(${Math.max(20, Math.min(W - 20, d.x))},${Math.max(20, Math.min(H - 20, d.y))})`
      );
    });

    return () => { sim.stop(); d3.select(el).selectAll('*').remove(); };
  }, [depGraph]); // eslint-disable-line react-hooks/exhaustive-deps

  const localCount = depGraph?.nodes
    ? depGraph.nodes.filter(n => n.type === 'local').length
    : (depGraph?.imports||[]).filter(i => i.startsWith('.')).length;
  const extCount = depGraph?.nodes
    ? depGraph.nodes.filter(n => n.type === 'external').length
    : (depGraph?.imports||[]).filter(i => !i.startsWith('.')).length;
  const edgeCount = depGraph?.edges?.length || depGraph?.imports?.length || 0;

  return (
    <BottomSheet onClose={onClose} height='92%'>
      <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',gap:'8px',flexShrink:0,background:bg3}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:text,flex:1}}><Network size={14}/> Dep Graph — <span style={{fontFamily:'monospace',color:accent}}>{depGraph?.file}</span></span>
        <span style={{fontSize:'10px',color:'rgba(5,150,105,.7)'}}>● {localCount} local</span>
        <span style={{fontSize:'10px',color:'rgba(96,165,250,.7)'}}>● {extCount} npm</span>
        <span style={{fontSize:'10px',color:textMute}}>→ {edgeCount} edges</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>
      {hovered && (
        <div style={{padding:'4px 12px',background:accentBg,borderBottom:'1px solid '+accentBorder,fontSize:'10px',color:accent,fontFamily:'monospace',flexShrink:0}}>
          {hovered}
        </div>
      )}
      <div ref={containerRef} style={{flex:1,position:'relative',overflow:'hidden'}} />
      <div style={{padding:'5px 12px',borderTop:'1px solid '+border,display:'flex',gap:'14px',flexShrink:0,background:'rgba(255,255,255,.01)'}}>
        <span style={{fontSize:'9px',color:'rgba(124,58,237,.7)'}}>● root</span>
        <span style={{fontSize:'9px',color:'rgba(5,150,105,.7)'}}>● local</span>
        <span style={{fontSize:'9px',color:'rgba(29,78,216,.7)'}}>● npm</span>
        <span style={{fontSize:'9px',color:textMute,marginLeft:'auto'}}>drag nodes to reposition</span>
      </div>
  </BottomSheet>
  );
}

// ─── ELICITATION PANEL (AI-requested dynamic form) ───────────────────────────


export function MergeConflictPanel({ data, folder, onResolved, onAborted, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const error      = T?.error      || '#f87171';
  const errorBg    = T?.errorBg    || 'rgba(248,113,113,.1)';
  const bg2        = T?.bg2        || '#131108';
  const text       = T?.text       || '#f0f0f0';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const [resolving, setResolving] = useState(false);
  const [previews, setPreviews]   = useState({});
  const [status, setStatus]       = useState('');

  async function loadPreview(cf) {
    const r = await callServer({ type: 'read', path: folder + '/' + cf });
    if (r.ok) setPreviews(p => ({ ...p, [cf]: r.data }));
  }

  async function resolve(strategy) {
    setResolving(true);
    setStatus('Resolving (' + strategy + ')···');
    if (strategy === 'ours') {
      await callServer({ type: 'exec', path: folder, command: 'git checkout --ours -- . && git add -A' });
    } else {
      await callServer({ type: 'exec', path: folder, command: 'git checkout --theirs -- . && git add -A' });
    }
    const commit = await callServer({ type: 'exec', path: folder, command: `git commit -m "merge: resolve conflicts via ${strategy}"` });
    setResolving(false);
    if (commit.ok) {
      setStatus('✅ Resolved!');
      setTimeout(() => onResolved(strategy), 800);
    } else {
      setStatus('❌ Commit gagal: ' + (commit.data || '').slice(0, 80));
    }
  }

  async function abortMerge() {
    setResolving(true);
    setStatus('Aborting···');
    await callServer({ type: 'exec', path: folder, command: 'git merge --abort' });
    setResolving(false);
    onAborted();
  }

  const conflictList = data?.conflicts || [];
  const previewData  = data?.previews || [];

  return (
    <BottomSheet onClose={onClose}><div style={{padding:'0 16px 8px',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',marginBottom:'10px'}}>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f87171',flex:1}}><AlertTriangle size={14}/> Merge Conflict — {conflictList.length} file</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>

      <div style={{background:errorBg,border:'1px solid '+error+'22',borderRadius:'8px',padding:'9px 12px',marginBottom:'12px',fontSize:'11px',color:'rgba(255,255,255,.55)',lineHeight:'1.6'}}>
        Branch <span style={{color:accent,fontFamily:'monospace'}}>{data?.branch}</span> konflik dengan main.<br/>
        Task: <em style={{color:textMute}}>{data?.task?.slice(0, 80)}</em>
      </div>

      {/* Conflict files */}
      <div style={{flex:1,overflowY:'auto',marginBottom:'12px'}}>
        {conflictList.map((cf, _i) => {
          const preview = previews[cf] || previewData.find(p => p.file === cf)?.snippet;
          return (
            <div key={cf} style={{padding:'9px 12px',marginBottom:'6px',background:bg3,border:'1px solid rgba(248,113,113,.12)',borderRadius:'8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:preview?'6px':'0'}}>
                <span style={{fontSize:'10px',color:'#f87171'}}><AlertTriangle size={13}/></span>
                <span style={{fontSize:'12px',color:text,fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cf}</span>
                <button onClick={() => loadPreview(cf)}
                  style={{background:bg3,border:'1px solid '+border,borderRadius:'4px',padding:'2px 7px',color:textMute,fontSize:'9px',cursor:'pointer',flexShrink:0}}>
                  preview
                </button>
              </div>
              {preview && (
                <pre style={{margin:0,padding:'6px 8px',background:bg2,borderRadius:'5px',fontSize:'9px',color:textSec,fontFamily:'monospace',maxHeight:'90px',overflow:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                  {preview.slice(0, 400)}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      {/* Status */}
      {status && (
        <div style={{padding:'6px 10px',marginBottom:'8px',borderRadius:'6px',background:bg3,fontSize:'11px',color:status.startsWith('✅')?'#4ade80':status.startsWith('❌')?'#f87171':'rgba(255,255,255,.5)',textAlign:'center'}}>
          {status}
        </div>
      )}

      {/* Actions */}
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={() => resolve('ours')} disabled={resolving}
            style={{flex:1,background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:'8px',padding:'10px 8px',color:'#818cf8',fontSize:'11px',cursor:'pointer',fontWeight:'500',opacity:resolving?.5:1}}>
            ← Pakai main (ours)
          </button>
          <button onClick={() => resolve('theirs')} disabled={resolving}
            style={{flex:1,background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'8px',padding:'10px 8px',color:'#4ade80',fontSize:'11px',cursor:'pointer',fontWeight:'500',opacity:resolving?.5:1}}>
            Pakai agent (theirs) →
          </button>
        </div>
        <button onClick={abortMerge} disabled={resolving}
          style={{background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.14)',borderRadius:'8px',padding:'8px',color:'#f87171',fontSize:'11px',cursor:'pointer',opacity:resolving?.5:1}}>
          <X size={12}/> Abort merge
        </button>
      </div>
    </div>
  </BottomSheet>
  );
}

// ── SkillsPanel ───────────────────────────────────────────────────────────────
