// Shared helpers for useAgentLoop tests
function makeProject(o = {}) {
  return {
    folder: '/tmp/project',
    name: 'test-project',
    permissions: { exec: false, write_file: false, read_file: true },
    ...o,
  };
}

function makeChat(o = {}) {
  return {
    messages: [],
    loading: false,
    gracefulStop: false,
    ttsEnabled: false,
    ...o,
  };
}

function makeFile(name, isDir = false) {
  return { name, path: `/tmp/project/${name}`, isDir };
}

function makeCtx(o = {}) {
  return {
    project: makeProject(),
    chat: makeChat(),
    file: null,
    ...o,
  };
}

export { makeProject, makeChat, makeFile, makeCtx };
