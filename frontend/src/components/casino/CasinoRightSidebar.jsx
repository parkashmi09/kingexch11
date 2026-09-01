import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DEFAULT_BUTTONS = [25, 50, 100, 200, 500, 1000];

function formatRange(val) {
  if (!val || val <= 0) return '0';
  if (val >= 100000) return `${val / 100000}L`;
  if (val >= 1000) return `${val / 1000}K`;
  return String(val);
}

const CasinoRightSidebar = memo(function CasinoRightSidebar({
  lastResults,
  myBets = [],
  reportLink = '/report/casinoresult/worli3',
  renderResult,
  // Place-bet panel props
  showPlaceBet = false,
  betName = '',
  betValue = '',
  // What the Odds box shows. Defaults to betValue; session-rate line markets
  // pass the run line here while betValue stays the priced decimal (so Profit
  // below is still computed correctly).
  betDisplayOdds,
  // Extra gate on the Submit button (e.g. 3 Card Judgement: until 3 cards picked).
  submitDisabled = false,
  betType = 'back',
  stakeAmount = '',
  setStakeAmount,
  placing = false,
  onSubmit,
  onClose,
  stakeButtons: stakeButtonsProp,
  jokerCardSrc = null,
  rulesTableContent = null,
  beforeLastResults = null,
  minBet = 0,
  maxBet = 0,
}) {
  // One source for the stake buttons: /user/stake-button-values is fetched once
  // into redux (App dispatches it on login) and read here. `game_buttons` — the
  // same set the sports slip uses — drives the casino panels too, so a stake
  // ladder configured on the account applies everywhere. (The payload also
  // carries `casino_buttons`; it is deliberately not used.)
  const gameButtons = useSelector((s) => s.stakeButtons.gameButtons);
  const buttons = stakeButtonsProp
    || (gameButtons.length ? gameButtons.map((b) => b.value) : DEFAULT_BUTTONS);


  const defaultRenderResult = (r, i) => (
    <span key={i} className="resultb">{r}</span>
  );
  const resultRenderer = renderResult || defaultRenderResult;

  const handleAdd = useCallback((val) => {
    if (!setStakeAmount) return;
    setStakeAmount((prev) => String((parseInt(prev, 10) || 0) + val));
  }, [setStakeAmount]);

  const handleClear = useCallback(() => {
    if (setStakeAmount) setStakeAmount('');
  }, [setStakeAmount]);

  const handleReset = useCallback(() => {
    if (setStakeAmount) setStakeAmount('');
    if (onClose) onClose();
  }, [setStakeAmount, onClose]);

  const isDisabled = placing || !stakeAmount || Number(stakeAmount) <= 0 || submitDisabled;
  const stake = Number.parseFloat(stakeAmount) || 0;
  const odds = Number.parseFloat(betValue) || 0;
  // The bet slip shows the amount the user can win if this bet's favourable
  // outcome occurs. For a lay, that is the backer's stake; its larger selected
  // runner liability is shown separately in the runner exposure book.
  const potentialProfit = stake > 0 && odds > 0
    ? (betType === 'lay' ? stake : stake * (odds - 1))
    : 0;

  return (
    <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar teen2sidebar sticky">

      {beforeLastResults}

      {/* ── Last Results ── */}
      <div className="casino-place-bet">
        <div className="casino-place-bet-title"><span>Last Results</span></div>
        <div className="casino-video-last-results">
          {(lastResults || []).map(resultRenderer)}
          <Link to={reportLink} className="result-more">...</Link>
        </div>
      </div>

      {/* ── Place Bet panel (shown when a bet is selected) ── */}
      <span>
        {showPlaceBet && betName && (
          <div className="casino-place-bet" style={{ position: 'relative' }}>
            {/* Reference: while the bet is submitting, a loader-section
                overlay (gif) shows over the bet slip */}
            {placing && (
              <div className="loader-section">
                <div>
                  <img src="/assets/animate/loader-ten.gif" alt="loader" />
                </div>
              </div>
            )}
            <div className="casino-place-bet-title">
              <span>Place Bet</span>
              {(minBet > 0 || maxBet > 0) && (
                <span className="float-right casino-min-max">
                  Range:<span>{formatRange(minBet)}</span>-<span>{formatRange(maxBet)}</span>
                </span>
              )}
            </div>

            <div className="casino-place-bet-header">
              <div>(Bet For)</div>
              <div>Odds</div>
              <div>Stake</div>
              <div>Profit</div>
            </div>

            <div className={`casino-place-bet-box ${betName.startsWith('Andar') ? 'andar-bg' : betName.startsWith('Bahar') ? 'bahar-bg' : (betType === 'lay' ? 'lay' : 'back')}`}>
              <div className="casino-place-bet-info">
                <div className="bet-player"><span>{betName}</span></div>
                <div className="odds-box">
                  <input type="text" disabled className="form-control" value={betDisplayOdds ?? betValue} readOnly />
                  {/* Both arrows are the SAME svg — style.css flips the top one
                      with `transform: scaleY(-1)` and pins each to a corner.
                      Decorative only: casino odds are fixed, so unlike the
                      sports slip there is nothing to step up or down. */}
                  <img src="/assets/arrow-down.svg" className="arrow-up" alt="" />
                  <img src="/assets/arrow-down.svg" className="arrow-down" alt="" />
                </div>
                <div className={`bet-input ${betName.startsWith('Andar') ? 'andar-border' : betName.startsWith('Bahar') ? 'bahar-border' : (betType === 'lay' ? 'lay-border' : 'back-border')}`}>
                  <input
                    type="text"
                    id="placebetAmountWeb"
                    className="form-control input-stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount && setStakeAmount(e.target.value)}
                    disabled={placing}
                  />
                </div>
                <div>{potentialProfit.toFixed(2)}</div>
              </div>

              <div className="casino-place-bet-button-container">
                {buttons.map((val) => (
                  <button key={val} className="btn btn-bet" onClick={() => handleAdd(val)} disabled={placing}>
                    <span>+{val}</span>
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-link text-dark flex-fill text-right w-auto mw-auto"
                  onClick={handleClear}
                  disabled={placing}
                >
                  Clear
                </button>
              </div>

              <div className="casino-place-bet-action-buttons">
                <button className="btn btn-reset" onClick={handleReset} disabled={placing}>
                  Reset
                </button>
                {jokerCardSrc && (
                  <span><img src={jokerCardSrc} alt="joker" /></span>
                )}
                <button className="btn btn-primary" disabled={isDisabled} onClick={onSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </span>

      {/* ── My Bet ── */}
      <div className="my-market-container">
        <div data-toggle="collapse" data-target="#market-data-1" className="my-market-title">
          <span>My Bet</span>
        </div>
        {myBets.length > 0 && (
          <div id="market-data-1" className="bet-slip-box collapse show">
            <table className="coupon-table table table-borderedless">
              <thead>
                <tr className="theme1font">
                  <th style={{ width: '40%' }}>Nation</th>
                  <th className="text-right">Odds</th>
                  <th className="text-right p-r-15">Stake</th>
                </tr>
              </thead>
              <tbody>
                {myBets.map((bet, i) => (
                  <tr key={bet._id || i} className={bet.type || 'back'}>
                    <td><span>{bet.player_name || bet.selection || ''}</span></td>
                    <td className="text-right">{bet.odds ?? ''}</td>
                    <td className="text-right p-r-15">{bet.amount ?? bet.stake ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rulesTableContent}

    </div>
  );
});

export default CasinoRightSidebar;
