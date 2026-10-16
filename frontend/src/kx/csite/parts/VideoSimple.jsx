import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import { cardImg, asset } from '../cards';

const V = ng('cvs');

// Whether the countdown ring shows (the reference's TIME_LIMIT ≠ 0): the round
// is ONLINE with a betting window (app-casino-room's gear moves aside on the
// same state).
const hasTimer = (game) => game?.status === 'ONLINE' && Number(game?.fullTime) > 0;

/**
 * app-video-simple of the casino site (casino.kingexch111.com): the 16:9 box
 * above a table's markets. With no stream it shows the casino's loader
 * animation (assets/loader.gif) on black; over it, top left, the round id and
 * the cards dealt so far in the table's own layout; the "<winner> win" banner
 * when a round is declared; the countdown ring top right while the table is
 * ONLINE.
 *
 * Props: { attrs, game, resultDeclared, streamUrl, userCount }
 *   game           — useCasinoTable().game. Fields read here (the casino feed's
 *                    own names; `cards` is the feed's `cardsArr`):
 *     roundId, status ('ONLINE' | 'SUSPEND'), timeLeft (s), fullTime (s: the
 *     ring's one turn — the reference's TIME_LIMIT),
 *     cards — card codes "<S|H|C|D><A|2..10|J|Q|K>_" ("S10_", "HK_"), "0" =
 *       face down. Shape per table (only the keys the table uses):
 *         99.0010 / 99.0013 / 99.0014 / 99.0016
 *                       { PLAYER_A: {card_1, card_2, card_3}, PLAYER_B: {…},
 *                         JOKER: {card_1} (99.0016 only) }
 *                       (99.0014 MUFLIS: the reference draws no cards, RID only)
 *         99.0018 / 99.0019  { DRAGON: {card_1}, TIGER: {card_1} }
 *         99.0041       { DRAGON: {card_1, card_2?, card_3?}, TIGER: {…}, LION: {…} }
 *         99.0021       — none drawn (RID only)
 *         99.0030       { card }
 *         99.0005       { card }
 *         99.0001       { PLAYER: {card_1, card_2, card_3}, BANKER: {card_1, card_2, card_3} }
 *                       (a card_3 of "0" is not drawn; a dealt one lies rotated)
 *         99.0007       { PLAYER_A: {card_1, card_2}, PLAYER_B: {card_1, card_2},
 *                         BOARD: {card_1 … card_5} }
 *         99.0022       { PLAYER_8: [codes], PLAYER_9: [], PLAYER_10: [], PLAYER_11: [] }
 *                       (+ game.cardCount: { PLAYER_8: 8, PLAYER_9: 9, … } — the
 *                       running totals in the labels)
 *         99.0046       { CK: [codes], DK: [], HK: [], SK: [] } — the longest
 *                       suit list is drawn
 *         99.0025       { ANDAR_CARDS: [codes], BAHAR_CARDS: [codes] }
 *                       (+ game.cardScan: { RESULT } — the joker; with a RESULT
 *                       the Andar Bahar strip replaces the card overlay)
 *   resultDeclared — the round's winner label ("PLAYER A") while the banner
 *                    shows, else falsy.
 *   streamUrl      — the table's video iframe URL; none → the loader.
 *   userCount      — the watcher count badge (the reference's userCount feed).
 */
