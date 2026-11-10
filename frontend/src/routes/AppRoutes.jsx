import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetails'; 
import Cart from '../pages/Cart';
import Orders from '../pages/Orders';
import Contact from '../pages/Contact';
import FAQ from '../pages/FAQ';
import AdminScan from '../pages/AdminScan';
import AdminDashboard from '../pages/AdminDashboard';
import AdminAuth from '../pages/AdminAuth';
import BlogList from '../pages/BlogList';
import BlogPost from '../pages/BlogPost';
import Learn from '../pages/Learn';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products" element={<Shop />} />
      <Route path="/product/:sku" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/admin/scan" element={<AdminScan />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/auth" element={<AdminAuth />} />
      {/* Knowledge Base & Spares Guides */}
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
    </Routes>
  );
}

export default AppRoutes;