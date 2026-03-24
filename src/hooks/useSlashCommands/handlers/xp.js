// xp.js — handlers untuk /xp, /usage, /cost, /debug, /tokens
import { tokenTracker, countTokens } from '../../../features.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleXp({ growth, setMessages }) {
  if (!growth) {
    simpleResponse(setMessages, 'Growth system tidak aktif.');
    return;
  }
  
  const BADGE_DEFS = [
    { id: 'first_blood', label: '🩸 First Blood' }, { id: 'apprentice', label: '🌱 Apprentice' },
    { id: 'coder', label: '⚡ Coder' }, { id: 'hacker', label: '🔥 Hacker' },
    { id: 'streak_3', label: '📅 Konsisten' }, { id: 'streak_7', label: '🗓 Seminggu Penuh' },
    { id: 'streak_30', label: '👑 One Month' },
  ];
  
  const badgeList = growth.badges.length
    ? growth.badges.map(id => BADGE_DEFS.find(x => x.id === id)?.label || id).join(', ')
    : 'Belum ada';
  
  const styleInfo = growth.learnedStyle
    ? '\n\n**🧬 Gaya coding yang dipelajari:**\n' + growth.learnedStyle
    : '\n\n_Yuyu belum belajar gaya codingmu. Lanjutkan sesi!_';
  
  simpleResponse(setMessages,
    `🎮 **YuyuCode Growth**\n\n` +
    `**Level:** ${growth.level}\n` +
    `**XP:** ${growth.xp}${growth.nextXp ? ' / ' + growth.nextXp + ' (' + growth.progress + '%)' : ' — MAX LEVEL 👑'}\n` +
    `**Streak:** 🔥 ${growth.streak} hari\n` +
    `**Badge:** ${badgeList}` +
    styleInfo
  );
}

export function handleUsage({ setMessages }) {
  simpleResponse(setMessages, tokenTracker.summary());
}

export function handleCost({ setMessages }) {
  const summary = tokenTracker.summary();
  const gpt4Cost = ((tokenTracker.inputTokens / 1000) * 0.03 + (tokenTracker.outputTokens / 1000) * 0.06).toFixed(3);
  simpleResponse(setMessages, summary + '\n\n💰 **Estimasi vs GPT-4o:** ~$' + gpt4Cost + ' (kamu pakai gratis 🎉)');
}

export function handleDebug({ model, effort, thinkingEnabled, messages, skills, folder, branch, setMessages: setMsg }) {
  const info = [
    '**Debug Info**',
    'Model: ' + model,
    'Effort: ' + effort,
    'Thinking: ' + (thinkingEnabled ? 'on' : 'off'),
    'Messages: ' + messages.length,
    'Tokens (est): ~' + countTokens(messages) + 'tk',
    'Skills: ' + skills.length,
    'Folder: ' + folder,
    'Branch: ' + branch
  ].join('\n');
  simpleResponse(setMsg, info);
}

export function handleTokens({ messages, setMessages }) {
  const breakdown = messages.slice(-10).map(m => {
    const tk = Math.round((m.content || '').length / 4);
    return (m.role === 'user' ? 'Papa' : 'Yuyu') + ': ~' + tk + 'tk';
  }).join('\n');
  simpleResponse(setMessages, '📓 **Token breakdown (10 pesan terakhir)**\n```\n' + breakdown + '\n```\n**Total:** ~' + countTokens(messages) + 'tk | Cerebras gratis 🎉');
}
