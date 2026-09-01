import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUser,
  getBalance,
  initializeSocket,
  subscribeToBalanceUpdates,
  subscribeToTransactionUpdates,
  requestBalanceUpdate,
  disconnectSocket,
  getAllExposures,
  getUserProfileWithWallet,
} from '../apiservices/authService';
import { telegram2faService } from '../apiservices/telegram2faService';
import { getOrSeedDemoState, saveDemoState, loadDemoState, clearDemoState } from '../utils/demoStore';

const demoUser = {
  username: 'Demo',
  email: 'demo@mail.com',
  role: 'User',
};

// Refresh in demo mode: rehydrate balance/exposure from the local demo store
// (setDemoUser only runs on the Demo button click, not on page load).
const _demoBoot = localStorage.getItem('token') === 'demo-token' ? loadDemoState() : null;

// First login: the account still has the password the upline handed out, so the
// change is mandatory. It has to survive a reload — the token is already in
// localStorage at this point, so without persisting this a refresh dropped the
// user straight into the app with the default password still set.
export const MUST_CHANGE_KEY = 'mustChangePassword';

// …and it must NOT survive a refresh. Mid-flow the account is signed in while
// still on the password its upline set, so a reload drops the session outright
// rather than resuming it: the user comes back to a clean login. Runs at module
// load, before any component reads this state.
if (localStorage.getItem(MUST_CHANGE_KEY) === '1') {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem(MUST_CHANGE_KEY);
}

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!(JSON.parse(localStorage.getItem('user')) && localStorage.getItem('token')),
  mustChangePassword: localStorage.getItem(MUST_CHANGE_KEY) === '1',
  loading: false,
  error: null,
  balance: _demoBoot ? _demoBoot.balance : null,
  exposure: _demoBoot ? _demoBoot.exposure : 0,
  balanceLoading: false,
  balanceError: null,
  demoUser,
  transactions: [],
  realTimeConnected: false,
  matchExposures: {},
};

