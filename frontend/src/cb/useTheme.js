import { useEffect, useState } from 'react';

/**
 * Whether the dark palette is on, as a value components can react to.
 *
 * The palette itself is a `dark` class on <html> (`:root.dark` in the
 * stylesheet), toggled by the sidebar switch. That is fine for anything CSS
 * can restyle on its own, but not for the handful of places that must pick a
 * different RESOURCE for the theme — the rules page frames a separate dark
 * build of its document, which an iframe cannot inherit.
 *
 * Reading the class during render does not work: changing it re-paints, but it
 * does not re-render anyone. The reference keeps the flag in its redux store
 * and re-renders off that; here the switch owns it locally, so this watches the
 * attribute instead. That keeps the two decoupled — whoever sets the class,
 * every reader stays in step.
 */
export default function useDarkTheme() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains('dark'));
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    // A toggle between first render and this effect would otherwise be missed.
    sync();
    return () => observer.disconnect();
  }, []);

  return dark;
}
