import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container py-5">
      
      {/* 🌟 SPLIT HERO BANNER: Enhanced Rounding & Slight Translucent Depth */}
      {/* 🌟 SPLIT HERO BANNER: Enhanced Rounding & Slight Translucent Depth */}
<section 
  className="card border-0 shadow-sm p-4 p-md-5 mb-5 text-white rounded-mhenik overflow-hidden" 
  style={{ backgroundColor: 'rgb(110, 110, 110)', backdropFilter: 'blur(5px)', }}
>
  <div className="row align-items-center g-4">
    {/* 🏎️ Left Side: Performance Animation wrapper for Logo Drop-In */}
    <div className="col-md-6 text-center animate-hero-logo">
      <img 
        src="/logo.png" 
        alt="Mhenik Traders Shield Logo" 
        className="img-fluid py-2"
        style={{ 
          maxHeight: '360px', 
          objectFit: 'contain',
          filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))',
          borderRadius: '20px',
        }} 
      />
    </div>

    {/* 📝 Right Side: Delayed Performance Animation wrapper for Text Slide-In */}
    <div className="col-md-6 text-center text-md-start animate-hero-text-delayed">
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
          Welcome to <strong>Mhenik Traders</strong>. We are a premier automotive spare parts supplier dedicated to keeping fleets and personal vehicles operating at peak mechanical efficiency. Our extensive commercial stock includes a massive catalog of nearly 4,000 components carefully organized by precise manufacturing reference keys and individual product SKUs.
        </p>
        <p className="text-muted fs-5 lh-base mb-5">
          Whether you are sourcing specific engine parts, pipe frameworks, or structural body accessories, our inventory framework ensures high compatibility matching, reducing ordering downtime and delivery delays.
        </p>

        {/* Pillars Row */}
        <div className="row g-4 mb-5">
  
  {/* Column 1 */}
  <div className="col-md-4 ">
    <div className="feature-box h-100 py-2 ">
      <h5 className="fw-bold text-dark mb-">Genuine Tracking</h5>
      <p className="text-muted small mb-0">
        Every item maps to a verified catalog SKU to ensure direct vehicle compatibility.
      </p>
    </div>
  </div>

  {/* Column 2 */}
  <div className="col-md-4">
    <div className="feature-box h-100 py-2">
      <h5 className="fw-bold text-dark mb-2">Categorized Supply</h5>
      <p className="text-muted small mb-0">
        Fast discovery across structural engine segments, filtration, and custom piping assembly.
      </p>
    </div>
  </div>

  {/* Column 3 */}
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

      

      {/* 🗺️ LOCATION GEOLOCATION MAP CONTAINER */}
<section className="card border-0 shadow-sm p-3 p-md-4 mt-5 mb-5 bg-white rounded-3">
  <div className="container-fluid">
    
    {/* Minor sub-header context matching your typography */}
    <div className="d-flex align-items-center gap-2 mb-3 px-1">
      <i className="bi bi-map-fill text-secondary fs-5"></i>
      <span className="fw-bold text-secondary text-uppercase font-monospace small tracking-wider">
        Where to find us
      </span>
    </div>

    {/* Responsive Frame Wrapper */}
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
        title="Mhenik Traders Location Map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.277443585257!2d36.81471135!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7eb0254b4d9e1e!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske"
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>

  </div>
</section>

{/* 🌐 SOCIAL MEDIA ENGAGEMENT FOOTER STRIP */}
<section className="card border-0 shadow-sm p-4 p-md-5 mt-5 mb-5 bg-white text-center rounded-3 ">
        <div className="container">
          
          {/* Headings Matching Design */}
          <h2 className="fw-bold mb-2 text-dark font-monospace" style={{ fontSize: 'calc(22px + 0.5vw)' }}>
            Follow us on social media
          </h2>
          <p className="text-muted fs-6 mb-4 font-monospace fw-semibold">
            All the latest news for you
          </p>

          {/* Flex Row Container containing interactive target nodes */}
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 pt-2">
            
            {/* 📘 Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-decoration-none social-link-item">
              <i className="bi bi-facebook d-block fs-2 text-dark mb-1"></i>
              <span className="small fw-bold text-secondary font-monospace">Facebook</span>
            </a>

            {/* 🟥 YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-decoration-none social-link-item">
              <i className="bi bi-youtube d-block fs-2 text-dark mb-1"></i>
              <span className="small fw-bold text-secondary font-monospace">YouTube</span>
            </a>

            {/* 📸 Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-decoration-none social-link-item">
              <i className="bi bi-instagram d-block fs-2 text-dark mb-1"></i>
              <span className="small fw-bold text-secondary font-monospace">Instagram</span>
            </a>

            {/* 🎵 TikTok */}
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="text-decoration-none social-link-item">
              <i className="bi bi-tiktok d-block fs-2 text-dark mb-1"></i>
              <span className="small fw-bold text-secondary font-monospace">TikTok</span>
            </a>

            {/* 🎨 Pinterest */}
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="text-decoration-none social-link-item">
              <i className="bi bi-pinterest d-block fs-2 text-dark mb-1"></i>
              <span className="small fw-bold text-secondary font-monospace">Pinterest</span>
            </a>

          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;