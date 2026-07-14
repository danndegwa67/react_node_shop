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
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());

// 🗄️ Initialize Prisma 7 Database Driver Engine
const { PrismaClient } = require('./prisma/generated-client'); 
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:mhenik123@localhost:5432/mhenik_inventory?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 📝 Helper Function: Log actions dynamically into the database
// 🕵️‍♂️ Robust System Audit Logging Utility
async function createAuditLog(userId, userName, action, details) {
  try {
    // Force variable parameters to exist to prevent field validation drops
    const safeUserId = String(userId || "system-id");
    const safeUserName = String(userName || "System Operator");
    const safeAction = String(action || "UNKNOWN_ACTION");
    const safeDetails = String(details || "No transactional breakdown provided.");

    console.log(`[AUDIT INGEST] Executing Log Write -> Action: [${safeAction}] by User: [${safeUserName}]`);

    // Write straight to your active activityLog table instance
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
    // 💡 If this prints to your terminal, your ActivityLog schema has a field name mismatch!
    console.error(`[AUDIT CRASH] Critical logger loop failure:`, err.message);
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

  // 🚀 Super-Admin Bypass: If it's your root email, pass through regardless of field state
  if (req.user.email === ROOT_ADMIN_EMAIL) {
    req.user.role = "admin"; // Force role safety allocation in memory
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
// 📦 INVENTORY / SCANNER CHANNELS (Authenticated Staff)
// =========================================================================

// 📑 GET: Fetch all inventory parts safely with strict property fallbacks
app.get(['/api/admin/inventory', '/api/products'], async (req, res) => {
  try {
    const inventory = await prisma.product.findMany({
      include: { category: true, vehicle: true },
      orderBy: { productName: 'asc' }
    });

    // Remap rows cleanly on the fly to guarantee the frontend always sees valid strings
    const safeInventory = inventory.map(p => ({
      ...p,
      category: p.category ? p.category : { id: p.category_id || "cat_01", name: "General Spares" },
      vehicle: p.vehicle ? p.vehicle : { id: p.vehicle_id || "veh_01", make: "Universal", model: "Fit" }
    }));

    return res.status(200).json(safeInventory);
  } catch (error) {
    console.error("[ERROR] Storefront inventory query collapse:", error);
    return res.status(500).json({ message: "Failed to load warehouse records." });
  }
});

// 📦 POST: Robust, Type-Safe Incoming Cargo Ingestion
// 📦 POST: Robust, Type-Safe Incoming Cargo Ingestion
app.post('/api/admin/incoming-stock', authenticateStaff, async (req, res) => {
  try {
    const { 
      sku, productName, position, sellingPrice, stockAmount, 
      categoryId, categoryName, vehicleId, make, model 
    } = req.body;

    // 1. Inputs Sanitization & Basic Type-Casting
    const cleanSku = String(sku).replace(/[\r\n\s]/g, '').trim();
    const cleanPrice = parseFloat(sellingPrice);
    const cleanStock = parseInt(stockAmount, 10);

    if (!cleanSku || isNaN(cleanPrice) || isNaN(cleanStock)) {
      return res.status(400).json({ 
        message: "Validation Error: Price and Stock Quantities must be valid numbers." 
      });
    }

    // 2. Generate clean fallback text identifiers if fields contain spaces
    const cleanCatId = String(categoryId || categoryName).toLowerCase().replace(/\s+/g, '-').trim();
    const cleanVehId = String(vehicleId || `${make}-${model}`).toLowerCase().replace(/\s+/g, '-').trim();

    // 3. Ensure Category exists via an upsert
    await prisma.category.upsert({
      where: { id: cleanCatId },
      update: {},
      create: { id: cleanCatId, name: categoryName || "Uncategorized" }
    });

    // 4. Ensure Vehicle exists via an upsert
    await prisma.vehicle.upsert({
      where: { id: cleanVehId },
      update: {},
      create: { id: cleanVehId, make: make || "Generic", model: model || "Universal" }
    });

    // 5. Safe Product Upsert utilizing explicit relational object connections
    const product = await prisma.product.upsert({
      where: { sku: cleanSku },
      update: {
        stock: { increment: cleanStock },
        sellingPrice: cleanPrice
      },
      create: {
        sku: cleanSku,
        productName,
        sellingPrice: cleanPrice,
        stock: cleanStock,
        // 🚀 FIXED: Map relationship objects using strict connection blocks instead of plain strings
        category: { connect: { id: cleanCatId } },
        vehicle: { connect: { id: cleanVehId } }
      }
    });

    // 6. Log transaction to active tracking tables using your correct model signature
    await createAuditLog(
      req.user.id, 
      req.user.name, 
      "STOCK_INGEST", 
      `Added +${cleanStock} units to SKU: ${cleanSku} (${productName}).`
    );

    return res.status(200).json({ message: "Stock adjustments committed.", product });
  } catch (error) {
    console.error("[CRASH] Cargo ingestion pipeline crash:", error);
    return res.status(500).json({ message: "Internal application error processing ingestion cargo loop." });
  }
});


// 📉 PATCH: Atomically subtract stock counts using raw database pattern matching
app.patch('/api/admin/decrement-stock/:sku', authenticateStaff, async (req, res) => {
  // 1. Remove hidden carriage returns (\r) or spaces appended by barcode peripherals
  const searchSku = req.params.sku.replace(/[\r\n\s]/g, '').trim();
  console.log(`[NETWORK] Executing raw query database search for SKU: [${searchSku}]`);

  try {
    // 2. Perform a raw SQL fallback query to find the product regardless of type
    let rawProducts = [];
    if (!isNaN(searchSku)) {
      // If it looks like a number, look up both the integer value and string format
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

    // 3. Fallback: If raw matching failed, drop out safely
    if (!product) {
      console.log(`[WARN] Postgres Search Exhausted: SKU [${searchSku}] not found.`);
      return res.status(404).json({ 
        message: `SKU [${searchSku}] might not exist in your Postgres database.` 
      });
    }
    
    if (product.stock <= 0) {
      return res.status(400).json({ message: `SKU [${searchSku}] (${product.productName || 'Item'}) is out of stock.` });
    }

    // 4. Update the record using its native schema identifier
    const updatedProduct = await prisma.product.update({
      where: { sku: product.sku },
      data: { stock: { decrement: 1 } }
    });

    // 5. Write tracking history entry right into your filtered LOGS tab
    await createAuditLog(
      req.user.id, 
      req.user.name, 
      "STOCK_DEPARTURE", 
      `Scanned departure of 1 unit for SKU: ${product.sku} (${updatedProduct.productName}). Remaining: ${updatedProduct.stock} units.`
    );

    console.log(`[SUCCESS] Stock decremented for ${updatedProduct.productName}. Remaining: ${updatedProduct.stock}`);

    return res.status(200).json({
      message: 'Stock decremented successfully.',
      updatedStock: updatedProduct.stock,
      productName: updatedProduct.productName
    });
  } catch (error) {
    console.error("[CRASH] Direct Postgres scanning transaction failure:", error);
    return res.status(500).json({ message: 'Internal server error processing inventory reduction.' });
  }
});

// =========================================================================
// 📋 ORDERS SUBSYSTEM (Public submission / Authenticated manager controls)
// =========================================================================

app.post(['/orders', '/api/orders'], async (req, res) => {
  const { customerName, items } = req.body;
  if (!customerName || !items || items.length === 0) return res.status(400).json({ message: "Missing request items manifest parameters." });

  try {
    const newOrder = await prisma.order.create({
      data: { customerName, status: "PENDING", items: { create: items.map(i => ({ productSku: i.sku, quantity: i.qty || 1 })) } }
    });
    return res.status(201).json({ message: "Request captured successfully!", orderId: newOrder.id });
  } catch (error) {
    return res.status(500).json({ message: "Internal relational table entry creation abort error." });
  }
});

app.get('/api/admin/orders', authenticateStaff, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load order matrix." });
  }
});

// ⚖️ PATCH: Approve or Cancel/Disapprove an order manifest with stock recovery
// ⚖️ PATCH: Approve or Cancel/Disapprove an order manifest with stock recovery & safety checks
app.patch('/api/admin/orders/:id/status', authenticateStaff, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED or DISAPPROVED

  try {
    // 1. Fetch the original order details along with current live product stocks
    const originalOrder = await prisma.order.findUnique({ 
      where: { id }, 
      include: { items: { include: { product: true } } } 
    });
    if (!originalOrder) return res.status(404).json({ message: "Target order reference index missing." });

    // Prevent re-processing an already resolved order to avoid double deductions
    if (originalOrder.status === status) {
      return res.status(400).json({ message: `Order is already marked as ${status}.` });
    }

    // 2. SAFETY CHECK: If approving, verify we have enough stock for ALL items in the order
    if (status === "APPROVED") {
      const insufficientStockItems = [];

      for (const line of originalOrder.items) {
        const liveProduct = line.product;
        if (!liveProduct || liveProduct.stock < line.quantity) {
          insufficientStockItems.push({
            name: liveProduct ? liveProduct.productName : `SKU: ${line.productSku}`,
            available: liveProduct ? liveProduct.stock : 0,
            requested: line.quantity
          });
        }
      }

      // If any items fall short, reject the approval immediately and return details
      if (insufficientStockItems.length > 0) {
        const detailsMsg = insufficientStockItems
          .map(item => `"${item.name}" (Only ${item.available} in stock, requested ${item.requested})`)
          .join(", ");
        return res.status(400).json({
          message: `Incomplete Fulfillment: Insufficient stock to approve order. Missing: ${detailsMsg}`
        });
      }

      // 3. ATOMIC DEDUCTION: If verification passes, deduct stock safely
      for (const line of originalOrder.items) {
        await prisma.product.update({
          where: { sku: line.productSku },
          data: { stock: { decrement: line.quantity } }
        });
      }
    }

    // 4. Update the master order status
    const updatedOrder = await prisma.order.update({ where: { id }, data: { status } });

    // 🔄 AUTOMATIC STOCK ROLLBACK: If an APPROVED order is cancelled or DISAPPROVED
    if (status === "DISAPPROVED" && originalOrder.status === "APPROVED") {
      for (const line of originalOrder.items) {
        await prisma.product.update({ 
          where: { sku: line.productSku }, 
          data: { stock: { increment: line.quantity } } 
        });
      }
      
      // Log the stock recovery action
      await createAuditLog(
        req.user.id, 
        req.user.name, 
        "ORDER_ROLLBACK", 
        `Order ${id.slice(0, 8)} disapproved. Stock restored for ${originalOrder.items.length} line items.`
      );
    } else {
      // Log generic approvals or updates
      await createAuditLog(
        req.user.id, 
        req.user.name, 
        `ORDER_${status}`, 
        `Order reference ${id.slice(0, 8)} status changed to ${status}.`
      );
    }

    return res.status(200).json({ message: "Status verification rules evaluated cleanly.", updatedOrder });
  } catch (error) {
    console.error("[CRASH] Order resolution pipeline failure:", error);
    return res.status(500).json({ message: "Failed processing order evaluation loop context." });
  }
});

// =========================================================================
// 👥 IAM ACCESS CONTROLS BOARD (Exclusively Authenticated Admin Profiles Only)
// =========================================================================

// =========================================================================
// 👥 IAM ACCESS CONTROLS BOARD (Exclusively Authenticated Admin Profiles Only)
// =========================================================================

app.get('/api/admin/users', authenticateStaff, requireAdminRole, async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(users);
  } catch (error) { return res.status(500).json({ message: "IAM index read error." }); }
});

