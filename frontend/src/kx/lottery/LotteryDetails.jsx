import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import Loader from '../Loader';
import KxModal from '../KxModal';
import { refPost, ngDate, ngNumber, SITE_KEY } from '../refApi';
import { bToastError } from '../../components/BToast';

const C = ng('kltd');

const TABS = [
  { caption: 'ANK_OPEN', label: 'ANK OPEN', color: '#0b59d6' },
  { caption: 'PANA_OPEN', label: 'PANA OPEN', color: '#fa386b' },
  { caption: 'JODI_OPEN_CLOSE', label: 'JODI (OC)', color: '#ff7800' },
  { caption: 'ANK_CLOSE', label: 'ANK CLOSE', color: '#7840b7' },
  { caption: 'PANA_CLOSE', label: 'PANA CLOSE', color: '#15926d' },
];
const RANGES = [0, 20, 40, 60, 80];
// The reference's stake ladder when the user has none of their own.
const DEFAULT_STAKES = [100, 200, 500, 5000, 10000, 25000, 50000, 100000];
// The reference follows the market live (Firestore) while signed in; this
// re-reads it instead.
const LIVE_POLL_MS = 10000;

const isPana = (m) => m.marketName.includes('SP,DP,TP');
const canBet = (m, now) => ['OPEN', 'ONLINE'].includes(m.status) && !m.isClosed && (m.closesAt == null || m.closesAt > now);

