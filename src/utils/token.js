// src/utils/token.js

const CHARS_PER_TOKEN = 4;

/**
 * Rough token count across all messages.
 * Uses the standard chars/4 heuristic — same formula as before.
 *
 * @param {object[]} msgs - Array of {role, content} message objects
 * @returns {number} Estimated total tokens
 */
export function countTokens(msgs) {
  return Math.round(
    msgs.reduce((a, m) => a + (m.content?.length || 0), 0) / CHARS_PER_TOKEN
  );
}

/**
 * Per-message token breakdown.
 * xp.js was computing this inline — now it lives here.
 *
 * @param {object[]} msgs
 * @returns {Array<{role: string, tokens: number, chars: number}>}
 */
export function countTokensBreakdown(msgs) {
  return msgs.map(m => ({
    role:   m.role   ?? 'unknown',
    tokens: Math.round((m.content?.length || 0) / CHARS_PER_TOKEN),
    chars:  m.content?.length || 0,
  }));
}

/**
 * Context window usage estimate — shows how full the context is.
 *
 * @param {object[]} msgs
 * @param {number}  [limit=8192] - Model context limit in tokens
 * @returns {{
 *   used:     number,
 *   limit:    number,
 *   free:     number,
 *   pct:      number,
 *   warning:  boolean,   // ≥ 70%
 *   critical: boolean    // ≥ 90%
 * }}
 */
export function estimateContextUsage(msgs, limit = 8192) {
  const used = countTokens(msgs);
  const pct  = Math.round((used / limit) * 100);
  return {
    used,
    limit,
    free:     Math.max(0, limit - used),
    pct,
    warning:  pct >= 70,
    critical: pct >= 90,
  };
}

/**
 * Trim a message array to fit within a token budget.
 *
 * Strategy:
 *  1. Always preserve system message (if first msg has role='system')
 *  2. Always preserve the `keepRecent` most recent messages
 *  3. Remove oldest middle messages until budget is satisfied
 *
 * @param {object[]} msgs
 * @param {number}   budget       - Max tokens to target
 * @param {number}  [keepRecent=4] - Minimum recent messages to keep
 * @returns {object[]} Trimmed message array (original array is not mutated)
 */
export function trimToTokenBudget(msgs, budget, keepRecent = 4) {
  if (!msgs.length) return msgs;
  if (countTokens(msgs) <= budget) return msgs;

  const hasSystem = msgs[0]?.role === 'system';
  const system    = hasSystem ? [msgs[0]] : [];
  const rest      = hasSystem ? msgs.slice(1) : msgs;
  const tail      = rest.slice(-Math.max(keepRecent, 1));
  let   middle    = rest.slice(0, rest.length - tail.length);

  while (middle.length > 0 && countTokens([...system, ...middle, ...tail]) > budget) {
    middle = middle.slice(1);
  }

  return [...system, ...middle, ...tail];
}
