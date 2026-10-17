import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { ACCOUNT_MENU, useAccountActions } from '../header/accountMenu';

const A = ng('kac');

// The reference's list: the My Account menu with Multi Markets second.
const ITEMS = [ACCOUNT_MENU[0], { label: 'Multi Markets', route: '/multimarket' }, ...ACCOUNT_MENU.slice(1)];

/** app-account — the phone's account page (the bottom bar's Account, logged in). */
export default function Account() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.user);
  const { logoutUser } = useAccountActions();
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <app-account {...host('kac')} {...KX}>
      <div {...A} className="col-md-12">
        <h3 {...A} className="ps-2 exchange-heading exchange">
          <i {...A} className="fa fa-user-circle-o" />
          <span {...A}>{`  ${user?.username ?? ''}`}</span>
        </h3>
      </div>
      <div {...A} className="containerr">
        <ul {...A} className="account-nav">
          {ITEMS.map((m, i) => (
            <li {...A} key={m.label} className="account-tabs" onClick={() => m.route && navigate(m.route)}>
              <div {...A} className="tab-name"> {m.label} </div>
              <div {...A} className="right-arroww">
                <span {...A}>
                  {/* The reference colours the arrows from the third entry on. */}
                  <i {...A} className="fa fa-angle-right fa-lg" style={i > 1 ? { color: '#1e1e1e' } : undefined} />
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div {...A} className="logout-btn" onClick={logoutUser}>
          <a {...A} className="logout">
            <span {...A} className="logout-spn">LOGOUT </span>
            <i {...A} className="fa fa-sign-out ms-2 fa-sm" style={{ color: '#fafafa' }} />
          </a>
        </div>
      </div>
    </app-account>
  );
}
