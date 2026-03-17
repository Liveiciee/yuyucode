const fs = require('fs');
const filePath = 'src/App.jsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const bgsIdx = lines.findIndex(l => l.includes('Agents:') && l.indexOf('join') === -1);
if (bgsIdx !== -1) {
  lines.splice(bgsIdx, 2, "      setMessages(m=>[...m,{role:'assistant',content:'🤖 Agents:\\n'+agents.map(a=>a.id+' ['+a.status+'] '+a.task).join('\\n'),actions:[]}]);");
  console.log('fixed /bgstatus at', bgsIdx+1);
} else {
  console.log('not found');
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('done. lines:', lines.length);
