import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginThunk } from '../redux/userSlice';
import { MESSAGES } from '../constants/messages';

/**
 * tenexch's sign-in, shared by every login form (the clickbet modal, the
 * kingexch header's inline fields).
 *
 * `login(username, password)` runs loginThunk and the hand-offs that follow it —
 * the 2FA route, the first-login password-change hold, the post-login welcome —
 * then resolves `{ ok: true }`, or `{ ok: false, error }` with the message to
 * show. `before` runs once the credentials are accepted and before navigating
 * (forms use it to close themselves).
 */
export default function useLoginFlow() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return async function login(username, password, { before } = {}) {
    try {
      // The API takes the User ID in its `email` field — the same payload the
      // old login page sent.
      const data = await dispatch(loginThunk({ email: username, password })).unwrap();

      if (data.require2FA) {
        // method: 'google' → code from the Authenticator app,
        // 'telegram' → an OTP was just pushed to the bot.
        before?.();
        navigate('/authentication/2', {
          state: { userId: data.userId, method: data.method || 'telegram' },
        });
        return { ok: true };
      }

      const token = data?.token || data?.accessToken || null;

      // First login — the account still carries the upline's default password.
      // Do NOT enter the app: <ForcePasswordChange/> at the app root overlays
      // the forced modal, and after the change the user logs in again with the
      // new password. Closing the form is what uncovers it.
      if (data && data.passwordChanged === false) {
        if (token) sessionStorage.setItem('authToken', token);
        before?.();
        return { ok: true };
      }

      sessionStorage.setItem('showLoginPopup', 'true');
      if (token) sessionStorage.setItem('authToken', token);
      before?.();
      navigate('/home', { replace: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: typeof err === 'string' ? err : err?.message || MESSAGES.AUTH.LOGIN_FAILED };
    }
  };
}
