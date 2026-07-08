const express = require('express');
const router = express.Router();
// 💡 Pull in the client and adapter configurations just like we did in the seeder
const { PrismaClient } = require('../prisma/generated-client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 📦 PATCH Route: Decrement stock when a code is scanned departing the warehouse
router.patch('/admin/decrement-stock/:sku', async (req, res) => {
  const { sku } = req.params;

  try {
    // 1. Check if the product exists in your Postgres engine
    const product = await prisma.product.findUnique({
      where: { sku: sku }
    });

    if (!product) {
      return res.status(404).json({ message: `SKU ${sku} not found in master database inventory context.` });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: `SKU ${sku} is already out of physical stock! Cannot decrement.` });
    }

    // 2. Perform the atomic update operation
    const updatedProduct = await prisma.product.update({
      where: { sku: sku },
      data: {
        stock: { decrement: 1 }
      }
    });

    console.log(`[SCAN LOG] Successfully subtracted 1 unit from ${updatedProduct.productName} (SKU: ${sku})`);

    return res.status(200).json({
      message: 'Stock updated successfully.',
      updatedStock: updatedProduct.stock,
      productName: updatedProduct.productName
    });

  } catch (error) {
    console.error("Error processing warehouse scanner patch request:", error);
    return res.status(500).json({ message: 'Internal server error processing inventory transaction line.' });
  }
});

module.exports = router;