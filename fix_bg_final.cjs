const fs = require('fs');
const filePath = 'src/App.jsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// fix /bg - baris 1484 masih pecah jadi 2
const bgIdx = lines.findIndex(l => l.includes('Background agent:') && l.includes("task+'"));
if (bgIdx !== -1) {
  lines.splice(bgIdx, 2, "      setMessages(m=>[...m,{role:'assistant',content:'🤖 Background agent: '+task+'\\nID: '+id,actions:[]}]);");
  console.log('fixed /bg at', bgIdx+1);
} else {
  console.log('bg not found');
}

// hapus orphan
const orphanIdx = lines.findIndex(l => l.trim() === "'),actions:[]}]);");
if (orphanIdx !== -1) {
  lines.splice(orphanIdx, 1);
  console.log('removed orphan at', orphanIdx+1);
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('done. lines:', lines.length);
