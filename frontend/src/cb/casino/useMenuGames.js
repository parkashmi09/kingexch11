import { useQuery } from '@tanstack/react-query';
import { getManagedCasinoGames } from '../../apiservices/casinoManageService';
import { getGamesByCategory } from '../../apiservices/jsGamesService';
import { fromManagedRow, fromJsGamesRow } from './catalog';

// jsGames pages at 100 rows and caps `per_page` there, so a category bigger
// than that needs walking. Two pages covers the crash catalog (~198) with room
// to spare; the loop stops early on a short page anyway.
const JS_PAGE_SIZE = 100;
const JS_MAX_PAGES = 4;

async function fetchJsGamesCategory(category, signal) {
  const rows = [];
  for (let page = 1; page <= JS_MAX_PAGES; page += 1) {
    const res = await getGamesByCategory(category, { page, per_page: JS_PAGE_SIZE, signal });
    const batch = res?.payload?.games || [];
    rows.push(...batch);
    if (batch.length < JS_PAGE_SIZE) break;
  }
  // The pages overlap — asking for page 2 returns rows already seen on page 1 —
  // so the same game would otherwise get two tiles. Keyed on game_uid, first
  // occurrence wins.
  const seen = new Set();
  return rows.filter((g) => {
    const id = g.game_uid || g.id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * A menu's grid, normalised to `catalog.js`'s tile shape whichever backend it
 * came from, so `CasinoMenuPage` never has to know which one it is reading.
 *
 * Both sources are cached by TanStack under their own key, which means the two
 * casino menus that share a source share one request.
 */
export default function useMenuGames(source) {
  const managed = useQuery({
    queryKey: ['casino-manage-games'],
    enabled: source === 'casino-manage',
    queryFn: async ({ signal }) => {
      const res = await getManagedCasinoGames({ signal });
      return res?.success ? res.data || [] : [];
    },
    staleTime: 30_000,
    refetchOnMount: 'always',
  });

  const crash = useQuery({
    queryKey: ['js-games-category', 'crash'],
    enabled: source === 'jsgames-crash',
    queryFn: ({ signal }) => fetchJsGamesCategory('crash', signal),
    staleTime: 60_000,
  });

  if (source === 'jsgames-crash') {
    return {
      games: (crash.data || []).filter((g) => g.is_active !== false).map(fromJsGamesRow),
      isFetching: crash.isFetching,
    };
  }
  return {
    // Owner-disabled tables do not exist as far as these pages are concerned.
    games: (managed.data || []).filter((g) => g.enabled !== false).map(fromManagedRow),
    isFetching: managed.isFetching,
  };
}
