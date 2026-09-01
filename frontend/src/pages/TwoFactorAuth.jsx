import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bToastSuccess, bToastError } from '../components/BToast';
import { telegram2faService } from '../apiservices/telegram2faService';
import { verify2FAThunk } from '../redux/userSlice';

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 'google' → the code lives in the Authenticator app (nothing to resend).
  // 'telegram' → an OTP was pushed to the bot at login.
  const method = location.state?.method || 'telegram';
  const isGoogle = method === 'google';

  useEffect(() => {
    if (location.state && location.state.userId) {
      setUserId(location.state.userId);
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  const verifyOtp = async (code) => {
    if (code.length !== 6) return;

    setLoading(true);
    try {
      const data = await dispatch(verify2FAThunk({ userId, otp: code })).unwrap();
      bToastSuccess('Authentication Verified!');

      // First login (default password not changed yet): <ForcePasswordChange />
      // at the app root drives the mandatory change, so it survives a refresh.
      if (data && data.passwordChanged === false) {
        navigate('/home', { replace: true });
        return;
      }

      sessionStorage.setItem('showLoginPopup', 'true');
      setTimeout(() => navigate('/home'), 500);
    } catch (err) {
      bToastError(typeof err === 'string' ? err : err?.message || 'Verification failed');
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = otp.map((d, idx) => (idx === index ? element.value : d));
    setOtp(newOtp);

    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((val) => val !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    try {
      await telegram2faService.resendOTP(userId);
      bToastSuccess('Code resent successfully!');
    } catch (error) {
      bToastError('Failed to resend code.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyOtp(otp.join(''));
  };

  return (
    // .login-auth is the theme's full-height centering wrapper (style.css:15257)
    // and .featured-box-login is its black panel — the panel's own class must
    // NOT be .login-auth, or the flex row puts the title beside the boxes.
    <div className="login-auth">
      <div className="text-center">
        <div className="log-logo">
          <img src="/assets/brand/logo.png" alt="logo" className="img-fluid" />
        </div>

        <div className="featured-box-login">
          <h5 className="mb-3"><b>
            {isGoogle
              ? 'Security Code Verification Using Google Authenticator App'
              : 'Security Code Verification Using Telegram App'}
          </b></h5>

          {!isGoogle && (
            <p className="small mb-3">
              Enter the 6-digit code from your Telegram bot.{' '}
              <button
                type="button"
                className="btn btn-link p-0 small"
                onClick={handleResend}
                disabled={loading}
              >
                Resend Code
              </button>
            </p>
          )}

          {/* Verification fires on the 6th digit — no submit button needed.
              The form stays so Enter still works. */}
          <form onSubmit={handleSubmit}>
            <div className="d-flex flex-wrap">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  value={data}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
