import { Fragment, useState } from 'react';
import { ng, host } from '../../ng';
import { LOBBY } from '../../casino/lobby';

const R = ng('crl');

// The reference lists its casinoLobbyList sorted by sequence: the exchange
// lobby's tiles in the lobby's order, plus two International tables the
// exchange lobby leaves out.
const RULES_LOBBY = LOBBY.flatMap(([, name, , , eventId]) => {
  const row = { name, eventId };
  if (name === 'Turkish Roulette') return [{ name: 'Mini Roulette', eventId: 'Mini Roulette' }, row];
  if (name === 'TVBet') return [row, { name: 'Chicken Live', eventId: 'Chicken Live' }];
  return [row];
});

// What the reference injects into #rulesBoxContainer when an event has no
// rules (its unclosed second <span> parses as a nested one).
const NO_RULES = (
  <div style={{ width: '100%' }}>
    <span style={{ textAlign: 'center' }}>No Rules Found!<span></span></span>
  </div>
);

/**
 * app-rules-list of the casino site — the phone's full-screen "Rules List" the
 * exchange header's Rules button opens: every lobby game, each opening its
 * rules below it; a second tap, or another game, closes it.
 *
 * UI only: the reference fetches each game's rules html (casinoEventRules) when
 * it opens. `rules` maps an event id to that html; an event without one shows
 * the reference's "No Rules Found!".
 */
export default function RulesList({ attrs, onClose, rules = {} }) {
  const [active, setActive] = useState('');
  const toggle = (eventId) => setActive((cur) => (cur === eventId ? '' : eventId));

  return (
    <app-rules-list {...attrs} {...host('crl')}>
      <div {...R} className="left-bar-container">
        <div {...R} className="left-bar">
          <div {...R} data-simplebar="" className="h-100">
            <div {...R} className="tab-content pt-0">
              <div {...R} id="up-tab" role="tabpanel" className="tab-pane active">
                <div {...R} className="user-menus" style={{ background: 'black' }}>
                  <div {...R} className="openBetHeader">
                    <strong {...R}>Rules List</strong>
                    <button {...R} type="button" className="close show-xs cls-openbet">
                      <span {...R} aria-hidden="true" onClick={onClose}>×</span>
                    </button>
                  </div>
                  <ul {...R} className="ulScrollRule">
                    {RULES_LOBBY.map(({ name, eventId }) => (
                      <Fragment key={eventId}>
                        <li {...R} className="m-2" onClick={() => toggle(eventId)}>
                          <a {...R} routerlink="/client" className="waves-effect waves-light sideNavCheck d-flex align-items-center justify-content-between">
                            {` ${name} `}
                            <i {...R} className="fa" style={{ marginRight: '12px' }}></i>
                          </a>
                        </li>
                        {active === eventId && (
                          <div {...R} style={{ backgroundColor: 'white' }}>
                            <div {...R} className="card card-body">
                              <div {...R} id="rulesList___BV_modal_body_" className="modal-body">
                                <div {...R} id="rulesBoxContainer">
                                  {rules[eventId] ? <div dangerouslySetInnerHTML={{ __html: rules[eventId] }} /> : NO_RULES}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Fragment>
                    ))}
                    <div {...R} style={{ height: '100px' }}></div>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-rules-list>
  );
}
