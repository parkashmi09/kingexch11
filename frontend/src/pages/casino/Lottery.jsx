import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoMyBetsModal from '../../components/casino/CasinoMyBetsModal';
import { bToastSuccess, bToastError } from '../../components/BToast';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import { placeCasinoBet } from '../../apiservices/casinoService';
import { fetchBalanceThunk } from '../../redux/userSlice';
import { isDemoUser } from '../../utils/demoStore';
import { fakeLoaderDelay } from '../../utils/fakeLoader';
import { getGameConfig } from '../../config/casinoGames';

const GAME_TYPE = 'lottcard';
const GAME_CONFIG = getGameConfig(GAME_TYPE);

const CARD_LABELS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const FALLBACK_STAKES = [25, 50, 100, 200, 500, 1000];
const DOUBLE_RANDOM = [5, 10, 15, 20, 25, 50, 75];
const TRIPLE_RANDOM = [5, 10, 15, 20, 25, 50, 100];

// A play is N digits long: Single 0-9, Double 00-99, Triple 000-999. The bet
// fires the moment the Nth digit is picked, then the picks clear (reference:
// a placed Double leaves `.lottery-place-balls` empty and bumps "Double(1)").
const TABS = [
  { id: 'single', label: 'Single', sid: 1, size: 1, randomBets: null },
  { id: 'double', label: 'Double', sid: 2, size: 2, randomBets: DOUBLE_RANDOM },
  { id: 'triple', label: 'Triple', sid: 3, size: 3, randomBets: TRIPLE_RANDOM },
];

const EMPTY_BY_TAB = { single: [], double: [], triple: [] };
const ZERO_BY_TAB = { single: 0, double: 0, triple: 0 };

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid || s.sid === String(sid));
}

// Card face -> drawn digit. The deck reads A..10 but a draw is a DIGIT: A is 1
// and 10 is 0 (ball art is ball0..ball9).
function cardToBall(card) {
  if (card === 'A') return '1';
  if (card === '10') return '0';
  return card;
}

function formatMin(val) {
  return val || 10;
}

function formatMax(val) {
  if (!val) return '0';
  if (val >= 1000) return `${val / 1000}K`;
  return String(val);
}

function parseCardImages(cardStr) {
  if (!cardStr) return ['1', '1', '1'];
  return cardStr.split(',').map((c) => c.trim() || '1');
}

function parseWin(winStr) {
  if (!winStr) return [];
  return winStr.split(/\s+/).filter(Boolean);
}

