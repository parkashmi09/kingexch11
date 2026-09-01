import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import ProviderCategoryPage from '../components/casino/ProviderCategoryPage';
import { getSlotProviders, getSlotProviderCategories } from '../apiservices/jsGamesService';
import useGameLaunch from '../hooks/useGameLaunch';
import { bToastError } from '../components/BToast';
import slotCatalog from '../data/slotCatalog.json';

// The page is driven by the API: `/games/slot-providers` is the rail and
// `/games/slot-providers/:provider/categories` is that provider's tab strip and
// every tab's games, both already ordered by the owner in
// /admin/game-priority → Slot. Reordering a provider, a tab, or a game there
// reorders this page.
//
// The catalog below is no longer the grid. It survives for two jobs the API
// cannot do yet:
//   1. TILE ART — the API's `art` is still null (slot-page-api.md G4) and
//      `game_icon` is the aggregator's own art, not what this site paints. Art
//      is looked up by game name; a miss just falls back, it cannot misplace a
//      tile the way the old name-matched `game_uid` could.
//   2. THE 18 PROVIDERS WITH NO GROUP (G3) — the rail shows all 33, so the ones
//      the backend has no group for are still listed from here. Each one drops
//      out of this branch by itself the moment a group is created for it.
//
// The art is mirrored locally by `npm run sync-slot-icons`, which reads this
// same file; nothing on the page points at the reference's CDN.
const CATALOG = Object.fromEntries(slotCatalog.providers.map((p) => [p.provider, p]));
const tileSrc = (provider, icon) => `/assets/casino/slot/${provider.iconDir}/${icon}`;

// Match an API game to its local art by name — the two lists spell the same
// games slightly differently ("Fa Fa Fa" vs "FaFaFa", "Amigo WIldLuck"). This
// is now cosmetic only: a miss falls back to another image, it can no longer
// send a Play click to the wrong game.
const nameKey = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// FALLBACK rail, in the reference's order and with its labels. The API supplies
// the providers it has groups for — those win on order, label and id. These
// cover the rest, so the rail keeps showing all 33 while G3 is open, and each
// entry is skipped as soon as the API starts returning that provider.
//
// The `id` is what /slot/:id addresses — these are the LIVE site's own provider
// ids, not a sequence, which is why they jump around (1X2 is 1, Jili is 64).
// They are the URL contract: never renumber one, or existing links break. The
// backend now stores the same numbers (slot_providers.ext_id) and returns them
// as `id`, so for an API provider the number comes from there, not from here.
const REFERENCE_PROVIDERS = [
  { id: 64, provider: 'jili', label: 'Jili' },
  { id: 65, provider: 'amigo', label: 'Amigo' },
  { id: 63, provider: 'turbo-games', label: 'Turbo Games' },
  { id: 24, provider: 'red-tiger', label: 'Red Tiger' },
  { id: 1, provider: '1x2-gaming', label: '1X2 Gaming' },
  { id: 3, provider: 'bb', label: 'BB Games' },
  { id: 4, provider: 'boongo', label: 'Booongo' },
  { id: 58, provider: 'dragoon-soft', label: 'Dragoon Soft' },
  { id: 61, provider: 'pocket-game', label: 'Pocket Game' },
  { id: 8, provider: 'evoplay', label: 'Evoplay' },
  { id: 9, provider: 'fantasma', label: 'Fantasma Games' },
  { id: 11, provider: 'habanero', label: 'Habanero' },
  { id: 12, provider: 'hacksaw', label: 'Hacksaw Gaming' },
  { id: 13, provider: 'iron-dog-studio', label: 'Iron Dog Studio' },
  { id: 14, provider: 'kalamba', label: 'Kalamba Games' },
  { id: 15, provider: 'lady-luck', label: 'Lady Luck' },
  { id: 17, provider: 'nolimit-city', label: 'Nolimit city' },
  { id: 18, provider: 'omi-gaming', label: 'OMI Gaming' },
  { id: 19, provider: 'onetouch', label: 'OneTouch' },
  { id: 21, provider: 'playpearls', label: 'PlayPearls' },
  { id: 22, provider: 'push-gaming', label: 'Push Gaming' },
  { id: 23, provider: 'quickspin', label: 'Quickspin' },
  { id: 26, provider: 'relax-gaming', label: 'Relax Gaming' },
  { id: 27, provider: 'rtg-slots', label: 'RTG Slots' },
  { id: 28, provider: 'spearhead-studios', label: 'Spearhead Studios' },
  { id: 29, provider: 'slotmill', label: 'Slotmill' },
  { id: 30, provider: 'splitrock-gaming', label: 'Splitrock Gaming' },
  { id: 31, provider: 'thunderkick', label: 'Thunderkick' },
  { id: 32, provider: 'woohoo-games', label: 'Woohoo Games' },
  { id: 33, provider: 'yggdrasil', label: 'Yggdrasil' },
  { id: 52, provider: 'virtual-games', label: 'Virtual Games' },
  { id: 99, provider: 'kingmidas', label: 'Kingmidas' },
  { id: 66, provider: 'egt', label: 'EGT' },
];

// What goes in the URL for a provider: its real id, or its slug until we have
// one. Both forms resolve back through the rail's key index.
const routeKey = (p) => (p.id != null ? String(p.id) : p.provider);

