import { useState, useMemo, useEffect } from 'react';
import useEntranceGlide from '../../hooks/useEntranceGlide';
import GameFrame from './GameFrame';
import LoaderSection from '../LoaderSection';

// The shell shared by every "provider rail → tab strip → tile grid" page:
// /o_slot and /o_fantasy today, any other category the owner groups tomorrow.
//
// It owns only presentation and the three pieces of state that are purely local
// to it — the search box, which tab is open, and the launch iframe. WHAT to show
// is entirely the caller's job: it hands over an ordered provider list, the open
// provider's tabs, and a launch resolver. That split is what lets Slot keep its
// catalog-art lookup and its 18 fallback providers without any of it leaking in
// here, and lets Fantasy be a plain API reader.

// A handful of tiles have no art on the reference's own host either — Turbo
// Games' Bubbles and Wicket Blast 404 there, and the reference falls back to
// this default for them. Applied ONLY to games flagged `missingArt`, never as a
// second background layer under every tile: the art is `background-size:
// contain`, so a layer behind it would show through the letterbox gutters of
// every non-square tile instead of the black the reference paints there.
const FALLBACK_TILE_IMG = '/assets/casino/games/default-2.jpeg';

// Every grid tab uses the same icon in the reference — casino-tab-icons/slot.png,
// downloaded locally, never hotlinked.
const TAB_ICON = '/assets/casino/tab-icons/slot.png';

// Stop this many px SHORT of the tabs strip, so the entrance glide leaves a
// sliver of the providers panel visible. Same number the casino list uses.
const GLIDE_STOP_SHORT_PX = 10;

