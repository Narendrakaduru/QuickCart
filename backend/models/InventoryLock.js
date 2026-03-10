const mongoose = require('mongoose');

const InventoryLockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '0s' } // MongoDB TTL index to auto-expire (though we also have a cron job for safety/manual cleanup)
  }
}, { timestamps: true });

// Ensure a user doesn't have multiple overlapping locks for the same product to prevent abuse
InventoryLockSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('InventoryLock', InventoryLockSchema);
