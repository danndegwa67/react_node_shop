import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = () => {
      const stored = JSON.parse(localStorage.getItem('mhenik_cart')) || [];
      setCartItems(stored);
    };
    loadCart();
    window.addEventListener('storage', loadCart);
    
    if (!localStorage.getItem('mhenik_device_fingerprint')) {
      const randomFingerprint = 'DEV-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      localStorage.setItem('mhenik_device_fingerprint', randomFingerprint);
    }

    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const updateQty = (sku, delta) => {
    const updated = cartItems.map(item => 
      item.sku === sku ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    );
    setCartItems(updated);
    localStorage.setItem('mhenik_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (sku) => {
    const filtered = cartItems.filter(item => item.sku !== sku);
    setCartItems(filtered);
    localStorage.setItem('mhenik_cart', JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage'));
  };

  const processRequestCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!customerName || !customerPhone) {
      alert("Please enter your name and phone number so our warehouse team can reach you.");
      return;
    }

    const deviceId = localStorage.getItem('mhenik_device_fingerprint');
    const administrativeReason = `Phone: ${customerPhone} | Location: ${customerLocation || 'Not Specified'} | Customer Note: Checkout inquiries.`;

    const requestPromises = cartItems.map(item => {
      return fetch(`${API_BASE}/api/client/adjustments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSku: item.sku,
          productName: item.name,
          oldStock: item.stock || 0,
          newStock: item.qty,       
          reason: administrativeReason,
          requestedBy: `${customerName} (${deviceId})`
        })
      }).then(res => {
        if (!res.ok) throw new Error(`Failed update on ${item.sku}`);
        return res.json();
      });
    });

    Promise.all(requestPromises)
      .then(() => {
        alert(`✅ Success! Request logged. Our agents will contact you on ${customerPhone} shortly.`);
        localStorage.removeItem('mhenik_cart');
        window.dispatchEvent(new Event('storage'));
        navigate('/orders');
      })
      .catch(err => {
        console.error("Pipeline failure:", err);
        alert("❌ Error: Verification message failed to sync.");
      });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  return (
    <div className="bg-white min-vh-100 py-4 py-md-5 text-start">
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Editorial Header */}
        <div className="border-bottom pb-3 mb-4">
          <div className="d-inline-flex align-items-center gap-2 px-2 py-0.5 mb-2 border rounded-1 bg-white shadow-xs">
            <span className="badge bg-danger rounded-1 p-1"></span>
            <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Inventory Order Manifest
            </span>
          </div>
          <h1 className="h3 text-dark fw-light mb-1 tracking-tight">Shopping Cart</h1>
          <p className="text-secondary small mb-0">Confirm your parts specifications prior to agent availability logs.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="border rounded-1 p-5 text-center bg-white shadow-xs">
            <ShoppingBag size={40} className="text-muted mb-2 opacity-50" />
            <h5 className="fw-bold text-dark mb-1">Your Cart is Empty</h5>
            <p className="text-muted small mb-4">No spare parts are currently staged for order verification.</p>
            <button 
              type="button" 
              className="btn btn-dark btn-sm rounded-1 px-4 py-2.5 fw-semibold font-monospace" 
              onClick={() => navigate('/shop')}
            >
              Return to Catalog
            </button>
          </div>
        ) : (
          <div className="row g-4">
            
            {/* Left Block: Table List or Form */}
            <div className="col-lg-8">
              {showForm ? (
                <div className="border rounded-1 p-4 bg-white shadow-xs">
                  <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
                    <h6 className="fw-bold text-dark font-monospace text-uppercase mb-0 small" style={{ letterSpacing: '0.8px' }}>
                      Dispatch Contact Information
                    </h6>
                  </div>

                  <form onSubmit={processRequestCheckout} className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Full Name *</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1 shadow-none px-3 py-2" 
                        required 
                        value={customerName} 
                        onChange={e => setCustomerName(e.target.value)} 
                        placeholder="e.g. Joshua Ochieng" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Phone Number *</label>
                      <input 
                        type="tel" 
                        className="form-control form-control-sm rounded-1 shadow-none px-3 py-2" 
                        required 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)} 
                        placeholder="e.g. +254 7XX XXX XXX" 
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Delivery Destination (Optional)</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-1 shadow-none px-3 py-2" 
                        value={customerLocation} 
                        onChange={e => setCustomerLocation(e.target.value)} 
                        placeholder="e.g. Nairobi CBD, Industrial Area, Kisumu" 
                      />
                    </div>
                    <div className="col-12 d-flex gap-3 pt-3 border-top">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary rounded-1 font-monospace fw-semibold px-3 py-2" 
                        onClick={() => setShowForm(false)}
                      >
                        <ArrowLeft size={13} className="me-1" /> Back to Items
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-sm btn-dark rounded-1 font-monospace fw-semibold px-4 py-2 flex-grow-1"
                      >
                        Confirm Availability Request
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border rounded-1 bg-white shadow-xs overflow-hidden">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0 text-start">
                      <thead className="table-light text-secondary small font-monospace">
                        <tr>
                          <th className="py-3 px-3">Component</th>
                          <th className="py-3">Price</th>
                          <th className="py-3 text-center">Qty</th>
                          <th className="py-3 text-end">Total</th>
                          <th className="py-3 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.sku} className="border-bottom">
                            <td className="p-3">
                              <div className="fw-bold text-dark" style={{ fontSize: '13.5px' }}>{item.name}</div>
                              <span className="badge bg-light text-secondary font-monospace border mt-1" style={{ fontSize: '10px' }}>
                                {item.sku}
                              </span>
                            </td>
                            <td className="text-muted font-monospace small">
                              KES {item.price.toLocaleString()}
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm border rounded-1 shadow-none">
                                <button type="button" className="btn btn-light px-2.5 py-1" onClick={() => updateQty(item.sku, -1)}>-</button>
                                <span className="px-3 py-1 bg-white text-dark font-monospace small fw-bold">{item.qty}</span>
                                <button type="button" className="btn btn-light px-2.5 py-1" onClick={() => updateQty(item.sku, 1)}>+</button>
                              </div>
                            </td>
                            <td className="text-end fw-bold text-dark font-monospace small">
                              KES {(item.price * item.qty).toLocaleString()}
                            </td>
                            <td className="text-center">
                              <button 
                                type="button" 
                                className="btn btn-link text-muted p-2 hover-delete" 
                                onClick={() => removeItem(item.sku)}
                                title="Remove component"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Block: Summary Calculations Pane */}
            <div className="col-lg-4">
              <div className="border rounded-1 p-4 bg-white shadow-xs">
                <h6 className="fw-bold text-dark font-monospace text-uppercase pb-2 mb-3 border-bottom small" style={{ letterSpacing: '0.8px' }}>
                  Order Summary
                </h6>
                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Manifest Items:</span>
                  <strong className="text-dark font-monospace">{cartItems.reduce((sum, i) => sum + i.qty, 0)} units</strong>
                </div>
                <div className="d-flex justify-content-between border-top pt-3 mb-4">
                  <span className="fw-bold text-dark">Estimated Subtotal:</span>
                  <span className="fw-bold text-danger font-monospace fs-6">
                    KES {calculateSubtotal().toLocaleString()}
                  </span>
                </div>
                
                {!showForm && (
                  <button 
                    type="button" 
                    className="btn btn-dark rounded-1 w-100 fw-semibold font-monospace py-2.5 shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
                    style={{ fontSize: '13px' }}
                    onClick={() => setShowForm(true)}
                  >
                    Place Availability Request <ArrowRight size={14} />
                  </button>
                )}
                
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-1 w-100 py-2 btn-sm font-monospace" 
                  onClick={() => navigate('/shop')}
                  style={{ fontSize: '12px' }}
                >
                  ← Continue Sourcing
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      <style>{`
        .hover-delete:hover {
          color: #dc2626 !important;
        }
      `}</style>
    </div>
  );
}