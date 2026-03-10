const cron = require('node-cron');
const InventoryLock = require('../models/InventoryLock');
const Product = require('../models/Product');
const { clearProductCache } = require('../controllers/productController');

/**
 * Periodically check for expired inventory locks and release the reserved stock.
 * Runs every 5 minutes.
 */
const inventoryLockJob = () => {
  // cron.schedule('*/5 * * * *', async () => { // Every 5 minutes
  cron.schedule('* * * * *', async () => { // Every 1 minute for more responsive testing/demo
    try {
      const now = new Date();
      
      // Find locks that have expired
      const expiredLocks = await InventoryLock.find({
        expiresAt: { $lt: now }
      });

      if (expiredLocks.length === 0) {
        return;
      }

      console.log(`[InventoryJob] Releasing ${expiredLocks.length} expired locks...`);

      for (const lock of expiredLocks) {
        // Atomic decrement of reservedCount
        await Product.findByIdAndUpdate(lock.product, {
          $inc: { reservedCount: -lock.quantity }
        });

        // Clear cache for this product
        await clearProductCache(lock.product.toString());

        // Delete the lock record
        await InventoryLock.findByIdAndDelete(lock._id);
      }

      console.log(`[InventoryJob] Successfully released ${expiredLocks.length} locks.`);
    } catch (err) {
      console.error('[InventoryJob] Error:', err.message);
    }
  });
};

module.exports = inventoryLockJob;
