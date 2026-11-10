import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2, Clock, XCircle, Package } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function TrackOrder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    fetch(`${API_BASE}/api/orders/track/${encodeURIComponent(searchQuery.trim())}`)
      .then(res => res.json())
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
        setHasSearched(true);
        setLoading(false);
      })
      .catch(err => {
        console.error("Order search error:", err);
        setLoading(false);
      });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-1 font-monospace px-2 py-1"><CheckCircle2 size={12} className="me-1" /> ALLOCATED</span>;
      case 'DISPATCHED':
        return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-1 font-monospace px-2 py-1"><CheckCircle2 size={12} className="me-1" /> DISPATCHED</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-1 font-monospace px-2 py-1"><XCircle size={12} className="me-1" /> REJECTED</span>;
      default:
        return <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-50 rounded-1 font-monospace px-2 py-1"><Clock size={12} className="me-1" /> PENDING VERIFICATION</span>;
    }
  };

  return (
    <div className="bg-white min-vh-100 py-4 py-md-5 text-start">
      <div className="container" style={{ maxWidth: '720px' }}>
        
        {/* Editorial Header */}
        <div className="border-bottom pb-3 mb-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 px-2 py-0.5 mb-2 border rounded-1 bg-white shadow-xs">
            <span className="badge bg-danger rounded-1 p-1"></span>
            <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Manifest Lookup
            </span>
          </div>
          <h1 className="h3 text-dark fw-light mb-1 tracking-tight">Track Your Order</h1>
          <p className="text-secondary small mb-0">Enter your order ID or registered phone number to verify dispatch progress.</p>
        </div>

        <div className="border rounded-1 p-3 p-md-4 bg-white shadow-xs mb-4">
          <form onSubmit={handleSearch} className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={15} />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0 shadow-none" 
              placeholder="e.g. +254 7XX XXX XXX or Manifest ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
              style={{ fontSize: '13.5px' }}
            />
            <button type="submit" disabled={loading} className="btn btn-dark rounded-1 fw-semibold font-monospace px-4">
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {hasSearched && (
          <div>
            {results.length === 0 ? (
              <div className="alert alert-light border rounded-1 text-center py-4">
                <Package size={30} className="text-muted mb-2 opacity-50" />
                <h6 className="fw-bold text-dark mb-1">No Orders Found</h6>
                <p className="small text-muted mb-0">Verify your reference ID or phone number and try again.</p>
              </div>
            ) : (
              results.map(order => (
                <div key={order.id} className="border rounded-1 p-3.5 bg-white shadow-xs mb-3">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3 pb-2 border-bottom">
                    <div>
                      <span className="font-monospace text-muted small d-block" style={{ fontSize: '11px' }}>
                        Manifest ID: #{order.id.slice(0, 12).toUpperCase()}
                      </span>
                      <strong className="text-dark d-block">{order.customerName}</strong>
                      <span className="text-muted small font-monospace" style={{ fontSize: '11px' }}>
                        {new Date(order.createdAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <span className="font-monospace text-muted small text-uppercase mb-2 d-block" style={{ fontSize: '11px' }}>
                    Requested Line Items
                  </span>
                  <div className="d-flex flex-column gap-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-1 bg-light border d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="d-block small text-dark">{item.product?.productName || `SKU: ${item.productSku}`}</strong>
                          <span className="font-monospace text-muted" style={{ fontSize: '10.5px' }}>SKU: {item.productSku}</span>
                        </div>
                        <span className="fw-bold text-dark font-monospace small">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/shop" className="text-decoration-none text-muted small font-monospace">
            ← Return to Storefront Catalog
          </Link>
        </div>

      </div>
    </div>
  );
}