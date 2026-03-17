// patch_constants.cjs — jalankan: node patch_constants.cjs
const fs = require('fs');
const filePath = require('path').join(__dirname, 'src/constants.js');
let c = fs.readFileSync(filePath, 'utf8');

const newCmds = [
  `  { cmd:'/plan',        desc:'Plan + approve + eksekusi step by step' },`,
  `  { cmd:'/rewind',      desc:'Undo N conversation turns + code changes' },`,
  `  { cmd:'/effort',      desc:'Set effort level: low | medium | high' },`,
  `  { cmd:'/rename',      desc:'Beri nama sesi ini' },`,
  `  { cmd:'/usage',       desc:'Token usage akurat sesi ini' },`,
  `  { cmd:'/bg',          desc:'Jalankan agent di background' },`,
  `  { cmd:'/bgstatus',    desc:'Status background agents' },`,
  `  { cmd:'/skills',      desc:'Lihat dan reload skill files' },`,
  `  { cmd:'/thinking',    desc:'Toggle extended thinking mode' },`,
  `  { cmd:'/permissions', desc:'Manage tool permissions' },`,
  `  { cmd:'/sessions',    desc:'Lihat dan restore sesi tersimpan' },`,
  `  { cmd:'/save',        desc:'Simpan sesi sekarang' },`,
  `  { cmd:'/debug',       desc:'Debug info: model, tokens, state' },`,
  `  { cmd:'/plugin',      desc:'Plugin marketplace' },`,
].join('\n');

c = c.replace(
  `  { cmd:'/tokens',     desc:'Breakdown token usage' },\n];`,
  `  { cmd:'/tokens',     desc:'Breakdown token usage' },\n${newCmds}\n];`
);

fs.writeFileSync(filePath, c);
console.log('✅ constants.js updated. New slash commands added.');
