import { useState } from 'react';
import useDarkTheme from '../useTheme';

// The rules are a standalone HTML document per language, not React markup —
// the reference frames them rather than rendering them, and ships a dark
// variant of each because an iframe cannot inherit the page's theme.
const rulesSrc = (lang, dark) => `/rules/${lang}rules${dark ? '-dark' : ''}.html`;

/**
 * Rules.
 *
 * Mirrors the reference: a title bar, an English/Hindi toggle, and the document
 * itself in an iframe.
 *
 * The documents under public/rules are the REFERENCE'S rules text, mirrored
 * verbatim. They describe how bets are settled and voided, so they are
 * operational content, not decoration — they need reviewing and replacing with
 * this operator's own wording before this goes live. tenexch's own material
 * lives in two other places: the terms page at /terms-and-conditions, and
 * per-sport betting rules in data/rulesData.js.
 */
function Rules() {
  const [lang, setLang] = useState('english');
  const dark = useDarkTheme();

  return (
    <div>
      <div className="sectionbox r-title mt-0">Rules</div>
      <div className="sportscardRow mt-0 rmain-title p-2">
        <div className="d-flex justify-content-center mb-3">
          <div className="btn-group">
            <button
              className={`loginbtn ml-2 ${lang === 'english' ? 'active' : ''}`}
              onClick={() => setLang('english')}
            >
              English
            </button>
            <button
              className={`loginbtn ml-2 ${lang === 'hindi' ? 'active' : ''}`}
              onClick={() => setLang('hindi')}
            >
              Hindi
            </button>
          </div>
        </div>
        <iframe
          src={rulesSrc(lang, dark)}
          title="Game Rules"
          className="rules-iframeheight"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}

export default Rules;
