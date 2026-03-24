// batch.js — handlers untuk /batch
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';
import { processBatchFile } from '../helpers/processBatchFile.js';

export function handleBatch({ parts, folder, abortRef, callAI, setLoading, setMessages }) {
  const batchCmd = parts.slice(1).join(' ').trim();
  if (!batchCmd) {
    simpleResponse(setMessages, 'Usage: /batch <command>\nContoh: /batch tambah JSDoc ke setiap fungsi\nAkan dijalankan ke semua file di src/');
    return;
  }
  
  withLoading(setLoading, async () => {
    const listR = await callServer({ type: 'list', path: folder + '/src' });
    if (!listR.ok) {
      simpleResponse(setMessages, '❌ Tidak bisa list src/');
      return;
    }
    
    const files = (listR.data || []).filter(f => !f.isDir && (f.name.endsWith('.jsx') || f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx')));
    simpleResponse(setMessages, '📦 **Batch: ' + batchCmd + '**\n' + files.length + ' file akan dianalisis (baca penuh)...');
    
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const allWrites = [];
    let skipped = 0;
    let failed = 0;
    
    for (const f of files) {
      if (ctrl.signal.aborted) break;
      const result = await processBatchFile(f, folder, batchCmd, callAI, ctrl.signal, setMessages);
      if (result === 'aborted') break;
      if (result === 'failed') { failed++; continue; }
      if (result === 'skipped') { skipped++; continue; }
      allWrites.push(...result);
      simpleResponse(setMessages, '  ' + (result.length > 0 ? '✅' : '⏭') + ' ' + f.name + (result.length > 0 ? ' — ' + result.length + ' perubahan' : ''));
    }
    
    if (allWrites.length > 0) {
      simpleResponse(setMessages, '📦 **Batch siap — menunggu approval!**\n' + allWrites.length + ' perubahan di ' + new Set(allWrites.map(w => w.path.split('/').pop())).size + ' file (' + skipped + ' di-skip, ' + failed + ' gagal).\nReview dan approve di bawah~');
    } else {
      simpleResponse(setMessages, '📦 Batch selesai — tidak ada perubahan diperlukan (' + skipped + ' di-skip, ' + failed + ' gagal).');
    }
  });
}
