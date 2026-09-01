import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getStakeButtonValues, updateStakeButtonValues } from '../../apiservices/stakeButtonService';
import { fetchStakeButtonsThunk } from '../../redux/stakeButtonSlice';
import { cbToastError, cbToastSuccess } from '../toast';
import { Spinner } from './parts';

// The reference table is exactly six rows, padded with blanks when the account
// stores fewer, and a blank row saves the default at that position.
const ROWS = 6;
const DEFAULTS = [100, 200, 500, 1000, 2000, 5000];

const blankRows = () => Array.from({ length: ROWS }, () => ({ name: '', value: '' }));

/**
 * Set Stake.
 *
 * The reference edits ONE set of six stake buttons here. tenexch stores two —
 * game and casino — so this page is the game set, which is what the bet slip
 * reads; the casino set has no page in the reference and is left to the casino
 * screens. See docs/BACKEND-GAPS.md.
 */
function SetStake() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState(blankRows);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getStakeButtonValues();
      let list = (data?.game_buttons || []).map((b) => ({
        name: b.label ?? '',
        value: b.value ?? '',
      }));
      if (list.length === 0) list = DEFAULTS.map((v) => ({ name: String(v), value: v }));
      if (list.length < ROWS) {
        list = [...list, ...Array.from({ length: ROWS - list.length }, () => ({ name: '', value: '' }))];
      }
      setRows(list.slice(0, ROWS));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const edit = (e, i) => {
    const { name, value } = e.target;
    setRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, [name]: value } : row)));
  };

  const submit = async () => {
    setSaving(true);
    // A row with neither field falls back to the default for its position; a
    // row with only one field mirrors it into the other. Same rule as the
    // reference, so a half-filled row can never save as a blank button.
    const filled = rows.map((row, i) => {
      const next = { ...row };
      if (!next.name && !next.value) {
        next.name = String(DEFAULTS[i]);
        next.value = DEFAULTS[i];
      } else if (!next.name) next.name = String(next.value);
      else if (!next.value) next.value = parseFloat(next.name);
      return next;
    });
    try {
      await updateStakeButtonValues({
        game_buttons: filled.map((b) => ({ label: b.name, value: Number(b.value) })),
      });
      cbToastSuccess('Set Button Value Added Successfully!');
      setRows(filled);
      dispatch(fetchStakeButtonsThunk());
    } catch (err) {
      cbToastError(err?.message || 'Failed to update button values');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="eventtitle-box mt5 r-title">Set Stake</div>
      <div className="sportscardRow mt-0 rmain-title p-2 min-height500">
        <div className="table-responsive">
          <table className="table table-sm mb-1 table-bordered reporttable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Button Name</th>
                <th>Button Value</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="text-center">Loading...</td>
                </tr>
              )}
              {!loading &&
                rows.map((row, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={row.name}
                        onChange={(e) => edit(e, i)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="value"
                        className="form-control"
                        value={row.value}
                        onChange={(e) => edit(e, i)}
                      />
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-danger">No Data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="">
          <div className="col-12 my-3">
            <button className="loginbtn ml-0 w-160" disabled={saving} onClick={submit}>
              {saving && <Spinner />}Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetStake;
