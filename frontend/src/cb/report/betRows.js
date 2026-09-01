import { calculateSingleBetPLValue } from '../../utils/betHelpers';
import { fmtDate } from './parts';

/**
 * One tenexch bet row read the way the reference's bet tables read theirs.
 *
 * The two feeds name the same things differently — and tenexch's rows carry no
 * potential profit or loss at all — so this is where the translation lives,
 * once, for both Bet History and Unsettled Bet.
 */

const SPORT_NAMES = {
  1: 'Soccer',
  2: 'Tennis',
  4: 'Cricket',
  10: 'Horse Racing',
  65: 'Greyhound Racing',
};

/** Back or Lay, out of whichever of the several spellings the row uses. */
export const sideOf = (item) => {
  const value = String(item.bet_type ?? item.type ?? item.side ?? '').toLowerCase();
  if (value === 'back' || value === 'yes' || value === '0') return 'Back';
  if (value === 'lay' || value === 'no' || value === '1') return 'Lay';
  return '-';
};

export const rowClass = (item) => {
  const side = sideOf(item);
  return side === 'Back' ? 'backtable' : side === 'Lay' ? 'laytable' : '';
};

export const competitionOf = (item) =>
  item.sport_name || SPORT_NAMES[item.sport_id] || '-';

export const eventOf = (item) => item.match_title || item.event_name || '-';

export const marketOf = (item) =>
  item.market_type || item.market_name || item.market || '-';

export const runnerOf = (item) =>
  item.selection_name || item.selection || item.player_name || '-';

export const dateOf = (item) => fmtDate(item.created_at || item.placed_at);

/** Rate, trimmed to two decimals the way the reference trims it. */
export const rateOf = (item) => {
  let rate = item.odds ?? item.user_rate;
  if (rate == null) return '-';
  if (rate.toString().includes('.')) rate = Number(rate).toFixed(2);
  return rate || '-';
};

export const stakeOf = (item) => item.stake_amount ?? item.stake ?? 0;

/** The run/line a FANCY bet was struck on; blank for every other market. */
export const lineOf = (item) => {
  const market = String(marketOf(item)).toUpperCase();
  if (!market.includes('FANCY') && !market.includes('LINE')) return '-';
  return item.line ?? item.run ?? item.selection_name ?? '-';
};

/**
 * Potential profit and loss.
 *
 * tenexch does not store these on a bet, so they are derived from stake, odds,
 * side and market type using the same helper the bet slip prints its own
 * Profit figure with — which means a bookmaker or fancy bet is read as a
 * percentage quote rather than decimal odds, as it should be.
 */
export const potentialOf = (item) => {
  const side = sideOf(item);
  const { profit, loss } = calculateSingleBetPLValue({
    stake: stakeOf(item),
    odds: item.odds ?? item.user_rate,
    betType: side === 'Lay' ? 'lay' : 'back',
    marketType: marketOf(item),
  });
  return { profit, loss };
};

/** WON / LOST / VOID / PENDING, however the row spells it. */
export const statusOf = (item) =>
  String(item.result_status || item.status || '-').toUpperCase();

/** The signed figure a settled row shows under Profit/Loss. */
export const settledPL = (item) => {
  const status = statusOf(item);
  const { profit, loss } = potentialOf(item);
  if (status === 'WON') return profit;
  if (status === 'LOST') return -loss;
  return 0;
};

/** The CSV shape both pages export, minus the columns that differ. */
export const csvRow = (item) => ({
  'Date & Time': dateOf(item),
  Competition: competitionOf(item),
  Event: eventOf(item),
  Market: marketOf(item),
  Runner: runnerOf(item),
  Side: sideOf(item),
  Line: lineOf(item),
  Rate: rateOf(item),
  Amount: stakeOf(item),
});
