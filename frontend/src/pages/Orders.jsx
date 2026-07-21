import { useState, useEffect } from 'react';

export default function Orders() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheBuster = Date.now();
    // Fetch current unique browser tracking token or default gracefully
    const currentDeviceToken = localStorage.getItem('mhenik_device_fingerprint') || 'NONE';
    
    fetch(`http://localhost:5000/api/client/adjustments?_cb=${cacheBuster}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not access history registers.");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // 🛡️ Check if the database 'requestedBy' string includes this specific device signature code!
          const deviceFilteredRecords = data.filter(req => 
            String(req.requestedBy).includes(currentDeviceToken)
          );
          setRequests(deviceFilteredRecords);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Pipeline failure:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-5">
      <div className="border-bottom pb-3 mb-4">
        <h2 className="fw-bold text-dark mb-1">Request Log Tracker</h2>
        <p className="text-muted mb-0">Track live status updates on your availability and stock inquiries.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status"></div>
          <p className="text-muted mt-2 small font-monospace">Querying live tracking matrices...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-3">
          <div className="fs-1 mb-2">📋</div>
          <h5 className="text-muted fw-bold">No Tracked Requests Found</h5>
          <p className="text-muted small mb-0">Any availability profiles queued from this phone will log out directly here.</p>
        </div>
      ) : (
        requests.map((req) => (
          <div className="card mb-3 border-0 shadow-sm rounded-mhenik overflow-hidden animate-fade-in" key={req.id}>
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 border-0">
              <span className="font-monospace small">
                <strong>ID Hash:</strong> #{req.id.slice(0, 8).toUpperCase()} | {new Date(req.createdAt).toLocaleDateString()}
              </span>
              <span className={`badge font-monospace px-3 py-2 rounded-pill ${
                req.status === 'APPROVED' ? 'bg-success' : 
                req.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
              }`}>
                {req.status}
              </span>
            </div>
            <div className="card-body bg-white p-4">
              <div className="d-flex justify-content-between align-items-start align-items-md-center flex-wrap g-3">
                <div>
                  <h5 className="fw-bold text-dark mb-1 text-uppercase">{req.productName}</h5>
                  <span className="badge bg-light text-secondary font-monospace border">SKU: {req.productSku}</span>
                </div>
                <div className="text-md-end mt-2 mt-md-0">
                  <span className="text-muted small d-block">Requested Target Volume:</span>
                  <strong className="fs-5 text-dark">{req.newStock} Units</strong>
                </div>
              </div>
              {req.reason && (
                <div className="mt-3 pt-3 border-top bg-light p-2 rounded small text-muted">
                  <strong>Order Metadata Routing Details:</strong> {req.reason}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}