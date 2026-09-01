import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { getGameLaunchURL } from '../apiservices/jsGamesService';
import { bToastError } from '../components/BToast';

// ONE launch path for every game tile — slot, fantasy and crash all call this
// instead of keeping their own near-identical copy. Three pages had drifted
// apart on the toast wording, on whether a demo account was checked at all, and
// on what happened to the loader; a tile behaving differently depending on which
// list you opened it from was the bug that fixing this removes.
//
// What a click does, in order:
//   1. signed out           -> "Please login to access!", nothing else happens
//   2. loader for >= 1s     -> the reference shows its loader-section over the
//                              panel before anything else appears
//   3. DEMO account         -> the reference's own refusal toast, no request
//   4. real account         -> POST /jsGamesv2/launch, caller opens the URL
//
// The loader is a MINIMUM, not a fixed delay: a real launch waits for the
// request too, so a slow upstream keeps the loader up instead of flashing it.
export const DEMO_LAUNCH_MESSAGE = 'Sorry for inconvience! USE Real ID to play all these games.';
const LOADER_MIN_MS = 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Demo mode is a sentinel token, never sent upstream — the same test the axios
// client, the header and the bet slips already use.
const isDemoAccount = () =>
  typeof window !== 'undefined' && localStorage.getItem('token') === 'demo-token';

/**
 * @returns {{ launching: boolean, launch: (game: {uid?: string, name?: string}) => Promise<string|null> }}
 *   `launching` drives the page's loader-section; `launch` resolves to the game
 *   URL, or null when there is nothing to open (signed out, demo, or an error —
 *   each of which has already told the user why).
 */
export default function useGameLaunch() {
  const [launching, setLaunching] = useState(false);
  const { user, isAuthenticated, balance } = useSelector((s) => s.user);

  const launch = useCallback(async (game) => {
    if (!isAuthenticated) {
      bToastError('Please login to access!');
      return null;
    }

    setLaunching(true);
    const held = sleep(LOADER_MIN_MS);
    try {
      if (isDemoAccount()) {
        await held;
        bToastError(DEMO_LAUNCH_MESSAGE);
        return null;
      }

      // A tile the catalog knows about but the aggregator has no token for.
      if (!game?.uid) {
        await held;
        bToastError('This game is not available right now.');
        return null;
      }

      const [res] = await Promise.all([
        getGameLaunchURL({
          game_uid: game.uid,
          user_id: user?.user_id || user?.id,
          credit_amount: String(balance || 0),
          currency_code: 'INR',
          language: 'en',
        }),
        held,
      ]);

      const url = res?.payload?.game_launch_url || res?.data?.game_launch_url;
      if (res?.success && url) return url;
      bToastError(res?.msg || res?.error || 'Failed to launch game');
    } catch (err) {
      console.error('Game launch error:', err);
      await held;
      bToastError('Error launching game');
    } finally {
      setLaunching(false);
    }
    return null;
  }, [isAuthenticated, user, balance]);

  return { launching, launch };
}
