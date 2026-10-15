import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import KxModal from '../KxModal';
import { isDemoUser } from '../../utils/demoStore';
import { changePassword } from '../../apiservices/authService';
import { logout } from '../../redux/userSlice';
import { bToastError, bToastSuccess } from '../../components/BToast';

const A = ng('kmp');

const PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&]*$/;
const ROLLING = [
  ['Fancy', 'rollingFancyCommission'], ['Matka', 'rollingMatkaCommission'], ['Lottery', 'rollingLotteryCommission'],
  ['Casino', 'rollingCasinoCommission'], ['Binary', 'rollingBinaryCommission'], ['Virtual', 'rollingVirtualCommission'],
  ['Sportbook', 'rollingSportsbookCommission'], ['Bookmaker', 'rollingBookmakerCommission'],
];
// The reference's demo account: the rates it has set, the rest blank.
const DEMO_ROLLING = { rollingFancyCommission: 0, rollingLotteryCommission: 0, rollingCasinoCommission: 0, rollingSportsbookCommission: 0, rollingBookmakerCommission: 0 };
const EMPTY = { MasterPassword: '', password: '', confirmPassword: '' };

// The reference's userProfile fields. The demo account reads as the
// reference's does (commission 0, exposure limit 100000).
function profileOf(user) {
  if (isDemoUser(user)) return { name: user?.username, commission: 0, exposureLimit: 100000 };
  return {
    name: user?.name || user?.username,
    commission: user?.rollingBookmakerCommission ?? user?.commission ?? 0,
    exposureLimit: user?.exposureLimit ?? user?.exposure_limit ?? '',
  };
}

