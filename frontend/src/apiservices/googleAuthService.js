import api from './axiosClient';

/**
 * Google Authenticator (TOTP) secure auth.
 *
 * Setup order: setup() → user scans the QR (or types the setup code) →
 * enable() with a code from the app. Both enable() and disable() end the
 * session, so the caller must log the user out afterwards.
 */
export const googleAuthService = {
  // Verifies the login password, returns { qrCode, secret, otpAuthUrl }
  setup: async (password) => {
    const response = await api.post('/2fa/google/setup', { password });
    return response.data;
  },

  enable: async (otp) => {
    const response = await api.post('/2fa/google/enable', { otp });
    return response.data;
  },

  disable: async (otp) => {
    const response = await api.post('/2fa/google/disable', { otp });
    return response.data;
  },
};
