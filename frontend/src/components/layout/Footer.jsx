function Footer() {
  return (
    <footer className="footer">
      <div className="support">
        <div className="secure-logo">
          <div>
            <img src="/assets/ssl.png" alt="ssl" />
          </div>
          <div className="ml-2">
            <b>100% SAFE</b>
            <div>Protected connection and encrypted data</div>
          </div>
        </div>
        <div className="customer-support">
          <div className="w-100 text-center">
            <b>24X7 Support</b>
          </div>
          <div className="text-center w-100"></div>
        </div>
      </div>

      <div className="footer-menu">
        <ul>
          <li>
            <a href="/terms-and-conditions" target="_blank">Terms and Conditions</a>
          </li>
          <li>
            <a href="/responsible-gaming" target="_blank">Responsible Gaming</a>
          </li>
        </ul>
      </div>

      <p className="text-center upper-footer text-white">
        <a href="javascript:void(0)" role="button">
          <img src="/assets/18plus.png" alt="18plus" />
        </a>
        {' '}
        <a href="https://www.gamcare.org.uk/" target="_blank" rel="noopener noreferrer">
          <img src="/assets/gamecare.png" alt="gamecare" />
        </a>
        {' '}
        <a href="https://www.gamblingtherapy.org/en" target="_blank" rel="noopener noreferrer">
          <img src="/assets/gt.png" alt="gamblingtherapy" />
        </a>
        {' '}
        <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" className="begambleaware">
          <img src="/assets/gamble-aware.svg" alt="gamble aware" />
        </a>
        {' '}
        <a href="https://www.gamstop.co.uk/" target="_blank" rel="noopener noreferrer">
          <img src="/assets/game-stop.png" className="gamstop" alt="gamstop" />
        </a>
        {' '}
        <a href="javascript:void(0)" role="button">Prohibited Territories</a>
      </p>

      <div className="footer-box">
        <div className="footer-bottom"><span></span></div>
      </div>

      <div className="text-center mt-1 w-100 copyright">
        &copy; Copyright 2026. All Rights Reserved.
        <span></span>
      </div>
    </footer>
  );
}

export default Footer;