/** app-my-profile — My Account › My Profile, with its Change Password modal. */
export default function MyProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user.user);
  const detail = profileOf(user);
  const rolling = isDemoUser(user) ? DEMO_ROLLING : user || {};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState({});

  const reset = () => { setForm(EMPTY); setTouched({}); };
  const close = () => { reset(); setOpen(false); };

  // The reference's reactive form: all three required, the new password
  // alphanumeric, and the confirmation matching it.
  const errors = {
    MasterPassword: !form.MasterPassword,
    passwordRequired: !form.password,
    passwordPattern: !!form.password && !PATTERN.test(form.password),
    mismatch: form.password !== form.confirmPassword,
  };
  const invalid = errors.MasterPassword || errors.passwordRequired || errors.passwordPattern || !form.confirmPassword || errors.mismatch;

  const submit = async () => {
    if (isDemoUser(user)) { bToastError('Password cannot be changed for the demo account.'); return; }
    try {
      const res = await changePassword(localStorage.getItem('token'), form.MasterPassword, form.password);
      if (!res?.success) { bToastError(res?.message || 'Something went wrong. Please try again'); return; }
      bToastSuccess(res.message || 'Password changed successfully');
      close();
      dispatch(logout());
      navigate('/home');
    } catch (err) {
      bToastError(err?.response?.data?.message || 'Something went wrong. Please try again');
    }
  };

  const field = (name, label, id, extra) => (
    <div {...A} className="col-md-6">
      <div {...A} className="form-group">
        <label {...A} htmlFor={id}>
          {`${label} `}
          <span {...A} className="asterisk_input" />
        </label>
        <div {...A} className="d-flex align-items-center position-relative">
          <input
            {...A}
            {...extra}
            id={id}
            type={show[name] ? 'text' : 'password'}
            required
            value={form[name]}
            onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, [name]: true }))}
          />
          <div {...A} className="input-group-append">
            <button {...A} type="button" className="btn btn-outline-secondary" style={{ border: 'none', zIndex: 999 }} onClick={() => setShow((s) => ({ ...s, [name]: !s[name] }))}>
              <i {...A} className={`fa ${show[name] ? 'fa-eye' : 'fa-eye-slash'}`} />
            </button>
          </div>
        </div>
        {name === 'MasterPassword' && touched.MasterPassword && errors.MasterPassword && (
          <small {...A} className="text-danger"><div {...A}>Your Password is required.</div></small>
        )}
        {name === 'password' && touched.password && (errors.passwordRequired || errors.passwordPattern) && (
          <small {...A} className="text-danger">
            {errors.passwordRequired && <div {...A}>New Password is required.</div>}
            {errors.passwordPattern && <div {...A}>Password should be min 8 characters with number combination.</div>}
          </small>
        )}
        {name === 'confirmPassword' && touched.confirmPassword && errors.mismatch && (
          <small {...A} className="text-danger"> Passwords is not matched. </small>
        )}
      </div>
    </div>
  );

  return (
    <app-my-profile {...host('kmp')} {...KX}>
      <div {...A} className="cardMain">
        <div {...A} className="row">
          <div {...A} className="col-sm-12 col-md-12 p-mobile-1">
            <div {...A} className="card card-accent-primary">
              <div {...A} className="card-header account-detail-head">
                <span {...A} className="acc-dtl">Account Details</span>
              </div>
              <div {...A} className="card-body account-detail-body">
                <div {...A} className="bd-example">
                  <dl {...A} className="row">
                    <dt {...A} className="col-sm-3">Name</dt>
                    <dd {...A} className="col-sm-9">{detail.name}</dd>
                    <dt {...A} className="col-sm-3">Commission</dt>
                    <dd {...A} className="col-sm-9">{` ${detail.commission} `}</dd>
                    <dt {...A} className="col-sm-3">Exposure Limit</dt>
                    <dd {...A} className="col-sm-9">{` ${detail.exposureLimit} `}</dd>
                    <dt {...A} className="col-sm-3">Password</dt>
                    <dd {...A} className="col-sm-9">
                      <span {...A} className="me-3">*********</span>
                      <a {...A} className="edit-password" onClick={() => setOpen(true)}>
                        {' Edit '}
                        <i {...A} className="fa fa-pencil-square-o fa-lg" />
                      </a>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* The reference keeps this rolling-commission breakdown in the page, but
          nothing on it opens the modal. */}
      <KxModal open={false} onClose={() => {}} id="rollingModal" labelledBy="rollingModalLabal" attrs={A}>
        <div {...A} className="modal-dialog">
          <div {...A} className="modal-content">
            <div {...A} className="modal-header account-detail-head">
              <h5 {...A} className="modal-title">Rolling Commission</h5>
              <button {...A} type="button" className="close" aria-label="Close">
                <span {...A} aria-hidden="true">×</span>
              </button>
            </div>
            <div {...A} className="modal-body">
              <div {...A} className="col-md-12 roll">
                {ROLLING.map(([label, field]) => (
                  <div {...A} key={label} className="view-rolling row">
                    <div {...A} className="col-md-2 col-3 col-form-label">{label}</div>
                    <div {...A} className="col-md-8 col-8 col-form-label">
                      <span {...A}>{`${field === 'rollingSportsbookCommission' ? '' : ' '}${rolling[field] ?? ''}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </KxModal>
      <KxModal open={open} onClose={close} id="changePasswordModal" labelledBy="changePasswordModalLabal" attrs={A}>
        <div {...A} className="modal-dialog">
          <div {...A} className="modal-content">
            <div {...A} className="modal-header account-detail-head">
              <h5 {...A} className="modal-title">Change Password</h5>
              <button {...A} type="button" className="close" aria-label="Close" onClick={close}>
                <span {...A} aria-hidden="true">×</span>
              </button>
            </div>
            <form {...A} onSubmit={(e) => e.preventDefault()}>
              <div {...A} className="modal-body">
                <div {...A} className="row">
                  {field('MasterPassword', 'Old Password', 'oldPassword3', { className: 'form-control', name: 'oldPassword3' })}
                  {field('password', 'New Password', 'newPassword', { className: 'text-right form-control', name: 'password', autoComplete: 'off', maxLength: 20 })}
                  {field('confirmPassword', 'Confirm Password', 'confirmPassword', { className: 'form-control', name: 'confirmpassword', maxLength: 20 })}
                </div>
              </div>
            </form>
            <div {...A} className="modal-footer">
              <button {...A} type="submit" className="btn btn-primary" disabled={invalid} onClick={submit}>Confirm</button>
              <button {...A} type="button" className="btn btn-secondary" aria-label="Close" onClick={close}>No</button>
            </div>
          </div>
        </div>
      </KxModal>
    </app-my-profile>
  );
}
