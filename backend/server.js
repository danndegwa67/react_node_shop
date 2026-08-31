const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mhenik_super_secret_key_2026";

// ⚙️ Core Global Middleware Setup
app.use(cors({
  origin: ['https://mheniktraders.shop', 'https://www.mheniktraders.shop', 'http://localhost:5173'],
  credentials: true
}));
app.options('*', cors()); // Enable pre-flight across-the-board for all routes
app.use(express.json());

// 🗄️ Initialize Prisma 7 Database Driver Engine
const { PrismaClient } = require('@prisma/client'); 
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:mhenik123@localhost:5432/mhenik_inventory?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
// 🕵️‍♂️ System Audit Logging Utility
async function createAuditLog(userId, userName, action, details) {
  try {
    const safeUserId = String(userId || "system-id");
    const safeUserName = String(userName || "System Operator");
    const safeAction = String(action || "UNKNOWN_ACTION");
    const safeDetails = String(details || "No transactional breakdown provided.");

    console.log(`[AUDIT INGEST] Executing Log Write -> Action: [${safeAction}] by User: [${safeUserName}]`);

    await prisma.activityLog.create({
      data: {
        userId: safeUserId,
        userName: safeUserName,
        action: safeAction,
        details: safeDetails
      }
    });
    
    console.log(`[AUDIT SUCCESS] Event [${safeAction}] committed safely to PostgreSQL.`);
  } catch (err) {
    console.error(`[AUDIT CRASH] Critical logger loop failure:`, err.message);
  }
}

// 📜 Transaction Ledger Entry Logger Helper
async function recordInventoryTransaction(tx, { sku, type, change, prevStock, newStock, refId, actor }) {
  try {
    const db = tx || prisma;
    await db.inventoryTransaction.create({
      data: {
        productSku: sku,
        type: type,
        quantityChange: change,
        previousStock: prevStock,
        newStock: newStock,
        referenceId: String(refId || ''),
        actorName: actor || 'System Operator'
      }
    });
  } catch (err) {
    console.error("[LEDGER CRASH] Failed to record transaction entry:", err.message);
  }
}

// =========================================================================
// 🛡️ SECURITY GUARD MIDDLEWARES
// =========================================================================

const authenticateStaff = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access denied. Auth token missing." });

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) return res.status(403).json({ message: "Session expired or invalid token signature." });
    if (decodedUser.status !== "APPROVED") {
      return res.status(403).json({ message: "Access locked. Account approval pending verification." });
    }
    req.user = decodedUser;
    next();
  });
};

const requireAdminRole = (req, res, next) => {
  const ROOT_ADMIN_EMAIL = "joshuaochieng21@gmail.com";

  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (req.user.email === ROOT_ADMIN_EMAIL) {
    req.user.role = "admin"; 
    return next();
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Administrative role required." });
  }

  next();
};

