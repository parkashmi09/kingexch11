// Reading a runner's price ladder out of the private-data feed.
//
// A runner carries a flat `odds` array whose entries are named back1..back3 /
// lay1..lay3, where **1 is the BEST price** and 3 the worst. The reference
// renders them outwards from the middle — worst back on the far left, best back
// and best lay in the centre, worst lay on the far right — so the column order
// is not the array order:
//
//   back3 | back2 | back1 || lay1 | lay2 | lay3
//   .back2  .back1  .back    .lay   .lay1  .lay2   <- the reference's class names
//
// Those class names are off by one against the data they hold (`.back2` shows
// back3). That is the reference's own naming and the stylesheet is written
// against it, so it is reproduced rather than corrected.
//
// `mobileHidden` marks the four outer columns, which the reference drops on a
// phone — only the best back and best lay stay.
export const ODDS_COLUMNS = [
  { cls: 'back2', headerCls: 'back2', oname: 'back3', side: 'back', mobileHidden: true },
  { cls: 'back1', headerCls: 'back1', oname: 'back2', side: 'back', mobileHidden: true },
  { cls: 'back',  headerCls: 'back',  oname: 'back1', side: 'back', mobileHidden: false },
  { cls: 'lay',   headerCls: 'lay',   oname: 'lay1',  side: 'lay',  mobileHidden: false },
  // Capital L in the header row, lower-case in the runner rows — again the
  // reference's own inconsistency, kept because its CSS targets both spellings.
  { cls: 'lay1',  headerCls: 'Lay1',  oname: 'lay2',  side: 'lay',  mobileHidden: true },
  { cls: 'lay2',  headerCls: 'Lay2',  oname: 'lay3',  side: 'lay',  mobileHidden: true },
];

/** The {odds, size} for one named price, or null when the book has no offer. */
export function priceOf(section, oname) {
  const hit = (section?.odds || []).find(
    (o) => String(o.oname || '').toLowerCase() === oname
  );
  if (!hit || !(Number(hit.odds) > 0)) return null;
  return { odds: hit.odds, size: hit.size };
}

// Prices come back as numbers; sizes are shown to 2dp under them.
export const formatSize = (size) =>
  size == null || size === '' ? '' : Number(size).toFixed(2);
