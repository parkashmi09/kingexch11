// ─── Central password-form strings and rules ─────────────────────────────────
// Single source of truth — keep the EXACT reference-site wording. Verified
// against the live change-password modal: a blank field reads "<Field>
// required", six characters reads "The New Password field must be at least 8
// characters", and Confirm only mentions a mismatch once it holds a value.
// Used by ChangePasswordModal; add new password-form strings here first.

export const MIN_PASSWORD_LENGTH = 8;

// At least one lowercase, one uppercase and one digit.
export const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const PASSWORD_MESSAGE = {
  REQUIRED: (label) => `${label} required`,
  MIN_LENGTH: (label, min = MIN_PASSWORD_LENGTH) =>
    `The ${label} field must be at least ${min} characters`,
  WEAK: 'The password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number',
  CONFIRM_MISMATCH: 'The Confirm Password field confirmation does not match',
};

// One message at a time, in the order the reference surfaces them:
// required → character mix → length. The mix comes BEFORE the length even
// though it reads stricter — the live modal shows the mix message on "aa"
// (2 chars) and only reports "must be at least 8 characters" once the mix is
// satisfied, e.g. on "Asdf@12" (7 chars).
export const passwordError = (value, label) => {
  if (value === '') return PASSWORD_MESSAGE.REQUIRED(label);
  if (!STRONG_PASSWORD.test(value)) return PASSWORD_MESSAGE.WEAK;
  return value.length < MIN_PASSWORD_LENGTH ? PASSWORD_MESSAGE.MIN_LENGTH(label) : '';
};

// Confirm has no rules of its own beyond being filled in and matching.
export const confirmPasswordError = (value, password, label = 'Confirm Password') => {
  if (value === '') return PASSWORD_MESSAGE.REQUIRED(label);
  return value !== password ? PASSWORD_MESSAGE.CONFIRM_MISMATCH : '';
};
