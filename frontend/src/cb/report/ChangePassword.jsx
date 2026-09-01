import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../apiservices/authService';
import { cbToastError, cbToastSuccess } from '../toast';
import { Spinner } from './parts';

/**
 * Change Password.
 *
 * A page in the reference, not a dialog — three floating-label fields across
 * one row, a live rule checklist under the new password, and a mismatch note
 * under the confirm field. On success it drops you back on the home page.
 */
function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ OldPassword: '', NewPassword: '', ConfirmPassword: '' });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [rules, setRules] = useState({
    hasDigit: false,
    hasChar: false,
    minLength: false,
    notSameAsOld: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = form.NewPassword;
    const old = form.OldPassword;
    setRules({
      hasDigit: /\d/.test(next),
      hasChar: /[A-Za-z]/.test(next),
      minLength: next.length >= 8,
      // Named for the rule it feeds, which renders only when it is TRUE: the
      // reference shows the "must not be same as old" line as a warning once
      // the two match, so this flag is really "same as old".
      notSameAsOld: next === old,
    });
  }, [form.NewPassword, form.OldPassword]);

  const edit = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    const { OldPassword, NewPassword, ConfirmPassword } = form;
    if (!OldPassword) return cbToastError('Please insert old password!');
    if (!NewPassword) return cbToastError('Please insert new password!');
    if (!ConfirmPassword) return cbToastError('Please insert confirm password!');
    if (!rules.minLength) return cbToastError('Password must have at least 8 characters!');
    if (!rules.hasDigit || !rules.hasChar) return cbToastError('Password must be alphanumeric!');
    if (NewPassword !== ConfirmPassword) return cbToastError('Confirm password does not match!');
    if (OldPassword === NewPassword) return cbToastError('New password cannot be same as old password!');

    setSaving(true);
    try {
      const result = await changePassword(
        localStorage.getItem('token'),
        OldPassword,
        NewPassword
      );
      if (result?.success) {
        cbToastSuccess('Password changed successfully');
        navigate('/');
      } else {
        cbToastError(result?.message || result?.error || 'Something went wrong. Please try again');
      }
    } catch (err) {
      cbToastError(
        err?.response?.data?.message || 'Something went wrong. Please try again'
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, key) => (
    <div className="input_box mb-3 position-relative">
      <input
        type={show[key] ? 'text' : 'password'}
        className="form-control pe-5"
        name={name}
        value={form[name]}
        onChange={edit}
      />
      <label>{label}</label>
      <span className="password-eye" onClick={() => setShow({ ...show, [key]: !show[key] })}>
        <i className={`fa ${show[key] ? 'fa-eye' : 'fa-eye-slash'}`} />
      </span>
    </div>
  );

  return (
    <div className="CommonModel-box mt-0">
      <div className="sectionbox r-title">Change Password</div>
      <div className=" sportscardRow mt-0 rmain-title p-2 min-height500">
        <div className="resport-search">
          <div className="row">
            <div className="col-12 col-md-4">{field('OldPassword', 'Old Password', 'old')}</div>

            <div className="col-12 col-md-4">
              {field('NewPassword', 'New Password', 'new')}
              {form.NewPassword && (
                <ul className="password-rules mb-3">
                  <li className={rules.hasDigit ? 'success-text' : ''}>
                    <i className="fa fa-check me-2" />
                    At least 1 digit
                  </li>
                  <li className={rules.hasChar ? 'success-text' : ''}>
                    <i className="fa fa-check me-2" />
                    At least 1 character
                  </li>
                  <li className={rules.minLength ? 'success-text' : ''}>
                    <i className="fa fa-check me-2" />
                    Minimum 8 characters
                  </li>
                  {rules.notSameAsOld && (
                    <li className="text-danger">
                      <i className="fa fa-times me-2" />
                      Password must not be same as old password
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="col-12 col-md-4">
              <div className="input_box mb-1 position-relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  className="form-control pe-5"
                  name="ConfirmPassword"
                  value={form.ConfirmPassword}
                  onChange={edit}
                />
                <label>Confirm Password</label>
                <span
                  className="password-eye"
                  onClick={() => setShow({ ...show, confirm: !show.confirm })}
                >
                  <i className={`fa ${show.confirm ? 'fa-eye' : 'fa-eye-slash'}`} />
                </span>
              </div>
              <div className="my-2">
                {form.NewPassword !== form.ConfirmPassword && (
                  <small className="text-danger">This field should be same as password.</small>
                )}
              </div>
            </div>

            <div className="col-12 col-md-4">
              <button className="loginbtn ml-0 w-160" onClick={submit} disabled={saving}>
                {saving && <Spinner />}Update
              </button>
            </div>
            <div className="col-md-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
