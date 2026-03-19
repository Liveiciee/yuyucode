import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { MODELS } from '../constants.js';
import { callServer } from '../api.js';
import { runHooksV2, EFFORT_CONFIG, loadSkills, saveSkillFile, deleteSkillFile } from '../features.js';

export function useProjectStore() {
  // ── Project / Folder ──
  const [folder, setFolderRaw]     = useState('yuyucode');
  const [folderInput, setFolderInput] = useState('yuyucode');
  const [branch, setBranch]        = useState('main');
  const [notes, setNotesRaw]       = useState('');
  const [skill, setSkill]          = useState('');
  const [skills, setSkills]        = useState([]);

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
  const [permissions, setPermissionsRaw] = useState({
    read_file: true, write_file: true, exec: true,
    list_files: true, search: true, mcp: false,
    delete_file: false, browse: false,
  });
  const [hooks, setHooksRaw]           = useState({ preWrite: [], postWrite: [], postPush: [] });
  const [activePlugins, setActivePluginsRaw] = useState({});

  // ── GitHub ──
  const [githubToken, setGithubTokenRaw] = useState('');
  const [githubRepo, setGithubRepoRaw]  = useState('');
  const [githubData, setGithubData]     = useState(null);

  // ── Agent memory (cross-session user/project/local) ──
  const [agentMemory, setAgentMemory]   = useState({ user: [], project: [], local: [] });

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

  // ── addHistory ──
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
    folder: f, cmdHistory: ch, model: mo, pinned, recent,
    memories, checkpoints, hooks: hk, githubToken: ght, githubRepo: ghr,
    sessionColor: sc, plugins, effort: ef, thinkingEnabled: th, permissions: perm,
  }) {
    if (f)  { setFolderRaw(f); setFolderInput(f); }
    if (ch) { try { setCmdHistory(JSON.parse(ch)); } catch (_e) { } }
    if (mo) setModelRaw(mo);
    if (hk) { try { setHooksRaw(JSON.parse(hk)); } catch (_e) { } }
    if (ght) setGithubTokenRaw(ght);
    if (ghr) setGithubRepo(ghr);
    if (sc)  setSessionColorRaw(sc || null);
    if (plugins) { try { setActivePluginsRaw(JSON.parse(plugins)); } catch (_e) { } }
    if (ef)  setEffortRaw(ef);
    if (th)  setThinkingEnabled(th === '1');
    if (perm) { try { setPermissionsRaw(JSON.parse(perm)); } catch (_e) { } }
  }

  // ── Load folder-specific prefs ──
  async function loadFolderPrefs(f) {
    const [notesR, skillR, branchR] = await Promise.all([
      Preferences.get({ key: 'yc_notes_' + f }),
      callServer({ type: 'read', path: f + '/SKILL.md' }),
      callServer({ type: 'exec', path: f, command: 'git branch --show-current' }),
    ]);
    setNotesRaw(notesR.value || '');
    setSkill(skillR.ok ? skillR.data : '');
    if (branchR.ok) setBranch(branchR.data.trim());
    // Auto-load skills (unified: SKILL.md + .claude/skills/*), respect saved active map
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
    skill, setSkill, skills, setSkills, toggleSkill, uploadSkill, removeSkill,
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
    loadProjectPrefs, loadFolderPrefs,
  };
}
