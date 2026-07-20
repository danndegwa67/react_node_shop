import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 🚀 Instantly reset viewport scroll parameters on route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}