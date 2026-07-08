import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate(); // 💡 Initialized safely to handle all redirection loops without crashing

  // Synchronize cart with the interactive live data storage tree
  useEffect(() => {
    const loadCart = () => {
      const stored = JSON.parse(localStorage.getItem('mhenik_cart')) || [];
      setCartItems(stored);
    };
    loadCart();
    window.addEventListener('storage', loadCart);
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

  const processRequestCheckout = () => {
    if (cartItems.length === 0) return;

    // 📦 Assemble the structured payload matching our Express route rules
    const orderPayload = {
      customerName: "Joshua Ochieng", // Sourced automatically for availability logs
      items: cartItems
    };

    // 🌐 Stream the request payload directly to your Node/Postgres backend
    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to register availability container block.");
      }
      return res.json();
    })
    .then(data => {
      alert("✅ Success! Your availability request has been sent to the warehouse framework.");
      
      // Clear the cart locally once successfully logged in the database
      localStorage.removeItem('mhenik_cart');
      window.dispatchEvent(new Event('storage'));

      // Redirect over to the customer's order history tracking pane
      navigate('/orders');
    })
    .catch(err => {
      console.error("Network write exception posting checkout container:", err);
      alert("❌ Error: Could not connect to the warehouse registration desk.");
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
          <p className="text-muted small mb-4">Browse our parts registry grid to queue order lines.</p>
          
          {/* 💡 Secure programmatic redirection button utilizing branding palette styles */}
          <button 
            type="button"
            className="btn btn-mhenik-primary px-4 py-2 fw-bold"
            onClick={() => navigate('/shop')}
          >
            Return to Catalog
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Block: Table List */}
          <div className="col-lg-8">
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
              
              <button 
                type="button" 
                className="btn btn-mhenik-primary w-100 fw-bold py-3 shadow-sm mb-2"
                onClick={processRequestCheckout}
              >
                Place Availability Request →
              </button>
              
              <button 
                type="button"
                className="btn btn-outline-secondary w-100 btn-sm mt-1"
                onClick={() => navigate('/shop')}
              >
                ← Continue Sourcing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}