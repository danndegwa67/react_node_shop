import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Wrench, Truck } from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white text-dark min-vh-100 overflow-hidden">
      
      {/* 🌟 EDITORIAL FLOATING HERO (Slide Crossfade) */}
      <section 
        className="position-relative py-2 py-lg-3 border-bottom" 
        style={{ 
          background: 'radial-gradient(ellipse at 75% 45%, #f1f3f7 0%, #ffffff 65%)',
          minHeight: '68vh',   // 👈 Controls overall vertical height (percentage of viewport)
          display: 'flex',     // 👈 Keeps content vertically balanced
          alignItems: 'center' // 👈 Centers the row inside the height
        }}
      >
        <div className="container py-1 py-lg-2">
          <div className="row align-items-center g-3 g-lg-4">
            
            {/* ─── TEXT & HEADLINE COLUMN ─── */}
            <div className="col-lg-6 text-start d-flex flex-column" style={{ zIndex: 2 }}>
              
              <div className="d-inline-flex align-items-center gap-2 px-2.5 py-1 mb-2 border rounded-1 bg-white shadow-xs" style={{ width: 'fit-content' }}>
                <span className="badge bg-danger rounded-1 p-1"></span>
                <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                  OEM &amp; Genuine Spares
                </span>
              </div>

              <h1 className="hero-heading-editorial text-dark mb-3">
                Precision<br />
                Auto Parts<br />
                for Peak Performance.
              </h1>

              <p className="lead text-secondary mb-3 fs-6 lh-base" style={{ maxWidth: '440px' }}>
                Direct inventory matching for Toyota, Nissan, and commercial fleet chassis. Certified durability, zero counterfeit compromise.
              </p>

              {/* 📱 MOBILE-ONLY SLIDER: Above Action Buttons */}
              <div className="d-block d-lg-none text-center my-2 py-1 position-relative" style={{ height: '280px' }}>
                <img 
                  src="/hero-part-cutout.png" 
                  alt="Precision Performance Spares" 
                  className={`img-fluid position-absolute start-50 top-50 translate-middle transition-hero-slide ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ 
                    maxHeight: '270px', 
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.15))',
                    transform: `translate(-50%, -50%) scale(${currentSlide === 0 ? 1.05 : 0.95})`,
                    transition: 'all 0.8s ease'
                  }}
                  onError={(e) => { e.currentTarget.src = "/logo1.jpeg"; }}
                />
                <img 
                  src="/logo-transparent.png" 
                  alt="Mhenik Traders Crest" 
                  className={`img-fluid position-absolute start-50 top-50 translate-middle transition-hero-slide ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ 
                    maxHeight: '230px', 
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15))',
                    transform: `translate(-50%, -50%) scale(${currentSlide === 1 ? 1.05 : 0.95})`,
                    transition: 'all 0.8s ease'
                  }}
                  onError={(e) => { e.currentTarget.src = "/logo1.jpeg"; }}
                />
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2 gap-sm-3 mb-3 mb-lg-0">
                <Link 
                  to="/shop" 
                  className="btn btn-dark btn-lg rounded-1 fw-bold px-4 py-2.5 fs-6 shadow-sm d-inline-flex align-items-center gap-2"
                >
                  Explore Catalog <ArrowRight size={16} />
                </Link>
                <Link 
                  to="/blog" 
                  className="btn btn-outline-secondary btn-lg rounded-1 fw-semibold px-4 py-2.5 fs-6"
                >
                  Fitment Guides
                </Link>
              </div>

              {/* Specs & Metrics Ticker */}
              <div className="d-flex gap-3 gap-sm-4 mt-3 mt-lg-4 pt-3 border-top">
                <div>
                  <div className="fs-4 fw-bold font-monospace text-dark lh-1 mb-1">4,000+</div>
                  <div className="small text-muted" style={{ fontSize: '11px' }}>Parts Available</div>
                </div>
                <div className="border-end"></div>
                <div>
                  <div className="fs-4 fw-bold font-monospace text-dark lh-1 mb-1">100%</div>
                  <div className="small text-muted" style={{ fontSize: '11px' }}>Traceable OEM</div>
                </div>
                <div className="border-end"></div>
                <div>
                  <div className="fs-4 fw-bold font-monospace text-dark lh-1 mb-1">Nairobi</div>
                  <div className="small text-muted" style={{ fontSize: '11px' }}>Dispatch Hub</div>
                </div>
              </div>

            </div>

            {/* ─── 💻 DESKTOP-ONLY SLIDER: Smooth Crossfade Between Cutout & Transparent Logo ─── */}
            <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center position-relative overflow-visible" style={{ zIndex: 1, height: '480px' }}>
              
              {/* Slide 0: Mechanical Assembly Cutout */}
              <img 
                src="/hero-part-cutout.png" 
                alt="Precision Performance Spares" 
                className={`position-absolute img-fluid ${currentSlide === 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{ 
                  maxHeight: '620px', 
                  width: '130%',
                  maxWidth: '780px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 25px 40px rgba(0, 0, 0, 0.18))',
                  transform: currentSlide === 0 ? 'scale(1.3) translateY(-4px)' : 'scale(1.22) translateY(8px)',
                  transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onError={(e) => { e.currentTarget.src = "/logo1.jpeg"; }}
              />

              {/* Slide 1: High-Resolution Transparent Shield Logo */}
              <img 
                src="/logo-transparent.png" 
                alt="Mhenik Traders Crest" 
                className={`position-absolute img-fluid ${currentSlide === 1 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{ 
                  maxHeight: '440px', 
                  width: 'auto',
                  maxWidth: '520px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 28px 45px rgba(0, 0, 0, 0.22))',
                  transform: currentSlide === 1 ? 'scale(1.08) translateY(-4px)' : 'scale(1.0) translateY(8px)',
                  transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onError={(e) => { e.currentTarget.src = "/logo1.jpeg"; }}
              />

              {/* Subtle Slide Indicators */}
              <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 mb-2" style={{ zIndex: 5 }}>
                <button 
                  type="button" 
                  onClick={() => setCurrentSlide(0)} 
                  className={`border-0 rounded-pill p-0 transition-all ${currentSlide === 0 ? 'bg-dark' : 'bg-secondary bg-opacity-25'}`}
                  style={{ width: currentSlide === 0 ? '22px' : '8px', height: '6px', transition: 'all 0.3s ease' }}
                  aria-label="Slide 1 - Performance Parts"
                />
                <button 
                  type="button" 
                  onClick={() => setCurrentSlide(1)} 
                  className={`border-0 rounded-pill p-0 transition-all ${currentSlide === 1 ? 'bg-dark' : 'bg-secondary bg-opacity-25'}`}
                  style={{ width: currentSlide === 1 ? '22px' : '8px', height: '6px', transition: 'all 0.3s ease' }}
                  aria-label="Slide 2 - Mhenik Logo"
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 🛠️ CORE VALUE PROPOSITION BAR */}
      <section className="py-3 border-bottom bg-white">
        <div className="container">
          <div className="row g-4 text-start">
            <div className="col-md-4 d-flex align-items-start gap-3">
              <ShieldCheck size={26} className="text-danger flex-shrink-0 mt-1" />
              <div>
                <h6 className="fw-bold text-dark mb-1">Authentic Component Guarantee</h6>
                <p className="text-muted small mb-0">Every spare maps directly to OEM manufacturing reference keys.</p>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-start gap-3 border-start-md">
              <Truck size={26} className="text-danger flex-shrink-0 mt-1" />
              <div>
                <h6 className="fw-bold text-dark mb-1">Fast Commercial Delivery</h6>
                <p className="text-muted small mb-0">Prompt dispatch across Nairobi and countrywide courier networks.</p>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-start gap-3 border-start-md">
              <Wrench size={26} className="text-danger flex-shrink-0 mt-1" />
              <div>
                <h6 className="fw-bold text-dark mb-1">Technical Fitment Support</h6>
                <p className="text-muted small mb-0">Direct mechanic assistance to confirm part sizing before order dispatch.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🏢 COMPACT COMPANY PROFILE STATEMENT */}
      <section className="py-4 py-lg-5 bg-light border-bottom">
        <div className="container py-2" style={{ maxWidth: '860px' }}>
          <div className="text-center">
            <span className="text-uppercase font-monospace text-muted fw-bold small tracking-widest d-block mb-2">
              About Mhenik Traders
            </span>
            <h2 className="fw-bold text-dark mb-3">Your Strategic Partner in Fleet Reliability</h2>
            <p className="text-secondary fs-6 lh-lg mb-4">
              Headquartered in Nairobi, Kenya, Mhenik Traders supplies genuine mechanical components, body trims, and heavy-duty suspension gear[cite: 8]. We eliminate compatibility guesswork with standardized catalog SKU indexing, keeping vehicles on the road without costly workshop delays[cite: 8, 18].
            </p>
            <Link to="/contact" className="btn btn-outline-dark rounded-1 fw-bold px-4 py-2 small">
              Visit Our Shop or Contact Dispatch
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero-heading-editorial {
          font-size: 2.25rem;
          font-weight: 300;
          line-height: 1.15;
          letter-spacing: -0.8px;
        }
        @media (min-width: 992px) {
          .hero-heading-editorial {
            font-size: 3.35rem;
            font-weight: 300;
            line-height: 1.1;
            letter-spacing: -1.2px;
          }
        }
        @media (min-width: 768px) {
          .border-start-md {
            border-left: 1px solid #e5e7eb;
          }
        }
      `}</style>

    </div>
  );
}