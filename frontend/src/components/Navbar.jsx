import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
      <div class="container">
        <Link to="/" class="navbar-brand fw-bold text-info fs-4 tracking-tight">
          MHENIK TRADERS
        </Link>
        <div class="navbar-nav ms-auto d-flex flex-row gap-3">
          <Link to="/" class="nav-link fw-semibold text-light px-2">Home</Link>
          <Link to="/products" class="nav-link fw-semibold text-light px-2">Browse Catalog</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;