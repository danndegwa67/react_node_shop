import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  
  // Contact Info States for Guest Validation
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
    
    // 🛡️ Ensure this device has a completely unique tracking fingerprint
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

    // Combine contact information into the database reason field for easy reading
    const administrativeReason = `Phone: ${customerPhone} | Location: ${customerLocation || 'Not Specified'} | Customer Note: Checkout inquiries.`;

    const requestPromises = cartItems.map(item => {
      return fetch('http://localhost:5000/api/client/adjustments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSku: item.sku,
          productName: item.name,
          oldStock: item.stock || 0,
          newStock: item.qty,       
          reason: administrativeReason,
          requestedBy: `${customerName} (${deviceId})` // Identifies name AND exact device footprint
        })
      }).then(res => {
        if (!res.ok) throw new Error(`Failed code update on ${item.sku}`);
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
    <div className="container py-5">
      <div className="border-bottom pb-3 mb-4">
        <h1 className="h2 text-dark fw-bold mb-1">Shopping Cart</h1>
        <p className="text-muted mb-0">Confirm your parts specifications list prior to agent lookup logs.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-3">
          <div className="fs-1 mb-3">🛒</div>
          <h4 className="text-muted fw-bold">Your Cart is Empty</h4>
          <button type="button" className="btn btn-mhenik-primary px-4 py-2 fw-bold" onClick={() => navigate('/shop')}>
            Return to Catalog
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Block: Table List */}
          <div className="col-lg-8">
            {showForm ? (
              /* Contact Detail Form Layer */
              <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
                <h5 className="fw-bold text-dark mb-3 font-monospace text-uppercase">📞 Contact Details</h5>
                <form onSubmit={processRequestCheckout}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Your Name</label>
                    <input type="text" className="form-control" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g., Joshua Ochieng" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Phone Number (For Call / WhatsApp)</label>
                    <input type="tel" className="form-control" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g., +254 7XX XXX XXX" />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">Your Location / Town (Optional)</label>
                    <input type="text" className="form-control" value={customerLocation} onChange={e => setCustomerLocation(e.target.value)} placeholder="e.g., Nairobi CBD, Kisumu, Mombasa" />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-light fw-bold px-4" onClick={() => setShowForm(false)}>← Back to Cart</button>
                    <button type="submit" className="btn btn-success fw-bold px-4 flex-grow-1">Confirm and Submit Request</button>
                  </div>
                </form>
              </div>
            ) : (
              /* Core Parts Table List */
              <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light text-secondary small">
                      <tr>
                        <th>Component Details</th>
                        <th>Price</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Total</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.sku}>
                          <td>
                            <div className="fw-bold text-dark text-uppercase">{item.name}</div>
                            <span className="badge bg-light text-secondary font-monospace border mt-1">{item.sku}</span>
                          </td>
                          <td className="text-muted">Ksh {item.price.toLocaleString()}</td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm border shadow-xs">
                              <button type="button" className="btn btn-light px-2" onClick={() => updateQty(item.sku, -1)}>-</button>
                              <span className="px-3 py-1 bg-white text-dark font-monospace fw-bold">{item.qty}</span>
                              <button type="button" className="btn btn-light px-2" onClick={() => updateQty(item.sku, 1)}>+</button>
                            </div>
                          </td>
                          <td className="text-end fw-semibold text-dark">Ksh {(item.price * item.qty).toLocaleString()}</td>
                          <td className="text-center">
                            <button type="button" className="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-bold" onClick={() => removeItem(item.sku)}>Remove</button>
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
            <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Request Summary</h5>
              <div className="d-flex justify-content-between mb-2 fs-6">
                <span className="text-muted">Item Count:</span>
                <span className="fw-semibold text-dark">{cartItems.reduce((sum, i) => sum + i.qty, 0)} units</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-3 mb-4 fs-5 fw-bold">
                <span className="text-dark">Estimated Cost:</span>
                <span className="text-mhenik-crimson">Ksh {calculateSubtotal().toLocaleString()}</span>
              </div>
              
              {!showForm && (
                <button 
                  type="button" 
                  className="btn btn-mhenik-primary w-100 fw-bold py-3 shadow-sm mb-2"
                  onClick={() => setShowForm(true)}
                >
                  Place Availability Request →
                </button>
              )}
              
              <button type="button" className="btn btn-outline-secondary w-100 btn-sm mt-1" onClick={() => navigate('/shop')}>
                ← Continue Sourcing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}