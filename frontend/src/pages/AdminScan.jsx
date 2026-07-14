import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function AdminScan() {
  const [scanLog, setScanLog] = useState('');
  const navigate = useNavigate();
  
  // 💡 Ref prevents multiple simultaneous triggers without destroying the camera component
  const processingRef = useRef(false); 

  useEffect(() => {
    // 🛡️ Pre-flight: Check security token presence before launching video lenses
    const token = localStorage.getItem('mhenik_staff_token');
    if (!token) {
      navigate('/admin/auth');
      return;
    }

    // 1. Mount the scanner tool instance safely to the frame div window
    const scanner = new Html5QrcodeScanner("scanner-viewbox", {
      fps: 15,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    scanner.render(
      (decodedText) => {
        if (processingRef.current) return; // Drop concurrent scans safely
        
        // Lock the thread
        processingRef.current = true;

        // 🧼 Aggressively sanitize the code string value to strip hidden spaces or carriage returns (\r)
        const standardizedSku = String(decodedText).replace(/[\r\n\s]/g, '').trim();

        if (!standardizedSku) {
          processingRef.current = false;
          return;
        }

        setScanLog(`Captured SKU [${standardizedSku}]. Verifying clearance credentials...`);
        
        // 2. Dispatch secure network call to your raw SQL type-agnostic backend
        fetch(`http://localhost:5000/api/admin/decrement-stock/${standardizedSku}`, { 
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` // 🔑 Secure IAM Token
          }
        })
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            alert("⚠️ Unauthorized profile session. Redirecting to access terminal...");
            window.location.href = '/admin/auth';
            return;
          }
          return res.json().then(data => ({ status: res.status, data }));
        })
        .then(({ status, data }) => {
          if (status >= 400) {
            setScanLog(`❌ Error: ${data.message}`);
          } else {
            setScanLog(`✅ Dispatched! Item: ${data.productName} | Remaining Stock: ${data.updatedStock} units`);
          }
          
          // ⏳ Delay unlocking the scanner for 2 seconds to give the worker time to move the box away
          setTimeout(() => {
            processingRef.current = false;
          }, 2000);
        })
        .catch(err => {
          console.error("Scanner tracking pipeline broke:", err);
          setScanLog(`❌ Communication break connecting to the warehouse desk.`);
          processingRef.current = false;
        });
      },
      (error) => { /* Suppress stream tracking frames debug feedback log lines */ }
    );

    // Clean up camera pipelines correctly when switching views
    return () => {
      scanner.clear().catch(err => console.error("Clearing camera loop trace:", err));
    };
  }, [navigate]); // Empty array dependency array keeps the webcam alive permanently on this view match!

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', border: '1px solid #ddd', padding: '30px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate('/admin/dashboard')} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            ← Back to Board
          </button>
          <h2 style={{ fontWeight: 'bold', margin: 0 }}>Warehouse Scanner Console</h2>
          <div style={{ width: '90px' }}></div> {/* Spatial balance */}
        </div>
        
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
          Align a product barcode/QR sticker within the view window to subtract 1 item from stock automatically.
        </p>
        
        {/* Physical camera mount aperture window frame */}
        <div id="scanner-viewbox" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden' }}></div>
        
        {scanLog && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderLeft: '4px solid #007bff', borderRadius: '4px', textAlign: 'left', fontFamily: 'monospace', fontSize: '13px' }}>
            <strong>Console Status:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#333', whiteSpace: 'pre-line' }}>{scanLog}</p>
          </div>
        )}
      </div>
    </div>
  );
}