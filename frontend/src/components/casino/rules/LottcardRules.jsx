import { useState } from 'react';

const CARD_ITEMS = [
  { img: 'ADD', label: '1' },
  { img: '2DD', label: '2' },
  { img: '3DD', label: '3' },
  { img: '4DD', label: '4' },
  { img: '5DD', label: '5' },
  { img: '6DD', label: '6' },
  { img: '7DD', label: '7' },
  { img: '8DD', label: '8' },
  { img: '9DD', label: '9' },
  { img: '10DD', label: '0' },
];

function CardGrid() {
  return (
    <>
      {/* Desktop: 2 rows of 5 */}
      <div className="lottery-rules-cards d-none-big">
        <div className="w-100 d-flex justify-content-center">
          {CARD_ITEMS.slice(0, 5).map((c) => (
            <div key={c.img} className="lottery-card">
              <img src={`/assets/front/img/lottery/cards/${c.img}.png`} alt={c.label} />
              <div>{c.label}</div>
            </div>
          ))}
        </div>
        <div className="w-100 d-flex justify-content-center">
          {CARD_ITEMS.slice(5).map((c) => (
            <div key={c.img} className="lottery-card">
              <img src={`/assets/front/img/lottery/cards/${c.img}.png`} alt={c.label} />
              <div>{c.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Mobile: single row */}
      <div className="lottery-rules-cards d-none-small">
        {CARD_ITEMS.map((c) => (
          <div key={c.img} className="lottery-card">
            <img src={`/assets/front/img/lottery/cards/${c.img}.png`} alt={c.label} />
            <div>{c.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

const RULES_SECTIONS = [
  { title: 'Single', desc: 'Singles play can be placed between 0-9' },
  { title: 'Double', desc: 'Doubles play can be placed between 00-99' },
  { title: 'Triple', desc: 'Triples play can be placed between 000-999' },
];

export default function LottcardRules() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <>
      <div className="casino-tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              href="#rules"
              data-toggle="tab"
              className={`nav-link${activeTab === 'rules' ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('rules'); }}
            >Rules</a>
          </li>
          <li className="nav-item">
            <a
              href="#payout"
              data-toggle="tab"
              className={`nav-link${activeTab === 'payout' ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('payout'); }}
            >Payout</a>
          </li>
        </ul>
      </div>

      <div className="tab-content">
        <div id="rules" className={`tab-pane${activeTab === 'rules' ? ' active' : ' fade'}`}>
          <div className="lottery-rules-box">
            {RULES_SECTIONS.map((section) => (
              <div key={section.title} className="lottery-rules-row">
                <div className="lottery-rules-title-name">
                  <div>{section.title}</div>
                  <div>{section.desc}</div>
                </div>
                <CardGrid />
              </div>
            ))}
          </div>
        </div>

        <div id="payout" className={`tab-pane${activeTab === 'payout' ? ' active' : ' fade'}`}>
          <div className="table-responsive">
            <h4>Game Play Payout</h4>
            <table className="table">
              <thead>
                <tr><th>Point</th><th>Card</th><th>Payout</th></tr>
              </thead>
              <tbody>
                <tr><td>Play Single</td><td>First Card</td><td>1 to 9.5</td></tr>
                <tr><td>Play Double</td><td>First Second Card</td><td>1 to 95</td></tr>
                <tr><td>Play Tripple</td><td>First Second Third Card</td><td>1 to 900</td></tr>
              </tbody>
            </table>
          </div>
          <div className="table-responsive mt-3">
            <h4>Play Limit</h4>
            <table className="table">
              <thead>
                <tr><th>Play</th><th>Minimum Play</th><th>Maximum Play</th></tr>
              </thead>
              <tbody>
                <tr><td>Singles Play</td><td>10</td><td>20K</td></tr>
                <tr><td>Doubles Play</td><td>10</td><td>5K</td></tr>
                <tr><td>Tripples Play</td><td>10</td><td>3K</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
