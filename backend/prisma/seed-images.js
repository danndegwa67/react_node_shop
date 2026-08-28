require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configure connection pool from DATABASE_URL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Auto spare part shorthand mappings
const EXPANSIONS = {
  sd: 'side',
  fl: 'front left',
  fr: 'front right',
  rl: 'rear left',
  rr: 'rear right',
  lh: 'left',
  rh: 'right',
  l: 'left',
  r: 'right',
  blk: 'black',
  set: 'pair'
};

function tokenize(text) {
  if (!text) return new Set();
  const rawTokens = text
    .toLowerCase()
    .replace(/[_\-–—/\\|()[\],.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const set = new Set();
  for (const t of rawTokens) {
    set.add(t);
    if (EXPANSIONS[t]) {
      EXPANSIONS[t].split(' ').forEach(x => set.add(x));
    }
  }
  return set;
}

function calculateScore(fileTokens, targetTokens) {
  let matched = 0;
  for (const token of fileTokens) {
    if (targetTokens.has(token)) matched++;
  }
  return matched;
}

async function run() {
  const uploadsDir = path.join(__dirname, '../data/public/uploads');

  if (!fs.existsSync(uploadsDir)) {
    console.error(`❌ Folder not found: ${uploadsDir}`);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`📂 Found ${files.length} items in uploads directory.`);

  const products = await prisma.product.findMany({
    include: { vehicle: true, category: true }
  });
  console.log(`📦 Loaded ${products.length} inventory products from database.`);

  let matchedCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const baseName = path.basename(file, ext);
    const fileTokens = tokenize(baseName);

    let bestMatch = null;
    let highestScore = 0;

    for (const prod of products) {
      const targetString = `${prod.productName} ${prod.vehicle?.make || ''} ${prod.vehicle?.model || ''} ${prod.side || ''}`;
      const targetTokens = tokenize(targetString);

      const score = calculateScore(fileTokens, targetTokens);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = prod;
      }
    }

    // Require at least 2 token matches to prevent false positives
    if (bestMatch && highestScore >= 2) {
      const relativeUrl = `/uploads/${encodeURIComponent(file)}`;

      await prisma.product.update({
        where: { sku: bestMatch.sku },
        data: { imageUrl: relativeUrl }
      });

      console.log(`✅ Linked: "${file}" ➔ [${bestMatch.sku}] ${bestMatch.productName}`);
      matchedCount++;
    } else {
      console.warn(`⚠️ No confident match for: "${file}" (score: ${highestScore})`);
    }
  }

  console.log(`\n🎉 Image correlation complete! Attached ${matchedCount} images.`);
}

run()
  .catch((err) => {
    console.error('❌ Seeder encountered an error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });