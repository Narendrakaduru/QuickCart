const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const verifyAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany({}, { $set: { isVerified: true } });
        console.log(`Updated ${result.modifiedCount} users to be verified.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyAll();
