const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/products'); // Updated to single dot!

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('Mhenik Traders Backend Engine Running Smoothly.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});