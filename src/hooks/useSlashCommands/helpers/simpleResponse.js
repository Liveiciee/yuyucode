// simpleResponse.js — helper untuk response singkat
export function simpleResponse(setMessages, content) {
  setMessages(m => [...m, { role: 'assistant', content, actions: [] }]);
}
