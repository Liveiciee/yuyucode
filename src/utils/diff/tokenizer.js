import CONFIG from './config.js';

export function tokenize(line) {
  const tokens = [];
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    if (char === '`' || char === '"' || char === "'") {
      const quote = char;
      let j = i + 1;
      let escaped = false;
      
      while (j < line.length) {
        if (escaped) {
          escaped = false;
          j++;
        } else if (line[j] === '\\') {
          escaped = true;
          j++;
        } else if (line[j] === quote) {
          j++;
          break;
        } else if (quote === '`' && line[j] === '$' && line[j + 1] === '{') {
          break;
        } else {
          j++;
        }
      }
      
      const value = line.slice(i, j);
      tokens.push({ value, type: 'string' });
      i = j;
      continue;
    }
    
    if (/\d/.test(char) || (char === '.' && /\d/.test(line[i + 1]))) {
      const numRegex = /^\d[\d.eE+xX]*$/;
      let j = i;
      while (j < line.length && numRegex.test(line.slice(i, j + 1))) j++;
      tokens.push({ value: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }
    
    if (/[a-zA-Z_$]/.test(char)) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const value = line.slice(i, j);
      const type = CONFIG.STOPWORDS.has(value) ? 'keyword' : 'identifier';
      tokens.push({ value, type });
      i = j;
      continue;
    }
    
    const ops = ['===', '!==', '==', '!=', '<=', '>=', '=>', '**', '++', '--', '&&', '||', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^='];
    let foundOp = false;
    for (const op of ops) {
      if (line.slice(i, i + op.length) === op) {
        tokens.push({ value: op, type: 'operator' });
        i += op.length;
        foundOp = true;
        break;
      }
    }
    if (foundOp) continue;
    
    if (/[+\-*/%=<>!&|^~?:]/.test(char)) {
      tokens.push({ value: char, type: 'operator' });
      i++;
      continue;
    }
    
    if (/[{}()\[\];,]/.test(char)) {
      tokens.push({ value: char, type: 'punct' });
      i++;
      continue;
    }
    
    tokens.push({ value: char, type: 'other' });
    i++;
  }
  
  return tokens;
}

export function getWeightedStructuralSignature(tokens) {
  const parts = [];
  let totalWeight = 0;
  
  for (const t of tokens) {
    const weight = CONFIG.TOKEN_WEIGHTS[t.type] || 1;
    totalWeight += weight;
    
    if (t.type === 'identifier') parts.push('$ID');
    else if (t.type === 'string') parts.push('$STR');
    else if (t.type === 'number') parts.push('$NUM');
    else parts.push(t.value);
  }
  
  return { signature: parts.join(' '), weight: totalWeight };
}

export function extractIdentifiers(tokens) {
  return tokens.filter(t => t.type === 'identifier').map(t => t.value);
}

export function normalizeLine(line) {
  return line.trim().replace(/\s+/g, ' ').replace(/[;:,]$/, '').toLowerCase();
}

export function isWeakAnchor(line) {
  const normalized = normalizeLine(line);
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) return true;
  if (words.length <= 2 && words.every(w => CONFIG.STOPWORDS.has(w))) return true;
  
  const uniqueWords = new Set(words);
  if (uniqueWords.size <= 2 && words.length > 3) return true;
  
  return false;
}