// The reference's provider rail carries no icons on these pages — just the
// label, wrapped in the same div/span the casino rail uses for its icon + label.
function ProviderList({ providers, activeProvider, onSelect }) {
  return (
    <ul className="nav nav-tabs">
      {providers.map((p) => (
        <li className="nav-item" key={p.provider}>
          <a
            className={`nav-link${activeProvider === p.provider ? ' active' : ''}`}
            role="button"
            onClick={() => onSelect(p.provider)}
          >
            <div>
              <span>{p.label}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

// `scrollId` — the reference puts #slot-scroll-tab on the DESKTOP strip only.
// The mobile copy carries no id (both render at once, so a shared id would be a
// duplicate in the document).
function CategoryTabsMenu({ categories, activeCategory, onSelect, scrollId = false }) {
  return (
    <div className="casino-tabs-menu">
      <ul id={scrollId ? 'slot-scroll-tab' : undefined} className="nav nav-tabs">
        {categories.map((c) => (
          <li className="nav-item" key={c.id}>
            <a
              className={`nav-link${activeCategory === c.id ? ' active' : ''}`}
              role="button"
              onClick={() => onSelect(c.id)}
            >
              <img src={TAB_ICON} alt={c.label} />
              <span>{c.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// These tiles differ from the casino grid's: the art is `contain` on black at a
// 75% box (the vendors' icons are not a uniform crop), and the name sits BELOW
// it in a `.slot-title` row next to a Play button, instead of in an overlay.
function GameTiles({ games, onPlay, loading = false, className = 'casino-banners' }) {
  if (games.length === 0) {
    // An in-flight request is an empty grid, not "no games" — the reference
    // never flashes that message while a provider is opening.
    return (
      <div className={className}>
        {!loading && <p className="p-3 text-muted">No games found.</p>}
      </div>
    );
  }
  return (
    <div className={className}>
      {/* The reference repeats some tiles (Turbo Games lists Crystal Poker,
          Dice Thrice and Donny King in both its featured row and its
          alphabetical run), so the key has to carry the position too. */}
      {games.map((g, idx) => (
        <div className="casino-banner-item" key={`${g.key}-${idx}`}>
          <div
            style={{
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              paddingTop: '75%',
              backgroundColor: 'black',
              backgroundImage: `url("${g.missingArt ? FALLBACK_TILE_IMG : g.src}")`,
            }}
          />
          <div className="slot-title">
            <div>{g.name}</div>
            <div className="btn" role="button" onClick={() => onPlay(g)}>
              Play
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProviderCategoryPage({
  pageClass = 'slot',
  providers,
  activeProvider,
  activeProviderLabel = '',
  onSelectProvider,
  categories,
  loading = false,
  onResolveLaunch,
  // Owned by the page's useGameLaunch — drives the reference's loader-section
  // overlay while a tile is opening.
  launching = false,
  searchPlaceholder = 'Search',
}) {
  // Only the user's explicit tab click lives in state. Which tab is ACTUALLY
  // active is derived below, so the first category is selected on the very first
  // render — storing it and fixing it up in an effect meant one frame with no
  // active tab and an empty grid.
  const [chosenCategory, setChosenCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [launchUrl, setLaunchUrl] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  // Entrance movement (reference): the page opens with the PROVIDERS rail in
  // view, holds, then glides down to the game list — `#fancyListTarget`, the
  // same anchor id the reference ships on this page. The panel lives in the
  // `d-none-desktop` block, so on desktop `offsetParent` is null and the glide
  // is skipped, same as the reference.
  useEntranceGlide(() => {
    const panel = document.getElementById('fancyListTarget');
    if (!panel || panel.offsetParent === null) return null;
    const anchor = panel.querySelector('.casino-tabs') || panel;
    const header = document.querySelector('header.header');
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    return {
      to: window.scrollY + anchor.getBoundingClientRect().top - headerBottom - GLIDE_STOP_SHORT_PX,
    };
  });

  // The active tab: the user's pick when this provider actually has it,
  // otherwise the provider's FIRST tab — which is what the reference shows on
  // arrival at every provider.
  const activeCategory = categories.some((c) => c.id === chosenCategory)
    ? chosenCategory
    : (categories[0]?.id ?? null);

  // A search typed for one provider means nothing on the next, and the tab pick
  // doesn't carry either (two providers can both have a "3REEL" tab, but the
  // reference still opens each provider on its own first tab). Both reset on the
  // URL-derived provider, so back/forward resets them too.
  useEffect(() => {
    setSearch('');
    setSearchOpen(false);
    setChosenCategory(null);
  }, [activeProvider]);

  const visibleGames = useMemo(() => {
    const cat = categories.find((c) => c.id === activeCategory);
    if (!cat) return [];
    if (!search.trim()) return cat.games;
    const q = search.trim().toLowerCase();
    return cat.games.filter((g) => g.name.toLowerCase().includes(q));
  }, [categories, activeCategory, search]);

  async function handlePlay(game) {
    const url = await onResolveLaunch(game);
    if (!url) return;
    setLaunchUrl(url);
    setSelectedGame(game);
  }

  // Both the desktop and the mobile copy of the search box drive the same
  // state — only one of them is on screen at a time.
  const searchBox = (
    <div
      className={`casino-search${searchOpen ? ' open-search' : ''}`}
      onClick={() => !searchOpen && setSearchOpen(true)}
    >
      <input
        type="text"
        placeholder={searchPlaceholder}
        className="form-control"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => { if (!search) setSearchOpen(false); }}
      />
      <div
        className="search-icon"
        onClick={(e) => { e.stopPropagation(); setSearchOpen(prev => !prev); if (searchOpen) setSearch(''); }}
      >
        <i className="fas fa-search" />
      </div>
    </div>
  );

  return (
    <div className={`casino-list-container center-container${launching ? ' loader-section-parent' : ''}`}>
      {launching && <LoaderSection />}
      <div>
        {/* `slot` on the panel is what re-skins the provider rail (icon-less,
            text-only rows) and switches the grid to the slot tile — see
            `.slot .facncy-provider li` in reference/responsive.css. */}
        <div className={`report-box casino-box fancy-page ${pageClass}${launchUrl ? ' frame-open' : ''}`}>
          {/* ── Desktop layout — visible only ≥ 1280px ── */}
          <div className="container-fluid container-fluid-5 d-none-mobile">
            <div className="row row1">
              {/* Provider rail */}
              <div className="col-md-2">
                <div className="facncy-provider">
                  <ProviderList providers={providers} activeProvider={activeProvider} onSelect={onSelectProvider} />
                </div>
              </div>

              {/* Content */}
              <div className="col-md-10 tab-content">
                <div className={`casino-tabs${searchOpen ? ' is-search' : ''}`}>
                  <CategoryTabsMenu
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelect={setChosenCategory}
                    scrollId
                  />
                  {searchBox}
                </div>
                <div className="tab-pane active">
                  <GameTiles games={visibleGames} onPlay={handlePlay} loading={loading} />
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
              <ProviderList providers={providers} activeProvider={activeProvider} onSelect={onSelectProvider} />
            </div>

            {/* Content panel */}
            <div id="fancyListTarget" className="fancy-provider-list">
              <div className="fancy-provider-title">
                <a role="button">
                  <span>{activeProviderLabel}</span>
                  {searchBox}
                </a>
              </div>
              <div className="casino-tabs">
                <CategoryTabsMenu
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelect={setChosenCategory}
                />
              </div>
              <GameTiles
                games={visibleGames}
                onPlay={handlePlay}
                loading={loading}
                className="casino-banners-fancy"
              />
            </div>
          </div>
          {/* Grid stays mounted underneath — see GameFrame. */}
          {launchUrl && (
            <GameFrame
              title={selectedGame?.name || 'Game'}
              src={launchUrl}
              onExit={() => { setLaunchUrl(null); setSelectedGame(null); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
