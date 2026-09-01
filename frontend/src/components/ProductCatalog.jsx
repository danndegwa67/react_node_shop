import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';

const BACKEND_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const resolveImageUrl = (url) => {
  const fallback = "https://cdn-icons-png.flaticon.com/512/744/744465.png";
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const reasonableFilters = [
    { label: "All Spares", value: "" },
    { label: "Mirrors", value: "MIRROR" },
    { label: "Bumpers & Slides", value: "BUMPER" },
    { label: "Headlens & Lamps", value: "LAMP" },
    { label: "Mouldings & Trim", value: "MOULDING" },
    { label: "Weatherstrips", value: "WEATHERSTRIP" },
    { label: "Grilles", value: "GRILLE" },
    { label: "Prado Specific", value: "PRADO" }
  ];

  useEffect(() => {
    setLoading(true);
    const activeSearchQuery = category ? `${category} ${search}`.trim() : search;

    fetchProducts(activeSearchQuery, page, 12)
      .then(res => {
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error connecting to inventory grid:", err);
        setLoading(false);
      });
  }, [search, category, page]);

  const addToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem('mhenik_cart')) || [];
    const existingIndex = currentCart.findIndex(item => item.sku === product.sku);
    
    const name = product.productName || product.product_name || "Unknown Component";
    const price = product.sellingPrice || product.price || 4500;

    if (existingIndex > -1) {
      currentCart[existingIndex].qty += 1;
    } else {
      currentCart.push({
        sku: product.sku,
        name: name,
        price: price,
        qty: 1
      });
    }

    localStorage.setItem('mhenik_cart', JSON.stringify(currentCart));
    setAlertMsg(`Added ${name} to cart!`);
    setTimeout(() => setAlertMsg(''), 3000);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="w-100">
      {alertMsg && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="alert alert-success border-0 shadow-sm fw-bold rounded-mhenik">{alertMsg}</div>
        </div>
      )}

      {/* Filter Registry Tabs Row */}
      <div className="card border-0 rounded-mhenik shadow-sm p-4 mb-4" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <span className="text-muted small fw-bold d-block mb-2 text-uppercase tracking-wider">Filter Registry Group</span>
        <div className="d-flex flex-wrap gap-2">
          {reasonableFilters.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`btn btn-sm fw-bold px-3 py-2 rounded-mhenik transition-all ${
                category === tab.value 
                  ? 'btn-primary shadow-sm' 
                  : 'btn-light text-secondary border border-light'
              }`}
              onClick={() => { setCategory(tab.value); setPage(1); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm p-3 fs-6 bg-white rounded-mhenik"
          placeholder="Type an automotive part name or specific model profile keywords..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
      ) : (
        <>
          <div className="row g-4">
            {products.length === 0 ? (
              <div className="col-12 text-center py-5 bg-white rounded-mhenik shadow-sm border">
                <p className="text-muted fw-bold mb-0">No genuine parts match the active filter configurations.</p>
              </div>
            ) : (
              products.map((p) => {
                const name = p.productName || p.product_name || "Unknown Component";
                const cost = p.sellingPrice || p.price || 4500;
                const currentStock = typeof p.stock === 'number' ? p.stock : 0;
                const categoryName = p.category?.name || "General Spare";
                const vehicleFit = p.vehicle ? `${p.vehicle.make} ${p.vehicle.model}` : "Universal Fit";
                const imageUrl = resolveImageUrl(p.imageUrl);

                // Structured JSON-LD object for each product card
                const productSchema = {
                  "@context": "https://schema.org/",
                  "@type": "Product",
                  "name": name,
                  "image": [imageUrl],
                  "description": `Genuine ${categoryName} spare part fit for ${vehicleFit}. Available at Mhenik Traders Nairobi.`,
                  "sku": p.sku,
                  "offers": {
                    "@type": "Offer",
                    "priceCurrency": "KES",
                    "price": cost.toString(),
                    "availability": currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "seller": {
                      "@type": "Organization",
                      "name": "Mhenik Traders"
                    }
                  }
                };

                return (
                  <div className="col-sm-6 col-md-4 col-lg-3" key={p.sku}>
                    {/* Inject Product Schema Markup directly into the DOM for SEO indexing */}
                    <script type="application/ld+json">
                      {JSON.stringify(productSchema)}
                    </script>

                    <div className="card h-100 border-0 shadow-sm bg-white rounded-mhenik overflow-hidden d-flex flex-column justify-content-between">
                      
                      {/* 1. TOP LIGHT GREY IMAGE FRAME WITH RESOLVED IMAGE */}
                      <div 
                        className="position-relative p-3 d-flex align-items-center justify-content-center"
                        style={{ background: '#f4f5f7', height: '170px' }}
                      >
                        <img 
                          src={imageUrl} 
                          alt={name}
                          loading="lazy"
                          decoding="async"
                          className="img-fluid object-fit-cover w-100 h-100"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/744/744465.png";
                          }}
                        />
                      </div>

                      {/* 2. CARD BODY: PRICING, STOCK DETAILS & BADGES */}
                      <div className="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                          {/* Price Tag & SKU Details Row */}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <span className="text-muted d-block" style={{ fontSize: '11px', fontWeight: '500' }}>Price</span>
                              <span className="fw-bold text-dark fs-5 lh-1">
                                KES {Number(cost).toLocaleString()}
                              </span>
                              <span className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>(Inc. VAT)</span>
                            </div>

                            <div className="text-end text-muted font-monospace" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                              <div><strong className="text-dark">SKU:</strong> {p.sku}</div>
                              <div className="text-truncate" style={{ maxWidth: '100px' }}>{categoryName}</div>
                            </div>
                          </div>

                          {/* Availability Badge */}
                          <div className="mb-3">
                            <span 
                              className={`badge rounded-mhenik fw-medium px-2 py-1 ${currentStock > 0 ? 'bg-primary bg-opacity-10 text-primary' : 'bg-danger bg-opacity-10 text-danger'}`} 
                              style={{ fontSize: '11px' }}
                            >
                              {currentStock > 0 ? `${currentStock} units in stock` : 'Out of Stock'}
                            </span>
                          </div>
                        </div>

                        {/* 3. BOTTOM TITLE & VEHICLE FITMENT */}
                        <div className="border-top pt-2 mt-2">
                          <h6 
                            className="fw-bold text-dark mb-1" 
                            title={name} 
                            style={{ 
                              fontSize: '13px', 
                              lineHeight: '1.3', 
                              display: '-webkit-box', 
                              WebkitLineClamp: '2', 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden', 
                              height: '34px' 
                            }}
                          >
                            {name}
                          </h6>
                          <div className="d-flex align-items-center gap-1 mt-1">
                            <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-1.5 py-0.5" style={{ fontSize: '10px' }}>
                              Fit: {vehicleFit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. CART ACTION BUTTON */}
                      <div className="card-footer bg-transparent border-0 pt-0 p-3">
                        <button 
                          type="button"
                          className="btn btn-dark w-100 fw-bold rounded-mhenik py-2" 
                          disabled={currentStock <= 0}
                          onClick={() => addToCart(p)}
                        >
                          {currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              <button type="button" className="btn btn-sm btn-dark px-3 rounded-mhenik" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span className="align-self-center font-monospace px-3 fw-bold text-secondary">Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-sm btn-dark px-3 rounded-mhenik" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}