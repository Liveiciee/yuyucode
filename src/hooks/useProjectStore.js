import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { MODELS } from '../constants.js';
import { callServer } from '../api.js';
import { runHooksV2, EFFORT_CONFIG, DEFAULT_PERMISSIONS, loadSkills, saveSkillFile, deleteSkillFile } from '../features.js';

export function useProjectStore() {
  // ── Battery ──
  const [batteryLevel, setBatteryLevel]     = useState(1);
  const [batteryCharging, setBatteryCharging] = useState(true);

  // ── Project / Folder ──
  const [folder, setFolderRaw]     = useState('');
  const [folderInput, setFolderInput] = useState('');
  const [branch, setBranch]        = useState('main');
  const [notes, setNotesRaw]       = useState('');
  const [skills, setSkills]        = useState([]);
  const [agentsMd, setAgentsMd]    = useState('');
  const [yuyuMd, setYuyuMd]        = useState('');
  const [diffReview, setDiffReviewRaw] = useState(false);

  // ── Server / Network ──
  const [serverOk, setServerOk]         = useState(true);
  const [netOnline, setNetOnline]       = useState(navigator.onLine);
  const [reconnectTimer, setReconnectTimer] = useState(0);
  const [mcpTools, setMcpTools]         = useState({});

  // ── Model / Effort ──
  const [model, setModelRaw]           = useState(MODELS[0].id);
  const [effort, setEffortRaw]         = useState('medium');
  const [thinkingEnabled, setThinkingEnabled] = useState(false);

  // ── Session identity ──
  const [sessionName, setSessionName]   = useState('');
  const [sessionColor, setSessionColorRaw] = useState(null);

  // ── Command history ──
  const [cmdHistory, setCmdHistory]     = useState([]);
  const [histIdx, setHistIdx]           = useState(-1);

  // ── Permissions / Hooks / Plugins ──
  const [permissions, setPermissionsRaw] = useState(DEFAULT_PERMISSIONS);
  const [hooks, setHooksRaw]           = useState({ preWrite: [], postWrite: [], postPush: [] });
  const [activePlugins, setActivePluginsRaw] = useState({});

  // ── GitHub ──
  const [githubToken, setGithubTokenRaw] = useState('');
  const [githubRepo, setGithubRepoRaw]  = useState('');
  const [githubData, setGithubData]     = useState(null);

  // ── Agent memory (cross-session user/project/local) ──
  const [agentMemory, setAgentMemory]   = useState({ user: [], project: [], local: [] });

  // ── Recent projects ──
  const [recentProjects, setRecentProjectsRaw] = useState([]);

  function addRecentProject(f) {
    const name = f.split('/').pop() || f;
    const entry = { path: f, name, lastOpened: Date.now() };
    setRecentProjectsRaw(prev => {
      const filtered = prev.filter(p => p.path !== f);
      const next = [entry, ...filtered].slice(0, 10);
      Preferences.set({ key: 'yc_recent_projects', value: JSON.stringify(next) });
      return next;
    });
  }

  function removeRecentProject(f) {
    setRecentProjectsRaw(prev => {
      const next = prev.filter(p => p.path !== f);
      Preferences.set({ key: 'yc_recent_projects', value: JSON.stringify(next) });
      return next;
    });
  }

  // ── Loop / PTT ──
  const [loopActive, setLoopActive]     = useState(false);
  const [loopIntervalRef, setLoopIntervalRef] = useState(null);
  const [pushToTalk, setPushToTalk]     = useState(false);

  // ── File watcher (belongs to project context) ──
  const [fileWatcherActive, setFileWatcherActive]     = useState(false);
  const [fileWatcherInterval, setFileWatcherInterval] = useState(null);
  const [fileSnapshots, setFileSnapshots]             = useState({});

  // ── Persisted setters ──
  function setFolder(f) {
    setFolderRaw(f);
    setFolderInput(f);
    Preferences.set({ key: 'yc_folder', value: f });
  }
  function saveFolder(f) {
    setFolder(f);
  }
  function setModel(id) {
    setModelRaw(id);
    Preferences.set({ key: 'yc_model', value: id });
  }
  function setEffort(e) {
    setEffortRaw(e);
    Preferences.set({ key: 'yc_effort', value: e });
  }
  function setNotes(n, folderKey) {
    setNotesRaw(n);
    if (folderKey) Preferences.set({ key: 'yc_notes_' + folderKey, value: n });
  }
  function setSessionColor(c) {
    setSessionColorRaw(c);
    Preferences.set({ key: 'yc_session_color', value: c || '' });
  }
  function setGithubToken(t) {
    setGithubTokenRaw(t);
    Preferences.set({ key: 'yc_gh_token', value: t });
  }
  function setGithubRepo(r) {
    setGithubRepoRaw(r);
    Preferences.set({ key: 'yc_gh_repo', value: r });
  }
  function setPermissions(p) {
    setPermissionsRaw(p);
    Preferences.set({ key: 'yc_permissions', value: JSON.stringify(p) });
  }
  function setHooks(h) {
    setHooksRaw(h);
    Preferences.set({ key: 'yc_hooks', value: JSON.stringify(h) });
  }
  function setActivePlugins(p) {
    setActivePluginsRaw(p);
    Preferences.set({ key: 'yc_plugins', value: JSON.stringify(p) });
  }

  function setDiffReview(v) {
    setDiffReviewRaw(v);
    Preferences.set({ key: 'yc_diff_review', value: v ? '1' : '0' });
  }
  function addHistory(cmd) {
    const next = [cmd, ...cmdHistory.filter(c => c !== cmd)].slice(0, 50);
    setCmdHistory(next);
    Preferences.set({ key: 'yc_cmdhist', value: JSON.stringify(next) });
  }

  // ── runHooks wrapper ──
  async function runHooks(type, context = '') {
    await runHooksV2(hooks[type] || [], context, folder);
  }

  // ── effortCfg derived ──
  const effortCfg = EFFORT_CONFIG[effort] || EFFORT_CONFIG.medium;

  // ── Load from Preferences ──
  function loadProjectPrefs({
    folder: f, cmdHistory: ch, model: mo, pinned: _pinned, recent: _recent,
    memories: _memories, checkpoints: _checkpoints, hooks: hk, githubToken: ght, githubRepo: ghr,
    sessionColor: sc, plugins, effort: ef, thinkingEnabled: th, permissions: perm, diffReview: dr,
  }) {
    const tryJSON = (val, setter) => { try { setter(JSON.parse(val)); } catch (_e) {} };

    if (f)       { setFolderRaw(f); setFolderInput(f); }
    if (ch)      tryJSON(ch, setCmdHistory);
    if (mo)      setModelRaw(mo);
    if (hk)      tryJSON(hk, setHooksRaw);
    if (ght)     setGithubTokenRaw(ght);
    if (ghr)     setGithubRepo(ghr);
    if (sc)      setSessionColorRaw(sc);
    if (plugins) tryJSON(plugins, setActivePluginsRaw);
    if (ef)      setEffortRaw(ef);
    if (th)      setThinkingEnabled(th === '1');
    if (dr)      setDiffReviewRaw(dr === '1');
    if (perm)    tryJSON(perm, setPermissionsRaw);
  }

  function loadRecentProjects(val) {
    try { if (val) setRecentProjectsRaw(JSON.parse(val)); } catch (_e) {}
  }

  // ── Load folder-specific prefs ──
  async function loadFolderPrefs(f) {
    const [notesR, branchR, agentsR, yuyuMdR] = await Promise.all([
      Preferences.get({ key: 'yc_notes_' + f }),
      callServer({ type: 'exec', path: f, command: 'git branch --show-current' }),
      callServer({ type: 'read', path: f + '/AGENTS.md' }),
      callServer({ type: 'read', path: f + '/YUYU.md' }),
    ]);
    setNotesRaw(notesR.value || '');
    if (branchR.ok) setBranch(branchR.data.trim());
    setAgentsMd(agentsR.ok && agentsR.data ? agentsR.data : '');
    setYuyuMd(yuyuMdR.ok && yuyuMdR.data ? yuyuMdR.data : '');
    (async () => {
      let activeMap = {};
      try { const r = await Preferences.get({ key: 'yc_skills_active_' + f }); activeMap = r.value ? JSON.parse(r.value) : {}; } catch (_e) {}
      const loaded = await loadSkills(f, activeMap);
      if (loaded.length) setSkills(loaded);
    })();
  }

  // ── Skill helpers ──
  async function toggleSkill(name) {
    const next = skills.map(s => s.name === name ? { ...s, active: !s.active } : s);
    setSkills(next);
    const activeMap = Object.fromEntries(next.map(s => [s.name, s.active]));
    Preferences.set({ key: 'yc_skills_active_' + folder, value: JSON.stringify(activeMap) });
  }
  async function uploadSkill(name, mdContent) {
    const r = await saveSkillFile(folder, name, mdContent);
    if (r.ok) {
      let activeMap = {};
      try { const pr = await Preferences.get({ key: 'yc_skills_active_' + folder }); activeMap = pr.value ? JSON.parse(pr.value) : {}; } catch (_e) {}
      const loaded = await loadSkills(folder, activeMap);
      setSkills(loaded);
    }
    return r;
  }
  async function removeSkill(name) {
    const r = await deleteSkillFile(folder, name);
    if (r.ok) {
      setSkills(prev => prev.filter(s => s.name !== name));
    }
    return r;
  }

  return {
    folder, setFolder, saveFolder, folderInput, setFolderInput,
    branch, setBranch,
    notes, setNotes,
    skills, setSkills, toggleSkill, uploadSkill, removeSkill,
    agentsMd, setAgentsMd,
    yuyuMd, setYuyuMd,
    diffReview, setDiffReview,
    serverOk, setServerOk,
    netOnline, setNetOnline,
    reconnectTimer, setReconnectTimer,
    mcpTools, setMcpTools,
    model, setModel,
    effort, setEffort, effortCfg,
    thinkingEnabled, setThinkingEnabled,
    sessionName, setSessionName,
    sessionColor, setSessionColor,
    cmdHistory, setCmdHistory,
    histIdx, setHistIdx,
    permissions, setPermissions,
    hooks, setHooks,
    activePlugins, setActivePlugins,
    githubToken, setGithubToken,
    githubRepo, setGithubRepo,
    githubData, setGithubData,
    agentMemory, setAgentMemory,
    loopActive, setLoopActive,
    loopIntervalRef, setLoopIntervalRef,
    pushToTalk, setPushToTalk,
    fileWatcherActive, setFileWatcherActive,
    fileWatcherInterval, setFileWatcherInterval,
    fileSnapshots, setFileSnapshots,
    addHistory, runHooks,
    loadProjectPrefs, loadFolderPrefs, loadRecentProjects,
    recentProjects, addRecentProject, removeRecentProject,
    batteryLevel, setBatteryLevel,
    batteryCharging, setBatteryCharging,
  };
}
