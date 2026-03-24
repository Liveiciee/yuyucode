// plan.js — handlers untuk /plan, /ask
import { generatePlan } from '../../../features.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handlePlan({ parts, folder, callAI, setLoading, setMessages, setPlanSteps, setPlanTask }) {
  const task = parts.slice(1).join(' ').trim();
  if (!task) {
    simpleResponse(setMessages, 'Usage: /plan <task>\nContoh: /plan implementasi dark mode toggle');
    return;
  }
  
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '📋 Generating plan...');
    const ctrl = new AbortController();
    try {
      const { steps } = await generatePlan(task, folder, callAI, ctrl.signal);
      setPlanSteps(steps.map(s => ({ ...s, done: false })));
      setPlanTask(task);
      simpleResponse(setMessages, '📋 **Plan (' + steps.length + ' langkah):**\n\n' + steps.map(s => s.num + '. ' + s.text).join('\n'));
    } catch (e) {
      if (e.name !== 'AbortError') simpleResponse(setMessages, '❌ ' + e.message);
    }
  });
}

export function handleAsk({ parts, setMessages, sendMsg }) {
  const modelAlias = {
    'kimi': 'moonshotai/kimi-k2-instruct-0905',
    'llama': 'llama-3.3-70b-versatile',
    'llama8b': 'llama-3.1-8b-instant',
    'qwen': 'qwen/qwen3-32b',
    'scout': 'meta-llama/llama-4-scout-17b-16e-instruct',
    'qwen235': 'qwen-3-235b-a22b-instruct-2507',
  };
  
  const alias = parts[1]?.toLowerCase();
  const targetModel = modelAlias[alias] || parts[1];
  const prompt = parts.slice(2).join(' ').trim();
  
  if (!targetModel || !prompt) {
    simpleResponse(setMessages, '🤖 Usage: `/ask <model> <prompt>`\n\nAlias: `kimi` `llama` `llama8b` `qwen` `scout` `qwen235`\n\nContoh: `/ask kimi review kode ini`');
  } else {
    simpleResponse(setMessages, '🤖 Asking **' + alias + '** (' + targetModel.split('/').pop() + ')...');
    sendMsg(prompt, { overrideModel: targetModel });
  }
}
