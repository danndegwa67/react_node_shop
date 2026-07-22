import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]); 
  const [transactions, setTransactions] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [staff, setStaff] = useState({ name: '', role: '' });
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    sku: '', productName: '', position: '', sellingPrice: '', stockAmount: '', 
    categoryId: '', categoryName: '', vehicleId: '', make: '', model: '',
    condition: 'OEM_GENUINE', side: 'UNIVERSAL', reorderPoint: 3
  });

  // 🚨 Filter & Search States
  const [invSearchSku, setInvSearchSku] = useState('');
  const [invSearchName, setInvSearchName] = useState('');
  const [invSearchVehicle, setInvSearchVehicle] = useState('');
  const [invSearchCategory, setInvSearchCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [isSubmittingIncoming, setIsSubmittingIncoming] = useState(false);

  // ⚡ High-Performance Inventory Pagination States
  const [invPage, setInvPage] = useState(1);
  const ITEMS_PER_PAGE = 50; 

  // 🔍 Log Filtering States
  const [logSearchAction, setLogSearchAction] = useState('');
  const [logSearchActor, setLogSearchActor] = useState('');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');

  const [logCurrentPage, setLogCurrentPage] = useState(1);

  // ✏️ Edit Request State
  const [editingProduct, setEditingProduct] = useState(null);
  const [correctionTargetQty, setCorrectionTargetQty] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');

  // 🏷️ QR CODE LABEL GENERATOR STATE
  const [qrProduct, setQrProduct] = useState(null);

  // 📷 ADVANCED MULTI-ITEM SCANNER AGGREGATION STATES
  const [activeScanOrder, setActiveScanOrder] = useState(null);
  const [scanProgressMap, setScanProgressMap] = useState({});
  const [manualSkuInput, setManualSkuInput] = useState('');
  const [scannerInstance, setScannerInstance] = useState(null);

  useEffect(() => {
    const savedStaff = localStorage.getItem('mhenik_staff_profile');
    const token = localStorage.getItem('mhenik_staff_token');

    if (!token || !savedStaff) {
      navigate('/admin/auth');
      return;
    }
    const profile = JSON.parse(savedStaff);
    setStaff(profile);

    fetchData('/api/admin/inventory', setInventory);
    fetchData('/api/admin/orders', setOrders);
    fetchData('/api/admin/adjustments', setAdjustments);
    
    if (profile.role === 'admin') {
      fetchData('/api/admin/users', setUsers);
      fetchData('/api/admin/transactions', setTransactions);
      setLogCurrentPage(1);
    }
  }, [navigate]);

  useEffect(() => {
    if (staff.role === 'admin') {
      fetchPaginatedLogs(logCurrentPage);
    }
  }, [logCurrentPage, staff.role]);

  const fetchData = (endpoint, setter) => {
    fetch(`http://localhost:5000${endpoint}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` }
    })
    .then(res => { 
      if (res.status === 401 || res.status === 403) navigate('/admin/auth'); 
      return res.json(); 
    })
    .then(data => { if (Array.isArray(data)) setter(data); })
    .catch(err => console.error("Global data pipeline load exception:", err));
  };

  const fetchPaginatedLogs = (pageNumber) => {
    const cacheBuster = Date.now();
    fetch(`http://localhost:5000/api/admin/logs?page=${pageNumber}&_cb=${cacheBuster}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) navigate('/admin/auth');
      return res.json();
    })
    .then(resData => {
      if (resData && resData.logs) {
        setLogs(resData.logs);
      }
    })
    .catch(err => console.error("Logs pagination pipeline exception:", err));
  };

  const handleIncomingStock = (e) => {
    e.preventDefault();
    if (isSubmittingIncoming) return;

    setIsSubmittingIncoming(true);

    fetch('http://localhost:5000/api/admin/incoming-stock', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` 
      },
      body: JSON.stringify(form)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed logging incoming cargo.');
        setIsSubmittingIncoming(false);
        return;
      }

      fetchData('/api/admin/inventory', setInventory); 
      if (staff.role === 'admin') {
        fetchPaginatedLogs(logCurrentPage);
        fetchData('/api/admin/transactions', setTransactions);
      }
      
      alert('Allocation logged successfully!');
      
      // 🏷️ Launch QR label preview for the ingested item
      setQrProduct({
        sku: form.sku,
        productName: form.productName,
        sellingPrice: parseFloat(form.sellingPrice) || 0
      });

      // 🧹 1. Reset all form fields back to blank defaults
      setForm({ 
        sku: '', productName: '', position: '', sellingPrice: '', stockAmount: '', 
        categoryId: '', categoryName: '', vehicleId: '', make: '', model: '',
        condition: 'OEM_GENUINE', side: 'UNIVERSAL', reorderPoint: 3
      });
    })
    .catch(err => {
      console.error("Incoming stock error:", err);
      alert("Network error logging incoming stock.");
    })
    .finally(() => {
      // 🔒 2. Unlock submission guard
      setIsSubmittingIncoming(false);
    });
  };

  const submitCorrectionRequest = (e) => {
    e.preventDefault();
    const targetQty = parseInt(correctionTargetQty, 10);
    if (targetQty < 0) {
      alert("Invalid Count: Inventory levels cannot be adjusted below 0 units.");
      return;
    }

    fetch('http://localhost:5000/api/admin/adjustments/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` },
      body: JSON.stringify({
        productSku: editingProduct.sku,
        productName: editingProduct.productName,
        oldStock: editingProduct.stock,
        newStock: targetQty,
        reason: correctionReason
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to submit correction request.");
        return;
      }
      alert("Adjustment request forwarded to admin backlog.");
      setEditingProduct(null);
      setCorrectionTargetQty('');
      setCorrectionReason('');
      fetchData('/api/admin/adjustments', setAdjustments);
      if (staff.role === 'admin') fetchPaginatedLogs(logCurrentPage);
    });
  };

  const resolveAdjustment = (id, decision) => {
    fetch(`http://localhost:5000/api/admin/adjustments/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` 
      },
      body: JSON.stringify({ status: decision })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        alert(`Error (${res.status}): ${data.message || 'Failed to update adjustment'}`);
        return;
      }
      alert(`Adjustment ${decision.toLowerCase()} successfully!`);
      fetchData('/api/admin/adjustments', setAdjustments);
      fetchData('/api/admin/inventory', setInventory);
      if (staff.role === 'admin') fetchData('/api/admin/transactions', setTransactions);
    })
    .catch(err => {
      console.error("Adjustment error:", err);
      alert("Network error updating adjustment.");
    });
  };

  const handleIAMAction = (endpoint, body) => {
    fetch(`http://localhost:5000${endpoint}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` 
      },
      body: JSON.stringify(body)
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "IAM Action failed.");
        return;
      }
      alert(data.message || "User credentials updated successfully!");
      fetchData('/api/admin/users', setUsers);
      if (staff.role === 'admin') fetchPaginatedLogs(logCurrentPage);
    })
    .catch(err => console.error("IAM Action Error:", err));
  };

  // 📷 CAMERA INTEGRATION ENGINE
  const startOrderScanLifecycle = (order) => {
    setActiveScanOrder(order);
    const initialProgress = {};
    order.items.forEach(item => {
      initialProgress[item.productSku] = 0;
    });
    setScanProgressMap(initialProgress);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("order-modal-camera-viewport", { fps: 15, qrbox: 220 }, false);
      scanner.render((skuText) => {
        registerScannedSkuValue(skuText.trim(), order.items);
      }, (error) => { /* quiet tracing */ });
      setScannerInstance(scanner);
    }, 200);
  };

  const closeScanLifecycle = () => {
    if (scannerInstance) {
      scannerInstance.clear().catch(err => console.log("Camera off safely.", err));
    }
    setActiveScanOrder(null);
    setScanProgressMap({});
    setManualSkuInput('');
    setScannerInstance(null);
  };

  const registerScannedSkuValue = (rawSku, orderItems) => {
    const cleanSku = String(rawSku).replace(/[\r\n\s]/g, '').trim();
    const matchingItem = orderItems.find(i => String(i.productSku).trim() === cleanSku);

    if (!matchingItem) {
      alert(`⚠️ Validation Mismatch: SKU [${cleanSku}] is not included in this deployment list!`);
      return;
    }

    setScanProgressMap(prev => {
      const currentCount = prev[cleanSku] || 0;
      if (currentCount >= matchingItem.quantity) {
        alert(`✅ Filled: SKU [${cleanSku}] has already been completed.`);
        return prev;
      }
      return { ...prev, [cleanSku]: currentCount + 1 };
    });
  };

  const verifyAllLinesFullyScanned = () => {
    if (!activeScanOrder) return false;
    return activeScanOrder.items.every(item => scanProgressMap[item.productSku] === item.quantity);
  };

  const commitBulkDispatchedManifest = () => {
    if (!verifyAllLinesFullyScanned()) {
      alert("Verification scans incomplete.");
      return;
    }

    const dispatchPromises = activeScanOrder.items.map(item => {
      return fetch(`http://localhost:5000/api/admin/orders/${activeScanOrder.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}`
        },
        body: JSON.stringify({ status: 'DISPATCHED', verifiedSku: item.productSku })
      }).then(res => res.json());
    });

    Promise.all(dispatchPromises)
      .then(() => {
        alert("🎉 Success! Complete order load verified and dispatched.");
        closeScanLifecycle();
        fetchData('/api/admin/orders', setOrders);
        fetchData('/api/admin/inventory', setInventory);
        if (staff.role === 'admin') fetchData('/api/admin/transactions', setTransactions);
      })
      .catch(err => console.error(err));
  };

  const handleOrderApproval = (orderId, decision = 'APPROVED') => {
    fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` 
      },
      body: JSON.stringify({ status: decision })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Failed processing order status update."); return; }
      alert(`Order successfully marked as ${decision}!`);
      fetchData('/api/admin/orders', setOrders);
      fetchData('/api/admin/adjustments', setAdjustments);
    });
  };

  // 🖨️ PRINT OFFICIAL ORDER RECEIPT / MANIFEST
  const printOrderInvoice = (order) => {
    if (order.status !== 'APPROVED' && order.status !== 'DISPATCHED') {
      alert("Operational Lock: Manifests can only be printed AFTER allocation approval.");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const itemsHtml = order.items?.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productSku}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product?.productName || 'Genuine Part'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">KES ${item.product?.sellingPrice?.toLocaleString() || '0'}</td>
      </tr>
    `).join('') || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - Manifest #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f4f4f4; text-align: left; padding: 8px; border-bottom: 2px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>MHENIK TRADERS</h2>
              <p>Auto Spares & Hardware Operations</p>
            </div>
            <div style="text-align: right;">
              <h3>ORDER MANIFEST</h3>
              <p>ID: #${order.id.slice(0, 12).toUpperCase()}</p>
              <p>Status: <strong>${order.status}</strong></p>
            </div>
          </div>
          <p><strong>Customer Details:</strong> ${order.customerName}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <table>
            <thead>
              <tr><th>SKU</th><th>Item Designation</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top: 30px; text-align: right;">
            <p><strong>Verified By:</strong> ${staff.name} (${staff.role?.toUpperCase()})</p>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 🖨️ PRINT THERMAL SHELF QR CODE LABEL
  const printQrLabelModal = () => {
    const printContent = document.getElementById('printable-qr-label');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank', 'width=400,height=450');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shelf Label - SKU ${qrProduct?.sku}</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 15px; margin: 0; }
            .label-box { border: 2px solid #000; padding: 15px; border-radius: 8px; display: inline-block; width: 90%; }
            h2 { margin: 5px 0; font-size: 18px; }
            p { margin: 3px 0; font-size: 13px; }
            .price { font-size: 16px; font-weight: bold; margin-top: 8px; }
            svg { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="label-box">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ⚡ MEMOIZED HIGH-PERFORMANCE INVENTORY FILTERING
  const filteredInventory = useMemo(() => {
    const cleanSku = invSearchSku.trim();
    const cleanName = invSearchName.toLowerCase().trim();
    const cleanVehicle = invSearchVehicle.toLowerCase().trim();
    const cleanCat = invSearchCategory.toLowerCase().trim();

    return inventory.filter(p => {
      const matchesSku = cleanSku === '' || String(p.sku).includes(cleanSku);
      const matchesName = cleanName === '' || p.productName?.toLowerCase().includes(cleanName);
      const matchesVeh = cleanVehicle === '' || `${p.vehicle?.make} ${p.vehicle?.model}`.toLowerCase().includes(cleanVehicle);
      const matchesCat = cleanCat === '' || p.category?.name?.toLowerCase().includes(cleanCat);
      const isLow = (p.stock - p.heldStock) <= (p.reorderPoint || 3);

      const matchesSearch = matchesSku && matchesName && matchesVeh && matchesCat;
      return showLowStockOnly ? (matchesSearch && isLow) : matchesSearch;
    });
  }, [inventory, invSearchSku, invSearchName, invSearchVehicle, invSearchCategory, showLowStockOnly]);

  // 📊 LIVE KPI METRICS CALCULATIONS
  const metrics = useMemo(() => {
    const totalSkus = inventory.length;
    const totalUnits = inventory.reduce((acc, item) => acc + (item.stock || 0), 0);
    const totalValuation = inventory.reduce((acc, item) => acc + ((item.stock || 0) * (item.sellingPrice || 0)), 0);
    const lowStock = inventory.filter(p => (p.stock - p.heldStock) <= (p.reorderPoint || 3)).length;

    return { totalSkus, totalUnits, totalValuation, lowStock };
  }, [inventory]);

  useEffect(() => {
    setInvPage(1);
  }, [invSearchSku, invSearchName, invSearchVehicle, invSearchCategory, showLowStockOnly]);

  const totalInvPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (invPage - 1) * ITEMS_PER_PAGE;
    return filteredInventory.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInventory, invPage]);

  const filteredLogs = logs.filter(log => {
    const matchesAction = logSearchAction === '' || log.action.toLowerCase().includes(logSearchAction.toLowerCase());
    const matchesActor = logSearchActor === '' || log.userName.toLowerCase().includes(logSearchActor.toLowerCase());
    const logDateStr = new Date(log.createdAt).toISOString().split('T')[0];
    const matchesStart = logStartDate === '' || logDateStr >= logStartDate;
    const matchesEnd = logEndDate === '' || logDateStr <= logEndDate;
    return matchesAction && matchesActor && matchesStart && matchesEnd;
  });

  // 🔔 DYNAMIC UNTOUCHED & LOW-STOCK COUNTS
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'APPROVED').length;
  const pendingAdjustmentsCount = adjustments.filter(a => a.status === 'PENDING').length;
  const pendingUsersCount = users.filter(u => u.status === 'PENDING').length;
  const lowStockCount = inventory.filter(p => (p.stock - p.heldStock) <= (p.reorderPoint || 3)).length;

  const tabList = [
    { id: 'records', label: 'RECORDS' },
    { id: 'incoming', label: 'INCOMING' },
    { id: 'orders', label: 'ORDERS', count: pendingOrdersCount },
    { id: 'adjustments', label: 'ADJUSTMENTS', count: pendingAdjustmentsCount },
    staff.role === 'admin' ? { id: 'staff', label: 'STAFF', count: pendingUsersCount } : null,
    staff.role === 'admin' ? { id: 'ledger', label: 'LEDGER' } : null,
    staff.role === 'admin' ? { id: 'logs', label: 'LOGS' } : null
  ].filter(Boolean);

  return (
    <div className="container-fluid p-2 p-md-4 min-vh-100" style={{ background: '#f8fafc', maxWidth: '100vw', overflowX: 'hidden' }}>
      
      {/* HEADER SECTION PANEL */}
      <div className="card border-0 shadow-sm p-3 rounded-mhenik mb-3 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="h5 text-dark fw-bold mb-1">Mhenik Operations Hub</h1>
            <p className="text-muted small mb-0">
              Operator: <strong className="text-dark">{staff.name}</strong> 
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-mhenik ms-2">{staff.role?.toUpperCase()}</span>
            </p>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/admin/auth'); }} className="btn btn-outline-danger btn-sm fw-bold rounded-mhenik">Logout</button>
        </div>
      </div>

      {/* 📊 LIVE KPI STATS BANNER */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase d-block mb-1">Total Catalog SKUs</span>
            <h3 className="h5 fw-bold text-dark mb-0">{metrics.totalSkus.toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase d-block mb-1">Physical Stock Count</span>
            <h3 className="h5 fw-bold text-primary mb-0">{metrics.totalUnits.toLocaleString()} units</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase d-block mb-1">Warehouse Stock Value</span>
            <h3 className="h5 fw-bold text-success mb-0">KES {metrics.totalValuation.toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase d-block mb-1">Stock Alerts</span>
            <h3 className={`h5 fw-bold mb-0 ${metrics.lowStock > 0 ? 'text-danger' : 'text-muted'}`}>
              {metrics.lowStock} items low
            </h3>
          </div>
        </div>
      </div>

      {/* 📱 COMPACT STYLED MOBILE DROPDOWN / DESKTOP BUTTON STRIP */}
      <div className="card border-0 shadow-sm p-2 rounded-mhenik mb-3 bg-white">
        <div className="d-block d-md-none">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label small fw-bold text-muted mb-0 text-nowrap" style={{ fontSize: '12px' }}>Module:</label>
            <select 
              className="form-select form-select-sm fw-bold rounded-mhenik border-secondary-subtle"
              style={{ fontSize: '13px', backgroundPosition: 'right 0.5rem center' }}
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabList.map(tab => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} {tab.count > 0 ? `(${tab.count} UNTOUCHED)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-none d-md-flex gap-2 flex-wrap">
          {tabList.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`btn btn-sm fw-bold rounded-mhenik px-3 py-2 transition-all ${
                activeTab === tab.id ? 'btn-primary' : 'btn-light text-secondary'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="badge bg-danger ms-2 rounded-mhenik">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 📷 CHECKLIST CAMERA MODAL OVERLAY VIEWPORT */}
      {activeScanOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center p-2" style={{ zIndex: 1050 }}>
          <div className="card border-0 shadow-lg rounded-mhenik bg-white w-100" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden' }}>
            <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 font-monospace">DISPATCH COUNTER VERIFICATION</h6>
                <span className="small text-muted">Manifest ID: #{activeScanOrder.id.slice(0, 12).toUpperCase()}</span>
              </div>
              <button onClick={closeScanLifecycle} className="btn text-white p-0 fs-5">✕</button>
            </div>
            
            <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold text-muted small text-uppercase mb-2">Viewfinder Feed</h6>
                  <div id="order-modal-camera-viewport" className="rounded-mhenik border border-dashed bg-light p-2"></div>
                  
                  <div className="mt-3">
                    <label className="form-label small fw-bold text-muted">MANUAL SKU OVERRIDE</label>
                    <div className="input-group">
                      <input type="text" className="form-control form-control-sm rounded-mhenik" placeholder="Scan or type SKU..." value={manualSkuInput} onChange={e => setManualSkuInput(e.target.value)} />
                      <button onClick={() => { registerScannedSkuValue(manualSkuInput, activeScanOrder.items); setManualSkuInput(''); }} className="btn btn-sm btn-dark rounded-mhenik fw-bold">Verify</button>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 d-flex flex-column justify-content-between">
                  <div>
                    <h6 className="fw-bold text-muted small text-uppercase mb-2">📋 Manifest Progress</h6>
                    <div className="d-flex flex-column gap-2">
                      {activeScanOrder.items?.map(item => {
                        const scannedCount = scanProgressMap[item.productSku] || 0;
                        const lineComplete = scannedCount === item.quantity;
                        return (
                          <div key={item.productSku} className={`p-2 rounded-mhenik border d-flex justify-content-between align-items-center ${lineComplete ? 'bg-success bg-opacity-10 border-success' : 'bg-white'}`}>
                            <div>
                              <strong className="d-block small text-dark">{item.product?.productName || 'Genuine Spare'}</strong>
                              <span className="font-monospace text-muted" style={{ fontSize: '11px' }}>SKU: {item.productSku}</span>
                            </div>
                            <div className="text-end">
                              <span className={`fw-bold small ${lineComplete ? 'text-success' : 'text-dark'}`}>{scannedCount} / {item.quantity}</span>
                              <span className={`d-block fw-bold ${lineComplete ? 'text-success' : 'text-warning'}`} style={{ fontSize: '10px' }}>{lineComplete ? '✓ SECURED' : '⏳ PENDING'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-top">
                    <button onClick={commitBulkDispatchedManifest} disabled={!verifyAllLinesFullyScanned()} className={`btn w-100 rounded-mhenik fw-bold ${verifyAllLinesFullyScanned() ? 'btn-success' : 'btn-light text-muted'}`}>
                      {verifyAllLinesFullyScanned() ? '🚀 Finalize Warehouse Dispatch' : '🔒 Verification Scans Incomplete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏷️ PRINTABLE QR CODE SHELF LABEL MODAL */}
      {qrProduct && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1060 }}>
          <div className="card border-0 shadow-lg p-4 rounded-mhenik bg-white text-center" style={{ maxWidth: '360px' }}>
            <h5 className="fw-bold text-dark mb-1">Product Shelf Label</h5>
            <p className="small text-muted mb-3">Scan code at dispatch verification counter.</p>

            <div id="printable-qr-label" className="p-3 border rounded-mhenik bg-light mb-3">
              <h2 className="fw-bold font-monospace text-dark mb-1">SKU: {qrProduct.sku}</h2>
              <p className="fw-bold small text-dark text-truncate mb-2">{qrProduct.productName}</p>
              <div className="my-2 d-flex justify-content-center">
                <QRCodeSVG value={String(qrProduct.sku)} size={140} level="H" includeMargin={true} />
              </div>
              <p className="price fw-bold text-success mb-0">KES {qrProduct.sellingPrice?.toLocaleString()}</p>
              <span className="small text-muted font-monospace d-block mt-1">MHENIK TRADERS</span>
            </div>

            <div className="d-flex gap-2 justify-content-center">
              <button onClick={() => setQrProduct(null)} className="btn btn-light rounded-mhenik fw-bold">Close</button>
              <button onClick={printQrLabelModal} className="btn btn-primary rounded-mhenik fw-bold">🖨️ Print Label</button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: LIVE INVENTORY */}
      {activeTab === 'records' && (
        <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <div>
              <h3 className="h6 fw-bold text-dark mb-0">Live Inventory Matrix ({filteredInventory.length} matching)</h3>
              <p className="text-muted small mb-0">Showing page {invPage} of {totalInvPages}</p>
            </div>
            
            <button 
              onClick={() => setShowLowStockOnly(!showLowStockOnly)} 
              className={`btn btn-sm rounded-mhenik fw-bold ${showLowStockOnly ? 'btn-danger' : 'btn-outline-danger'}`}
            >
              ⚠️ Low Stock Filter {lowStockCount > 0 && <span className="badge bg-white text-danger ms-1">{lowStockCount}</span>}
            </button>
          </div>
          
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" placeholder="Filter SKU..." value={invSearchSku} onChange={e => setInvSearchSku(e.target.value)} /></div>
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" placeholder="Designation..." value={invSearchName} onChange={e => setInvSearchName(e.target.value)} /></div>
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" placeholder="Vehicle..." value={invSearchVehicle} onChange={e => setInvSearchVehicle(e.target.value)} /></div>
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" placeholder="Category..." value={invSearchCategory} onChange={e => setInvSearchCategory(e.target.value)} /></div>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '650px' }}>
              <thead className="table-light">
                <tr>
                  <th>SKU</th>
                  <th>Designation</th>
                  <th>Vehicle / Fits</th>
                  <th>Attributes</th>
                  <th>Price</th>
                  <th>Stock Levels</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInventory.map(prod => {
                  const isAdjustmentPending = adjustments.some(a => a.productSku === prod.sku && a.status === 'PENDING');
                  const availableStock = Math.max(0, prod.stock - prod.heldStock);

                  return (
                    <tr key={prod.sku}>
                      <td className="fw-bold font-monospace">{prod.sku}</td>
                      <td className="fw-semibold text-break">{prod.productName}</td>
                      <td className="text-muted small">{prod.vehicle?.make} {prod.vehicle?.model}</td>
                      <td>
                        <span className="badge bg-light text-dark border rounded-mhenik me-1" style={{ fontSize: '10px' }}>{prod.condition || 'OEM'}</span>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-mhenik" style={{ fontSize: '10px' }}>{prod.side || 'UNI'}</span>
                      </td>
                      <td className="fw-bold text-success">KES {prod.sellingPrice?.toLocaleString()}</td>
                      <td>
                        <span className={`fw-bold d-block ${availableStock <= (prod.reorderPoint || 3) ? 'text-danger' : 'text-success'}`}>
                          {availableStock} avail ({prod.stock} total)
                        </span>
                        {prod.heldStock > 0 && (
                          <span className="badge bg-warning text-dark rounded-mhenik mt-1" style={{ fontSize: '9px' }}>
                            🔒 {prod.heldStock} held
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <button onClick={() => setQrProduct(prod)} className="btn btn-sm btn-outline-secondary rounded-mhenik" title="Generate Thermal QR Label">
                            🏷️ Label
                          </button>
                          {isAdjustmentPending ? (
                            <span className="badge bg-warning text-dark rounded-mhenik" style={{ fontSize: '10px' }}>⏳ Adjustment Locked</span>
                          ) : (
                            <button onClick={() => setEditingProduct(prod)} className="btn btn-sm btn-outline-dark rounded-mhenik">Edit</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalInvPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <button 
                onClick={() => setInvPage(prev => Math.max(1, prev - 1))} 
                disabled={invPage === 1}
                className="btn btn-sm btn-outline-secondary rounded-mhenik fw-bold"
              >
                ← Previous
              </button>
              <span className="small fw-bold text-muted">
                Page {invPage} of {totalInvPages}
              </span>
              <button 
                onClick={() => setInvPage(prev => Math.min(totalInvPages, prev + 1))} 
                disabled={invPage === totalInvPages}
                className="btn btn-sm btn-outline-secondary rounded-mhenik fw-bold"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING INGESTION */}
      {activeTab === 'incoming' && (
        <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white">
          <h3 className="h6 fw-bold text-dark mb-3">Log Incoming Supply Cargo</h3>
          <form onSubmit={handleIncomingStock} className="row g-3">
            {Object.keys(form).map((key) => (
              <div key={key} className="col-12 col-md-4">
                <label className="form-label small fw-bold text-muted text-uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                {key === 'condition' ? (
                  <select className="form-select rounded-mhenik" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                    <option value="OEM_GENUINE">OEM Genuine</option>
                    <option value="AFTERMARKET">Aftermarket</option>
                    <option value="USED">Used / RefurbISHED</option>
                  </select>
                ) : key === 'side' ? (
                  <select className="form-select rounded-mhenik" value={form.side} onChange={e => setForm({...form, side: e.target.value})}>
                    <option value="UNIVERSAL">Universal</option>
                    <option value="LEFT_LH">Left (LH / Driver)</option>
                    <option value="RIGHT_RH">Right (RH / Passenger)</option>
                    <option value="FRONT">Front Pair</option>
                    <option value="REAR">Rear Pair</option>
                  </select>
                ) : (
                  <input 
                    className="form-control rounded-mhenik" 
                    type={key === 'sellingPrice' || key === 'stockAmount' || key === 'reorderPoint' ? 'number' : 'text'} 
                    min={key === 'sellingPrice' || key === 'stockAmount' || key === 'reorderPoint' ? 0 : undefined} 
                    required 
                    value={form[key]} 
                    onChange={e => setForm({...form, [key]: e.target.value})} 
                  />
                )}
              </div>
            ))}
            <div className="col-12">
  <button 
    type="submit" 
    disabled={isSubmittingIncoming} 
    className="btn btn-primary rounded-mhenik w-100 py-2 fw-bold"
  >
    {isSubmittingIncoming ? '⌛ Logging Allocation...' : 'Inbound Ingestion'}
  </button>
</div>
          </form>
        </div>
      )}

      {/* TAB 3: ORDERS QUEUE */}
      {activeTab === 'orders' && (
        <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white">
          <h3 className="h6 fw-bold text-dark mb-1">Order Verification Queue</h3>
          <p className="text-muted small mb-3">Review client-side cart requests.</p>
          
          {orders.length === 0 ? <p className="text-center text-muted py-3">No manifests queued.</p> : orders.map(order => (
            <div key={order.id} className="card border p-3 mb-2 rounded-mhenik shadow-xs bg-light">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div style={{ maxWidth: '100%' }}>
                  <strong className="text-dark d-block text-break">Client: {order.customerName}</strong>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {order.items?.map((item, index) => (
                      <span key={index} className="badge bg-white text-dark border font-monospace rounded-mhenik">
                        SKU: {item.productSku} (x{item.quantity})
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`badge rounded-mhenik ${order.status === 'PENDING' ? 'bg-warning text-dark' : order.status === 'APPROVED' ? 'bg-primary text-white' : order.status === 'DISPATCHED' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                  {order.status?.toUpperCase()}
                </span>
              </div>
              
              <div className="mt-2 d-flex gap-2 flex-wrap">
                {order.status === 'PENDING' && (
                  <div className="d-flex gap-2">
                    <button 
                      onClick={() => handleOrderApproval(order.id, 'APPROVED')} 
                      className="btn btn-sm btn-primary rounded-mhenik fw-bold"
                    >
                      Approve Allocation Hold
                    </button>
                    <button 
                      onClick={() => handleOrderApproval(order.id, 'REJECTED')} 
                      className="btn btn-sm btn-outline-danger rounded-mhenik fw-bold"
                    >
                      Deny Order
                    </button>
                  </div>
                )}

                {order.status === 'APPROVED' && (
                  <button onClick={() => startOrderScanLifecycle(order)} className="btn btn-sm btn-success rounded-mhenik fw-bold">
                    📷 Verify Barcode to Dispatch
                  </button>
                )}

                {(order.status === 'APPROVED' || order.status === 'DISPATCHED') && (
                  <button onClick={() => printOrderInvoice(order)} className="btn btn-sm btn-outline-secondary rounded-mhenik fw-bold">
                    🖨️ Print Manifest
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ADJUSTMENTS */}
      {activeTab === 'adjustments' && (
        <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white" style={{ maxWidth: '100%' }}>
          <h3 className="h6 fw-bold text-dark mb-1">Stock Level Adjustment Approvals</h3>
          <p className="text-muted small mb-3">Review count corrections or technical inventory recount requests.</p>
          
          {adjustments.length === 0 ? <p className="text-center text-muted py-3">No inventory count corrections requested.</p> : adjustments.map(req => (
            <div key={req.id} className="card border p-3 mb-2 rounded-mhenik shadow-xs bg-light" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <strong className="text-dark d-block text-break" style={{ fontSize: '13px' }}>
                    {req.productName} (SKU: {req.productSku})
                  </strong>
                  <p className="small text-muted mb-1" style={{ fontSize: '12px' }}>
                    Count: <span className="text-danger text-decoration-line-through">{req.oldStock}</span> ➔ <strong className="text-success">{req.newStock} units</strong>
                  </p>
                  <p className="small text-muted mb-1" style={{ fontSize: '11px' }}>By: <strong>{req.requestedBy}</strong></p>
                  <p className="small text-muted fst-italic mb-0 text-break" style={{ fontSize: '11px' }}>Details: "{req.reason}"</p>
                </div>
                
                <div className="mt-1">
                  {req.status === 'PENDING' ? (
                    staff.role === 'admin' ? (
                      <div className="d-flex gap-1">
                        <button onClick={() => resolveAdjustment(req.id, 'APPROVED')} className="btn btn-sm btn-success rounded-mhenik fw-bold px-2 py-1" style={{ fontSize: '12px' }}>Approve</button>
                        <button onClick={() => resolveAdjustment(req.id, 'REJECTED')} className="btn btn-sm btn-outline-danger rounded-mhenik fw-bold px-2 py-1" style={{ fontSize: '12px' }}>Deny</button>
                      </div>
                    ) : <span className="badge bg-warning text-dark rounded-mhenik">Awaiting Admin Review</span>
                  ) : (
                    <span className={`badge rounded-mhenik ${req.status === 'APPROVED' ? 'bg-success' : 'bg-danger'}`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: IAM STAFF ROLES */}
      {activeTab === 'staff' && staff.role === 'admin' && (
        <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white">
          <h3 className="h6 fw-bold text-dark mb-1">IAM Employee Verification Controls</h3>
          <p className="text-muted small mb-3">Activate newly registered staff accounts or manage organizational clearances.</p>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '550px' }}>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Account Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="fw-bold">{u.name}</td>
                    <td className="small text-muted">{u.email}</td>
                    <td>
                      <span className={`badge rounded-mhenik ${u.role === 'admin' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`fw-bold small ${u.status === 'APPROVED' ? 'text-success' : u.status === 'SUSPENDED' ? 'text-danger' : 'text-warning'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {u.email === "joshuaochieng21@gmail.com" ? (
                        <span className="badge bg-light text-muted border rounded-mhenik font-monospace">🔒 Immutable Admin</span>
                      ) : (
                        <div className="d-flex gap-1 justify-content-end flex-wrap">
                          {u.status === 'PENDING' && (
                            <button 
                              onClick={() => handleIAMAction(`/api/admin/users/${u.id}/status`, { status: 'APPROVED' })} 
                              className="btn btn-xs btn-success rounded-mhenik fw-bold px-2 py-1" style={{ fontSize: '11px' }}
                            >
                              Activate
                            </button>
                          )}
                          {u.status === 'APPROVED' && (
                            <button 
                              onClick={() => handleIAMAction(`/api/admin/users/${u.id}/status`, { status: 'SUSPENDED' })} 
                              className="btn btn-xs btn-outline-danger rounded-mhenik fw-bold px-2 py-1" style={{ fontSize: '11px' }}
                            >
                              Suspend
                            </button>
                          )}
                          {u.status === 'SUSPENDED' && (
                            <button 
                              onClick={() => handleIAMAction(`/api/admin/users/${u.id}/status`, { status: 'APPROVED' })} 
                              className="btn btn-xs btn-outline-success rounded-mhenik fw-bold px-2 py-1" style={{ fontSize: '11px' }}
                            >
                              Reactivate
                            </button>
                          )}

                          <button 
                            onClick={() => handleIAMAction(`/api/admin/users/${u.id}/role`, { role: u.role === 'admin' ? 'employee' : 'admin' })} 
                            className="btn btn-xs btn-light text-dark border rounded-mhenik fw-bold px-2 py-1" style={{ fontSize: '11px' }}
                          >
                            Set as {u.role === 'admin' ? 'Staff' : 'Admin'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📜 Module 3 TAB 6: INVENTORY TRANSACTION LEDGER */}
      {activeTab === 'ledger' && staff.role === 'admin' && (
        <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white">
          <h3 className="h6 fw-bold text-dark mb-1">Stock Movement Transaction Ledger</h3>
          <p className="text-muted small mb-3">Immutable tracking history of physical stock changes and holds.</p>
          
          <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '550px' }}>
              <thead className="table-light sticky-top">
                <tr>
                  <th>Timestamp</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Change</th>
                  <th>Balance</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="font-monospace text-muted small">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="fw-bold font-monospace">{tx.productSku}</td>
                    <td>
                      <span className={`badge rounded-mhenik ${tx.quantityChange > 0 ? 'bg-success' : tx.quantityChange < 0 ? 'bg-danger' : 'bg-primary'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`fw-bold ${tx.quantityChange > 0 ? 'text-success' : tx.quantityChange < 0 ? 'text-danger' : 'text-muted'}`}>
                      {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                    </td>
                    <td className="small text-muted">{tx.previousStock} ➔ <strong>{tx.newStock} u</strong></td>
                    <td className="small fw-bold">{tx.actorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'logs' && staff.role === 'admin' && (
        <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white">
          <h3 className="h6 fw-bold text-dark mb-1">System Security Audit Register</h3>
          <p className="text-muted small mb-3">Monitors database writes and stock scans sequentially.</p>
          
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" placeholder="Action..." value={logSearchAction} onChange={e => setLogSearchAction(e.target.value)} /></div>
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" placeholder="Actor..." value={logSearchActor} onChange={e => setLogSearchActor(e.target.value)} /></div>
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" type="date" value={logStartDate} onChange={e => setLogStartDate(e.target.value)} /></div>
            <div className="col-6 col-md-3"><input className="form-control form-control-sm rounded-mhenik" type="date" value={logEndDate} onChange={e => setLogEndDate(e.target.value)} /></div>
          </div>

          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '500px' }}>
              <thead className="table-light sticky-top">
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Class</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="font-monospace text-muted small">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="fw-bold small">{log.userName}</td>
                    <td><span className="badge bg-light text-dark border rounded-mhenik" style={{ fontSize: '10px' }}>{log.action}</span></td>
                    <td className="small text-break">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {editingProduct && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050 }}>
          <form onSubmit={submitCorrectionRequest} className="card border-0 shadow-lg p-4 rounded-mhenik bg-white w-100" style={{ maxWidth: '420px' }}>
            <h4 className="h5 fw-bold text-dark mb-1">Request Stock Correction</h4>
            <p className="small text-muted mb-3">Item: <strong>{editingProduct.productName}</strong></p>
            
            <label className="form-label small fw-bold">Current Count: {editingProduct.stock} units</label>
            <input className="form-control rounded-mhenik mb-3" type="number" min={0} required placeholder="Enter corrected count..." value={correctionTargetQty} onChange={e => setCorrectionTargetQty(e.target.value)} />
            
            <label className="form-label small fw-bold">Justification Reason</label>
            <textarea className="form-control rounded-mhenik mb-3" required placeholder="Reason for change..." value={correctionReason} onChange={e => setCorrectionReason(e.target.value)} rows="3" />
            
            <div className="d-flex justify-content-end gap-2">
              <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-light rounded-mhenik fw-bold">Cancel</button>
              <button type="submit" className="btn btn-primary rounded-mhenik fw-bold">Submit</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}