// =========================================================================
// 🔑 STAFF SIGN-UP & LOGIN SYSTEMS
// =========================================================================

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: "Missing required profile parameters." });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email is already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await prisma.user.count();
    const initialRole = userCount === 0 ? "admin" : "employee";
    const initialStatus = userCount === 0 ? "APPROVED" : "PENDING";

    const newUser = await prisma.user.create({
      data: { email, name, password: hashedPassword, role: initialRole, status: initialStatus }
    });

    return res.status(201).json({ 
      message: initialRole === "admin" ? "First root admin provisioned!" : "Registration logged! Await administrative approval.",
      userId: newUser.id 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Auth Registration Error." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials email matching." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials key matching." });

    if (user.status !== "APPROVED") {
      return res.status(403).json({ message: "Access restricted. Account approval pending." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, status: user.status, name: user.name },
      JWT_SECRET, { expiresIn: '24h' }
    );

    return res.status(200).json({ token, user: { name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server authentication runtime failure." });
  }
});

// =========================================================================
// 📦 INVENTORY / SCANNER CHANNELS
// =========================================================================

app.get(['/api/admin/inventory', '/api/products'], async (req, res) => {
  try {
    const inventory = await prisma.product.findMany({
      include: { category: true, vehicle: true },
      orderBy: { productName: 'asc' }
    });

    const safeInventory = inventory.map(p => ({
      ...p,
      availableStock: Math.max(0, p.stock - p.heldStock),
      category: p.category ? p.category : { id: p.category_id || "cat_01", name: "General Spares" },
      vehicle: p.vehicle ? p.vehicle : { id: p.vehicle_id || "veh_01", make: "Universal", model: "Fit" }
    }));

    return res.status(200).json(safeInventory);
  } catch (error) {
    console.error("[ERROR] Storefront inventory query collapse:", error);
    return res.status(500).json({ message: "Failed to load warehouse records." });
  }
});

app.post('/api/admin/incoming-stock', authenticateStaff, async (req, res) => {
  try {
    const { 
      sku, productName, position, sellingPrice, stockAmount, 
      categoryId, categoryName, vehicleId, make, model,
      condition, side, reorderPoint
    } = req.body;

    const cleanSku = String(sku).replace(/[\r\n\s]/g, '').trim();
    const cleanPrice = parseFloat(sellingPrice);
    const cleanStock = parseInt(stockAmount, 10);
    const cleanReorder = parseInt(reorderPoint || 3, 10);

    if (!cleanSku || isNaN(cleanPrice) || isNaN(cleanStock)) {
      return res.status(400).json({ 
        message: "Validation Error: Price and Stock Quantities must be valid numbers." 
      });
    }

    // 🛑 STRICT SKU DUPLICATE GUARD
    const existingProduct = await prisma.product.findUnique({ where: { sku: cleanSku } });
    if (existingProduct) {
      return res.status(400).json({ 
        message: `SKU Conflict: SKU [${cleanSku}] already exists in inventory (${existingProduct.productName}). If you wish to adjust stock levels, use the Edit/Correction flow.` 
      });
    }

    const cleanCatId = String(categoryId || categoryName).toLowerCase().replace(/\s+/g, '-').trim();
    const cleanVehId = String(vehicleId || `${make}-${model}`).toLowerCase().replace(/\s+/g, '-').trim();

    await prisma.category.upsert({
      where: { id: cleanCatId },
      update: {},
      create: { id: cleanCatId, name: categoryName || "Uncategorized" }
    });

    await prisma.vehicle.upsert({
      where: { id: cleanVehId },
      update: {},
      create: { id: cleanVehId, make: make || "Generic", model: model || "Universal" }
    });

    // Strictly create brand new product record
    const product = await prisma.product.create({
      data: {
        sku: cleanSku,
        productName,
        sellingPrice: cleanPrice,
        stock: cleanStock,
        reorderPoint: cleanReorder,
        condition: condition || "OEM_GENUINE",
        side: side || "UNIVERSAL",
        category: { connect: { id: cleanCatId } },
        vehicle: { connect: { id: cleanVehId } }
      }
    });

    await recordInventoryTransaction(null, {
      sku: cleanSku,
      type: "INBOUND_CARGO",
      change: cleanStock,
      prevStock: 0,
      newStock: cleanStock,
      refId: "CARGO_INGEST",
      actor: req.user.name
    });

    await createAuditLog(
      req.user.id, 
      req.user.name, 
      "STOCK_INGEST", 
      `Created new SKU entry: ${cleanSku} (${productName}) with ${cleanStock} units.`
    );

    return res.status(200).json({ message: "New stock allocation committed successfully.", product });
  } catch (error) {
    console.error("[CRASH] Cargo ingestion pipeline crash:", error);
    return res.status(500).json({ message: "Internal application error processing ingestion cargo loop." });
  }
});

app.patch('/api/admin/decrement-stock/:sku', authenticateStaff, async (req, res) => {
  const searchSku = req.params.sku.replace(/[\r\n\s]/g, '').trim();
  try {
    let rawProducts = [];
    if (!isNaN(searchSku)) {
      const intSku = parseInt(searchSku, 10);
      rawProducts = await prisma.$queryRaw`
        SELECT * FROM "Product" 
        WHERE CAST(sku AS TEXT) = ${searchSku} 
           OR CAST(sku AS TEXT) = ${intSku.toString()}
        LIMIT 1
      `;
    } else {
      rawProducts = await prisma.$queryRaw`
        SELECT * FROM "Product" WHERE CAST(sku AS TEXT) = ${searchSku} LIMIT 1
      `;
    }

    const product = rawProducts[0];

    if (!product) {
      return res.status(404).json({ message: `SKU [${searchSku}] might not exist.` });
    }
    
    if (product.stock <= 0) {
      return res.status(400).json({ message: `SKU [${searchSku}] is out of stock.` });
    }

    const updatedProduct = await prisma.product.update({
      where: { sku: product.sku },
      data: { stock: { decrement: 1 } }
    });

    await recordInventoryTransaction(null, {
      sku: product.sku,
      type: "SCAN_DEPARTURE",
      change: -1,
      prevStock: product.stock,
      newStock: updatedProduct.stock,
      refId: "BARCODE_SCAN",
      actor: req.user.name
    });

    await createAuditLog(
      req.user.id, 
      req.user.name, 
      "STOCK_DEPARTURE", 
      `Scanned departure of 1 unit for SKU: ${product.sku}.`
    );

    return res.status(200).json({
      message: 'Stock decremented successfully.',
      updatedStock: updatedProduct.stock,
      productName: updatedProduct.productName
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error processing inventory reduction.' });
  }
});

// =========================================================================
// 🛒 PUBLIC CLIENT ORDERS & HOLD RESERVATIONS
// =========================================================================

app.post('/api/orders', async (req, res) => {
  const { customerName, items } = req.body; 

  try {
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { sku: item.sku } });
      const available = product ? product.stock - product.heldStock : 0;
      if (available < item.quantity) {
        return res.status(400).json({ 
          message: `Reservation error: SKU [${item.sku}] has insufficient available inventory.` 
        });
      }
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerName,
          status: 'PENDING',
          items: {
            create: items.map(i => ({ productSku: i.sku, quantity: i.quantity }))
          }
        }
      });

      for (const item of items) {
        const prod = await tx.product.findUnique({ where: { sku: item.sku } });
        await tx.product.update({
          where: { sku: item.sku },
          data: { heldStock: { increment: item.quantity } }
        });

        await recordInventoryTransaction(tx, {
          sku: item.sku,
          type: "ORDER_HOLD",
          change: 0,
          prevStock: prod.stock,
          newStock: prod.stock,
          refId: order.id,
          actor: customerName || "Online Customer"
        });
      }

      return order;
    });

    return res.status(201).json(newOrder);
  } catch (err) {
    return res.status(500).json({ message: "Order creation and hold reservation failed." });
  }
});

