// src/hooks/useAgentLoop/callAI.js
import { askCerebrasStream } from '../../api.js';
import { VISION_MODEL } from '../../constants.js';

export function callAI(msgs, onChunk, signal, imageBase64, project, chat) {
  const cfg   = project.effortCfg;
  const model = imageBase64 ? VISION_MODEL : project.model;
  return askCerebrasStream(msgs, model, onChunk, signal, {
    maxTokens: cfg.maxTokens,
    imageBase64,
    onFallback: (fallbackModel) => {
      const label = fallbackModel.split('/').pop().split('-').slice(0, 3).join('-');
      chat.setMessages(m => [...m, {
        role: 'assistant',
        content: '⚡ Rate limit — lanjut pakai **' + label + '**',
        actions: [],
      }]);
    },
  });
}
