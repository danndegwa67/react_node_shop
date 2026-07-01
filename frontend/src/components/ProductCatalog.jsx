import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Keywords explicitly matched to values in your "products in json.json" file[cite: 1]
  const reasonableFilters = [
    { label: "✨ All Spares", value: "" },
    { label: "🪞 Mirrors", value: "MIRROR" },
    { label: "🚗 Bumpers & Slides", value: "BUMPER" },
    { label: "💡 Headlens & Lamps", value: "LAMP" },
    { label: "🛠️ Mouldings & Trim", value: "MOULDING" },
    { label: "🧬 Weatherstrips", value: "WEATHERSTRIP" },
    { label: "🏁 Grilles", value: "GRILLE" },
    { label: "⚙️ Prado Specific", value: "PRADO" } // Sourced directly from your json patterns[cite: 1]
  ];

  useEffect(() => {
    setLoading(true);
    // When a category tab is active, we merge it into the search parameter loop
    // to query text records perfectly even without an explicit category database key
    const activeSearchQuery = category ? `${category} ${search}`.trim() : search;

    fetchProducts(activeSearchQuery, '', page, 12)
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
    
    if (existingIndex > -1) {
      currentCart[existingIndex].qty += 1;
    } else {
      currentCart.push({
        sku: product.sku,
        name: product.product_name,
        price: 4500,
        qty: 1
      });
    }

    localStorage.setItem('mhenik_cart', JSON.stringify(currentCart));
    setAlertMsg(`Added ${product.product_name} to cart!`);
    setTimeout(() => setAlertMsg(''), 3000);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="w-100">
      {alertMsg && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="alert alert-success border-0 shadow-sm fw-bold">{alertMsg}</div>
        </div>
      )}

      {/* 💡 INLINE SEARCH CATEGORIES: Clean Tab Matrix Styled Row */}
      <div className="card border-0 shadow-sm p-3 rounded-mhenik card-mhenik-glass mb-4">
        <span className="text-muted small fw-bold d-block mb-2 text-uppercase tracking-wider">Filter Registry Group</span>
        <div className="d-flex flex-wrap gap-2">
          {reasonableFilters.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`btn btn-sm fw-bold px-3 py-2 rounded-2 transition-all ${
                category === tab.value 
                  ? 'btn-mhenik-primary shadow-sm' 
                  : 'btn-light text-secondary border border-light'
              }`}
              onClick={() => { setCategory(tab.value); setPage(1); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Input Sourcing Query */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm p-3 fs-6 rounded-mhenik bg-white rounded-3"
          placeholder="Type an automotive part name or specific model profile keywords..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-mhenik-crimson"></div></div>
      ) : (
        <>
          <div className="row g-3">
            {products.length === 0 ? (
              <div className="col-12 text-center py-5 bg-white rounded-3 shadow-sm border">
                <p className="text-muted fw-bold mb-0">No genuine parts match the active filter configurations.</p>
              </div>
            ) : (
              /* 💡 Overwrite the products.map card generation loop in frontend/src/components/ProductCatalog.jsx */
        products.map((p) => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={p.sku}>
            <div className="card h-100 border-0 shadow-sm bg-white rounded-3 rounded-mhenik card-mhenik-glass d-flex flex-column justify-content-between hover-lift">
              
              {/* 📸 Clean Image Placeholder Box with fallback layout */}
              <div 
                className="card-img-top d-flex align-items-center justify-content-center bg-light rounded-top-3 border-bottom text-muted position-relative"
                style={{ height: '160px', overflow: 'hidden' }}
              >
                {/* You can swap the source for real file names (e.g. `/images/${p.sku}.jpg`) easily here later */}
                <div className="text-center p-3">
                  <span className="fs-2 d-block mb-1 opacity-50">🔧</span>
                  <span className="text-uppercase tracking-wider font-monospace px-2 py-1 rounded bg-white border border-light small" style={{ fontSize: '10px' }}>
                    No Image Attached
                  </span>
                </div>
              </div>

              <div className="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <span className="badge bg-light text-secondary border font-monospace mb-2 small">{p.sku}</span>
                  <h6 className="fw-bold text-dark text-uppercase lh-base mb-1" style={{ fontSize: '0.85rem', minHeight: '38px' }}>
                    {p.product_name}
                  </h6>
                </div>
                <p className="text-success small fw-bold mt-2 mb-0">Est: Ksh 4,500</p>
              </div>

              <div className="card-footer bg-transparent border-0 pt-0 p-3">
                <button 
                  type="button"
                  className="btn btn-sm btn-mhenik-secondary w-100 fw-bold rounded-2 py-2" 
                  onClick={() => addToCart(p)}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              <button type="button" className="btn btn-sm btn-dark px-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span className="align-self-center font-monospace px-3 fw-bold text-secondary">Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-sm btn-dark px-3" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}