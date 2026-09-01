import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import Swal from 'sweetalert2';
import { getGameLaunchURL } from '../../apiservices/jsGamesService';
import { minBalanceMessage } from '../../config/casinoGames';
import { isDemoUser } from '../../utils/demoStore';
import { FALLBACK_TILE, LOBBIES, lobbyBanner } from '../casino/lobbies';
import CategoryModal from '../casino/CategoryModal';
import FilterStrip from '../casino/FilterStrip';
import GameFrame, { LaunchSpinner } from '../casino/GameFrame';
import useCasinoGames from '../casino/useCasinoGames';
import useViewportWidth from '../useViewport';

// The reference draws exactly this many tiles and never draws more — its
// infinite-scroll handler reads a property off `undefined` and throws on the
// first scroll, so the grid it ships is a fixed page of 24.
const PAGE_SIZE = 24;

// Ten placeholder cards, the same count the reference's skeleton grid uses.
const SKELETON_CARDS = Array.from({ length: 10 });

/** One tile. Its own component so each can track its own image state. */
function GameTile({ game, onPlay }) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const src = broken ? FALLBACK_TILE : game.art;

  // An image already in cache finishes loading before React attaches onLoad, so
  // that handler never fires and the tile would sit on its skeleton for good —
  // with no `.slots__bg` mounted, which silently costs it the hover overlay
  // too. Reading `complete` when the node mounts covers the cached case; onLoad
  // still covers the rest.
  const imgRef = useCallback((node) => {
    if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div className="wac-20">
      <div className="wacmain-box" onClick={() => onPlay(game)}>
        {!loaded && <Skeleton height={212} width="100%" />}
        {/* Not `loading="lazy"`, though the reference marks these lazy. The
            grid is inserted after its fetch resolves, and Chrome only re-tests
            a deferred image on scroll, resize or a layout pass — so a lobby
            that loads and is then left alone keeps every tile deferred
            forever. Measured: 0 of 24 loaded ten seconds after a clean load,
            all of them in the viewport. It is 24 images; fetch them. */}
        <img
          ref={imgRef}
          alt={game.name}
          src={src}
          className={`img-fluid ${loaded || ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => (broken ? setLoaded(true) : setBroken(true))}
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
 * A casino lobby — every one of the reference's six, off one config.
 *
 * Banner, a provider strip, search beside a Category dialog, a game-type strip,
 * then the tile grid. A third-party game opens in a frame that replaces the
 * lobby; one of this platform's own tables navigates to its route.
 *
 * On the mapping to tenexch's catalog: the reference classifies a game on three
 * axes — partner, gameType and category — and gives each its own control. Ours
 * has two, and one of them barely varies, so both pill rows carry the
 * reference's own labels and cb/casino/taxonomy.js decides what lands on each.
 * See docs/BACKEND-GAPS.md.
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
  const width = useViewportWidth();
  const { user, isAuthenticated, balance } = useSelector((s) => s.user);

  const [provider, setProvider] = useState('');
  const [gameType, setGameType] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [frameUrl, setFrameUrl] = useState('');

  // A vendor lobby re-queries when a partner is picked; the other sources are
  // one list, so they filter in place.
  const requeries = !lobby || lobby.source === 'vendor';
  const { games, loading } = useCasinoGames(lobby, requeries ? provider : '');

  // A fresh lobby starts with every filter cleared, the way the reference
  // resets them whenever the menu changes.
  useEffect(() => {
    setProvider('');
    setGameType('');
    setCategory('');
    setSearch('');
    setFrameUrl('');
  }, [id]);

  // An id no lobby claims is not a page — the reference sends it home.
  useEffect(() => {
    if (!lobby) navigate('/', { replace: true });
  }, [lobby, navigate]);

  const play = async (game) => {
    if (!isAuthenticated) {
      const btn = document.getElementById('loginBtn');
      if (btn) btn.click();
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

    // One of this platform's own tables: check the owner's entry threshold and
    // navigate, rather than asking the aggregator for a URL.
    if (game.launch?.kind === 'route') {
      if (!game.launch.route) return;
      if (game.minBalance && Number(balance || 0) < game.minBalance) {
        Swal.fire({
          title: 'Insufficient balance',
          text: minBalanceMessage(game.minBalance),
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
      navigate(game.launch.route);
      return;
    }

    window.scrollTo(0, 0);
    setLaunching(true);
    let url = '';
    try {
      const res = await getGameLaunchURL({
        game_uid: game.launch?.gameUid,
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

  // A pill can be a link to the lobby that actually holds that kind of game,
  // rather than a filter that would select nothing here.
  const pick = (list, setter) => (value) => {
    const hit = list.find((x) => x.id === value);
    if (hit?.goTo) {
      navigate(hit.goTo);
      return;
    }
    setter(value);
  };

  const matches = (list, value) => (g) => {
    const hit = list.find((x) => x.id === value);
    return hit?.match ? hit.match(g) : true;
  };

  const filtered = games
    .filter((g) => (requeries || !provider ? true : matches(lobby.partners, provider)(g)))
    .filter((g) => (gameType ? matches(lobby.gameTypes, gameType)(g) : true))
    .filter((g) => (category ? matches(lobby.categories, category)(g) : true))
    .filter((g) => !search || g.name?.toLowerCase().includes(search.toLowerCase()));
  const shown = filtered.slice(0, PAGE_SIZE);

  if (launching) return <LaunchSpinner />;
  if (frameUrl) return <GameFrame url={frameUrl} onClose={() => setFrameUrl('')} />;

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
                    value={provider}
                    onSelect={pick(lobby.partners, setProvider)}
                    keyPrefix="prv"
                  />
                </div>
              </div>
            )}

            <div className="row">
              <div
                className={`newsearchbox col-12 ${
                  lobby.partners.length > 0 && width > 768 ? '' : 'mt5'
                }`}
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

            {lobby.gameTypes.length > 0 && (
              <div className="row">
                <div className="col-12">
                  <FilterStrip
                    items={lobby.gameTypes}
                    value={gameType}
                    onSelect={pick(lobby.gameTypes, setGameType)}
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

            <div className="mt-2 mb-2 featured-game1 wac-min-height wac-width-100 cb-casino-grid">
              {shown.map((game) => (
                <GameTile key={game.key} game={game} onPlay={play} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCategories && (
        <CategoryModal
          categories={lobby.categories}
          value={category}
          onSelect={pick(lobby.categories, setCategory)}
          onClose={() => setShowCategories(false)}
        />
      )}
    </>
  );
}

export default CasinoLobby;
