import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { common } from '../assets';
import { cbToastError } from '../toast';
import { minBalanceMessage } from '../../config/casinoGames';
import useViewportWidth from '../useViewport';
import { getGameLaunchURL } from '../../apiservices/jsGamesService';
import { FALLBACK_TILE_IMG } from './catalog';
import { MENUS } from './menus';
import useMenuGames from './useMenuGames';
import FilterStrip from './FilterStrip';
import CategoryModal from './CategoryModal';
import GameFrame, { LaunchSpinner } from './GameFrame';
import './casino-tiles.css';

// The reference paints ten placeholder tiles while its list is in flight.
const SKELETON_TILES = Array.from({ length: 10 }, (_, i) => i);

// `react-loading-skeleton`'s markup, written out rather than depended on: the
// package is not installed, but clickbet.css already carries its stylesheet
// (base #EBEBEB, highlight #F5F5F5, 1.5s sweep), so one span is the whole thing.
function Skeleton({ height, className = '' }) {
  return (
    <span className={`react-loading-skeleton ${className}`} style={{ height, width: '100%' }}>
      &zwnj;
    </span>
  );
}

/** One tile: skeleton until its art loads, then the art and its hover overlay. */
function GameTile({ game, onPlay }) {
  const [loaded, setLoaded] = useState(false);

  // An image already in cache finishes loading before React attaches onLoad, so
  // that handler never fires and the tile would sit on its skeleton for good —
  // with no `.slots__bg` mounted, which silently costs it the hover overlay too.
  // Reading `complete` when the node mounts covers the cached case; onLoad still
  // covers the rest.
  const imgRef = useCallback((node) => {
    if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div className="wac-20">
      {/* `--tile-art` feeds the blurred backdrop that fills the card behind the
          art — see casino-tiles.css. Set here because only the tile knows its
          own image. */}
      <div
        className="wacmain-box"
        style={{ '--tile-art': `url(${game.art})` }}
        onClick={() => onPlay(game)}
      >
        {!loaded && <Skeleton className="cb-tile-skeleton" />}
        <img
          ref={imgRef}
          loading="lazy"
          alt={game.name}
          src={game.art}
          className="img-fluid"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            // One retry against the shared default, then give up and reveal the
            // tile anyway — a missing file must not leave a permanent skeleton.
            if (e.currentTarget.src.endsWith(FALLBACK_TILE_IMG)) setLoaded(true);
            else e.currentTarget.src = FALLBACK_TILE_IMG;
          }}
        />
        {loaded && (
          <div className="slots__bg">
            <div className="slots__overlay">
              <a className="b2clogin btn-default" title={game.name}>
                Play
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A casino menu page — Indian Poker, Aviator, and the four still to come.
 *
 * One component for all of them, as the reference does it: its `FV` serves all
 * six of its casino menus off a config keyed on the route param, and `menus.js`
 * is that config here. Adding CHICKENROAD, LIVECASINO, INTERNATIONALCASINO or
 * SLOT is an entry there plus a route, not another page.
 *
 * The layout is transcribed from that component: the innerpagebanner strip, a
 * partner pill row, the search box with its Category button, a game-type pill
 * row, the search summary, and the `wac-20` tile grid with the Play overlay.
 * Every class it uses is already in clickbet.css — including the `.wac-20`
 * breakpoint that turns the six-across desktop grid into three-across on a
 * phone — so phone and desktop both come from reproducing the markup.
 *
 * Both pill rows carry the reference's own labels, fixed rather than derived
 * from the data; `menus.js` pairs each with a predicate over our games and
 * documents where that pairing is real and where it is only a label.
 *
 * Logged out the page renders in full, as the reference's does for a
 * `providers` menu — it only withholds a grid on `providers_lobby`. The gate is
 * on the tile.
 */
function CasinoMenuPage({ menu }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, balance } = useSelector((s) => s.user);
  const config = MENUS[menu];

  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [frameUrl, setFrameUrl] = useState('');
  const width = useViewportWidth();

  const { games, isFetching } = useMenuGames(config.source);

  const providers = config.partners;
  const categories = config.gameTypes;

  // Same filter chain as the reference, in the same order: partner, then game
  // type, then the search box.
  const shown = useMemo(() => {
    let list = games;
    if (provider) {
      const p = providers.find((x) => x.id === provider);
      if (p) list = list.filter(p.match);
    }
    if (category) {
      const c = categories.find((x) => x.id === category);
      if (c) list = list.filter(c.match);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    return list;
  }, [games, providers, categories, provider, category, search]);

  // The reference caps its grid at 24 tiles with nothing to page past them,
  // which suits its ~20-game menus. Ours run to 100-odd tables and ~200 crash
  // titles, so the cap is dropped rather than making most of them unreachable.
  // The grid renders identically either way.

  const onPlay = async (game) => {
    if (!isAuthenticated) {
      // What the reference does, and our header ships the same button id.
      const loginBtn = document.getElementById('loginBtn');
      if (loginBtn) loginBtn.click();
      else cbToastError('Please login to access!');
      return;
    }

    if (game.launch.kind === 'route') {
      if (!game.launch.route) return;
      // Entry threshold, checked at the tile so the user is told here rather
      // than landing on the table and being bounced straight back out.
      if (game.minBalance > 0 && Number(balance || 0) < game.minBalance) {
        cbToastError(minBalanceMessage(game.minBalance));
        return;
      }
      navigate(game.launch.route);
      return;
    }

    // Third-party game: fetch a launch URL and open it in the frame, behind the
    // reference's spinner.
    setLaunching(true);
    try {
      const res = await getGameLaunchURL({
        game_uid: game.launch.gameUid,
        user_id: user?.user_id || user?.id,
        credit_amount: String(balance || 0),
        currency_code: 'INR',
        language: 'en',
      });
      const url = res?.payload?.game_launch_url || res?.data?.game_launch_url;
      if (res?.success && url) setFrameUrl(url);
      else cbToastError(res?.msg || res?.error || 'This game is currently unavailable.');
    } catch {
      cbToastError('This game is currently unavailable.');
    } finally {
      setLaunching(false);
    }
  };

  const banner = (
    <div className="casino-content-page rcl">
      <div className="row">
        <div className="sportbook-livecasino">
          <div className="text-center innerbanner">
            <img alt="Banner" src={common(`innerpagebanner/${config.banner}`)} />
          </div>
        </div>
      </div>
    </div>
  );

  if (launching) return <LaunchSpinner />;

  if (frameUrl) return <GameFrame url={frameUrl} onClose={() => setFrameUrl('')} />;

  if (isFetching && games.length === 0) {
    return (
      <>
        {banner}
        <div className="casino-content-page rcl">
          <div className="row">
            <div className="container">
              <div className=" mt-2 mb-2 featured-game1 wac-min-height wac-width-100">
                {SKELETON_TILES.map((i) => (
                  <div className="wac-20" key={i}>
                    <div className="wacmain-box wacmain-box-border">
                      <Skeleton height={200} />
                      <Skeleton height={30} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {banner}
      <div className="casino-content-page rcl">
        <div className="row">
          <div className="container-fluid">
            {providers.length > 0 && (
              <div className="row">
                <div className="col-12 ">
                  <FilterStrip
                    items={providers}
                    value={provider}
                    onSelect={setProvider}
                    keyPrefix="prv"
                  />
                </div>
              </div>
            )}

            <div className="row">
              {/* `mt5` only when the provider row above is absent — otherwise
                  that row already supplies the gap. */}
              <div
                className={`newsearchbox col-12 ${providers.length > 0 && width > 768 ? '' : 'mt5'}`}
              >
                <div className="newsearchbox_search prl5">
                  <div className="p-relative">
                    <span>
                      <i className="fa fa-search" aria-hidden="true"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      name="searchGame"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="newsearchbox_category prl5">
                  <div className="catbtn" onClick={() => setCatOpen(true)}>
                    Category
                  </div>
                </div>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="row">
                <div className="col-12">
                  <FilterStrip
                    items={categories}
                    value={category}
                    onSelect={setCategory}
                    keyPrefix="gmty"
                  />
                </div>
              </div>
            )}

            {search !== '' && (
              <div className="mt-4 prl5 wacsearch-result">
                <div className="waccasino-search-result">
                  <h2 className="waccasino-search-title">Results for &quot;{search}&quot;</h2>
                  <p className="waccasino-search-count">
                    {' '}
                    {shown.length !== 0 ? shown.length : 'No data found'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-2 mb-2 featured-game1 wac-min-height wac-width-100">
              {shown.map((game) => (
                <GameTile key={game.key} game={game} onPlay={onPlay} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {catOpen && (
        <CategoryModal
          categories={categories}
          value={category}
          onSelect={(id) => {
            setCategory(id);
            setCatOpen(false);
          }}
          onClose={() => setCatOpen(false)}
        />
      )}
    </>
  );
}

export default CasinoMenuPage;
