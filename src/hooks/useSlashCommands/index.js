// useSlashCommands/index.js — main entry point
import { useCallback } from 'react';
import { simpleResponse } from './helpers/simpleResponse.js';
import * as handlers from './handlers/index.js';

export function useSlashCommands(props) {
  // Map of simple actions (no complex logic)
  const simpleActions = {
    '/checkpoint': () => props.saveCheckpoint?.(),
    '/restore':    () => props.setShowCheckpoints?.(true),
    '/export':     () => props.exportChat?.(),
    '/actions':    () => props.setShowCustomActions?.(true),
    '/browse':     () => handlers.handleBrowse({ parts: [], browseTo: props.browseTo, setMessages: props.setMessages }),
    '/swarm':      () => {
      const task = props.parts?.slice(1).join(' ') || '';
      if (!task) simpleResponse(props.setMessages, 'Usage: /swarm <deskripsi task>');
      else props.runAgentSwarm?.(task);
    },
    '/theme':      () => handlers.handleTheme({ setShowThemeBuilder: props.setShowThemeBuilder, setMessages: props.setMessages }),
    '/github':     () => props.setShowGitHub?.(true),
    '/deploy':     () => props.setShowDeploy?.(true),
    '/skills':     () => props.setShowSkills?.(true),
    '/permissions':() => props.setShowPermissions?.(true),
    '/sessions':   async () => {
      const sessions = await import('../../../features.js').then(m => m.loadSessions());
      props.setSessionList?.(sessions);
      props.setShowSessions?.(true);
    },
    '/plugin':     () => props.setShowPlugins?.(true),
    '/config':     () => props.setShowConfig?.(true),
    '/bgstatus':   () => props.setShowBgAgents?.(true),
    '/ptt':        () => handlers.handlePtt({ pushToTalk: props.pushToTalk, setPushToTalk: props.setPushToTalk, setMessages: props.setMessages }),
    '/open':       () => handlers.handleOpen({ parts: props.parts, setMessages: props.setMessages }),
  };

  const handleSlashCommand = useCallback(async (cmd) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0];
    const context = { ...props, parts, sendMsg: props.sendMsg, setMessages: props.setMessages };

    // Simple actions
    if (simpleActions[base]) {
      await simpleActions[base]();
      return;
    }

    // Map command to handler
    const handlerMap = {
      '/model':      () => handlers.handleModel({ model: props.model, setModel: props.setModel, setMessages: props.setMessages }),
      '/effort':     () => handlers.handleEffort({ parts, effort: props.effort, setEffort: props.setEffort, setMessages: props.setMessages }),
      '/thinking':   () => handlers.handleThinking({ thinkingEnabled: props.thinkingEnabled, setThinkingEnabled: props.setThinkingEnabled, setMessages: props.setMessages }),
      '/compact':    () => handlers.handleCompact({ parts, compactContext: props.compactContext, setMessages: props.setMessages }),
      '/handoff':    () => handlers.handleHandoff({ folder: props.folder, messages: props.messages, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/clear':      () => handlers.handleClear({ parts, messages: props.messages, setMessages: props.setMessages, setGracefulStop: props.setGracefulStop, loading: props.loading }),
      '/stop':       () => handlers.handleStop({ loading: props.loading, setGracefulStop: props.setGracefulStop, setMessages: props.setMessages }),
      '/save':       () => handlers.handleSave({ parts, sessionName: props.sessionName, messages: props.messages, folder: props.folder, branch: props.branch, setSessionName: props.setSessionName, setMessages: props.setMessages }),
      '/rewind':     () => handlers.handleRewind({ parts, messages: props.messages, setMessages: props.setMessages }),
      '/rename':     () => handlers.handleRename({ parts, setSessionName: props.setSessionName, setMessages: props.setMessages }),
      '/pin':        () => handlers.handlePin({ parts, folder: props.folder, selectedFile: props.selectedFile, pinnedFiles: props.pinnedFiles, togglePin: props.togglePin, setMessages: props.setMessages }),
      '/unpin':      () => handlers.handleUnpin({ parts, folder: props.folder, selectedFile: props.selectedFile, togglePin: props.togglePin, setMessages: props.setMessages }),
      '/index':      () => handlers.handleIndex({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/tree':       () => handlers.handleTree({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/history':    () => handlers.handleHistory({ selectedFile: props.selectedFile, setShowFileHistory: props.setShowFileHistory, setMessages: props.setMessages }),
      '/review':     () => handlers.handleReview({ parts, folder: props.folder, selectedFile: props.selectedFile, fileContent: props.fileContent, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/lint':       () => handlers.handleLint({ folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/refactor':   () => handlers.handleRefactor({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/bg':         () => handlers.handleBg({ parts, folder: props.folder, callAI: props.callAI, setShowBgAgents: props.setShowBgAgents, setMessages: props.setMessages, sendNotification: props.sendNotification, haptic: props.haptic }),
      '/bgmerge':    () => handlers.handleBgMerge({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages, setMergeConflictData: props.setMergeConflictData, setShowMergeConflict: props.setShowMergeConflict }),
      '/loop':       () => handlers.handleLoop({ parts, folder: props.folder, loopActive: props.loopActive, loopIntervalRef: props.loopIntervalRef, setLoopActive: props.setLoopActive, setLoopIntervalRef: props.setLoopIntervalRef, setMessages: props.setMessages }),
      '/amemory':    () => handlers.handleAmemory({ parts, agentMemory: props.agentMemory, setAgentMemory: props.setAgentMemory, setMessages: props.setMessages }),
      '/summarize':  () => handlers.handleSummarize({ parts, messages: props.messages, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/cost':       () => handlers.handleCost({ setMessages: props.setMessages }),
      '/usage':      () => handlers.handleUsage({ setMessages: props.setMessages }),
      '/tokens':     () => handlers.handleTokens({ messages: props.messages, setMessages: props.setMessages }),
      '/mcp':        () => handlers.handleMcp({ parts, setShowMCP: props.setShowMCP, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/db':         () => handlers.handleDb({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/websearch':  () => handlers.handleWebsearch({ parts, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/diff':       () => handlers.handleDiff({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/status':     () => handlers.handleStatus({ folder: props.folder, model: props.model, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/init':       () => handlers.handleInit({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/scaffold':   () => handlers.handleScaffold({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/rules':      () => handlers.handleRules({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/test':       () => handlers.handleTest({ parts, folder: props.folder, selectedFile: props.selectedFile, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/bench':      () => handlers.handleBench({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/self-edit':  () => handlers.handleSelfEdit({ parts, folder: props.folder, setLoading: props.setLoading, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/ab':         () => handlers.handleAb({ parts, abTest: props.abTest, setMessages: props.setMessages }),
      '/xp':         () => handlers.handleXp({ growth: props.growth, setMessages: props.setMessages }),
      '/debug':      () => handlers.handleDebug({ model: props.model, effort: props.effort, thinkingEnabled: props.thinkingEnabled, messages: props.messages, skills: props.skills, folder: props.folder, branch: props.branch, setMessages: props.setMessages }),
      '/deps':       () => handlers.handleDeps({ selectedFile: props.selectedFile, setLoading: props.setLoading, setMessages: props.setMessages, setDepGraph: props.setDepGraph, setShowDepGraph: props.setShowDepGraph }),
      '/plan':       () => handlers.handlePlan({ parts, folder: props.folder, callAI: props.callAI, setLoading: props.setLoading, setMessages: props.setMessages, setPlanSteps: props.setPlanSteps, setPlanTask: props.setPlanTask }),
      '/ask':        () => handlers.handleAsk({ parts, setMessages: props.setMessages, sendMsg: props.sendMsg }),
      '/undo':       () => handlers.handleUndo({ parts, editHistory: props.editHistory, setEditHistory: props.setEditHistory, setMessages: props.setMessages }),
      '/color':      () => handlers.handleColor({ parts, sessionColor: props.sessionColor, setSessionColor: props.setSessionColor, setMessages: props.setMessages }),
      '/split':      () => handlers.handleSplit({ splitView: props.splitView, setSplitView: props.setSplitView, setMessages: props.setMessages }),
      '/watch':      () => handlers.handleWatch({ fileWatcherActive: props.fileWatcherActive, fileWatcherInterval: props.fileWatcherInterval, setFileWatcherActive: props.setFileWatcherActive, setFileWatcherInterval: props.setFileWatcherInterval, setFileSnapshots: props.setFileSnapshots, setMessages: props.setMessages }),
      '/simplify':   () => handlers.handleSimplify({ selectedFile: props.selectedFile, sendMsg: props.sendMsg, setMessages: props.setMessages }),
      '/font':       () => handlers.handleFont({ parts, setFontSize: props.setFontSize, setMessages: props.setMessages }),
      '/batch':      () => handlers.handleBatch({ parts, folder: props.folder, abortRef: props.abortRef, callAI: props.callAI, setLoading: props.setLoading, setMessages: props.setMessages }),
      '/search':     () => handlers.handleSearch({ parts, searchMessages: props.searchMessages, setMessages: props.setMessages }),
    };

    const handler = handlerMap[base];
    if (handler) {
      await handler();
    } else {
      simpleResponse(props.setMessages, '❓ Command tidak dikenal: ' + base);
    }
  }, [props]);

  return { handleSlashCommand };
}
