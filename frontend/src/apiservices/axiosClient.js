import axios from 'axios';
import { API_URL } from '../config';
import { createSecureChannel } from './secureChannel';

const axiosClient = axios.create({
  baseURL: API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Demo mode is fully client-side — never send its sentinel token upstream
  if (token && token !== 'demo-token') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // A 401 from the login/2FA endpoints means bad credentials, not an
      // expired session — let the form show the error instead of reloading.
      const url = error.config?.url || '';
      const isAuthCall = url.includes('/user/login') || url.includes('/2fa');
      const onLoginPage = window.location.pathname === '/login';
      // Only bounce to /login when a session actually EXPIRED (a token was present).
      // A logged-OUT user (no token) hitting a private endpoint — e.g. browsing a
      // game-details page without login — should stay on the page, not be kicked to
      // /login. So gamedetails (and any public-ish page) is reachable without login.
      // Demo sessions have no real token — a 401 there is expected (private
      // endpoint hit in demo mode), never a reason to bounce to /login.
      const storedToken = localStorage.getItem('token');
      const hadToken = !!storedToken && storedToken !== 'demo-token';
      if (!isAuthCall && !onLoginPage && hadToken) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Every call goes over the API's secure channel (see secureChannel.js).
export const secureChannel = createSecureChannel({ handshakeUrl: `${API_URL}/cs/handshake` });
secureChannel.installHttp(axiosClient);

export default axiosClient;
