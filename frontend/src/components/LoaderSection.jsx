// The reference's loader overlay, verbatim:
//
//   <div class="… loader-section-parent">
//     <div class="loader-section"><div><img src="loader-ten.gif" alt="loader"></div></div>
//     …the panel, still rendered underneath…
//
// `.loader-section-parent` is position:relative and `.loader-section` is an
// absolutely positioned, translucent full-cover layer (control.css), so the page
// keeps its layout while the loader is up rather than being replaced by a
// spinner. The PARENT needs the `loader-section-parent` class — this component
// is only the overlay, so render it as that element's first child.
export default function LoaderSection() {
  return (
    <div className="loader-section">
      <div>
        <img src="/assets/animate/loader-ten.gif" alt="loader" />
      </div>
    </div>
  );
}
