import { ng, host, KX } from './ng';

// app-loader, or app-bet-loader (the same markup; its overlay blocks the page
// while a bet is placed).
const SCOPES = { 'app-loader': 'kld', 'app-bet-loader': 'kbl' };

/** The reference's two-circle "Loading..." overlay. */
export default function Loader({ attrs, tag: Tag = 'app-loader', style }) {
  const C = ng(SCOPES[Tag]);
  return (
    <Tag {...attrs} {...host(SCOPES[Tag])} {...KX} style={style}>
      <div {...C} className="overlay">
        <div {...C} className="loader-body">
          <div {...C} className="body-container shadow">
            <div {...C} className="circle-container">
              <div {...C} className="circle a-slide" data-animation="" style={{ '--bgc': 'var(--loader1-bg)' }}></div>
              <div {...C} className="circle a-slide a-return" data-animation="" style={{ '--bgc': 'var(--loader2-bg)' }}></div>
            </div>
            <div {...C} className="loading-text">Loading...</div>
          </div>
        </div>
      </div>
    </Tag>
  );
}
