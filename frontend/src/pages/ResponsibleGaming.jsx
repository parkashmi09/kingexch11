import VoidLink from '../components/VoidLink';
import Footer from '../components/layout/Footer';
import { PrintLink, POLICY_STYLES, usePolicyPhase } from './policyPageShared';

export default function ResponsibleGaming() {
  const phase = usePolicyPhase();

  return (
    <div id="app">
      <div id="rspg" className="wrapper w-100">
        {phase >= 1 && (
        <div className="print-page">
          <div className="d-inline-block mr-3">
            <p className="mb-0">Date:16/6/2025</p>
            <p className="mb-0">Version:1.0</p>
          </div>
          <VoidLink><i className="fas fa-download"></i></VoidLink>{' '}
          <PrintLink><i className="fas fa-print ml-2"></i></PrintLink>
        </div>
        )}
        {phase >= 2 && (
        <div className="w-100">
          <style>{POLICY_STYLES}</style>
          <div className="wrapper">
            <div className="about-us-container">
              <div className="container">
                <div>
                  <h2 className="page-title">Responsible Gaming and Player Protection Information Policy</h2>
                  <h5>Website is committed to endorsing responsible wagering as well as promoting the awareness of problem gambling and improving prevention, intervention and treatment. Responsible Gambling Policy sets out its commitment to minimising the negative effects of problem gambling and to promoting responsible gambling practices. We consider it as our responsibility to you, our customers, to ensure that you will keep on enjoying your wagering experience on our site, remaining at the same time fully aware of the social and financial harms associated with problematic gambling. In order to help our customers in gambling responsibly, we ensure that all our staff receive responsible gambling awareness training, while we also provide the following information and features on our site.</h5>
                  <h4>Customer-driven loss limits;</h4>
                  <h5>Self-exclusion option by contacting Customer Service;</h5>
                  <h5>Links to SICAD, GamCare, Gambling Therapy and other organisations;</h5>
                  <h5>Self protection and awareness information;</h5>
                  <h5>Information and tools to protect player’s account and prevent underage gaming.</h5>
                  <h4>Temporary Account Closure/ Self-exclusion</h4>
                  <h5>You may at Your discretion choose to restrict your access to your account and/or exclude Yourself from playing any Games on the website, temporarily or permanently. In order to restrict Your access to the Games or Self-exclude You must visit the relevant section at your Account (Profile &gt; Player Protection) or email Customer Support. Account blocking and Self-Exclusion requests take effect immediately. To revoke a restriction of your account, contact Customer Support. For your protection, it is possible that revocation of such restrictions will take effect seven days after the receipt of your request, provided that the time period that You have chosen has elapsed.</h5>
                  <h4>Maintaining control</h4>
                  <h5>Whilst the majority of our customers gamble within their means for some it can be more difficult. In order to maintain control of your gambling habits, we would like you to bear in mind the following points:</h5>
                  <h5>Gambling should be done in moderation and undertaken as a form of entertainment and not as a way of making a living;</h5>
                  <h5>Avoid chasing losses;</h5>
                  <h5>Keep track of the time and monitor the amount of money you spend;</h5>
                  <h5>If you need help, use the loss limits functionality to help you control the amount you can spend. These can be accessed from within the "Settings" panel, from the "Profile" menu, under "Account" or you can contact our Customer Support for help.</h5>
                  <h5>Should you need a break from gambling, Self-Exclusion can be set by contacting our Customer Support;</h5>
                  <h5>If you need to talk to someone about any concerns you may have with your gambling, please contact one of the organisations detailed below.</h5>
                  <h5>In case you would like to monitor your account activity regarding any transactions (deposit/ withdrawals/ Sportsbook bets, Casino bets) please visit the relevant section at your account (History &gt; Transactions). In the case that you notice that any of the transactions made at your account was not initiated by You, then you should immediately notify Customer Support through email and change your password. As part of the registration process, You will have to choose Your username and password for logging into the website. It is Your sole and exclusive responsibility to ensure that Your login details are kept securely. You must not disclose or share Your login details with anyone. website is not responsible for any abuse or misuse of Your Account by third parties due to Your disclosure, whether intentional or accidental, whether active or passive, of Your login details to any third party.</h5>
                  <h4>You think you have a problem?</h4>
                  <h5>If you are concerned that gambling has had a negative impact on your or someone else's life, then the following questions may help you find out more about your gambling behaviour and whether it is problematic or not.</h5>
                  <h5>Have you ever neglected your studies or work due to gambling?</h5>
                  <h5>Do you gamble to pass time or out of boredom?</h5>
                  <h5>Do you play alone and for long periods of time?</h5>
                  <h5>Have others ever criticised your gambling?</h5>
                  <h5>Have you ever lost interest in family, friends or hobbies due to gambling?</h5>
                  <h5>Has it ever happened to you to lie, borrow or even steal money to cover gambling losses?</h5>
                  <h5>Has it ever happened to you to lie, borrow or even steal money for gambling?</h5>
                  <h5>Are you reluctant to spend money allocated for gambling on other goals?</h5>
                  <h5>Do you gamble until you lose all your money?</h5>
                  <h5>After losing, do you feel the need to play as soon as possible to cover losses?</h5>
                  <h5>Are there times that gambling follows after arguments, frustrations or disappointments?</h5>
                  <h5>Does gambling cause you depression or suicidal thoughts?</h5>
                  <h5>The more questions that you answer 'yes' to, the more likely it is that you are having gambling issues. To speak with someone who can give you professional advice and support, please contact one of the organisations detailed below:</h5>
                  <div>
                    <a href="www.gamcare.org.uk">www.gamcare.org.uk</a>
                  </div>
                  <div>
                    <a href="www.gamblingtherapy.org">www.gamblingtherapy.org</a>
                  </div>
                  <div>
                    <a href="www.gamblersanonymous.org.uk">www.gamblersanonymous.org.uk</a>
                  </div>
                  <h4>Underage gambling</h4>
                  <h5>It is illegal for anyone under the age of 18 to open an account or to gamble on website. It takes very serious measures in this direction. We carry out age verification checks on all customers who use payment methods which are available to under 18's. Αdditionally, we randomly perform age verification checks on customers using other payment methods.</h5>
                  <h5><b>PLEASE NOTE THAT ANYONE UNDER THE AGE OF 18 FOUND TO BE USING THIS SITE WILL HAVE ANY WINNINGS FORFEITED AND MAY ALSO BE REPORTED TO THE POLICE.</b></h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        <Footer />
      </div>
    </div>
  );
}
