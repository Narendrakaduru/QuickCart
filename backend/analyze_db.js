const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });

const analyzeDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Coupon = require('./models/Coupon');
        const Order = require('./models/Order');

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

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

analyzeDB();
