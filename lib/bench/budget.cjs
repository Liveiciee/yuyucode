// budget.cjs
const { readJSONSafe, writeJSONSafe } = require('./utils.cjs');
const { BUDGET_FILE } = require('./config.cjs');

function loadBudget() {
  return readJSONSafe(BUDGET_FILE);
}

function saveBudget(budget) {
  writeJSONSafe(BUDGET_FILE, budget);
}

function setBudget(name, limit, type = 'max') {
  const budget = loadBudget();
  if (!budget[name]) budget[name] = {};
  budget[name] = { limit, type, updatedAt: new Date().toISOString() };
  saveBudget(budget);
  console.log(`💰 Budget set: ${name} ${type === 'max' ? '<=' : '>='} ${limit}`);
}

function checkBudget(scores) {
  const budget = loadBudget();
  const violations = [];

  for (const [name, data] of Object.entries(budget)) {
    if (!scores[name]) continue;
    const current = scores[name];
    const { limit, type } = data;

    if (type === 'max' && current > limit) {
      violations.push({ name, current, limit, diff: ((current - limit) / limit * 100).toFixed(2) });
    } else if (type === 'min' && current < limit) {
      violations.push({ name, current, limit, diff: ((limit - current) / limit * 100).toFixed(2) });
    }
  }

  return violations;
}

module.exports = { loadBudget, saveBudget, setBudget, checkBudget };
