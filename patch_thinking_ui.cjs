#!/usr/bin/env node
// patch_thinking_ui.cjs — visible thinking/reasoning block
'use strict';
const fs = require('fs');

const target = process.argv[2];
if (!target) { console.error('Usage: node patch_thinking_ui.cjs src/App.jsx'); process.exit(1); }

let src = fs.readFileSync(target, 'utf8');
fs.writeFileSync(target + '.bak_thinking', src);
console.log('Backup: ' + target + '.bak_thinking');

let patched = 0;

// ─── PATCH 1 — ThinkingBlock component (insert after ActionChip component) ───
const P1_OLD = "function FileTree({ folder, onSelectFile, selectedFile, onRefresh }) {";

const P1_NEW = "// ── THINKING BLOCK COMPONENT ──────────────────────────────────────────────\n" +
"function ThinkingBlock({ text }) {\n" +
"  const [open, setOpen] = React.useState(false);\n" +
"  if (!text || !text.trim()) return null;\n" +
"  return (\n" +
"    <div style={{margin:'4px 0 6px',borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(167,139,250,.15)',background:'rgba(167,139,250,.04)'}}>\n" +
"      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 10px',cursor:'pointer',userSelect:'none'}}>\n" +
"        <span style={{fontSize:'11px',color:'rgba(167,139,250,.7)',fontFamily:'monospace'}}>{'> thinking'}</span>\n" +
"        <div style={{flex:1,height:'1px',background:'rgba(167,139,250,.1)'}} />\n" +
"        <span style={{fontSize:'10px',color:'rgba(167,139,250,.4)'}}>{open ? '▲' : '▼'}</span>\n" +
"      </div>\n" +
"      {open && (\n" +
"        <div style={{padding:'6px 12px 10px',fontSize:'12px',lineHeight:'1.6',color:'rgba(255,255,255,.45)',fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-word',borderTop:'1px solid rgba(167,139,250,.08)'}}>\n" +
"          {text.trim()}\n" +
"        </div>\n" +
"      )}\n" +
"    </div>\n" +
"  );\n" +
"}\n" +
"\n" +
"function FileTree({ folder, onSelectFile, selectedFile, onRefresh }) {";

if (src.includes(P1_OLD)) {
  src = src.replace(P1_OLD, P1_NEW);
  patched++;
  console.log('[1/3] ThinkingBlock component added');
} else {
  console.warn('[1/3] SKIP: P1 not found');
}

// ─── PATCH 2 — Parse <think> from AI reply and show ThinkingBlock in MsgBubble ─
const P2_OLD = "  const cleanText = msg.content.replace(/```action[\\s\\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\\n/g, '').trim();";

const P2_NEW = "  const thinkMatch = msg.content.match(/<think>([\\s\\S]*?)<\\/think>/i);\n" +
"  const thinkText = thinkMatch ? thinkMatch[1] : null;\n" +
"  const cleanText = msg.content.replace(/<think>[\\s\\S]*?<\\/think>/gi, '').replace(/```action[\\s\\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\\n/g, '').trim();";

if (src.includes(P2_OLD)) {
  src = src.replace(P2_OLD, P2_NEW);
  patched++;
  console.log('[2/3] Think tag parser added');
} else {
  console.warn('[2/3] SKIP: P2 not found');
}

// ─── PATCH 3 — Render ThinkingBlock in MsgBubble (before aiBubble content) ───
const P3_OLD = "          <div style={S.aiBubble}><MsgContent text={cleanText} /></div>";

const P3_NEW = "          {thinkText && <ThinkingBlock text={thinkText} />}\n" +
"          <div style={S.aiBubble}><MsgContent text={cleanText} /></div>";

if (src.includes(P3_OLD)) {
  src = src.replace(P3_OLD, P3_NEW);
  patched++;
  console.log('[3/3] ThinkingBlock rendered in MsgBubble');
} else {
  console.warn('[3/3] SKIP: P3 not found');
}

if (patched === 0) { console.error('Tidak ada patch berhasil.'); process.exit(1); }
fs.writeFileSync(target, src);
console.log('\nSelesai! ' + patched + '/3 patch diterapkan.');
console.log('AI perlu di-prompt pakai <think> — Yuyu handle di BASE_SYSTEM atau SKILL.md.');
