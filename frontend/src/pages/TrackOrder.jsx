import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function TrackOrder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    fetch(`http://localhost:5000/api/orders/track/${encodeURIComponent(searchQuery.trim())}`)
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
        return <span className="badge bg-primary rounded-pill px-3 py-2">ALLOCATED / RESERVED</span>;
      case 'DISPATCHED':
        return <span className="badge bg-success rounded-pill px-3 py-2">✓ DISPATCHED / READY</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="badge bg-danger rounded-pill px-3 py-2">REJECTED</span>;
      default:
        return <span className="badge bg-warning text-dark rounded-pill px-3 py-2">⏳ PENDING VERIFICATION</span>;
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '720px' }}>
      <div className="text-center mb-4">
        <h1 className="h3 fw-bold text-dark">Track Your Order</h1>
        <p className="text-muted">Enter your Order ID or Phone Number to check manifest status.</p>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-mhenik bg-white mb-4">
        <form onSubmit={handleSearch} className="input-group">
          <input 
            type="text" 
            className="form-control form-control-lg rounded-mhenik" 
            placeholder="e.g. +254792986702 or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg rounded-mhenik fw-bold px-4">
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div>
          {results.length === 0 ? (
            <div className="alert alert-light text-center border rounded-mhenik py-4">
              <h6 className="fw-bold text-muted mb-1">No Orders Found</h6>
              <p className="small text-muted mb-0">Verify your reference ID or phone number and try again.</p>
            </div>
          ) : (
            results.map(order => (
              <div key={order.id} className="card border-0 shadow-sm p-4 rounded-mhenik bg-white mb-3">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3 pb-2 border-bottom">
                  <div>
                    <span className="font-monospace text-muted small d-block">Manifest ID: #{order.id.slice(0, 12).toUpperCase()}</span>
                    <strong className="text-dark d-block">{order.customerName}</strong>
                    <span className="text-muted small">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <h6 className="fw-bold small text-muted text-uppercase mb-2">Requested Line Items</h6>
                <div className="d-flex flex-column gap-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-mhenik bg-light border d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="d-block small text-dark">{item.product?.productName || `SKU: ${item.productSku}`}</strong>
                        <span className="font-monospace text-muted" style={{ fontSize: '11px' }}>SKU: {item.productSku}</span>
                      </div>
                      <span className="fw-bold text-primary">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="text-center mt-4">
        <Link to="/" className="text-decoration-none text-muted small">← Back to Storefront Catalog</Link>
      </div>
    </div>
  );
}