import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Core automotive categories for the filter sidebar
  const categories = [
    "Engine Parts", 
    "Brake System", 
    "Suspension & Steering", 
    "Electrical Components", 
    "Body Parts & Trims",
    "Filtration & Fluids"
  ];

  // Fetch data dynamically whenever search, category, or page shifts
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const queryParams = new URLSearchParams({
        search: search,
        category: selectedCategory,
        page: currentPage,
        limit: 12 // 12 items per grid page feels snappy
      });

      fetch(`http://localhost:5000/api/products?${queryParams.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.products);
          setTotalPages(data.totalPages);
          setTotalItems(data.totalItems);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error linking to inventory catalog:", err);
          setLoading(false);
        });
    }, 300); // 300ms debounce prevents slamming the server on every keystroke

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, currentPage]);

  // Reset page number back to 1 if user changes filters
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  return (
    <div class="row g-4">
      {/* 1. Sidebar Search and Filtering Pane (col-md-3) */}
      <div class="col-md-3">
        <div class="card border-0 shadow-sm p-4 sticky-top" style={{ top: '20px', zIndex: 10 }}>
          <h5 class="fw-bold text-dark mb-3">Filter Inventory</h5>
          
          {/* Text input lookup */}
          <div class="mb-4">
            <label class="form-label small fw-semibold text-muted">Search Name or SKU</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="e.g. PRADO, 3161..." 
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Category checklist */}
          <div>
            <label class="form-label small fw-semibold text-muted mb-2">Vehicle Categories</label>
            <div class="d-flex flex-column gap-2">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  class={`btn btn-sm text-start py-2 px-3 rounded ${selectedCategory === cat ? 'btn-primary' : 'btn-light text-secondary'}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {selectedCategory && (
              <button 
                class="btn btn-link btn-sm text-danger mt-3 p-0 text-decoration-none"
                onClick={() => setSelectedCategory('')}
              >
                Clear Category Filter ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Live Inventory Grid Display (col-md-9) */}
      <div class="col-md-9">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <p class="text-muted mb-0">
            Showing <strong class="text-dark">{loading ? '...' : products.length}</strong> of <strong class="text-dark">{totalItems}</strong> matching parts
          </p>
        </div>

        {loading ? (
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Streaming structured catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div class="card border-0 shadow-sm p-5 text-center bg-white rounded-3">
            <h4 class="text-muted fw-bold">No Components Found</h4>
            <p class="text-muted small mb-0">Double check your SKU reference or query keywords.</p>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
              {products.map((product) => (
                <div class="col" key={product.sku}>
                  <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden transition-all hover-shadow">
                    
                    {/* Component Image Box via our css aspect handling tool */}
                    <div class="product-img-container border-bottom">
                      <img 
                        src={`http://localhost:5000/uploads/${product.sku}.jpg`} 
                        alt={product.product_name}
                        onError={(e) => { e.target.src = 'https://placehold.co/300x250?text=No+Image'; }}
                      />
                    </div>

                    {/* Card Specifications Body */}
                    <div class="card-body d-flex flex-column justify-content-between p-3">
                      <div>
                        <div class="d-flex justify-content-between align-items-start mb-1">
                          <span class="badge bg-secondary-subtle text-secondary small font-monospace">{product.sku}</span>
                          <span class="text-muted tiny text-uppercase font-monospace small">{product.category || 'Spare Part'}</span>
                        </div>
                        <h6 class="card-title text-dark fw-bold text-truncate mb-2" title={product.product_name}>
                          {product.product_name}
                        </h6>
                        <p class="card-text text-muted small text-start lh-sm mb-3 text-line-clamp">
                          {product.description || 'Genuine replacement component calibrated for direct vehicle layout compliance.'}
                        </p>
                      </div>

                      <Link to={`/product/${product.sku}`} class="btn btn-outline-primary btn-sm w-100 fw-semibold py-2">
                        View Item Specifications →
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* 3. Bootstrap Pagination Controls Footer */}
            {totalPages > 1 && (
              <nav class="d-flex justify-content-center mt-5">
                <ul class="pagination pagination-sm shadow-sm">
                  <li class={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button class="page-link py-2 px-3" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                      Previous
                    </button>
                  </li>
                  <li class="page-item disabled">
                    <span class="page-link bg-white text-dark py-2 px-3 fw-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                  </li>
                  <li class={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button class="page-link py-2 px-3" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductCatalog;