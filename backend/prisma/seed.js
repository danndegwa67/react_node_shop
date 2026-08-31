const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:mhenik123@localhost:5432/mhenik_inventory?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedDatabase() {
  console.log("🚀 Starting Inventory Data Ingestion Pipeline...");

  const jsonPath = path.join(__dirname, '../inventory.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ Error: inventory.json file not found in backend directory!");
    process.exit(1);
  }

  // 🧹 Read raw text & replace unquoted NaN with null so JSON.parse won't crash
  const rawText = fs.readFileSync(jsonPath, 'utf8');
  const sanitizedText = rawText.replace(/:\s*NaN\b/g, ': null');

  const rawData = JSON.parse(sanitizedText);
  const products = rawData.Products || [];

  console.log(`📦 Found ${products.length} products to insert.`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of products) {
    try {
      const cleanSku = String(item.SKU).trim();
      if (!cleanSku) continue;

      const cleanPrice = parseFloat(String(item["Selling Price"] || "0").replace(/,/g, ''));

      // Category setup
      const catId = item.category_id && String(item.category_id) !== "null" 
        ? String(item.category_id) 
        : "cat_general";
      const catName = item.Category && String(item.Category) !== "null" 
        ? String(item.Category) 
        : "General Spares";

      await prisma.category.upsert({
        where: { id: catId },
        update: { name: catName },
        create: { id: catId, name: catName }
      });

      // Vehicle setup
      const vehId = item.vehicle_id && String(item.vehicle_id) !== "null" 
        ? String(item.vehicle_id) 
        : "veh_universal";
      const vehMake = item.Make && String(item.Make) !== "null" 
        ? String(item.Make) 
        : "Universal";
      const vehModel = item.Model && String(item.Model) !== "null" 
        ? String(item.Model) 
        : "Generic Fit";

      await prisma.vehicle.upsert({
        where: { id: vehId },
        update: { make: vehMake, model: vehModel },
        create: { id: vehId, make: vehMake, model: vehModel }
      });

      const cleanPosition = item.Position && String(item.Position) !== "null" 
        ? String(item.Position) 
        : null;

      await prisma.product.upsert({
        where: { sku: cleanSku },
        update: {
          productName: item["Product Name"] || "Spare Part",
          sellingPrice: cleanPrice,
          position: cleanPosition,
          category_id: catId,
          vehicle_id: vehId
        },
        create: {
          sku: cleanSku,
          productName: item["Product Name"] || "Spare Part",
          sellingPrice: cleanPrice,
          position: cleanPosition,
          stock: 10,
          heldStock: 0,
          reorderPoint: 3,
          condition: "OEM_GENUINE",
          side: cleanPosition ? cleanPosition.toUpperCase() : "UNIVERSAL",
          category_id: catId,
          vehicle_id: vehId
        }
      });

      successCount++;
    } catch (err) {
      console.error(`⚠️ Ingestion skipped for SKU [${item.SKU}]:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n🎉 Ingestion Complete!`);
  console.log(`✅ Successfully inserted/updated: ${successCount} products.`);
  if (errorCount > 0) console.log(`⚠️ Skipped/Failed: ${errorCount} items.`);
}

seedDatabase()
  .catch(e => {
    console.error("❌ Fatal Seeding Failure:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });