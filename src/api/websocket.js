import { logger } from '../utils.js';
import { CONFIG } from './config.js';
import { WS_SERVER } from '../constants.js';
import { AIError } from './errors.js';

export function execStream(command, cwd, onLine, signal) {
  return new Promise((resolve, reject) => {
    let ws = null;
    let output = '';
    let settled = false;
    let reconnectAttempts = 0;
    const maxReconnect = CONFIG.SERVER.WS_RECONNECT_MAX;
    let reconnectTimeout = null;

    const cleanup = () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        ws = null;
      }
    };

    const connect = () => {
      try {
        ws = new WebSocket(WS_SERVER);
      } catch (error) {
        if (!settled) {
          settled = true;
          reject(new AIError('WebSocket tidak tersedia', 'WS_UNAVAILABLE', error));
        }
        return;
      }

      const id = `exec_${Date.now()}_${crypto?.getRandomValues
        ? Array.from(crypto.getRandomValues(new Uint8Array(4)), b => b.toString(16)).join('')
        : crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'exec_stream', id, command, cwd }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.id && data.id !== id) return;

          if (data.type === 'stdout' || data.type === 'stderr') {
            const line = data.data;
            output += line;
            onLine?.(line, data.type);
          }

          if (data.type === 'exit') {
            cleanup();
            if (!settled) {
              settled = true;
              resolve({ exitCode: data.code, output });
            }
          }

          if (data.type === 'error') {
            cleanup();
            if (!settled) {
              settled = true;
              reject(new AIError(data.data, 'EXEC_ERROR'));
            }
          }
        } catch (e) {
          logger.warn?.('Failed to parse WebSocket message', e);
        }
      };

      ws.onerror = (error) => {
        logger.error?.('WebSocket error', error);
        if (reconnectAttempts < maxReconnect && !settled) {
          reconnectAttempts++;
          const delay = Math.min(
            CONFIG.SERVER.WS_RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts - 1),
            CONFIG.SERVER.WS_RECONNECT_MAX_DELAY
          );
          logger.info?.(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnect})`);
          reconnectTimeout = setTimeout(connect, delay);
        } else if (!settled) {
          cleanup();
          settled = true;
          reject(new AIError('WebSocket connection failed after retries', 'WS_ERROR'));
        }
      };

      ws.onclose = () => {
        if (!settled && !reconnectTimeout) {
          cleanup();
          settled = true;
          resolve({ exitCode: 1, output });
        }
      };
    };

    connect();

    if (signal) {
      signal.addEventListener('abort', () => {
        cleanup();
        if (!settled) {
          settled = true;
          reject(new AIError('Aborted', 'ABORTED'));
        }
      });
    }
  });
}
