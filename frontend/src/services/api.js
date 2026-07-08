import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// 💡 Replace fetchProducts inside frontend/src/services/api.js:
export async function fetchProducts(search = '', page = 1, limit = 12) {
  // Direct full query to your live inventory routing network
  const url = `http://localhost:5000/api/admin/inventory?search=${encodeURIComponent(search)}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Catalog pipeline sync exception.");
  const data = await response.json();

  // Filter items in memory if your database query isn't fully filtered yet
  let filtered = data;
  if (search) {
    const q = search.toLowerCase();
    filtered = data.filter(p => 
      p.productName.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q)
    );
  }

  // Handle client-side mock pagination cleanly to keep standard button layouts fully intact
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