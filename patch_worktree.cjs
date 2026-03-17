// patch_worktree.cjs
const fs = require('fs');
const filePath = 'src/App.jsx';
let c = fs.readFileSync(filePath, 'utf8');
let changed = 0;

function patch(label, from, to) {
  if (!c.includes(from)) { console.log('skip:', label); return; }
  c = c.replace(from, to);
  changed++;
  console.log('ok:', label);
}

// 1. Update features.js import to include mergeBackgroundAgent
patch('update features import',
  `import { generatePlan, runBackgroundAgent, getBgAgents, loadSkills, selectSkills, runHooksV2, tokenTracker, saveSession, loadSessions, rewindMessages, EFFORT_CONFIG, parseElicitation } from './features.js';`,
  `import { generatePlan, runBackgroundAgent, getBgAgents, mergeBackgroundAgent, loadSkills, selectSkills, runHooksV2, tokenTracker, saveSession, loadSessions, rewindMessages, EFFORT_CONFIG, parseElicitation } from './features.js';`
);

// 2. Add /bgmerge slash command
patch('add bgmerge command',
  `    } else if (base==='/bgstatus') {
      const agents = getBgAgents();
      if (!agents.length) { setMessages(m=>[...m,{role:'assistant',content:'Tidak ada background agent.',actions:[]}]); return; }
      setMessages(m=>[...m,{role:'assistant',content:'🤖 Agents:\\n'+agents.map(a=>a.id+' ['+a.status+'] '+a.task).join('\\n'),actions:[]}]);`,
  `    } else if (base==='/bgstatus') {
      const agents = getBgAgents();
      if (!agents.length) { setMessages(m=>[...m,{role:'assistant',content:'Tidak ada background agent.',actions:[]}]); return; }
      const statusLines = agents.map(a=>{
        const logs = a.log ? a.log.slice(-2).join(' | ') : '';
        return a.id+' ['+a.status+']\n'+a.task+(logs?'\n'+logs:'');
      }).join('\n\n');
      setMessages(m=>[...m,{role:'assistant',content:'🤖 **Background Agents:**\n\n'+statusLines,actions:[]}]);
    } else if (base==='/bgmerge') {
      const id = parts[1]?.trim();
      if (!id) {
        const agents = getBgAgents().filter(a=>a.status==='done');
        if (!agents.length) { setMessages(m=>[...m,{role:'assistant',content:'Tidak ada agent yang siap di-merge. Cek /bgstatus dulu.',actions:[]}]); return; }
        setMessages(m=>[...m,{role:'assistant',content:'🌿 Agent siap merge:\n'+agents.map(a=>'/bgmerge '+a.id+' — '+a.task).join('\n'),actions:[]}]);
        return;
      }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔀 Merging agent '+id+'...',actions:[]}]);
      const result = await mergeBackgroundAgent(id, folder);
      setMessages(m=>[...m,{role:'assistant',content:result.ok?'✅ '+result.msg:'❌ '+result.msg,actions:[]}]);
      if (result.ok) { haptic('heavy'); sendNotification('YuyuCode 🌿', 'Merge berhasil!'); }
      setLoading(false);`
);

// 3. Add /bgmerge to SLASH_COMMANDS in constants.js
const constPath = 'src/constants.js';
let cc = fs.readFileSync(constPath, 'utf8');
if (!cc.includes("'/bgmerge'")) {
  cc = cc.replace(
    `  { cmd:'/bgstatus',    desc:'Status background agents' },`,
    `  { cmd:'/bgstatus',    desc:'Status background agents' },\n  { cmd:'/bgmerge',     desc:'Merge hasil background agent ke main' },`
  );
  fs.writeFileSync(constPath, cc);
  console.log('ok: add bgmerge to constants');
}

fs.writeFileSync(filePath, c);
console.log('\ndone. changes:', changed, '| lines:', c.split('\n').length);
