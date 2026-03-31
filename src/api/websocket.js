// src/api/websocket.js
import { logger } from '../utils.js';
import { CONFIG } from './config.js';
import { WS_SERVER } from '../constants.js';
import { AIError } from './errors.js';

let wsInstance = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;

/**
 * Membuat koneksi WebSocket baru dan mengaturnya sebagai instance global tunggal.
 */
const createConnection = () => {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    return wsInstance;
  }

  try {
    wsInstance = new WebSocket(WS_SERVER);
  } catch (error) {
    logger.error?.('Failed to create WebSocket instance', error);
    throw new AIError('WebSocket tidak tersedia', 'WS_UNAVAILABLE', error);
  }

  wsInstance.onopen = () => {
    logger.info?.('✅ WebSocket connected successfully.');
    reconnectAttempts = 0;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  wsInstance.onclose = (event) => {
    logger.warn?.('⚠️ WebSocket disconnected.', event.code, event.reason);
    wsInstance = null; // Reset instance agar bisa reconnect nanti

    // Logika Reconnect otomatis
    if (reconnectAttempts < CONFIG.SERVER.WS_RECONNECT_MAX) {
      reconnectAttempts++;
      const delay = Math.min(
        CONFIG.SERVER.WS_RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts - 1),
        CONFIG.SERVER.WS_RECONNECT_MAX_DELAY
      );
      logger.info?.(`🔄 Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts}/${CONFIG.SERVER.WS_RECONNECT_MAX})`);
      
      reconnectTimeout = setTimeout(() => {
        createConnection();
      }, delay);
    } else {
      logger.error?.('❌ Max reconnect attempts reached.');
    }
  };

  wsInstance.onerror = (error) => {
    logger.error?.('❌ WebSocket error observed:', error);
  };

  // Default onmessage handler (bisa di-override oleh komponen yang subscribe)
  wsInstance.onmessage = (event) => {
    // Handler global default, biasanya komponen akan menambahkan listener sendiri via getWebSocket()
    // console.log('📩 Global message received:', event.data);
  };

  return wsInstance;
};

/**
 * Menginisialisasi atau mengembalikan koneksi WebSocket yang sudah ada.
 * Mencegah duplikasi koneksi.
 */
export const connectWebSocket = () => {
  if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
    return wsInstance;
  }
  return createConnection();
};

/**
 * Mendapatkan instance WebSocket saat ini.
 * @returns {WebSocket|null} Instance WebSocket atau null jika belum connect.
 */
export const getWebSocket = () => {
  return wsInstance;
};

/**
 * Menutup koneksi secara manual dan menghentikan proses reconnect.
 * Gunakan ini saat logout atau aplikasi ditutup.
 */
export const disconnectWebSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (wsInstance) {
    logger.info?.('🛑 Manually closing WebSocket connection.');
    wsInstance.close();
    wsInstance = null;
  }
};

/**
 * Helper untuk exec_stream yang menggunakan WebSocket terpusat.
 * (Opsional: Jika logic exec_stream masih butuh fungsi standalone seperti aslinya)
 */
export function execStream(command, cwd, onLine, signal) {
  return new Promise((resolve, reject) => {
    let ws = null;
    let output = '';
    let settled = false;
    let localReconnectAttempts = 0;
    let localReconnectTimeout = null;

    const cleanup = () => {
      if (localReconnectTimeout) clearTimeout(localReconnectTimeout);
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
        // Gunakan server dari constants
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
        if (localReconnectAttempts < CONFIG.SERVER.WS_RECONNECT_MAX && !settled) {
          localReconnectAttempts++;
          const delay = Math.min(
            CONFIG.SERVER.WS_RECONNECT_DELAY_BASE * Math.pow(2, localReconnectAttempts - 1),
            CONFIG.SERVER.WS_RECONNECT_MAX_DELAY
          );
          logger.info?.(`WebSocket reconnecting in ${delay}ms (attempt ${localReconnectAttempts}/${CONFIG.SERVER.WS_RECONNECT_MAX})`);
          localReconnectTimeout = setTimeout(connect, delay);
        } else if (!settled) {
          cleanup();
          settled = true;
          reject(new AIError('WebSocket connection failed after retries', 'WS_ERROR'));
        }
      };

      ws.onclose = () => {
        if (!settled && !localReconnectTimeout) {
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

export default { connectWebSocket, getWebSocket, disconnectWebSocket, execStream };
