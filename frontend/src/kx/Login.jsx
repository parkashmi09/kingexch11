import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ng, host, KX } from './ng';
import { KX_LOGO } from './assets';
import Loader from './Loader';
import useLoginFlow from '../hooks/useLoginFlow';
import { setDemoUser } from '../redux/userSlice';
import { recordDemoLogin } from '../utils/demoStore';
import { bToastError } from '../components/BToast';

const C = ng('klu');

/**
 * app-login-unity — the reference's full-screen login page (its own route,
 * outside the layout): logo, Username and Password boxes with their icons,
 * Login and "Login with Demo ID".
 *
 * Validation follows the reference's template-driven form: a field's message
 * shows once it has been touched or edited and is invalid; submitting with a
 * password under 6 characters does nothing. The demo button is disabled while
 * either box has text. A failed login clears both boxes.
 */
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const login = useLoginFlow();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  // Angular's dirty || touched, per control.
  const [seen, setSeen] = useState({ userName: false, password: false });
  const see = (name) => setSeen((s) => (s[name] ? s : { ...s, [name]: true }));

  useEffect(() => {
    if (isAuth) navigate('/', { replace: true });
    // Only on arrival, like the reference's ngOnInit token check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return;
    setBusy(true);
    const result = await login(userName.trim().toLowerCase(), password);
    if (!result.ok) {
      setBusy(false);
      setUserName('');
      setPassword('');
      bToastError(result.error);
    }
  };

  const demo = () => {
    dispatch(setDemoUser());
    recordDemoLogin();
    sessionStorage.setItem('showLoginPopup', 'true');
    navigate('/', { replace: true });
  };

  const userError = seen.userName && !userName;
  const passError = seen.password && (!password ? 'Password is required.' : password.length < 6 ? 'Password should have at least 6 characters.' : '');

  return (
    <app-login-unity {...host('klu')} {...KX}>
      {busy && <Loader attrs={C} />}
      <div {...C} className="main-Box-login">
        <a {...C} className="crossIcon" onClick={() => navigate('/home')}>
          <i {...C} className="fas fa-times"></i>
        </a>
        <div {...C} className="centered-container">
          <div {...C} className="loginlogo" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img {...C} alt="" src={KX_LOGO} />
          </div>
          <div {...C} className="mt-4">
            <form {...C} noValidate onSubmit={submit}>
              <div {...C} className="mb-4">
                <div {...C} className="d-flex align-items-center phoneNumberDiv" style={{ position: 'relative' }}>
                  <input
                    {...C}
                    type="text"
                    autoFocus
                    tabIndex={1}
                    required
                    name="userName"
                    id="userName"
                    placeholder="Username"
                    maxLength={30}
                    className="form-control phoneNumberInput"
                    value={userName}
                    onChange={(e) => { setUserName(e.target.value); see('userName'); }}
                    onBlur={() => see('userName')}
                  />
                  <button {...C} type="button" className="btn btn-outline-secondary showPasswordbtn" style={{ border: 'none' }}>
                    <i {...C} className="fa fa-user inputicon fa-lg user-icon"></i>
                  </button>
                </div>
                {userError && (
                  <span {...C} className="error-message">
                    <div {...C}>Please enter username. </div>
                  </span>
                )}
              </div>
              <div {...C} className="mb-4">
                <div {...C} className="d-flex phoneNumberDiv">
                  <input
                    {...C}
                    tabIndex={2}
                    required
                    minLength={6}
                    id="password"
                    name="password"
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control phoneNumberInput"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); see('password'); }}
                    onBlur={() => see('password')}
                  />
                  <button {...C} type="button" className="btn btn-outline-secondary showPasswordbtn" style={{ border: 'none' }} onClick={() => setShowPassword((v) => !v)}>
                    <i {...C} className={`fa inputicon ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
                {passError && (
                  <span {...C} className="error-message">
                    <div {...C}> {passError} </div>
                  </span>
                )}
              </div>
              <div {...C}>
                <button {...C} type="submit" className="btn-send ui-link loginBtn">Login</button>
                <button
                  {...C}
                  type="button"
                  className="btn-send ui-link loginBtn mt-1 disablebtn"
                  disabled={userName.length > 0 || password.length > 0}
                  onClick={demo}
                >
                  Login with Demo ID
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </app-login-unity>
  );
}
