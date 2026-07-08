require('dotenv').config();
const { PrismaClient } = require('./generated-client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Initialize the direct PostgreSQL connection string
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:mhenik123@localhost:5432/mhenik_inventory?schema=public";

// Construct the mandatory Prisma 7 driver adapter 
const adapter = new PrismaPg({ connectionString });

// Instantiate your client explicitly passing the adapter framework config
const prisma = new PrismaClient({ adapter });

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function main() {
  console.log("🚀 Starting data migration pipeline stream...");
  
  const csvFilePath = path.join(__dirname, '../mock_products.csv');
  const processingRows = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const promise = (async () => {
        try {
          // 1. Seed Parent Categories
          await prisma.category.upsert({
            where: { id: row.category_id },
            update: { name: row.Category },
            create: { id: row.category_id, name: row.Category }
          });

          // 2. Seed Parent Vehicles
          await prisma.vehicle.upsert({
            where: { id: row.vehicle_id },
            update: { make: row.Make, model: row.Model },
            create: { id: row.vehicle_id, make: row.Make, model: row.Model }
          });

          // 3. Seed Master Inventory Records
          await prisma.product.upsert({
            where: { sku: row.SKU },
            update: {
              productName: row.Product_Name,
              position: row.Position || null,
              sellingPrice: parseFloat(row.Selling_Price) || 0,
              category_id: row.category_id,
              vehicle_id: row.vehicle_id
            },
            create: {
              sku: row.SKU,
              productName: row.Product_Name,
              position: row.Position || null,
              sellingPrice: parseFloat(row.Selling_Price) || 0,
              category_id: row.category_id,
              vehicle_id: row.vehicle_id,
              stock: 12 // Initial testing stock numbers
            }
          });
        } catch (err) {
          console.error(`❌ Error parsing data row for SKU [${row.SKU}]:`, err.message);
        }
      })();
      processingRows.push(promise);
    })
    .on('end', async () => {
      await Promise.all(processingRows);
      console.log("✅ Seed run sync complete! Inventory rows securely migrated into PostgreSQL.");
      await prisma.$disconnect();
    });
}

main().catch(async (e) => {
  console.error("Fatal exception trace running background data seeding operations:", e);
  await prisma.$disconnect();
  process.exit(1);
});