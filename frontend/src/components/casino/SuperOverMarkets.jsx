import { memo } from 'react';

/**
 * Formats a numeric amount for display.
 * >= 100000 → "{n/100000}L"
 * >= 1000   → "{n/1000}K"
 * else      → String(n)
 */
function formatAmount(n) {
  if (!n && n !== 0) return '';
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

/**
 * Returns whether an odds value should be treated as suspended (0, null, undefined).
 */
function isOddsEmpty(v) {
  return !v || Number(v) === 0;
}

// ── Bookmaker Market (dtype=2) ────────────────────────────────────────────────

// Per user request the per-team book is NOT computed in the frontend anymore.
// The old bookmakerBook + calcTeamPL "live preview" jumped the Bookmaker numbers
// whenever ANY bet was being placed — even a Fancy/Tie in another market, because
// the preview was applied to every team regardless of what was clicked — and it
// was a frontend calculation. All three markets now display the BACKEND
// worst-exposure (exposures[nat]), which only moves once a bet is actually
// placed; the backend keeps its legacy single-row liability lock.
const BookmakerMarket = memo(function BookmakerMarket({ market, onBet, exposures }) {
  if (!market) return null;
  const sections = market.section || [];
  const min = market.min || 0;
  const max = market.max || 0;

  return (
    <div className="market-2">
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span title="Bookmaker">
              <a>
                <img src="/assets/arrow-down.svg" className="mr-1" alt="" />
              </a>
              Bookmaker
            </span>
            <span className="max-bet d-none-desktop">
              Min:<span>{formatAmount(min)}</span> Max:<span>{formatAmount(max)}</span>
            </span>
          </div>
        </div>
        <div className="bet-table-body collapse show">
          {/* Desktop min/max + column headers */}
          <div className="bet-table-row d-none-mobile">
            <div className="nation-name">
              <span className="max-bet">
                Min:<span>{formatAmount(min)}</span> Max:<span>{formatAmount(max)}</span>
              </span>
            </div>
            <div className="back bl-title back-title">Back</div>
            <div className="lay bl-title lay-title">Lay</div>
          </div>

          {sections.map((sec) => {
            const backOdd = sec.odds?.find((o) => o.otype === 'back');
            const layOdd = sec.odds?.find((o) => o.otype === 'lay');
            const backVal = backOdd?.odds;
            const layVal = layOdd?.odds;
            const backSize = backOdd?.size;
            const laySize = layOdd?.size;
            const suspended = sec.gstatus === 'SUSPENDED' || sec.gstatus === 'Ball Running';
            const backEmpty = isOddsEmpty(backVal);
            const layEmpty = isOddsEmpty(layVal);
            const rowClass = suspended ? 'bet-table-row suspendedtext' : 'bet-table-row';

            return (
              <div key={sec.sid}>
                {/* Mobile team name row */}
                <div className="bet-table-mobile-row d-none-desktop">
                  <div className="bet-table-mobile-team-name">
                    <span>{sec.nat}</span>
                    {(() => { const exp = exposures?.[sec.nat] || 0; return exp !== 0 ? <span className={exp >= 0 ? 'book-green' : 'book-red'}>{Math.round(exp)}</span> : null; })()}
                  </div>
                </div>
                <div data-title={sec.gstatus || 'ACTIVE'} className={rowClass}>
                  <div className="nation-name d-none-mobile">
                    <p>{sec.nat}</p>
                    {/* Worst exposure UNDER the team name, from the backend (no frontend calc). */}
                    {(() => { const exp = exposures?.[sec.nat] || 0; return exp !== 0 ? <p className={`mb-0 ${exp >= 0 ? 'book-green' : 'book-red'}`}>{Math.round(exp)}</p> : <p className="mb-0"></p>; })()}
                  </div>
                  <div
                    className={`bl-box back back${backEmpty || suspended ? ' no-val' : ''}`}
                    onClick={() => !backEmpty && !suspended && onBet && onBet(sec.sid, 'back', backVal, { ...sec, _marketName: 'Bookmaker' })}
                  >
                    <span className="d-block odds">{backEmpty || suspended ? '\u2014' : backVal}</span>
                    {!backEmpty && !suspended && (
                      <span className="d-block">{formatAmount(backSize)}</span>
                    )}
                  </div>
                  <div
                    className={`bl-box lay lay${layEmpty || suspended ? ' no-val' : ''}`}
                    onClick={() => !layEmpty && !suspended && onBet && onBet(sec.sid, 'lay', layVal, { ...sec, _marketName: 'Bookmaker' })}
                  >
                    <span className="d-block odds">{layEmpty || suspended ? '\u2014' : layVal}</span>
                    {!layEmpty && !suspended && (
                      <span className="d-block">{formatAmount(laySize)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// ── Tie Market (single item extracted from Fancy1) ────────────────────────────

const TieMarket = memo(function TieMarket({ item, onBet, exposures }) {
  if (!item) return null;
  const suspended = item.gstatus === 'SUSPENDED' || item.gstatus === 'Ball Running';
  // Odds live in odds[] ({odds, otype}), not item.back/item.lay (undefined).
  const backOdd = item.odds?.find((o) => o.otype === 'back');
  const layOdd = item.odds?.find((o) => o.otype === 'lay');
  const backVal = backOdd?.odds;
  const layVal = layOdd?.odds;
  const backEmpty = isOddsEmpty(backVal);
  const layEmpty = isOddsEmpty(layVal);

  return (
    <div className="market-6">
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span title="Tie">
              <a>
                <img src="/assets/arrow-down.svg" className="mr-1" alt="" />
              </a>
              Tie
            </span>
          </div>
        </div>
        <div className="bet-table-body collapse show">
          <div className="bet-table-row d-none-mobile">
            <div className="nation-name"></div>
            <div className="back bl-title back-title">Back</div>
            <div className="lay bl-title lay-title">Lay</div>
          </div>
          <div className="fancy-tripple">
            <div className="bet-table-mobile-row d-none-desktop">
              <div className="bet-table-mobile-team-name">
                <span>Tie</span>
                {(() => { const exp = exposures?.[item.nat] || 0; return exp !== 0 ? <span className={exp >= 0 ? 'book-green' : 'book-red'}>{Math.round(exp)}</span> : null; })()}
              </div>
            </div>
            <div data-title={item.gstatus || 'SUSPENDED'} className={`bet-table-row${suspended ? ' suspendedtext' : ''}`}>
              <div className="nation-name d-none-mobile">
                <p>Tie</p>
                {/* Worst exposure UNDER the runner name, only when a Tie bet exists. */}
                {(() => { const exp = exposures?.[item.nat] || 0; return exp !== 0 ? <p className={`mb-0 ${exp >= 0 ? 'book-green' : 'book-red'}`}>{Math.round(exp)}</p> : null; })()}
              </div>
              <div
                className={`bl-box back${backEmpty || suspended ? ' no-val' : ''}`}
                onClick={() => !backEmpty && !suspended && onBet && onBet(item.sid, 'back', backVal, item)}
              >
                <span className="d-block odds">{backEmpty || suspended ? '\u2014' : backVal}</span>
                {!backEmpty && !suspended && (
                  <span className="d-block">{formatAmount(backOdd?.size ?? item.min)}</span>
                )}
              </div>
              <div
                className={`bl-box lay${layEmpty || suspended ? ' no-val' : ''}`}
                onClick={() => !layEmpty && !suspended && onBet && onBet(item.sid, 'lay', layVal, item)}
              >
                <span className="d-block odds">{layEmpty || suspended ? '\u2014' : layVal}</span>
                {!layEmpty && !suspended && (
                  <span className="d-block">{formatAmount(layOdd?.size ?? item.min)}</span>
                )}
              </div>
              <div className="fancy-min-max">
                Min:<span>{formatAmount(item.min)}</span> Max:<span>{formatAmount(item.max)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Fancy1 Market (items excluding Tie) ──────────────────────────────────────

const Fancy1Market = memo(function Fancy1Market({ items, onBet, exposures }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="market-6">
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span title="Fancy1">
              <a>
                <img src="/assets/arrow-down.svg" className="mr-1" alt="" />
              </a>
              Fancy1
            </span>
          </div>
        </div>
        <div className="bet-table-body collapse show">
          <div className="bet-table-row d-none-mobile">
            <div className="nation-name"></div>
            <div className="back bl-title back-title">Back</div>
            <div className="lay bl-title lay-title">Lay</div>
          </div>
          {items.map((item) => {
            // Odds live in the `odds[]` array ({odds, otype, size}) \u2014 same shape
            // as Bookmaker/Fancy \u2014 NOT item.back/item.lay (which are undefined,
            // so the price never rendered and the click sent `undefined` odds).
            const backOdd = item.odds?.find((o) => o.otype === 'back');
            const layOdd = item.odds?.find((o) => o.otype === 'lay');
            const backVal = backOdd?.odds;
            const layVal = layOdd?.odds;
            const suspended = item.gstatus === 'SUSPENDED' || item.gstatus === 'Ball Running';
            const backEmpty = isOddsEmpty(backVal);
            const layEmpty = isOddsEmpty(layVal);
            // Fancy1 outcomes settle independently (back win = stake*(odds-1),
            // loss = -stake), so the backend stores one worst-case row per
            // selection \u2014 show it under the backed runner, nothing under others.
            const exp = exposures?.[item.nat] || 0;

            return (
              <div key={item.sid} className="fancy-tripple">
                <div className="bet-table-mobile-row d-none-desktop">
                  <div className="bet-table-mobile-team-name">
                    <span>{item.nat}</span>
                    {exp !== 0 ? <span className={exp >= 0 ? 'book-green' : 'book-red'}>{Math.round(exp)}</span> : null}
                  </div>
                </div>
                <div data-title={item.gstatus || 'SUSPENDED'} className={`bet-table-row${suspended ? ' suspendedtext' : ''}`}>
                  <div className="nation-name d-none-mobile">
                    <p>
                      <span>{item.nat}</span>
                      {exp !== 0 ? <span className={`float-right ${exp >= 0 ? 'book-green' : 'book-red'}`}>{Math.round(exp)}</span> : null}
                    </p>
                  </div>
                  <div
                    className={`bl-box back${backEmpty || suspended ? ' no-val' : ''}`}
                    onClick={() => !backEmpty && !suspended && onBet && onBet(item.sid, 'back', backVal, item)}
                  >
                    <span className="d-block odds">{backEmpty || suspended ? '\u2014' : backVal}</span>
                    {!backEmpty && !suspended && (
                      <span className="d-block">{formatAmount(backOdd?.size ?? item.min)}</span>
                    )}
                  </div>
                  <div
                    className={`bl-box lay${layEmpty || suspended ? ' no-val' : ''}`}
                    onClick={() => !layEmpty && !suspended && onBet && onBet(item.sid, 'lay', layVal, item)}
                  >
                    <span className="d-block odds">{layEmpty || suspended ? '\u2014' : layVal}</span>
                    {!layEmpty && !suspended && (
                      <span className="d-block">{formatAmount(layOdd?.size ?? item.min)}</span>
                    )}
                  </div>
                  <div className="fancy-min-max">
                    Min:<span>{formatAmount(item.min)}</span> Max:<span>{formatAmount(item.max)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// ── Fancy Market (dtype=6, No/Yes headers) ──────────────────────────────────

const FancyMarket = memo(function FancyMarket({ market, onBet, exposures }) {
  if (!market) return null;
  const sections = market.section || [];
  if (sections.length === 0) return null;

  return (
    <div className="market-6">
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span title="Fancy">
              <a>
                <img src="/assets/arrow-down.svg" className="mr-1" alt="" />
              </a>
              Fancy
            </span>
          </div>
        </div>
        <div className="bet-table-body collapse show">
          <div className="bet-table-row d-none-mobile">
            <div className="nation-name"></div>
            <div className="lay bl-title lay-title">No</div>
            <div className="back bl-title back-title">Yes</div>
          </div>
          {sections.map((sec) => {
            const backOdd = sec.odds?.find((o) => o.otype === 'back');
            const layOdd = sec.odds?.find((o) => o.otype === 'lay');
            // Session line market: `odds` is the RUN LINE (e.g. 12 \u2014 not a
            // price), `size` is the RATE in bps (e.g. 94/106). The decimal
            // price is rate/100 + 1; the line is display + selection context
            // only, so the raw line must never be sent as odds (a 100 lay at
            // "line 12" locked 1100 instead of the ~106 the rate quotes).
            const backVal = backOdd?.odds;
            const layVal = layOdd?.odds;
            const backRate = Number(backOdd?.size) || 0;
            const layRate = Number(layOdd?.size) || 0;
            const backPrice = backRate > 0 ? backRate / 100 + 1 : 0;
            const layPrice = layRate > 0 ? layRate / 100 + 1 : 0;
            const suspended = sec.gstatus === 'SUSPENDED' || sec.gstatus === 'Ball Running';
            const backEmpty = isOddsEmpty(backVal) || !backPrice;
            const layEmpty = isOddsEmpty(layVal) || !layPrice;
            const sessionItem = (line) => ({ ...sec, _sessionRate: true, _line: line });

            return (
              <div key={sec.sid} className="fancy-tripple">
                <div className="bet-table-mobile-row d-none-desktop">
                  <div className="bet-table-mobile-team-name">
                    <span>{sec.nat}</span>
                    {(() => { const exp = exposures?.[sec.nat] || 0; return exp !== 0 ? <span className={exp >= 0 ? 'book-green' : 'book-red'}>{Math.round(exp)}</span> : null; })()}
                  </div>
                </div>
                <div data-title={sec.gstatus || 'SUSPENDED'} className={`bet-table-row${suspended ? ' suspendedtext' : ''}`}>
                  <div className="nation-name d-none-mobile">
                    <p>{sec.nat}</p>
                    {/* Worst exposure UNDER the runner name (desktop; mobile row already shows it). */}
                    {(() => { const exp = exposures?.[sec.nat] || 0; return exp !== 0 ? <p className={`mb-0 ${exp >= 0 ? 'book-green' : 'book-red'}`}>{Math.round(exp)}</p> : null; })()}
                  </div>
                  <div
                    className={`bl-box lay${layEmpty || suspended ? ' no-val' : ''}`}
                    onClick={() => !layEmpty && !suspended && onBet && onBet(sec.sid, 'lay', layPrice, sessionItem(layVal))}
                  >
                    <span className="d-block odds">{layEmpty || suspended ? '\u2014' : layVal}</span>
                    {!layEmpty && !suspended && (
                      <span className="d-block">{formatAmount(layOdd?.size)}</span>
                    )}
                  </div>
                  <div
                    className={`bl-box back${backEmpty || suspended ? ' no-val' : ''}`}
                    onClick={() => !backEmpty && !suspended && onBet && onBet(sec.sid, 'back', backPrice, sessionItem(backVal))}
                  >
                    <span className="d-block odds">{backEmpty || suspended ? '\u2014' : backVal}</span>
                    {!backEmpty && !suspended && (
                      <span className="d-block">{formatAmount(backOdd?.size)}</span>
                    )}
                  </div>
                  <div className="fancy-min-max">
                    Min:<span>{formatAmount(sec.min)}</span> Max:<span>{formatAmount(sec.max)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// ── Main markets orchestrator ─────────────────────────────────────────────────

const SuperOverMarkets = memo(function SuperOverMarkets({ markets, onBet, exposures }) {
  const bookmakerMarket = markets.find((m) => m.dtype === 2 || m.gtype === 'match1');
  const fancyMarket = markets.find((m) => m.dtype === 6 || m.gtype === 'fancy');
  const fancy1Market = markets.find((m) => m.dtype === 7 || m.gtype === 'fancy1');

  // Extract Tie item from Fancy1 sections
  const fancy1Sections = fancy1Market?.section || [];
  const tieItem = fancy1Sections.find((s) => s.nat === 'Tie');
  const fancy1Items = fancy1Sections.filter((s) => s.nat !== 'Tie');

  return (
    <>
      <BookmakerMarket market={bookmakerMarket} onBet={onBet} exposures={exposures} />
      <FancyMarket market={fancyMarket} onBet={onBet} exposures={exposures} />
      <TieMarket item={tieItem} onBet={onBet} exposures={exposures} />
      <Fancy1Market items={fancy1Items} onBet={onBet} exposures={exposures} />
    </>
  );
});

export default SuperOverMarkets;
