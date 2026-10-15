import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchBalanceThunk, logout } from '../../redux/userSlice';

// The "My Account" dropdown, in the reference's order, at its paths.
export const ACCOUNT_MENU = [
  { label: 'My Profile', route: '/myprofile' },
  { label: 'Rolling Commission', route: '/rolling-commission' },
  { label: 'Account Statement', route: '/account-statement' },
  { label: 'Bets History', route: '/bet-history' },
  { label: 'Profit & Loss', route: '/profit-loss' },
  { label: 'Password History', route: '/password-history' },
  { label: 'Activity Log', route: '/activity-log' },
];

// Angular's `number:'1.2-2'` / `currency:'':''` as the reference prints them.
export const money = (v) =>
  Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Balance refresh + logout, shared by both headers. */
export function useAccountActions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return {
    reloadBalance: () => {
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-token') dispatch(fetchBalanceThunk(token));
    },
    logoutUser: () => {
      // Home reads this on mount to run its post-logout sequence.
      sessionStorage.setItem('justLoggedOut', '1');
      dispatch(logout());
      navigate('/', { replace: true });
    },
  };
}
