import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const navbarRef = useRef(null); // Reference to track the entire navbar area

  const updateCount = () => {
    const storedCart = JSON.parse(localStorage.getItem('mhenik_cart')) || [];
    setCartCount(storedCart.reduce((sum, item) => sum + item.qty, 0));
  };

  // Safe programmatic toggle wrapper for mobile menus
  const closeMenu = () => {
    const menuEl = document.getElementById('mainNavbar');
    if (menuEl && menuEl.classList.contains('show')) {
      // Bootstrap looks for a standard button target click or a class switch to collapse
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) toggler.click();
    }
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('storage', updateCount);

    // Event listener to check if the user clicked anywhere outside the navbar frame
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
    <nav ref={navbarRef} className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3 border-bottom border-light">
      <div className="container">
        <Link 
    to="/" 
    className="navbar-brand fw-bold fs-4 tracking-tight d-flex align-items-center" 
    style={{ color: '#612940' }} 
    onClick={closeMenu}
  >
    {/* <img 
      src="/logo.png" 
      alt="Mhenik Traders Logo" 
      className="me-2 rounded-2"
      style={{ 
        height: '40px',      
        width: 'auto',       
        objectFit: 'contain'
      }} 
  /> */}
  Mhenik Traders
</Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-3">
            <li className="nav-item">
              <Link to="/" className="nav-link fw-semibold text-secondary px-1 custom-nav-link" onClick={closeMenu}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/shop" className="nav-link fw-semibold text-secondary px-1 custom-nav-link" onClick={closeMenu}>Shop Parts</Link>
            </li>
            <li className="nav-item">
              <Link to="/vehicle-search" className="nav-link fw-semibold text-secondary px-1 custom-nav-link" onClick={closeMenu}>Vehicle Search</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link fw-semibold text-secondary px-1 custom-nav-link" onClick={closeMenu}>About</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link fw-semibold text-secondary px-1 custom-nav-link" onClick={closeMenu}>Contact Us</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="btn btn-light position-relative px-3 py-2 rounded-2 fw-semibold" style={{ border: '1px solid #5FA8D3', color: '#1E1E24' }} onClick={closeMenu}>
              🛒 Cart
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-white" style={{ backgroundColor: '#612940' }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/orders" className="btn px-3 py-2 rounded-2 font-monospace small fw-bold btn-mhenik-primary" onClick={closeMenu}>
              My Requests
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;