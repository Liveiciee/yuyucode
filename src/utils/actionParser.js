// src/utils/actionParser.js
export function parseActions(text) {
  const regex = /```action\n(.*?)```/gs;
  const actions = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    try { actions.push(JSON.parse(m[1].trim())); } catch (_e) { }
  }
  return actions;
}