// 🛠️ ISOLATED CLIENT CHECKOUT ENDPOINT (Strictly writes to Order, NEVER StockAdjustment)
app.post('/api/client/adjustments/request', async (req, res) => {
  const { productSku, productName, oldStock, newStock, reason, requestedBy } = req.body;

  if (!productSku) {
    return res.status(400).json({ message: "Missing required product SKU field." });
  }

  try {
    const clientNameExcerpt = String(requestedBy || 'Anonymous Customer').split(' (')[0];
    const order = await prisma.order.create({
      data: {
        customerName: `${clientNameExcerpt} [Metadata: ${reason?.split(' | ')[0] || 'Inquiry'}]`,
        status: "PENDING",
        items: {
          create: [{
            productSku: productSku,
            quantity: parseInt(newStock || 1, 10)
          }]
        }
      }
    });

    await createAuditLog(
      "client-user", 
      requestedBy || "Storefront Guest", 
      "CLIENT_ORDER_SUBMIT", 
      `Order placed on SKU ${productSku} for quantity ${newStock}.`
    );

    return res.status(201).json(order);
  } catch (error) {
    console.error("Cart submission ingestion failure:", error);
    return res.status(500).json({ message: "Failed to log client transaction." });
  }
});

// =========================================================================
// 🛒 PUBLIC CLIENT REQUESTS & LIVE STATUS TRACKER API
// =========================================================================