function remaining(m, now) {
  if (m.closesAt == null) return '';
  const s = Math.max(0, Math.ceil((m.closesAt - now) / 1000));
  if (s === 0) return 'Closed';
  const d = Math.floor(s / 86400);
  const hms = [Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  return d ? `${d}d ${hms}` : hms;
}

const toMarkets = (arr) =>
  arr
    .map((m) => {
      const at = m.marketClosedTime ? new Date(m.marketClosedTime.trim().replace(' ', 'T')).getTime() : NaN;
      return { ...m, closesAt: Number.isFinite(at) ? at : null };
    })
    .sort((a, b) => a.sequence - b.sequence);

const EMPTY = { numbers: [], digits: [], stake: 0, range: 0 };

/**
 * app-lottery-details — /lottery/:sportId/:eventId, one lottery event's
 * markets (Ank, Pana, Jodi), grouped by type in tabs. Numbers are tapped onto
 * the market's slip (Pana: three digits make one combination), staked per
 * number and placed together.
 */
export default function LotteryDetails() {
  const navigate = useNavigate();
  const { sportId, eventId } = useParams();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { balance, exposure } = useSelector((s) => s.user);
  const stakeButtons = useSelector((s) => s.stakeButtons);
  const betStakes = isAuth && stakeButtons.loaded ? stakeButtons.gameButtons.map((b) => Number(b.value)) : DEFAULT_STAKES;

  const [event, setEvent] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [states, setStates] = useState({});
  const [caption, setCaption] = useState('');
  const [now, setNow] = useState(Date.now());
  const [placing, setPlacing] = useState(false);
  const [rules, setRules] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const request = useRef(0);

  const state = (m) => states[m.marketId] || EMPTY;
  const update = (m, fn) => setStates((all) => ({ ...all, [m.marketId]: { ...(all[m.marketId] || EMPTY), ...fn(all[m.marketId] || EMPTY) } }));

  const load = (quiet) => {
    const id = ++request.current;
    if (!quiet) { setLoading(true); setLoadError(false); }
    return refPost('/api/exchange/markets/getMarketsEventList', { eventId, sportId, key: SITE_KEY })
      .catch(() => null)
      .then((res) => {
        if (id !== request.current) return;
        if (quiet && !res) return;
        const ev = res?.data?.lotteryData?.[0];
        setLoading(false);
        setLoadError(!res);
        setEvent(ev);
        setMarkets(toMarkets(ev?.marketsArr || []));
      });
  };

  useEffect(() => {
    setStates({});
    setMarkets([]);
    setEvent(null);
    setCaption('');
    load();
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const live = isAuth ? setInterval(() => load(true), LIVE_POLL_MS) : null;
    return () => { request.current++; clearInterval(tick); clearInterval(live); };
  }, [sportId, eventId, isAuth]);

  // A market that stops taking bets drops its picks.
  useEffect(() => {
    const shut = markets.filter((m) => !canBet(m, Date.now()) && states[m.marketId]?.numbers.length + states[m.marketId]?.digits.length);
    if (shut.length) setStates((all) => Object.fromEntries(Object.entries(all).map(([k, v]) => [k, shut.some((m) => m.marketId === k) ? { ...v, numbers: [], digits: [] } : v])));
  }, [markets, now]);

  const open = markets.filter((m) => canBet(m, now));
  const visibleTabs = [...new Set(open.map((m) => m.caption))].flatMap((c) => TABS.filter((t) => t.caption === c));
  const active = visibleTabs.some((t) => t.caption === caption) ? caption : visibleTabs[0]?.caption || '';
  const activeMarkets = open.filter((m) => m.caption === active);
  const accent = TABS.find((t) => t.caption === active)?.color || '#0b59d6';
  const eventOpen = markets.some((m) => canBet(m, now));

  const selected = (m, n) => (isPana(m) ? state(m).digits.includes(n) : state(m).numbers.includes(n));
  const total = (m) => state(m).numbers.length * (Number(state(m).stake) || 0);
  const visibleNumbers = (m) =>
    m.caption === 'JODI_OPEN_CLOSE' ? m.lotteryNumbers.filter((n) => Number(n) >= state(m).range && Number(n) < state(m).range + 20) : m.lotteryNumbers;

  const toggleNumber = (m, n) => {
    if (!canBet(m, Date.now()) || placing) return;
    update(m, (s) => {
      if (isPana(m)) {
        const digits = [...s.digits, n];
        if (digits.length < 3) return { digits };
        const combo = [...digits].sort((a, b) => (Number(a) || 10) - (Number(b) || 10)).join('');
        return { digits: [], numbers: s.numbers.includes(combo) ? s.numbers : [...s.numbers, combo] };
      }
      return { numbers: s.numbers.includes(n) ? s.numbers.filter((x) => x !== n) : [...s.numbers, n] };
    });
  };
  const removeNumber = (m, n) => !placing && update(m, (s) => ({ numbers: s.numbers.filter((x) => x !== n) }));
  const clear = (m) => !placing && update(m, () => ({ numbers: [], digits: [] }));
  const addStake = (m, amount) => {
    if (!canBet(m, Date.now()) || placing || !Number.isFinite(amount) || amount <= 0) return;
    const next = Math.round(100 * (Math.max(0, Number(state(m).stake) || 0) + amount)) / 100;
    if (next > m.max) bToastError(`Stake per number cannot exceed ${m.max}.`);
    else update(m, () => ({ stake: next }));
  };

  const placeBets = (m) => {
    if (placing || !canBet(m, Date.now())) return;
    if (!isAuth) { navigate('/login'); return; }
    const s = state(m);
    const stake = Number(s.stake);
    if (!s.numbers.length || s.digits.length) { bToastError('Select a number and complete any pending Pana combination.'); return; }
    if (!Number.isFinite(stake) || stake < m.min || stake > m.max) { bToastError(`Stake per number must be between ${m.min} and ${m.max}.`); return; }
    // The reference places these on its own backend (lotteryPlaceBet); tenexch
    // has no lottery markets to take them.
    bToastError('Lottery betting is not available.');
  };

  const gameRules = () => {
    setRulesOpen(true);
    refPost('/api/exchange/rules/getSportsRule', { sportId, key: SITE_KEY }).then((res) => setRules(res?.data)).catch(() => {});
  };

  return (
    <app-lottery-details {...host('kltd')} {...KX}>
      {loading && <Loader attrs={C} />}
      <section {...C} aria-label="Lottery market details" className="lottery-details" style={{ '--accent': accent }}>
        <header {...C} className="event-header">
          <div {...C} className="event-title">
            <h1 {...C}>{event?.eventName || 'Lottery'}</h1>
            {markets.length > 0 && <span {...C} className={`status${eventOpen ? '' : ' closed'}`}>{eventOpen ? 'OPEN' : 'CLOSED'}</span>}
            <button {...C} type="button" aria-label="Market rules" className="rules-button" onClick={gameRules}>
              <i {...C} aria-hidden="true" className="fas fa-info-circle"></i>
            </button>
          </div>
          {isAuth && (
            <div {...C} className="account-summary">
              <span {...C}>
                {'Available balance '}
                <strong {...C}>{balance == null ? '—' : ngNumber(balance)}</strong>
              </span>
              <span {...C}>
                {'Exposure '}
                <strong {...C} className="exposure">{exposure == null ? '—' : ngNumber(exposure)}</strong>
              </span>
            </div>
          )}
        </header>
        {event?.news && <p {...C} className="market-news">{event.news}</p>}
        {visibleTabs.length > 0 && (
          <nav {...C} aria-label="Lottery market type" className="market-tabs">
            {visibleTabs.map((t) => (
              <button {...C} key={t.caption} type="button" className={active === t.caption ? 'active' : undefined} disabled={placing} aria-pressed={active === t.caption} onClick={() => setCaption(t.caption)}>
                {t.label}
              </button>
            ))}
          </nav>
        )}
        <div {...C} className="market-panels">
          {loadError && (
            <div {...C} role="alert" className="empty-state">
              {'Unable to load markets. '}
              <button {...C} type="button" onClick={() => load()}>Try again</button>
            </div>
          )}
          {!loading && !loadError && !activeMarkets.length && <p {...C} className="empty-state">No markets available in this category.</p>}
          {activeMarkets.map((m) => {
            const s = state(m);
            const bettable = canBet(m, now);
            return (
              <article {...C} key={m.marketId} className="market-panel">
                <div {...C} className="panel-heading">
                  <h2 {...C}>{m.marketName}</h2>
                  <span {...C} className={`market-status${bettable ? '' : ' closed'}`}>{m.status}</span>
                </div>
                <p {...C} className="market-limits">
                  {`Min ${ngNumber(m.min)} `}
                  <span {...C}>|</span>
                  {` Max ${ngNumber(m.max)}`}
                </p>
                {m.closesAt != null && (
                  <p {...C} className="market-limits">
                    {' Closing time '}
                    <strong {...C}>{ngDate(m.closesAt, 'dd MMM yyyy, h:mm a')}</strong>
                    <span {...C}>|</span>
                    {' Closes in '}
                    <strong {...C}>{remaining(m, now)}</strong>
                  </p>
                )}
                {m.caption === 'JODI_OPEN_CLOSE' && (
                  <div {...C} aria-label="Number range" className="range-tabs">
                    {RANGES.map((r) => (
                      <button {...C} key={r} type="button" className={s.range === r ? 'active' : undefined} aria-pressed={s.range === r} onClick={() => update(m, () => ({ range: r }))}>
                        {` ${r === 0 ? '00' : r}–${r + 19} `}
                      </button>
                    ))}
                  </div>
                )}
                <div {...C} className={`number-grid${isPana(m) ? ' pana-grid' : ''}`}>
                  {visibleNumbers(m).map((n) => (
                    <button
                      {...C}
                      key={n}
                      type="button"
                      className={`number-button${selected(m, n) ? ' selected' : ''}${m.result === n ? ' winner' : ''}`}
                      disabled={!bettable || placing}
                      aria-pressed={selected(m, n)}
                      onClick={() => toggleNumber(m, n)}
                    >
                      <span {...C}>{n}</span>
                      {selected(m, n) && <i {...C} aria-hidden="true" className="fas fa-check-circle selection-check"></i>}
                    </button>
                  ))}
                </div>
                {m.result != null && m.result !== '' && (
                  <div {...C} className="market-result">
                    <i {...C} aria-hidden="true" className="fas fa-trophy"></i>
                    {' Result: '}
                    <strong {...C}>{m.result}</strong>
                  </div>
                )}
                <div {...C} className="selection-area">
                  <div {...C} className="section-heading">
                    <strong {...C}>{`Selected Numbers (${s.numbers.length})`}</strong>
                    <button {...C} type="button" disabled={placing} onClick={() => clear(m)}>Clear all</button>
                  </div>
                  <div {...C} className="selected-numbers">
                    {s.numbers.map((n) => (
                      <button {...C} key={n} type="button" disabled={placing} aria-label={`Remove ${n}`} onClick={() => removeNumber(m, n)}>
                        {`${n} `}
                        <span {...C} aria-hidden="true">×</span>
                      </button>
                    ))}
                    {!s.numbers.length && (
                      <p {...C}>
                        {bettable
                          ? isPana(m) ? 'Tap three digits to add a Pana combination. Repeated digits are allowed.' : 'Tap on numbers to add'
                          : 'This market is closed for betting.'}
                      </p>
                    )}
                  </div>
                  {s.digits.length > 0 && (
                    <div {...C} className="pending-digits">
                      {'Pana digits: '}
                      <strong {...C}>{s.digits.join(' · ')}</strong>
                      {` (${s.digits.length}/3)`}
                    </div>
                  )}
                </div>
                {s.numbers.length > 0 && (
                  <div {...C} className="stake-area">
                    <label {...C} htmlFor={`stake-${m.marketId}`} className="stake-label">
                      {'Stake per number '}
                      <input
                        {...C}
                        type="number"
                        inputMode="decimal"
                        id={`stake-${m.marketId}`}
                        value={s.stake}
                        min={m.min}
                        max={m.max}
                        disabled={!bettable || placing}
                        onChange={(e) => update(m, () => ({ stake: e.target.value === '' ? '' : Number(e.target.value) }))}
                      />
                    </label>
                    <div {...C} className="stake-presets">
                      {betStakes.map((v) => (
                        <button {...C} key={v} type="button" className={s.stake === v ? 'active' : undefined} disabled={!bettable || placing || v > m.max} onClick={() => addStake(m, v)}>
                          {v}
                        </button>
                      ))}
                    </div>
                    <div {...C} className="stake-totals">
                      <span {...C}>
                        Total Selections
                        <strong {...C}>{s.numbers.length}</strong>
                      </span>
                      <span {...C}>
                        Total Stake
                        <strong {...C}>{ngNumber(total(m))}</strong>
                      </span>
                    </div>
                    <button {...C} type="button" className="place-bet" disabled={!bettable || placing || !s.numbers.length || !!s.digits.length} onClick={() => placeBets(m)}>
                      {` ${placing ? 'PLACING BETS…' : bettable ? 'PLACE BET' : 'MARKET CLOSED'} `}
                      {bettable && total(m) > 0 && <span {...C}>{` ${ngNumber(total(m))}`}</span>}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
      <KxModal open={rulesOpen} onClose={() => setRulesOpen(false)} id="lotteryRulesModal" labelledBy="lotteryRulesTitle" attrs={C}>
        <div {...C} className="modal-dialog">
          <div {...C} className="modal-content">
            <div {...C} className="modal-header">
              <h2 {...C} id="lotteryRulesTitle" className="modal-title fs-5">Lottery rules</h2>
              <button {...C} type="button" aria-label="Close" className="btn-close" onClick={() => setRulesOpen(false)}></button>
            </div>
            <div {...C} className="modal-body" dangerouslySetInnerHTML={{ __html: rules?.rules || 'Rules are not available.' }}></div>
          </div>
        </div>
      </KxModal>
    </app-lottery-details>
  );
}
