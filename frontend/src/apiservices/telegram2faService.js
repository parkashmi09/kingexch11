import api from './axiosClient';

export const telegram2faService = {
  verifyPassword: async (password) => {
    const response = await api.post('/2fa/telegram/verify-password', { password });
    return response.data.success;
  },

  // → { code, botUsername, botLink } — the bot is owner-configurable, so the
  // handle shown in the instructions comes from the server, not the client.
  getLinkCode: async () => {
    const response = await api.post('/2fa/telegram/generate-link-code');
    return response.data;
  },

  verify2FA: async (userId, otp) => {
    const response = await api.post('/user/verify-2fa', { userId, otp });
    return response.data;
  },

  resendOTP: async (userId) => {
    const response = await api.post('/user/resend-2fa-otp', { userId });
    return response.data;
  },

  sendDisableCode: async () => {
    const response = await api.post('/2fa/telegram/send-disable-code');
    return response.data;
  },

  disable2FA: async (otp) => {
    const response = await api.post('/2fa/telegram/disable-2fa', { otp });
    return response.data;
  },
};
