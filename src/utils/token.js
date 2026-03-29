// src/utils/token.js
export function countTokens(msgs) {
  return Math.round(msgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
}
