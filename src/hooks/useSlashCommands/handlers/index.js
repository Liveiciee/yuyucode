// handlers/index.js — export all handlers
export { handleModel, handleEffort, handleThinking } from './model.js';
export { handleClear, handleStop, handleSave, handleRewind, handleRename, handleCompact, handleHandoff } from './chat.js';
export { handlePin, handleUnpin, handleIndex, handleTree, handleHistory } from './file.js';
export { handleReview, handleLint, handleRefactor } from './review.js';
export { handleBg, handleBgMerge, handleBgStatus, handleLoop } from './agent.js';
export { handleAmemory, handleSummarize, handleCost, handleUsage, handleTokens } from './memory.js';
export { handleMcp, handleDb, handleWebsearch, handleBrowse, handleOpen } from './tools.js';
export { handleInit, handleScaffold, handleRules } from './project.js';
export { handleTest, handleBench, handleSelfEdit, handleAb } from './dev.js';
export { handleTheme, handleFont, handleColor, handleSplit, handlePtt, handleWatch, handleSimplify } from './ui.js';
export { handleXp, handleUsage as handleUsageXp, handleCost as handleCostXp, handleDebug, handleTokens as handleTokensXp } from './xp.js';
export { handleDiff, handleHistory as handleGitHistory, handleStatus } from './git.js';
export { handlePlan, handleAsk } from './plan.js';
export { handleBatch } from './batch.js';
export { handleDeps } from './deps.js';
export { handleUndo, handleRewind as handleRewindUndo } from './undo.js';
