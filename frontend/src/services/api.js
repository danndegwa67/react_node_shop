import axios from 'axios';

// Directly fallback to your live Railway backend URL if the env var isn't picked up
const API_BASE = import.meta.env.VITE_API_URL || 'https://reactnodeshop-production-xxxx.up.railway.app';

const API = axios.create({
  baseURL: `${API_BASE}/api`
});

export async function fetchProducts(search = '', page = 1, limit = 12) {
  // Use dynamic API_BASE instead of hardcoded localhost
  const url = `${API_BASE}/api/admin/inventory?search=${encodeURIComponent(search)}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Catalog pipeline sync exception.");
  const data = await response.json();

  let filtered = data;
  if (search) {
    const q = search.toLowerCase();
    filtered = data.filter(p => 
      p.productName.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q)
    );
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

  return {
    data: {
      products: paginatedProducts,
      totalPages: totalPages
    }
  };
}