import { useSelector } from 'react-redux';
import { ng, KX } from './ng';

const R = ng('krn');

/**
 * app-right-nav — the desktop right rail: the "Open Bets" card. Logged in it
 * carries the reference's market picker (only its "Select Market" default for
 * now; matched-bet listing per market is not wired to this app's API yet).
 */
export default function RightNav() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  return (
    <app-right-nav {...KX}>
      <div {...R} style={{ width: '26.15vw', position: 'fixed' }}>
        <div {...R} className="card">
          <div {...R} id="live-Streaming" className="accordion-body" />
          <div {...R} className="card-header">
            <strong {...R} style={{ position: 'relative', top: 0.5 }}>Open Bets</strong>
          </div>
          <div {...R}>
            {isAuth && (
              <div {...R} className="card-body open-bet-btns">
                <div {...R} className="col-sm-12 p-0 mlist-openbets">
                  <select {...R} id="eventNameSelect" className="desktop-bets">
                    <option {...R}>Select Market</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </app-right-nav>
  );
}
