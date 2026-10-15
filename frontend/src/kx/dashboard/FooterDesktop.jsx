import { useState } from 'react';
import { ng, host } from '../ng';
import { kx } from '../assets';
import { isMobile } from '../exchange';
import { refPost, SITE_KEY } from '../refApi';
import KxModal from '../KxModal';
import iosBadge from './iosBadge';

const F = ng('kfd');

// Each opens the policy modal with that policy's text (the reference's
// getSportsRule with the policy's code). Responsible Gambling loads nothing:
// the modal shows whatever it last held, as on the reference. Phones list
// them in a different order.
const PP = ['Privacy Policy', 'PP'];
const KYC = ['KYC', 'KYC'];
const TC = ['Terms and Conditions', 'TC'];
const RR = ['Rules and Regulations', 'RR'];
const RG = ['Responsible Gambling', null];
const LINKS = isMobile ? [PP, RR, KYC, TC, RG] : [PP, KYC, TC, RR, RG];

const isIphone = navigator.userAgent.includes('iPhone');

/** app-footer-desktop — the policy links (each opening its policy in a modal) and the app badge. */
export default function FooterDesktop({ C, className }) {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState(null);

  const show = (code) => {
    setOpen(true);
    if (!code) return;
    setRules(null);
    refPost('/api/exchange/rules/getSportsRule', { sportId: code, key: SITE_KEY }).then((res) => setRules(res?.data)).catch(() => {});
  };

  return (
    <app-footer-desktop {...C} {...host('kfd')} class={className}>
      <div {...F} className={`col-md-12 footerDiv ${isIphone ? 'main' : 'mobile-android-height'}`}>
        <div {...F} className="inner-footer">
          <div {...F} className="support-wrap">
            <dl {...F} className="support-mail">
              {LINKS.map(([label, code], i) => (
                <a {...F} key={label} className={`rules-btn-home${i ? ' arrow' : ''}`} onClick={() => show(code)}>
                  {isMobile ? ` ${label} ` : label}
                </a>
              ))}
            </dl>
          </div>
          <div {...F} className="extra-wrap">
            <div {...F} className="appdl-link-android" style={{ display: 'block' }}>
              {isIphone ? (
                <a {...F} target="_blank" dangerouslySetInnerHTML={{ __html: iosBadge }} />
              ) : (
                <a {...F} target="_blank">
                  <img {...F} alt="" src={kx('assets/androidapk.png')} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <KxModal open={open} onClose={() => setOpen(false)} id="exampleModal" labelledBy="exampleModalLabel" attrs={F}>
        <div {...F} role="document" className="modal-dialog modal-md">
          <div {...F} className="modal-content">
            <div {...F} className="modal-content rules-wrap">
              <div {...F} className="rules-content">
                <div {...F} dangerouslySetInnerHTML={{ __html: rules?.rules || '' }} />
              </div>
              <ul {...F} className="btn-wrap break">
                <li {...F}>
                  <a {...F} className="btnok" onClick={() => setOpen(false)}>OK</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </KxModal>
    </app-footer-desktop>
  );
}
