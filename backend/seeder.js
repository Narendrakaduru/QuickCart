const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Load models
const Product = require("./models/Product");
const User = require("./models/User");

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read data
const products = require("./data/products.json");
const users = require("./data/users.json");

const importData = async () => {
  try {
    // Clear existing data
    //await Product.deleteMany();
    //await User.deleteMany();

    // Hash passwords and import users first
    const salt = await bcrypt.genSalt(10);
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      }),
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);

    // Find superadmin user ID
    const superadmin = createdUsers.find((u) => u.role === "superadmin");
    const adminId = superadmin ? superadmin._id : createdUsers[0]._id;

    // Add user to each product
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminId };
    });

    // Import products
    await Product.insertMany(sampleProducts);

    console.log("Data Imported successfully!");
    process.exit();
  } catch (err) {
    console.error(`Error importing data: ${err.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed!");
    process.exit();
  } catch (err) {
    console.error(`Error destroying data: ${err.message}`);
    process.exit(1);
  }
};

// Check argument
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  destroyData();
} else {
  console.log("Please provide a valid flag: -i for import, -d for destroy");
  process.exit();
}
