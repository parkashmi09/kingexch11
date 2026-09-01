import { useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { TAB_SPORT_MAP } from '../hooks/home/useHomeLoad';

export const DEFAULT_TAB = 'inplay';

/**
 * The home board's active sport, kept in the URL as `?sport=<tab>`.
 *
 * The reference gives each sport a route of its own; tenexch renders every
 * sport through the one home board, so the selection lives in a query param
 * instead. Putting it in the URL (rather than in a context) is what lets the
 * header, the sidebar and the sport-name buttons all drive the same board
 * without a shared provider — and it survives a refresh and a back button.
 *
 * Returns [tab, setTab, explicit]:
 *   tab      — the board to render, a key of TAB_SPORT_MAP (or 'inplay')
 *   setTab   — select a sport
 *   explicit — the same key ONLY when the URL actually names one, else null.
 *
 * The two differ on the bare home page, and the nav highlight depends on the
 * difference: '/' renders the In-Play board but is not the In-Play *page*, so
 * nothing in the nav is highlighted for it — which is exactly what the
 * reference does (its Home is active there and In-Play is not, because In-Play
 * is a route of its own that we don't have).
 */
export function useSportTab() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const raw = params.get('sport');
  const explicit = raw && (raw === DEFAULT_TAB || TAB_SPORT_MAP[raw]) ? raw : null;
  const tab = explicit || DEFAULT_TAB;

  const setTab = useCallback(
    (next) => {
      // Sport selection is only meaningful on the home board — picking one from
      // any other page navigates there, which is what the reference's per-sport
      // routes do too.
      const to = next === DEFAULT_TAB ? '/' : `/?sport=${next}`;
      navigate(to, { replace: pathname === '/' });
    },
    [navigate, pathname]
  );

  return [tab, setTab, explicit];
}
