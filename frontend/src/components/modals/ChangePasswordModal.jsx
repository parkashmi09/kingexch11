import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { bToastSuccess, bToastError } from '../BToast';
import api from '../../apiservices/axiosClient';
import {
  PASSWORD_MESSAGE,
  passwordError,
  confirmPasswordError,
} from '../../utils/passwordValidation';

// BootstrapVue-style incrementing component ids (__BVID__163 etc.)
let bvidCounter = 162;

function ChangePasswordModal({ show, onClose, onSuccess, forced = false }) {
  const bvid = useRef(`__BVID__${++bvidCounter}`).current;
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // BootstrapVue marks the body while a modal is open
  useEffect(() => {
    if (!show) return;
    document.body.classList.add('modal-open');
    document.body.setAttribute('data-modal-open-count', '1');
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open-count');
    };
  }, [show]);

  // A field's error only surfaces once the user has touched it, so the modal
  // doesn't open pre-shouting. Submit marks everything touched.
  const touch = (name) => setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    touch(name);
  };

  const handleBlur = (e) => touch(e.target.name);

  // Validation runs on every keystroke, on blur and on submit — the three
  // gates come from the same rules, so a field can never pass one and fail
  // another. Rules and wording live in utils/passwordValidation.
  const fieldError = (name) => {
    const value = formData[name];
    // The current password is only ever checked for being present — the server
    // is what decides whether it is right.
    if (name === 'oldPassword') return value === '' ? PASSWORD_MESSAGE.REQUIRED('Old Password') : '';
    if (name === 'newPassword') return passwordError(value, 'New Password');
    return confirmPasswordError(value, formData.newPassword);
  };

  const errors = {
    oldPassword: touched.oldPassword ? fieldError('oldPassword') : '',
    newPassword: touched.newPassword ? fieldError('newPassword') : '',
    confirmPassword: touched.confirmPassword ? fieldError('confirmPassword') : '',
  };

  const canSubmit = !['oldPassword', 'newPassword', 'confirmPassword'].some(fieldError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setTouched({ oldPassword: true, newPassword: true, confirmPassword: true });
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/change-password', {
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      // BToast, not react-hot-toast: the reference shows this as a b-toast-success
      // (b-toaster-top-center), which is what BToastContainer renders. Wording is
      // the reference's verbatim — "Password change successfully".
      bToastSuccess('Password change successfully');
      // On a genuine change, run the success flow (logout + first-login rules).
      // Falls back to onClose for non-forced/standalone usage.
      (onSuccess || onClose)();
    } catch (err) {
      // The server reports failures as { success: false, error: "..." } —
      // e.g. "Password is Wrong" when Old Password is not the current one.
      // Reading only `.message` swallowed that and toasted the fallback.
      const data = err.response?.data;
      bToastError(data?.error || data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <div id={`${bvid}___BV_modal_outer_`} style={{ position: 'absolute', zIndex: 1040 }}>
      <div
        id={bvid}
        role="dialog"
        aria-labelledby={`${bvid}___BV_modal_title_`}
        aria-describedby={`${bvid}___BV_modal_body_`}
        className="modal fade show"
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <div className="modal-dialog modal-md">
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">Change Password</h5>
              {/* Present even when forced — the reference header keeps it. It is
                  not an escape hatch: ForcePasswordChange's onClose signs the
                  account out, so closing means leaving, not skipping. */}
              <button type="button" aria-label="Close" className="close" onClick={onClose}>&times;</button>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              {/* <form class="change-form"> — the reference's own markup, and the
                  class matters: responsive.css:6130 resets `.login-form` to
                  min-height:unset below 768px, while `.change-form` keeps the
                  320px from style.css:3736. On `.login-form` the body collapsed
                  to its content and the gap under the button was ~14px short. */}
              <form className="change-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="user-email-text">Old Password</label>
                  <div className="input-group">
                    <input
                      autoComplete="off"
                      type={showOld ? 'text' : 'password'}
                      name="oldPassword"
                      className="form-control"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={loading}
                    />
                    <div className="input-group-append">
                      <button type="button" className="btn btn-secondary password-visible" onClick={() => setShowOld(v => !v)}>
                        <i aria-hidden="true" className={`fa ${showOld ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  {errors.oldPassword && <span className="error">{errors.oldPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="user-email-text">New Password</label>
                  <div className="input-group">
                    <input
                      autoComplete="off"
                      type={showNew ? 'text' : 'password'}
                      name="newPassword"
                      className="form-control"
                      value={formData.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={loading}
                    />
                    <div className="input-group-append">
                      <button type="button" className="btn btn-secondary password-visible" onClick={() => setShowNew(v => !v)}>
                        <i aria-hidden="true" className={`fa ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="user-email-text">Confirm Password</label>
                  <div className="input-group">
                    <input
                      autoComplete="off"
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={loading}
                    />
                    <div className="input-group-append">
                      <button type="button" className="btn btn-secondary password-visible" onClick={() => setShowConfirm(v => !v)}>
                        <i aria-hidden="true" className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit || loading}>
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <span tabIndex={0}></span>
        </div>
      </div>
      <div
        id={`${bvid}___BV_modal_backdrop_`}
        className="modal-backdrop"
        onClick={forced ? undefined : onClose}
      ></div>
    </div>,
    document.body
  );
}

export default ChangePasswordModal;
