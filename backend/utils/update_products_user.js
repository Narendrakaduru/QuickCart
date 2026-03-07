const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Product = require("../models/Product");

const migrateProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    const superadminId = "69aa6f5858091489d2833d5f";

    const result = await Product.updateMany(
      { user: { $exists: false } },
      { $set: { user: superadminId } },
    );

    console.log(`${result.modifiedCount} products updated with superadmin ID.`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Migration Error: ${error.message}`);
    process.exit(1);
  }
};

migrateProducts();
