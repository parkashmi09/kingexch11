import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/userSlice';
import { isDemoUser } from '../../utils/demoStore';
import MyMarketModal from '../../components/modals/MyMarketModal';
import { common } from '../assets';

// The reference's menu, verbatim: eight rows in this order, each on its own
// page at the reference's own path. Set Stake and Change Password are pages
// here, not the dialogs tenexch used to open from this panel.
//
// tenexch's extra reports — Activity Log, Casino Results, Live Casino Bets,
// SportBook Bets, Security Auth, Fraud Report — have no row in the reference
// and so have none here; they keep working at their own /report/* URLs.
const MENU = [
  { label: 'Account Statement', icon: 'account-statement.svg', route: '/accountstatement' },
  { label: 'Profit Loss Report', icon: 'profit-loss-report.svg', route: '/profitloss' },
  { label: 'Bet History', icon: 'bet-history.svg', route: '/bethistory' },
  { label: 'Unsettled Bet', icon: 'unsettled-bet.svg', route: '/unsettledbet' },
  { label: 'Set Stake', icon: 'set-stake.svg', route: '/setstake' },
  { label: 'Rules', icon: 'rules.svg', route: '/rules' },
  { label: 'Change Password', icon: 'change-password.svg', route: '/changepassword' },
  { label: 'Results', icon: 'results.svg', route: '/results' },
];

// A demo session sees Rules and nothing else — every other row reads or writes
// an account that isn't there. This is the reference's rule; tenexch's own user
// sidebar is more permissive (three reports plus Set Button Value), so a demo
// user reaches less here than they did through the old menu.
const allowedForDemo = (item) => item.label === 'Rules';

const money = (v) => Number(v ?? 0).toFixed(2);

/**
 * The account panel behind the balance button.
 *
 * Slides in from the right over a click-away overlay: who you are and your
 * balance, your exposure, the report menu, then logout.
 *
 * The P&L row has no figure behind it yet: tenexch tracks balance and exposure
 * and nothing else — no wallet field, no report endpoint — so it reads 0.00
 * until the backend supplies one. It renders anyway because the reference shows
 * it, and it picks up `user.pnl` the moment that exists.
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
  const pnlValue = Number(user?.pnl ?? 0);

  const pick = (item) => {
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

          <div className="profile-balance pop-pandl-btn">
            <div>P&L</div>
            <div>
              <span className={`cmenu ${pnlValue < 0 ? 'rightexdanger' : 'rightexposuccess'}`}>
                {money(pnlValue)}
              </span>
            </div>
          </div>

          <ul className="profile-menu">
            {rows.map((item) => (
              <li
                key={item.label}
                className={pathname === item.route ? 'active' : ''}
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

      <MyMarketModal
        show={modal === 'mymarket'}
        onClose={() => setModal(null)}
        userId={user?.user_id || user?.id || user?._id}
      />
    </div>
  );
}

export default AccountPanel;
