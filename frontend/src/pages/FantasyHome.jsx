import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProviders, getProviderCategories } from '../apiservices/jsGamesService';
import GameFrame from '../components/casino/GameFrame';
import LoaderSection from '../components/LoaderSection';
import useGameLaunch from '../hooks/useGameLaunch';

// /o_fantasy — provider rail on the left, that provider's games as one grid on
// the right. It looks like the slot page but its markup is NOT the same, so it
// does not go through ProviderCategoryPage:
//
//   * no sub-category tab strip — fantasy providers have one flat list, and the
//     reference renders no `casino-tabs` at all;
//   * no search box;
//   * the rail rows carry an ICON + label (so the panel has no `slot` class,
//     which is what strips rail icons and switches the grid to the tall tile);
//   * tiles are art only — `fancy-play` overlays a play + info icon, there is no
//     `slot-title`, no name and no Play button;
//   * one `#fantacyListTarget .tab-pane.active` holds the whole grid.
//
// Every class here comes from reference/*.css, so this page ships no CSS.
const CATEGORY = 'fantasy';

// Rail icons, mirrored locally (downloaded, never hotlinked). Keyed by the
// provider slug the API returns; the reference's own file for the Kingmidas row
// is capitalised, which is why that one is spelt out rather than derived.
const PROVIDER_ICON_OVERRIDES = { 'kingmidas-fantasy': 'Kingmidas' };
const providerIcon = (slug) =>
  `/assets/casino/fantasy/${PROVIDER_ICON_OVERRIDES[slug] || slug}.png`;

export default function FantasyHome() {
  const navigate = useNavigate();
  // The URL owns which provider is open, exactly as on the slot page: fantasy
  // providers have no numeric id of their own yet, so the segment is the slug.
  const { providerId } = useParams();
  // Shared with the slot and crash grids: loader for >= 1s, then either the
  // game or the reason it did not open.
  const { launching, launch } = useGameLaunch();
  // The opened game, rendered as the reference's overlay over this same page.
  const [open, setOpen] = useState(null);

  const { data: providersRes } = useQuery({
    queryKey: ['providers', CATEGORY],
    queryFn: () => getProviders(CATEGORY),
    staleTime: 60_000,
    retry: false,
  });

  const providers = useMemo(
    () => (providersRes?.payload?.providers || []).map((p) => ({
      id: p.id ?? null,
      provider: p.provider,
      label: p.label,
    })),
    [providersRes],
  );

  const providerByKey = useMemo(() => {
    const map = {};
    for (const p of providers) {
      map[p.provider] = p;
      if (p.id != null) map[String(p.id)] = p;
    }
    return map;
  }, [providers]);

  // An unknown or stale /fantasy/:id opens the first provider rather than
  // erroring — a dead bookmark is normal.
  const activeEntry = providerByKey[providerId] || providers[0] || null;
  const activeProvider = activeEntry?.provider || '';

  const { data: categoriesRes } = useQuery({
    queryKey: ['provider-categories', CATEGORY, activeProvider],
    enabled: !!activeProvider,
    queryFn: () => getProviderCategories(CATEGORY, activeProvider),
    staleTime: 60_000,
    retry: false,
  });

  // One grid, in API order. The endpoint groups by sub-category and fantasy
  // providers currently return a single "all-games" bucket, but the tiles are
  // flattened rather than assuming that: if a provider is ever split into tabs
  // the page keeps showing every game instead of silently dropping the rest.
  const games = useMemo(
    () => (categoriesRes?.payload?.categories || []).flatMap((c) => (c.games || []).map((g) => ({
      key: `g${g.game_id}`,
      name: g.game_name,
      uid: g.game_uid,
      art: g.art || g.game_icon || null,
    }))),
    [categoriesRes],
  );

  function handleProviderSelect(slug) {
    const p = providerByKey[slug];
    if (p) navigate(`/fantasy/${p.id != null ? p.id : p.provider}`);
  }

  async function handlePlay(game) {
    const url = await launch(game);
    if (url) setOpen({ title: game.name, url });
  }

  return (
    <div className={`report-container${launching ? ' loader-section-parent' : ''}`}>
      {launching && <LoaderSection />}
      <div className={`report-box casino-box fancy-page${open ? ' frame-open' : ''}`}>
        <div className="container-fluid container-fluid-5">
          <div className="row row1">
            {/* Provider rail */}
            <div className="col-md-2">
              <div className="facncy-provider">
                <div className="fancy-provider-title d-none-desktop">
                  <a><span>Providers</span> <span></span></a>
                </div>
                <ul className="nav nav-tabs">
                  {providers.map((p) => (
                    <li className="nav-item" key={p.provider}>
                      <a
                        className={`nav-link${p.provider === activeProvider ? ' active' : ''}`}
                        role="button"
                        onClick={() => handleProviderSelect(p.provider)}
                      >
                        <div>
                          <img src={providerIcon(p.provider)} alt={p.label} />
                          <span>{p.label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Games */}
            <div className="col-md-10 tab-content">
              <div id="fantacyListTarget" className="tab-pane active">
                <div className="fancy-provider-title d-none-desktop">
                  <a><span>{activeEntry?.label ?? ''}</span></a>
                </div>
                <div className="casino-banners">
                  {games.map((g) => (
                    <div className="casino-banner-item" key={g.key}>
                      {/* The reference writes href="javascript:void(0)" here,
                          but React 19 refuses to emit a javascript: URL and
                          substitutes a throwing one, so the tile is an anchor
                          with no href instead. Nothing visual hangs on it:
                          bootstrap's a:not([href]) only sets color/underline
                          and `.fancy-play i` colours the icons itself. */}
                      <a role="button" onClick={() => handlePlay(g)}>
                        <div
                          style={{
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center center',
                            paddingTop: '53.33%',
                            backgroundImage: g.art ? `url("${g.art}")` : undefined,
                            backgroundColor: 'black',
                          }}
                        />
                        <div className="fancy-play">
                          <i className="fas fa-play"></i>
                          <i className="fas fa-info-circle fancy-info"></i>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Grid stays mounted underneath — see GameFrame. */}
        {open && (
          <GameFrame title={open.title} src={open.url} onExit={() => setOpen(null)} />
        )}
      </div>
    </div>
  );
}