// =========================================================================
// 🛒 PUBLIC CLIENT REQUESTS & LIVE STATUS TRACKER API
// =========================================================================

// 🛠️ 1. CLIENT ORDER CREATION - PRESERVE DEVICE FINGERPRINT TOKEN
app.post('/api/client/adjustments/request', async (req, res) => {
  const { productSku, productName, oldStock, newStock, reason, requestedBy } = req.body;

  if (!productSku) {
    return res.status(400).json({ message: "Missing required product SKU field." });
  }

  try {
    // Store full requestedBy string (which contains DEV-XXXXX fingerprint token)
    const fullClientIdentity = requestedBy || 'Anonymous Customer';

    const order = await prisma.order.create({
      data: {
        customerName: `${fullClientIdentity} [Metadata: ${reason || 'Inquiry'}]`,
        status: "PENDING",
        items: {
          create: [{
            productSku: productSku,
            quantity: parseInt(newStock || 1, 10)
          }]
        }
      }
    });

    await createAuditLog(
      "client-user", 
      fullClientIdentity, 
      "CLIENT_ORDER_SUBMIT", 
      `Order placed on SKU ${productSku} for quantity ${newStock}.`
    );

    return res.status(201).json(order);
  } catch (error) {
    console.error("Cart submission ingestion failure:", error);
    return res.status(500).json({ message: "Failed to log client transaction." });
  }
});

// 🛠️ 2. GET CLIENT ADJUSTMENTS / ORDERS - MAP EXPECTED FRONTEND FIELDS
// 🛒 PUBLIC CLIENT REQUESTS & LIVE STATUS TRACKER API
app.get('/api/client/adjustments', async (req, res) => {
  try {
    const [orders, adjustments] = await Promise.all([
      prisma.order.findMany({
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockAdjustment.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const formattedOrders = orders.map(order => {
      const firstItem = order.items && order.items[0];

      return {
        id: order.id,
        productSku: firstItem ? firstItem.productSku : 'N/A',
        productName: firstItem?.product?.productName || (order.items?.length > 1 ? `${order.items.length} Spare Parts Order` : 'Auto Spare Part'),
        oldStock: firstItem?.product?.stock || 0,
        newStock: firstItem ? firstItem.quantity : 1,
        reason: order.customerName,
        // 🔑 Return full customerName string containing (DEV-XXXXX) token
        requestedBy: order.customerName,
        customerName: order.customerName,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items
      };
    });

    const formattedAdjustments = adjustments.map(adj => ({
      ...adj,
      customerName: adj.requestedBy,
      items: [{ productSku: adj.productSku, quantity: adj.newStock }]
    }));

    return res.status(200).json([...formattedOrders, ...formattedAdjustments]);
  } catch (error) {
    console.error("Failed to fetch client requests:", error);
    return res.status(500).json({ message: "Failed to read data logs." });
  }
});

// =========================================================================
// 🔍 PUBLIC CUSTOMER ORDER TRACKING PORTAL API
// =========================================================================

app.get('/api/orders/track/:query', async (req, res) => {
  const { query } = req.params;
  const cleanQuery = String(query || '').trim();

  if (!cleanQuery) {
    return res.status(400).json({ message: "Please provide an Order ID or Phone number." });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: { equals: cleanQuery } },
          { customerName: { contains: cleanQuery, mode: 'insensitive' } }
        ]
      },
      include: { 
        items: { 
          include: { product: true } 
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Order tracking error:", error);
    return res.status(500).json({ message: "Failed to search order tracking index." });
  }
});

// =========================================================================
// ⚖️ ADMIN ADJUSTMENT RESOLUTION & CONCURRENT LOCK CHECK
// =========================================================================

app.patch('/api/admin/adjustments/:id/status', authenticateStaff, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 

  try {
    const targetRequest = await prisma.stockAdjustment.findUnique({ where: { id } });
    if (!targetRequest) {
      return res.status(404).json({ message: "Request item entry not found." });
    }

    if (targetRequest.status !== "PENDING") {
      return res.status(400).json({ message: "This request has already been processed." });
    }

    if (status === "APPROVED") {
      const prod = await prisma.product.findUnique({ where: { sku: targetRequest.productSku } });
      const prevStock = prod ? prod.stock : targetRequest.oldStock;

      await prisma.product.update({
        where: { sku: targetRequest.productSku },
        data: { stock: targetRequest.newStock }
      });

      await recordInventoryTransaction(null, {
        sku: targetRequest.productSku,
        type: "ADJUSTMENT_CORRECTION",
        change: targetRequest.newStock - prevStock,
        prevStock: prevStock,
        newStock: targetRequest.newStock,
        refId: id,
        actor: req.user.name
      });
    }

    const updatedAdjustment = await prisma.stockAdjustment.update({
      where: { id },
      data: { status }
    });

    await createAuditLog(
      req.user.id, 
      req.user.name, 
      `ADJUSTMENT_${status}`, 
      `Adjustment target ${id.slice(0, 8)} marked ${status}. Stock set to ${targetRequest.newStock}.`
    );

    return res.status(200).json(updatedAdjustment);
  } catch (error) {
    console.error("Adjustment processing error:", error);
    return res.status(500).json({ message: "Failed processing status adjustment mutation tracking." });
  }
});

// =========================================================================
// 📋 ORDERS SUBSYSTEM & DISPATCH VERIFICATION
// =========================================================================

app.get('/api/admin/orders', authenticateStaff, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load order matrix." });
  }
});

