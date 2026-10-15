// The 18+ confirmation lives in the headers (desktop and phone each own one,
// as in the reference). Anything else that needs it — a casino tile while
// logged out — asks through here, and the header shown at this width answers.
const EVENT = 'kx-age-modal';

export const openAgeModal = () => window.dispatchEvent(new Event(EVENT));

export function onAgeModal(media, open) {
  const handler = () => window.matchMedia(media).matches && open();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
