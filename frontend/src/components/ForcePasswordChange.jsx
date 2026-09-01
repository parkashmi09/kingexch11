import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, passwordChangeCompleted } from '../redux/userSlice';
import ChangePasswordModal from './modals/ChangePasswordModal';

// A first-login account still carries the password its upline set, so changing
// it is mandatory. Mounted at the app root (not on Login) for one reason: the
// login response already stored the token, so a refresh mid-flow re-hydrated an
// authenticated session and the modal was gone. Now the state that drives it
// lives in redux + localStorage, and this renders wherever the user lands.
function ForcePasswordChange() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, mustChangePassword } = useSelector((s) => s.user);
  const pending = isAuthenticated && mustChangePassword;

  // While the change is owed the account is signed in but NOT allowed inside:
  // it is pinned to /login, so the modal sits over the login page rather than
  // over the app. This is the guard that holds — the login handler simply not
  // navigating was never enough, since a refresh, the Back button or a typed
  // URL could all still land the user on a page they shouldn't be on.
  useEffect(() => {
    if (pending && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [pending, location.pathname, navigate]);

  if (!pending) return null;

  return (
    <ChangePasswordModal
      show
      forced
      // The only way out without changing it is signing out — closing must not
      // leave a session running on the default password.
      onClose={() => {
        dispatch(logout());
        navigate('/login', { replace: true });
      }}
      onSuccess={() => {
        dispatch(passwordChangeCompleted());
        // No need to queue the rules modal here any more: Home opens it off the
        // account's own `rules_accepted` flag, which the profile API returns on
        // the next login (admin/bakend-docs/user-accept-rules.md).
        // The session was running on the default password — end it. The user
        // must sign in again with the NEW password before entering the app.
        // The flag tells Login to render its post-change state: fields wiped
        // but the "required" errors showing, as the reference does.
        dispatch(logout());
        navigate('/login', { replace: true, state: { passwordChanged: true } });
      }}
    />
  );
}

export default ForcePasswordChange;
