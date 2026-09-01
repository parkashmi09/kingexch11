import { useEffect, useRef, useState } from 'react';

/* Shared bits for the static policy pages (/terms-and-conditions,
   /responsible-gaming) — both replicate the reference's embedded static
   pages, which carry the same stylesheet and print bar. */

/* Staged reveal (reference flow). The boot splash covers the page until
   ~2.3s (main.jsx: gif 0–1s, splash 1–2s, 0.3s fade) — the phases start
   AFTER that so the build-up is actually visible:
     splash lift → 1s: only the footer inside the wrapper
     then 0.5s:        the print bar appears (content still hidden)
     then:             the full policy content renders */
const SPLASH_LIFT_MS = 2300;

export function usePolicyPhase() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), SPLASH_LIFT_MS + 1000);
    const t2 = setTimeout(() => setPhase(2), SPLASH_LIFT_MS + 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return phase;
}

/* Reference: <a href="javascript:window.print();"> — React blocks javascript:
   URLs as props, so the attribute is set via ref (same trick as VoidLink). */
export function PrintLink({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.setAttribute('href', 'javascript:window.print();');
  }, []);
  return <a ref={ref}>{children}</a>;
}

/* The reference embeds a static page whose own stylesheet themes the whole
   document (body bg/font) while the route is open — replicated here. */
export const POLICY_STYLES = `
:root {
    --bg-body: #23292E;
    --text-body: #AAAFB5;
    --text-highlight: #fff;
}

body {
    font-family: 'Noto Sans';
    background-color: var(--bg-body);
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0;
    color: var(--text-body);
    scrollbar-width: thin;
}

.about-us-container {
    background-color: var(--bg-body);
    color: var(--text-body);
    padding: 20px;
    padding-bottom: 20px;
    width: 100%;
    padding-bottom: 0;
}

.logo {
    padding: 10px;
}

.logo img {
    max-height: 105px;
    max-width: 100%;
}

.about-us-container .page-title {
    text-transform: uppercase;
    text-align: center;
    margin-top: 20px;
    color: var(--text-highlight);
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 30px;
}

.about-us-container h4 {
    font-size: 24px;
}

.about-us-container h5,
.about-us-container p {
    font-size: var(--font-body);
    margin-bottom: 20px;
}

.about-us-container ul>li {
    list-style: disc;
    padding: 5px 10px;
    margin: 0 10px;
}

.lighttheme .about-us-container {
    background-color: #ffffff;
    color: #3C444B;
}

.lighttheme .about-us-container .page-title {
    color: #000;
}
`;
