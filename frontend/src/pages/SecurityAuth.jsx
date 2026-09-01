import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { bToastSuccess, bToastError } from '../components/BToast';
import { telegram2faService } from '../apiservices/telegram2faService';
import { googleAuthService } from '../apiservices/googleAuthService';
import { getUserProfileWithWallet } from '../apiservices/authService';
import { logout } from '../redux/userSlice';
import FullScreenLoader from '../components/FullScreenLoader';

const APK_URL = 'https://sitethemedata.com/authp_apk/SecureAuthApp-2.0.apk';

const generateAuthCode = () => String(Math.floor(100000 + Math.random() * 900000));
const emptyOtp = () => new Array(6).fill('');

/**
 * The 6-box security-code input used by both the enable and the disable steps.
 * Fires onComplete as soon as the last digit lands, so there is no Verify
 * button to press.
 */
function OtpBoxes({ value, onChange, onComplete, disabled }) {
  const refs = useRef([]);

  const handleChange = (el, index) => {
    if (isNaN(el.value)) return;
    const next = value.map((digit, i) => (i === index ? el.value : digit));
    onChange(next);
    if (el.value && index < 5) refs.current[index + 1]?.focus();
    if (next.every((digit) => digit !== '')) onComplete(next.join(''));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) refs.current[index - 1]?.focus();
  };

  return (
    <div className="d-flex justify-content-center flex-wrap" style={{ gap: '12px' }}>
      {value.map((digit, index) => (
        <input
          key={index}
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          maxLength="1"
          value={digit}
          ref={(el) => { refs.current[index] = el; }}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoFocus={index === 0}
          className="text-center secure-otp-box"
          style={{
            width: '56px',
            height: '56px',
            fontSize: '1.5rem',
            background: '#fff',
            color: '#222',
            border: '1px solid #c9c9c9',
            borderRadius: '8px',
          }}
        />
      ))}
    </div>
  );
}

// Bootstrap 4 paints <kbd> #212529, which vanishes on the #222 panel.
const KBD_STYLE = {
  background: '#3d3d3d',
  color: '#fff',
  padding: '2px 8px',
  borderRadius: '3px',
  whiteSpace: 'nowrap',
};

/**
 * The bot handle is set by the owner in the admin panel. If it has not been
 * configured yet, say so instead of rendering a dead "@undefined" link.
 */
function TelegramBotLink({ link }) {
  if (!link?.botUsername) {
    return <span className="text-warning">(bot not configured — contact support)</span>;
  }
  return (
    <a href={link.botLink} target="_blank" rel="noopener noreferrer">
      @{link.botUsername}
    </a>
  );
}

