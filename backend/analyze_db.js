const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });

const analyzeDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const total = await Product.countDocuments();
        console.log(`Total Products: ${total}`);

        const categories = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        console.log('Products per Category:');
        console.log(JSON.stringify(categories, null, 2));

        const first10 = await Product.find().sort("-createdAt").limit(10);
        console.log('First 10 products (by -createdAt):');
        console.log(first10.map(p => ({ title: p.title, category: p.category })));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

analyzeDB();