// 🛡️ PATCH: Update User Role with Root Protection Safeguards & Auditing
app.patch('/api/admin/users/:id/role', authenticateStaff, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const ROOT_ADMIN_EMAIL = "joshuaochieng21@gmail.com";

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    
    if (!targetUser) {
      return res.status(404).json({ message: "Target worker profile not found." });
    }

    if (targetUser.email === ROOT_ADMIN_EMAIL && role !== "admin") {
      return res.status(403).json({ 
        message: "Security Violation: The primary root administrator cannot be demoted." 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    // 🚀 Commit audit entry safely
    await createAuditLog(
      req.user.id,
      req.user.name,
      "USER_ROLE_UPDATE",
      `User ${updatedUser.name} clearance level changed to ${role.toUpperCase()}.`
    );

    return res.status(200).json({ message: "Clearance level adjusted.", updatedUser });
  } catch (error) {
    console.error("User role update failed:", error);
    return res.status(500).json({ message: "Internal server error updating user role." });
  }
});

// 🛡️ PATCH: Update User Status (Approve / Suspend) with Auditing
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    // 🚀 Commit audit entry safely
    await createAuditLog(
      req.user.id,
      req.user.name,
      "USER_STATUS_UPDATE",
      `User ${updatedUser.name} (${updatedUser.email}) status changed to ${status}.`
    );

    return res.status(200).json({ message: "Access status updated.", updatedUser });
  } catch (error) {
    console.error("User status update failed:", error);
    return res.status(500).json({ message: "Internal server error adjusting user status." });
  }
});

