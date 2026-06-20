const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Points to backend/data/products.json
const dataPath = path.join(__dirname, '../../data/products.json');

const readProductsFile = () => {
  try {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading JSON database:", error);
    return [];
  }
};

router.get('/', (req, res) => {
  const allProducts = readProductsFile();
  
  const search = req.query.search ? req.query.search.toLowerCase() : '';
  const category = req.query.category ? req.query.category.toLowerCase() : '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12; // 12 matches our frontend grid limit

  let filteredProducts = allProducts.filter(item => {
    const nameStr = item.product_name ? item.product_name.toLowerCase() : '';
    const skuStr = item.sku ? item.sku.toLowerCase() : '';
    
    const matchesSearch = nameStr.includes(search) || skuStr.includes(search);
    const matchesCategory = category ? (item.category && item.category.toLowerCase() === category) : true;
    
    return matchesSearch && matchesCategory;
  });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = filteredProducts.slice(startIndex, endIndex);

  res.json({
    totalItems: filteredProducts.length,
    totalPages: Math.ceil(filteredProducts.length / limit),
    currentPage: page,
    itemsPerPage: limit,
    products: paginatedResults
  });
});

router.get('/:sku', (req, res) => {
  const allProducts = readProductsFile();
  const product = allProducts.find(p => p.sku === req.params.sku);

  if (!product) {
    return res.status(404).json({ message: "Product not found using provided SKU code." });
  }

  res.json(product);
});

module.exports = router;