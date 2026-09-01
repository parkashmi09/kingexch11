import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import useEntranceGlide from '../hooks/useEntranceGlide';
import { getActiveGames, getGameLaunchURL } from '../apiservices/jsGamesService';
import { getManagedCasinoGames } from '../apiservices/casinoManageService';
import { bToastError } from '../components/BToast';
import { minBalanceMessage } from '../config/casinoGames';

// Default tile art for games without their own image — the reference's own
// default-2.jpeg, served from public/ (downloaded, not hotlinked).
const FALLBACK_TILE_IMG = '/assets/casino/games/default-2.jpeg';

// Stop this many px SHORT of the tabs strip, so the glide doesn't run all the
// way in and a sliver of the panel above the tabs stays visible.
// (Hold + duration live in useEntranceGlide — shared with the casino games.)
const GLIDE_STOP_SHORT_PX = 10;

// Provider tabs whose game list comes from the Casino Manage catalog (owner
// controls visibility + entry threshold per game from the admin panel).
const MANAGED_PROVIDERS = ['vip', 'virtual', 'premium'];

// Our Virtual ships nine tables in the reference, in exactly this order. Our
// catalog carries four more (vbaccarat, vrace17, vdt20, vtrap) — and because
// the category strip is built from whatever the listed games file under, those
// two extra tile_categories add Baccarat and Race tabs the reference has not
// got. This pins the tab to the reference's set and order. Everything ABOUT a
// row still comes from the backend (name, art, route, min balance, enabled) —
// only which of them Our Virtual shows is decided here. Switch the four rows
// off in Casino Manage and this list can go: the strip goes back to being
// purely data-driven.
const VIRTUAL_REFERENCE_GAMES = [
  'vlucky7', 'vtrio', 'vdtl20', 'vteenmuf', 'vaaa', 'vbtable', 'vdt6', 'vteen', 'vteen20',
];

