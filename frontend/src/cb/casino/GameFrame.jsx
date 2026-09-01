/**
 * A launched third-party game, and the spinner that precedes it.
 *
 * Both are the reference's: while the launch URL is being fetched it covers the
 * page with `roulette-gif`, and once the URL lands the whole list is replaced by
 * a `casino-content-page` holding an 84vh frame with a bare `fa-times` in the
 * corner to come back.
 *
 * Only the jsGames-backed menus reach this. Menus whose games are this
 * platform's own tables navigate to a route instead and never mount it.
 */

export function LaunchSpinner() {
  return (
    <div className="roulette-gif">
      <img alt="" src="/casino/banner/roulette.gif" className="roulette-gif-img" />
    </div>
  );
}

function GameFrame({ url, onClose }) {
  return (
    <div className="casino-content-page">
      <div className="row">
        <div onClick={onClose} style={{ position: 'absolute', width: '30px', textAlign: 'center' }}>
          <i className="fa fa-times popup-cross"></i>
        </div>
        <iframe
          key="iframe"
          title="iframe"
          style={{ height: '84vh', width: '100%', border: '0px' }}
          src={url}
        />
      </div>
    </div>
  );
}

export default GameFrame;
