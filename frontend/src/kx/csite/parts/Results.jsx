import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ng, host } from '../../ng';
import { cardImg } from '../cards';

const R = ng('crs');

/**
 * app-results of the casino site (casino.kingexch111.com): the "Recent Result"
 * strip under a table — one chip per round, its letter and colour per table —
 * and the round's result modal a chip opens (the dealt cards, the winner, and
 * every market's winning / losing runners).
 *
 * Props: { attrs, eventId, results }
 *   results — the reference's casinoEventResults rounds, newest first:
 *     { roundId, eventId, eventName, winner, cards, results: [
 *         { marketId, marketName, index,
 *           runners: [{ selectionId, result: 'WINNER' | 'LOSER' }],
 *           runnersName: { [selectionId]: name } }] }
 *   `winner` and `cards` per table (card codes "<S|H|C|D><rank>_", "0" = none):
 *     99.0010 / 99.0013 / 99.0014 / 99.0016  winner 'A' | 'B'
 *         cards { PLAYER_A: {card_1, card_2, card_3}, PLAYER_B: {…}, JOKER: {card_1} (99.0016) }
 *     99.0018 / 99.0019 / 99.0021            winner 'DRAGON' | 'TIGER' | 'TIE'
 *         cards { DRAGON: {card_1}, TIGER: {card_1} }
 *     99.0041   winner 'D' | 'T' | 'L'   cards { DRAGON: {card_1, card_2?, card_3?}, TIGER, LION }
 *     99.0030   winner 'H' | 'L' | 'T'   cards { card }
 *     99.0005   winner 'A' | 'B' | 'C'   cards { card }
 *     99.0001   winner 'P' | 'B' | 'T'   cards { PLAYER: {card_1, card_2, card_3}, BANKER: {…} }
 *     99.0007   winner 'PLAYER A' | 'PLAYER B' | 'TIE'
 *         cards { BOARD: {card_1…card_5}, PLAYER_A: {card_1, card_2}, PLAYER_B: {…} }
 *     99.0022   winner 'PLAYER_8' … 'PLAYER_11'
 *         cards { PLAYER_8: [codes], PLAYER_9: [], PLAYER_10: [], PLAYER_11: [] }
 *     99.0046   winner 'CK' | 'DK' | 'HK' | 'SK'   cards { "1": code, "2": code, … } (the draw order)
 *     99.0025   winner 'A' | 'B'
 *         cards { cardScan: { RESULT, ANDAR, BAHAR }, cardsArr: { ANDAR_CARDS: [], BAHAR_CARDS: [] } }
 */
export default function Results({ attrs, eventId, results = [] }) {
  const eventid = String(eventId || '');
  const [open, setOpen] = useState(null); // { id: modal id, item }
  const show = (id, item) => setOpen({ id, item });

  return (
    <app-results {...attrs} {...host('crs')}>
      {eventid !== '99.0042' && (
        <div {...R} className="recent-res teenpatti">
          <h5 {...R} style={{ fontWeight: 'bold' }}>Recent Result</h5>
          <ul {...R} className="result">
            {results.map((item, i) => <Chips key={item?.roundId || i} item={item} eventid={eventid} show={show} />)}
          </ul>
        </div>
      )}
      {open && <ResultModal open={open} eventid={eventid} onClose={() => setOpen(null)} />}
    </app-results>
  );
}

const or = (w) => (w !== null && w !== undefined ? w : 'R');
const abc = (a, b, c) => (a ? 'casino-a' : b ? 'casino-b' : c ? 'casino-c' : undefined);

