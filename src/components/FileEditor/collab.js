// src/components/FileEditor/collab.js
import { ViewPlugin } from '@codemirror/view';
import { getSyncedVersion, sendableUpdates } from '@codemirror/collab';

export function makeCollabPlugin(wsRef) {
  return ViewPlugin.fromClass(class {
    pushing = false;
    timer   = null;
    constructor() { this.schedule(); }
    schedule() { this.timer = setTimeout(() => this.push(), 150); }
    async push() {
      if (this.pushing) { this.schedule(); return; }
      const ws = wsRef.current;
      if (!ws || ws.readyState !== 1) { this.schedule(); return; }
      this.pushing = true;
      try {
        void 0;
      } finally { this.pushing = false; this.schedule(); }
    }
    update(upd) {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== 1) return;
      const updates = sendableUpdates(upd.state);
      if (!updates.length) return;
      try {
        ws.send(JSON.stringify({
          type: 'collab_push',
          version: getSyncedVersion(upd.state),
          updates: updates.map(u => ({ clientID: u.clientID, changes: u.changes.toJSON() })),
        }));
      } catch (_) {}
    }
    destroy() { clearTimeout(this.timer); }
  });
}
