import FallbackStreamIframe from '../FallbackStreamIframe';

export default function SportsStream({ gmid, className }) {
  return (
    <div className={`video-tv ${className || ''}`}>
      <FallbackStreamIframe
        gmid={gmid}
        title="Live Stream"
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      />
    </div>
  );
}
