const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Product = require("../models/Product");

const fixMobilesCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Specifically move headphones back to Electronics
    // My previous script was too broad: title: /Phone/i
    const result = await Product.updateMany(
      { title: /Headphones/i, category: "Mobiles" },
      { $set: { category: "Electronics" } }
    );

    console.log(`${result.modifiedCount} products moved back to Electronics.`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Fix Error: ${error.message}`);
    process.exit(1);
  }
};

fixMobilesCategory();
