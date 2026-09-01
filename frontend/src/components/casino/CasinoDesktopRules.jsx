/**
 * The desktop rules panel — an inline sheet, not a modal.
 *
 * The two breakpoints render rules completely differently. Below the
 * breakpoint the reference puts them in a bootstrap modal (see
 * CasinoRulesModal); above it, this standalone panel, with its own header and
 * close cross and no backdrop at all. `d-none-small` is what keeps it off
 * phones, so the pair never both show.
 *
 * Lives here rather than inside CasinoVideo because the virtual casino tables
 * have no video element to hang it off, yet need the same panel.
 */
export default function CasinoDesktopRules({ onClose, children }) {
  return (
    <div
      id="casino-vieo-rules"
      aria-modal="true"
      className="casino-vieo-rules show d-none-small show-rules"
      style={{ display: 'block' }}
    >
      <div className="rules-header">
        <div>Rules</div>
        <i className="fas fa-times" onClick={onClose} style={{ cursor: 'pointer' }} />
      </div>
      <div className="rules-body">{children}</div>
    </div>
  );
}