app.patch('/api/admin/orders/:id/status', authenticateStaff, async (req, res) => {
  const { id } = req.params;
  const { status, verifiedSku } = req.body; 

  try {
    const originalOrder = await prisma.order.findUnique({ 
      where: { id }, 
      include: { items: { include: { product: true } } } 
    });

    if (!originalOrder) {
      return res.status(404).json({ message: "Target order reference index missing." });
    }

    if (originalOrder.status === status) {
      return res.status(400).json({ message: `Order manifest is already marked as ${status}.` });
    }

    if (status === "APPROVED") {
      const insufficientStockItems = [];
      for (const line of originalOrder.items) {
        const liveProduct = line.product;
        const available = liveProduct ? (liveProduct.stock - liveProduct.heldStock) : 0;
        if (!liveProduct || available < line.quantity) {
          insufficientStockItems.push({
            name: liveProduct ? liveProduct.productName : `SKU: ${line.productSku}`,
            available
          });
        }
      }

      if (insufficientStockItems.length > 0) {
        const detailsMsg = insufficientStockItems
          .map(item => `"${item.name}" (Only ${item.available} available)`)
          .join(", ");
        return res.status(400).json({ 
          message: `Allocation Aborted: Insufficient available stock. Missing: ${detailsMsg}` 
        });
      }
    }

    if (status === "DISPATCHED") {
      if (originalOrder.status !== "APPROVED") {
        return res.status(400).json({ 
          message: "Operational Violation: Manifest must be APPROVED prior to counter dispatch." 
        });
      }

      const targetSku = originalOrder.items[0]?.productSku;
      const cleanInputSku = String(verifiedSku || '').replace(/[\r\n\s]/g, '').trim();
      const cleanTargetSku = String(targetSku || '').replace(/[\r\n\s]/g, '').trim();

      if (!cleanInputSku || cleanInputSku !== cleanTargetSku) {
        return res.status(400).json({ 
          message: `Scan Mismatch: Scanned SKU code [${cleanInputSku || 'BLANK'}] does not match expected item [${cleanTargetSku}].` 
        });
      }

      await prisma.$transaction(async (tx) => {
        for (const line of originalOrder.items) {
          const prod = await tx.product.findUnique({ where: { sku: line.productSku } });
          const prevStock = prod ? prod.stock : 0;
          const newStock = Math.max(0, prevStock - line.quantity);
          const newHeld = Math.max(0, (prod?.heldStock || 0) - line.quantity);

          await tx.product.update({
            where: { sku: line.productSku },
            data: { 
              stock: newStock,
              heldStock: newHeld
            }
          });

          await recordInventoryTransaction(tx, {
            sku: line.productSku,
            type: "ORDER_DISPATCH",
            change: -line.quantity,
            prevStock: prevStock,
            newStock: newStock,
            refId: id,
            actor: req.user.name
          });
        }

        await tx.order.update({ where: { id }, data: { status: "DISPATCHED" } });
      });

      await createAuditLog(
        req.user.id, 
        req.user.name, 
        "ORDER_DISPATCHED", 
        `Order reference ${id.slice(0, 8)} verified and dispatched.`
      );

      return res.status(200).json({ message: "Order dispatched successfully." });
    }

    if (status === "REJECTED" || status === "DISAPPROVED" || status === "CANCELLED") {
      const finalStatus = "REJECTED";

      await prisma.$transaction(async (tx) => {
        for (const line of originalOrder.items) {
          const prod = await tx.product.findUnique({ where: { sku: line.productSku } });
          if (prod && prod.heldStock > 0) {
            const newHeld = Math.max(0, prod.heldStock - line.quantity);
            await tx.product.update({
              where: { sku: line.productSku },
              data: { heldStock: newHeld }
            });

            await recordInventoryTransaction(tx, {
              sku: line.productSku,
              type: "RELEASE_HOLD",
              change: 0,
              prevStock: prod.stock,
              newStock: prod.stock,
              refId: id,
              actor: req.user.name
            });
          }
        }

        await tx.order.update({ where: { id }, data: { status: finalStatus } });
      });

      await createAuditLog(
        req.user.id, 
        req.user.name, 
        `ORDER_${finalStatus}`, 
        `Order reference ${id.slice(0, 8)} rejected/canceled by operator.`
      );

      return res.status(200).json({ message: `Order marked as ${finalStatus} and held stock released.` });
    }

    const updatedOrder = await prisma.order.update({ where: { id }, data: { status } });

    await createAuditLog(
      req.user.id, 
      req.user.name, 
      `ORDER_${status}`, 
      `Order reference ${id.slice(0, 8)} updated to status: ${status}.`
    );

    return res.status(200).json({ message: `Order transitioned successfully to ${status}.`, updatedOrder });

  } catch (error) {
    console.error("[CRASH] Order status router collapse:", error);
    return res.status(500).json({ message: "Failed processing status verification engine loop." });
  }
});

