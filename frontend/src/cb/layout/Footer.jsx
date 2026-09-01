import { useNavigate } from 'react-router-dom';
import { common, user } from '../assets';

const PARTNERS = Array.from({ length: 8 }, (_, i) => `partner${i + 1}.png`);

// Partner strip + site footer. The reference renders them as one unit inside
// `.footermain`, so they stay together here rather than as two components.
function Footer({ isNotSbRoute = true }) {
  const navigate = useNavigate();
  const dark = document.body.classList.contains('dark-theme');

  return (
    <div className={`footermain  ${isNotSbRoute ? '' : 'ml-0'}`}>
      <div className="maintitle fmaintitle">
        <div>
          <h2 className="title text-left">Partners</h2>
        </div>
      </div>

      <div className="partner_logo casinopartnerlogo">
        <ul className="footer-providers__list footer-icon-desktop">
          {PARTNERS.map((file) => (
            <li className="footer-providers__list-item" key={file}>
              <a className="footer-providers__list-item-link" href="#">
                <img src={common(file)} alt="Evolution" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-sm-12 col-md-12">
              <div className="footerlogo">
                {'  '}
                <img src={user(`footerlogo${dark ? '-dark' : ''}.svg`)} alt="" onClick={() => navigate('/')} />
              </div>
              <p>
                By players for players! We offer a huge variety of slots and casino games. All of our
                slotmachines are RTP certified. Gamble Responsibly. 18+
              </p>
              <p className="plink">100% SAFE Protected connection and encrypted data.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
