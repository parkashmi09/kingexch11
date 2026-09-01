// Social accounts linked from the login modal's "Connect with us" row.
//
// The reference reads these from a site-settings API; tenexch has no such
// endpoint, so they live here. The icons render either way — an entry left
// empty (or '#') simply does nothing when clicked, which is the reference's own
// guard — so filling these in is the only step needed to make them live.
export const SOCIAL_LINKS = {
  whatsapp: '',
  telegram: '',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
};
