import { classifyMarket } from '../../utils/oddsHelpers';
import Market4Block from './Market4Block';
import Market2Block from './Market2Block';
import Market1Block from './Market1Block';
import FancyBlock from './FancyBlock';
import LineMarketBlock from './LineMarketBlock';
import OddEvenBlock from './OddEvenBlock';
import CricketCasinoBlock from './CricketCasinoBlock';
import Market13Block from './Market13Block';

function has6Columns(market) {
  const sections = market.section || [];
  return sections.some(s => {
    const odds = s.odds || [];
    const backs = odds.filter(o => (o.otype || '').toUpperCase() === 'BACK');
    const lays = odds.filter(o => (o.otype || '').toUpperCase() === 'LAY');
    return backs.length >= 3 && lays.length >= 3;
  });
}

// Back-only markets (HT/FT, Correct Score, …) → rendered as the market-1
// back-only grid. Detection is by PRICE, not by entry presence: the feed ships
// these with a placeholder lay1 tier that always quotes odds:0 (Correct Score
// on sid 8 does exactly this), so "every entry is otype back" was never true and
// the market fell through to the 2-column layout. The real signal is: at least
// one runner has a live BACK price and NO runner has a live LAY price.
function isBackOnly(market) {
  const sections = market.section || [];
  if (sections.length === 0) return false;
  let anyBack = false;
  let anyLay = false;
  for (const s of sections) {
    for (const o of (s.odds || [])) {
      if (!(Number(o.odds) > 0)) continue;
      if ((o.otype || '').toLowerCase() === 'lay') anyLay = true;
      else if ((o.otype || '').toLowerCase() === 'back') anyBack = true;
    }
  }
  return anyBack && !anyLay;
}

export default function MarketBlock({ market, markets, marketIndex = 0, onBetClick, onBetChange, activeBet, runnerPL, matchExposures, marketsRef, matchId, eventName }) {
  const type = classifyMarket(market);
  const props = { market, marketIndex, onBetClick, onBetChange, activeBet, runnerPL, matchExposures, marketsRef, matchId, eventName };

  // Greyhound racing MATCH_ODDS — the feed stamps it dtype 13 and the reference
  // renders it as its own `market-13` block (trap image per runner, no market
  // name, depth columns hidden on mobile). Checked before classifyMarket's
  // MATCH_ODDS branch, which would otherwise send it to the market-4 grid.
  if (market.dtype === 13) return <Market13Block {...props} />;
  if (type === 'LINE_MARKET') return <LineMarketBlock {...props} markets={markets} />;
  if (type === 'ODD_EVEN') return <OddEvenBlock {...props} />;
  if (type === 'CRICKET_CASINO') return <CricketCasinoBlock {...props} />;
  if (type === 'FANCY') return <FancyBlock {...props} />;
  if ((type === 'MATCH_ODDS' || type === 'BOOKMAKER') && has6Columns(market)) return <Market4Block {...props} />;
  // `dtype` is the feed's own market-class number and lines up with the
  // reference wrapper: 1 = back-only grid, 2 = back+lay pair, 4 = 3-deep grid.
  // Trust it over the shape sniff here: football markets like "2nd Period
  // Winner" / "Next Goal" / "Match Time Result 50:00" quote a back price with
  // EVERY lay tier dead (odds 0), which looks back-only — but they are dtype 2
  // and the reference keeps them as market-2 with a "—" lay column. Only
  // dtype 1 (and feeds that omit dtype, e.g. sid-8 Correct Score with its
  // odds-0 lay1 placeholder) fall through to the market-1 grid.
  if (type === 'MATCH_ODDS' && isBackOnly(market) && Number(market.dtype) !== 2) return <Market1Block {...props} />;
  return <Market2Block {...props} />;
}
