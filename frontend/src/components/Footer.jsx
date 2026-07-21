import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark text-white-50 pt-5 pb-4 mt-5 border-top border-secondary">
      <div className="container">
        
        {/* Main Footer Links Matrix */}
        <div className="row g-4 mb-4 text-start">
          
          {/* Brand & Mission Segment */}
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold text-white mb-3 text-uppercase font-monospace tracking-wider">
              Mhenik Traders
            </h5>
            <p className="small text-white-50 lh-base mb-2">
              Genuine Automotive Parts & Accessories — Nairobi, Kenya
            </p>
            <p className="small text-secondary opacity-75">
              Providing premium automotive spare parts and heavy-duty mechanical components to keep your fleet operating at peak efficiency.
            </p>
          </div>

          {/* Catalog Operations Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase font-monospace small tracking-wide">
              Marketplace
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/shop" className="text-decoration-none text-white-50 hover-link">Shop Parts</Link></li>
              {/* <li><Link to="/search" className="text-decoration-none text-white-50 hover-link">Vehicle Search</Link></li> */}
              {/* <li><Link to="/categories" className="text-decoration-none text-white-50 hover-link">Categories</Link></li> */}
            </ul>
          </div>

          {/* Corporate / Support Channels */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase font-monospace small tracking-wide">
              Company
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              {/* <li><Link to="/about" className="text-decoration-none text-white-50 hover-link">About Us</Link></li> */}
              <li><Link to="/contact" className="text-decoration-none text-white-50 hover-link">Contact Support</Link></li>
              
            </ul>
          </div>

          {/* Navigation Action Control Panel */}
          <div className="col-lg-4 col-md-12 text-md-start text-lg-end d-flex flex-column justify-content-between align-items-lg-end">
            <div>
              <h6 className="fw-bold text-white mb-2 text-uppercase font-monospace small tracking-wide">
                System Navigation
              </h6>
              <p className="small text-secondary opacity-75 mb-3">Finished exploring? Return easily back to top parameters.</p>
            </div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn btn-sm btn-outline-light text-uppercase font-monospace fw-bold px-3 py-2 btn-to-top"
              style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}
            >
              <i className="bi bi-arrow-up-short align-middle me-1 fs-6"></i> Back to Top
            </button>
          </div>

        </div>

        {/* ⚖️ Legal Framework & Dynamic Copyright Banner */}
        <div className="row pt-4 border-top border-secondary align-items-center g-3 text-center text-md-start">
          <div className="col-md-6 text-white-50 small">
            &copy; {new Date().getFullYear()} <span className="text-white fw-semibold">Mhenik Traders</span>. All Rights Reserved.
          </div>
          <div className="col-md-6 text-md-end d-flex justify-content-center justify-content-md-end gap-3 flex-wrap small">
            <Link to="/terms" className="text-decoration-none text-white-50 hover-legal">Terms &amp; Conditions</Link>
            <span className="text-secondary opacity-25">|</span>
            <Link to="/privacy" className="text-decoration-none text-white-50 hover-legal">Privacy Policy</Link>
          </div>
        </div>

      </div>

      {/* Inline styles helper for clean interaction layers */}
      <style>{`
        .hover-link, .hover-legal { transition: color 0.2s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease; display: inline-block; }
        .hover-link:hover { color: #fff !important; transform: translateX(3px); }
        .hover-legal:hover { color: #fff !important; text-decoration: underline !important; }
        .btn-to-top { transition: all 0.2s ease !important; }
        .btn-to-top:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; transform: translateY(-2px); border-color: #fff !important; }
      `}</style>
    </footer>
  );
}

export default Footer;