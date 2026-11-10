import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const navbarRef = useRef(null);

  const updateCount = () => {
    const storedCart = JSON.parse(localStorage.getItem('mhenik_cart')) || [];
    setCartCount(storedCart.reduce((sum, item) => sum + item.qty, 0));
  };

  const closeMenu = () => {
    const menuEl = document.getElementById('mainNavbar');
    if (menuEl && menuEl.classList.contains('show')) {
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) toggler.click();
    }
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('storage', updateCount);

    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('storage', updateCount);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <nav 
      ref={navbarRef} 
      className="navbar navbar-expand-lg navbar-light bg-white border-bottom border-light sticky-top py-2 shadow-xs"
      style={{ zIndex: 1030 }}
    >
      <div className="container">
        {/* Transparent Shield Logo replacing plain text */}
        <Link 
          to="/" 
          className="navbar-brand d-flex align-items-center py-1" 
          onClick={closeMenu}
        >
          <img 
            src="/logo-transparent.png" 
            alt="Mhenik Traders" 
            style={{ 
              height: '82px', 
              width: 'auto', 
              objectFit: 'contain' 
            }} 
          />
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2 gap-lg-3">
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link fw-semibold px-2 ${isActive ? 'text-danger' : 'text-secondary'}`}
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/shop" 
                className={({ isActive }) => `nav-link fw-semibold px-2 ${isActive ? 'text-danger' : 'text-secondary'}`}
                onClick={closeMenu}
              >
                Shop Parts
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/blog" 
                className={({ isActive }) => `nav-link fw-semibold px-2 ${isActive ? 'text-danger' : 'text-secondary'}`}
                onClick={closeMenu}
              >
                Blog
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/contact" 
                className={({ isActive }) => `nav-link fw-semibold px-2 ${isActive ? 'text-danger' : 'text-secondary'}`}
                onClick={closeMenu}
              >
                Contact Us
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            <Link 
              to="/cart" 
              className="btn btn-outline-dark position-relative px-3 py-1.5 rounded-1 fw-semibold small" 
              onClick={closeMenu}
            >
              Cart
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link 
              to="/orders" 
              className="btn btn-dark px-3 py-1.5 rounded-1 font-monospace small fw-bold" 
              onClick={closeMenu}
            >
              My Requests
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;