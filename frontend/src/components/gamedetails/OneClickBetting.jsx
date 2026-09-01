import { useState } from 'react';

// 1 Click Betting settings block (.user-settings). When the toggle is ON the
// reference shows: switch + Edit button + three stake buttons (one active).
// Edit swaps the buttons for inputs and the Edit button for Save.
// `children` renders after the block (mobile places the Matka link inside).
function OneClickBetting({ id, enabled, onToggle, stakes, onStakesChange, activeIdx, onActiveChange, children }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stakes);

  const startEdit = () => {
    setDraft(stakes);
    setEditing(true);
  };

  const save = () => {
    // Keep old value where the input was left empty/invalid
    const next = draft.map((v, i) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : stakes[i];
    });
    // Reference: Save with NOTHING actually changed returns to the initial
    // view — FIRST stake button selected (even if none was active before);
    // only a real change deselects — the parent's onStakesChange resets
    // activeIdx to -1
    const changed = next.some((n, i) => n !== stakes[i]);
    if (changed) onStakesChange(next);
    else onActiveChange(0);
    setEditing(false);
  };

  return (
    <div className="user-settings">
      <div className="custom-control custom-switch">
        <input
          id={id}
          type="checkbox"
          name={id}
          className="custom-control-input"
          value="true"
          checked={enabled}
          onChange={() => { setEditing(false); onToggle(!enabled); }}
        />
        <label htmlFor={id} className="custom-control-label">1 Click Betting</label>
      </div>
      {enabled && !editing && (
        <button className="btn btn-success btn-sm ml-2" onClick={startEdit}>Edit</button>
      )}
      {enabled && editing && (
        <button className="btn btn-success btn-sm ml-2" onClick={save}>Save</button>
      )}
      <div className="one-click-bet float-left w-100">
        {enabled && !editing && (
          <div>
            {stakes.map((s, i) => (
              <button
                key={i}
                className={`btn btn-primary btn-sm mr-1${activeIdx === i ? ' active' : ''}`}
                onClick={() => onActiveChange(i)}
              >{s}</button>
            ))}
          </div>
        )}
        {enabled && editing && (
          <div>
            {/* Reference: <input maxlength="8" onkeypress="charCode 48-57"
                class="form-group"> — digits only, max 8 chars */}
            {draft.map((v, i) => (
              <input
                key={i}
                maxLength={8}
                className="form-group"
                value={v}
                onKeyPress={e => { if (e.charCode < 48 || e.charCode > 57) e.preventDefault(); }}
                onChange={e => setDraft(d => d.map((x, j) => (j === i ? e.target.value.replace(/[^0-9]/g, '').slice(0, 8) : x)))}
              />
            ))}
          </div>
        )}
      </div>
      {/* Matka link (mobile) — reference hides it while 1-click is enabled */}
      {!enabled && children}
    </div>
  );
}

export default OneClickBetting;
