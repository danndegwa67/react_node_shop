import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';
import { ShoppingBag } from 'lucide-react';

const BACKEND_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";
const MHENIK_WHATSAPP_NUMBER = "254716687687"; // Official Mhenik contact[cite: 23]

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

  const openWhatsAppInquiry = (product, name, cost) => {
    const vehicleFit = product.vehicle ? `${product.vehicle.make} ${product.vehicle.model}` : "Universal Fit";
    const message = `Hello Mhenik Traders! 👋 I would like to inquire about the following spare part:\n\n` +
                    `*Item:* ${name}\n` +
                    `*Price:* KES ${Number(cost).toLocaleString()}\n` +
                    `*Vehicle Fit:* ${vehicleFit}\n\n` +
                    `Is this currently available at your shop?`;
    window.open(`https://wa.me/${MHENIK_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
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
          <div className="row g-3 g-md-4">
            {products.length === 0 ? (
              <div className="col-12 text-center py-5 bg-white rounded-mhenik shadow-sm border">
                <p className="text-muted fw-bold mb-0">No genuine parts match the active filter configurations.</p>
              </div>
            ) : (
              products.map((p) => {
                const name = p.productName || p.product_name || "Unknown Component";
                const cost = p.sellingPrice || p.price || 4500;
                const categoryName = p.category?.name || "General Spare";
                const vehicleFit = p.vehicle ? `${p.vehicle.make} ${p.vehicle.model}` : "Universal Fit";
                const imageUrl = resolveImageUrl(p.imageUrl);

                // Structured JSON-LD object for SEO indexing
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
                    "availability": "https://schema.org/InStock",
                    "seller": {
                      "@type": "Organization",
                      "name": "Mhenik Traders"
                    }
                  }
                };

                return (
                  <div className="col-6 col-md-4 col-lg-3" key={p.sku}>
                    <script type="application/ld+json">
                      {JSON.stringify(productSchema)}
                    </script>

                    <div className="card h-100 border-0 shadow-sm bg-white rounded-mhenik overflow-hidden d-flex flex-column justify-content-between">
                      
                      {/* 1. IMAGE FRAME */}
                      <div 
                        className="position-relative overflow-hidden p-2 d-flex align-items-center justify-content-center"
                        style={{ background: '#f4f5f7', height: '155px', cursor: 'zoom-in' }}
                        onClick={() => setPreviewImage({ url: imageUrl, name, sku: p.sku })}
                        title="Click to view full image"
                      >
                        <img 
                          src={imageUrl} 
                          alt=""
                          aria-hidden="true"
                          className="position-absolute w-100 h-100"
                          style={{
                            objectFit: 'cover',
                            filter: 'blur(16px)',
                            transform: 'scale(1.2)',
                            opacity: 0.25,
                            pointerEvents: 'none'
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/744/744465.png";
                          }}
                        />

                        <img 
                          src={imageUrl} 
                          alt={name}
                          loading="lazy"
                          decoding="async"
                          className="position-relative img-fluid object-fit-contain w-100 h-100"
                          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.12))' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/744/744465.png";
                          }}
                        />
                      </div>

                      {/* 2. COMPACT CARD BODY */}
                      <div className="card-body p-3 d-flex flex-column justify-content-between flex-grow-1">
                        <div>
                          {/* Part Name Priority */}
                          <h6 
                            className="fw-bold text-dark mb-1" 
                            title={name} 
                            style={{ 
                              fontSize: '13px', 
                              lineHeight: '1.25', 
                              display: '-webkit-box', 
                              WebkitLineClamp: '2', 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden', 
                              minHeight: '33px' 
                            }}
                          >
                            {name}
                          </h6>

                          {/* Fitment info */}
                          <div className="d-flex align-items-center gap-1 mb-2">
                            <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium px-1.5 py-0.5 text-truncate" style={{ fontSize: '10px', maxWidth: '100%' }}>
                              Fit: {vehicleFit}
                            </span>
                          </div>
                        </div>

                        {/* 3. PRICE + CART + WHATSAPP ENQUIRY (ALL ON ONE ROW) */}
                        <div className="pt-2 border-top d-flex align-items-center justify-content-between gap-2 mt-auto">
                          {/* Left: Price Column */}
                          <div className="lh-1">
                            <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                              KES {Number(cost).toLocaleString()}
                            </span>
                            {/* <span className="text-muted d-block" style={{ fontSize: '9px', marginTop: '2px' }}>(Inc. VAT)</span> */}
                          </div>

                          {/* Right: Cart and Grey WhatsApp Buttons */}
                          <div className="d-flex align-items-center gap-1 flex-shrink-0">
                            {/* WhatsApp Enquiry Button (Grey) */}
                            <button 
                              type="button"
                              className="btn btn-light border text-secondary rounded-mhenik p-0 d-flex align-items-center justify-content-center"
                              style={{ width: '34px', height: '34px', backgroundColor: '#f8f9fa' }}
                              title="Inquire via WhatsApp"
                              onClick={() => openWhatsAppInquiry(p, name, cost)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                              </svg>
                            </button>

                            {/* Cart Icon Button */}
                            <button 
                              type="button"
                              className="btn btn-dark rounded-mhenik p-0 d-flex align-items-center justify-content-center"
                              style={{ width: '34px', height: '34px' }}
                              title="Add to Cart"
                              onClick={() => addToCart(p)}
                            >
                              <ShoppingBag size={15} />
                            </button>
                          </div>
                        </div>

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

      {/* Lightbox Modal */}
      {previewImage && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0, 0, 0, 0.85)', zIndex: 2000, cursor: 'zoom-out' }}
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="position-relative bg-white p-4 rounded-mhenik shadow-lg text-center" 
            style={{ maxWidth: '90vw', maxHeight: '90vh', cursor: 'default' }}
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
              className="img-fluid rounded" 
              style={{ maxHeight: '72vh', maxWidth: '100%', objectFit: 'contain' }} 
            />

            <div className="mt-3">
              <h6 className="fw-bold text-dark mb-1">{previewImage.name}</h6>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}