// The chip(s) one round gets — keyed, as the reference's are, on the round's
// own eventId (a few on the page's).
function Chips({ item, eventid, show }) {
  const e = String(item?.eventId || '');
  const w = item?.winner;
  const li = (id, className, aClass, text, key) => (
    <li {...R} key={key || id} data-bs-toggle="modal" data-bs-target={`#${id}`} className={className} onClick={() => show(id, item)}>
      <a {...R} className={aClass}>{text}</a>
    </li>
  );
  const out = [];

  if (e === '99.0006') out.push(li('ammarAkbar', `number text-dark ${abc(w === 'I', w === 'M', w === 'D') || ''}`.trim(), undefined, ` ${or(w)} `));
  if (e === '99.0005') out.push(li('ammarAkbar', `number text-dark ${abc(w === 'A', w === 'B', w === 'C') || ''}`.trim(), undefined, ` ${or(w)} `));
  if (!GENERIC_EXCLUDED.includes(e) && eventid !== '99.0040') {
    out.push(li('resultModal', w === 'B' ? 'casino-b' : 'casino-a', 'number', ` ${or(w)} `));
  }
  if (['99.0025', '99.0026', '99.0033', '99.0034', '99.0035'].includes(e)) {
    out.push(li('andarbaharresult', w === 'B' ? 'casino-b' : 'casino-a', 'number', ` ${or(w)} `));
  }
  if (['99.0025', '99.0056', '99.0026', '99.0033', '99.0034', '99.0035'].includes(e)) {
    out.push(li('baccarat29result', w === 'B' ? 'casino-b' : 'casino-a', 'number', ` ${or(w)} `));
  }
  if (e === '99.0021') {
    out.push(li('dragontiger1result', abc(w === 'DRAGON', w === 'TIGER', w === 'TIE' || w === ''), 'number text-dark', dtLetter(w, true)));
  }
  if (e === '99.0007' || e === '99.0008') {
    const t = w !== null && w !== undefined ? (w === 'PLAYER B' ? 'B' : w === 'PLAYER A' ? 'A' : 'T') : 'R';
    out.push(li('pokerResultModal', abc(w === 'PLAYER A', w === 'PLAYER B', w === 'TIE'), 'number', ` ${t} `));
  }
  if (['99.0020', '99.0019', '99.0018'].includes(e)) {
    out.push(li('dragonTiger2020', abc(w === 'DRAGON', w === 'TIGER', w === 'TIE'), 'number text-dark', dtLetter(w, false)));
  }
  if (['99.0001', '99.0002', '99.0036', '99.0003'].includes(e)) {
    out.push(li('baccarat', w === 'B' ? 'baccarat-Banker' : w === 'P' ? 'baccarat-player' : 'baccarat-Tie', 'number text-white', ` ${or(w)} `));
  }
  if (e === '99.0031' || e === '99.0032' || eventid === '99.0030') {
    out.push(li('lucky7', `l7 ${abc(w === 'H', w === 'L', w === 'T') || ''}`.trim(), 'number', ` ${or(w)} `));
  }
  if (e === '99.0022' || e === '99.0023') {
    const t = { PLAYER_11: '11', PLAYER_10: '10', PLAYER_9: '9', PLAYER_8: '8' }[w] ?? w;
    out.push(
      <li {...R} key="Card32Modal" className="l7 casino-c">
        <a {...R} data-bs-toggle="modal" data-bs-target="#Card32Modal" className="number" onClick={() => show('Card32Modal', item)}> {t} </a>
      </li>,
    );
  }
  if (e === '99.0004' || e === '99.0041') {
    out.push(
      <li {...R} key="dtlTeenpatti" data-bs-toggle="modal" data-bs-target="#dtlTeenpatti" className={w === 'T' ? 'tigerResult' : w === 'L' ? 'loinResult' : 'casino-a'}>
        <a {...R} className="number text-dark" onClick={() => show('dtlTeenpatti', item)}> {or(w)} </a>
      </li>,
    );
  }
  if (['99.0046', '99.0047', '99.0048'].includes(e)) {
    out.push(
      <li {...R} key="CardRaceModal" data-bs-toggle="modal" data-bs-target="#CardRaceModal" onClick={() => show('CardRaceModal', item)}>
        <a {...R} className="number text-dark"><img {...R} className="imgClass" src={cardImg(`${w}_`)} alt="" /></a>
      </li>,
    );
  }
  return out;
}

const dtLetter = (w, tieBlank) => (w === 'DRAGON' ? ' D ' : w === 'TIGER' || w === 'TIE' || (tieBlank && w === '') ? ' T ' : null);

// The rounds the generic Player A / Player B chip (#resultModal) skips.
const GENERIC_EXCLUDED = ['99.0001', '99.0002', '99.0003', '99.0046', '99.0047', '99.0048', '99.0022', '99.0023', '99.0004',
  '99.0005', '99.0009', '99.0033', '99.0034', '99.0062', '99.0035', '99.0025', '99.0056', '99.0051', '99.0021', '99.0050',
  '99.0026', '99.0042', '99.0006', '99.0020', '99.0019', '99.0018', '99.0030', '99.0060', '99.0031', '99.0032', '99.0058',
  '99.0007', '99.0008', '88.0021', '88.0019', '88.0020', '99.0041', '99.0055'];

/* ---------------------------------------------------------------- modals */

