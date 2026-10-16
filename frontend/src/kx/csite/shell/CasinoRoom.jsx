import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host } from '../../ng';
import KxModal from '../../KxModal';

const O = ng('cro');
// The literal encapsulation attributes the reference's template carries (its
// own stylesheet doesn't key on them; kept for parity).
const YSG = { '_ngcontent-ysg-c0': '' };
const CUC = { '_ngcontent-cuc-c0': '' };

// The reference's casinoRoomService / casinoService state, shared with the
// rest of the casino site: whether the casino menu (app-casino-menu, the
// left-hand game list) is open, the table's countdown (non-zero moves the
// gear clear of the timer: `hasTimer`), and the Stake modal.
const state = { menuOpen: false, timer: 0, stakeOpen: false };
const subs = new Set();
const set = (patch) => {
  Object.assign(state, patch);
  subs.forEach((fn) => fn());
};
const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));
// eslint-disable-next-line react-refresh/only-export-components
export const setCasinoMenuOpen = (open) => set({ menuOpen: Boolean(open) });
// eslint-disable-next-line react-refresh/only-export-components
export const useCasinoMenuOpen = () => useSyncExternalStore(subscribe, () => state.menuOpen);
// eslint-disable-next-line react-refresh/only-export-components
export const setRoomTimer = (seconds) => set({ timer: Number(seconds) || 0 });
// eslint-disable-next-line react-refresh/only-export-components
export const setStakeModalOpen = (open) => set({ stakeOpen: Boolean(open) });
const useTimer = () => useSyncExternalStore(subscribe, () => state.timer);
const useStakeOpen = () => useSyncExternalStore(subscribe, () => state.stakeOpen);

// numberOnly(): the keypress filter on the stake boxes (char codes 45–57).
const numberOnly = (e) => {
  const n = e.which || e.keyCode;
  if (n > 31 && (n < 45 || n > 57)) e.preventDefault();
};

/**
 * app-casino-room of the casino site: the bar over the video's top-right whose
 * gear toggles the casino menu, and the #stackbetsModal Stake modal with the
 * user's quick-stake buttons. On the casino lobby (/home) the gear sits
 * flush right (lobby-page); on a table it steps left of the countdown while
 * one runs (hasTimer).
 *
 * UI only: the boxes start from the app's stake buttons (redux
 * stakeButtons.gameButtons); saving them (the reference's updateUserBetStake)
 * is the backend's to wire — Save only runs the reference's checks (no empty
 * box, no duplicates).
 */
export default function CasinoRoom({ attrs }) {
  const { pathname } = useLocation();
  const timer = useTimer();
  const menuOpen = useCasinoMenuOpen();
  const stakeOpen = useStakeOpen();
  const buttons = useSelector((s) => s.stakeButtons.gameButtons);
  const [stakes, setStakes] = useState([]);

  useEffect(() => {
    setStakes(buttons.map((b) => String(b.value)));
  }, [buttons]);

  const isLobbyPage = pathname === '/home';
  const toggleMenu = () => setCasinoMenuOpen(!menuOpen);

  const save = () => {
    if (stakes.some((s) => s === '')) return;
    const nums = stakes.map((s) => parseInt(s, 10));
    if (new Set(nums).size !== nums.length) return;
    // updateUserBetStake goes here.
  };

  const gear = (
    <ol {...O} {...YSG}>
      <li {...O} style={{ cursor: 'pointer' }} onClick={toggleMenu}>
        <i {...O} {...CUC} className="fa fa-cog fa-lg"></i>
      </li>
    </ol>
  );

  return (
    <app-casino-room {...attrs} {...host('cro')}>
      <div {...O} {...YSG} id="playerInfo" className="top">
        <div {...O} {...YSG} className="left_list"></div>
        {!isLobbyPage && (
          <div {...O} {...YSG} className={`right_list none-lobby-page${timer !== 0 ? ' hasTimer' : ''}`}>
            {gear}
          </div>
        )}
        {isLobbyPage && (
          <div {...O} {...YSG} className="right_list lobby-page">
            {gear}
          </div>
        )}
      </div>
      <KxModal open={stakeOpen} onClose={() => setStakeModalOpen(false)} id="stackbetsModal" labelledBy="stackbetsModal" attrs={O}>
        <div {...O} className="modal-dialog">
          <div {...O} className="modal-content">
            <div {...O} className="modal-header">
              <h3 {...O} className="mb-0 bold">Stake</h3>
            </div>
            <div {...O} className="stack-modal-body">
              <div {...O} className="card-body container-fluid container-fluid-5 button-value quick-stake-container">
                <div {...O} className="row row5 mb-1 desktop-pl">
                  <div {...O} className="col-3">
                    <div {...O} className="button-title" style={{ fontSize: '14px', marginLeft: '-2px' }}>
                      <span {...O}><b {...O} className="stake-amount">Quick Stakes</b></span>
                    </div>
                  </div>
                </div>
                <div {...O} className="row row5 mb-1 col-md-12 desktop-pl quick-stake-boxes">
                  {stakes.map((v, i) => (
                    <div key={i} {...O} className="col-4 col-sm-3 col-md-3 mt-2 quick-box-con">
                      <div {...O} className="form-group mb-0 quick-stake-box">
                        <input
                          {...O}
                          type="text"
                          min="1"
                          max="99999999"
                          maxLength={9}
                          className="form-control"
                          id={`quickstacks${i}`}
                          value={v}
                          onKeyPress={numberOnly}
                          onChange={(e) => setStakes((cur) => cur.map((x, j) => (j === i ? e.target.value : x)))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div {...O} className="modal-footer">
                <button {...O} className="updatebtn" onClick={save}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </KxModal>
    </app-casino-room>
  );
}
