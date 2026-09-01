import { useEffect, useState } from 'react';
import { getActiveGames, getGamesByCategory } from '../../apiservices/jsGamesService';
import { getManagedCasinoGames } from '../../apiservices/casinoManageService';
import { fromJsGamesRow, fromManagedRow, isBlankTile } from './catalog';
import { partnerIndex, vendorsFor } from './lobbies';

// jsGames caps a page at 100 however large per_page is asked for.
const PER_PAGE = 100;

// How deep to read a vendor lobby. The reference gets a lobby in one call; here
// a lobby is up to thirty vendors, so the whole-lobby view takes the first page
// of each and a selected partner is read out in full. Int.Casino's partners run
// to 650 games and the grid only ever shows 24 — a deeper read on the ALL tab
// would be dozens of requests nobody sees the result of.
const PAGES_ALL = 1;
const PAGES_PARTNER = 7;

// A jsGames category is one list, so it is read straight through.
const PAGES_CATEGORY = 4;

// Requests go out in waves rather than all at once: Int.Casino's ALL view is
// thirty vendors, and thirty simultaneous XHRs is how you get a stalled tab.
const CONCURRENCY = 6;

async function fetchVendor(vendor, maxPages) {
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await getActiveGames({ vendor, page, per_page: PER_PAGE });
    const games = res?.success ? res.payload?.games || [] : [];
    out.push(...games);
    const total = res?.payload?.pagination?.total ?? out.length;
    if (games.length === 0 || out.length >= total) break;
  }
  return out;
}

async function fetchVendors(vendors, maxPages, alive) {
  const out = [];
  for (let i = 0; i < vendors.length; i += CONCURRENCY) {
    if (!alive()) return out;
    const wave = vendors.slice(i, i + CONCURRENCY);
    const results = await Promise.all(wave.map((v) => fetchVendor(v, maxPages).catch(() => [])));
    out.push(...results.flat());
  }
  return out;
}

// A category's pages are walked with a de-dup, because the endpoint re-serves
// the first page's rows once you run past the end of the list.
async function fetchCategory(category) {
  const seen = new Set();
  const out = [];
  for (let page = 1; page <= PAGES_CATEGORY; page++) {
    const res = await getGamesByCategory(category, { page, per_page: PER_PAGE });
    const games = res?.success ? res.payload?.games || [] : [];
    let added = 0;
    games.forEach((g) => {
      const key = g.game_uid || g.id;
      if (key && !seen.has(key)) {
        seen.add(key);
        out.push(g);
        added += 1;
      }
    });
    if (games.length === 0 || added === 0) break;
  }
  return out;
}

/**
 * The tiles behind one lobby, for the whole lobby or for one partner.
 *
 * Three backends, one shape out (see catalog.js). A vendor lobby re-queries
 * when a partner is picked rather than filtering what is already loaded — the
 * ALL view only holds each vendor's first hundred, so filtering it would
 * quietly hide the rest of a partner's catalogue. The other two sources are a
 * single list, so their partner filter is applied in the page.
 */
export default function useCasinoGames(lobby, partnerId) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lobby) return undefined;

    let cancelled = false;
    const alive = () => !cancelled;

    setLoading(true);
    setGames([]);

    (async () => {
      try {
        let tiles = [];

        if (lobby.source === 'managed') {
          const res = await getManagedCasinoGames();
          const rows = res?.success && Array.isArray(res.data) ? res.data : [];
          tiles = rows.filter((g) => g.enabled !== false).map(fromManagedRow);
        } else if (lobby.source === 'category') {
          const rows = await fetchCategory(lobby.category);
          tiles = rows.filter((g) => g.is_active !== false).map(fromJsGamesRow);
        } else {
          const vendors = vendorsFor(lobby, partnerId);
          if (vendors.length === 0) {
            if (!cancelled) {
              setGames([]);
              setLoading(false);
            }
            return;
          }
          const labels = partnerIndex(lobby);
          const rows = await fetchVendors(
            vendors,
            partnerId ? PAGES_PARTNER : PAGES_ALL,
            alive
          );
          tiles = rows
            .filter((g) => g && g.game_uid)
            .map((g) => ({ ...fromJsGamesRow(g), partner: labels[g.vendor] || '' }));
        }

        if (cancelled) return;

        // Within a partner, tiles that have artwork come first.
        //
        // The grid only ever draws 24, and `game_icon` is an empty string for
        // most of this catalog — Play'n GO ships 516 slots with art on about
        // 40 of them. Left in catalog order the page opens as two dozen
        // identical placeholders, so the ones with a picture are floated to the
        // front of their own partner's block. Nothing is removed: search and
        // the filter strips still see every tile, and this whole sort can go
        // the day game_icon is populated. Array.prototype.sort is stable, so
        // the order the fetch produced survives it.
        const order = lobby.partners.map((p) => p.label);
        tiles.sort(
          (a, b) =>
            order.indexOf(a.partner) - order.indexOf(b.partner) ||
            Number(isBlankTile(a)) - Number(isBlankTile(b))
        );

        setGames(tiles);
      } catch (err) {
        console.error('Casino games api error', err);
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lobby, partnerId]);

  return { games, loading };
}
