const CONFIG = {
  MIN_SIMILARITY: 0.25,
  MYERS_LIMIT: 1500,
  BASE_LIMIT: 120,
  MAX_EDIT_RATIO: 1.3,
  SAMPLE_SIZE: 120,
  MAX_OPS: 400000,
  BLOCK_SIZE: 5,
  ANCHOR_FREQ_THRESHOLD: 3,
  ANCHOR_MAX_MATCHES_PER_LINE: 2,
  RECENT_WINDOW: 40,
  STOPWORDS: new Set(['the', 'a', 'an', 'to', 'of', 'in', 'for', 'and', 'or', 'is', 'it', 'if', 'else', 'return', 'const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'async', 'await']),
  HASH_MOD: 2147483647,
  BASE1: 31,
  BASE2: 37,
  ANCHOR_DENSITY_LOW: 0.01,
  ANCHOR_DENSITY_HIGH: 0.3,
  MIN_LINES_FOR_DENSITY: 50,
  REPLACE_SIMILARITY_THRESHOLD: 0.6,
  REORDER_PENALTY_FACTOR: 0.5,
  HEURISTIC_HEAD_LINES: 6,
  HEURISTIC_TAIL_LINES: 6,
  TOKEN_LEVENSHTEIN_MAX: 100,
  IDENTIFIER_MAP_THRESHOLD: 0.8,
  MOVE_BLOCK_MIN_LINES: 3,
  TOKEN_WEIGHTS: {
    keyword: 2.0,
    punct: 1.8,
    operator: 1.5,
    identifier: 1.0,
    string: 1.0,
    number: 1.0,
    other: 0.8
  }
};

export default CONFIG;
