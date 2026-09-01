import { useEffect, useState } from 'react';
import { getActiveGames } from '../../apiservices/jsGamesService';
import { partnerIndex, vendorsFor } from './lobbies';

// jsGames caps a page at 100 however large per_page is asked for.
const PER_PAGE = 100;

// How deep to read. The reference gets a lobby in one call; here a lobby is up
// to thirty vendors, so the whole-lobby view takes the first page of each and a
// selected partner is read out in full. Int.Casino's partners run to 650 games,
// and the grid only ever shows 24 — a deeper read on the ALL tab would be
// dozens of requests nobody sees the result of.
const PAGES_ALL = 1;
const PAGES_PARTNER = 7;

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

async function fetchAll(vendors, maxPages, alive) {
  const out = [];
  for (let i = 0; i < vendors.length; i += CONCURRENCY) {
    if (!alive()) return out;
    const wave = vendors.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      wave.map((v) => fetchVendor(v, maxPages).catch(() => []))
    );
    out.push(...results.flat());
  }
  return out;
}

/**
 * The games behind one lobby, for the whole lobby or for one partner.
 *
 * Selecting a partner re-queries rather than filtering what is already loaded:
 * the ALL view only holds each vendor's first hundred, so filtering it would
 * quietly hide the rest of a partner's catalogue.
 *
 * Every game is tagged with the `partner` label it renders under, so the strip
 * has something to match on without knowing the vendor list itself.
 */
export default function useCasinoGames(lobby, partner) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lobby) return undefined;

    let cancelled = false;
    const alive = () => !cancelled;
    const vendors = vendorsFor(lobby, partner);
    const labels = partnerIndex(lobby);

    setLoading(true);
    setGames([]);

    if (vendors.length === 0) {
      setLoading(false);
      return () => { cancelled = true; };
    }

    (async () => {
      try {
        const all = await fetchAll(vendors, partner ? PAGES_PARTNER : PAGES_ALL, alive);
        if (cancelled) return;
        setGames(
          all
            .filter((g) => g && g.game_uid)
            .map((g) => ({ ...g, partner: labels[g.vendor] || '' }))
        );
      } catch (err) {
        console.error('Casino games api error', err);
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [lobby, partner]);

  return { games, loading };
}
