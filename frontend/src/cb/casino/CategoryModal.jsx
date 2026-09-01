import { useEffect, useState } from 'react';

/**
 * The Category dialog behind the lobby's "Category" button.
 *
 * A searchable list with "All" pinned on top; picking one closes nothing —
 * the reference leaves the dialog open and lets the grid update behind it.
 */
function CategoryModal({ categories, selected, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(categories);

  useEffect(() => {
    setShown(categories);
  }, [categories]);

  const search = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShown(
      value ? categories.filter((c) => c.toLowerCase().includes(value.toLowerCase())) : categories
    );
  };

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
                        <i className="fa fa-search cfa" aria-hidden="true" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="formGroupExampleInput"
                        placeholder="Search"
                        name="searchcat"
                        value={query}
                        onChange={search}
                      />
                    </div>
                  </div>
                  <div className="categorypopbox">
                    <div className="parent">
                      {!!shown && shown.length > 0 && (
                        <div className={selected === '' ? 'active' : ''} onClick={() => onSelect('')}>
                          All
                        </div>
                      )}
                      {shown && shown.length > 0 ? (
                        shown.map((c, i) => (
                          <div
                            key={`${c}_${i}`}
                            className={selected === c ? 'active' : ''}
                            onClick={() => onSelect(c)}
                          >
                            {c}
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
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </div>
  );
}

export default CategoryModal;
