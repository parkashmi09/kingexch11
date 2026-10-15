import { useNavigate } from 'react-router-dom';
import KxModal from '../KxModal';
import useHeaderSearch from '../header/useHeaderSearch';

/** The phone strip's event search (#searchModal), on the header's search. */
export default function SearchModal({ C, open, onClose }) {
  const navigate = useNavigate();
  const { value, setValue, results } = useHeaderSearch();
  const close = () => { setValue(''); onClose(); };

  return (
    <KxModal open={open} onClose={close} id="searchModal" className="ch-pass-model" labelledBy="searchModal" attrs={C}>
      <div {...C} role="document" className="modal-dialog">
        <div {...C} className="modal-content">
          <div {...C} className="modal-body p-2">
            <div {...C} className="searchIconDiv">
              <i {...C} aria-hidden="true" className="fa fa-search searchIcon" />
              <input
                {...C}
                autoComplete="off"
                autoFocus
                type="text"
                placeholder=""
                aria-label="Search"
                id="myInputHeaderInMobile"
                className="form-control searchbar"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              {value && <span {...C} aria-hidden="true" id="myClose" className="searchIconCross 123123" onClick={() => setValue('')}>×</span>}
            </div>
            {value && (
              <div {...C} className="searchBox" style={{ marginLeft: 208 }}>
                <div {...C} className="scrollSearchBox">
                  <ul {...C} className="search-game-ul" style={{ marginBottom: 0 }}>
                    {results.map((r) => (
                      <li {...C} key={`${r.sid}-${r.gmid}`}>
                        <a {...C} aria-label="Close" style={{ width: '100%', display: 'block' }} onClick={() => { close(); navigate(`/gamedetails/${r.sid}/${r.gmid}`); }}>
                          <div {...C} className="d-flex justify-content-between w-100">
                            <div {...C} className="search-game-name d-flex"><b {...C}>{r.sportName}</b></div>
                            <div {...C} className="text-end">{r.date}</div>
                          </div>
                          <div {...C} className="game-teams w-100">{r.eventName}</div>
                        </a>
                      </li>
                    ))}
                    {!results.length && <li {...C} className="no-item-founds"><a {...C}>No items found</a></li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </KxModal>
  );
}
