#!/usr/bin/env node
// patch_agentic_v1.cjs
// YuyuCode — Agentic Behavior Upgrade (Step 1 + 2 + 3)
// Jalankan: node patch_agentic_v1.cjs /path/to/src/App.jsx

'use strict';
const fs = require('fs');

const target = process.argv[2];
if (!target) {
  console.error('Usage: node patch_agentic_v1.cjs /path/to/src/App.jsx');
  process.exit(1);
}

let src = fs.readFileSync(target, 'utf8');
const backup = target + '.bak_agentic_v1';
fs.writeFileSync(backup, src);
console.log('Backup disimpan ke ' + backup);

let patched = 0;

// ─── PATCH 1 — Decision layer ─────────────────────────────────────────────────
const P1_OLD = "        const groqMsgs=[\n" +
"          {role:'system',content:systemPrompt+(Object.keys(autoContext).length?'\\n\\nAuto-loaded context:\\n'+Object.entries(autoContext).map(([p,c])=>'=== '+p+' ===\\n'+c.slice(0,800)).join('\\n\\n'):'')},\n" +
"          ...trimHistory(allMessages).map(m=>({role:m.role,content:m.content.replace(/```action[\\s\\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\\n/g,'').trim()}))\n" +
"        ];";

const P1_NEW = "        // \u2500\u2500 DECISION LAYER: AI mikir dulu sebelum pakai tool \u2500\u2500\n" +
"        const DECISION_HINT = iter === 1 ? [\n" +
"          '',\n" +
"          'AGENTIC DECISION PROTOCOL \u2014 baca sebelum respons:',\n" +
"          'Sebelum melakukan apapun, tentukan: apakah request ini benar-benar butuh tool?',\n" +
"          '',\n" +
"          'JAWAB LANGSUNG (tanpa action block) jika:',\n" +
"          '- Pertanyaan/penjelasan yang bisa dijawab dari context yang sudah ada',\n" +
"          '- Review/analisis kode yang sudah terlihat di context',\n" +
"          '- Saran arsitektur, debugging hypothesis, atau diskusi teknis',\n" +
"          '',\n" +
"          'GUNAKAN TOOL jika:',\n" +
"          '- Perlu baca file yang belum ada di context -> read_file',\n" +
"          '- Perlu jalankan perintah / check output nyata -> exec',\n" +
"          '- Perlu tulis/edit file -> write_file',\n" +
"          '',\n" +
"          'ATURAN: Kalau bisa jawab tanpa tool, JANGAN pakai tool.'\n" +
"        ].join('\\n') : '';\n" +
"\n" +
"        const groqMsgs=[\n" +
"          {role:'system',content:systemPrompt+DECISION_HINT+(Object.keys(autoContext).length?'\\n\\nAuto-loaded context:\\n'+Object.entries(autoContext).map(([p,c])=>'=== '+p+' ===\\n'+c.slice(0,800)).join('\\n\\n'):'')},\n" +
"          ...trimHistory(allMessages).map(m=>({role:m.role,content:m.content.replace(/```action[\\s\\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\\n/g,'').trim()}))\n" +
"        ];";

if (src.includes(P1_OLD)) {
  src = src.replace(P1_OLD, P1_NEW);
  patched++;
  console.log('[1/3] Decision layer added');
} else {
  console.warn('[1/3] SKIP: P1 target not found');
}

// ─── PATCH 2 — Post-exec error auto-fix loop ──────────────────────────────────
const P2_OLD = "        const fileData = [...readActions,...otherActions].filter(a=>a.result?.ok&&a.type!=='exec').map(a=>'=== '+a.path+' ===\\n'+a.result.data).join('\\n\\n');\n" +
"\n" +
"        if (!fileData && writes.length === 0) {\n" +
"          finalContent = reply;\n" +
"          finalActions = [...readActions,...otherActions];\n" +
"          break;\n" +
"        }";

