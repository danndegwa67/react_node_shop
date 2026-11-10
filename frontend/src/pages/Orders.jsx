import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Orders() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheBuster = Date.now();
    const currentDeviceToken = localStorage.getItem('mhenik_device_fingerprint') || 'NONE';
    
    fetch(`${API_BASE}/api/client/adjustments?_cb=${cacheBuster}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not access history registers.");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-1 font-monospace d-inline-flex align-items-center gap-1">
            <CheckCircle2 size={12} /> APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-1 font-monospace d-inline-flex align-items-center gap-1">
            <XCircle size={12} /> REJECTED
          </span>
        );
      default:
        return (
          <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-50 rounded-1 font-monospace d-inline-flex align-items-center gap-1">
            <Clock size={12} /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white min-vh-100 py-4 py-md-5 text-start">
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Editorial Header */}
        <div className="border-bottom pb-3 mb-4">
          <div className="d-inline-flex align-items-center gap-2 px-2 py-0.5 mb-2 border rounded-1 bg-white shadow-xs">
            <span className="badge bg-danger rounded-1 p-1"></span>
            <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Client Audit Log
            </span>
          </div>
          <h1 className="h3 text-dark fw-light mb-1 tracking-tight">Request Log Tracker</h1>
          <p className="text-secondary small mb-0">Track live status updates on your availability and stock inquiries.</p>
        </div>

        {loading ? (
          <div className="text-center py-5 border rounded-1 bg-white">
            <div className="spinner-border text-danger spinner-border-sm mb-2" role="status"></div>
            <p className="text-muted small font-monospace mb-0">Querying live tracking matrices...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="border rounded-1 p-5 text-center bg-white shadow-xs">
            <AlertCircle size={36} className="text-muted mb-2 opacity-50" />
            <h6 className="fw-bold text-dark mb-1">No Tracked Requests Found</h6>
            <p className="text-muted small mb-0">Any availability profiles queued from this browser will log out directly here.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {requests.map((req) => (
              <div className="border rounded-1 bg-white shadow-xs overflow-hidden" key={req.id}>
                <div className="bg-light p-2.5 px-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="font-monospace small text-muted" style={{ fontSize: '11.5px' }}>
                    <strong className="text-dark">ID:</strong> #{req.id.slice(0, 8).toUpperCase()} | {new Date(req.createdAt).toLocaleDateString('en-GB')}
                  </span>
                  {getStatusBadge(req.status)}
                </div>

                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <h6 className="fw-bold text-dark mb-1">{req.productName}</h6>
                      <span className="badge bg-light text-secondary font-monospace border" style={{ fontSize: '10px' }}>
                        SKU: {req.productSku}
                      </span>
                    </div>
                    <div className="text-md-end">
                      <span className="text-muted small font-monospace d-block" style={{ fontSize: '11px' }}>Volume Requested:</span>
                      <strong className="text-dark font-monospace">{req.newStock} Units</strong>
                    </div>
                  </div>

                  {req.reason && (
                    <div className="mt-2.5 pt-2 border-top text-muted small font-monospace" style={{ fontSize: '11px' }}>
                      <strong className="text-secondary">Routing Metadata:</strong> {req.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}