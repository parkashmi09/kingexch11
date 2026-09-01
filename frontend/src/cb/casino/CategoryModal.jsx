import { useState } from 'react';

/**
 * The "Category" filter modal, opened by the button beside the search box.
 *
 * Markup is the reference's (`encasino catmain` dialog > `categorymodel` >
 * `currencybox-header` + `currencybox-body`, with `categorypopbox > .parent`
 * holding the choices), and so is its own search field, which filters the list
 * of categories rather than the games.
 *
 * The reference's modal picks its `category` axis while the strip above the grid
 * picks `gameType`. This platform's tables carry one meaningful game axis
 * (`tile_category`), so the modal is the searchable full picker for that same
 * axis and the strip is its quick-access row — which matters more here than it
 * does there: the reference offers four game types, we have seventeen.
 */
function CategoryModal({ categories, value, onSelect, onClose }) {
  const [query, setQuery] = useState('');

  const shown = query
    ? categories.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : categories;

  return (
    <div>
      <div
        id="marketbetspopup"
        className="modal fade show"
        style={{ display: 'block' }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="myModalLabel"
        aria-modal="true"
      >
        <div
          className="modal-dialog  modal-dialog-centered encasino catmain"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-body engcasinomodalbgimg categorymodelmainbox">
              <div className="newcurrency-modelbox categorymodel">
                <div className="currencybox-header">
                  <div className="currencybox-title">Filter</div>
                  <div>
                    <button onClick={onClose} type="button" className="close " aria-hidden="true">
                      ×
                    </button>
                  </div>
                </div>
                <div className="currencybox-body">
                  <div className="newsearchbox_search w-100 ">
                    <div className="p-relative">
                      <span>
                        <i className="fa fa-search cfa" aria-hidden="true"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        name="searchcat"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="categorypopbox">
                    <div className="parent">
                      {shown.length > 0 && (
                        <div className={value === '' ? 'active' : ''} onClick={() => onSelect('')}>
                          All
                        </div>
                      )}
                      {shown.length > 0 ? (
                        shown.map((c) => (
                          <div
                            key={c.id}
                            className={value === c.id ? 'active' : ''}
                            onClick={() => onSelect(c.id)}
                          >
                            {c.label}
                          </div>
                        ))
                      ) : (
                        <div className="noresult">No data found</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" onClick={onClose}></div>
      </div>
    </div>
  );
}

export default CategoryModal;
