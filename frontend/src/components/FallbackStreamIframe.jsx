import { useState, useEffect, useRef } from 'react';
import { SPORTS_STREAM_BASE } from '../config';

export default function FallbackStreamIframe({
  gmid,
  title = 'Live Stream',
  onLoad,
  style,
  timeoutMs = 6000,
}) {
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    setFailed(false);
    loadedRef.current = false;
    const t = setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, timeoutMs);
    return () => clearTimeout(t);
  }, [gmid, timeoutMs]);

  if (failed) return null;

  return (
    <iframe
      key={gmid}
      src={`${SPORTS_STREAM_BASE}${gmid}`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      scrolling="no"
      onLoad={(e) => {
        loadedRef.current = true;
        if (onLoad) onLoad(e);
      }}
      onError={() => setFailed(true)}
      style={style}
    />
  );
}
