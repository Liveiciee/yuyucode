import { askCerebrasStream } from '../../api.js';
import { buildSystemPrompt } from './systemPrompt.js';

export async function abTest(task, modelA, modelB, project, chat, file, abortRef, growth) {
  const cfg  = project.effortCfg;
  const msgs = [{ role: 'user', content: task }];
  const sys  = buildSystemPrompt(task, cfg, project, chat, file, growth);
  const full = [{ role: 'system', content: sys }, ...msgs];

  chat.setMessages(m => [...m,
    { role: 'user', content: task, actions: [] },
    { role: 'assistant', content: `⚗️ **A/B Test:** \`${modelA.split('/').pop()}\` vs \`${modelB.split('/').pop()}\`
Menunggu kedua model...`, actions: [] }
  ]);

  const ctrl = new AbortController();
  abortRef.current = ctrl;
  chat.setLoading(true);

  let outA = '', outB = '';
  try {
    const [replyA, replyB] = await Promise.all([
      askCerebrasStream(full, modelA, (t) => { outA = t; }, ctrl.signal, { maxTokens: cfg.maxTokens }),
      askCerebrasStream(full, modelB, (t) => { outB = t; }, ctrl.signal, { maxTokens: cfg.maxTokens }),
    ]);
    outA = replyA; outB = replyB;
  } catch (_e) {
    chat.setMessages(m => [...m, { role: 'assistant', content: '❌ A/B test gagal.', actions: [] }]);
    chat.setLoading(false);
    return;
  }

  const labelA = modelA.split('/').pop().slice(0, 20);
  const labelB = modelB.split('/').pop().slice(0, 20);
  chat.setMessages(m => [
    ...m.slice(0, -1),
    {
      role: 'assistant',
      content: `⚗️ **A/B Test selesai!**

**🅰 ${labelA}:**
${outA.slice(0, 1500)}

---

**🅱 ${labelB}:**
${outB.slice(0, 1500)}

*Pilih yang terbaik untuk dilanjutkan, atau ketik pesan baru.*`,
      actions: [],
    }
  ]);
  chat.setLoading(false);
  growth?.addXP('message_sent');
}