// Bootstrap's modal, opened in place as data-bs-toggle leaves it: `show` +
// display block on the dialog, `modal-open` + overflow hidden on <body>, the
// backdrop on <body>; closed by ×, Escape or a click outside the dialog.
function Modal({ id, labelledBy, fixed, onClose, children }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const { body, documentElement: html } = document;
    const scrollbar = window.innerWidth - html.clientWidth;
    const prev = { o: body.style.overflow, p: body.style.paddingRight, h: html.style.overflow };
    body.classList.add('modal-open');
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${Math.max(scrollbar, 0)}px`;
    html.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    return () => {
      body.classList.remove('modal-open');
      body.style.overflow = prev.o;
      body.style.paddingRight = prev.p;
      html.style.overflow = prev.h;
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  return (
    <>
      <div
        {...R}
        id={id}
        tabIndex={-1}
        aria-labelledby={labelledBy}
        className="modal fade show"
        style={fixed ? { overflowY: 'hidden', position: 'fixed', display: 'block' } : { display: 'block' }}
        aria-modal="true"
        role="dialog"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div {...R} className="modal-dialog">
          <div {...R} className="modal-content">{children}</div>
        </div>
      </div>
      {createPortal(<div className="modal-backdrop fade show"></div>, document.body)}
    </>
  );
}

// The two header styles: h5 (most), and h6 at 15px for the #resultModal family.
function Head({ title, small, onClose }) {
  const H = small ? 'h6' : 'h5';
  return (
    <div {...R} className="modal-header bet-slip-head">
      <H {...R} id="exampleModalLabel" className="modal-title">
        <b {...R} style={small ? { textTransform: 'capitalize', fontSize: '15px' } : { textTransform: 'capitalize' }}> {title} </b>
      </H>
      <button {...R} type="button" data-bs-dismiss="modal" aria-label="Close" className="close" onClick={onClose}>×</button>
    </div>
  );
}

function RoundId({ item, float }) {
  return (
    <div {...R} className="modal-title p-2" style={float ? { float: 'left' } : undefined}>
      <h6 {...R} className="text-right round-id"><b {...R}>Round Id:</b> {item.roundId} </h6>
    </div>
  );
}

// Every market of the round, each runner with a gold (won) or grey trophy.
function Markets({ item }) {
  return (item.results || []).map((mk, i) => (
    <div {...R} key={mk?.marketId || i} className="col-md-12 col-xs-12 all-market-winner">
      <h6 {...R} className="text-center fw-bold">{mk?.marketName}</h6>
      {(mk?.runners || []).map((r, j) => (
        <div {...R} key={j} className="card-Img-box sectionA p-1">
          {' '}{mk?.runnersName?.[r?.selectionId]} -
          <i {...R} className={`fa fa-trophy winner-icon${r?.result === 'WINNER' || r?.result === 'WINER' ? '' : ' loser-icon'}`}></i>
        </div>
      ))}
    </div>
  ));
}

const Img = (props) => <img {...R} alt="" {...props} />;
const WinA = () => <button {...R} className="btn winner-team WinnerA">Winner</button>;
const WinB = () => <button {...R} className="btn winner-team Winnerb">Winner</button>;
const Tie = () => <button {...R} className="btn tie-game">TIE</button>;
const MB80 = { marginBottom: '80px' };
const ROT = { transform: 'rotate(90deg)', marginLeft: '12px' };
const entries = (o) => Object.entries(o || {});

// What each modal shows, as its template lays it out.
function ResultModal({ open, eventid, onClose }) {
  const { id, item } = open;
  const cards = item.cards || {};
  const w = item.winner;
  const shell = (body, { small = false, fixed = small, labelledBy = id, bottom } = {}) => (
    <Modal id={id} labelledBy={labelledBy} fixed={fixed} onClose={onClose}>
      <Head title={item.eventName} small={small} onClose={onClose} />
      <div {...R} id="__BVID__33___BV_modal_body_" className="modal-body">
        <div {...R} className={bottom ? 'body-bottom' : undefined} style={bottom ? undefined : MB80}>{body}</div>
      </div>
    </Modal>
  );

  switch (id) {
    case 'baccarat': {
      const P = cards.PLAYER || {};
      const B = cards.BANKER || {};
      return shell(
        <>
          <RoundId item={item} />
          <div {...R} className="col-12 col-md-6 col-xs-12 paati_boxs">
            <h6 {...R}>Player</h6>
            <div {...R} className="card-Img-box">
              <Img src={cardImg(P.card_1)} /><Img src={cardImg(P.card_2)} />
              {P.card_3 !== '0' && P.card_3 && <Img style={ROT} src={cardImg(P.card_3)} />}
              {w === 'P' && <WinA />}
            </div>
          </div>
          <div {...R} className="col-12 col-md-6 col-xs-12 paati_boxs">
            <h6 {...R}>Banker</h6>
            <div {...R} className="card-Img-box">
              <Img src={cardImg(B.card_1)} /><Img src={cardImg(B.card_2)} />
              {B.card_3 !== '0' && B.card_3 && <Img style={ROT} src={cardImg(B.card_3)} />}
              {w === 'B' && <WinB />}
            </div>
          </div>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
        { labelledBy: 'baccaratModalLabel', bottom: true },
      );
    }
    case 'resultModal': {
      const A = cards.PLAYER_A || {};
      const B = cards.PLAYER_B || {};
      return shell(
        <>
          <RoundId item={item} />
          <div {...R} className="col-12 col-md-6 col-xs-12 paati_boxs">
            <h6 {...R}>Player A</h6>
            <div {...R} className="card-Img-box">
              <Img src={cardImg(A.card_1)} /><Img src={cardImg(A.card_2)} /><Img src={cardImg(A.card_3)} />
              {w === 'A' && <WinA />}
            </div>
          </div>
          <div {...R} className="col-12 col-md-6 col-xs-12 paati_boxs">
            <h6 {...R}>Player B</h6>
            <div {...R} className="card-Img-box">
              <Img src={cardImg(B.card_1)} /><Img src={cardImg(B.card_2)} /><Img src={cardImg(B.card_3)} />
              {w === 'B' && <WinB />}
            </div>
          </div>
          {cards.JOKER && (
            <div {...R} className="col-12 col-md-6 col-xs-12 paati_boxs">
              <h6 {...R}>JOKER</h6>
              <div {...R} className="card-Img-box">
                <Img src={cardImg(cards.JOKER.card_1)} />
                {w === 'B' && <WinB />}
              </div>
            </div>
          )}
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
        { small: true, labelledBy: 'exampleModalLabel' },
      );
    }
    case 'andarbaharresult': {
      const arr = cards.cardsArr || {};
      const trophy = (won) => <i {...R} className={`fa fa-trophy winner-icon ms-1 mr-2${won ? '' : ' loser-icon'}`}></i>;
      const row = (list) => (list || []).map((c, i) => <li {...R} key={i} style={{ marginLeft: '3px' }}><Img src={cardImg(c)} /></li>);
      return shell(
        <>
          <RoundId item={item} />
          <ul {...R} className="showall-card">
            <li {...R} className="mr-2">Joker <span {...R}>- </span></li>
            <li {...R} style={{ marginLeft: '3px' }}><Img src={cardImg(cards.cardScan?.RESULT)} /></li>
          </ul>
          <ul {...R} className="showall-card">
            <li {...R} className="mr-2">{trophy(w === 'B')} BAHAR <span {...R}>- </span></li>
            {row(arr.BAHAR_CARDS)}
          </ul>
          <ul {...R} className="showall-card">
            <li {...R} className="mr-2">{trophy(w === 'A')} ANDAR <span {...R}>- </span></li>
            {row(arr.ANDAR_CARDS)}
          </ul>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
        { small: true, labelledBy: 'exampleModalLabel' },
      );
    }
    case 'baccarat29result':
    case 'dragontiger1result': {
      const [a, b] = id === 'baccarat29result' ? [['Player A', cards.PLAYER_A], ['Player B', cards.PLAYER_B]] : [['Dragon', cards.DRAGON], ['Tiger', cards.TIGER]];
      const row = ([label, set]) => (
        <ul {...R} className="showall-card">
          <li {...R} className="mr-2"> {label} <span {...R}>- </span></li>
          {entries(set).map(([k, c]) => <li {...R} key={k} className="ms-1" style={{ marginLeft: '3px' }}><Img className="imgClassModal" src={cardImg(c)} /></li>)}
        </ul>
      );
      return shell(
        <>
          <RoundId item={item} />
          {row(a)}
          {row(b)}
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
        { small: true, labelledBy: 'exampleModalLabel' },
      );
    }
    case 'dtlTeenpatti': {
      const box = eventid === '99.0042' ? 'paati_boxs col-4' : 'paati_boxs col-12 col-md-6 col-xs-12';
      const hand = (label, set = {}, won, Win) => (
        <div {...R} className={box}>
          <h6 {...R}>{label}</h6>
          <div {...R} className="card-Img-box">
            <Img src={cardImg(set.card_1)} />
            {set.card_2 && <Img src={cardImg(set.card_2)} />}
            {set.card_3 && <Img src={cardImg(set.card_3)} />}
            {won && <Win />}
          </div>
        </div>
      );
      return shell(
        <>
          <RoundId item={item} />
          <div {...R} className={eventid === '99.0042' ? 'd-flex' : undefined}>
            {hand('Dragon', cards.DRAGON, w === 'D', WinA)}
            {hand('Lion', cards.LION, w === 'L', WinB)}
            {hand('Tiger', cards.TIGER, w === 'T', WinB)}
          </div>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
      );
    }
    case 'ammarAkbar': {
      const name = { A: 'Amar', B: 'Akbar', C: 'Anthony', I: 'INA', M: 'MINA', D: 'DIKA' }[w];
      return shell(
        <>
          <RoundId item={item} />
          <div {...R} className="col-12 col-md-6 col-xs-12 paati_boxs">
            {name && <h6 {...R}>{name}</h6>}
            <div {...R} className="card-Img-box">
              <Img src={cardImg(cards.card)} />
              <WinA />
            </div>
          </div>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
      );
    }
    case 'dragonTiger2020':
      return shell(
        <>
          <RoundId item={item} />
          <div {...R} className="col-6 col-md-6 col-xs-12 paati_boxs">
            <h6 {...R}>Dragon</h6>
            <div {...R} className="card-Img-box">
              <Img src={cardImg(cards.DRAGON?.card_1)} />
              {w === 'DRAGON' && <WinA />}
              {w === 'TIE' && <Tie />}
            </div>
          </div>
          <div {...R} className="col-6 col-md-6 col-xs-12 paati_boxs">
            <h6 {...R}>Tiger</h6>
            <div {...R} className="card-Img-box">
              <Img src={cardImg(cards.TIGER?.card_1)} />
              {w === 'TIGER' && <WinB />}
              {w === 'TIE' && <Tie />}
            </div>
          </div>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
        { labelledBy: 'dragontiger' },
      );
    case 'lucky7':
      return shell(
        <>
          <RoundId item={item} />
          <div {...R} className="col-12 col-md-6 col-xs-12 paati_boxs">
            <div {...R} className="card-Img-box"><Img src={cardImg(cards.card)} /></div>
          </div>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
      );
    case 'CardRaceModal': {
      // The draw, sorted into the four suits' rows.
      const suit = (s) => Object.values(cards).filter((c) => typeof c === 'string' && c.startsWith(s));
      return shell(
        <>
          <RoundId item={item} float />
          <div {...R} className="col-12 col-md-12 col-xs-12 paati_boxs">
            {['C', 'D', 'H', 'S'].map((s) => (
              <ul {...R} key={s} className="showall-card">
                <Img className="imgClassModal" src={cardImg(`${s}K_`)} />
                <span {...R} className="ms-1">-</span>
                {suit(s).map((c, i) => <li {...R} key={i} className="ms-1"><Img className="imgClassModal" src={cardImg(c)} /></li>)}
              </ul>
            ))}
          </div>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
      );
    }
    case 'Card32Modal':
      return shell(
        <>
          <RoundId item={item} float />
          <div {...R} className="col-12 col-md-12 col-xs-12 paati_boxs">
            {['8', '9', '10', '11'].map((n, i) => {
              const trophy = <i {...R} className={`fa fa-trophy winner-icon${w === `PLAYER_${n}` ? '' : ' loser-icon'}`}></i>;
              return (
                <ul {...R} key={n} className="showall-card">
                  <li {...R} className={i < 2 ? 'mr-2' : 'me-1'}>Player {n} <span {...R}>-</span></li>
                  {(cards[`PLAYER_${n}`] || []).map((c, j) => <li {...R} key={j}><Img className="imgClassModal me-1" src={cardImg(c)} /></li>)}
                  <li {...R}>{i === 0 ? <span {...R}>{trophy}</span> : trophy}</li>
                </ul>
              );
            })}
            <div {...R} className="clearfix"></div>
            <Markets item={item} />
          </div>
        </>,
      );
    case 'pokerResultModal':
      return shell(
        <>
          <RoundId item={item} float />
          <div {...R} className="col-12 col-md-12 col-xs-12 paati_boxs">
            {[['BOARD', cards.BOARD], ['PLAYER A', cards.PLAYER_A], ['PLAYER B', cards.PLAYER_B]].map(([label, set]) => (
              <ul {...R} key={label} className="showall-card">
                <b {...R}>{label}</b>
                <span {...R} className="ms-1">-</span>
                {entries(set).map(([k, c]) => <li {...R} key={k} className="ms-1"><Img className="imgClassModal" src={cardImg(c)} /></li>)}
              </ul>
            ))}
          </div>
          <div {...R} className="clearfix"></div>
          <Markets item={item} />
        </>,
      );
    default:
      return null;
  }
}