// =========================================================================
// 👥 IAM ACCESS CONTROLS BOARD & AUDIT TRAILS
// =========================================================================

app.get('/api/admin/users', authenticateStaff, requireAdminRole, async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(users);
  } catch (error) { return res.status(500).json({ message: "IAM index read error." }); }
});

app.patch('/api/admin/users/:id/status', authenticateStaff, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ROOT_ADMIN_EMAIL = "joshuaochieng21@gmail.com";

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ message: "Profile not found." });

    if (targetUser.email === ROOT_ADMIN_EMAIL && status !== "APPROVED") {
      return res.status(403).json({ message: "Security Violation: Root admin cannot be suspended." });
    }

    const updatedUser = await prisma.user.update({ where: { id }, data: { status } });
    return res.status(200).json({ message: "Access status updated.", updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error adjusting user status." });
  }
});

app.patch('/api/admin/users/:id/role', authenticateStaff, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const ROOT_ADMIN_EMAIL = "joshuaochieng21@gmail.com";

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ message: "Profile not found." });

    if (targetUser.email === ROOT_ADMIN_EMAIL && role !== "admin") {
      return res.status(403).json({ message: "Security Violation: Root admin cannot be demoted." });
    }

    const updatedUser = await prisma.user.update({ where: { id }, data: { role } });
    await createAuditLog(req.user.id, req.user.name, "USER_ROLE_UPDATE", `User ${updatedUser.name} clearance level changed to ${role.toUpperCase()}.`);
    return res.status(200).json({ message: "Clearance level adjusted.", updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error adjusting user role." });
  }
});

