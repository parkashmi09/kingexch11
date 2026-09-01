import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import Swal from 'sweetalert2';
import { getGameLaunchURL } from '../../apiservices/jsGamesService';
import { isDemoUser } from '../../utils/demoStore';
import { FALLBACK_TILE, LOBBIES, lobbyBanner, tileSrc } from '../casino/lobbies';
import useCasinoGames from '../casino/useCasinoGames';
import CategoryModal from '../casino/CategoryModal';

// The reference draws exactly this many tiles and never draws more — its
// infinite-scroll handler reads a property off `undefined` and throws on the
// first scroll, so the grid it ships is a fixed page of 24.
const PAGE_SIZE = 24;

// Ten placeholder cards, the same count the reference's skeleton grid uses.
const SKELETON_CARDS = Array.from({ length: 10 });

/** The horizontal filter strip, with its fade arrows. Used for both rows. */
function FilterStrip({ items, active, onPick, scrollRef }) {
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflows = el.scrollWidth > el.clientWidth;
    setLeft(overflows && el.scrollLeft > 0);
    setRight(overflows && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, [scrollRef]);

  useEffect(() => {
    const id = setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', measure);
    };
  }, [measure, items]);

  const nudge = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -750 : 750, behavior: 'smooth' });
    setTimeout(measure, 300);
  };

  return (
    <div
      className={`game-type-container position-relative prl5 ${left ? 'show-left-fade' : ''} ${right ? 'show-right-fade' : ''}`}
    >
      {left && (
        <button className="game-type-arrow game-type-arrow-left" onClick={() => nudge('left')}>
          <i className="fa fa-chevron-left" />
        </button>
      )}
      <div className="wacfilter-box-scroll" ref={scrollRef} onScroll={measure}>
        <div className="align-items-center d-flex mt-2 wacfilter-box flex-nowrap">
          <div className={`mr-1 ${active === '' ? 'active' : ''}`} onClick={() => onPick('')}>
            ALL
          </div>
          {items.map((item) => (
            <div
              key={item}
              className={`mr-1 ${active === item ? 'active' : ''}`}
              onClick={() => onPick(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      {right && (
        <button className="game-type-arrow game-type-arrow-right" onClick={() => nudge('right')}>
          <i className="fa fa-chevron-right" />
        </button>
      )}
    </div>
  );
}

/**
 * A casino lobby — /casino/LIVECASINO and its siblings.
 *
 * Banner, a provider strip, search beside a Category button, a game-type strip,
 * then the tile grid. Clicking a tile opens the game in an iframe that replaces
 * the lobby, with a cross to come back.
 *
 * Two notes on the mapping to tenexch's catalog:
 *
 * - The reference classifies a game on three axes — partner, gameType and
 *   category — and gives each its own control. tenexch has two: `vendor` and
 *   `game_type`. So the provider strip is the vendor, and the game-type strip
 *   and the Category dialog are two ways into the same game-type filter. Both
 *   controls are here because both are in the reference; they share one state
 *   so they can never disagree.
 * - Tiles use the catalog's own `game_icon`, which is a full CDN URL. The
 *   reference builds its tile path from a game id it owns the art for; ours
 *   does not exist for these games, so the URL is used as it comes and a
 *   missing one falls back to the placeholder.
 */
function CasinoLobby({ lobbyId }) {
  // The lobbies are routed one path at a time rather than as /casino/:id —
  // tenexch's own 81 in-house table pages live under /casino/<gtype>, and a
  // param route here would swallow every one of them. `lobbyId` is the route's
  // own id; useParams is the fallback for any path that does carry one.
  const { id: paramId } = useParams();
  const id = lobbyId || paramId;
  const navigate = useNavigate();
  const lobby = LOBBIES[id];
  const { user, isAuthenticated, balance } = useSelector((s) => s.user);

  const { games, gameTypes, loading } = useCasinoGames(lobby);

  const [provider, setProvider] = useState('');
  const [gameType, setGameType] = useState('');
  const [search, setSearch] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [loaded, setLoaded] = useState({});

  const [launching, setLaunching] = useState(false);
  const [frameUrl, setFrameUrl] = useState('');

  const providerRef = useRef(null);
  const typeRef = useRef(null);

  // A fresh lobby starts with every filter cleared, the way the reference
  // resets them whenever :id changes.
  useEffect(() => {
    setProvider('');
    setGameType('');
    setSearch('');
    setFrameUrl('');
  }, [id]);

  // An id no lobby claims is not a page — the reference sends it home.
  useEffect(() => {
    if (!lobby) navigate('/', { replace: true });
  }, [lobby, navigate]);

  const launch = async (game) => {
    if (!isAuthenticated) {
      document.getElementById('loginBtn')?.click();
      return;
    }
    if (isDemoUser(user) && localStorage.getItem('token') === 'demo-token') {
      Swal.fire({
        title: 'Info',
        text: 'Demo accounts are not allowed to play real games. Please register an account to access this feature.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    window.scrollTo(0, 0);
    setLaunching(true);
    let url = '';
    try {
      const res = await getGameLaunchURL({
        game_uid: game.game_uid,
        user_id: user?.user_id || user?.id,
        credit_amount: String(balance || 0),
        currency_code: 'INR',
        language: 'en',
      });
      if (res?.success) url = res.payload?.game_launch_url || res.data?.game_launch_url || '';
    } catch (err) {
      console.error('Game launch error', err);
    } finally {
      setLaunching(false);
    }

    if (url) {
      setFrameUrl(url);
      return;
    }
    Swal.fire({
      title: 'Unable to launch game',
      text: 'This game is currently unavailable. Please try again from the casino lobby.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  };

  if (!lobby) return null;

  const filtered = games
    .filter((g) => !provider || g.partner === provider)
    .filter((g) => !gameType || g.game_type === gameType)
    .filter((g) => !search || g.game_name?.toLowerCase().includes(search.toLowerCase()));
  const shown = filtered.slice(0, PAGE_SIZE);

  if (launching) {
    return (
      <div className="roulette-gif">
        <img alt="" src="/casino/banner/roulette.gif" className="roulette-gif-img" />
      </div>
    );
  }

  if (frameUrl) {
    return (
      <div className="casino-content-page">
        <div className="row">
          <div
            onClick={() => setFrameUrl('')}
            style={{ position: 'absolute', width: '30px', textAlign: 'center' }}
          >
            <i className="fa fa-times popup-cross" />
          </div>
          <iframe
            key="iframe"
            title="iframe"
            style={{ height: '84vh', width: '100%', border: '0px' }}
            src={frameUrl}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="casino-content-page">
        <div className="row">
          <div className="sportbook-livecasino">
            <div className="text-center innerbanner">
              <img src={lobbyBanner(lobby)} alt="Banner" />
            </div>
          </div>
          <div className="container">
            <div className=" mt-2 mb-2 featured-game1 wac-min-height wac-width-100">
              {SKELETON_CARDS.map((_, i) => (
                <div className="wac-20" key={i}>
                  <div className="wacmain-box wacmain-box-border">
                    <Skeleton height={200} className="img-fluid" />
                    <Skeleton height={30} count={1} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="casino-content-page">
        <div className="row">
          <div className="sportbook-livecasino">
            <div className="text-center innerbanner">
              <img alt="" src={lobbyBanner(lobby)} />
            </div>
          </div>
        </div>
      </div>

      <div className="casino-content-page">
        <div className="row">
          <div className="container-fluid">
            {lobby.partners.length > 0 && (
              <div className="row">
                <div className="col-12 ">
                  <FilterStrip
                    items={lobby.partners}
                    active={provider}
                    onPick={setProvider}
                    scrollRef={providerRef}
                  />
                </div>
              </div>
            )}

            <div className="row">
              <div
                className={`newsearchbox col-12 ${lobby.partners.length > 0 && window.innerWidth > 768 ? '' : 'mt5'}`}
              >
                <div className="newsearchbox_search prl5">
                  <div className="p-relative">
                    <span>
                      <i className="fa fa-search" aria-hidden="true" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="formGroupExampleInput"
                      placeholder="Search"
                      name="searchGame"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="newsearchbox_category prl5">
                  <div className="catbtn" onClick={() => setShowCategories(true)}>
                    Category
                  </div>
                </div>
              </div>
            </div>

            {gameTypes.length > 0 && (
              <div className="row">
                <div className="col-12">
                  <FilterStrip
                    items={gameTypes}
                    active={gameType}
                    onPick={setGameType}
                    scrollRef={typeRef}
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

            <div className="mt-2 mb-2 featured-game1 wac-min-height wac-width-100 cb-casino-grid">
              {shown.map((game) => (
                <div className="wac-20" key={game.game_uid}>
                  <div className="wacmain-box" onClick={() => launch(game)}>
                    {!loaded[game.game_uid] && <Skeleton height={212} width="100%" />}
                    <img
                      loading="lazy"
                      alt={game.game_name}
                      src={tileSrc(game)}
                      className={`img-fluid ${loaded[game.game_uid] || ''}`}
                      onLoad={() => setLoaded((p) => ({ ...p, [game.game_uid]: true }))}
                      onError={(e) => {
                        if (e.currentTarget.src.indexOf(FALLBACK_TILE) === -1) {
                          e.currentTarget.src = FALLBACK_TILE;
                          return;
                        }
                        setLoaded((p) => ({ ...p, [game.game_uid]: true }));
                      }}
                    />
                    {loaded[game.game_uid] && (
                      <div className="slots__bg">
                        <div className="slots__overlay">
                          <a className="b2clogin btn-default" title={game.game_name}>
                            Play
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCategories && (
        <CategoryModal
          categories={gameTypes}
          selected={gameType}
          onSelect={setGameType}
          onClose={() => setShowCategories(false)}
        />
      )}
    </>
  );
}

export default CasinoLobby;
