import { memo } from 'react';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === '0' || item.gstatus === 'SUSPENDED' || !item.b || item.b === 0;
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

const BetTableMogambo = memo(function BetTableMogambo({ gameData, onBet, exposures = {} }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const dagaTeja = findByNat(sub, 'Daga / Teja');
  const mogamboItem = findByNat(sub, 'Mogambo');
  const cardTotal = findByNat(sub, '3 Card Total');

  // "3 Card Total" is a LINE market: b/l carry the line (e.g. 27), bbhav/lbhav
  // the rates in bps (e.g. 65/85). The price is rate/100 + 1 — the line itself
  // is NOT odds and must only go into the selection tag (via _line/_sessionRate,
  // handled in useCasinoBet). Display stays line big, rate small.
  const totalBackOdds = cardTotal?.bbhav > 0 ? cardTotal.bbhav / 100 + 1 : 0;
  const totalLayOdds = cardTotal?.lbhav > 0 ? cardTotal.lbhav / 100 + 1 : 0;
  const totalItem = (type) => ({
    ...cardTotal,
    _sessionRate: true,
    _line: type === 'lay' ? cardTotal?.l : cardTotal?.b,
  });

  const renderBetLayout = (responsiveClass, totalMargin) => (
    <div className={responsiveClass}>
      <div className="teen1daycasino-container">
        <div className="teen1dayleft">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Daga / Teja</b>
              <div className="float-right">
                <span className="mr-2 d-none"></span>
                <ExposureSpan value={exposures?.['Daga / Teja']} />
              </div>
            </div>
            <div className="casino-bl-box casino-bl-boxfull">
              <div
                className={`back casino-bl-box-item${suspCls(dagaTeja)}`}
                onClick={isSusp(dagaTeja) ? undefined : () => handleBet(dagaTeja?.sid, 'back', dagaTeja?.b, dagaTeja)}
              >
                <span className="casino-box-odd">{dagaTeja?.b || 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="teen1dayright">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Mogambo</b>
              <div className="float-right">
                <span className="mr-2 d-none"></span>
                <ExposureSpan value={exposures?.['Mogambo']} />
              </div>
            </div>
            <div className="casino-bl-box casino-bl-boxfull">
              <div
                className={`back casino-bl-box-item${suspCls(mogamboItem)}`}
                onClick={isSusp(mogamboItem) ? undefined : () => handleBet(mogamboItem?.sid, 'back', mogamboItem?.b, mogamboItem)}
              >
                <span className="casino-box-odd">{mogamboItem?.b || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`teenpatti2cardsextra ${totalMargin}`}>
        <div className="casino-box-row">
          <div className="casino-nation-name">
            <b className="pointer">3 Card Total</b>
            <div className="float-right">
              {exposures?.['3 Card Total'] ? <span className={`mr-2 ${exposures['3 Card Total'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['3 Card Total'])}</span> : <span className="mr-2 d-none"></span>}
            </div>
          </div>
          <div className="casino-bl-box total-odds">
            <div
              className={`lay casino-bl-box-item${suspCls(cardTotal)}`}
              onClick={isSusp(cardTotal) || !totalLayOdds ? undefined : () => handleBet(cardTotal?.sid, 'lay', totalLayOdds, totalItem('lay'))}
            >
              <span className="casino-box-odd">{cardTotal?.l || 0}</span>
              <span>{cardTotal?.lbhav || 0}</span>
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(cardTotal)}`}
              onClick={isSusp(cardTotal) || !totalBackOdds ? undefined : () => handleBet(cardTotal?.sid, 'back', totalBackOdds, totalItem('back'))}
            >
              <span className="casino-box-odd">{cardTotal?.b || 0}</span>
              <span>{cardTotal?.bbhav || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderBetLayout('d-none-small', 'mt-3')}
      {renderBetLayout('d-none-big', 'mt-2')}
    </>
  );
});

export default BetTableMogambo;
