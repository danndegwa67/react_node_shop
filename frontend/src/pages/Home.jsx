import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide transition every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? 1 : 0));

  return (
    <div className="container py-5">
      
      {/* 🌟 2-PART SLIDING HERO CAROUSEL */}
      <section 
        className="card border-0 shadow-sm mb-5 rounded-mhenik overflow-hidden position-relative" 
        style={{ 
          minHeight: '440px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        {/* Slides Track */}
        <div 
          className="d-flex w-100 h-100"
          style={{ 
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {/* ────── SLIDE 1: BRAND IDENTITY ────── */}
          <div 
            className="w-100 flex-shrink-0 p-4 p-md-5 d-flex align-items-center text-white"
            style={{ backgroundColor: 'rgb(110, 110, 110)', backdropFilter: 'blur(5px)' }}
          >
            <div className="row align-items-center g-4 w-100 m-0">
              {/* Left Side: Logo */}
              <div className="col-md-6 text-center animate-hero-logo">
                <img 
                  src="/logo1.jpeg" 
                  alt="Mhenik Traders Shield Logo" 
                  className="img-fluid py-2 rounded-mhenik"
                  style={{ 
                    maxHeight: '340px', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.25))',
                    borderRadius: '20px',
                  }} 
                />
              </div>

              {/* Right Side: Text Information */}
              <div className="col-md-6 text-center text-md-start animate-hero-text-delayed">
                <span className="badge bg-white text-mhenik-crimson fw-bold px-3 py-2 rounded-pill text-uppercase font-monospace mb-3 small tracking-wider">
                  Official Inventory Platform
                </span>
                <h1 className="display-5 fw-black mb-3 text-uppercase font-monospace tracking-tight">
                  MHENIK TRADERS
                </h1>
                <p className="lead text-light mb-0 fs-5 opacity-90 lh-base">
                  Your trusted source for genuine automotive spare parts, mechanical components, and heavy-duty vehicle accessories.
                </p>
              </div>
            </div>
          </div>

          {/* ────── SLIDE 2: HIGH PERFORMANCE SPARES ────── */}
          <div 
            className="w-100 flex-shrink-0 p-4 p-md-5 d-flex align-items-center text-dark"
            style={{ backgroundColor: '#f5f5f3' }}
          >
            <div className="row align-items-center g-4 w-100 m-0">
              {/* Left Side: Performance Image */}
              <div className="col-md-6 text-center">
                <img 
                  src="/hero-parts.png" 
                  alt="Mhenik Performance Parts" 
                  className="img-fluid py-2 animate-hero-logo"
                  style={{ 
                    maxHeight: '320px', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.12))',
                    borderRadius: '16px'
                  }} 
                />
              </div>

              {/* Right Side: Parts Inventory Message & Compact Button */}
              <div className="col-md-6 text-center text-md-start animate-hero-text-delayed">
                <span className="badge bg-danger bg-opacity-10 text-danger fw-bold px-3 py-2 rounded-pill text-uppercase font-monospace mb-3 small tracking-wider">
                  Performance &amp; Replacement
                </span>
                <h1 className="display-5 fw-black mb-3 text-uppercase font-monospace tracking-tight text-dark">
                  GENUINE AUTO SPARES
                </h1>
                <p className="lead text-secondary mb-4 fs-5 lh-base">
                  Precision-engineered brake calipers, high-durability coilover dampers, and certified suspension components ready for dispatch.
                </p>
                <Link 
                  to="/shop" 
                  className="btn btn-dark rounded-mhenik fw-bold px-4 py-2.5 shadow-sm text-uppercase tracking-wide rounded-3 text-white border-0 transition-hover"
                  style={{ fontSize: '0.82rem', letterSpacing: '0.5px' }}
                >
                  Shop Parts Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ◀️ Left Arrow Toggle */}
        <button 
          type="button"
          onClick={prevSlide}
          className="btn btn-sm btn-dark position-absolute start-0 top-50 translate-middle-y ms-2 ms-md-3 rounded-circle p-2 bg-dark bg-opacity-25 border-0 text-white-50 opacity-40 hover-arrow"
          style={{ zIndex: 10, width: '40px', height: '40px', transition: 'all 0.2s ease' }}
          aria-label="Previous slide"
        >
          &#10094;
        </button>

        {/* ▶️ Right Arrow Toggle */}
        <button 
          type="button"
          onClick={nextSlide}
          className="btn btn-sm btn-dark position-absolute end-0 top-50 translate-middle-y me-2 ms-md-3 rounded-circle p-2 bg-dark bg-opacity-25 border-0 text-white-50 opacity-40 hover-arrow"
          style={{ zIndex: 10, width: '40px', height: '40px', transition: 'all 0.2s ease' }}
          aria-label="Next slide"
        >
          &#10095;
        </button>

        {/* 🔘 Slide Indicators */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2" style={{ zIndex: 10 }}>
          <button 
            type="button" 
            onClick={() => setCurrentSlide(0)} 
            className={`border-0 rounded-pill transition-all ${currentSlide === 0 ? 'bg-dark' : 'bg-dark opacity-25'}`}
            style={{ width: currentSlide === 0 ? '24px' : '8px', height: '8px', transition: 'all 0.3s ease' }}
            aria-label="Slide 1"
          />
          <button 
            type="button" 
            onClick={() => setCurrentSlide(1)} 
            className={`border-0 rounded-pill transition-all ${currentSlide === 1 ? 'bg-dark' : 'bg-dark opacity-25'}`}
            style={{ width: currentSlide === 1 ? '24px' : '8px', height: '8px', transition: 'all 0.3s ease' }}
            aria-label="Slide 2"
          />
        </div>
      </section>

      {/* Main Profile Panel: Styled with custom glass rounding */}
      <div className="card border-0 shadow-sm p-4 p-md-5 rounded-mhenik card-mhenik-glass animate-hero-text-delayed">
        <h2 className="h3 text-dark fw-bold border-bottom border-3 pb-2 mb-4" style={{ borderColor: '#612940' }}>
          About Our Company
        </h2>
        <p className="text-muted fs-5 lh-base">
          Welcome to <strong>Mhenik Traders</strong>. We are a premier automotive spare parts supplier dedicated to keeping fleets and personal vehicles operating at peak mechanical efficiency. Our extensive commercial stock includes a massive catalog of nearly 4,000 components carefully organized by precise manufacturing reference keys and individual product SKUs.
        </p>
        <p className="text-muted fs-5 lh-base mb-5">
          Whether you are sourcing specific engine parts, pipe frameworks, or structural body accessories, our inventory framework ensures high compatibility matching, reducing ordering downtime and delivery delays.
        </p>

        {/* Pillars Row */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="feature-box h-100 py-2">
              <h5 className="fw-bold text-dark mb-2">Genuine Tracking</h5>
              <p className="text-muted small mb-0">
                Every item maps to a verified catalog SKU to ensure direct vehicle compatibility.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-box h-100 py-2">
              <h5 className="fw-bold text-dark mb-2">Categorized Supply</h5>
              <p className="text-muted small mb-0">
                Fast discovery across structural engine segments, filtration, and custom piping assembly.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-box h-100 py-2">
              <h5 className="fw-bold text-dark mb-2">Direct Inquiries</h5>
              <p className="text-muted small mb-0">
                Instant verification loops connected directly to our support line over standard communication APIs.
              </p>
            </div>
          </div>
        </div>

        {/* Official Channels Block */}
        <h3 className="h5 text-dark fw-bold mb-3">Official Channels &amp; Physical Location</h3>
        <div className="p-4 rounded-3 border bg-white bg-opacity-60">
          <div className="row g-3">
            <div className="col-md-6">
              <p className="mb-2 fs-6">📍 <strong>Physical Location:</strong> Nairobi, Kenya</p>
              <p className="mb-0 fs-6">📞 <strong>Primary Phone Enquiries:</strong> +254 716 687687</p>
            </div>
            <div className="col-md-6">
              <p className="mb-2 fs-6">✉️ <strong>Corporate Email Address:</strong> mhenikt@gmail.com</p>
              <p className="mb-0 fs-6">⏱️ <strong>Operating Hours:</strong> Mon – Sat | 8:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ LOCATION GEOLOCATION MAP CONTAINER */}
      <section className="card border-0 rounded-mhenik shadow-sm p-3 p-md-4 mt-5 mb-5 bg-white rounded-3 animate-hero-text-delayed">
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-2 mb-3 px-1">
            <i className="bi bi-map-fill text-secondary fs-5"></i>
            <span className="fw-bold text-secondary text-uppercase font-monospace small tracking-wider">
              Where to find us
            </span>
          </div>

          <div 
            className="position-relative w-100 overflow-hidden rounded-3 shadow-sm" 
            style={{ 
              height: 'calc(250px + 10vw)', 
              minHeight: '280px', 
              maxHeight: '450px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <iframe
              title="Mhenik Traders Location"
              src="https://maps.google.com/maps?q=MHENIK+TRADERS+49+Kirinyaga+Rd+Nairobi&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* 🌐 SOCIAL MEDIA ENGAGEMENT FOOTER STRIP */}
      <section className="card border-0 rounded-mhenik shadow-sm p-4 p-md-5 mt-5 mb-1 bg-white text-center rounded-3 animate-hero-text-delayed">
        <div className="container">
          <h2 className="fw-bold mb-2 text-dark font-monospace" style={{ fontSize: 'calc(22px + 0.5vw)' }}>
            Follow us on social media
          </h2>
          <p className="text-muted fs-6 mb-4 font-monospace fw-semibold">
            All the latest news for you
          </p>

          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 pt-2">
            <a href="https://www.tiktok.com/@mheniktraders8?_r=1&_t=ZS-99ZSFntMUY0" target="_blank" rel="noreferrer" className="text-decoration-none social-link-item">
              <i className="bi bi-tiktok d-block fs-2 text-dark mb-1"></i>
              <span className="small fw-bold text-secondary font-monospace">TikTok</span>
            </a>
          </div>
        </div>
      </section>

      {/* Styled utilities for smooth slide overlays */}
      <style>{`
        .hover-arrow:hover { 
          opacity: 0.95 !important; 
          background-color: rgba(0,0,0,0.5) !important;
          color: #fff !important;
        }
        .transition-hover {
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .transition-hover:hover {
          transform: translateY(-1.5px);
          background-color: #1e1e24 !important;
        }
      `}</style>

    </div>
  );
}

export default Home;