import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bToastError } from '../components/BToast';
import VoidLink from '../components/VoidLink';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, setDemoUser } from '../redux/userSlice';
import Footer from '../components/layout/Footer';
import Plus18Modal from '../components/modals/Plus18Modal';
import { MESSAGES } from '../constants/messages';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState({});
  const [showPlus18, setShowPlus18] = useState(false);


  // Hide APK download button on iOS
  const [shouldShowApkDownload, setShouldShowApkDownload] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setShouldShowApkDownload(!isIOS);
  }, []);

  // Landing back here after the forced password change: the reference shows
  // the form cleared but already in its submitted state — "Username required"
  // and "Password required" sit under the empty boxes (the login submit that
  // started the flow marked it dirty, then the fields were wiped). Recreate
  // that, then drop the flag so a refresh renders a pristine form.
  useEffect(() => {
    if (!location.state?.passwordChanged) return;
    setFormData({ email: '', password: '' });
    setFormError({
      email: MESSAGES.VALIDATION.FIELD_REQUIRED,
      password: MESSAGES.VALIDATION.FIELD_REQUIRED,
    });
    navigate('/login', { replace: true, state: null });
  }, [location.state, navigate]);

  // Live validation: a visible "required" error clears the moment the field
  // gets a value (and returns if it's emptied again), instead of sticking
  // until the next submit — which is exactly what the post-change state
  // above exposed: correct credentials typed under two stale errors.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) =>
      name in prev
        ? { ...prev, [name]: value ? '' : MESSAGES.VALIDATION.FIELD_REQUIRED }
        : prev
    );
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFormError((prev) => ({
      ...prev,
      [name]: value ? '' : MESSAGES.VALIDATION.FIELD_REQUIRED,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.email) errors.email = MESSAGES.VALIDATION.FIELD_REQUIRED;
    if (!formData.password) errors.password = MESSAGES.VALIDATION.FIELD_REQUIRED;
    setFormError(errors);

    if (Object.keys(errors).length > 0) return;

    // Reference validates the T&C checkbox with a b-toast
    if (!agreed) {
      bToastError(MESSAGES.AUTH.TERMS_AGREE_REQUIRED);
      return;
    }

    try {
      const data = await dispatch(loginThunk(formData)).unwrap();

      if (data.require2FA) {
        // method: 'google' → code comes from the Authenticator app,
        // 'telegram' → an OTP was just pushed to the bot.
        navigate('/authentication/2', {
          state: { userId: data.userId, method: data.method || 'telegram' },
        });
        return;
      }

      const token = data?.token || data?.accessToken || null;

      // First login → the account still carries the upline's default password.
      // Do NOT enter the app: stay ON the login page — <ForcePasswordChange />
      // (app root) overlays the forced modal right here. After a successful
      // change the user is logged out and must re-login with the NEW password.
      if (data && data.passwordChanged === false) {
        if (token) sessionStorage.setItem('authToken', token);
        return;
      }

      sessionStorage.setItem('showLoginPopup', 'true');
      if (token) sessionStorage.setItem('authToken', token);
      navigate('/home', { replace: true });
    } catch (err) {
      bToastError(typeof err === 'string' ? err : err?.message || MESSAGES.AUTH.LOGIN_FAILED);
    }
  };

  const handleDemoLogin = () => {
    dispatch(setDemoUser());
    // Same post-login welcome banner as a real login (Home reads this flag)
    sessionStorage.setItem('showLoginPopup', 'true');
    setTimeout(() => navigate('/home'), 500);
  };

  // Main login form
  return (
    <div className="login-page-container">
      <div className="login-box">
        <div className="text-center logo-login">
          <img src="/assets/brand/logo.png" alt="logo" className="img-fluid" />
        </div>

        <div className="login-form">
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="">Username</label>
              <input
                type="text"
                name="email"
                placeholder="Enter username"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {formError.email && <span className="error">{MESSAGES.VALIDATION.USERNAME_REQUIRED}</span>}
            </div>

            <div className="form-group">
              <label className="user-email-text">Password</label>
              <div className="input-group pass-visible">
                <input
                  name="password"
                  placeholder="Enter Password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn-secondary border-0"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                </button>
              </div>
              {formError.password && <span className="error">{MESSAGES.VALIDATION.PASSWORD_REQUIRED}</span>}
            </div>

            <div className="form-group">
              <div className="custom-control custom-checkbox d-inline-block">
                <input
                  type="checkbox"
                  id="customCheck"
                  name="example1"
                  className="custom-control-input"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="customCheck" className="custom-control-label">
                  I am at least{' '}
                  <VoidLink className="text-danger" role="button" onClick={() => setShowPlus18(true)}>18 years</VoidLink>{' '}
                  of age and I have read, accept and agree to the{' '}
                  <a href="/terms-and-conditions" className="" target="_blank">Terms and Conditions </a>,{' '}
                  <a href="/responsible-gaming" className="" target="_blank">Responsible Gaming </a>,{' '}
                  <a href="https://www.gamcare.org.uk/" target="_blank">GamCare</a>,{' '}
                  <a href="https://www.gamblingtherapy.org/en" target="_blank">Gambling Therapy</a>
                </label>
              </div>
            </div>

            <div className="form-group mb-0">
              <button className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          <small className="recaptchaTerms">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
            <a href="https://policies.google.com/terms">Terms of Service</a>{' '}
            apply.
          </small>

          {shouldShowApkDownload && (
            <div className="text-center mt-2">
              <a href="#" className="apk-download-link" onClick={(e) => e.preventDefault()}>
                <i className="fa fa-android me-1"></i> Download APK
              </a>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <Plus18Modal show={showPlus18} onClose={() => setShowPlus18(false)} />
    </div>
  );
}

export default Login;
