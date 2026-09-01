import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import api from './axiosClient';

// Socket connection
let socket = null;
let socketUserId = null; // who the current socket is authenticated as

export const initializeSocket = (token, userId) => {
  // Reuse the existing socket for the same user. Recreating it on every
  // getBalance() call (which fires after every bet) would tear down all the
  // `balanceUpdate` listeners other components registered, so real-time
  // exposure/balance updates would silently stop arriving until a page
  // refresh. Only ensure it is connected + (re)authenticated.
  if (socket && socketUserId === String(userId)) {
    if (!socket.connected) socket.connect();
    else socket.emit('authenticate', { userId, token });
    return socket;
  }

  // Different user (login switch) or first init → start a fresh socket.
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socketUserId = String(userId);

  socket = io(SOCKET_URL, {
    auth: { token },
    path: '/socket.io',
    // Stay on long-polling instead of upgrading to a websocket. The proxy in
    // front of the API accepts the upgrade and then drops the frames, so the
    // socket reports itself connected while every server push is lost — the
    // header looked "connected but dead" until a refresh. The lords frontend
    // pins the same transport for the same reason.
    transports: ['polling'],
    // Long-polling rides on XHR, so the CORS credentials flag has to be set
    // explicitly or the auth cookies/headers are dropped.
    withCredentials: true,
    // Never reuse a cached socket.io Manager from a previous session — this
    // module already handles reuse itself (socketUserId above).
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Fires on the initial connect AND on every successful reconnect, so the
  // socket always (re)joins its `user_<id>` room after a drop.
  socket.on('connect', () => {
    socket.emit('authenticate', { userId, token });
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socketUserId = null;
};

export const clearSocket = disconnectSocket;

// Auth
export const loginUser = async (credentials) => {
  const response = await api.post('/user/login', credentials);
  return response.data;
};

// Balance + socket init
export const getBalance = async (token, userId) => {
  if (userId) {
    initializeSocket(token, userId);
  }
  const response = await api.get('/user/balance');
  console.log('[Balance API] GET /user/balance response:', JSON.stringify(response.data));
  return response.data.data;
};

// Real-time balance subscription
export const subscribeToBalanceUpdates = (userId, callback) => {
  if (!socket) {
    console.warn('Socket not initialized. Call getBalance first.');
    return null;
  }

  const handleBalanceUpdate = (data) => {
    console.log('[Socket] balanceUpdate raw event:', JSON.stringify(data));
    if (data.error) {
      console.error('Balance update error:', data.error);
      return;
    }
    // String-compare: server may emit userId as number while ours is a string
    if (String(data.userId) === String(userId)) {
      console.log('[Socket] balanceUpdate matched userId, calling callback with:', JSON.stringify(data.balance));
      callback(data.balance);
    }
  };

  socket.on('balanceUpdate', handleBalanceUpdate);
  return () => {
    if (socket) socket.off('balanceUpdate', handleBalanceUpdate);
  };
};

// Real-time transaction subscription
export const subscribeToTransactionUpdates = (userId, callback) => {
  if (!socket) {
    console.warn('Socket not initialized. Call getBalance first.');
    return null;
  }

  const handleTransactionUpdate = (data) => {
    if (String(data.userId) === String(userId)) {
      callback(data.transactions);
    }
  };

  socket.on('transactionUpdate', handleTransactionUpdate);
  return () => {
    if (socket) socket.off('transactionUpdate', handleTransactionUpdate);
  };
};

export const requestBalanceUpdate = (userId) => {
  if (socket) {
    socket.emit('getBalance', { userId });
  } else {
    console.warn('Socket not available for balance update request');
  }
};

export const getAllExposures = async (token, userId) => {
  const response = await api.post('/user/exposure', { user_id: userId });
  return response.data;
};

// User profile (from userProfileService)
export const getUserProfileWithWallet = async () => {
  const response = await api.get('/admin/user/profile');
  return response.data?.data?.user || response.data;
};

// Welcome poster(s) shown in the post-login modal. Returns an array of
// { img, is_mobile } — one desktop (is_mobile:false) and one mobile variant.
export const fetchPoster = async () => {
  const response = await api.get('/user/poster');
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

// Home banner carousel slides. Each: { id, img, category, sports?, casino? }
//   category 'sports' → sports:{ sportId, eventId }  (→ /gamedetails)
//   category 'casino' → casino:{ gameName }          (→ /casino route)
//   category 'others' → no link
export const fetchCarousel = async () => {
  const response = await api.get('/user/carousel');
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

// Accept rules (first-login rules modal) — flips `rules_accepted` to true for
// the logged-in user. The id comes from the token, so no body is needed. The
// backend re-reads the flag from the DB before answering, so `success: true`
// means it is actually persisted.
export const acceptRules = async () => {
  const response = await api.post('/user/accept-rules');
  return response.data;
};

// Change password
export const changePassword = async (token, currentPassword, newPassword) => {
  const response = await api.post('/user/change-password', { currentPassword, newPassword });
  return response.data;
};
