import { memo } from 'react';

const TOTALS = ['Total 0', 'Total 1', 'Total 2', 'Total 3'];

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const BetTableQueen = memo(function BetTableQueen({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});
  const remark = gameData?.remark || '';

  const items = TOTALS.map((nat) => sub.find((s) => s.nat === nat));

  return (
    <>
      <div className="container-fluid container-fluid-5">
        {/* Desktop layout */}
        <div className="row d-none-small">
          {items.map((item, i) => (
            <div key={i} className="col-3">
              <div className="casino-box-row">
                <div className="casino-nation-name"><b>{TOTALS[i]}</b></div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item?.b ?? 0}</span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
                  >
                    <span className="casino-box-odd">{item?.l ?? 0}</span>
                  </div>
                </div>
                <div className={`casino-nation-name${exposures?.[item?.nat] ? '' : ' d-none'}`}>
                  {exposures?.[item?.nat] ? <span className={exposures[item.nat] < 0 ? 'text-danger' : 'text-success'}>{Math.round(exposures[item.nat])}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile layout */}
        <div className="row row5 d-none-big">
          {items.map((item, i) => (
            <div key={i} className="casino-bl-box">
              <div className="casino-bl-box-item casino-odds-name">
                <b>{TOTALS[i]}</b>
                {exposures?.[item?.nat]
                  ? <span className={`float-right ${exposures[item.nat] < 0 ? 'text-danger' : 'text-success'}`}>{Math.round(exposures[item.nat])}</span>
                  : <span className="float-right text-success d-none"></span>
                }
              </div>
              <div
                className={`back casino-bl-box-item${suspCls(item)}`}
                onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
              >
                <span className="casino-box-odd">{item?.b ?? 0}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(item)}`}
                onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
              >
                <span className="casino-box-odd">{item?.l ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {remark && (
        <div className="casino-remark mt-1">
          <div className="remark-icon">
            <img src="/assets/front/img/icons/remark.png" alt="" />
          </div>
          <div className="marquee-wrapper">
            <div className="marquee-content" style={{ animationDuration: `${remark.length * 0.2}s` }}>{remark}</div>
          </div>
        </div>
      )}
    </>
  );
});

export default BetTableQueen;
