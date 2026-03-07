const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Product = require("../models/Product");

const updateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Update products that are clearly smartphones to "Mobiles"
    const result = await Product.updateMany(
      { 
        $or: [
          { title: /Smartphone/i },
          { category: "Electronics", title: /Phone/i }
        ]
      },
      { $set: { category: "Mobiles" } }
    );

    console.log(`${result.modifiedCount} products updated to category 'Mobiles'.`);
    
    // Ensure "Clothing" is converted to "Fashion" to match MegaMenu (or vice versa? MegaMenu has Fashion, DB has Clothing)
    // MegaMenu: Mobiles, Electronics, Fashion, Home, Appliances, Furniture, Toys, Grocery
    // DB: Clothing, Electronics, Furniture, Toys
    
    const fashionResult = await Product.updateMany(
        { category: "Clothing" },
        { $set: { category: "Fashion" } }
    );
    console.log(`${fashionResult.modifiedCount} products updated from 'Clothing' to 'Fashion'.`);

    process.exit(0);
  } catch (error) {
    console.error(`Migration Error: ${error.message}`);
    process.exit(1);
  }
};

updateCategories();
