import { toast } from 'react-toastify';

// Toasts for the clickbet UI.
//
// NOT the app's bToast* helpers. Those render BootstrapVue markup
// (`b-toaster-top-center` > `b-toast`) styled entirely by the tenexch
// stylesheets — which no longer load on these routes, so a bToast here renders
// unstyled, at static position, below the fold: the message fires and nobody
// sees it. A failed login looked like a dead button because of it.
//
// The reference uses react-toastify (its `<section class="Toastify">` sits at
// the top of the tree) and clickbet.css already carries that library's full
// stylesheet, so this needs no CSS of its own. react-toastify is already a
// dependency.
//
// Legacy pages keep using bToast*; the two coexist, each with the stylesheet
// that actually styles it.
export const cbToastError = (message) => toast.error(message);
export const cbToastSuccess = (message) => toast.success(message);
export const cbToastWarning = (message) => toast.warn(message);
