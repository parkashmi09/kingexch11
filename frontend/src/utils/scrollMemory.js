// Per-history-entry scroll memory.
//
// Every navigation normally opens at the top, but going BACK should land the
// user exactly where they left — scroll half-way down /o_casino, open a game,
// press back, and the list is still half-way down.
//
// Keyed on the router's `location.key`, which is unique per history entry, so
// two visits to the same URL keep separate positions. In-memory only: it exists
// to survive SPA navigation, and a real page reload hands scroll restoration
// back to the browser anyway.
const positions = new Map();

// A history entry that was never scrolled has no meaningful position to restore
const MAX_ENTRIES = 50;

export function rememberScroll(key, y) {
  if (!key) return;
  // Bound the map so a long session can't grow it without limit (insertion
  // order — the oldest entry goes first).
  if (!positions.has(key) && positions.size >= MAX_ENTRIES) {
    positions.delete(positions.keys().next().value);
  }
  positions.set(key, y);
}

export function recallScroll(key) {
  if (!key) return null;
  const y = positions.get(key);
  return typeof y === 'number' ? y : null;
}
