import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white text-secondary pt-5 pb-4 mt-5 border-top">
      <div className="container">
        
        {/* Main Footer Links Matrix */}
        <div className="row g-4 mb-5 text-start">
          
          {/* Brand & Location Segment (No Logo - Clean Minimal Typography) */}
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold text-dark mb-3 text-uppercase font-monospace tracking-wider" style={{ fontSize: '13px' }}>
              Mhenik Traders
            </h6>
            <p className="small text-secondary lh-base mb-3" style={{ maxWidth: '320px' }}>
              Genuine automotive spare parts, replacement hardware, and commercial fleet logistics based in Nairobi, Kenya.
            </p>
            <div className="d-flex flex-column gap-1 small text-muted font-monospace" style={{ fontSize: '11px' }}>
              <span className="d-flex align-items-center gap-1.5"><MapPin size={12} className="text-danger" /> 49 Kirinyaga Rd, Nairobi</span>
              <span className="d-flex align-items-center gap-1.5"><Phone size={12} className="text-danger" /> +254 716 687687</span>
              <span className="d-flex align-items-center gap-1.5"><Mail size={12} className="text-danger" /> mhenikt@gmail.com</span>
            </div>
          </div>

          {/* Catalog Operations Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-dark mb-3 text-uppercase font-monospace small" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Catalog
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/shop" className="text-decoration-none text-secondary hover-link">Shop All Parts</Link></li>
              <li><Link to="/blog" className="text-decoration-none text-secondary hover-link">Guides &amp; Articles</Link></li>
              <li><Link to="/cart" className="text-decoration-none text-secondary hover-link">Active Cart</Link></li>
              <li><Link to="/orders" className="text-decoration-none text-secondary hover-link">My Requests</Link></li>
            </ul>
          </div>

          {/* Company / Compliance Channels */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-dark mb-3 text-uppercase font-monospace small" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Company
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/contact" className="text-decoration-none text-secondary hover-link">Contact Desk</Link></li>
              <li><Link to="/faq" className="text-decoration-none text-secondary hover-link">Help &amp; FAQ</Link></li>
              <li>
                <a 
                  href="https://www.tiktok.com/@mheniktraders8?_r=1&_t=ZS-99ZSFntMUY0" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-decoration-none text-secondary hover-link d-inline-flex align-items-center gap-1"
                >
                  TikTok Channel <ArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Dispatch Verification Card */}
          <div className="col-lg-4 col-md-12 text-md-start text-lg-end d-flex flex-column justify-content-between align-items-lg-end">
            <div className="border rounded-1 p-3 bg-light w-100 text-start" style={{ maxWidth: '340px' }}>
              <div className="d-flex align-items-center gap-2 mb-1 text-dark">
                <ShieldCheck size={16} className="text-danger" />
                <span className="small fw-bold font-monospace text-uppercase" style={{ fontSize: '11px' }}>
                  100% Genuine Guarantee
                </span>
              </div>
              <p className="small text-muted mb-0" style={{ fontSize: '11px', lineHeight: 1.5 }}>
                All indexed items match authenticated OEM numbers to eliminate fitment mismatch before shipping.
              </p>
            </div>

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn btn-sm btn-outline-dark rounded-1 font-monospace fw-semibold px-3 py-1.5 mt-3 mt-lg-0"
              style={{ fontSize: '11px' }}
            >
              ↑ Back to Top
            </button>
          </div>

        </div>

        {/* ⚖️ Legal Framework & Dynamic Copyright */}
        <div className="row pt-4 border-top align-items-center g-3 text-center text-md-start">
          <div className="col-md-6 text-muted small" style={{ fontSize: '12px' }}>
            &copy; {new Date().getFullYear()} <strong className="text-dark">Mhenik Traders</strong>. All rights reserved.
          </div>
          <div className="col-md-6 text-md-end d-flex justify-content-center justify-content-md-end gap-3 flex-wrap small" style={{ fontSize: '12px' }}>
            <span className="text-muted">Nairobi, Kenya</span>
            <span className="text-secondary opacity-25">|</span>
            <Link to="/contact" className="text-decoration-none text-muted hover-link">Support Desk</Link>
          </div>
        </div>

      </div>

      <style>{`
        .hover-link { 
          transition: color 0.15s ease, transform 0.15s ease; 
        }
        .hover-link:hover { 
          color: #0f172a !important; 
          transform: translateX(2px); 
        }
      `}</style>
    </footer>
  );
}

export default Footer;