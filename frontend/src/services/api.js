import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const fetchProducts = (search = '', category = '', page = 1, limit = 12) => {
  return API.get('/products', {
    params: { search, category, page, limit }
  });
};