export default function VideoSimple({ attrs, game = {}, resultDeclared, streamUrl, userCount }) {
  const cards = game.cards || {};
  const eventid = String(game.eventId || '');
  const abResult = game.cardScan?.RESULT;
  const hasAB = abResult === '0' || !!abResult;

  // The ring: shown while the round is open (the reference's TIME_LIMIT ≠ 0).
  const timerOn = hasTimer(game);
  const timerLeft = Number(game.timeLeft) % 60 || 0;

  return (
    <app-video-simple {...attrs} {...host('cvs')}>
      <div {...V} className="videoPlayer">
        {streamUrl ? (
          <div {...V} className="player-container">
            <iframe {...V} width="100%" style={{ aspectRatio: '16 / 9', height: 'auto' }} src={streamUrl} title="video" />
          </div>
        ) : (
          <div {...V} className="player-container d-flex justify-content-center">
            <img {...V} src={asset('loader.gif')} width="75%" style={{ aspectRatio: '16 / 9', height: 'auto' }} alt="" />
          </div>
        )}
        {hasAB && <AndarBahar game={game} cards={cards} result={abResult} />}
        {eventid && !hasAB && (cards.BOARD
          ? (cards.PLAYER_A || cards.PLAYER_B) && <PokerCards cards={cards} />
          : <CardsOverlay game={game} cards={cards} eventid={eventid} />)}
        <div {...V} className="winnerOverlay">
          <div {...V} className={`mini-result-new ${resultDeclared ? 'active' : 'resultRemover'}`}>
            {resultDeclared && <span {...V}> {resultDeclared} win </span>}
          </div>
          {resultDeclared && (
            <span {...V} style={{ position: 'absolute' }}>
              <canvas {...V} width="100vw" height="100vh"></canvas>
            </span>
          )}
        </div>
        <div {...V} className="userCountOverlay">
          {!!userCount && (
            <span {...V} className="userCount">
              <i {...V} className="fa fa-user" aria-hidden="true"></i> {userCount}{' '}
            </span>
          )}
        </div>
        <div {...V} className="timer-overlay">
          {timerOn && (
            <div {...V} className="timer-group" style={{ '--timerValue': `${game.fullTime}s` }}>
              <div {...V} className="timer minute">
                <div {...V} className="hand"><span {...V} className={timerLeft < 6 ? 'spanColorRed' : undefined}></span></div>
                <div {...V} className="hand"><span {...V} className={timerLeft < 6 ? 'spanColorRed' : undefined}></span></div>
              </div>
              <div {...V} className="face">
                <span {...V} className={timerLeft < 6 ? 'heart' : undefined}>
                  <p {...V} id="lazy" className={[timerLeft < 10 && 'singleDigit', Number(game.timeLeft) < 6 && 'heart'].filter(Boolean).join(' ') || undefined}>
                    {' '}{timerLeft}{' '}
                  </p>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </app-video-simple>
  );
}

const Img = ({ r, ...props }) => <img {...V} alt="" ref={r} {...props} />;
// A card not in the feed yet shows face down.
const src = (code) => cardImg(code);
// `width: Npx !important` inline, as the template writes it (React's style
// prop cannot carry !important, and the sheet's own !important widths would win).
const W20 = (el) => el?.style.setProperty('width', '20px', 'important');
const W23 = (el) => el?.style.setProperty('width', '23px', 'important');
const F9 = (el) => el?.style.setProperty('font-size', '9px', 'important');

// The tables whose PLAYER A / PLAYER B / JOKER rows the overlay draws (the
// reference's exclusion list, as it applies to this app's tables).
const NO_PLAYER_ROWS = ['99.0012', '99.0030', '99.0031', '99.0032', '99.0001', '99.0002', '99.0003', '99.0057', '99.0004',
  '99.0042', '99.0005', '99.0006', '99.0014', '99.0009', '99.0018', '99.0019', '99.0020', '99.0022', '99.0023', '99.0040',
  '99.0046', '99.0047', '99.0048', '99.0036', '99.0051'];

const MT = { marginTop: '0.15rem' };

function CardsOverlay({ game, cards, eventid }) {
  const { PLAYER_A: a, PLAYER_B: b, JOKER: joker, DRAGON: dragon, TIGER: tiger, LION: lion, PLAYER: player, BANKER: banker, DEALER: dealer } = cards;
  const raceCards = ['99.0046', '99.0047', '99.0048'].includes(eventid) ? longest([cards.CK, cards.DK, cards.HK, cards.SK]) : [];
  const Q = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
  return (
    <div {...V} className="video-overlay">
      <div {...V}>
        <div {...V} className="round-id">RID: {game.roundId}</div>
        {!NO_PLAYER_ROWS.includes(eventid) && (
          <>
            {joker && (
              <div {...V}>
                <h3 {...V} className="text-white">JOKER</h3>
                <div {...V}><Img src={src(joker.card_1)} /></div>
              </div>
            )}
            {a && (
              <div {...V}>
                <h3 {...V} className="text-white">PLAYER A</h3>
                <div {...V}><Img src={src(a.card_1)} /><Img src={src(a.card_2)} /><Img src={src(a.card_3)} /></div>
              </div>
            )}
            {b && (
              <div {...V}>
                <h3 {...V} className="text-white" style={MT}>PLAYER B</h3>
                <div {...V}><Img src={src(b.card_1)} /><Img src={src(b.card_2)} /><Img src={src(b.card_3)} /></div>
              </div>
            )}
          </>
        )}
        {(eventid === '99.0022' || eventid === '99.0023') && <Card32Rows game={game} cards={cards} />}
        {(eventid === '99.0005' || eventid === '99.0006') && cards.card && (
          <div {...V}>
            <h3 {...V} className="text-white" style={MT}></h3>
            <div {...V}><Img src={src(cards.card)} /></div>
          </div>
        )}
        {raceCards.length !== 0 && (
          <div {...V} className="video-overlay">
            {raceCards.map((c, i) => <Img key={i} className="mt-1 img img-responsive card-img" r={W23} src={src(c)} />)}
          </div>
        )}
        {cards.card_1 && (
          <div {...V} className="video-overlay aa">
            <div {...V}>
              <div {...V}>
                <h3 {...V} className="text-white" ref={F9}>Cards</h3>
                <div {...V} className="d-flex align-items-center">
                  <Img className="card-img" src={src(cards.card_1)} />
                  <Img className="card-img" src={src(cards.card_2)} />
                  <Img className="card-img" src={src(cards.card_3)} />
                </div>
              </div>
            </div>
          </div>
        )}
        {['99.0004', '99.0042', '99.0041'].includes(eventid) && (
          <>
            {dragon && (
              <div {...V}>
                <h3 {...V} className="text-white" style={MT}>Dragon</h3>
                <div {...V}>
                  <Img src={src(dragon.card_1)} />
                  {dragon.card_2 && <Img src={src(dragon.card_2)} />}
                  {dragon.card_3 && <Img src={src(dragon.card_3)} />}
                </div>
              </div>
            )}
            <div {...V}>
              <h3 {...V} className="text-white">Tiger</h3>
              <div {...V}>
                <Img src={src(tiger?.card_1)} />
                {tiger?.card_2 && <Img src={src(tiger.card_2)} />}
                {tiger?.card_3 && <Img src={src(tiger.card_3)} />}
              </div>
            </div>
            {lion && (
              <div {...V}>
                <h3 {...V} className="text-white" style={MT}>Lion</h3>
                <div {...V}>
                  <Img src={src(lion.card_1)} />
                  {lion.card_2 && <Img src={src(lion.card_2)} />}
                  {lion.card_3 && <Img src={src(lion.card_3)} />}
                </div>
              </div>
            )}
          </>
        )}
        {['99.0019', '99.0018', '99.0020'].includes(eventid) && (
          <>
            <div {...V}>
              <h3 {...V} className="text-white" style={MT}>Dragon</h3>
              <div {...V}><Img src={src(dragon?.card_1)} /></div>
            </div>
            <div {...V}>
              <h3 {...V} className="text-white" style={MT}>Tiger</h3>
              <div {...V}><Img src={src(tiger?.card_1)} /></div>
            </div>
          </>
        )}
        {Q.some((q) => cards[q]) && (
          <div {...V} className="video-overlay">
            <div {...V} className="d-flex flex-wrap justify-content-between" style={{ width: isDesktop ? '170px' : '133px' }}>
              {Q.map((q) => (
                <div {...V} key={q}>
                  <h3 {...V} className="text-white" style={{ marginTop: '3px' }}>{q}:</h3>
                  <div {...V}><Img className={`card-img${cards[q] !== '0' ? ' flipCard' : ''}`} src={src(cards[q])} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {['99.0030', '99.0031', '99.0032'].includes(eventid) && (
          <div {...V}>
            <h3 {...V} className="text-white">Card</h3>
            <div {...V}>{cards.card && <Img src={src(cards.card)} />}</div>
          </div>
        )}
        {['99.0001', '99.0002', '99.0003', '99.0036', '99.0057', '99.0027'].includes(eventid) && (
          <>
            {player && eventid !== '99.0027' && (
              <div {...V}>
                <h3 {...V} className="text-white">PLAYER</h3>
                <div {...V}>
                  <Img src={src(player.card_1)} />
                  {player.card_2 && <Img src={src(player.card_2)} />}
                  {player.card_3 !== '0' && player.card_3 && <Img style={{ transform: 'rotate(90deg)', marginLeft: '4px' }} src={src(player.card_3)} />}
                </div>
              </div>
            )}
            {banker && (
              <div {...V}>
                <h3 {...V} className="text-white" style={MT}>BANKER</h3>
                <div {...V}>
                  <Img src={src(banker.card_1)} />
                  <Img src={src(banker.card_2)} />
                  {banker.card_3 !== '0' && banker.card_3 && <Img style={{ transform: 'rotate(90deg)', marginLeft: '4px' }} src={src(banker.card_3)} />}
                </div>
              </div>
            )}
            {dealer && (
              <div {...V}>
                <h3 {...V} className="text-white">DEALER</h3>
                <div {...V}><Img className="card-img" src={src(dealer.card_1)} /></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 32 Cards: each player's running total and the cards it has drawn (one face
// down card until the first).
function Card32Rows({ game, cards }) {
  const count = game.cardCount || { PLAYER_8: 8, PLAYER_9: 9, PLAYER_10: 10, PLAYER_11: 11 };
  const active = game.activeCardPlayer;
  return ['PLAYER_8', 'PLAYER_9', 'PLAYER_10', 'PLAYER_11'].map((k, i) => {
    const list = cards[k] || [];
    return (
      <div {...V} key={k}>
        <h3 {...V} className={`text-warning playerClass${active === k ? ' activeCard' : ''}`} style={i ? MT : undefined}>
          Player {k.slice(7)}:{count[k]}
        </h3>
        {list.length === 0 && (
          <span {...V}><Img className="card-img imgClass" r={W20} src={cardImg('0')} /></span>
        )}
        {list.length > 0 && (
          <div {...V}>
            {list.map((c, j) => <span {...V} key={j}><Img className="card-img imgClass" r={W20} src={src(c)} /></span>)}
          </div>
        )}
      </div>
    );
  });
}

// Poker 20-20: both hands and the board.
function PokerCards({ cards }) {
  const { PLAYER_A: a, PLAYER_B: b, BOARD: board } = cards;
  return (
    <div {...V} className="video-overlay">
      <div {...V} id="game-cards">
        <div {...V} className="card-inner">
          <div {...V} className="row">
            <div {...V} className="col-6">
              <h3 {...V} className="text-white">Player A</h3>
              <div {...V}><Img src={src(a?.card_1)} /><Img src={src(a?.card_2)} /></div>
            </div>
            {b && (
              <div {...V} className="col-6 text-right">
                <h3 {...V} className="text-white text-start ms-1">Player B</h3>
                <Img src={src(b.card_1)} /><Img src={src(b.card_2)} />
              </div>
            )}
          </div>
          <div {...V} className="card-inner">
            <h3 {...V} className="text-white mt-1">Board</h3>
            <div {...V}>
              {[1, 2, 3, 4, 5].map((n) => <Img key={n} src={src(board[`card_${n}`])} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Andar Bahar: the joker, then the Andar and Bahar draws in owl carousels
// (right-to-left, three cards a view).
function AndarBahar({ game, cards, result }) {
  const andar = cards.ANDAR_CARDS || [];
  const bahar = cards.BAHAR_CARDS || [];
  return (
    <div {...V} className="andar-bahir-container">
      <div {...V} className="video-overlay">
        <div {...V} className="round-id mb-1">RID: {game.roundId}</div>
        <div {...V} className={`row align-items-center ${bahar.length === 0 || andar.length === 0 ? 'mt-3' : 'h-83'}`}>
          <div {...V} className="col-1">
            <div {...V} className="row"><div {...V} className="col-12"><p {...V} className="mb-0 text-white"><b {...V} className="text-a"> A </b></p></div></div>
            <div {...V} className="row"><div {...V} className="col-12"><p {...V} className="mb-0 text-white"><b {...V} className="text-b"> B </b></p></div></div>
          </div>
          <div {...V} className="col-2 ps-1">
            <Img className="card-right" r={W23} src={src(result)} />
          </div>
          <div {...V} className="col-7 custom-css-x">
            <div {...V} className="row">
              <div {...V} className="col-12">
                <div {...V} className="crousel"><Owl list={andar} /></div>
                <div {...V} className="crousel mt-2"><Owl list={bahar} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ngx-owl-carousel-o as it lays out customOptions2 in the 80px column: rtl,
// three items a view, 2px margins, < > nav, no dots.
const OWL_WIDTH = 80;
function Owl({ list }) {
  if (!list.length) {
    return <owl-carousel-o {...V}><div className="owl-carousel owl-theme" style={{ display: 'block' }}></div></owl-carousel-o>;
  }
  const items = Math.min(3, list.length);
  const w = Number(((OWL_WIDTH + 2) / items - 2).toFixed(3));
  return (
    <owl-carousel-o {...V}>
      <div className="owl-carousel owl-theme owl-rtl owl-loaded owl-responsive owl-drag">
        <div className="owl-stage-outer">
          <owl-stage>
            <div>
              <div className="owl-stage" style={{ width: `${Math.ceil(list.length * (w + 2))}px`, transform: 'translate3d(0px, 0px, 0px)', transition: 'all' }}>
                {list.map((c, i) => (
                  <div key={i} className={`owl-item${i < items ? ' active' : ''}`} style={{ width: `${w}px`, marginLeft: '2px' }}>
                    <img {...V} className="img img-responsive andrimg" ref={W23} src={src(c)} alt="" />
                  </div>
                ))}
              </div>
            </div>
          </owl-stage>
        </div>
        <div className={`owl-nav${list.length <= items ? ' disabled' : ''}`}>
          <div className="owl-prev disabled"> &lt; </div>
          <div className={`owl-next${list.length <= items ? ' disabled' : ''}`}> &gt; </div>
        </div>
        <div className="owl-dots disabled"></div>
      </div>
    </owl-carousel-o>
  );
}

function longest(lists) {
  let best = [];
  for (const l of lists) if (l?.length > best.length) best = l;
  return best;
}
