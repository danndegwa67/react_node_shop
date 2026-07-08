import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function AdminScan() {
  const [scanLog, setScanLog] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Mount the scanner to the HTML camera div window below
    const scanner = new Html5QrcodeScanner("scanner-viewbox", {
      fps: 12,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    scanner.render(
      (decodedText) => {
        if (isProcessing) return; // Stop double-triggers while waiting for backend response
        
        setIsProcessing(true);
        setScanLog(`Captured SKU [${decodedText}]. Updating inventory values...`);
        
        // 2. Hit your Express backend patch route (adjust URL base if using a proxy/vite config)
        // 💡 Update this line inside your frontend AdminScan.jsx component:
            fetch(`http://localhost:5000/api/admin/decrement-stock/${decodedText}`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            })
          .then(res => {
            if (!res.ok) throw new Error('Part validation processing line error.');
            return res.json();
          })
          .then(data => {
            setScanLog(`✅ Dispatched! Item: ${data.productName} | Remaining Stock: ${data.updatedStock}`);
            setIsProcessing(false);
          })
          .catch(err => {
            setScanLog(`❌ Error: SKU [${decodedText}] might not exist in your Postgres database.`);
            setIsProcessing(false);
          });
      },
      (error) => { /* Suppress webcam focusing/calibration logs */ }
    );

    // Clean up camera processes when switching screens
    return () => {
      scanner.clear().catch(err => console.error("Clearing camera loop trace:", err));
    };
  }, [isProcessing]);

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', border: '1px solid #ddd', padding: '30px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Warehouse Scanner Console</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
          Align a product barcode/QR sticker within the view window to subtract 1 item from stock automatically.
        </p>
        
        {/* Physical camera mount aperture window frame */}
        <div id="scanner-viewbox" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden' }}></div>
        
        {scanLog && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderLeft: '4px solid #007bff', borderRadius: '4px', textAlign: 'left', fontFamily: 'monospace', fontSize: '13px' }}>
            <strong>Console Status:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#333' }}>{scanLog}</p>
          </div>
        )}
      </div>
    </div>
  );
}