export const fetchExposuresThunk = createAsyncThunk(
  'user/fetchExposures',
  async (token, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId = state.user.user?.user_id || state.user.user?.id;
      if (!userId) throw new Error('User ID not found');
      const data = await getAllExposures(token, userId);
      return data.exposures;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchUserProfileThunk = createAsyncThunk(
  'user/fetchProfile',
  async (_token, { rejectWithValue }) => {
    try {
      const profile = await getUserProfileWithWallet();
      return profile;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  'user/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const data = await loginUser(credentials);

      if (data.success === false) {
        return rejectWithValue(data.error || 'Login failed');
      }

      if (data.token) {
        // Store token first so axiosClient interceptor can use it for subsequent calls
        localStorage.setItem('token', data.token);
        const profile = await dispatch(fetchUserProfileThunk(data.token)).unwrap();
        dispatch(fetchExposuresThunk(data.token));
        return {
          ...profile,
          token: data.token,
          passwordChanged: data.passwordChanged,
          // Profile is the primary source, but the login response carries the
          // flag too — fall back to it so an older profile payload (before the
          // column existed) doesn't read as "undefined" and skip the modal.
          rules_accepted: profile?.rules_accepted ?? data.rules_accepted,
        };
      }

      // 2FA pending or other non-error response
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const verify2FAThunk = createAsyncThunk(
  'user/verify2FA',
  async ({ userId, otp }, { dispatch, rejectWithValue }) => {
    try {
      const data = await telegram2faService.verify2FA(userId, otp);
      if (data.token) {
        localStorage.setItem('token', data.token);
        const profile = await dispatch(fetchUserProfileThunk(data.token)).unwrap();
        dispatch(fetchExposuresThunk(data.token));
        return {
          ...profile,
          token: data.token,
          passwordChanged: data.passwordChanged,
          rules_accepted: profile?.rules_accepted ?? data.rules_accepted,
        };
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchBalanceThunk = createAsyncThunk(
  'user/fetchBalance',
  async (token, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId = state.user.user?.user_id || state.user.user?.id;
      const data = await getBalance(token, userId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

let _unsubscribeBalance = null;
let _unsubscribeTransactions = null;

export const cleanupRealTimeSubscriptions = () => {
  if (_unsubscribeBalance) { _unsubscribeBalance(); _unsubscribeBalance = null; }
  if (_unsubscribeTransactions) { _unsubscribeTransactions(); _unsubscribeTransactions = null; }
};

export const subscribeToRealTimeUpdates = createAsyncThunk(
  'user/subscribeToRealTime',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const { user, realTimeConnected } = state.user;

    // Already subscribed AND the listener is actually attached — nothing to do.
    // (realTimeConnected alone is not enough: the thunk used to fulfil even
    // when the socket was null, permanently blocking every retry.)
    if (realTimeConnected && _unsubscribeBalance) return;

    const userId = user?.user_id || user?.id || user?._id;
    if (!userId) throw new Error('User not authenticated');

    const token = localStorage.getItem('token');
    if (!token || token === 'demo-token') throw new Error('No real session');

    // Guarantee the shared socket exists BEFORE subscribing — otherwise
    // subscribeToBalanceUpdates silently no-ops (socket === null) and the
    // header never receives pushes. initializeSocket is idempotent: for the
    // same user it only reconnects/re-authenticates the existing socket.
    initializeSocket(token, userId);

    cleanupRealTimeSubscriptions();

    _unsubscribeBalance = subscribeToBalanceUpdates(userId, (balance) => {
      dispatch(updateBalanceRealTime(balance));
    });

    _unsubscribeTransactions = subscribeToTransactionUpdates(userId, (transactions) => {
      dispatch(updateTransactionsRealTime(transactions));
    });

    // Listener didn't attach → reject so realTimeConnected stays false and
    // the header's retry tick can re-arm the subscription.
    if (!_unsubscribeBalance) throw new Error('Socket subscription failed');

    // Ask the server to push a fresh balance+exposure over the socket right
    // away (mirrors the old useRealTimeBalance hook's behavior).
    setTimeout(() => requestBalanceUpdate(userId), 500);
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // The forced first-login change went through: the account is normal now.
    passwordChangeCompleted: (state) => {
      state.mustChangePassword = false;
      localStorage.removeItem(MUST_CHANGE_KEY);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.mustChangePassword = false;
      localStorage.removeItem(MUST_CHANGE_KEY);
      state.error = null;
      state.balance = null;
      state.exposure = null;
      state.matchExposures = {};
      state.transactions = [];
      state.realTimeConnected = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      clearDemoState();
      cleanupRealTimeSubscriptions();
      disconnectSocket();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // The player accepted the first-login rules. Mirrored into localStorage so a
    // refresh before the next profile fetch doesn't bring the modal back.
    rulesAccepted: (state) => {
      if (!state.user) return;
      state.user = { ...state.user, rules_accepted: true };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    updateExposure: (state, action) => {
      state.exposure = action.payload;
    },
    updateMatchExposure: (state, action) => {
      state.matchExposures = { ...state.matchExposures, ...action.payload };
    },
    updateUserBalanceAndExposure: (state, action) => {
      if (action.payload.balance !== undefined) state.balance = action.payload.balance;
      if (action.payload.exposure !== undefined) state.exposure = action.payload.exposure;
    },
    setDemoUser: (state) => {
      // Hydrate from localStorage (refresh-safe) or seed a fresh demo state
      const demo = getOrSeedDemoState();
      state.user = demoUser;
      state.balance = demo.balance;
      state.exposure = demo.exposure;
      state.isAuthenticated = true;
      state.realTimeConnected = false;
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
    },
    updateBalanceRealTime: (state, action) => {
      console.log('[Redux] updateBalanceRealTime payload:', JSON.stringify(action.payload));
      const { inr_balance, exposure } = action.payload || {};
      if (inr_balance !== undefined) state.balance = inr_balance;
      if (exposure !== undefined) state.exposure = exposure;
      state.realTimeConnected = true;
    },
    updateTransactionsRealTime: (state, action) => {
      state.transactions = action.payload;
      state.realTimeConnected = true;
    },
    setRealTimeConnectionStatus: (state, action) => {
      state.realTimeConnected = action.payload;
    },
    updateDemoBalanceAndExposure: (state, action) => {
      if (!state.isAuthenticated || (state.user && state.user.username === 'Demo')) {
        // Balance stays at the seed value. Payload carries the ABSOLUTE
        // exposure (≤ 0) recomputed by demoStore from the worst-case book —
        // NOT an increment, so offsetting bets on one market don't double-count.
        const newExposure = Number(Number(action.payload.exposure || 0).toFixed(2));
        state.exposure = newExposure;
        // Keep localStorage in sync so a refresh restores the same numbers
        const demo = loadDemoState();
        if (demo) {
          demo.exposure = newExposure;
          demo.balance = state.balance !== null ? Number(state.balance) : demo.balance;
          saveDemoState(demo);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.token) {
          state.user = action.payload.user || action.payload;
          state.isAuthenticated = true;
          state.mustChangePassword = action.payload.passwordChanged === false;
          if (state.mustChangePassword) localStorage.setItem(MUST_CHANGE_KEY, '1');
          else localStorage.removeItem(MUST_CHANGE_KEY);
          localStorage.setItem('token', action.payload.token);
          if (action.payload.user) {
            localStorage.setItem('user', JSON.stringify(action.payload.user));
          } else {
            localStorage.setItem('user', JSON.stringify(action.payload));
          }
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(verify2FAThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FAThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.mustChangePassword = action.payload.passwordChanged === false;
        if (state.mustChangePassword) localStorage.setItem(MUST_CHANGE_KEY, '1');
        else localStorage.removeItem(MUST_CHANGE_KEY);
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(verify2FAThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '2FA Verification failed';
      })
      .addCase(fetchUserProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchExposuresThunk.fulfilled, (state, action) => {
        state.matchExposures = action.payload || {};
      })
      .addCase(fetchBalanceThunk.pending, (state) => {
        state.balanceLoading = true;
        state.balanceError = null;
      })
      .addCase(fetchBalanceThunk.fulfilled, (state, action) => {
        console.log('[Redux] fetchBalanceThunk fulfilled:', JSON.stringify(action.payload));
        state.balanceLoading = false;
        state.balance = action.payload.inr_balance;
        // Guard: a response WITHOUT the exposure field must never wipe the
        // real value the socket already set
        if (action.payload.exposure !== undefined) state.exposure = action.payload.exposure;
        state.balanceError = null;
        if (action.payload.username) {
          const user = state.user
            ? { ...state.user, username: action.payload.username }
            : { username: action.payload.username };
          state.user = user;
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .addCase(fetchBalanceThunk.rejected, (state, action) => {
        state.balanceLoading = false;
        state.balanceError = action.payload || 'Failed to fetch balance';
      })
      .addCase(subscribeToRealTimeUpdates.fulfilled, (state) => {
        state.realTimeConnected = true;
      })
      .addCase(subscribeToRealTimeUpdates.rejected, (state) => {
        state.realTimeConnected = false;
      });
  },
});

export const {
  logout,
  passwordChangeCompleted,
  rulesAccepted,
  updateUser,
  updateExposure,
  updateMatchExposure,
  updateUserBalanceAndExposure,
  setDemoUser,
  updateBalanceRealTime,
  updateTransactionsRealTime,
  setRealTimeConnectionStatus,
  updateDemoBalanceAndExposure,
} = userSlice.actions;

export default userSlice.reducer;
