const { Worker } = require('bullmq');
const connection = require('../config/bullmq');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { abandonedCartEmail } = require('../utils/emailTemplates');
const Log = require('../models/Log');
const InventoryLock = require('../models/InventoryLock');
const Product = require('../models/Product');
const { clearProductCache } = require('../controllers/productController');

const worker = new Worker('system-tasks', async (job) => {
  console.log(`[Worker] Processing job: ${job.name} (ID: ${job.id})`);

  if (job.name === 'abandoned_cart') {
    return processAbandonedCarts();
  }

  if (job.name === 'inventory_release') {
    return processInventoryRelease();
  }
}, {
  connection,
  concurrency: 1, // Single concurrency is fine for these simple background tasks
});

async function processAbandonedCarts() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    console.log(`[Worker] Checking abandoned carts older than: ${fiveMinutesAgo.toISOString()}`);

    const abandonedCarts = await Cart.find({
      "items.0": { $exists: true },
      abandonedEmailSent: false,
      updatedAt: { $lt: fiveMinutesAgo },
    }).populate("user", "name email");

    console.log(`[Worker] Found ${abandonedCarts.length} potential abandoned carts.`);

    for (const cart of abandonedCarts) {
      if (!cart.user) continue;

      const cartUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`;

      // 1. Try sending Email
      try {
        await sendEmail({
          email: cart.user.email,
          subject: "You left some items in your cart!",
          html: abandonedCartEmail(cart.user.name, cartUrl),
        });
      } catch (emailErr) {
        console.error(`[Worker] Email failed for ${cart.user.email}:`, emailErr.message);
      }

      // 2. Try creating In-App Notification (Decoupled from email)
      try {
        await Notification.create({
          user: cart.user._id,
          type: "abandoned_cart",
          title: "Items left in your cart",
          message: "You have items waiting in your cart. Complete your purchase before they sell out!",
          isRead: false,
        });
      } catch (notifErr) {
        console.error(`[Worker] Notification failed for ${cart.user.email}:`, notifErr.message);
      }

      // 3. Mark as processed to prevent duplicate attempts
      try {
        cart.abandonedEmailSent = true;
        await cart.save();

        await Log.create({
          action: "Abandoned Cart Notification",
          description: `Attempted abandoned cart notification for ${cart.user.name} (${cart.user.email})`,
          user: cart.user._id,
          method: "BULLMQ",
          endpoint: "abandoned_cart",
          status: "success",
        });
      } catch (logErr) {
        console.error(`[Worker] Logging/Save failed for ${cart.user.email}:`, logErr.message);
      }
    }
    return { success: true, count: abandonedCarts.length };
  } catch (error) {
    console.error("[Worker] Abandoned Cart processing error:", error.message);
    throw error;
  }
}

/**
 * Ported from inventoryLockJob.js
 */
async function processInventoryRelease() {
  try {
    const now = new Date();
    const expiredLocks = await InventoryLock.find({ expiresAt: { $lt: now } });

    if (expiredLocks.length === 0) {
      return { success: true, count: 0 };
    }

    console.log(`[Worker] Releasing ${expiredLocks.length} expired locks...`);

    for (const lock of expiredLocks) {
      await Product.findByIdAndUpdate(lock.product, {
        $inc: { reservedCount: -lock.quantity }
      });
      await clearProductCache(lock.product.toString());
      await InventoryLock.findByIdAndDelete(lock._id);
    }

    return { success: true, count: expiredLocks.length };
  } catch (err) {
    console.error('[Worker] Inventory Release processing error:', err.message);
    throw err;
  }
}

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.name} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.name} failed:`, err.message);
});

module.exports = worker;
