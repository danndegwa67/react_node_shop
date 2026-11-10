import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';
import { ShoppingBag, Search, Check, RefreshCw, X, SlidersHorizontal, Filter } from 'lucide-react';

const BACKEND_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";
const MHENIK_WHATSAPP_NUMBER = "254716687687";

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
  const [previewImage, setPreviewImage] = useState(null);

  // 🚗 Vehicle Matcher State (Form input vs Locked committed state)
  const [selectedVehicle, setSelectedVehicle] = useState({ make: '', model: '', year: '' });
  const [lockedVehicle, setLockedVehicle] = useState(null);

  const categories = [
    { label: "All Spares", value: "" },
    { label: "Mirrors & Glass", value: "MIRROR" },
    { label: "Bumpers & Body Slides", value: "BUMPER" },
    { label: "Headlamps & Lighting", value: "LAMP" },
    { label: "Mouldings & Trims", value: "MOULDING" },
    { label: "Weatherstrips & Seals", value: "WEATHERSTRIP" },
    { label: "Grilles", value: "GRILLE" },
    { label: "Prado Suspension & Airbags", value: "PRADO" }
  ];

  // Only runs query on: search, category, page, or committed lockedVehicle
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    let activeSearchQuery = category ? `${category} ${search}`.trim() : search;

    // Apply locked vehicle criteria (hierarchical: make, make+model, or make+model+year)
    if (lockedVehicle && lockedVehicle.make) {
      const vehicleKeywords = [lockedVehicle.make, lockedVehicle.model, lockedVehicle.year]
        .filter(Boolean)
        .join(' ');
      activeSearchQuery = `${vehicleKeywords} ${activeSearchQuery}`.trim();
    }

    fetchProducts(activeSearchQuery, page, 12)
      .then(res => {
        if (!isCurrent) return;
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        if (!isCurrent) return;
        console.error("Error connecting to inventory grid:", err);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [search, category, page, lockedVehicle]);

  // Lock vehicle: only requires `make` at minimum (hierarchical top-down)
  const handleVehicleApply = (e) => {
    e.preventDefault();
    if (!selectedVehicle.make) return;

    setLockedVehicle({
      make: selectedVehicle.make,
      model: selectedVehicle.model || '',
      year: selectedVehicle.year || ''
    });
    setPage(1);
  };

  const handleResetVehicle = () => {
    setSelectedVehicle({ make: '', model: '', year: '' });
    setLockedVehicle(null);
    setPage(1);
  };

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
    setAlertMsg(`Added "${name}" to cart`);
    setTimeout(() => setAlertMsg(''), 2500);
    window.dispatchEvent(new Event('storage'));
  };

  const openWhatsAppInquiry = (product, name, cost) => {
    const vehicleFit = product.vehicle ? `${product.vehicle.make} ${product.vehicle.model}` : "Universal Fit";
    const message = `Hello Mhenik Traders! 👋 I am inquiring about the following spare part:\n\n` +
                    `*Item:* ${name}\n` +
                    `*Price:* KES ${Number(cost).toLocaleString()}\n` +
                    `*Vehicle Fit:* ${vehicleFit}\n\n` +
                    `Is this currently available at your shop?`;
    window.open(`https://wa.me/${MHENIK_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const cleanTitle = (str) => {
    if (!str) return "Automotive Spare";
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isLocked = Boolean(lockedVehicle && lockedVehicle.make);

  return (
    <div className="w-100">
      {alertMsg && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="alert alert-dark border-0 shadow-sm fw-bold rounded-1 small">{alertMsg}</div>
        </div>
      )}

      {/* 📱 MOBILE FILTER DROPDOWN BAR */}
      <div className="d-block d-lg-none bg-white border rounded-1 p-2.5 mb-3 shadow-xs">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted d-flex align-items-center gap-1 small font-monospace fw-semibold">
            <Filter size={13} className="text-danger" /> Category:
          </span>
          <select 
            className="form-select form-select-sm rounded-1 shadow-none flex-grow-1"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            style={{ fontSize: '13px' }}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {category && (
            <button 
              type="button" 
              onClick={() => { setCategory(''); setPage(1); }}
              className="btn btn-sm btn-outline-secondary rounded-1 p-1 d-flex align-items-center justify-content-center"
              style={{ width: '28px', height: '28px' }}
              title="Reset Category"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="row g-4 text-start">
        
        {/* ──────── 1. LEFT SIDEBAR FILTER RAIL ──────── */}
        <aside className="col-lg-3 col-xl-2.5 d-none d-lg-block">
          <div className="border rounded-1 bg-white p-3 shadow-xs sticky-top" style={{ top: '80px', zIndex: 10 }}>
            
            <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
              <span className="fw-bold text-uppercase font-monospace small text-dark" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                Catalog Filters
              </span>
              {(category || search || isLocked) && (
                <button 
                  type="button" 
                  onClick={() => { setCategory(''); setSearch(''); handleResetVehicle(); }}
                  className="btn btn-link p-0 text-muted small text-decoration-none d-flex align-items-center gap-1"
                  style={{ fontSize: '11px' }}
                >
                  <RefreshCw size={11} /> Reset All
                </button>
              )}
            </div>

            {/* Category Navigation Tree */}
            <div className="mb-4">
              <label className="fw-bold small text-muted text-uppercase font-monospace mb-2 d-block" style={{ fontSize: '11px' }}>
                Categories
              </label>
              <div className="d-flex flex-column gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => { setCategory(cat.value); setPage(1); }}
                    className={`btn btn-sm text-start border-0 rounded-1 px-2 py-1.5 d-flex justify-content-between align-items-center transition-all ${
                      category === cat.value 
                        ? 'bg-danger text-white fw-semibold' 
                        : 'text-secondary hover-bg-light'
                    }`}
                    style={{ fontSize: '12.5px' }}
                  >
                    <span>{cat.label}</span>
                    {category === cat.value && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Compatibility Filter (Top-Down lockable) */}
            <div className="pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-bold small text-muted text-uppercase font-monospace m-0 d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                  <SlidersHorizontal size={12} /> Vehicle Matcher
                </label>
                {isLocked && (
                  <span className="badge bg-success bg-opacity-10 text-success rounded-1" style={{ fontSize: '9px' }}>
                    Locked
                  </span>
                )}
              </div>

              <form onSubmit={handleVehicleApply} className="d-flex flex-column gap-2 mt-2">
                {/* 1. Make (Required for locking) */}
                <div>
                  <select 
                    className="form-select form-select-sm rounded-1 shadow-none" 
                    value={selectedVehicle.make} 
                    onChange={(e) => setSelectedVehicle({ make: e.target.value, model: '', year: '' })} 
                    disabled={isLocked}
                    style={{ fontSize: '12px' }}
                  >
                    <option value="">Select Make</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Isuzu">Isuzu</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                  </select>
                </div>

                {/* 2. Model (Dependent on Make) */}
                <div>
                  <select 
                    className="form-select form-select-sm rounded-1 shadow-none" 
                    value={selectedVehicle.model} 
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, model: e.target.value, year: '' })} 
                    disabled={!selectedVehicle.make || isLocked}
                    style={{ fontSize: '12px' }}
                  >
                    <option value="">Select Model (Optional)</option>
                    {selectedVehicle.make === 'Toyota' && (
                      <>
                        <option value="Corolla">Corolla</option>
                        <option value="Prado">Prado Land Cruiser</option>
                        <option value="Hilux">Hilux</option>
                      </>
                    )}
                    {selectedVehicle.make && selectedVehicle.make !== 'Toyota' && (
                      <option value="Generic">Standard Fleet Model</option>
                    )}
                  </select>
                </div>

                {/* 3. Year (Dependent on Model) */}
                <div>
                  <select 
                    className="form-select form-select-sm rounded-1 shadow-none" 
                    value={selectedVehicle.year} 
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, year: e.target.value })} 
                    disabled={!selectedVehicle.model || isLocked}
                    style={{ fontSize: '12px' }}
                  >
                    <option value="">Select Year (Optional)</option>
                    <option value="2020">2020</option>
                    <option value="2018">2018</option>
                    <option value="2015">2015</option>
                    <option value="2012">2012</option>
                  </select>
                </div>

                {isLocked ? (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger rounded-1 w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1 mt-1" 
                    onClick={handleResetVehicle}
                    style={{ fontSize: '11px', height: '30px' }}
                  >
                    <X size={12} /> Clear Filter
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn btn-sm btn-dark rounded-1 w-100 fw-semibold mt-1" 
                    disabled={!selectedVehicle.make}
                    style={{ fontSize: '11px', height: '30px' }}
                  >
                    Lock Vehicle
                  </button>
                )}
              </form>
            </div>

          </div>
        </aside>

        {/* ──────── 2. MAIN CATALOG GRID (Individual Standalone Cards) ──────── */}
        <main className="col-lg-9 col-xl-9.5">
          
          {/* Top Search & Active Match Tracker */}
          <div className="bg-white border rounded-1 p-2.5 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 shadow-xs">
            <div className="input-group" style={{ maxWidth: '360px' }}>
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={14} />
              </span>
              <input 
                type="text"
                className="form-control form-control-sm border-start-0 ps-0 shadow-none fs-6"
                placeholder="Search spare parts or OEM keywords..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div className="d-flex align-items-center gap-2">
              {isLocked && (
                <span className="badge bg-light text-dark border rounded-1 font-monospace small px-2 py-1">
                  🚗 {[lockedVehicle.make, lockedVehicle.model, lockedVehicle.year].filter(Boolean).join(' ')}
                </span>
              )}
              <div className="text-muted small font-monospace">
                Page <strong className="text-dark">{page}</strong> of <strong className="text-dark">{totalPages}</strong>
              </div>
            </div>
          </div>

          {/* Standalone Individual Cards Grid */}
          {loading ? (
            <div className="text-center py-5 bg-white border rounded-1">
              <div className="spinner-border text-danger spinner-border-sm mb-2" role="status"></div>
              <p className="small text-muted mb-0 font-monospace">Loading catalog items...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 bg-white border rounded-1">
              <p className="text-muted fw-bold mb-1">No parts match your filter selection.</p>
              <button 
                type="button" 
                onClick={() => { setCategory(''); setSearch(''); handleResetVehicle(); }}
                className="btn btn-sm btn-outline-dark rounded-1 mt-2"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="row g-3 g-md-4">
              {products.map((p) => {
                const rawName = p.productName || p.product_name || "Unknown Component";
                const displayName = cleanTitle(rawName);
                const cost = p.sellingPrice || p.price || 4500;
                const vehicleFit = p.vehicle ? `${p.vehicle.make} ${p.vehicle.model}` : "Universal Fit";
                const imageUrl = resolveImageUrl(p.imageUrl);

                return (
                  <div className="col-6 col-md-4 col-xl-3" key={p.sku}>
                    <div className="standalone-product-card h-100 d-flex flex-column justify-content-between p-3 bg-white border rounded-1 shadow-xs">
                      
                      {/* Image Frame */}
                      <div 
                        className="position-relative w-100 d-flex align-items-center justify-content-center mb-3"
                        style={{ height: '170px', cursor: 'zoom-in' }}
                        onClick={() => setPreviewImage({ url: imageUrl, name: displayName, sku: p.sku })}
                      >
                        <img 
                          src={imageUrl} 
                          alt={displayName}
                          loading="lazy"
                          decoding="async"
                          className="img-fluid object-fit-contain w-100 h-100 product-img-zoom"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/744/744465.png";
                          }}
                        />
                      </div>

                      {/* Content Section */}
                      <div className="d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          {/* Fitment Line */}
                          <div className="text-muted small text-truncate mb-1" style={{ fontSize: '10.5px' }}>
                            {vehicleFit}
                          </div>

                          {/* 2-Line Product Title */}
                          <h6 
                            className="text-dark fw-normal mb-3" 
                            title={displayName} 
                            style={{ 
                              fontSize: '13px', 
                              lineHeight: 1.35, 
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden',
                              minHeight: '35px'
                            }}
                          >
                            {displayName}
                          </h6>
                        </div>

                        {/* Price + Action Buttons Row */}
                        <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                          <div className="fw-bold text-danger font-monospace" style={{ fontSize: '13.5px' }}>
                            KES {Number(cost).toLocaleString()}
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            {/* WhatsApp Enquiry Button */}
                            <button 
                              type="button"
                              className="btn btn-sm btn-outline-secondary rounded-1 p-0 d-flex align-items-center justify-content-center"
                              style={{ width: '28px', height: '28px', borderColor: '#e5e7eb' }}
                              title="Ask via WhatsApp"
                              onClick={() => openWhatsAppInquiry(p, displayName, cost)}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                              </svg>
                            </button>

                            {/* Cart Icon Button */}
                            <button 
                              type="button"
                              className="btn btn-sm btn-dark text-white rounded-1 p-0 d-flex align-items-center justify-content-center"
                              style={{ width: '28px', height: '28px' }}
                              title="Add to Cart"
                              onClick={() => addToCart(p)}
                            >
                              <ShoppingBag size={13} />
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-1 mt-4 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary rounded-1 px-3" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </button>
              <span className="align-self-center px-3 small font-monospace text-muted">
                {page} / {totalPages}
              </span>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary rounded-1 px-3" 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Lightbox Modal */}
      {previewImage && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0, 0, 0, 0.75)', zIndex: 2000, cursor: 'zoom-out' }}
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="position-relative bg-white p-4 rounded-1 shadow-lg text-center" 
            style={{ maxWidth: '85vw', maxHeight: '85vh', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-3" 
              aria-label="Close" 
              onClick={() => setPreviewImage(null)}
            ></button>
            <img 
              src={previewImage.url} 
              alt={previewImage.name} 
              className="img-fluid" 
              style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain' }} 
            />
            <div className="mt-3 text-center">
              <h6 className="fw-bold text-dark mb-0">{previewImage.name}</h6>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .standalone-product-card {
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.2s ease;
        }
        .standalone-product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          border-color: #cbd5e1 !important;
        }
        .product-img-zoom {
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .standalone-product-card:hover .product-img-zoom {
          transform: scale(1.05);
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}