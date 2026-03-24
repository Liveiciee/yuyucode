// dev.js — handlers untuk /test, /bench, /self-edit, /ab
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleTest({ parts, folder, selectedFile, setLoading, setMessages, sendMsg }) {
  const targetPath = parts.slice(1).join(' ').trim();
  const filePath = targetPath ? folder + '/' + targetPath.replace(/^\//, '') : selectedFile;
  
  if (!filePath) {
    simpleResponse(setMessages, 'Usage: /test atau /test src/api.js\nBuka file dulu, atau sebutkan path-nya.');
    return;
  }
  
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🧪 Generating tests untuk **' + filePath.split('/').pop() + '**...');
    const r = await callServer({ type: 'read', path: filePath });
    if (!r.ok) {
      simpleResponse(setMessages, '❌ Tidak bisa baca file: ' + filePath);
      return;
    }
    const ext = filePath.split('.').pop();
    const testPath = filePath.replace(/\.(jsx?|tsx?)$/, '.test.$1').replace(/(src\/)/, '$1');
    await sendMsg(
      'Generate unit tests untuk file ini:\n\nFile: ' + filePath + '\n```' + ext + '\n' + r.data.slice(0, 4000) + '\n```\n\n' +
      'Buat test file di: ' + testPath + '\n' +
      'Gunakan Vitest (import { describe, it, expect } from "vitest"). ' +
      'Cover: happy path, edge case, error case. ' +
      'Langsung write_file, jangan tanya.'
    );
  });
}

export function handleBench({ parts, folder, setLoading, setMessages }) {
  const sub = parts[1]?.toLowerCase();
  const subCmds = {
    save:    'node yuyu-bench.cjs --save 2>&1',
    reset:   'node yuyu-bench.cjs --reset 2>&1',
    trend:   'node yuyu-bench.cjs --trend 2>&1',
    export:  'node yuyu-bench.cjs --export 2>&1',
  };

  if (sub && !subCmds[sub]) {
    simpleResponse(setMessages, '📊 **Usage /bench:**\n`/bench` — run + compare ke baseline\n`/bench save` — update baseline\n`/bench reset` — hapus history\n`/bench trend` — lihat sparkline history\n`/bench export` — export history ke JSON');
    return;
  }

  const cmd = subCmds[sub] || 'node yuyu-bench.cjs 2>&1';
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, `📊 Running \`${cmd.split(' ').slice(0, 3).join(' ')}\`...`);
    const r = await callServer({ type: 'exec', path: folder, command: cmd });
    const output = (r.data || r.error || '(no output)').slice(0, 3000);
    const hasRegression = output.includes('🔴') || output.includes('regression');
    const hasThermal = output.includes('THERMAL WARNING');
    const icon = hasRegression ? '⚠️' : hasThermal ? '🌡' : '✅';
    simpleResponse(setMessages, `${icon} **Bench result:**\n\`\`\`\n${output}\n\`\`\``);
  });
}

export function handleSelfEdit({ parts, folder, setLoading, setMessages, sendMsg }) {
  const task = parts.slice(1).join(' ').trim() || 'Fix bugs, hapus dead code, optimasi performa';
  withLoading(setLoading, async () => {
    const appPath = folder + '/src/App.jsx';
    const r = await callServer({ type: 'read', path: appPath, from: 1, to: 50 });
    if (!r.ok) {
      simpleResponse(setMessages, `❌ Tidak bisa baca \`${appPath}\`\n\nPastikan folder project sudah benar.`);
      return;
    }
    simpleResponse(setMessages, `🔧 **Self-edit dimulai...**\n\nTask: _${task}_`);
    await sendMsg(`MODE: SELF-EDIT\n\nTask: ${task}\n\nBaca src/App.jsx secara bertahap dengan read_file (from/to 100 baris per request). Setelah baca bagian yang relevan, gunakan write_file untuk patch minimal. Jangan tulis ulang seluruh file.`);
  });
}

export function handleAb({ parts, abTest, setMessages }) {
  const task = parts.slice(1).join(' ').trim();
  if (!task) {
    simpleResponse(setMessages, 'Usage: /ab <task>\nContoh: /ab implementasi dark mode toggle\n\nOtomatis test dua model terbaik secara paralel.');
    return;
  }
  abTest(task, 'qwen-3-235b-a22b-instruct-2507', 'moonshotai/kimi-k2-instruct-0905');
}
