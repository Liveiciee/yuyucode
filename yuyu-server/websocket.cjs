// websocket.cjs
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');
const { resolvePath } = require('./helpers.cjs');

function startWebSocket(port) {
  const wss = new WebSocketServer({ port });
  const execProcs = new Map();
  const collabRooms = new Map();

  wss.on('connection', ws => {
    let clientWatcher = null;

    ws.on('message', raw => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      if (msg.type === 'watch') {
        const watchPath = resolvePath(msg.path);
        if (!fs.existsSync(watchPath)) {
          ws.send(JSON.stringify({ event: 'error', data: `Path tidak ada: ${msg.path}` }));
          return;
        }
        if (clientWatcher) { try { clientWatcher.close(); } catch {} }
        try {
          clientWatcher = fs.watch(watchPath, { recursive: true }, (event, filename) => {
            if (!filename || filename.startsWith('.git/')) return;
            try { ws.send(JSON.stringify({ event, filename })); } catch {}
          });
          ws.send(JSON.stringify({ event: 'watching', path: watchPath }));
        } catch(e) {
          ws.send(JSON.stringify({ event: 'error', data: e.message }));
        }
        return;
      }

      if (msg.type === 'exec_stream') {
        const { id, command, cwd } = msg;
        if (!command || !id) return;
        const workDir = cwd ? resolvePath(cwd) : process.env.HOME;
        const proc = spawn('bash', ['-c', command], { cwd: workDir, env: { ...process.env } });
        execProcs.set(id, proc);

        proc.stdout.on('data', d => { try { ws.send(JSON.stringify({ type: 'stdout', id, data: d.toString() })); } catch {} });
        proc.stderr.on('data', d => { try { ws.send(JSON.stringify({ type: 'stderr', id, data: d.toString() })); } catch {} });
        proc.on('close', code => { execProcs.delete(id); try { ws.send(JSON.stringify({ type: 'exit', id, code })); } catch {} });
        proc.on('error', e => { execProcs.delete(id); try { ws.send(JSON.stringify({ type: 'error', id, data: e.message })); } catch {} });
        return;
      }

      if (msg.type === 'kill') {
        const proc = execProcs.get(msg.id);
        if (proc) { proc.kill('SIGTERM'); execProcs.delete(msg.id); }
        return;
      }

      if (msg.type === 'collab_join') {
        const room = msg.room || 'default';
        if (!collabRooms.has(room)) collabRooms.set(room, { version: 0, updates: [], clients: new Set() });
        const r = collabRooms.get(room);
        r.clients.add(ws);
        ws._collabRoom = room;
        try { ws.send(JSON.stringify({ type: 'collab_init', version: r.version })); } catch {}
        return;
      }

      if (msg.type === 'collab_push') {
        const room = ws._collabRoom;
        if (!room || !collabRooms.has(room)) return;
        const r = collabRooms.get(room);
        if (msg.version !== r.version) {
          try { ws.send(JSON.stringify({ type: 'collab_updates', updates: r.updates.slice(msg.version), version: r.version })); } catch {}
          return;
        }
        const newUpdates = msg.updates || [];
        r.updates.push(...newUpdates);
        r.version += newUpdates.length;
        r.clients.forEach(client => {
          if (client === ws || client.readyState !== 1) return;
          try { client.send(JSON.stringify({ type: 'collab_updates', updates: newUpdates, version: r.version })); } catch {}
        });
      }
    });

    ws.on('close', () => {
      if (clientWatcher) { try { clientWatcher.close(); } catch {} }
      if (ws._collabRoom && collabRooms.has(ws._collabRoom)) {
        collabRooms.get(ws._collabRoom).clients.delete(ws);
      }
      for (const [id, proc] of execProcs) {
        try { proc.kill('SIGTERM'); } catch {}
        execProcs.delete(id);
      }
    });
  });

  return wss;
}

module.exports = { startWebSocket };
