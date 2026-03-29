// src/utils/backup.js
import { callServer } from '../api.js';
import { resolvePath } from './path.js';

export async function backupFiles(targets, folder) {
  const backups = [];
  for (const a of targets) {
    const backup = await callServer({ type: 'read', path: resolvePath(folder, a.path) });
    if (backup.ok) {
      backups.push({ path: resolvePath(folder, a.path), content: backup.data });
      a.original = backup.data;
    }
  }
  return backups;
}
