import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

// Book figure under a runner name. Session is a two-way market — the backend
// stores its worst case in the bare "Session" row (min of the two sides); the
// other markets are independent legacy rows keyed by their exact feed nat.
function BookSpan({ value }) {
  const v = Number(value) || 0;
  if (v === 0) return null;
  return (
    <span className="float-right" style={{ color: v < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)', fontSize: '10px', fontWeight: 'bold' }}>
      {v < 0 ? Math.round(v) : `+${Math.round(v)}`}
    </span>
  );
}

/** Back/Lay pair used by the 4-column card rows and the judgement columns */
function BackLayBox({ item, onBet }) {
  const susp = isSusp(item);
  return (
    <div className="casino-bl-box">
      <div
        className={`back casino-bl-box-item${suspCls(item)}`}
        onClick={susp ? undefined : () => onBet(item.sid, 'back', item.b, item)}
      >
        <span>{item?.b ?? 0}</span>
      </div>
      <div
        className={`lay casino-bl-box-item${suspCls(item)}`}
        onClick={susp ? undefined : () => onBet(item.sid, 'lay', item.l, item)}
      >
        <span>{item?.l ?? 0}</span>
      </div>
    </div>
  );
}

/** Single "back only" bet used in pasa-other-bet rows */
function BackOnlyBox({ item, onBet }) {
  const susp = isSusp(item);
  return (
    <div className="casino-bl-box">
      <div
        className={`back casino-bl-box-item${suspCls(item)}`}
        onClick={susp ? undefined : () => onBet(item.sid, 'back', item.b, item)}
      >
        <span>{item?.b ?? 0}</span>
      </div>
    </div>
  );
}

const BetTableTrio = memo(function BetTableTrio({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});
  const book = (nat) => (nat && exposures ? exposures[nat] : 0);

  const session  = sub.find((s) => s.subtype === 'trio');
  const j124     = sub.find((s) => s.subtype === '124');
  const jqk1     = sub.find((s) => s.subtype === 'jqk1');
  const red2     = sub.find((s) => s.subtype === 'red2');
  const black2   = sub.find((s) => s.subtype === 'black2');
  const odd2     = sub.find((s) => s.subtype === 'odd2');
  const even2    = sub.find((s) => s.subtype === 'even2');
  const pair2    = sub.find((s) => s.subtype === 'pair2');
  const flush    = sub.find((s) => s.subtype === 'flush');
  const straight = sub.find((s) => s.subtype === 'straight');
  const trio1    = sub.find((s) => s.subtype === 'trio1');
  const sf       = sub.find((s) => s.subtype === 'straightflush');

  const sessSupp = isSusp(session);
  // Session is a Fancy2 line market: b/l carry the run LINE (e.g. 21), bbhav/lbhav
  // the RATES as a profit % (back 80 → wins 80% of stake, lay 100 → even money).
  // The decimal price the backend books/settles with is rate/100 + 1, so back
  // 100 @ 80 → +80 / −100 and lay 100 @ 100 → +100 / −100. Tag _sessionRate so
  // useCasinoBet re-derives the price from the rate during the buffer instead of
  // reading the line as odds (the selection stays the bare "Session" — settlement
  // reads Yes/No off the result, and the two-way book keys on "Session").
  const sessBackOdds = session?.bbhav > 0 ? session.bbhav / 100 + 1 : 0;
  const sessLayOdds = session?.lbhav > 0 ? session.lbhav / 100 + 1 : 0;
  // _line = the run line (b/l, e.g. 21) shown in the bet slip; the bet is still
  // priced off the decimal odds above.
  const sessItem = session
    ? { ...session, _sessionRate: true, _line: session.b ?? session.l }
    : session;

  return (
    <div className="casino-detail">
      <div className="row row5">
        {/* ── Column 1: Session (col-12 / col-md-6) ── */}
        <div className="col-12 col-md-6">
          <div className="casino-box-row d-none-small" style={{ height: '30px' }}></div>

          <div className="casino-box-row pasa-sesssion">
            <div className="casino-nation-name">
              <b className="pointer">{session?.nat || 'Session'}</b>
              <BookSpan value={book('Session')} />
            </div>
            <div className="casino-bl-box">
              {/* LAY first */}
              <div
                className={`lay casino-bl-box-item${suspCls(session)}`}
                onClick={sessSupp || !sessLayOdds ? undefined : () => handleBet(session.sid, 'lay', sessLayOdds, sessItem)}
              >
                <span>{session?.l ?? 0}</span>
                <span className="casino-box-odd">{session?.lbhav ?? 0}</span>
              </div>
              {/* BACK second */}
              <div
                className={`back casino-bl-box-item${suspCls(session)}`}
                onClick={sessSupp || !sessBackOdds ? undefined : () => handleBet(session.sid, 'back', sessBackOdds, sessItem)}
              >
                <span>{session?.b ?? 0}</span>
                <span className="casino-box-odd">{session?.bbhav ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="casino-box-row d-none-small" style={{ height: '30px' }}></div>
        </div>

        {/* ── Column 2: 3 Card Judgement (1 2 4) ── */}
        <div className="col-6 col-md-3 pasa-fancy">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>{j124?.nat || '3 Card Judgement(1 2 4)'}</b>
              <BookSpan value={book(j124?.nat)} />
            </div>
            <BackLayBox item={j124} onBet={handleBet} />
          </div>
        </div>

        {/* ── Column 3: 3 Card Judgement (J Q K) ── */}
        <div className="col-6 col-md-3 pasa-fancy">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>{jqk1?.nat || '3 Card Judgement(J Q K)'}</b>
              <BookSpan value={book(jqk1?.nat)} />
            </div>
            <BackLayBox item={jqk1} onBet={handleBet} />
          </div>
        </div>
      </div>

      {/* ── Row 2: 4 colour/parity columns ── */}
      <div className="row row5 mt-2 pasa-cards">
        <div className="col-6 col-md-3">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>{red2?.nat || 'Two Red Only'}</b>
              <BookSpan value={book(red2?.nat)} />
            </div>
            <BackLayBox item={red2} onBet={handleBet} />
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>{black2?.nat || 'Two Black Only'}</b>
              <BookSpan value={book(black2?.nat)} />
            </div>
            <BackLayBox item={black2} onBet={handleBet} />
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>{odd2?.nat || 'Two Odd Only'}</b>
              <BookSpan value={book(odd2?.nat)} />
            </div>
            <BackLayBox item={odd2} onBet={handleBet} />
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>{even2?.nat || 'Two Even Only'}</b>
              <BookSpan value={book(even2?.nat)} />
            </div>
            <BackLayBox item={even2} onBet={handleBet} />
          </div>
        </div>
      </div>

      {/* ── Row 3: Other bets (back only, inline) ── */}
      <div className="casino-box-row pasa-other-bets">
        {[
          { item: pair2,    label: 'Pair' },
          { item: flush,    label: 'Flush' },
          { item: straight, label: 'Straight' },
          { item: trio1,    label: 'Trio' },
          { item: sf,       label: 'Straight Flush' },
        ].map(({ item, label }) => (
          <div key={label} className="casino-box-row pasa-other-bet">
            <div className="casino-nation-name">
              <b>{item?.nat || label}</b>
              <BookSpan value={book(item?.nat)} />
            </div>
            <BackOnlyBox item={item} onBet={handleBet} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default BetTableTrio;