// 🛡️ PATCH: Update User Role (Promote / Demote)
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    // 🚀 FIXED: Write the log explicitly to your true activityLog table helper
    await createAuditLog(
      req.user.id,
      req.user.name,
      "USER_ROLE_UPDATE",
      `User ${updatedUser.name} clearance level changed to ${role.toUpperCase()}.`
    );

    return res.status(200).json({ message: "Clearance level adjusted.", updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error adjusting user role." });
  }
});

// 📑 GET: Fetch all historical warehouse audit tracking logs
// 📄 GET: Scalable Paginated Server-Side Audit Logs
// 📄 GET: Scalable Paginated Server-Side Audit Logs
// 📄 GET: Scalable Paginated Server-Side Audit Logs
// 📄 GET: Scalable Paginated Server-Side Audit Logs
app.get('/api/admin/logs', authenticateStaff, requireAdminRole, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 50; 
    const skip = (page - 1) * limit;

    // 🚀 FIXED: Pointed directly to your active 'activityLog' schema methods
    const [logs, totalRecords] = await prisma.$transaction([
      prisma.activityLog.findMany({
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activityLog.count()
    ]);

    return res.status(200).json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords,
        hasNextPage: skip + limit < totalRecords
      }
    });
  } catch (error) {
    console.error("[CRASH] Paginated log tracking query break:", error);
    return res.status(500).json({ message: "Failed to load chunked history data registers." });
  }
});
module.exports = { prisma };

