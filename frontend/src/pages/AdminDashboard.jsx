import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('records');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]); 
  const [adjustments, setAdjustments] = useState([]);
  const [staff, setStaff] = useState({ name: '', role: '' });
  const navigate = useNavigate();

  const [form, setForm] = useState({ sku: '', productName: '', position: '', sellingPrice: '', stockAmount: '', categoryId: '', categoryName: '', vehicleId: '', make: '', model: '' });
  const [generatedQR, setGeneratedQR] = useState('');

  // 🔍 Inventory Filter States
  const [invSearchSku, setInvSearchSku] = useState('');
  const [invSearchName, setInvSearchName] = useState('');
  const [invSearchVehicle, setInvSearchVehicle] = useState('');
  const [invSearchCategory, setInvSearchCategory] = useState('');

  // 🔍 Log Filtering States
  const [logSearchAction, setLogSearchAction] = useState('');
  const [logSearchActor, setLogSearchActor] = useState('');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');

  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logPaginationMeta, setLogPaginationMeta] = useState({ totalPages: 1, totalRecords: 0, hasNextPage: false });

  // ✏️ Edit Request State
  const [editingProduct, setEditingProduct] = useState(null);
  const [correctionTargetQty, setCorrectionTargetQty] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');

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
      fetchPaginatedLogs(1); 
    }
  }, [navigate]);

  useEffect(() => {
    if (staff.role === 'admin') {
      fetchPaginatedLogs(logCurrentPage);
    }
  }, [logCurrentPage]);

  // 🌐 1. Keep the original, flexible loader for Inventory, Orders, and Users
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

  // 📄 2. Create a DEDICATED paginated pipeline exclusively for your logs (with Cache-Busting)
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
        setLogPaginationMeta(resData.pagination);
      }
    })
    .catch(err => console.error("Logs pagination pipeline exception:", err));
  };

  const handleIncomingStock = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/admin/incoming-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` },
      body: JSON.stringify(form)
    })
    .then(() => { 
      setGeneratedQR(form.sku); 
      fetchData('/api/admin/inventory', setInventory); 
      if (staff.role === 'admin') fetchPaginatedLogs(logCurrentPage);
      alert('Allocation logged successfully!'); 
    });
  };

  const handleOrderDecision = (orderId, decision) => {
    fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` },
      body: JSON.stringify({ status: decision })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        // Displays the detailed missing stock items alert
        alert(data.message || "Failed to update order status.");
        return;
      }
      fetchData('/api/admin/orders', setOrders);
      if (staff.role === 'admin') fetchPaginatedLogs(logCurrentPage);
    })
    .catch(err => console.error("Order decision handler error:", err));
  };

  const submitCorrectionRequest = (e) => {
    e.preventDefault();
    
    const targetQty = parseInt(correctionTargetQty, 10);
    
    // 🛡️ Guard: Block negative inventory values completely
    if (targetQty < 0) {
      alert("Invalid Count: Physical warehouse inventory levels cannot be adjusted below 0 units.");
      return;
    }

    // ⚠️ Warning: Double-confirm if setting stock level exactly to 0
    if (targetQty === 0) {
      const confirmZero = window.confirm("Warning: You are adjusting this product's stock level to exactly 0. This will halt outgoing customer scans. Proceed?");
      if (!confirmZero) return;
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
    .then(() => {
      alert("Adjustment request forwarded to admin approval backlog.");
      setEditingProduct(null);
      setCorrectionTargetQty('');
      setCorrectionReason('');
      fetchData('/api/admin/adjustments', setAdjustments);
      if (staff.role === 'admin') fetchPaginatedLogs(logCurrentPage);
    });
  };

  const resolveAdjustment = (id, decision) => {
    fetch(`http://localhost:5000/api/admin/adjustments/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` },
      body: JSON.stringify({ decision })
    })
    .then(() => {
      fetchData('/api/admin/adjustments', setAdjustments);
      fetchData('/api/admin/inventory', setInventory);
      if (staff.role === 'admin') fetchPaginatedLogs(logCurrentPage);
    });
  };

  const handleIAMAction = (endpoint, body) => {
    fetch(`http://localhost:5000${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mhenik_staff_token')}` },
      body: JSON.stringify(body)
    })
    .then(() => {
      fetchData('/api/admin/users', setUsers);
      if (staff.role === 'admin') fetchPaginatedLogs(logCurrentPage);
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = logSearchAction === '' || log.action.toLowerCase().includes(logSearchAction.toLowerCase());
    const matchesActor = logSearchActor === '' || log.userName.toLowerCase().includes(logSearchActor.toLowerCase());
    const logDateStr = new Date(log.createdAt).toISOString().split('T')[0];
    const matchesStart = logStartDate === '' || logDateStr >= logStartDate;
    const matchesEnd = logEndDate === '' || logDateStr <= logEndDate;
    return matchesAction && matchesActor && matchesStart && matchesEnd;
  });

  const theme = {
    bgPattern: 'radial-gradient(circle at top left, #fdfbfb 0%, #ebedee 100%)',
    dotPattern: 'radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 0)',
    primaryColor: '#4A1525', 
    accentColor: '#80263E',
    shadowLight: '0 4px 20px rgba(0, 0, 0, 0.05)',
    shadowCard: '0 10px 30px rgba(0, 0, 0, 0.08)',
    transitionSmooth: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    cardBg: 'rgba(255, 255, 255, 0.92)'
  };

  const tabsAvailable = ['records', 'incoming', 'orders', 'adjustments', staff.role === 'admin' ? 'staff' : null, staff.role === 'admin' ? 'logs' : null].filter(Boolean);

  return (
    <div style={{ padding: '4vw 20px', background: theme.bgPattern, backgroundImage: `${theme.dotPattern}, ${theme.bgPattern}`, backgroundSize: '24px 24px, 100% 100%', minHeight: '100vh', color: '#334155', fontFamily: 'sans-serif' }}>
      
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tab-btn { transition: ${theme.transitionSmooth}; }
        .tab-btn:hover { color: ${theme.primaryColor} !important; background: rgba(74, 21, 37, 0.04) !important; }
        .interactive-row { transition: ${theme.transitionSmooth}; }
        .interactive-row:hover { background-color: rgba(74, 21, 37, 0.02) !important; }
        .form-input { transition: ${theme.transitionSmooth}; width: 100%; box-sizing: border-box; }
        .form-input:focus { border-color: ${theme.accentColor} !important; box-shadow: 0 0 0 3px rgba(128, 38, 62, 0.15) !important; outline: none; }
        .primary-action-btn { transition: ${theme.transitionSmooth}; display: inline-flex; align-items: center; justify-content: center; text-align: center; }
        .primary-action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(74, 21, 37, 0.25) !important; }
        
        /* 📱 CSS Media Queries for Absolute Mobile Responsiveness */
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        .desktop-table { display: table; width: 100%; table-layout: fixed; border-collapse: collapse; }
        .mobile-cards-grid { display: none; }
        .grid-filters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
        .header-box { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }

        @media (max-width: 900px) {
          .grid-filters { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 650px) {
          .desktop-nav { display: none; }
          .mobile-nav { display: block; width: 100%; margin-bottom: 25px; }
          .desktop-table { display: none; }
          .mobile-cards-grid { display: flex; flex-direction: column; gap: 15px; }
          .grid-filters { grid-template-columns: 1fr; gap: 12px; }
          .header-box { flex-direction: column; text-align: center; align-items: center; }
          .header-actions { width: 100%; flex-direction: column; }
          .header-actions > * { width: 100%; }
        }
      `}</style>

      {/* HEADER SECTION PANEL */}
      <div className="header-box" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)', padding: '25px 30px', borderRadius: '16px', boxShadow: theme.shadowCard, marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: '800', color: theme.primaryColor, fontSize: 'calc(20px + 0.8vw)', letterSpacing: '-0.5px' }}>Mhenik Operations Hub</h1>
          <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '14px' }}>
            Workspace Operator: <span style={{fontWeight:'700', color: theme.accentColor}}>{staff.name}</span> 
            <span style={{fontSize: '11px', background: 'rgba(74, 21, 37, 0.1)', color: theme.primaryColor, padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', marginLeft: '6px'}}>{staff.role?.toUpperCase()}</span>
          </p>
        </div>
        <div className="header-actions" style={{display:'flex', gap:'12px', flexWrap: 'wrap'}}>
          <a href="/admin/scan" className="primary-action-btn" style={{ padding: '12px 20px', background: theme.primaryColor, color: '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(74, 21, 37, 0.15)' }}>📷 Scanner Terminal</a>
          <button onClick={() => { localStorage.clear(); navigate('/admin/auth'); }} className="primary-action-btn" style={{ padding: '12px 20px', background: '#fff', color: '#ef4444', border:'1px solid #fca5a5', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      {/* 🧭 DESKTOP NAVIGATION TABS */}
      <div className="desktop-nav" style={{ gap: '8px', background: 'rgba(255,255,255,0.6)', padding: '6px', borderRadius: '12px', marginBottom: '30px', maxWidth: 'fit-content', boxShadow: theme.shadowLight }}>
        {tabsAvailable.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="tab-btn" style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: activeTab === tab ? theme.primaryColor : 'transparent', color: activeTab === tab ? '#fff' : '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 📱 MOBILE DROPDOWN SELECTION NAVIGATION */}
      <div className="mobile-nav">
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: theme.primaryColor, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workspace Location Menu</label>
        <select 
          value={activeTab} 
          onChange={(e) => setActiveTab(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `2px solid ${theme.primaryColor}`, background: '#fff', fontSize: '15px', fontWeight: '700', color: theme.primaryColor, outline: 'none', boxShadow: theme.shadowLight }}
        >
          {tabsAvailable.map(tab => (
            <option key={tab} value={tab}>{tab.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* ADJUSTMENT TRIGGER SPECIMEN MODAL WINDOW */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={submitCorrectionRequest} style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: theme.shadowCard, width: '100%', maxWidth: '450px', boxSizing: 'border-box' }}>
            <h4 style={{ margin: '0 0 5px 0', color: theme.primaryColor, fontSize: '18px', fontWeight: '700' }}>Request Stock Correction</h4>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Item: <strong>{editingProduct.productName}</strong></p>
            
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Current Count: {editingProduct.stock} units</label>
            <input className="form-input" type="number" required placeholder="Enter true corrected count..." value={correctionTargetQty} onChange={e => setCorrectionTargetQty(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px' }} />
            
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Justification Reason</label>
            <textarea className="form-input" required placeholder="Reason for change..." value={correctionReason} onChange={e => setCorrectionReason(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', marginBottom: '20px', fontFamily: 'sans-serif' }} />
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 18px', background: theme.primaryColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Submit</button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTAINER 1: RECORDS (LIVE INVENTORY) */}
      {activeTab === 'records' && (
        <div className="animate-fade-in" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)', borderRadius: '16px', padding: 'clamp(15px, 4vw, 30px)', boxShadow: theme.shadowCard }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: theme.primaryColor }}>Live Inventory Matrix ({inventory.length} items)</h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>Comprehensive stock levels index across warehouse branches.</p>
          
          {/* Dynamic Search Filter Board */}
          <div className="grid-filters" style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <input className="form-input" placeholder="Filter SKU..." value={invSearchSku} onChange={e => setInvSearchSku(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
            <input className="form-input" placeholder="Designation..." value={invSearchName} onChange={e => setInvSearchName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
            <input className="form-input" placeholder="Vehicle range..." value={invSearchVehicle} onChange={e => setInvSearchVehicle(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
            <input className="form-input" placeholder="Category..." value={invSearchCategory} onChange={e => setInvSearchCategory(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
          </div>

          {/* 💻 TABLE FOR LARGE SCREEN RESOLUTIONS */}
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="desktop-table">
              <thead>
                <tr style={{ background: 'rgba(74, 21, 37, 0.03)', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 12px', fontSize: '13px', color: theme.primaryColor, width: '10%' }}>SKU</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', color: theme.primaryColor, width: '30%' }}>Component Designation</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', color: theme.primaryColor, width: '20%' }}>Vehicle Range</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', color: theme.primaryColor, width: '15%' }}>Category</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', color: theme.primaryColor, width: '10%' }}>Price</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', color: theme.primaryColor, width: '15%' }}>Stock Level</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', color: theme.primaryColor, textAlign: 'right', width: '10%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory
                  .filter(p => String(p.sku).includes(invSearchSku) && p.productName.toLowerCase().includes(invSearchName.toLowerCase()) && `${p.vehicle?.make} ${p.vehicle?.model}`.toLowerCase().includes(invSearchVehicle.toLowerCase()) && p.category?.name.toLowerCase().includes(invSearchCategory.toLowerCase()))
                  .map(prod => (
                    <tr key={prod.sku} className="interactive-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold', fontFamily: 'monospace' }}>{prod.sku}</td>
                      <td style={{ padding: '16px 12px', fontWeight: '600', wordWrap: 'break-word', whiteSpace: 'normal' }}>{prod.productName}</td>
                      <td style={{ padding: '16px 12px', color: '#475569' }}>{prod.vehicle?.make} {prod.vehicle?.model}</td>
                      <td style={{ padding: '16px 12px' }}><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{prod.category?.name}</span></td>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold', color: theme.accentColor }}>KES {prod.sellingPrice?.toLocaleString()}</td>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold', color: prod.stock < 5 ? '#ef4444' : '#22c55e' }}>{prod.stock} units</td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <button onClick={() => setEditingProduct(prod)} style={{ background: '#fff', color: theme.primaryColor, border: `1px solid ${theme.primaryColor}`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* 📱 RESPONSIBILITY RESPONSIVE CARDS FOR MOBILE VIEWS */}
          <div className="mobile-cards-grid">
            {inventory
              .filter(p => String(p.sku).includes(invSearchSku) && p.productName.toLowerCase().includes(invSearchName.toLowerCase()) && `${p.vehicle?.make} ${p.vehicle?.model}`.toLowerCase().includes(invSearchVehicle.toLowerCase()) && p.category?.name.toLowerCase().includes(invSearchCategory.toLowerCase()))
              .map(prod => (
                <div key={prod.sku} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: theme.shadowLight }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>SKU {prod.sku}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: prod.stock < 5 ? '#ef4444' : '#22c55e' }}>{prod.stock} units</span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: theme.primaryColor, fontWeight: '700' }}>{prod.productName}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#475569' }}><strong>Vehicle:</strong> {prod.vehicle?.make} {prod.vehicle?.model}</p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}><strong>Category:</strong> {prod.category?.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: theme.accentColor }}>KES {prod.sellingPrice?.toLocaleString()}</span>
                    <button onClick={() => setEditingProduct(prod)} style={{ background: '#fff', color: theme.primaryColor, border: `1px solid ${theme.primaryColor}`, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Edit Stock</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB CONTAINER 4: ADJUSTMENTS QUEUE CARD LAYOUT */}
      {activeTab === 'adjustments' && (
        <div className="animate-fade-in" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)', borderRadius: '16px', padding: 'clamp(15px, 4vw, 30px)', boxShadow: theme.shadowCard }}>
          <h3>Stock Level Adjustment Approvals</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 25px 0' }}>Review count corrections. Admins hold singular authorization privilege.</p>
          
          {adjustments.length === 0 ? <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>No inventory count corrections requested.</p> : adjustments.map(req => (
            <div key={req.id} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '15px', boxShadow: theme.shadowLight }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <strong style={{ fontSize: '15px', color: theme.primaryColor }}>{req.productName} (SKU: {req.productSku})</strong>
                  <p style={{ fontSize: '13px', margin: '6px 0 0 0', color: '#475569' }}>
                    Proposed count change: <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{req.oldStock}</span> ➔ <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{req.newStock} units</span>
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Requested By: <strong>{req.requestedBy}</strong></p>
                  <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0', fontStyle: 'italic' }}>Reason: "{req.reason}"</p>
                </div>
                <div style={{ minWidth: 'fit-content' }}>
                  {req.status === 'PENDING' ? (
                    staff.role === 'admin' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => resolveAdjustment(req.id, 'APPROVED')} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Approve</button>
                        <button onClick={() => resolveAdjustment(req.id, 'REJECTED')} style={{ background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Deny</button>
                      </div>
                    ) : <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '13px' }}>Awaiting Admin Review</span>
                  ) : <span style={{ fontWeight: 'bold', color: req.status === 'APPROVED' ? '#22c55e' : '#ef4444', fontSize: '13px' }}>{req.status}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTAINER 2: INCOMING CODES FLOW CONTAINER */}
      {activeTab === 'incoming' && (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '35px', flexWrap: 'wrap' }}>
          <form onSubmit={handleIncomingStock} style={{ flex: 2, minWidth: '280px', background: theme.cardBg, padding: '30px', borderRadius: '16px', boxShadow: theme.shadowCard }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Log Incoming Supply Cargo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {Object.keys(form).map((key) => (
                <div key={key} style={{ gridColumn: key === 'stockAmount' ? 'span minmax(1, 2)' : 'auto' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                  <input className="form-input" type={key === 'sellingPrice' || key === 'stockAmount' ? 'number' : 'text'} required placeholder={`Enter ${key}...`} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff' }} />
                </div>
              ))}
            </div>
            <button type="submit" className="primary-action-btn" style={{ marginTop: '25px', padding: '14px', background: theme.primaryColor, color: '#fff', border: 'none', width: '100%', fontWeight:'700', borderRadius: '10px', cursor:'pointer' }}>Inbound Ingestion</button>
          </form>
        </div>
      )}

      {/* TAB CONTAINER 3: ORDERS MANIFEST VIEWS */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in" style={{ background: theme.cardBg, borderRadius: '16px', padding: 'clamp(15px, 4vw, 30px)', boxShadow: theme.shadowCard }}>
          <h3>Order Verification Logs Queue</h3>
          {orders.length === 0 ? <p style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>No manifests queued.</p> : orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #e2e8f0', padding: '20px', marginBottom: '15px', borderRadius: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <strong>Client Manifest: {order.customerName}</strong>
                <span style={{ fontWeight: 'bold', color: order.status === 'PENDING' ? '#ea580c' : 'green' }}>{order.status}</span>
              </div>
              {order.status === 'PENDING' && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleOrderDecision(order.id, 'APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor:'pointer', fontWeight: 'bold' }}>Approve</button>
                  <button onClick={() => handleOrderDecision(order.id, 'DISAPPROVED')} style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '6px', cursor:'pointer', fontWeight: 'bold' }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTAINER 5: IAM ACCESS SYSTEM */}
      {activeTab === 'staff' && staff.role === 'admin' && (
        <div className="animate-fade-in" style={{ background: theme.cardBg, borderRadius: '16px', padding: 'clamp(15px, 4vw, 30px)', boxShadow: theme.shadowCard }}>
          <h3>IAM Employee Verification Controls Hub</h3>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', minWidth: '500px' }}>
              <thead>
                <tr style={{ background: 'rgba(74, 21, 37, 0.03)', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px' }}>User Name</th>
                  <th style={{ padding: '16px' }}>Email</th>
                  <th style={{ padding: '16px' }}>Role</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="interactive-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', fontWeight: '700' }}>{u.name}</td>
                    <td style={{ padding: '16px' }}>{u.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: u.role === 'admin' ? '#fef2f2' : '#f1f5f9', color: u.role === 'admin' ? '#ef4444' : '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '700', color: u.status === 'APPROVED' ? '#22c55e' : '#f59e0b' }}>
                      {u.status}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {u.email === "joshuaochieng21@gmail.com" ? (
                        <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>🔒 Immutable Root Account</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {u.status === 'PENDING' && <button onClick={() => handleIAMAction(`/api/admin/users/${u.id}/status`, { status: 'APPROVED' })} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Activate</button>}
                          {u.status === 'APPROVED' && <button onClick={() => handleIAMAction(`/api/admin/users/${u.id}/status`, { status: 'SUSPENDED' })} style={{ background: '#fff', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Suspend</button>}
                          {u.role === 'employee' ? <button onClick={() => handleIAMAction(`/api/admin/users/${u.id}/role`, { role: 'admin' })} style={{ background: '#fff', color: theme.primaryColor, border: `1px solid ${theme.primaryColor}`, padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Promote</button> : <button onClick={() => handleIAMAction(`/api/admin/users/${u.id}/role`, { role: 'employee' })} style={{ background: '#fff', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Demote</button>}
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

      {/* TAB CONTAINER 6: HISTORY AUDIT TRAILS */}
      {activeTab === 'logs' && staff.role === 'admin' && (
        <div className="animate-fade-in" style={{ background: theme.cardBg, borderRadius: '16px', padding: 'clamp(15px, 4vw, 30px)', boxShadow: theme.shadowCard }}>
          <h3>System Audit Trails & Ledger History Log</h3>
          
          <div className="grid-filters" style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <input className="form-input" placeholder="Event Class Type..." value={logSearchAction} onChange={e => setLogSearchAction(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
            <input className="form-input" placeholder="Operator Actor..." value={logSearchActor} onChange={e => setLogSearchActor(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
            <input className="form-input" type="date" value={logStartDate} onChange={e => setLogStartDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
            <input className="form-input" type="date" value={logEndDate} onChange={e => setLogEndDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '600px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', borderBottom: '1px solid #e2e8f0', zIndex: 5 }}>
                <tr style={{ textAlign: 'left' }}><th style={{ padding: '14px' }}>Timestamp</th><th>Authorized Actor</th><th>Event Class</th><th>Transaction Details</th></tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <td style={{ padding: '14px', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', padding: '14px' }}>{log.userName}</td>
                    <td style={{ padding: '14px' }}><span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: log.action.includes('INGEST') || log.action.includes('APPROVED') ? '#f0fdf4' : '#f1f5f9', color: log.action.includes('INGEST') || log.action.includes('APPROVED') ? '#16a34a' : '#475569' }}>{log.action}</span></td>
                    <td style={{ color: '#334155', padding: '14px' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      )}

    </div>
  );
}