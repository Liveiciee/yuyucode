// src/utils/highlight.js
export function hl(code, lang = '') {
  let s = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const L = lang.toLowerCase();

  function protect(str, fn) {
    const saved = [];
    const hidden = str.replace(/<span[^>]*>.*?<\/span>/gs, m => {
      saved.push(m);
      return `_${saved.length - 1}_`;
    });
    const result = fn(hidden);
    return result.replace(/_(\d+)_/g, (_, i) => saved[+i]);
  }

  if (L === 'json') {
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color:#79b8ff">$1</span>$2'));
    s = protect(s, t => t.replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/\b(true|false|null)\b/g, '<span style="color:#f97583">$1</span>'));
    s = protect(s, t => t.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>'));
    return s;
  }
  if (L === 'bash' || L === 'sh') {
    s = protect(s, t => t.replace(/(#.*$)/gm, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/\b(echo|cd|ls|git|npm|node|export|source|if|then|fi|for|do|done|while|function|return|mkdir|cp|mv|rm|chmod|curl|wget)\b/g, '<span style="color:#c678dd">$1</span>'));
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/(\$\w+|\$\{[^}]+\})/g, '<span style="color:#79b8ff">$1</span>'));
    return s;
  }
  if (L === 'python' || L === 'py') {
    s = protect(s, t => t.replace(/(#.*$)/gm, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/(""".*?"""|'''.*?''')/gs, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/\b(def|class|import|from|return|if|elif|else|for|while|try|except|with|as|in|not|and|or|True|False|None|lambda|yield|async|await|pass|raise|del|global|nonlocal)\b/g, '<span style="color:#c678dd">$1</span>'));
    s = protect(s, t => t.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>'));
    return s;
  }
  if (L === 'css') {
    s = protect(s, t => t.replace(/(\/\*.*?\*\/)/gs, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/([.#]?[\w-]+)\s*\{/g, '<span style="color:#79b8ff">$1</span>{'));
    s = protect(s, t => t.replace(/([\w-]+)\s*:/g, '<span style="color:#b392f0">$1</span>:'));
    s = protect(s, t => t.replace(/:\s*([^;{]+)/g, ': <span style="color:#98c379">$1</span>'));
    return s;
  }
  // JS/JSX/TS/TSX and default
  s = protect(s, t => t.replace(/(\/\/.*$|\/\*.*?\*\/)/gms, '<span style="color:#6a737d">$1</span>'));
  s = protect(s, t => t.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#98c379">$1</span>'));
  s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
  s = protect(s, t => t.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|finally|class|new|this|from|of|in|typeof|instanceof|null|undefined|true|false|throw|switch|case|break|continue|extends|super|static|get|set|type|interface|enum|as|keyof|readonly)\b/g, '<span style="color:#c678dd">$1</span>'));
  s = protect(s, t => t.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span style="color:#79b8ff">$1</span>'));
  s = protect(s, t => t.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>'));
  return s;
}
