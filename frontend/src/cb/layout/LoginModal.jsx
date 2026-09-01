import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, setDemoUser } from '../../redux/userSlice';
import { cbToastError } from '../toast';
import { MESSAGES } from '../../constants/messages';
import { common } from '../assets';
import { SOCIAL_LINKS } from '../social';

// The reference's inline button spinner.
function Spinner() {
  return (
    <svg className="spinner mr-2" viewBox="0 0 50 50">
      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
    </svg>
  );
}

const SOCIALS = [
  { key: 'whatsapp',  file: 'whatsapp.png', alt: 'whatsapp' },
  { key: 'telegram',  file: 'telegram.png', alt: 'telegram' },
  { key: 'facebook',  file: 'facebook.png', alt: 'facebook' },
  { key: 'instagram', file: 'insta.png',    alt: 'instagram' },
  { key: 'twitter',   file: 'twitter.png',  alt: 'twitter' },
  { key: 'youtube',   file: 'youtube.png',  alt: 'youtube' },
];

// Where a remembered User ID is kept. Only the id — never the password.
const REMEMBER_KEY = 'cb:remember-user';

/**
 * Login.
 *
 * The reference has no login PAGE — the header button opens this modal over
 * whatever you were looking at, and you land back on the same page signed in.
 * tenexch's /login route still exists for the pages not yet converted; this
 * replaces it everywhere the clickbet chrome is in use.
 *
 * The form is the reference's; everything behind the buttons is tenexch's
 * existing auth — the same loginThunk, the same 2FA hand-off, the same
 * first-login password-change hold, and the same demo session.
 */
function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.user.loading);

  const [form, setForm] = useState(() => ({
    username: localStorage.getItem(REMEMBER_KEY) || '',
    password: '',
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem(REMEMBER_KEY));
  const [demoLoading, setDemoLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.username || !form.password) {
      cbToastError(MESSAGES.VALIDATION.FIELD_REQUIRED);
      return;
    }

    try {
      // The API takes the User ID in its `email` field — the same payload the
      // old login page sent.
      const data = await dispatch(
        loginThunk({ email: form.username, password: form.password })
      ).unwrap();

      if (remember) localStorage.setItem(REMEMBER_KEY, form.username);
      else localStorage.removeItem(REMEMBER_KEY);

      if (data.require2FA) {
        // method: 'google' → code from the Authenticator app,
        // 'telegram' → an OTP was just pushed to the bot.
        onClose();
        navigate('/authentication/2', {
          state: { userId: data.userId, method: data.method || 'telegram' },
        });
        return;
      }

      const token = data?.token || data?.accessToken || null;

      // First login — the account still carries the upline's default password.
      // Do NOT enter the app: <ForcePasswordChange/> at the app root overlays
      // the forced modal, and after the change the user logs in again with the
      // new password. Closing this modal is what uncovers it.
      if (data && data.passwordChanged === false) {
        if (token) sessionStorage.setItem('authToken', token);
        onClose();
        return;
      }

      sessionStorage.setItem('showLoginPopup', 'true');
      if (token) sessionStorage.setItem('authToken', token);
      onClose();
      navigate('/home', { replace: true });
    } catch (err) {
      cbToastError(typeof err === 'string' ? err : err?.message || MESSAGES.AUTH.LOGIN_FAILED);
    }
  };

  const demoLogin = () => {
    setDemoLoading(true);
    dispatch(setDemoUser());
    // Same post-login welcome banner a real login gets (Home reads this flag).
    sessionStorage.setItem('showLoginPopup', 'true');
    setTimeout(() => {
      setDemoLoading(false);
      onClose();
      navigate('/home');
    }, 500);
  };

  const openSocial = (url) => {
    if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="modal fade show CommonModel-box" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content newlogin-box">
            <div className="modal-header  border-0 p-0 login-register-title-header">
              <div className="login-register-title ">
                <div className="modal-title w-100 login-register-btn active">Login</div>
              </div>
              <button type="button" className="btn-close" onClick={onClose}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>

            <div className="modal-body p-0 pt-25">
              {/* `.input_box` floats the label over the field once it has a
                  value — the label FOLLOWS the input in the markup, it does not
                  precede it, because the CSS positions it off the input. */}
              <div className="input_box mb-3">
                <input
                  name="username"
                  type="text"
                  className="form-control text-lowercase"
                  value={form.username}
                  onChange={onChange}
                  required
                />
                <label>User ID</label>
              </div>

              <div className="input_box mb-3 position-relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control pe-5"
                  value={form.password}
                  onChange={onChange}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  required
                />
                <label>Password</label>
                <span className="password-eye" onClick={() => setShowPassword((v) => !v)}>
                  <i className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} />
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center checkform loogincheckbox mb-1">
                <div className="form-check theamecolor">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label className="form-check-label ">Remember me</label>
                </div>
              </div>
            </div>

            <div className="modal-footer p-0">
              <button className="loginbtn-new m-0 w-50" onClick={submit} disabled={loading}>
                {loading && <Spinner />}
                Login
              </button>
              <button className="loginbtn-new m-0 w-50" onClick={demoLogin} disabled={demoLoading}>
                {demoLoading && <Spinner />}
                Demo ID
              </button>
            </div>

            <div className="hrline"></div>
            <div className="text-center connectwith-us-text">Connect with us</div>
            <div className="socialmedia-icon">
              {SOCIALS.map((s) => (
                <div className="socialmediaicon-box" key={s.key}>
                  <img
                    src={common(`loginicon/${s.file}`)}
                    alt={s.alt}
                    onClick={() => openSocial(SOCIAL_LINKS[s.key])}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default LoginModal;
