import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/userSlice';
import { isDemoUser } from '../../utils/demoStore';
import SetButtonValueModal from '../../components/modals/SetButtonValueModal';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import MyMarketModal from '../../components/modals/MyMarketModal';
import { common } from '../assets';

// The rows, in the reference's order where the two apps agree.
//
// Labels and destinations are tenexch's, not the reference's: this app has an
// Activity Log, Live Casino Bets, SportBook Bets, a Fraud Report and Security
// Auth that the reference has no equivalent for, and no Profit/Loss report or
// Rules page to put in their place. Dropping them to match the reference's list
// exactly would delete features the operator actually has, so the panel keeps
// tenexch's menu and borrows the closest reference icon for each row.
//
// `modal` rows open a dialog instead of routing — Set Button Value and Change
// Password are dialogs in this app.
const MENU = [
  { label: 'Account Statement', icon: 'account-statement.svg', route: '/report/accountstatement' },
  { label: 'Current Bets', icon: 'unsettled-bet.svg', route: '/report/currentbets' },
  { label: 'Activity Log', icon: 'bet-history.svg', route: '/report/activity' },
  { label: 'Casino Results', icon: 'results.svg', route: '/report/casinoresult' },
  { label: 'Live Casino Bets', icon: 'results.svg', route: '/report/livecasinoresult' },
  { label: 'SportBook Bets', icon: 'bet-history.svg', route: '/report/sportbookresult' },
  { label: 'Set Button Value', icon: 'set-stake.svg', modal: 'setstake' },
  { label: 'Change Password', icon: 'change-password.svg', modal: 'password' },
  { label: 'Security Auth Verification', icon: 'change-password.svg', route: '/settings/secureauth' },
  { label: 'Fraud Report', icon: 'rules.svg', route: '/report/fraud-report' },
];

// What a demo session may open. Taken from tenexch's own rule (its user
// sidebar allows exactly these three reports, and Set Button Value sits outside
// its !isDemo block) rather than invented here — the reference's own list is no
// use, since it gates on a Rules page this app does not have.
const DEMO_ALLOWED = new Set([
  '/report/accountstatement',
  '/report/currentbets',
  '/report/casinoresult',
]);
const allowedForDemo = (item) => item.modal === 'setstake' || DEMO_ALLOWED.has(item.route);

const money = (v) => Number(v ?? 0).toFixed(2);

/**
 * The account panel behind the balance button.
 *
 * Slides in from the right over a click-away overlay: who you are and your
 * balance, your exposure, the report menu, then logout.
 *
 * The reference also shows a P&L row beside Exposure. tenexch's wallet has no
 * profit/loss figure — the header only ever tracked balance and exposure — so
 * that row is left out rather than filled with a zero that would read as a real
 * position.
 */
function AccountPanel({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user, balance, exposure } = useSelector((s) => s.user);
  const [modal, setModal] = useState(null);

  const isDemo = isDemoUser(user) && localStorage.getItem('token') === 'demo-token';
  const username = isDemo ? 'Demo' : user?.username || user?.name || '';
  const exposureValue = Number(exposure ?? 0);

  const pick = (item) => {
    if (item.modal) {
      setModal(item.modal);
      return;
    }
    onClose();
    navigate(item.route);
  };

  const onLogout = () => {
    // Home reads this on mount to run its post-logout sequence — it mounts
    // fresh and never sees the auth flip itself.
    sessionStorage.setItem('justLoggedOut', '1');
    dispatch(logout());
    onClose();
    navigate('/', { replace: true });
  };

  const rows = MENU.filter((item) => !isDemo || allowedForDemo(item));

  return (
    <div>
      <div className="profile-overlay" onClick={onClose}></div>
      <div className="profile-popup">
        <div>
          <div className="d-flex justify-content-end profile-balance">
            <i className="fa fa-times close-icon" onClick={onClose}></i>
          </div>

          <div className="profile-header popup-profilebox">
            <div className="profile-user">
              <i className="fa fa-user-circle"></i>
              <span>
                {username} - {money(balance)}
              </span>
            </div>
          </div>

          {/* The exposure figure is the My Market button in both apps — the
              reference opens its own market dialog from here, and tenexch opens
              this one from the header's "Exp:" figure. Neither lets a demo
              session in. */}
          <div
            className="profile-balance pop-exposure-btn"
            onClick={() => !isDemo && setModal('mymarket')}
          >
            <div>Exposure</div>
            <div>
              <span
                className={`cmenu ${exposureValue < 0 ? 'rightexdanger' : 'rightexposuccess'}`}
              >
                {money(exposureValue)}
              </span>
            </div>
          </div>

          <ul className="profile-menu">
            {rows.map((item) => (
              <li
                key={item.label}
                className={item.route && pathname === item.route ? 'active' : ''}
                onClick={() => pick(item)}
              >
                <div className="profileulli">
                  <span className="rightsideiconbg">
                    <img
                      src={common(item.icon)}
                      className="ball-images-tab"
                      alt={item.label}
                    />
                  </span>
                  {item.label}
                </div>
              </li>
            ))}
          </ul>

          <div className="profile-balance right-popup-delete-btn" onClick={onLogout}>
            <div>
              <img src={common('logout.svg')} className="ball-images-tab mr-6" alt="Logout" />
              Logout
            </div>
          </div>
        </div>
      </div>

      <SetButtonValueModal show={modal === 'setstake'} onClose={() => setModal(null)} />
      <ChangePasswordModal show={modal === 'password'} onClose={() => setModal(null)} />
      <MyMarketModal
        show={modal === 'mymarket'}
        onClose={() => setModal(null)}
        userId={user?.user_id || user?.id || user?._id}
      />
    </div>
  );
}

export default AccountPanel;
