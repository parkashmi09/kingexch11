import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host } from '../ng';
import { kx } from '../assets';
import { MENU, LOBBY } from '../casino/lobby';
import { isDesktop } from '../exchange';
import { goToCasino } from '../casino/launch';

const K = ng('koc');

// The reference's popular tab is a filter of the whole lobby, not a menu id.
const POPULAR = '1';

const isAndroid = navigator.userAgent.includes('Android');

const image = (url) => (/^https?:/.test(url) ? url : kx(`casino/${url}`));

/**
 * app-old-casino — the casino block: the dashboard's, and the whole of
 * /livecasino. Its tabs swap the tiles in place, the picked one scrolled to the
 * middle of the bar. Logged out, a tile asks for the age confirmation
 * (`onLocked`), as the reference does. Logged in, it launches the game
 * (see ../casino/launch).
 */
export default function OldCasino({ C, onLocked, root }) {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [tab, setTab] = useState(POPULAR);
  const menuRef = useRef(null);
  const tiles = LOBBY.filter(([menu, , , popular]) => (tab === POPULAR ? popular : menu === tab));

  const pick = (id, i) => {
    setTab(id);
    const bar = menuRef.current;
    const item = bar?.querySelectorAll('.menu-item')[i];
    if (bar && item) bar.scrollTo({ behavior: 'smooth', left: item.offsetLeft - (bar.clientWidth - item.clientWidth) / 2 });
  };
  const col = `col col-4 col-md-3 col-sm-3 col-xl-3 pointer prl-5px${isAuth ? ' 11' : ''}${isDesktop ? '' : ' ps-1 pr-6px'}`;

  return (
    <app-old-casino {...C} {...host('koc')} {...root}>
      <div {...K} className="position-relative mobile-men">
        <ul {...K} id="menuListId" className="menu-list" ref={menuRef}>
          {MENU.map((t, i) => (
            <li {...K} key={t.id} id={`sportsBar${i}`} className={`menu-item${tab === t.id ? ' active' : ''}`} onClick={() => pick(t.id, i)}>
              <div {...K}>
                <span {...K} className="menutext orange-nav-ic-txt"> {t.name} </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div {...K} className="main-con">
        <div {...K} className={`row home${isAndroid ? ' isAndroid' : ''}`}>
          {/* Keyed by position, as the reference tracks them: a tab switch keeps each
              tile and swaps its image, the old one showing until the new loads. */}
          {tiles.map((t, i) => (
            <div {...K} key={i} className={col} onClick={isAuth ? undefined : onLocked}>
              <div {...K} className="casinoicons" onClick={isAuth ? () => goToCasino(t[4], navigate) : undefined}>
                <a {...K}>
                  <img {...K} className="img-fluid" src={image(t[2])} alt="" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </app-old-casino>
  );
}