export default function SlotHome() {
  const navigate = useNavigate();
  // The URL owns which provider is open: /slot/64 is Jili, and /o_slot (no id)
  // opens the first one. Selecting from the rail navigates rather than setting
  // state, so every provider is a real, shareable, back-button-able address
  // instead of a hidden tab.
  const { providerId } = useParams();

  // Shared with the fantasy and crash grids.
  const { launching, launch } = useGameLaunch();

  // The rail. Owner-ordered providers first, in the order the admin strip sets;
  // the providers with no group yet keep the reference's order behind them.
  const { data: providersRes } = useQuery({
    queryKey: ['slot-providers'],
    queryFn: () => getSlotProviders(),
    staleTime: 60_000,
    retry: false,
  });

  const providers = useMemo(() => {
    // `api: false` for a group with no games yet: the owner can create the group
    // in the panel to start filling it, and until they do the page keeps showing
    // that provider's catalog tiles instead of an empty grid. It flips to the
    // API the moment the group has its first game.
    const fromApi = (providersRes?.payload?.providers || []).map((p) => ({
      id: p.id ?? null,
      provider: p.provider,
      label: p.label,
      api: (p.total_games || 0) > 0,
    }));
    const claimed = new Set((providersRes?.payload?.providers || []).map((p) => p.provider));
    // Until the request lands this is all 33 from the fallback, so the rail is
    // never empty and never reflows from one row to thirty-three.
    return [...fromApi, ...REFERENCE_PROVIDERS.filter((p) => !claimed.has(p.provider)).map((p) => ({ ...p, api: false }))];
  }, [providersRes]);

  const providerByKey = useMemo(() => {
    const map = {};
    for (const p of providers) {
      map[p.provider] = p;
      if (p.id != null) map[String(p.id)] = p;
    }
    return map;
  }, [providers]);

  const activeEntry = providerByKey[providerId] || providers[0] || null;
  const activeProvider = activeEntry?.provider || '';
  const activeProviderLabel = activeEntry?.label ?? '';

  // That provider's tab strip and games. Skipped for a provider the backend has
  // no group for — those still render from the catalog below.
  const { data: categoriesRes, isFetching: categoriesLoading } = useQuery({
    queryKey: ['slot-provider-categories', activeProvider],
    enabled: !!activeEntry?.api,
    queryFn: () => getSlotProviderCategories(activeProvider),
    staleTime: 60_000,
    retry: false,
  });

  // Tile art, indexed by game name within this provider. The API knows which
  // games and in what order; the catalog knows what they look like.
  const artByName = useMemo(() => {
    const entry = CATALOG[activeProvider];
    if (!entry) return null;
    const map = new Map();
    for (const category of entry.categories) {
      for (const game of category.games) {
        const key = nameKey(game.name);
        if (!map.has(key)) map.set(key, { src: tileSrc(entry, game.icon), missingArt: !!game.missingArt });
      }
    }
    return map;
  }, [activeProvider]);

  // Tabs are the provider's OWN categories — Jili shows Slot/Table/Fish/Crash,
  // Amigo shows only New Slots. An empty tab keeps its place and renders an
  // empty grid: the strip states which tabs the provider HAS, and dropping the
  // empty ones would hide part of the reference's strip.
  //
  // Both branches produce the same tile shape, so everything below this is
  // blind to where a provider's games came from.
  const categories = useMemo(() => {
    if (activeEntry?.api) {
      return (categoriesRes?.payload?.categories || []).map((c) => ({
        id: c.slug,
        label: c.label,
        games: (c.games || []).map((g) => {
          const art = artByName?.get(nameKey(g.game_name));
          return {
            key: `g${g.game_id}`,
            name: g.game_name,
            uid: g.game_uid,
            // Local art, else the aggregator's, else the default tile
            src: art?.src || g.game_icon || null,
            missingArt: art ? art.missingArt : !g.game_icon,
          };
        }),
      }));
    }
    const entry = CATALOG[activeProvider];
    return (entry?.categories || []).map((c) => ({
      id: c.id,
      label: c.label,
      games: (c.games || []).map((g, index) => ({
        key: `c${c.id}-${index}`,
        name: g.name,
        // No group, so no launch token — Play says so, as it did before.
        uid: null,
        src: tileSrc(entry, g.icon),
        missingArt: !!g.missingArt,
      })),
    }));
  }, [activeEntry, categoriesRes, activeProvider, artByName]);

  function handleProviderSelect(slug) {
    const p = providerByKey[slug];
    if (p) navigate(`/slot/${routeKey(p)}`);
  }

  // Resolving a launch is the page's job, not the shell's: it owns the auth
  // check and the toasts. Returning null means "handled, do not open a frame".
  // The one shared launch path (loader + demo refusal + real launch) —
  // ProviderCategoryPage renders the returned URL in its iframe.
  async function resolveLaunch(game) {
    return launch(game);
  }

  return (
    <ProviderCategoryPage
      pageClass="slot"
      providers={providers}
      activeProvider={activeProvider}
      activeProviderLabel={activeProviderLabel}
      onSelectProvider={handleProviderSelect}
      categories={categories}
      loading={categoriesLoading}
      onResolveLaunch={resolveLaunch}
      launching={launching}
      searchPlaceholder="Search for Slot"
    />
  );
}
