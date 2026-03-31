// src/api/websocket.js

let ws = null;
const WS_SERVER = 'ws://127.0.0.1:8766';
let reconnectTimeout = null;

// Fungsi untuk membuat koneksi baru
const createConnection = () => {
  console.log('Attempting to connect to WebSocket server:', WS_SERVER);
  
  const socket = new WebSocket(WS_SERVER);

  socket.onopen = () => {
    console.log('✅ WebSocket connected successfully.');
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  socket.onclose = (event) => {
    console.warn('⚠️ WebSocket disconnected.', event.code, event.reason);
    ws = null; // Reset instance agar bisa reconnect
    
    // Logika Reconnect otomatis (Exponential backoff sederhana)
    if (!reconnectTimeout) {
      console.log('🔄 Scheduling reconnect in 3 seconds...');
      reconnectTimeout = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };

  socket.onerror = (error) => {
    console.error('❌ WebSocket error observed:', error);
  };

  socket.onmessage = (event) => {
    // Pesan global bisa ditangani di sini jika perlu, 
    // tapi biasanya handler spesifik didaftarkan di komponen yang memakai getWebSocket()
    console.log('📩 Message received from server:', event.data);
  };

  return socket;
};

/**
 * Menginisialisasi atau mengembalikan koneksi WebSocket yang sudah ada.
 * Mencegah duplikasi koneksi.
 */
export const connectWebSocket = () => {
  // Jika sudah ada dan masih terbuka, kembalikan yang itu
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('ℹ️ WebSocket already connected, reusing existing instance.');
    return ws;
  }

  // Jika sedang dalam proses connecting, tunggu saja
  if (ws && ws.readyState === WebSocket.CONNECTING) {
    console.log('ℹ️ WebSocket connection in progress...');
    return ws;
  }

  // Buat koneksi baru
  ws = createConnection();
  return ws;
};

/**
 * Mendapatkan instance WebSocket saat ini (bisa null jika belum connect/closed).
 */
export const getWebSocket = () => {
  return ws;
};

/**
 * Menutup koneksi secara manual (misal saat user logout).
 */
export const disconnectWebSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (ws) {
    console.log('🛑 Manually closing WebSocket connection.');
    ws.close();
    ws = null;
  }
};

export default { connectWebSocket, getWebSocket, disconnectWebSocket };
