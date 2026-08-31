import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [msg, setMsg] = useState({ text: '', isError: false });
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'https://reactnodeshop-production.up.railway.app';

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ text: '', isError: false });

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status >= 400) throw new Error(data.message || "Authentication rejected.");

      if (isLogin) {
        localStorage.setItem('mhenik_staff_token', data.token);
        localStorage.setItem('mhenik_staff_profile', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setMsg({ text: data.message, isError: false });
        setIsLogin(true);
      }
    })
    .catch(err => setMsg({ text: err.message, isError: true }));
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
          {isLogin ? "Staff Portal Login" : "Employee Workspace Registration"}
        </h2>
        <p style={{ textAllign: 'center', color: '#666', fontSize: '14px', marginBottom: '25px', textAlign: 'center' }}>
          Mhenik Trading Warehouse Systems Framework
        </p>

        {msg.text && (
          <div style={{ padding: '12px', borderRadius: '4px', background: msg.isError ? '#f8d7da' : '#d4edda', color: msg.isError ? '#721c24' : '#155724', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input type="text" placeholder="Full Employee Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
          )}
          <input type="email" placeholder="Corporate Email Address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="password" placeholder="Account Key Password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} />
          
          <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {isLogin ? "Authenticate Account →" : "Register Credentials Request"}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555' }}>
          {isLogin ? "New user joining our team? " : "Already verified staff? "}
          <span onClick={() => { setIsLogin(!isLogin); setMsg({ text: '', isError: false }); }} style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
            {isLogin ? "Register Workspace Profile" : "Login Here"}
          </span>
        </p>
      </div>
    </div>
  );
}