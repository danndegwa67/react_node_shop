import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('records');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Incoming Form State
  const [form, setForm] = useState({
    sku: '', productName: '', position: '', sellingPrice: '', stockAmount: '',
    categoryId: '', categoryName: '', vehicleId: '', make: '', model: ''
  });
  const [generatedQR, setGeneratedQR] = useState('');

  // Fetch metrics data on mount
  useEffect(() => {
    fetchInventory();
    fetchOrders();
  }, []);

  const fetchInventory = () => {
    fetch('http://localhost:5000/api/admin/inventory')
      .then(res => res.json())
      .then(data => {
        // Guard against non-array responses to prevent app crashes
        if (Array.isArray(data)) {
          setInventory(data);
        } else {
          console.error("Inventory fetch did not return an array:", data);
          setInventory([]);
        }
      })
      .catch(err => console.error("Network error fetching inventory:", err));
  };

  const fetchOrders = () => {
    fetch('http://localhost:5000/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        // Ensure data is strictly a valid array before setting state
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Orders fetch did not return an array:", data);
          setOrders([]); // Fallback to safe empty array to prevent blank screen
        }
      })
      .catch(err => {
        console.error("Network error fetching orders:", err);
        setOrders([]);
      });
  };
  const handleIncomingStock = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/admin/incoming-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(res => res.json())
    .then(() => {
      setGeneratedQR(form.sku); // Display QR for the SKU just saved
      fetchInventory();
      alert('Stock successfully recorded into inventory framework!');
    });
  };

  const handleOrderDecision = (orderId, decision) => {
    fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: decision })
    })
    .then(res => res.json())
    .then(() => {
      fetchOrders();
    });
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 'bold' }}>Mhenik Warehouse Panel</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Internal Employee Access Only</p>
        </div>
        <a href="/admin/scan" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          📷 Launch Departures Camera Scanner
        </a>
      </div>

      {/* Navigation Tab Rows */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #ddd', marginBottom: '25px' }}>
        {['records', 'incoming', 'orders'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '12px 24px', border: 'none', background: activeTab === tab ? '#fff' : 'transparent',
            borderBottom: activeTab === tab ? '3px solid #007bff' : 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px'
          }}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TAB CONTAINER 1: MASTER RECORDS VIEW */}
      {activeTab === 'records' && (
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>Current Inventory Ledger ({inventory.length} active parts)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px' }}>SKU</th>
                <th style={{ padding: '12px' }}>Product Name</th>
                <th style={{ padding: '12px' }}>Compatibility</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Price</th>
                <th style={{ padding: '12px' }}>Stock Available</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(prod => (
                <tr key={prod.sku} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>{prod.sku}</td>
                  <td style={{ padding: '12px' }}>{prod.productName}</td>
                  <td style={{ padding: '12px' }}>{prod.vehicle.make} {prod.vehicle.model}</td>
                  <td style={{ padding: '12px' }}>{prod.category.name}</td>
                  <td style={{ padding: '12px' }}>KES {prod.sellingPrice}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: prod.stock < 5 ? 'red' : 'green' }}>{prod.stock} units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTAINER 2: INCOMING ITEMS & QR GENERATION */}
      {activeTab === 'incoming' && (
        <div style={{ display: 'flex', gap: '30px' }}>
          <form onSubmit={handleIncomingStock} style={{ flex: 1, background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Log Incoming Supply Cargo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              <input placeholder="SKU Code" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Product Name" required value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Category ID (e.g. cat_01)" required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Category Label Name" required value={form.categoryName} onChange={e => setForm({...form, categoryName: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Vehicle Reference ID" required value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Vehicle Make (e.g. Toyota)" required value={form.make} onChange={e => setForm({...form, make: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Vehicle Model (e.g. Hilux)" required value={form.model} onChange={e => setForm({...form, model: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Price (KES)" type="number" required value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Stock Qty Received" type="number" required value={form.stockAmount} onChange={e => setForm({...form, stockAmount: e.target.value})} style={{ padding: '10px', gridColumn: 'span 2' }} />
            </div>
            <button type="submit" style={{ marginTop: '20px', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              Save Allocation & Generate Label
            </button>
          </form>

          <div style={{ width: '300px', background: '#fff', padding: '25px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h4>Printable Inventory Label</h4>
            {generatedQR ? (
              <div style={{ marginTop: '20px' }}>
                <QRCodeSVG value={generatedQR} size={180} />
                <h2 style={{ fontFamily: 'monospace', marginTop: '15px', letterSpacing: '2px' }}>SKU-{generatedQR}</h2>
                <button onClick={() => window.print()} style={{ marginTop: '10px', background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Print Label</button>
              </div>
            ) : (
              <p style={{ color: '#aaa', fontSize: '14px', marginTop: '20px' }}>Submit an incoming product form on the left to instantly calculate and generate its tracking QR identity code block.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTAINER 3: ORDER ACTION MANAGER */}
      {activeTab === 'orders' && (
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>Order Validation Board</h3>
          {orders.length === 0 ? <p style={{ color: '#999', marginTop: '15px' }}>No shipping manifests currently logged.</p> : (
            orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Order Ref: {order.id.slice(0,8)}...</strong> — Customer: <span style={{ color: '#555' }}>{order.customerName}</span>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', background: order.status === 'PENDING' ? '#ffc107' : order.status === 'APPROVED' ? '#28a745' : '#dc3545', color: order.status === 'PENDING' ? '#000' : '#fff' }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ marginTop: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                  {order.items.map(item => (
                    <div key={item.id}>• {item.product.productName} (SKU: {item.productSku}) x {item.quantity} units</div>
                  ))}
                </div>
                {order.status === 'PENDING' && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleOrderDecision(order.id, 'APPROVED')} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve Manifest</button>
                    <button onClick={() => handleOrderDecision(order.id, 'DISAPPROVED')} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Disapprove / Cancel</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}