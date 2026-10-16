import { useNavigate } from 'react-router-dom';
import { ng, host } from '../../ng';
import { kx } from '../../assets';
import { LOBBY } from '../../casino/lobby';
import { goToCasino } from '../../casino/launch';
import { setCasinoMenuOpen } from './CasinoRoom';

const M = ng('ccm');

// The reference's casinoLobbyList is the exchange's lobby with two more
// International tables; its Dream Catcher art is the provider's own.
const EXTRA = { 'Live Lobby': ['Mini Roulette', 'https://media.ttfileserver.com/355/spribe/300x300/15007.png', '15007'], TVBet: ['Chicken Live', 'https://media.ttfileserver.com/373/elcasino/300x300/46153.png', '46153'] };
const ART = { '88.0020': 'https://media.ttfileserver.com/413/evolutionWC/300x300/8755.png' };
const image = (eventId, url) => ART[eventId] || (/^https?:/.test(url) ? url : kx(`casino/${url}`));
const TABLES = LOBBY.flatMap(([, name, url, , eventId]) => {
  const row = { eventName: name, url: image(eventId, url), eventId };
  const extra = EXTRA[name];
  return extra ? [row, { eventName: extra[0], url: extra[1], eventId: extra[2] }] : [row];
});

/**
 * app-casino-menu of the casino site: the orange games panel the room's gear
 * opens over the sports rail — every lobby table (dealer art, the reference's
 * fixed "ALONDA" caption, name, PLAY). PLAY opens that table and closes the
 * panel; × closes it; the home button goes back to the casino lobby.
 */
export default function CasinoMenu({ attrs }) {
  const navigate = useNavigate();
  const close = () => setCasinoMenuOpen(false);

  return (
    <app-casino-menu {...attrs} {...host('ccm')}>
      <div {...M} className="menu-container">
        <div {...M} id="mySidepanel" className="sidepanel style-zogPE">
          <a {...M} href="/" className="homebtn" onClick={(e) => { e.preventDefault(); close(); navigate('/livecasino'); }}>
            <i {...M} id="style-A2mcW" className="fa fa-home style-A2mcW"></i>
          </a>
          <a {...M} href="javascript:void(0)" className="closebtn" onClick={close}> × </a>
          <div {...M} className="col-md-12 row table_list mb-3">
            {TABLES.map((t) => (
              <div key={t.eventId} {...M} className="col-lg-12 col-sm-12">
                <div {...M} className="table_box">
                  <div {...M} className="photo">
                    {t.url && <img {...M} alt="Dealer Image" id="dealerImage" src={t.url} />}
                    <p {...M} id="dealerID"> ALONDA </p>
                  </div>
                  <div {...M} className="table_con">
                    <div {...M} className="road_frame">
                      <div {...M} id="divBigRoad" className="gamehall_road">
                        <div {...M} className="history">
                          <h4 {...M}>{` ${t.eventName} `}</h4>
                        </div>
                      </div>
                    </div>
                    <ul {...M} className="road_play">
                      <li {...M}>
                        <a {...M} href="javascript:void(0)" id="redirect" onClick={() => { goToCasino(t.eventId, navigate); close(); }}>
                          {' PLAY '}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </app-casino-menu>
  );
}
