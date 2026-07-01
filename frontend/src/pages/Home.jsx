import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container py-5">
      
      {/* 🌟 SPLIT HERO BANNER: Enhanced Rounding & Slight Translucent Depth */}
      <section 
        className="card border-0 shadow-sm p-4 p-md-5 mb-5 text-white rounded-mhenik overflow-hidden" 
        style={{ backgroundColor: 'rgba(97, 41, 64, 0.94)', backdropFilter: 'blur(5px)' }}
      >
        <div className="row align-items-center g-4">
          <div className="col-md-6 text-center">
            <img 
              src="/logo.png" 
              alt="Mhenik Traders Shield Logo" 
              className="img-fluid py-2"
              style={{ 
                maxHeight: '360px', 
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))',
                borderRadius: '20px'
              }} 
            />
          </div>

          <div className="col-md-6 text-center text-md-start">
            <span className="badge bg-white text-mhenik-crimson fw-bold px-3 py-2 rounded-pill text-uppercase font-monospace mb-3 small tracking-wider">
              Official Inventory Platform
            </span>
            <h1 className="display-5 fw-black mb-3 text-uppercase font-monospace tracking-tight">
              MHENIK TRADERS
            </h1>
            <p className="lead text-light mb-4 fs-5 opacity-90 lh-base">
              Your trusted source for genuine automotive spare parts, mechanical components, and heavy-duty vehicle accessories.
            </p>
            <Link to="/shop" className="btn btn-mhenik-secondary btn-lg fw-bold px-5 py-3 shadow-sm text-dark text-uppercase tracking-wide rounded-3">
              Explore Inventory (4,000+ Items)
            </Link>
          </div>
        </div>
      </section>

      {/* Main Profile Panel: Styled with custom glass rounding */}
      <div className="card border-0 shadow-sm p-4 p-md-5 rounded-mhenik card-mhenik-glass">
        <h2 className="h3 text-dark fw-bold border-bottom border-3 pb-2 mb-4" style={{ borderColor: '#612940' }}>
          About Our Company
        </h2>
        <p className="text-muted fs-5 lh-base">
          Welcome to <strong>Mhenik Traders</strong>. We are a premier automotive spare parts supplier dedicated to keeping fleets and personal vehicles operating at peak mechanical efficiency[cite: 1]. Our extensive commercial stock includes a massive catalog of nearly 4,000 components carefully organized by precise manufacturing reference keys and individual product SKUs[cite: 1].
        </p>
        <p className="text-muted fs-5 lh-base mb-5">
          Whether you are sourcing specific engine parts, pipe frameworks, or structural body accessories, our inventory framework ensures high compatibility matching, reducing ordering downtime and delivery delays[cite: 1].
        </p>

        {/* Pillars Row */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="p-4 rounded-3 border-start border-4 h-100 shadow-xs bg-white bg-opacity-70" style={{ borderColor: '#612940' }}>
              <h5 className="fw-bold text-dark mb-2">Genuine Tracking</h5>
              <p className="text-muted small mb-0">Every item maps to a verified catalog SKU to ensure direct vehicle compatibility[cite: 1].</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 rounded-3 border-start border-4 h-100 shadow-xs bg-white bg-opacity-70" style={{ borderColor: '#612940' }}>
              <h5 className="fw-bold text-dark mb-2">Categorized Supply</h5>
              <p className="text-muted small mb-0">Fast discovery across structural engine segments, filtration, and custom piping assembly[cite: 1].</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 rounded-3 border-start border-4 h-100 shadow-xs bg-white bg-opacity-70" style={{ borderColor: '#612940' }}>
              <h5 className="fw-bold text-dark mb-2">Direct Inquiries</h5>
              <p className="text-muted small mb-0">Instant verification loops connected directly to our support line over standard communication APIs[cite: 1].</p>
            </div>
          </div>
        </div>

        {/* Official Channels Block */}
        <h3 className="h5 text-dark fw-bold mb-3">Official Channels & Physical Location</h3>
        <div className="p-4 rounded-3 border bg-white bg-opacity-60">
          <div className="row g-3">
            <div className="col-md-6">
              <p className="mb-2 fs-6">📍 <strong>Physical Location:</strong> Nairobi, Kenya</p>
              <p className="mb-0 fs-6">📞 <strong>Primary Phone Enquiries:</strong> +254 XXX XXX XXX</p>
            </div>
            <div className="col-md-6">
              <p className="mb-2 fs-6">✉️ <strong>Corporate Email Address:</strong> info@mheniktraders.com</p>
              <p className="mb-0 fs-6">⏱️ <strong>Operating Hours:</strong> Mon – Sat | 8:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;