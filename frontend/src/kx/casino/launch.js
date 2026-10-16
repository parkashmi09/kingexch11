import { toastrError } from '../toastr';

// Opening a casino game, the reference's way: GoToCasino / gotoAviator send the
// whole browser to the game's provider. No launch backend is connected yet, so
// every game ends where the reference's launch does when it can't launch: the
// "Please contact your upline!" toast, with the page left as it was.
//
// The Universe tables' pages are built (src/kx/csite, routes /<route>/<eventId>
// from csite/games.js); once the backend feeds them, open them here instead:
//   const path = gamePath(eventId); if (path) navigate(path);
export function goToCasino(eventId, navigate) {
  toastrError('Please contact your upline! ');
}

// The Vimaan entries (header bar, phone strip): signed out they go to the
// login page; signed in it is a launch like any casino tile.
export function gotoAviator(isAuth, navigate) {
  if (!isAuth) { navigate('/login'); return; }
  goToCasino('88.0022', navigate);
}