app.get('/api/admin/logs', authenticateStaff, requireAdminRole, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 50; 
    const skip = (page - 1) * limit;

    const [logs, totalRecords] = await prisma.$transaction([
      prisma.activityLog.findMany({ skip: skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.activityLog.count()
    ]);

    return res.status(200).json({ logs, pagination: { currentPage: page, totalPages: Math.ceil(totalRecords / limit) || 1, totalRecords, hasNextPage: skip + limit < totalRecords } });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load history data." });
  }
});

app.get('/api/admin/transactions', authenticateStaff, requireAdminRole, async (req, res) => {
  try {
    const txs = await prisma.inventoryTransaction.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return res.status(200).json(txs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load ledger transactions." });
  }
});

// 🛠️ STRICT STAFF RECOUNT ADJUSTMENT ENDPOINT (Staff Physical Stock Recount Only)
app.post('/api/admin/adjustments/request', authenticateStaff, async (req, res) => {
  const { productSku, productName, oldStock, newStock, reason } = req.body;
  if (!productSku || oldStock === undefined || newStock === undefined) return res.status(400).json({ message: "Missing required parameters." });

  try {
    const existingPending = await prisma.stockAdjustment.findFirst({
      where: { productSku, status: "PENDING" }
    });

    if (existingPending) {
      return res.status(400).json({ 
        message: "Lock active: A stock recount adjustment for this SKU is already pending approval." 
      });
    }

    const adjustment = await prisma.stockAdjustment.create({
      data: { productSku, productName, oldStock: parseInt(oldStock), newStock: parseInt(newStock), reason: reason || "Recount correction.", requestedBy: req.user.name, status: "PENDING" }
    });
    return res.status(201).json({ message: "Stock adjustment request sent.", adjustment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit correction request." });
  }
});

// 🛠️ FILTERED ADJUSTMENTS FETCH (Excludes any client checkout text)
app.get('/api/admin/adjustments', authenticateStaff, async (req, res) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      where: {
        NOT: [
          { reason: { contains: 'Checkout inquiries', mode: 'insensitive' } },
          { reason: { contains: 'Client checkout', mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(adjustments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch adjustment requests." });
  }
});

// =========================================================================
// 🏷️ JIJI LISTING STATUS TOGGLE ENDPOINT
// =========================================================================
app.patch('/api/admin/inventory/:sku/jiji-status', authenticateStaff, async (req, res) => {
  const { sku } = req.params;
  const { isJijiListed } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { sku: String(sku).trim() },
      data: { isJijiListed: Boolean(isJijiListed) }
    });

    await createAuditLog(
      req.user.id,
      req.user.name,
      "JIJI_STATUS_TOGGLE",
      `Marked SKU ${sku} as ${isJijiListed ? 'PUBLISHED ON JIJI' : 'REMOVED FROM JIJI'}.`
    );

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Failed toggling Jiji status:", error);
    return res.status(500).json({ message: "Failed updating Jiji listing flag." });
  }
});

const path = require('path');

// 🖼️ Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'data/public/uploads'), {
  maxAge: '7d',
  immutable: true
}));

module.exports = { prisma };

app.listen(PORT, () => {
  console.log(`🚀 Express server is live and listening on http://localhost:${PORT}`);
});