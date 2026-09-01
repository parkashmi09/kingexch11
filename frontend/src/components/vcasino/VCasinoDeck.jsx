import { memo } from 'react';
import useIsDesktop from '../../hooks/useIsDesktop';
import { cardSrc, FACE_DOWN } from '../../utils/vcasinoCards';

// The dealer's shoe: a left deck that empties into a right stack, one card per
// round. Both are plain stacks of .card-item divs whose offsets the reference
// writes inline — the CSS positions the block, the transforms fan the cards.
//
// Every number below was read off live reference captures. All of it is linear
// in the stack count `n` because each card adds a constant sliver of thickness,
// which is also why the holder art creeps as the stack grows.
//
// The per-card fan is shared by both breakpoints, but the CONTAINER geometry is
// not — desktop is a different board and needs its own constants. Deriving
// desktop from the mobile numbers put the stack far too high and flipped the
// lift's sign (-5% instead of +62%), which spilled the cards out of the box.

const BOARD = '/assets/board';
const SHOE_SIZE = 50;

// Per-card fan inside each stack.
const LEFT_STEP_X = -0.38;
const LEFT_STEP_Y = -2.2;
const RIGHT_STEP_X = 2.2;
const RIGHT_STEP_Y = 0.48;

// Container geometry per breakpoint, each entry [base, slope] for `base - slope*n`.
// Mobile solved against seven captures (n = 1, 4, 11, 15, 23, 45, 47); desktop
// against two (n = 13, 21) — two points fix a line, and every base landing on a
// round number is the tell that it is the real formula and not a fit.
const GEOMETRY = {
  mobile: {
    holderRight: [8.6, 0.095], holderTop: [15.0, 0.155],
    holderTx: [5.0, 0.05], holderTy: [4.0, 0.04],
    stackRight: [10.0, 0.078], stackTop: [14.0, 0.155],
    stackLift: [-5.0, 0.01],
  },
  desktop: {
    holderRight: [9.1, 0.095], holderTop: [27.0, 0.215],
    holderTx: [50.0, 0.5], holderTy: [4.0, 0.04],
    stackRight: [10.5, 0.078], stackTop: [25.0, 0.215],
    stackLift: [78.0, 0.78],
  },
};

// V-Trio's shoe is a different object: no left deck at all, a fixed twenty-card
// right stack, and geometry that does not track the stack size — every capture
// on both breakpoints reads translate(0%, 0%) and translateY(0%) at n = 20.
// Stated as constants because that is exactly what was observed; if a capture
// ever shows these moving with n, they need the same two-point solve the
// lucky7 numbers got.
const TRIO_GEOMETRY = {
  mobile: { holderRight: '5.3%', holderTop: '8.2%', stackRight: '7.64%', stackTop: '8.7%' },
  desktop: { holderRight: '4.2%', holderTop: '24.7%', stackRight: '5.94%', stackTop: '25.7%' },
};

// V-20-20 D T L uses the same fixed shoe, and — checked against the captures —
// the very same `right` values as Trio on both breakpoints. Only the tops move,
// because the board sits lower.
const DTL_GEOMETRY = {
  mobile: { holderRight: '5.3%', holderTop: '27.2%', stackRight: '7.64%', stackTop: '27.7%' },
  desktop: { holderRight: '4.2%', holderTop: '19.7%', stackRight: '5.94%', stackTop: '20.7%' },
};

// V-Muflis sits the shoe further right still — far enough that the offsets go
// negative, which nothing before it did.
const MUFLIS_GEOMETRY = {
  mobile: { holderRight: '-4.9%', holderTop: '8.7%', stackRight: '-1.16%', stackTop: '9.7%' },
  desktop: { holderRight: '-8.9%', holderTop: '27.7%', stackRight: '-5.26%', stackTop: '31.7%' },
};

// Every fixed-shoe board: no left deck, twenty cards on the right, geometry
// that does not track the stack size.
const FIXED_SHOE = { trio: TRIO_GEOMETRY, dtl: DTL_GEOMETRY, muflis: MUFLIS_GEOMETRY };

const at = ([base, slope], n) => base - slope * n;

/** Where the holder art and the right stack sit, given the stack's size. */
function rightGeometry(n, desktop, variant) {
  if (FIXED_SHOE[variant]) {
    const G = FIXED_SHOE[variant];
    const t = desktop ? G.desktop : G.mobile;
    return {
      holder: { right: t.holderRight, top: t.holderTop, transform: 'translate(0%, 0%)' },
      stack: {
        right: t.stackRight,
        top: t.stackTop,
        transform: 'perspective(900px) rotateX(23deg) rotateZ(-66deg) rotateY(-30deg)'
          + ' skewX(3deg) scale(1) translateY(0%)',
      },
    };
  }
  const g = desktop ? GEOMETRY.desktop : GEOMETRY.mobile;
  return {
    holder: {
      right: `${at(g.holderRight, n).toFixed(3)}%`,
      top: `${at(g.holderTop, n).toFixed(3)}%`,
      transform: `translate(${at(g.holderTx, n).toFixed(2)}%, ${at(g.holderTy, n).toFixed(2)}%)`,
    },
    stack: {
      right: `${at(g.stackRight, n).toFixed(3)}%`,
      top: `${at(g.stackTop, n).toFixed(3)}%`,
      // The rotation chain is fixed; only the lift tracks the stack height.
      transform: 'perspective(900px) rotateX(23deg) rotateZ(-66deg) rotateY(-30deg)'
        + ` skewX(3deg) scale(1) translateY(${at(g.stackLift, n).toFixed(2)}%)`,
    },
  };
}

const back = { backgroundImage: `url("${cardSrc(FACE_DOWN)}")` };

/**
 * `dealt` — how many cards have left the shoe this cycle (0…SHOE_SIZE).
 * `finished` — the round is over; the reference collapses both stacks and
 * tags them `finish-deck` while the next shoe is prepared.
 */
function VCasinoDeck({ dealt = 0, finished = false, variant = 'lucky7' }) {
  const right = Math.min(Math.max(dealt, 0), SHOE_SIZE);
  const left = SHOE_SIZE - right;
  const isDesktop = useIsDesktop();
  const geo = rightGeometry(finished ? 1 : right, isDesktop, variant);
  // V-Trio ships the deck ART but no left stack — the reference renders the
  // cardDeckLeft image with nothing on it.
  const hasLeftDeck = variant === 'lucky7';

  // decks-block's z-index tracks the LEFT deck, not the right. Seven captures
  // split cleanly: left 0/3/5 -> 1, left 35/46/49 -> 7. Since `left` starts at
  // 49 and counts down, a hardcoded 1 was wrong for most of the shoe.
  //
  // NOT fully solved: those captures form two clusters with the whole 6..34
  // range unsampled, so the step between them is inferred, not observed. Any
  // monotonic function hitting 1 at the low end and 7 at the high end fits the
  // evidence equally well; this is the simplest of them.
  // Lucky 7's shoe layers by how much is left. The fixed-shoe boards have no
  // left deck to measure: Trio reads z-index 1 on both breakpoints, but D T L
  // only stamps it on desktop — every mobile capture leaves the style empty.
  const deckZ = hasLeftDeck
    ? Math.max(1, Math.min(7, Math.ceil(left / 5)))
    : (variant === 'dtl' && !isDesktop ? undefined : 1);

  return (
    <div className="decks-block" style={{ zIndex: deckZ }}>
      <img src={`${BOARD}/cardDeckLeft.svg`} className="left-card-deck" alt="" />

      {/* The reference keeps a hidden single-card deck here as the measuring
          reference for the visible one — kept so the CSS that targets
          :nth-child positions still lines up. */}
      {hasLeftDeck && (
      <div className="decks empty-card-in-deck-left d-none">
        <div className="card-item" style={back} />
      </div>
      )}

      {hasLeftDeck && (
      <div className={`decks empty-card-in-deck-left${finished ? ' finish-deck' : ''}`}>
        {!finished && Array.from({ length: left }, (_, k) => (
          <div
            key={k}
            className="card-item"
            style={{ ...back, transform: `translate(${(LEFT_STEP_X * k).toFixed(2)}%, ${(LEFT_STEP_Y * k).toFixed(2)}%)` }}
          />
        ))}
      </div>
      )}

      <img src={`${BOARD}/cardDeckRightBox.svg`} className="right-card-box-back" alt="" />
      <img src={`${BOARD}/cardHolder.svg`} className="right-card-box-middle" style={geo.holder} alt="" />

      <div
        className={`decks empty-card-in-deck-right${finished ? ' finish-deck' : ''}`}
        style={geo.stack}
      >
        {/* z-index descends so the newest card lands on top of the pile. */}
        {Array.from({ length: finished ? 1 : right }, (_, k) => {
          const n = finished ? 1 : right;
          return (
            <div
              key={k}
              className="card-item"
              style={{
                ...back,
                zIndex: n - k,
                transform: `translate(${(-RIGHT_STEP_X * (n - k)).toFixed(2)}%, ${(RIGHT_STEP_Y * k).toFixed(2)}%)`,
              }}
            />
          );
        })}
      </div>

      <img src={`${BOARD}/cardDeckWall.svg`} className="right-card-box-front" alt="" />
    </div>
  );
}

export default memo(VCasinoDeck);
export { SHOE_SIZE };
