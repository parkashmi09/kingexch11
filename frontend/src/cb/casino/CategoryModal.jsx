import { useState } from 'react';

/**
 * The "Category" dialog, opened by the button beside the search box.
 *
 * Markup is the reference's — an `encasino catmain` dialog holding a
 * `categorymodel` with a `currencybox-header` and `currencybox-body`, and a
 * `categorypopbox > .parent` of choices — including its own search field, which
 * filters the list of categories rather than the games.
 *
 * Selecting does not close it: the reference leaves the dialog up and lets the
 * grid change behind it.
 *
 * Items are `{ id, label }` so a lobby can show the reference's wording for a
 * bucket whose internal name differs.
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
                        id="formGroupExampleInput"
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
