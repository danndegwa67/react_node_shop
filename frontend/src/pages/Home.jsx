import { Link } from 'react-router-dom';

function Home() {
  return (
    <div class="container py-5">
      
      {/* Jumbotron Hero Section */}
      <section class="bg-primary text-white text-center py-5 px-4 rounded-3 shadow mb-5">
        <h1 class="display-4 fw-black mb-3">MHENIK TRADERS</h1>
        <p class="lead text-light max-w-700 mx-auto mb-4 fs-4">
          Your trusted source for genuine automotive spare parts, mechanical components, and heavy-duty vehicle accessories.
        </p>
        <Link to="/products" class="btn btn-warning btn-lg fw-bold text-dark px-4 py-3 shadow-sm">
          Explore Inventory (4,000+ Items)
        </Link>
      </section>

      {/* Main Corporate Profile Card */}
      <div class="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-3">
        <h2 class="h3 text-dark fw-bold border-bottom border-warning border-3 pb-2 mb-4">
          About Our Company
        </h2>
        <p class="text-muted fs-5 lh-base">
          Welcome to <strong>Mhenik Traders</strong>. We are a premier automotive spare parts supplier dedicated to keeping fleets and personal vehicles operating at peak mechanical efficiency. Our extensive commercial stock includes a massive catalog of nearly 4,000 components carefully organized by precise manufacturing reference keys and individual product SKUs.
        </p>
        <p class="text-muted fs-5 lh-base mb-5">
          Whether you are sourcing specific engine parts, pipe frameworks, or structural body accessories, our inventory framework ensures high compatibility matching, reducing ordering downtime and delivery delays.
        </p>

        {/* Pillars Layout Row */}
        <div class="row g-4 mb-5">
          <div class="col-md-4">
            <div class="p-4 bg-light rounded border-start border-primary border-4 h-100 shadow-xs">
              <h5 class="fw-bold text-dark mb-2">Genuine Tracking</h5>
              <p class="text-muted small mb-0">Every item maps to a verified catalog SKU to ensure direct vehicle compatibility.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 bg-light rounded border-start border-primary border-4 h-100 shadow-xs">
              <h5 class="fw-bold text-dark mb-2">Categorized Supply</h5>
              <p class="text-muted small mb-0">Fast discovery across structural engine segments, filtration, and custom piping assembly.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 bg-light rounded border-start border-primary border-4 h-100 shadow-xs">
              <h5 class="fw-bold text-dark mb-2">Direct Inquiries</h5>
              <p class="text-muted small mb-0">Instant verification loops connected directly to our support line over standard communication APIs.</p>
            </div>
          </div>
        </div>

        {/* Official Channels Block */}
        <h3 class="h5 text-dark fw-bold mb-3">Official Channels & Physical Location</h3>
        <div class="bg-light p-4 rounded-3 border">
          <div class="row g-3">
            <div class="col-md-6">
              <p class="mb-2 fs-6">📍 <strong>Physical Location:</strong> Nairobi, Kenya</p>
              <p class="mb-0 fs-6">📞 <strong>Primary Phone Enquiries:</strong> +254 XXX XXX XXX</p>
            </div>
            <div class="col-md-6">
              <p class="mb-2 fs-6">✉️ <strong>Corporate Email Address:</strong> info@mheniktraders.com</p>
              <p class="mb-0 fs-6">⏱️ <strong>Operating Hours:</strong> Mon – Sat | 8:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;