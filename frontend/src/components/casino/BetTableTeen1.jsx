import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="mr-2 d-none"></span>;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="mr-2" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

// The 7 Up/Down boxes carry a single worst-case figure (legacy exposure row
// keyed by the feed nat, e.g. "7 Up Player").
function UpDownBook({ value }) {
  const v = Number(value) || 0;
  if (v === 0) return <div className="up-down-book d-none">0</div>;
  return <div className={`up-down-book ${v < 0 ? 'book-red' : 'book-green'}`}>{Math.round(v)}</div>;
}

const BetTableTeen1 = memo(function BetTableTeen1({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const player = findByNat(sub, 'Player');
  const dealer = findByNat(sub, 'Dealer');
  const upPlayer = findByNat(sub, '7 Up Player');
  const downPlayer = findByNat(sub, '7 Down Player');
  const upDealer = findByNat(sub, '7 Up Dealer');
  const downDealer = findByNat(sub, '7 Down Dealer');

  return (
    <>
      {/* Main: Player vs Dealer */}
      <div className="teen1daycasino-container">
        <div className="teen1dayleft">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Player</b>
              {/* Two-way book: signed P/L for this outcome (row "Player") */}
              <div className="float-right"><ExposureSpan value={exposures?.['Player']} /></div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(player)}`}
                onClick={isSusp(player) ? undefined : () => handleBet(player.sid, 'back', player.b, player)}
              >
                <span className="casino-box-odd">{player?.b || 0}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(player)}`}
                onClick={isSusp(player) ? undefined : () => handleBet(player.sid, 'lay', player.l, player)}
              >
                <span className="casino-box-odd">{player?.l || 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="teen1daycenter"></div>
        <div className="teen1dayright">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Dealer</b>
              <div className="float-right"><ExposureSpan value={exposures?.['Dealer']} /></div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(dealer)}`}
                onClick={isSusp(dealer) ? undefined : () => handleBet(dealer.sid, 'back', dealer.b, dealer)}
              >
                <span className="casino-box-odd">{dealer?.b || 0}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(dealer)}`}
                onClick={isSusp(dealer) ? undefined : () => handleBet(dealer.sid, 'lay', dealer.l, dealer)}
              >
                <span className="casino-box-odd">{dealer?.l || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Up/Down section */}
      <div className="teen1daycasino-container">
        <div className="teen1dayleft">
          <div className="seven-up-down-box">
            <div
              className={`up-box${suspCls(downPlayer)}`}
              onClick={isSusp(downPlayer) ? undefined : () => handleBet(downPlayer.sid, 'back', downPlayer.b, downPlayer)}
            >
              <UpDownBook value={exposures?.['7 Down Player']} />
              <div className="text-right">
                <div className="up-down-odds">{downPlayer?.b || 0}</div>
                <span>DOWN</span>
              </div>
            </div>
            <div
              className={`down-box${suspCls(upPlayer)}`}
              onClick={isSusp(upPlayer) ? undefined : () => handleBet(upPlayer.sid, 'back', upPlayer.b, upPlayer)}
            >
              <UpDownBook value={exposures?.['7 Up Player']} />
              <div className="text-left">
                <div className="up-down-odds">{upPlayer?.b || 0}</div>
                <span>UP</span>
              </div>
            </div>
            <div className="seven-box">
              <img src="/assets/front/img/trape-seven.png" alt="7" />
            </div>
          </div>
        </div>
        <div className="teen1daycenter"></div>
        <div className="teen1dayright">
          <div className="seven-up-down-box">
            <div
              className={`up-box${suspCls(downDealer)}`}
              onClick={isSusp(downDealer) ? undefined : () => handleBet(downDealer.sid, 'back', downDealer.b, downDealer)}
            >
              <UpDownBook value={exposures?.['7 Down Dealer']} />
              <div className="text-right">
                <div className="up-down-odds">{downDealer?.b || 0}</div>
                <span>DOWN</span>
              </div>
            </div>
            <div
              className={`down-box${suspCls(upDealer)}`}
              onClick={isSusp(upDealer) ? undefined : () => handleBet(upDealer.sid, 'back', upDealer.b, upDealer)}
            >
              <UpDownBook value={exposures?.['7 Up Dealer']} />
              <div className="text-left">
                <div className="up-down-odds">{upDealer?.b || 0}</div>
                <span>UP</span>
              </div>
            </div>
            <div className="seven-box">
              <img src="/assets/front/img/trape-seven.png" alt="7" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default BetTableTeen1;
