const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const debugUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const query = process.argv[2];
        if (!query) {
            console.log('Searching for all users...');
            const users = await User.find().select('+password +verificationToken +resetPasswordToken');
            console.log(JSON.stringify(users, null, 2));
        } else if (query.includes('@')) {
            console.log(`Searching for user with email: ${query}`);
            const user = await User.findOne({ email: query }).select('+password +verificationToken +resetPasswordToken');
            console.log(user ? JSON.stringify(user, null, 2) : 'User not found');
        } else {
            console.log(`Searching for user with token: ${query}`);
            const user = await User.findOne({ 
                $or: [
                    { verificationToken: query },
                    { resetPasswordToken: query }
                ]
            }).select('+password +verificationToken +resetPasswordToken');
            console.log(user ? JSON.stringify(user, null, 2) : 'User not found with that token');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugUser();
