// The reference's launched-game overlay, verbatim:
//
//   <div class="report-box casino-box fancy-page frame-open">   ← panel gains frame-open
//     <div class="container-fluid …">…the grid, still mounted…</div>
//     <div class="banner-iframe slot-iframe banner-frame-show">
//       <div class="slot-header">
//         <div class="title"><h4>Mr.Mars</h4></div>
//         <div class="close-slot-frame">EXIT</div>
//       </div>
//       <iframe allow="autoplay" scrolling="no" src="…"></iframe>
//     </div>
//   </div>
//
// The grid is NOT unmounted while a game is open. `.banner-iframe` is
// position:fixed at top:100% (parked below the viewport) and `.banner-frame-show`
// slides it up to cover the page — style.css 6429-6520, plus the ten-custom and
// responsive overrides. So every rule this needs already exists; render it as the
// LAST child of the panel and put `frame-open` on the panel itself.
export default function GameFrame({ title, src, onExit }) {
  return (
    <div className="banner-iframe slot-iframe banner-frame-show">
      <div className="slot-header">
        <div className="title">
          <h4>{title}</h4>
        </div>
        <div className="close-slot-frame" onClick={onExit} role="button">EXIT</div>
      </div>
      <iframe allow="autoplay" scrolling="no" src={src} title={title || 'Game'} />
    </div>
  );
}
