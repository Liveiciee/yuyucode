// src/utils/actionParser.js

const FENCE_RE = /```action\n(.*?)```/gs;

/**
 * Attempt to recover common LLM JSON issues before giving up.
 * Only fixes unambiguous syntactic noise — never mutates values.
 *
 * Handles:
 *  - Trailing commas before } or ]
 *  - Unquoted object keys  →  {"key": value}
 *  - Single-quoted strings →  "double"
 *  - Dangling opening brace with no closing (truncated output)
 */
function tryRepairJson(raw) {
  if (!raw) return null;
  let s = raw.trim();

  // Trailing commas before closing bracket/brace
  s = s.replace(/,(\s*[}\]])/g, '$1');

  // Unquoted identifier keys: { key: "v" } → { "key": "v" }
  s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');

  // Single-quoted string values/keys → double-quoted
  // Only handle simple cases (no escaped single quotes inside)
  s = s.replace(/'([^'\\]*)'/g, '"$1"');

  // Attempt to auto-close truncated object (missing closing brace)
  const opens  = (s.match(/\{/g) || []).length;
  const closes = (s.match(/\}/g) || []).length;
  if (opens > closes) s += '}'.repeat(opens - closes);

  try { return JSON.parse(s); } catch { return null; }
}

/**
 * Parse ```action blocks from AI reply text.
 *
 * Backward compatible: silently drops irrecoverably invalid JSON,
 * but now also attempts light repair before giving up.
 *
 * @param {string} text - Raw AI reply
 * @returns {object[]} Parsed action objects
 */
export function parseActions(text) {
  if (!text) return [];
  const actions = [];
  const re = new RegExp(FENCE_RE.source, FENCE_RE.flags);
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1].trim();
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = tryRepairJson(raw);
    }
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      actions.push(parsed);
    }
  }
  return actions;
}

/**
 * Like parseActions, but also returns diagnostics — useful for the agent loop
 * to surface partial failures without crashing the whole run.
 *
 * @param {string} text - Raw AI reply
 * @returns {{
 *   actions:  object[],
 *   errors:   Array<{raw: string, hint: string, recovered: boolean}>,
 *   repaired: number,
 *   total:    number
 * }}
 */
export function parseActionsWithMeta(text) {
  if (!text) return { actions: [], errors: [], repaired: 0, total: 0 };

  const actions  = [];
  const errors   = [];
  let   repaired = 0;
  const re = new RegExp(FENCE_RE.source, FENCE_RE.flags);
  let m;

  while ((m = re.exec(text)) !== null) {
    const raw = m[1].trim();
    let parsed   = null;
    let wasFixed = false;

    try {
      parsed = JSON.parse(raw);
    } catch (e1) {
      const fixed = tryRepairJson(raw);
      if (fixed !== null) {
        parsed  = fixed;
        wasFixed = true;
        repaired++;
      } else {
        errors.push({ raw: raw.slice(0, 200), hint: e1.message, recovered: false });
        continue;
      }
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      errors.push({ raw: raw.slice(0, 200), hint: 'Expected plain object', recovered: wasFixed });
      continue;
    }

    if (!parsed.type) {
      // Still include the action — caller decides what to do — but flag it
      errors.push({ raw: raw.slice(0, 200), hint: 'Missing required field: type', recovered: wasFixed });
    }

    actions.push(parsed);
  }

  return { actions, errors, repaired, total: actions.length + errors.length };
}