const PROVIDERS = [
  { id: 'our-casino', label: 'Our Casino', icon: '/assets/casino/icons/4.png' },
  { id: 'vip', label: 'Our VIP Casino', icon: '/assets/casino/icons/45.png' },
  { id: 'premium', label: 'Our Premium Casino', icon: '/assets/casino/icons/52.png' },
  { id: 'virtual', label: 'Our Virtual', icon: '/assets/casino/icons/19.png' },
  { id: 'creedroomz', label: 'Creedroomz', icon: '/assets/casino/icons/24.png' },
  { id: 'vivo', label: 'Vivo Gaming', icon: '/assets/casino/icons/21.png' },
  { id: 'evolution', label: 'Evolution', icon: '/assets/casino/icons/5.png' },
  { id: 'ezugi', label: 'EZUGI', icon: '/assets/casino/icons/1.png' },
  { id: 'cockfight', label: 'CockFight', icon: '/assets/casino/icons/6.png' },
  { id: 'winfinity', label: 'WINFINITY', icon: '/assets/casino/icons/42.png' },
  { id: 'jacktop', label: 'Jacktop', icon: '/assets/casino/icons/43.png' },
  { id: 'holi', label: 'Holi', icon: '/assets/casino/icons/holi.png' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Casino', icon: '/assets/casino/tab-icons/35.png' },
  { id: 'roulette', label: 'Roulette', icon: '/assets/casino/tab-icons/31.png' },
  { id: 'teenpatti', label: 'Teenpatti', icon: '/assets/casino/tab-icons/20.png' },
  { id: 'poker', label: 'Poker', icon: '/assets/casino/tab-icons/21.png' },
  { id: 'baccarat', label: 'Baccarat', icon: '/assets/casino/tab-icons/22.png' },
  { id: 'dragontiger', label: 'Dragon Tiger', icon: '/assets/casino/tab-icons/23.png' },
  { id: '32cards', label: '32 Cards', icon: '/assets/casino/tab-icons/24.png' },
  { id: 'andarbahar', label: 'Andar Bahar', icon: '/assets/casino/tab-icons/26.png' },
  { id: 'lucky7', label: 'Lucky 7', icon: '/assets/casino/tab-icons/27.png' },
  { id: '3cardj', label: '3 Card Judgement', icon: '/assets/casino/tab-icons/28.png' },
  { id: 'casinowar', label: 'Casino War', icon: '/assets/casino/tab-icons/29.png' },
  { id: 'worli', label: 'Worli', icon: '/assets/casino/tab-icons/30.png' },
  { id: 'sports', label: 'Sports', icon: '/assets/casino/tab-icons/34.png' },
  { id: 'bollywood', label: 'Bollywood', icon: '/assets/casino/tab-icons/32.png' },
  { id: 'lottery', label: 'Lottery', icon: '/assets/casino/tab-icons/33.png' },
  { id: 'queen', label: 'Queen', icon: '/assets/casino/tab-icons/40.png' },
  { id: 'race', label: 'Race', icon: '/assets/casino/tab-icons/41.png' },
  { id: 'others', label: 'Others', icon: '/assets/casino/tab-icons/73.png' },
];

// Some providers ship their own recolored tab icons — the reference's VIP tab
// strip uses casino-tab-icons/45/*.png (45 = the VIP provider id). Downloaded
// locally, never hotlinked. Providers without an entry keep the shared icons.
const PROVIDER_TAB_ICONS = {
  vip: {
    all: '/assets/casino/tab-icons/45/148.png',
    teenpatti: '/assets/casino/tab-icons/45/149.png',
  },
  virtual: {
    all: '/assets/casino/tab-icons/19/82.png',
    teenpatti: '/assets/casino/tab-icons/19/79.png',
    dragontiger: '/assets/casino/tab-icons/19/80.png',
    lucky7: '/assets/casino/tab-icons/19/81.png',
    bollywood: '/assets/casino/tab-icons/19/91.png',
    others: '/assets/casino/tab-icons/19/96.png',
  },
  premium: {
    all: '/assets/casino/tab-icons/52/159.png',
    teenpatti: '/assets/casino/tab-icons/52/160.png',
    baccarat: '/assets/casino/tab-icons/52/161.png',
    dragontiger: '/assets/casino/tab-icons/52/162.png',
    lucky7: '/assets/casino/tab-icons/52/163.png',
    '32cards': '/assets/casino/tab-icons/52/164.png',
  },
};

// A row's grid tab, with inference when the catalog hasn't stored one (rows
// seeded before tile_category existed return null until the server backfill
// runs). An owner-set value always wins; the keywords only fill the gap so
// "Our VIP Casino" never shows a Teenpatti table under "Others".
const tileCategoryOf = (g) => {
  if (g.tile_category) return g.tile_category;
  const n = `${g.game_type || ''} ${g.name || ''}`.toLowerCase();
  if (/teen/.test(n)) return 'teenpatti';
  if (/dragon|dtl?\d/.test(n)) return 'dragontiger';
  if (/lucky/.test(n)) return 'lucky7';
  if (/baccarat/.test(n)) return 'baccarat';
  if (/32/.test(n)) return '32cards';
  if (/bollywood|btable/.test(n)) return 'bollywood';
  if (/race/.test(n)) return 'race';
  if (/poker/.test(n)) return 'poker';
  if (/roulette/.test(n)) return 'roulette';
  return 'others';
};

// Ordered to match the reference site's "All Casino" grid sequence

function ProviderList({ activeProvider, onSelect }) {
  return (
    <ul className="nav nav-tabs">
      {PROVIDERS.map((p) => (
        <li className="nav-item" key={p.id}>
          <a
            className={`nav-link${activeProvider === p.id ? ' active' : ''}`}
            role="button"
            onClick={() => onSelect(p.id)}
          >
            <div>
              <img src={p.icon} alt={p.label} />
              <span>{p.label}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

// `scrollId` — the reference puts #casino-scroll-tab on the DESKTOP strip only.
// The mobile copy carries no id (both render at once, so a shared id would be a
// duplicate in the document).
function CategoryTabsMenu({ activeCategory, onSelect, categories = CATEGORIES, scrollId = false }) {
  return (
    <div className="casino-tabs-menu">
      <ul id={scrollId ? 'casino-scroll-tab' : undefined} className="nav nav-tabs">
        {categories.map((c) => (
          <li className="nav-item" key={c.id}>
            <a
              className={`nav-link${activeCategory === c.id ? ' active' : ''}`}
              role="button"
              onClick={() => onSelect(c.id)}
            >
              <img src={c.icon} alt={c.label} />
              <span>{c.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GameBanners({ games, onPlay, className = 'casino-banners', isApi = false }) {
  if (games.length === 0) {
    return (
      <div className={className}>
        <p className="p-3 text-muted">No games found.</p>
      </div>
    );
  }
  return (
    <div className={className}>
      {games.map((g, idx) => {
        const key = isApi ? g.id || g.game_uid || idx : g.route || idx;
        // Admin-uploaded art arrives as a data: URI (or a full URL); seeded
        // tiles are bare filenames under /assets/casino/games. Tiles without
        // art fall back to the reference's default casino tile (served
        // locally, downloaded — never hotlinked).
        const hasOwnImg = !!(isApi ? g.game_icon : g.img);
        const localImg = g.img
          ? (/^(data:|https?:)/i.test(g.img) ? g.img : `/assets/casino/games/${g.img}`)
          : FALLBACK_TILE_IMG;
        const imgUrl = isApi ? (g.game_icon || FALLBACK_TILE_IMG) : localImg;
        // Layered like the reference: the API's tile first, then the art this
        // build ships, then the default. CSS skips a layer whose URL fails, so
        // a row whose file is missing on the API host (all 13 virtual tiles
        // today) still shows its real art instead of the grey default. The
        // bundled name is the row's game_type (`vteen` → vteen.jpg); the Our
        // Casino grid stores its files unprefixed (`our-goal2` → goal2.jpg).
        const bundledArt = g.gameType
          ? `/assets/casino/games/${String(g.gameType).replace(/^our-/, '')}.jpg`
          : null;
        // The default stays LAST — a layer earlier in the list paints over the
        // ones behind it, so a row with no img of its own must not put the
        // grey default in front of its bundled art.
        const primaryArt = hasOwnImg ? imgUrl : null;
        // artLocked (Premium, signed out) drops every art layer — the default
        // tile is the whole picture until the user logs in.
        const layers = g.artLocked
          ? [FALLBACK_TILE_IMG]
          : [...new Set([primaryArt, bundledArt, FALLBACK_TILE_IMG].filter(Boolean))];
        const showLabel = isApi || !hasOwnImg;
        const label = isApi ? g.game_name : g.label;

        return (
          <div className="casino-banner-item" key={key} onClick={() => onPlay(g)}>
            <a role="button">
              <div
                style={{
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  paddingTop: '53.33%',
                  backgroundImage: layers.length ? layers.map((u) => `url("${u}")`).join(', ') : undefined,
                  // borderRadius: '8px',
                  backgroundColor: '#222'
                }}
              />
              {showLabel && (
                <div className="game-label-overlay" style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '2px 5px',
                  textAlign: 'center',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px'
                }}>
                  {label}
                </div>
              )}
            </a>
          </div>
        );
      })}
    </div>
  );
}

export default function CasinoHome() {
  const navigate = useNavigate();
  const { user, isAuthenticated, balance } = useSelector(s => s.user);
  const [activeProvider, setActiveProvider] = useState('our-casino');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [launchUrl, setLaunchUrl] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const activeProviderLabel = PROVIDERS.find((p) => p.id === activeProvider)?.label ?? '';

  // Entrance movement (reference): the page opens at the top with the PROVIDERS
  // strip in view, holds for a beat, then glides down to the casino list —
  // `#casinoListTarget`, the same anchor id the reference ships. It settles with
  // the tabs strip ("All Casino / Roulette / …") flush under the search bar; the
  // providers grid and the panel's own title row are scrolled off above.
  //
  // Land the TABS strip under the fixed header, not the panel itself: aligning
  // the panel to y=0 would only look right when the header happens to be exactly
  // as tall as its title row, and `.header` is fixed with a per-breakpoint height
  // (60px / 75px) — so both edges are measured live instead of assumed.
  //
  // The panel lives in the `d-none-desktop` block, so on desktop `offsetParent`
  // is null and the glide is skipped, same as the reference.
  useEntranceGlide(() => {
    const panel = document.getElementById('casinoListTarget');
    if (!panel || panel.offsetParent === null) return null;
    const anchor = panel.querySelector('.casino-tabs') || panel;
    const header = document.querySelector('header.header');
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    // No `from` — this glide starts wherever the page already is and only has
    // to REACH the target; it never forces its way back to the top first.
    return {
      to: window.scrollY + anchor.getBoundingClientRect().top - headerBottom - GLIDE_STOP_SHORT_PX,
    };
  });

  // The Casino Manage catalog drives BOTH the Our Casino grid and the
  // VIP/Virtual/Premium tabs — one query, cached by TanStack. staleTime keeps
  // tab-hopping instant while refetchOnMount 'always' means every visit to
  // /o_casino re-asks the server, so a toggle flipped in the admin panel
  // shows up on the next navigation, not only after a hard refresh.
  const { data: managedGames = [], isFetching: managedFetching } = useQuery({
    queryKey: ['casino-manage-games'],
    queryFn: async ({ signal }) => {
      const res = await getManagedCasinoGames({ signal });
      return res?.success ? res.data || [] : [];
    },
    staleTime: 30_000,
    refetchOnMount: 'always',
  });

  // The catalog refetch is near-instant once cached, which made the page's
  // loader overlay a subliminal flicker (or nothing at all on revisits, since
  // cached data renders immediately). Hold the loader for a beat on every
  // arrival — isFetching covers the real request, the timer guarantees the
  // overlay is actually SEEN, like the reference's list load.
  const MIN_LOADER_MS = 1000;
  const [loaderHold, setLoaderHold] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoaderHold(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);
  const managedLoading = managedFetching || loaderHold;

  const isVendorTab = activeProvider !== 'our-casino' && !MANAGED_PROVIDERS.includes(activeProvider);

  // Vendor (third-party) tabs keep their own query, keyed by tab + category —
  // TanStack caches each combination and cancels superseded requests itself.
  const { data: apiGames = [], isFetching: loading } = useQuery({
    queryKey: ['vendor-casino-games', activeProvider, activeCategory],
    enabled: isVendorTab,
    queryFn: async () => {
      const params = { vendor: activeProvider, page: 1, per_page: 100 };
      if (activeCategory !== 'all') params.game_type = activeCategory;
      const res = await getActiveGames(params);
      return res.success ? res.payload.games || [] : [];
    },
    staleTime: 30_000,
  });

  // Our Casino tiles derive straight from the catalog — no second request and
  // no bundled fallback: the API is the single source. An unreachable backend
  // shows the empty state, same as every other data-driven list here.
  const ourGames = useMemo(() => {
    return managedGames
      .filter((g) => g.category === 'our')
      .filter((g) => g.enabled !== false)
      .map((g) => ({
        label: g.name,
        route: g.route || '',
        img: g.img,
        gameType: g.game_type,
        category: tileCategoryOf(g),
        minBalance: Number(g.min_balance) || 0,
      }));
  }, [managedGames]);
  const ourLoading = managedLoading;

  // Managed FEED-TABLE rows (vip/virtual/premium) keyed by route — the main
  // grid consults this to hide a managed game the owner disabled and to pick
  // up its entry threshold (teen20v1 lives in the Our Casino grid too). 'our'
  // rows are excluded: they ARE the grid, and its enabled filter already
  // happened where ourGames derives from the catalog above.
  const managedByRoute = useMemo(
    () => Object.fromEntries(
      managedGames.filter((g) => g.category !== 'our').map((g) => [g.route, g])
    ),
    [managedGames]
  );

  // The rows a managed provider tab shows — the ONE place that decides it, so
  // the grid and the category strip above it can never disagree.
  const rowsForProvider = useMemo(() => {
    const rows = managedGames.filter(
      (g) => g.category === activeProvider && g.enabled !== false
    );
    if (activeProvider !== 'virtual') return rows;
    const rank = new Map(VIRTUAL_REFERENCE_GAMES.map((t, i) => [t, i]));
    return rows
      .filter((g) => rank.has(g.game_type))
      .sort((a, b) => rank.get(a.game_type) - rank.get(b.game_type));
  }, [managedGames, activeProvider]);

  const visibleGames = useMemo(() => {
    if (MANAGED_PROVIDERS.includes(activeProvider)) {
      // Owner-disabled games don't exist as far as this list is concerned.
      // Tile shape matches the Our Casino grid (label/route/img) so
      // GameBanners renders them identically.
      // Premium keeps its art behind the login: logged out, the reference
      // points every Premium tile at an image path that does not exist, so
      // all seven render as the plain default tile. Sign in and the real art
      // appears. Only Premium does this — VIP and Virtual show their art to
      // everyone.
      const artLocked = activeProvider === 'premium' && !isAuthenticated;
      let games = rowsForProvider
        .map((g) => ({
          label: g.name,
          route: g.route,
          img: g.img,
          gameType: g.game_type,
          artLocked,
          category: tileCategoryOf(g),
          minBalance: Number(g.min_balance) || 0,
        }));
      if (activeCategory !== 'all') games = games.filter((g) => g.category === activeCategory);
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        games = games.filter((g) => g.label.toLowerCase().includes(q));
      }
      return games;
    }

    if (activeProvider !== 'our-casino') {
      if (!search.trim()) return apiGames;
      const q = search.trim().toLowerCase();
      return apiGames.filter(g => (g.game_name || '').toLowerCase().includes(q));
    }

    let games = ourGames;
    // Hide grid tiles whose route the owner disabled in Casino Manage.
    games = games.filter((g) => !g.route || managedByRoute[g.route]?.enabled !== false);
    if (activeCategory !== 'all') games = games.filter((g) => g.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      games = games.filter((g) => g.label.toLowerCase().includes(q));
    }
    return games;
  }, [activeProvider, activeCategory, search, apiGames, ourGames, rowsForProvider, managedByRoute, isAuthenticated]);

  // The category strip shrinks on managed tabs: only "All Casino" plus the
  // tabs this provider's games actually file under — the reference's VIP tab
  // shows exactly All Casino + Teenpatti. Our Casino and vendor tabs keep the
  // full strip.
  const visibleCategories = useMemo(() => {
    if (!MANAGED_PROVIDERS.includes(activeProvider)) return CATEGORIES;
    const present = new Set(rowsForProvider.map(tileCategoryOf));
    // PROVIDER_TAB_ICONS lists each managed tab's categories in the order the
    // reference shows them — Premium puts Lucky 7 before 32 Cards, which the
    // generic CATEGORIES order doesn't. So the icon map doubles as the order;
    // a category with no entry there keeps its CATEGORIES position, after.
    const icons = PROVIDER_TAB_ICONS[activeProvider] || {};
    const refOrder = Object.keys(icons);
    const rank = (id) => {
      const i = refOrder.indexOf(id);
      return i === -1 ? refOrder.length + CATEGORIES.findIndex((c) => c.id === id) : i;
    };
    return CATEGORIES
      .filter((c) => c.id === 'all' || present.has(c.id))
      .map((c) => (icons[c.id] ? { ...c, icon: icons[c.id] } : c))
      .sort((a, b) => rank(a.id) - rank(b.id));
  }, [activeProvider, rowsForProvider]);

  // Which loader applies depends on the tab: Our Casino and the managed tabs
  // each have their own request
  const showLoader = activeProvider === 'our-casino'
    ? ourLoading
    : MANAGED_PROVIDERS.includes(activeProvider) ? managedLoading : loading;

  function handleProviderSelect(id) {
    setActiveProvider(id);
    setActiveCategory('all');
    setSearch('');
  }

  async function handleGamePlay(game) {
    // Display-only tile (reference ships it as href="javascript:void(0);") —
    // never navigate, or the catch-all redirect eats the history entry
    if (activeProvider === 'our-casino' && !game.route) return;

    if (!isAuthenticated) {
      bToastError('Please login to access!');
      return;
    }

    if (activeProvider === 'our-casino' || MANAGED_PROVIDERS.includes(activeProvider)) {
      // Entry threshold — the balance the header shows has to cover it.
      // Checked here so the user is told at the tile rather than landing on
      // the table and being bounced straight back out. Owner-set numbers
      // only: the feed-table row wins, otherwise the tile's own catalog
      // value; no static config anywhere.
      const managed = managedByRoute[game.route];
      const need = managed != null
        ? Number(managed.min_balance) || 0
        : game.minBalance || 0;
      if (need > 0 && Number(balance || 0) < need) {
        bToastError(minBalanceMessage(need));
        return;
      }
      navigate(game.route);
      return;
    }

    try {
      const userId = user?.user_id || user?.id;

      const res = await getGameLaunchURL({
        game_uid: game.game_uid,
        user_id: userId,
        credit_amount: String(balance || 0),
        currency_code: 'INR',
        language: 'en'
      });

      if (res.success && (res.payload?.game_launch_url || res.data?.game_launch_url)) {
        const url = res.payload?.game_launch_url || res.data?.game_launch_url;
        setLaunchUrl(url);
        setSelectedGame(game);
      } else {
        alert(res.msg || res.error || 'Failed to launch game');
      }
    } catch (err) {
      console.error('Launch error:', err);
      alert('Error launching game');
    }
  }

  return (
    <div className={`casino-list-container center-container${showLoader ? ' loader-section-parent' : ''}`}>
      {/* Full-page loader OVERLAY while the game list is in flight — the
          reference adds `loader-section-parent` to this container and drops a
          `loader-section` in as its first child (control.css: position fixed,
          full viewport, translucent, z-index 1000). The page skeleton keeps
          rendering underneath with empty lists, exactly as the reference does,
          rather than the tiles' own box being replaced by a spinner. */}
      {showLoader && (
        <div className="loader-section">
          <div>
            <img src="/assets/animate/loader-ten.gif" alt="loader" />
          </div>
        </div>
      )}
      {launchUrl ? (
        <div className="container-fluid" style={{ padding: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            background: '#016ad5',
            color: 'white',
            fontWeight: 'bold'
          }}>
            <span style={{ fontSize: '16px' }}>{selectedGame?.game_name || 'Game'}</span>
            <button
              onClick={() => { setLaunchUrl(null); setSelectedGame(null); }}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              EXIT
            </button>
          </div>
          <iframe
            src={launchUrl}
            style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none' }}
            title="Game Window"
            allowFullScreen
          />
        </div>
      ) : (
        <div>
          <div className="report-box casino-box fancy-page">
            {/* ── Desktop layout — visible only ≥ 1280px ── */}
            <div className="container-fluid container-fluid-5 d-none-mobile">
              <div className="row row1">
                {/* Provider sidebar */}
                <div className="col-md-2">
                  <div className="facncy-provider">
                    <ProviderList activeProvider={activeProvider} onSelect={handleProviderSelect} />
                  </div>
                </div>

                {/* Content */}
                <div className="col-md-10 tab-content">
                  <div className={`casino-tabs${searchOpen ? ' is-search' : ''}`}>
                    <CategoryTabsMenu activeCategory={activeCategory} onSelect={setActiveCategory} categories={visibleCategories} scrollId />
                    <div className={`casino-search${searchOpen ? ' open-search' : ''}`} onClick={() => !searchOpen && setSearchOpen(true)}>
                      <input
                        type="text"
                        placeholder="Search for Casino"
                        className="form-control"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onBlur={() => { if (!search) setSearchOpen(false); }}
                      />
                      <div className="search-icon" onClick={(e) => { e.stopPropagation(); setSearchOpen(prev => !prev); if (searchOpen) setSearch(''); }}>
                        <i className="fas fa-search"></i>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane active">
                    {/* No inline spinner — the overlay above covers the page.
                        While loading the grid is an EMPTY box (reference), not
                        the "No games found" empty state, which would flash the
                        wrong message for the whole request. */}
                    {showLoader ? (
                      <div className="casino-banners" />
                    ) : (
                      <GameBanners
                        games={visibleGames}
                        onPlay={handleGamePlay}
                        isApi={activeProvider !== 'our-casino' && !MANAGED_PROVIDERS.includes(activeProvider)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile layout — visible only < 1280px ── */}
            <div className="d-none-desktop">
              {/* Provider strip */}
              <div className="facncy-provider">
                <div className="fancy-provider-title">
                  <a role="button"><span>Providers</span> <span></span></a>
                </div>
                <ProviderList activeProvider={activeProvider} onSelect={handleProviderSelect} />
              </div>

              {/* Content panel */}
              <div id="casinoListTarget" className="fancy-provider-list">
                <div className="fancy-provider-title">
                  <a role="button">
                    <span>{activeProviderLabel}</span>
                    <div className={`casino-search${searchOpen ? ' open-search' : ''}`} onClick={() => !searchOpen && setSearchOpen(true)}>
                      <input
                        type="text"
                        placeholder="Search for Casino"
                        className="form-control"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onBlur={() => { if (!search) setSearchOpen(false); }}
                      />
                      <div className="search-icon" onClick={(e) => { e.stopPropagation(); setSearchOpen(prev => !prev); if (searchOpen) setSearch(''); }}>
                        <i className="fas fa-search" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="casino-tabs">
                  <CategoryTabsMenu activeCategory={activeCategory} onSelect={setActiveCategory} categories={visibleCategories} />
                </div>
                {/* Empty grid while loading — the overlay covers the page */}
                {showLoader ? (
                  <div className="casino-banners-fancy all" />
                ) : (
                  <GameBanners
                    games={visibleGames}
                    onPlay={handleGamePlay}
                    className="casino-banners-fancy all"
                    isApi={activeProvider !== 'our-casino' && !MANAGED_PROVIDERS.includes(activeProvider)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