const P2_NEW = "        // \u2500\u2500 POST-EXEC ERROR DETECTION: auto-fix loop \u2500\u2500\n" +
"        const execErrors = otherActions.filter(function(a) {\n" +
"          if (a.type !== 'exec') return false;\n" +
"          const out = (a.result && a.result.data ? a.result.data : '').toLowerCase();\n" +
"          if (!out || !out.trim()) return false;\n" +
"          const hasErr = out.includes('error') || out.includes('exception') ||\n" +
"            out.includes('traceback') || out.includes('cannot find module') ||\n" +
"            out.includes('command not found') || out.includes('exit code 1') ||\n" +
"            out.includes('failed to compile');\n" +
"          const isFalsePositive = out.includes('no error') || out.includes('0 errors') ||\n" +
"            out.includes('syntax ok') || out.includes('passed');\n" +
"          return hasErr && !isFalsePositive;\n" +
"        });\n" +
"\n" +
"        if (execErrors.length > 0 && iter < MAX_ITER) {\n" +
"          const errSummary = execErrors.map(function(a) {\n" +
"            return '[ERROR] ' + (a.command || a.path || '?') + '\\n' + (a.result && a.result.data ? a.result.data.slice(0, 400) : '');\n" +
"          }).join('\\n\\n');\n" +
"          allMessages = [\n" +
"            ...allMessages,\n" +
"            {role:'assistant', content: reply.replace(/```action[\\s\\S]*?```/g,'').trim()},\n" +
"            {role:'user', content: 'Error saat eksekusi:\\n\\n' + errSummary + '\\n\\nAnalisis dan fix. Jangan ulangi command yang sama persis.'}\n" +
"          ];\n" +
"          continue;\n" +
"        }\n" +
"\n" +
"        const fileData = [...readActions,...otherActions].filter(a=>a.result?.ok&&a.type!=='exec').map(a=>'=== '+a.path+' ===\\n'+a.result.data).join('\\n\\n');\n" +
"\n" +
"        if (!fileData && writes.length === 0) {\n" +
"          finalContent = reply;\n" +
"          finalActions = [...readActions,...otherActions];\n" +
"          break;\n" +
"        }";

if (src.includes(P2_OLD)) {
  src = src.replace(P2_OLD, P2_NEW);
  patched++;
  console.log('[2/3] Post-exec error auto-fix loop added');
} else {
  console.warn('[2/3] SKIP: P2 target not found');
}

// ─── PATCH 3 — Run-after-write ────────────────────────────────────────────────
const P3_OLD = "    await runHooks('postWrite', targets.map(a=>a.path).join(','));\n  }";

const P3_NEW = "    await runHooks('postWrite', targets.map(a=>a.path).join(','));\n" +
"\n" +
"    // \u2500\u2500 RUN-AFTER-WRITE: auto verify syntax \u2500\u2500\n" +
"    if (permissions.exec) {\n" +
"      for (const wr of targets) {\n" +
"        const filePath = wr.path || '';\n" +
"        const ext = filePath.split('.').pop().toLowerCase();\n" +
"        let verifyCmd = null;\n" +
"        const absPath = resolvePath(folder, filePath);\n" +
"        if (ext === 'js' || ext === 'cjs' || ext === 'mjs') {\n" +
"          verifyCmd = 'node --check \"' + absPath + '\" 2>&1 && echo \"SYNTAX_OK\" || echo \"SYNTAX_ERR\"';\n" +
"        } else if (ext === 'json') {\n" +
"          verifyCmd = 'python3 -m json.tool \"' + absPath + '\" > /dev/null 2>&1 && echo \"SYNTAX_OK\" || echo \"SYNTAX_ERR\"';\n" +
"        } else if (ext === 'sh') {\n" +
"          verifyCmd = 'bash -n \"' + absPath + '\" 2>&1 && echo \"SYNTAX_OK\" || echo \"SYNTAX_ERR\"';\n" +
"        }\n" +
"        if (!verifyCmd) continue;\n" +
"        const vr = await callServer({type:'exec', path:folder, command:verifyCmd});\n" +
"        const vOut = (vr.data || '').trim();\n" +
"        if (!vOut) continue;\n" +
"        const hasVerifyErr = vOut.includes('SYNTAX_ERR') || (vOut.toLowerCase().includes('error') && !vOut.includes('SYNTAX_OK'));\n" +
"        if (hasVerifyErr) {\n" +
"          const fname = filePath.split('/').pop();\n" +
"          setMessages(m=>[...m,{role:'assistant',content:'Syntax error di ' + fname + ' setelah write:\\n```\\n' + vOut.slice(0,300) + '\\n```',actions:[]}]);\n" +
"          setTimeout(()=>sendMsg('Fix syntax error di ' + filePath + ':\\n```\\n' + vOut.slice(0,300) + '\\n```'), 700);\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"  }";

if (src.includes(P3_OLD)) {
  src = src.replace(P3_OLD, P3_NEW);
  patched++;
  console.log('[3/3] Run-after-write syntax verification added');
} else {
  console.warn('[3/3] SKIP: P3 target not found');
}

// ─── WRITE ────────────────────────────────────────────────────────────────────
if (patched === 0) {
  console.error('Tidak ada patch yang berhasil. Cek versi App.jsx.');
  process.exit(1);
}

fs.writeFileSync(target, src);
console.log('');
console.log('Selesai! ' + patched + '/3 patch diterapkan ke ' + target);
console.log('Backup: ' + backup);
console.log('');
console.log('Perubahan:');
console.log('  1. Decision layer  -- AI pikir dulu sebelum pakai tool');
console.log('  2. Error auto-fix  -- exec error langsung di-fix AI tanpa nunggu Papa');
console.log('  3. Run-after-write -- setelah write, syntax dicek otomatis');
