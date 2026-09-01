import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useRacingData from '../../hooks/useRacingData';
import { formatFeedIstTime } from '../../utils/racingUtils';
import { isMarketSuspended } from '../../utils/oddsHelpers';
import { cbToastError } from '../toast';
import { ODDS_COLUMNS } from '../event/odds';
import RacingRunnerRow from '../event/RacingRunnerRow';
import BetSlip from '../event/BetSlip';

// Cloth numbers, silks and the form panel belong to horse racing. A greyhound
// card is the name and the prices, which is the same split the reference makes.
const HORSE_SID = 10;

/**
 * One race.
 *
 * Same frame as any other event — title strip, market card, matched-bet rail —
 * with the racing runner rows inside it. The board it is reached from lives on
 * /race/:sportId; this is a single race off that board or the sidebar tree.
 */
function RaceDetails() {
  const { sid, gmid } = useParams();
  const sportId = Number(sid);
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { markets, race, loading, error, noMarkets } = useRacingData(gmid, sportId);
  const [slipBet, setSlipBet] = useState(null);

  const title = [race?.cname, race?.venue].filter(Boolean).join(' > ');

  const onOddsClick = useCallback(
    (market, runner, side, price) => {
      if (!isAuth) {
        cbToastError('Please login to access!');
        return;
      }
      if (!market?.mid) return;
      setSlipBet({
        team: runner.nat,
        betType: side,
        odds: price.odds,
        size: price.size,
        market_id: market.mid,
        selectionId: runner.sid,
        marketType: 'MATCH_ODDS',
        mname: market.mname,
        gtype: market.gtype,
        market,
        section: runner,
        runners: (market.section || []).map((r) => r.nat).filter(Boolean),
        event_id: gmid,
        event_name: title,
        match_title: title,
        match_start_time: race?.stime || '',
        sid: sportId,
        sports: sportId === HORSE_SID ? 'Horse Racing' : 'Greyhound Racing',
        game_type: 'MATCH',
        team_one: '',
        team_two: '',
      });
    },
    [isAuth, gmid, sportId, title, race]
  );

  const body = () => {
    if (loading && !markets.length) return <span>Loading events...</span>;
    if (error || noMarkets || !markets.length) {
      return (
        <div className="border-radius-0 m-0 sportscardRow">
          <div className="noevent">No Active Events Found </div>
        </div>
      );
    }
    return markets.map((market, mi) => {
      const runners = market.section || [];
      const suspended = isMarketSuspended(market);
      const selected =
        slipBet && String(slipBet.market_id) === String(market.mid) ? slipBet : null;
      return (
        <div key={market.mid ?? mi}>
          {runners.map((runner, i) => (
            <div key={runner.sid ?? runner.sno ?? i}>
              <RacingRunnerRow
                market={market}
                runner={runner}
                detailed={sportId === HORSE_SID}
                marketSuspended={suspended}
                onOddsClick={onOddsClick}
              />
              {i < runners.length - 1 && <div className="border-bottom-1"></div>}
            </div>
          ))}
          {selected && <BetSlip bet={selected} onClose={() => setSlipBet(null)} />}
        </div>
      );
    });
  };

  const market = markets[0];
  const min = Number(market?.min || 0).toFixed(2);
  const max = Number(market?.maxb > 0 ? market.maxb : market?.max || 0).toFixed(2);

  return (
    <div className="eventdetails-box">
      <div className=" eventtitle-box mb-0 maintitlebgimage">
        <div className="etitle">{title}</div>
        <div className="event-info-strip-meta">{formatFeedIstTime(race?.stime)}</div>
      </div>

      <div className="eventdetail-main">
        <div className="eventdetails-leftside">
          <div className="eventtitle-box margintop-2">
            <div>{market?.mname || 'Winner'}</div>
          </div>
          <div className="sportscardRow m-0 border-radius-0 p-1 pb-0">
            <div className="oddsList mainsports bottomborder-1 height20">
              <div className="runnerName eventdetails-54132 title-minmax title-pt5">
                Min <span>{min}</span>{' '}
                <span className="mx-1">|</span>{' '}
                <span>
                  Max: <span>{max}</span>
                </span>
              </div>
              <ul className="oddsRow runnerOdds eventdetails-45 backlay-header height27 marginbt6">
                {ODDS_COLUMNS.map((c) => {
                  const centre = c.cls === 'back' || c.cls === 'lay';
                  return (
                    <li
                      key={c.headerCls}
                      className={`${c.headerCls} height27${c.mobileHidden ? ' mhide' : ''} cursor-pointer clickable-odd${centre ? ' border-radius-top' : ''}`}
                    >
                      {c.cls === 'back' ? 'Back' : c.cls === 'lay' ? 'Lay' : '-'}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="marketOdd">{body()}</div>
          </div>
        </div>

        <div className="eventdetails-rightside">
          <div className="eventtitle-box">
            <div className="matched-bet-header">Matched Bet</div>
          </div>
          <div className="matched-bet-slips">
            <div className="text-center text-muted py-3">No open bets</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaceDetails;
