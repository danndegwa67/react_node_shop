const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ⚙️ 1. Core Global Middleware Setup
app.use(cors({
  origin: 'http://localhost:5173', // Matches your local React frontend port
  credentials: true
}));
app.use(express.json());

// 🗄️ 2. Initialize Prisma 7 Database Driver Engine
const { PrismaClient } = require('./prisma/generated-client'); 
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:mhenik123@localhost:5432/mhenik_inventory?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// =========================================================================
// 📦 INVENTORY ENDPOINTS (Dashboard Ledger & Incoming QR Systems)
// =========================================================================

// 📑 GET: Fetch all master inventory records for the employee overview grid
app.get('/api/admin/inventory', async (req, res) => {
  try {
    const inventory = await prisma.product.findMany({
      include: { category: true, vehicle: true },
      orderBy: { productName: 'asc' }
    });
    return res.status(200).json(inventory);
  } catch (error) {
    console.error("[ERROR] Failed to fetch inventory matrix records:", error);
    return res.status(500).json({ message: "Failed to fetch inventory records." });
  }
});

// ➕ POST: Ingest newly arriving inventory stock allocations (Generates labels)
app.post('/api/admin/incoming-stock', async (req, res) => {
  const { 
    sku, productName, position, sellingPrice, stockAmount, 
    categoryId, categoryName, vehicleId, make, model 
  } = req.body;
  
  try {
    // Ensure parent bucket structural categories are updated/created
    await prisma.category.upsert({
      where: { id: categoryId },
      update: { name: categoryName },
      create: { id: categoryId, name: categoryName }
    });

    // Ensure vehicle structural dimensions exist
    await prisma.vehicle.upsert({
      where: { id: vehicleId },
      update: { make, model },
      create: { id: vehicleId, make, model }
    });

    // Upsert the child master product entity row record
    const product = await prisma.product.upsert({
      where: { sku: sku },
      update: {
        stock: { increment: parseInt(stockAmount) }
      },
      create: {
        sku: sku,
        productName: productName,
        position: position || null,
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stockAmount),
        category_id: categoryId,
        vehicle_id: vehicleId
      }
    });

    console.log(`[INVENTORY] Ingested supply stream allocation: SKU ${sku} added +${stockAmount} items.`);
    return res.status(200).json({ message: "Stock ingested successfully.", product });
  } catch (error) {
    console.error("[ERROR] Failed processing incoming cargo stock insertion loop:", error);
    return res.status(500).json({ message: "Failed to process incoming stock allocation." });
  }
});

// =========================================================================
// 📷 SCANNER ENDPOINTS (Departures & Stock Subtractions)
// =========================================================================

// 📉 PATCH: Atomically subtract stock counts when an item exits via a webcam scan
app.patch('/api/admin/decrement-stock/:sku', async (req, res) => {
  const { sku } = req.params;
  console.log(`[NETWORK] Incoming warehouse scan execution request for SKU: ${sku}`);

  try {
    const product = await prisma.product.findUnique({ where: { sku: sku } });

    if (!product) {
      console.log(`[WARN] Scan failed: SKU ${sku} does not exist in PostgreSQL.`);
      return res.status(404).json({ message: "SKU not found." });
    }
    if (product.stock <= 0) {
      console.log(`[WARN] Scan failed: SKU ${sku} (${product.productName}) has empty stock allocations.`);
      return res.status(400).json({ message: "Out of stock." });
    }

    const updatedProduct = await prisma.product.update({
      where: { sku: sku },
      data: { stock: { decrement: 1 } }
    });

    console.log(`[SUCCESS] Stock decremented for ${updatedProduct.productName}. Remaining: ${updatedProduct.stock}`);

    return res.status(200).json({
      message: 'Stock decremented.',
      updatedStock: updatedProduct.stock,
      productName: updatedProduct.productName
    });
  } catch (error) {
    console.error("[CRASH] Camera scanning patch transaction failure:", error);
    return res.status(500).json({ message: 'Internal server error processing reduction.' });
  }
});

// =========================================================================
// 📋 ORDER MANAGEMENT ENDPOINTS (Verification Boards & Approvals)
// =========================================================================

// 📑 GET: Fetch all active outgoing order manifests awaiting dispatch processing
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("[ERROR] Failed to query warehouse order manifests:", error);
    return res.status(500).json({ message: "Failed to load warehouse order manifest." });
  }
});

// ⚖️ PATCH: Approve or Disapprove a shipping order container block item line
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expects "APPROVED" or "DISAPPROVED"

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: status }
    });
    
    console.log(`[ORDERS] Order confirmation change: ID ${id.slice(0, 8)} set to status: ${status}`);
    return res.status(200).json({ message: `Order status set to ${status}`, updatedOrder });
  } catch (error) {
    console.error("[ERROR] Failed to compile order approval validation state:", error);
    return res.status(500).json({ message: "Failed to update order status authorization." });
  }
});

// ➕ POST: Submit a brand new storefront availability request order into the system
app.post(['/orders', '/api/orders'], async (req, res) => {
  const { customerName, items } = req.body; 

  if (!customerName || !items || items.length === 0) {
    return res.status(400).json({ message: "Missing required checkout manifest parameters." });
  }

  try {
    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName,
        status: "PENDING",
        items: {
          create: items.map(item => ({
            productSku: item.sku,
            quantity: item.qty || item.quantity || 1
          }))
        }
      },
      include: { items: true }
    });

    console.log(`[ORDERS] Success: New availability manifest saved for ${customerName}.`);
    return res.status(201).json({ message: "Availability request logged successfully!", orderId: newOrder.id });
  } catch (error) {
    console.error("[ERROR] Failed to commit new order manifest block execution:", error);
    return res.status(500).json({ message: "Internal database write error saving request." });
  }
});

// =========================================================================
// 🌐 SERVER PORT INITIALIZATION BINDING
// =========================================================================
app.listen(PORT, () => {
  console.log(`🚀 Express server is officially live and listening on http://localhost:${PORT}`);
});