import { useEffect, useState } from 'react';
import { getStatementMarketBets } from '../../apiservices/reportService';
import { Amount, fmtDate } from './parts';

/**
 * "User Market Bets" — the popup behind a SPORTS statement row's description.
 *
 * The reference re-queries its bet-history endpoint filtered to one marketId.
 * tenexch has a purpose-built call for exactly this, /user/account-statement-v2/bets,
 * which takes the row's market and match ids and returns that market's bets.
 */
function MarketBetsModal({ row, onClose }) {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const result = await getStatementMarketBets({
          matchId: row?.matchId,
          eventId: row?.eventId,
        });
        if (alive) setBets(result?.success && Array.isArray(result.bets) ? result.bets : []);
      } catch (err) {
        console.error('Market bets api error', err);
        if (alive) setBets([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [row]);

  const side = (bet) => {
    const value = String(bet.side ?? bet.bet_type ?? '').toLowerCase();
    if (value === '0' || value === 'back') return 'Back';
    if (value === '1' || value === 'lay') return 'Lay';
    return '-';
  };
  const isBack = (bet) => side(bet) === 'Back';
  const isLay = (bet) => side(bet) === 'Lay';

  return (
    <div
      id="marketbetspopup"
      className="modal fade show reportallpopup"
      style={{ display: 'block' }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="myModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title mt-0" id="myModalLabel">User Market Bets</h5>
            <button
              onClick={onClose}
              type="button"
              className="closebtn"
              data-dismiss="modal"
              aria-hidden="true"
            >
              ×
            </button>
          </div>
          <div className="modal-body pb-0">
            <div className="table-responsive ">
              <table id="basic-btn" className="table table-sm mb-1 table-bordered reporttable">
                <thead>
                  <tr className="bg-dark text-white">
                    <th className="wid150 pthead">Competition</th>
                    <th className="wid280 pthead">Event</th>
                    <th className="wid150 pthead">Market</th>
                    <th className="wid140 pthead">Runner</th>
                    <th className="wid100 pthead">Side</th>
                    <th className="wid100 text-right pthead">Line</th>
                    <th className="wid100 text-right pthead">Rate</th>
                    <th className="wid100 text-right pthead">Amount</th>
                    <th className="wid100 text-right pthead">Profit/Loss</th>
                    <th className="wid140 pthead">Status</th>
                    <th className="wid165 pthead">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={11} className="text-center py-5">
                        <h5 className="text-dark font-weight-bold m-0"> Loading...... </h5>
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    bets.map((bet, i) => (
                      <tr
                        key={`${bet.id ?? bet._id ?? i}-${i}`}
                        bgcolor={isBack(bet) ? '#72BBEF' : isLay(bet) ? '#FAA9BA' : ''}
                      >
                        <td>{bet.competition_name || bet.sports || '-'}</td>
                        <td>{bet.event_name || bet.match_title || '-'}</td>
                        <td>{bet.market_name || bet.market_type || '-'}</td>
                        <td>{bet.selection_name || bet.runner_name || '-'}</td>
                        <td>{side(bet)}</td>
                        <td className="text-right fbold">{bet.line ?? bet.run ?? '-'}</td>
                        <td className="text-right fbold">{bet.odds ?? bet.rate ?? '-'}</td>
                        <td className="text-right">
                          <Amount classPropName="fbold" amount={bet.stake_amount ?? bet.stake ?? 0} />
                        </td>
                        <td className="text-right">
                          <Amount
                            classPropName={
                              bet.result_status === 'WON'
                                ? 'text-success fbold'
                                : bet.result_status === 'LOST'
                                  ? 'text-danger fbold'
                                  : 'fbold'
                            }
                            amount={bet.win_amount ?? bet.profit_loss ?? 0}
                          />
                        </td>
                        <td>{bet.result_status || bet.status || '-'}</td>
                        <td>{fmtDate(bet.created_at || bet.placed_at)}</td>
                      </tr>
                    ))}
                  {!loading && bets.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-5">
                        <h5 className="text-danger font-weight-bold m-0">No Bet History</h5>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline-danger btn-sm waves-effect mx-auto"
              data-dismiss="modal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </div>
  );
}

export default MarketBetsModal;
