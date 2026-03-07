const mongoose = require('mongoose');
const Coupon = require('./backend/models/Coupon');
const Order = require('./backend/models/Order');

async function analyze() {
  await mongoose.connect('mongodb://localhost:27027/quickcart');
  console.log('Connected to MongoDB');

  const coupons = await Coupon.find({});
  console.log('Coupons:');
  coupons.forEach(c => {
    console.log(`Code: ${c.code}, UsedCount: ${c.usedCount}, UsageLimit: ${c.usageLimit}`);
  });

  const orders = await Order.find({ couponCode: { $ne: null, $ne: "" } });
  console.log('\nOrders with Coupons:');
  orders.forEach(o => {
    console.log(`Order ID: ${o._id}, Coupon: ${o.couponCode}, Discount: ${o.discountAmount}`);
  });

  await mongoose.disconnect();
}

analyze().catch(err => console.error(err));
