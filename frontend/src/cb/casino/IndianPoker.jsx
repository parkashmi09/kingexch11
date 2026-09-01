import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { common } from '../assets';
import { getManagedCasinoGames } from '../../apiservices/casinoManageService';
import { cbToastError } from '../toast';
import { minBalanceMessage } from '../../config/casinoGames';
import useViewportWidth from '../useViewport';
import { PARTNERS, GAME_TYPES, tileArt, FALLBACK_TILE_IMG } from './catalog';
import FilterStrip from './FilterStrip';
import CategoryModal from './CategoryModal';

// The reference paints ten placeholder tiles while its list is in flight.
const SKELETON_TILES = Array.from({ length: 10 }, (_, i) => i);

// `react-loading-skeleton`'s markup, written out rather than depended on: the
// package is not installed, but clickbet.css already carries its stylesheet
// (base #EBEBEB, highlight #F5F5F5, 1.5s sweep), so one span is the whole thing.
function Skeleton({ height }) {
  return <span className="react-loading-skeleton" style={{ height, width: '100%' }}>&zwnj;</span>;
}

/** One tile: skeleton until its art loads, then the art and its hover overlay. */
function GameTile({ game, onPlay }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="wac-20">
      <div className="wacmain-box" onClick={() => onPlay(game)}>
        {!loaded && <Skeleton height={212} />}
        <img
          loading="lazy"
          alt={game.name}
          src={tileArt(game)}
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
 * The Indian Poker page.
 *
 * Layout is a transcription of the reference's casino category page (`FV` in
 * its bundle, driven by its `$i.INDIANPOKER` config): the `indianpoker.webp`
 * strip, a provider pill row, the search box with its Category button, a
 * game-type pill row, and the `wac-20` tile grid with the Play overlay. Every
 * class it uses is already in clickbet.css, including the `.wac-20` breakpoint
 * that turns the six-across desktop grid into three-across on a phone — so the
 * phone and desktop layouts both come from reproducing the markup.
 *
 * Both pill rows carry the reference's own labels, fixed rather than derived
 * from the data — RVGAMES / INDIAN POKER II / INDIAN POKER / MAC88 above, Live
 * Casino / Table Games / Slot / Crash Games below. The games behind them are
 * THIS platform's own tables (the Casino Manage catalog), because the
 * reference's Indian Poker set comes from partners this backend does not carry.
 * Each pill is therefore pinned to its label and given a predicate over our
 * catalog; the mapping lives in `catalog.js`, in one table.
 *
 * Logged out, the page renders in full — the reference only withholds a grid on
 * its `providers_lobby` menus, and Indian Poker is a `providers` menu. It is the
 * tile that is gated: a click with no session opens the login modal, exactly as
 * the reference does it, by clicking the header's `#loginBtn`.
 */
function IndianPoker() {
  const navigate = useNavigate();
  const { isAuthenticated, balance } = useSelector((s) => s.user);

  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const width = useViewportWidth();

  const { data: rows = [], isFetching } = useQuery({
    queryKey: ['casino-manage-games'],
    queryFn: async ({ signal }) => {
      const res = await getManagedCasinoGames({ signal });
      return res?.success ? res.data || [] : [];
    },
    staleTime: 30_000,
    refetchOnMount: 'always',
  });

  // Owner-disabled tables do not exist as far as this page is concerned.
  const games = useMemo(() => rows.filter((g) => g.enabled !== false), [rows]);

  // Both rows are the reference's fixed pills, always rendered — NOT derived
  // from what our catalog happens to hold. Each pill carries its own predicate
  // (see catalog.js); a pill with no games behind it shows an empty grid rather
  // than disappearing, because the row has to read the same as the reference's.
  const providers = PARTNERS;
  const categories = GAME_TYPES;

  // Same filter chain as the reference, in the same order: partner, then game
  // type, then the search box.
  const shown = useMemo(() => {
    let list = games;
    if (provider) {
      const p = PARTNERS.find((x) => x.id === provider);
      if (p) list = list.filter(p.match);
    }
    if (category) {
      const c = GAME_TYPES.find((x) => x.id === category);
      if (c) list = list.filter(c.match);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) => (g.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [games, provider, category, search]);

  // The reference caps its grid at 24 tiles with nothing to page past them,
  // which suits its ~20-game set. Ours runs to 100-odd tables, so the cap is
  // dropped rather than making three quarters of the catalog unreachable. The
  // grid renders identically either way.

  const onPlay = (game) => {
    if (!isAuthenticated) {
      // What the reference does, and our header ships the same button id.
      const loginBtn = document.getElementById('loginBtn');
      if (loginBtn) loginBtn.click();
      else cbToastError('Please login to access!');
      return;
    }
    if (!game.route) return;
    // Entry threshold, checked at the tile so the user is told here rather than
    // landing on the table and being bounced straight back out.
    const need = Number(game.min_balance) || 0;
    if (need > 0 && Number(balance || 0) < need) {
      cbToastError(minBalanceMessage(need));
      return;
    }
    navigate(game.route);
  };

  const banner = (
    <div className="casino-content-page rcl">
      <div className="row">
        <div className="sportbook-livecasino">
          <div className="text-center innerbanner">
            <img alt="Banner" src={common('innerpagebanner/indianpoker.webp')} />
          </div>
        </div>
      </div>
    </div>
  );

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
                <GameTile key={game.id} game={game} onPlay={onPlay} />
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

export default IndianPoker;
