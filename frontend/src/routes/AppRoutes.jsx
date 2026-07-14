import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetails'; 
import VehicleSearch from '../pages/VehicleSearch';
import Cart from '../pages/Cart';
import Orders from '../pages/Orders';
import About from '../pages/About';
import Contact from '../pages/Contact';
import FAQ from '../pages/FAQ';
import AdminScan from '../pages/AdminScan';
import AdminDashboard from '../pages/AdminDashboard';
import AdminAuth from '../pages/AdminAuth';

function AppRoutes() {
  return (
    <Routes>
      {/* Primary Customer Funnel */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products" element={<Shop />} /> {/* Safe fall-through wrapper */}
      <Route path="/product/:sku" element={<ProductDetail />} />
      <Route path="/vehicle-search" element={<VehicleSearch />} />
      
      {/* Order Monitoring */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Orders />} />
      
      {/* Information Anchors */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/admin/scan" element={<AdminScan />} />

      {/* Admin Dashboard */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/auth" element={<AdminAuth />} />
      
    </Routes>
  );
}

export default AppRoutes;