// The reference does NOT ship both layouts and hide one with CSS — it renders
// the desktop chip column OR the mobile chips/buttons/last-result trio, gated on
// the same 768px line `d-none-small` / `d-none-big` use (responsive.css:5151 and
// :11077). Mirroring that keeps the DOM identical to the live page.
const MOBILE_Q = '(max-width: 767px)';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_Q).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_Q);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export default function Lottery() {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const gameButtons = useSelector((s) => s.stakeButtons.gameButtons);
  const [activeTab, setActiveTab] = useState('single');
  const [selectedStake, setSelectedStake] = useState(null);
  const [resultMid, setResultMid] = useState(null);
  const [showMyBets, setShowMyBets] = useState(false);
  // Digits picked so far on each tab — rendered as balls in `.lottery-place-balls`
  // and wiped once the play is complete and the bet has gone out.
  const [picks, setPicks] = useState(EMPTY_BY_TAB);
  // Tab label count = bets PLACED on that tab this round ("Single(4)"), not the
  // balls on screen — two bets on the same face still count 2.
  const [betCounts, setBetCounts] = useState(ZERO_BY_TAB);
  const [placing, setPlacing] = useState(false);
  const placingRef = useRef(false);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 60;
  const card = gameData?.card ?? '1,1,1';
  const remark = gameData?.remark ?? '';
  const sub = useMemo(() => gameData?.sub || [], [gameData]);

  const { myBets, refetch: refetchBets } = useCasinoMyBets(mid, isAuth);

  const cardImages = useMemo(() => parseCardImages(card), [card]);

  // Chips come from the account's stake-button settings — `game_buttons`, the
  // same set the sports slip and the other casino panels use. Defaults fill in
  // until the payload lands.
  const stakes = useMemo(() => {
    const fromStore = (gameButtons || []).map((b) => Number(b.value)).filter((v) => v > 0);
    return fromStore.length ? fromStore : FALLBACK_STAKES;
  }, [gameButtons]);

  useEffect(() => {
    if (selectedStake == null || !stakes.includes(selectedStake)) setSelectedStake(stakes[0]);
  }, [stakes, selectedStake]);

  // New round -> drop half-built plays and the per-tab counters
  useEffect(() => {
    setPicks(EMPTY_BY_TAB);
    setBetCounts(ZERO_BY_TAB);
  }, [mid]);

  const itemSuspended = useCallback((item) => (
    !item || (item.gstatus || '').toUpperCase() === 'SUSPENDED' || item.gstatus === '0' || !item.b
  ), []);

  const handleTabClick = useCallback((tabId, e) => {
    e.preventDefault();
    setActiveTab(tabId);
  }, []);

  const clearPicks = useCallback((tabId) => {
    setPicks((prev) => ({ ...prev, [tabId]: [] }));
  }, []);

  // Fires once a play is complete: Single on the 1st click, Double on the 2nd,
  // Triple on the 3rd. `digits` is the finished play, e.g. ['9','8'] -> "98".
  const placeBet = useCallback(async (tabId, digits) => {
    const tab = TABS.find((t) => t.id === tabId);
    const item = findBySid(sub, tab?.sid);
    const selection = digits.join('');

    if (!isAuth) { bToastError('Please login to place bets'); clearPicks(tabId); return; }
    if (itemSuspended(item)) { bToastError('Bet Not Confirm Reason Game Suspended.'); clearPicks(tabId); return; }

    const amount = Number(selectedStake) || 0;
    const min = Number(item.min) || 0;
    const max = Number(item.max) || 0;
    if (amount <= 0 || (min > 0 && amount < min) || (max > 0 && amount > max)) {
      bToastError('Bet Not Confirm Reason Min and Max Bet Range Not Valid.');
      clearPicks(tabId);
      return;
    }

    placingRef.current = true;
    setPlacing(true);

    // Demo sessions never reach the API — same fake loader + "Data Error1" the
    // other casino tables use.
    const demoUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (localStorage.getItem('token') === 'demo-token' && isDemoUser(demoUser)) {
      await fakeLoaderDelay();
      placingRef.current = false;
      setPlacing(false);
      bToastError('Data Error1');
      clearPicks(tabId);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const etype = (item.etype || 'fancy').toLowerCase();
      const res = await placeCasinoBet({
        userId: String(user?.user_id || user?.id || ''),
        player_name: item.nat || '',
        gameId: String(mid || ''),
        gameName: GAME_TYPE,
        gtype: GAME_TYPE,
        amount,
        odds: Number(item.b) || 0,
        // The played number itself — "Double" alone would not say WHICH one.
        // My Bets renders it as "Double - 98".
        selection,
        roundId: mid || 0,
        mtype: etype === 'fancy1' ? 'fancy' : etype,
        type: 'back',
      });

      if (res?.success || res?.status === 200) {
        bToastSuccess('Bet placed Successfully');
        setBetCounts((prev) => ({ ...prev, [tabId]: prev[tabId] + 1 }));
        refetchBets?.();
        const token = localStorage.getItem('token');
        if (token) dispatch(fetchBalanceThunk(token));
      } else {
        bToastError(res?.error || res?.msg || 'Failed to place bet');
      }
    } catch {
      bToastError('Error placing bet');
    } finally {
      placingRef.current = false;
      setPlacing(false);
      clearPicks(tabId);
    }
  }, [sub, isAuth, itemSuspended, selectedStake, mid, refetchBets, dispatch, clearPicks]);

  const handleCardClick = useCallback((tabId, cardLabel) => {
    if (placingRef.current) return;
    const tab = TABS.find((t) => t.id === tabId);
    const item = findBySid(sub, tab?.sid);
    if (itemSuspended(item)) return;

    // Every click APPENDS — a play may legitimately repeat a digit (99, 444),
    // so there is no toggle-off; the Clear button drops a half-built play.
    const next = [...(picks[tabId] || []), cardToBall(cardLabel)];
    setPicks((prev) => ({ ...prev, [tabId]: next }));
    if (next.length >= tab.size) placeBet(tabId, next);
  }, [sub, picks, itemSuspended, placeBet]);

  const renderTabNav = useCallback((tab) => {
    const item = findBySid(sub, tab.sid);
    return (
      <li key={tab.id} className="nav-item">
        <a
          href={`#${tab.id}`}
          data-toggle="tab"
          className={`nav-link${activeTab === tab.id ? ' active' : ''}`}
          onClick={(e) => handleTabClick(tab.id, e)}
        >
          {tab.label}({betCounts[tab.id]})
          <div className="casino-min-max w-100">
            R:<span>{formatMin(item?.min)}</span>-<span>{formatMax(item?.max)}</span>
          </div>
        </a>
      </li>
    );
  }, [activeTab, sub, betCounts, handleTabClick]);

  const renderBalls = (digits) => digits.map((d, i) => (
    <img key={`${d}-${i}`} src={`/assets/front/img/lottery/balls/ball${d}.png`} alt={`ball${d}`} />
  ));

  const renderCardGrid = useCallback((tab) => {
    const wrapperClass = tab.id === 'triple' ? 'tripple' : tab.id;
    const item = findBySid(sub, tab.sid);
    const susp = itemSuspended(item);
    const tabPicks = picks[tab.id] || [];

    return (
      <div className={wrapperClass}>
        {/* A bet in flight puts the loader overlay on the grid (reference:
            `lottery-box loader-section-parent` + `.loader-section`). */}
        <div className={`lottery-box${placing ? ' loader-section-parent' : ''}${susp ? ' suspended' : ''}`}>
          {placing && (
            <div className="loader-section">
              <div><img src="/assets/animate/loader-ten.gif" alt="loader" /></div>
            </div>
          )}
          {CARD_LABELS.map((label) => (
            <div
              key={label}
              className="lottery-card"
              onClick={() => handleCardClick(tab.id, label)}
              style={{ cursor: susp ? 'default' : 'pointer' }}
            >
              <img src={`/assets/front/img/lottery/cards/${label}.png`} alt={label} />
            </div>
          ))}
        </div>

        {/* Single has no pick list to manage — its ball is only on screen for the
            instant the bet is in flight, so it renders bare with no Clear.
            Double/Triple wrap their partial play with Clear and carry Random Bets. */}
        {tab.randomBets ? (
          <div className="lottery-place-balls">
            {tabPicks.length > 0 && (
              <div>
                {renderBalls(tabPicks)}{' '}
                <button className="lottery-btn active p-2" onClick={() => clearPicks(tab.id)}>Clear</button>
              </div>
            )}
            <div className={`random-bets${susp ? ' suspended' : ''}`}>
              <h4 className="w-100 text-center">Random Bets</h4>
              {tab.randomBets.map((n) => (
                <button key={n} className="lottery-btn active">{n}</button>
              ))}
            </div>
          </div>
        ) : tabPicks.length > 0 && (
          <div className="lottery-place-balls">{renderBalls(tabPicks)}</div>
        )}
      </div>
    );
  }, [sub, picks, placing, itemSuspended, handleCardClick, clearPicks]);

  const renderLastResults = useCallback(() => (
    lastResults.map((r, i) => {
      const digits = parseWin(r.win);
      return (
        <div key={i} className="lottery-result-group" onClick={() => setResultMid(r.mid || null)} style={{ cursor: 'pointer' }}>
          {digits.map((d, j) => (
            <div key={j} className="lottery-result-icon">{d}</div>
          ))}
        </div>
      );
    })
  ), [lastResults]);

  const renderStakeChips = useCallback(() => (
    <div className="lottery-bet-buttons">
      {stakes.map((amt) => (
        <div
          key={amt}
          className={selectedStake === amt ? 'active' : ''}
          onClick={() => setSelectedStake(amt)}
        >
          <span>{amt}</span>
        </div>
      ))}
    </div>
  ), [stakes, selectedStake]);

  const renderActionButtons = useCallback(() => (
    <div className="lottery-buttons-top">
      <button className="lottery-btn active">Repeat</button>
      <button className="lottery-btn active" onClick={() => clearPicks(activeTab)}>Clear</button>
      <button className="lottery-btn active">Remove</button>
    </div>
  ), [clearPicks, activeTab]);

  // "Double - 98 / 25" rows, shared by the sidebar block and the mobile modal
  const renderMyBetsList = () => (
    <div className="lottery-my-bets">
      {myBets.map((bet, i) => (
        <div key={bet._id || i} className="lottery-my-bet-box">
          <div>
            <span style={{ textTransform: 'capitalize' }}>{bet.player_name || bet.nat || ''}</span>{' '}
            <span> - </span>{' '}
            <span>{bet.selection ?? ''}</span>
          </div>
          <div>{bet.amount ?? bet.stake ?? ''}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fullwidthcasino-container lottery">
      <div>
        <div className="casino-container">

          {isMobile && <MobileTimer timeLeft={lt} fullTime={ft} />}

          <div className="casino-table lottery">

            <CasinoVideo
              streamUrl={streamUrl}
              gameName={GAME_CONFIG.name}
              roundId={mid}
              gameType={GAME_TYPE}
              showCards={false}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
              customCards={
                <div className="casino-video-cards d-none-desktop">
                  <div className="casino-video-cards-container">
                    <div>
                      {cardImages.map((c, i) => (
                        <span key={i}>
                          <img src={`/assets/front/img/lottery/cards/${c}.png`} alt="" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              }
            />

            {/* .casino-detail order differs per viewport in the reference:
                desktop -> [chips d-none-small] [tabs+grid] [remark]
                mobile   -> [tabs+grid] [chips d-none-big] [buttons d-none-big]
                            [remark] [last results d-none-desktop] */}
            <div className="casino-detail">

              {!isMobile && (
                <div className="lottery-left d-none-small">
                  {renderStakeChips()}
                </div>
              )}

              <div className="lottery-right">
                <div className="casino-tabs">
                  <ul className="nav nav-tabs">
                    {TABS.map(renderTabNav)}
                  </ul>
                </div>

                <div className="tab-content">
                  {TABS.map((tab, i) => {
                    // Reference: the FIRST pane never carries `fade`; the others
                    // always do and add `active show` when selected.
                    const isActive = activeTab === tab.id;
                    const cls = i === 0
                      ? `tab-pane${isActive ? ' active' : ''}`
                      : `tab-pane fade${isActive ? ' active show' : ''}`;
                    return (
                      <div key={tab.id} id={tab.id} className={cls}>
                        {renderCardGrid(tab)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {isMobile && (
                <div className="lottery-left d-none-big">
                  {renderStakeChips()}
                </div>
              )}

              {isMobile && (
                <div className="lottery-buttons d-none-big w-100 mb-3">
                  {renderActionButtons()}
                </div>
              )}

              <div className="casino-remark mt-1">
                <div className="remark-icon">
                  <img src="/assets/front/img/icons/remark.png" alt="" />
                </div>
                <div className="marquee-wrapper">
                  <div className="marquee-content no-marquee" style={{ animationDuration: '0s' }}>
                    {remark || '     '}
                  </div>
                </div>
              </div>

              {isMobile && (
                <div className="lottery-last-result d-none-desktop w-100">
                  <div className="lottery-last-result-title">
                    <div>Last Results</div>
                  </div>
                  {renderLastResults()}
                </div>
              )}

            </div>
          </div>

          {isMobile && myBets.length > 0 && (
            <div className="market-show-icon d-none-desktop" role="button" tabIndex={0} onClick={() => setShowMyBets(true)}>
              <span>{myBets.length}</span>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="right-sidebar casino-right-sidebar lottery-sidebar sticky">
          <div className="lottery-cards">
            {cardImages.map((c, i) => (
              <span key={i}>
                <img src={`/assets/front/img/lottery/cards/${c}.png`} alt="" />
              </span>
            ))}
          </div>

          <div className="lottery-last-result">
            <div className="lottery-last-result-title">
              <div>Last Results</div>
            </div>
            {renderLastResults()}
          </div>

          <div className="lottery-buttons">
            {renderActionButtons()}
          </div>

          {myBets.length > 0 && (
            <div className="casino-my-bet">
              <div className="casino-place-bet-title"><div>My Bets</div></div>
              {renderMyBetsList()}
            </div>
          )}
        </div>
      </div>

      <div className="casino-banners"></div>

      {/* Mobile My Bets — lottery body, not the generic matched-bets table */}
      <CasinoMyBetsModal show={showMyBets} onClose={() => setShowMyBets(false)} myBets={myBets}>
        <div className="casino-my-bet">{renderMyBetsList()}</div>
      </CasinoMyBetsModal>

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName={GAME_CONFIG.name}
        mid={resultMid}
      />
    </div>
  );
}
