import { useEffect, useState } from 'react';
import { getActiveGames } from '../../apiservices/jsGamesService';

// jsGames caps a page at 100 however large per_page is, so a vendor with more
// than that needs following pages. The reference asks its provider endpoint
// once and takes what comes back; here one lobby is several vendors, so the
// pages are walked and merged before the grid sees them.
const PER_PAGE = 100;
const MAX_PAGES = 5;

const asPartner = (vendor) => String(vendor || '').toUpperCase();

async function fetchVendor(vendor) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await getActiveGames({ vendor, page, per_page: PER_PAGE });
    const games = res?.success ? res.payload?.games || [] : [];
    out.push(...games);
    const total = res?.payload?.pagination?.total ?? out.length;
    if (out.length >= total || games.length === 0) break;
  }
  return out;
}

/**
 * Every game in one lobby, plus the two filter strips it needs.
 *
 * Games arrive sorted by their partner's position in the lobby's `partners`
 * list — the reference's own ordering — and each is given a `partner` (the
 * vendor, upper-cased, which is what the strip matches on) so the grid can
 * filter without re-reading the vendor field's casing.
 */
export default function useCasinoGames(lobby) {
  const [games, setGames] = useState([]);
  const [gameTypes, setGameTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lobby) return undefined;
    let alive = true;
    setLoading(true);
    setGames([]);
    setGameTypes([]);

    (async () => {
      try {
        const results = await Promise.all(lobby.vendors.map((v) => fetchVendor(v)));
        if (!alive) return;

        const all = results
          .flat()
          .filter((g) => g && g.game_uid)
          .map((g) => ({ ...g, partner: asPartner(g.vendor) }))
          .sort(
            (a, b) => lobby.partners.indexOf(a.partner) - lobby.partners.indexOf(b.partner)
          );

        const types = [];
        all.forEach((g) => {
          if (g.game_type && !types.includes(g.game_type)) types.push(g.game_type);
        });

        setGames(all);
        setGameTypes(types);
      } catch (err) {
        console.error('Casino games api error', err);
        if (alive) {
          setGames([]);
          setGameTypes([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [lobby]);

  return { games, gameTypes, loading };
}
