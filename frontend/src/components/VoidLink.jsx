import { useEffect, useRef } from 'react';

/* Renders <a href="javascript:void(0)"> exactly like the reference — React
   blocks javascript: URLs passed as props, so the attribute is set via ref. */
export default function VoidLink({ children, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.setAttribute('href', 'javascript:void(0)');
  }, []);
  return <a ref={ref} {...props}>{children}</a>;
}
