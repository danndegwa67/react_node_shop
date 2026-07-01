import { useState, useEffect } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const mockBaseline = [
      {
        orderId: "MT-2026-9481",
        date: "01/07/2026",
        status: "Processing",
        items: [{ name: "2TR PIPE PRADO 120", sku: "3161", price: 8500, qty: 1 }]
      }
    ];
    const generatedLogs = JSON.parse(localStorage.getItem('mhenik_orders')) || [];
    setOrders([...generatedLogs, ...mockBaseline]);
  }, []);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Request Log Tracker</h2>
      {orders.map((o) => (
        <div className="card mb-4 border-0 shadow-sm" key={o.orderId}>
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <span><strong>Ref Code:</strong> {o.orderId} | {o.date}</span>
            <span className="badge bg-primary">{o.status}</span>
          </div>
          <div className="card-body bg-white">
            {o.items.map((i, idx) => (
              <div key={idx} className="d-flex justify-content-between border-bottom py-2">
                <span>{i.name} <strong>(x{i.qty})</strong></span>
                <span className="font-monospace text-muted">SKU: {i.sku}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}