function SecurityAuth() {
  // No tab is opened until the user picks one
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Android App tab — new code on every visit to the tab
  const [mobileAuthCode, setMobileAuthCode] = useState(generateAuthCode);

  // Telegram tab
  const [password, setPassword] = useState('');
  // { code, botUsername, botLink } — the bot is configured by the owner in the
  // admin panel, so its handle arrives with the code.
  const [telegramLink, setTelegramLink] = useState(null);

  // Google Auth tab
  const [googlePassword, setGooglePassword] = useState('');
  const [googleSetup, setGoogleSetup] = useState(null); // { qrCode, secret }
  const [googleOtp, setGoogleOtp] = useState(emptyOtp);

  // Disable flow (shown after clicking the Enabled badge)
  const [showDisableInput, setShowDisableInput] = useState(false);
  const [otp, setOtp] = useState(emptyOtp);

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // securityAuthType is the source of truth; telegram2FAEnabled is the
  // fallback for a profile payload from before that column existed.
  const authType = user?.securityAuthType || (user?.telegram2FAEnabled ? 'telegram' : null);
  const isEnabled = !!authType;

  /**
   * Enabling or disabling secure auth changes how this account logs in, so the
   * session is ended and the user comes back through the login flow.
   */
  const logoutAfterChange = (message) => {
    bToastSuccess(message);
    setTimeout(() => {
      sessionStorage.setItem('justLoggedOut', '1');
      dispatch(logout());
      navigate('/login', { replace: true });
    }, 1500);
  };

  /**
   * Telegram linking completes on Telegram's side — the bot calls the webhook,
   * so this page never hears about it. Poll the profile while the instructions
   * are on screen and log out the moment the account flips to linked, matching
   * the Google Auth flow.
   *
   * Stops on success, on unmount, and after the link code's 10-minute lifetime.
   */
  useEffect(() => {
    if (!telegramLink) return undefined;

    let stopped = false;
    const startedAt = Date.now();
    const LINK_CODE_TTL_MS = 10 * 60 * 1000;

    const interval = setInterval(async () => {
      if (Date.now() - startedAt > LINK_CODE_TTL_MS) {
        clearInterval(interval);
        return;
      }
      try {
        const profile = await getUserProfileWithWallet();
        if (stopped) return;
        if (profile?.securityAuthType || profile?.telegram2FAEnabled) {
          clearInterval(interval);
          logoutAfterChange('Telegram linked successfully');
        }
      } catch {
        // A blip should not abort the wait — the next tick retries.
      }
    }, 3000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramLink]);

  const handleTabClick = (tab) => {
    // Re-generate the auth code every time the Android App tab is opened
    if (tab === 'android') setMobileAuthCode(generateAuthCode());
    setActiveTab(tab);
  };

  // ── Telegram ──────────────────────────────────────────────────────────────
  const handleGetConnectionId = async () => {
    if (!password) {
      bToastError('Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      await telegram2faService.verifyPassword(password);
      const link = await telegram2faService.getLinkCode();
      setTelegramLink(link);
      bToastSuccess('Connection ID Generated Successfully');
    } catch (error) {
      bToastError(error?.response?.data?.error || error.message || 'Failed to generate connection ID');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google Authenticator ──────────────────────────────────────────────────
  const handleGoogleSetup = async () => {
    if (!googlePassword) {
      bToastError('Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      const data = await googleAuthService.setup(googlePassword);
      setGoogleSetup({ qrCode: data.qrCode, secret: data.secret });
      setGoogleOtp(emptyOtp());
      bToastSuccess('Password Verified Successfully');
    } catch (error) {
      bToastError(error?.response?.data?.error || error.message || 'Invalid Password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleEnable = async (code) => {
    if (code.length !== 6) return;
    setIsLoading(true);
    try {
      const data = await googleAuthService.enable(code);
      logoutAfterChange(data?.message || 'Google Authenticator enabled successfully');
    } catch (error) {
      bToastError(error?.response?.data?.error || error.message || 'Invalid authentication code');
      setGoogleOtp(emptyOtp());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(googleSetup.secret);
      bToastSuccess('Setup code copied');
    } catch {
      bToastError('Could not copy — please select the code manually');
    }
  };

  // ── Disable (Enabled badge) ───────────────────────────────────────────────
  const handleEnabledClick = async () => {
    // Google codes come from the app — nothing to send, just ask for one.
    if (authType === 'google') {
      setOtp(emptyOtp());
      setShowDisableInput(true);
      return;
    }

    setIsLoading(true);
    try {
      await telegram2faService.sendDisableCode();
      setOtp(emptyOtp());
      setShowDisableInput(true);
      bToastSuccess('Code sent to your Telegram!');
    } catch (error) {
      bToastError(error?.response?.data?.error || error.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (code) => {
    if (code.length !== 6) return;
    setIsLoading(true);
    try {
      const data = authType === 'google'
        ? await googleAuthService.disable(code)
        : await telegram2faService.disable2FA(code);
      setShowDisableInput(false);
      logoutAfterChange(data?.message || 'Secure auth verification disabled successfully');
    } catch (error) {
      bToastError(error?.response?.data?.error || error.message || 'Failed to disable secure auth');
      setOtp(emptyOtp());
    } finally {
      setIsLoading(false);
    }
  };

  const codeSourceLabel = authType === 'google'
    ? 'Enter 6-digit code from your security google auth verification App'
    : 'Enter the 6-digit code sent to your Telegram';

  return (
    <div className="report-box security-auth w-100">
      {isLoading && <FullScreenLoader />}
      <div className="report-title">
        <div className="report-name">Security Auth Verification</div>
      </div>
      <div>
        <div className="text-center">
          <b>Security Auth Verification Status:</b>{' '}
          {isEnabled ? (
            // Clicking the badge starts the disable flow
            <span
              className="badge badge-success"
              style={{ cursor: 'pointer', padding: '3px 9px', fontSize: '0.75rem' }}
              onClick={handleEnabledClick}
              title="Click to disable secure auth verification"
            >
              Enabled
            </span>
          ) : (
            <span className="badge badge-danger" style={{ padding: '3px 9px', fontSize: '0.75rem' }}>Disabled</span>
          )}
        </div>

        {/* Enabled: nothing else until the badge is clicked */}
        {isEnabled && showDisableInput && (
          <div className="mt-4 text-center">
            <h2 className="mb-4"><b>Security Code Verification</b></h2>
            <p className="mb-4">{codeSourceLabel}</p>
            <OtpBoxes
              value={otp}
              onChange={setOtp}
              onComplete={handleDisable}
              disabled={isLoading}
            />
            {authType !== 'google' && (
              <p className="mt-3">
                <span
                  className="text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={handleEnabledClick}
                >
                  Resend Code
                </span>
              </p>
            )}
          </div>
        )}

        {/* Not enabled: pick a method */}
        {!isEnabled && (
          <>
            <div className="mt-2 text-center">
              Please select below option to enable secure auth verification
            </div>

            <div className="casino-report-tabs mt-3">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <a
                    className={`nav-link${activeTab === 'android' ? ' active' : ''}`}
                    onClick={() => handleTabClick('android')}
                  >
                    Android App
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link${activeTab === 'telegram' ? ' active' : ''}`}
                    onClick={() => handleTabClick('telegram')}
                  >
                    Telegram
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link${activeTab === 'google' ? ' active' : ''}`}
                    onClick={() => handleTabClick('google')}
                  >
                    Google Auth
                  </a>
                </li>
              </ul>
            </div>

            <div className="tab-content">
              {activeTab === 'android' && (
                <div className="tab-pane mobile-app active">
                  <div className="text-center">
                    <div className="mt-3">
                      Please enter below auth code in your 'Secure Auth Verification App'.
                    </div>
                    <div className="mt-3">
                      <div className="verify-code">{mobileAuthCode}</div>
                    </div>
                    <div className="mt-3">
                      <b>If you haven't downloaded,<br />please download 'Secure Auth Verification App' from below link.</b>
                    </div>
                    <div className="mt-3">
                      Using this app you will receive auth code during login authentication
                    </div>
                    <div className="mt-3">
                      <a href={APK_URL} target="_blank" rel="noopener noreferrer">
                        <button className="btn btn-primary">
                          <i className="fab fa-android"></i> <span>Download on the Android</span>
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'telegram' && (
                <div className="tab-pane active p-3">
                  {!telegramLink && (
                    <div className="mt-2">
                      <p className="text-center mb-3">
                        Please enter your login password to continue
                      </p>
                      <div className="d-flex justify-content-center flex-wrap secure-password" style={{ gap: '8px' }}>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your login password"
                          className="form-control"
                          style={{ width: '260px', maxWidth: '100%' }}
                          onKeyDown={(e) => e.key === 'Enter' && handleGetConnectionId()}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleGetConnectionId}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Loading...' : 'Get Connection ID'}
                        </button>
                      </div>
                    </div>
                  )}

                  {telegramLink && (
                    <div className="mt-4 text-center">
                      {/* .follow-instruction is the theme's black panel */}
                      <div className="follow-instruction" style={{ padding: '16px 24px', maxWidth: '100%' }}>
                        <h5 className="mb-3"><b>
                          Please follow below instructions for the telegram 2-step verification
                        </b></h5>
                        <p className="mb-3">
                          Find <TelegramBotLink link={telegramLink} /> in your telegram and type{' '}
                          <kbd style={KBD_STYLE}>/start</kbd> command. Bot will respond you.
                        </p>
                        <p className="mb-3">
                          After this type <kbd style={KBD_STYLE}>/connect {telegramLink.code}</kbd> and send it to BOT.
                        </p>
                        <p className="mb-0">
                          Now your telegram account will be linked with your website account and
                          2-Step verification will be enabled.
                        </p>

                        <hr />

                        <h5 className="mb-3"><b>
                          कृपया टेलीग्राम 2-Step verification के लिए नीचे दिए गए निर्देशों का पालन करें:
                        </b></h5>
                        <p className="mb-3">
                          अपने टेलीग्राम में <TelegramBotLink link={telegramLink} /> खोजें और कमांड{' '}
                          <kbd style={KBD_STYLE}>/start</kbd> टाइप करें। BOT आपको जवाब देगा।
                        </p>
                        <p className="mb-3">
                          इसके बाद <kbd style={KBD_STYLE}>/connect {telegramLink.code}</kbd> टाइप करें और BOT पर भेजें।
                        </p>
                        <p className="mb-0">
                          अब आपका टेलीग्राम account आपके वेबसाइट account से जुड़ जाएगा और
                          2-Step verification चालू हो जाएगा।
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'google' && (
                <div className="tab-pane active p-3">
                  <div className="mt-2">
                    <p className="text-center mb-3">
                      Please enter your login password to continue
                    </p>
                    <div className="d-flex justify-content-center flex-wrap secure-password" style={{ gap: '8px' }}>
                      <input
                        type="password"
                        value={googlePassword}
                        onChange={(e) => {
                          setGooglePassword(e.target.value);
                          setGoogleSetup(null);
                        }}
                        placeholder="Enter your login password"
                        className="form-control"
                        style={{ width: '260px', maxWidth: '100%' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleGoogleSetup()}
                        disabled={!!googleSetup}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleGoogleSetup}
                        disabled={isLoading || !!googleSetup}
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                  {googleSetup && (
                    <div className="mt-4 text-center">
                      <h6 className="mb-3"><b>Scan this QR code in Google Authenticator</b></h6>
                      <div>
                        <img
                          src={googleSetup.qrCode}
                          alt="Google Authenticator QR code"
                          style={{ width: '260px', maxWidth: '100%', background: '#fff', padding: '10px' }}
                        />
                      </div>

                      <div className="mt-3">
                        <b>Setup Code:</b>
                      </div>
                      <div className="mt-2 d-flex justify-content-center align-items-center flex-wrap" style={{ gap: '10px' }}>
                        <span style={{ wordBreak: 'break-all' }}>{googleSetup.secret}</span>
                        <i
                          className="far fa-copy"
                          style={{ cursor: 'pointer' }}
                          title="Copy setup code"
                          onClick={handleCopySecret}
                        ></i>
                      </div>

                      <h2 className="mt-4 mb-4"><b>Security Code Verification</b></h2>
                      <p className="mb-4">
                        Enter 6-digit code from your security google auth verification App
                      </p>
                      <OtpBoxes
                        value={googleOtp}
                        onChange={setGoogleOtp}
                        onComplete={handleGoogleEnable}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SecurityAuth;