// =========================================================================
// ✏️ STOCK ADJUSTMENT & CORRECTIONS CONTROL SUBSYSTEM
// =========================================================================

// 1. POST: Staff creates a request to fix a stock error
app.post('/api/admin/adjustments/request', authenticateStaff, async (req, res) => {
  const { productSku, productName, oldStock, newStock, reason } = req.body;

  if (!productSku || oldStock === undefined || newStock === undefined) {
    return res.status(400).json({ message: "Missing required stock correction parameters." });
  }

  try {
    const adjustment = await prisma.stockAdjustment.create({
      data: {
        productSku,
        productName,
        oldStock: parseInt(oldStock),
        newStock: parseInt(newStock),
        reason: reason || "Inventory recount correction.",
        requestedBy: req.user.name,
        status: "PENDING"
      }
    });

    // Write log entry for the open request
    await createAuditLog(req.user.id, req.user.name, "STOCK_EDIT_REQUEST", `Requested stock correction on SKU ${productSku} from ${oldStock} to ${newStock}.`);

    return res.status(201).json({ message: "Stock adjustment request sent to admin queue.", adjustment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit stock correction request." });
  }
});

// 2. GET: Admins view all pending/historical stock correction requests
app.get('/api/admin/adjustments', authenticateStaff, async (req, res) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(adjustments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch adjustment requests." });
  }
});

// 3. PATCH: Admins explicitly approve or reject a stock change
app.patch('/api/admin/adjustments/:id/resolve', authenticateStaff, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // EXPECTS "APPROVED" or "REJECTED"

  try {
    const request = await prisma.stockAdjustment.findUnique({ where: { id } });
    if (!request || request.status !== "PENDING") {
      return res.status(400).json({ message: "Adjustment request not found or already processed." });
    }

    // Update request state log
    const updatedRequest = await prisma.stockAdjustment.update({
      where: { id },
      data: { status: decision }
    });

    // 🔄 IF APPROVED: Atomically rewrite the actual product row inside the main inventory ledger
    if (decision === "APPROVED") {
      await prisma.product.update({
        where: { sku: request.productSku },
        data: { stock: request.newStock }
      });

      // Air-tight historical trace log detailing exact variations
      await createAuditLog(
        req.user.id, 
        req.user.name, 
        "STOCK_EDIT_APPROVED", 
        `CRITICAL EDIT: Approved stock shift for SKU ${request.productSku} (${request.productName}). Value altered from ${request.oldStock} ➔ ${request.newStock}. Reason: ${request.reason}`
      );
    } else {
      await createAuditLog(req.user.id, req.user.name, "STOCK_EDIT_REJECTED", `Rejected stock correction for SKU ${request.productSku}. Count remains at ${request.oldStock}.`);
    }

    return res.status(200).json({ message: `Adjustment request has been ${decision}.`, updatedRequest });
  } catch (error) {
    return res.status(500).json({ message: "Error executing database stock overwrite adjustment loop." });
  }
});

// 🕵️‍♂️ Temporary Database Spy Query Block
async function debugDbLogs() {
  try {
    const count = await prisma.log.count(); // 💡 Changed to prisma.log
    console.log(`[DATABASE SPY] Total row count found inside Log table: ${count}`);
  } catch (err) {
    console.error(`[DATABASE SPY CRASH] Error:`, err.message);
  }
}
debugDbLogs();

// 🔎 Let's look at the actual active prisma object keys
console.log("[PRISMA MODEL INVENTORY] Available models on your prisma client instance:", 
  Object.keys(prisma).filter(key => !key.startsWith('_') && typeof prisma[key] === 'object')
);

app.listen(PORT, () => {
  console.log(`🚀 Express server is officially live and listening on http://localhost:${PORT}`);
});