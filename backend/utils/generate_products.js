const fs = require('fs');
const path = require('path');

const categories = [
  "Mobiles", "Electronics", "Fashion", "Home", "Appliances", "Furniture", "Toys", "Grocery"
];

const brands = {
  "Mobiles": ["TechBrand", "Vibe", "Connect", "Nexus"],
  "Electronics": ["ViewMaster", "AudioTech", "Pulse", "Sonic"],
  "Fashion": ["FashionHub", "TrendSetter", "DenimCo", "UrbanStyle"],
  "Home": ["ComfortSeat", "HomeEase", "PureLiving", "ChefHat"],
  "Appliances": ["CoolBreeze", "HeatMax", "PureAir", "CleanSweep"],
  "Furniture": ["WoodWork", "ModernNest", "SoftRest", "UrbanSpace"],
  "Toys": ["PlayJoy", "KidQuest", "FunZone", "MegaBlocks"],
  "Grocery": ["FreshPick", "NatureBest", "DailyNeed", "OrganicLife"]
};

const products = [];

// Seed existing products first (optional, but let's just make 50 fresh ones + existing)
const existingProducts = [
  {
    "title": "Smartphone X Pro",
    "brand": "TechBrand",
    "description": "Latest model with stunning 120Hz display and high-performance processor.",
    "price": 899.99,
    "discountPercentage": 10,
    "category": "Mobiles",
    "stockCount": 50,
    "images": ["/products/smartphone.png", "/products/smartphone_alt.png"],
    "rating": 4.5,
    "numReviews": 10
  },
  {
    "title": "Wireless Noise-Cancelling Headphones",
    "brand": "AudioTech",
    "description": "Premium sound quality with active noise cancellation technology.",
    "price": 249.99,
    "discountPercentage": 15,
    "category": "Electronics",
    "stockCount": 100,
    "images": ["/products/headphones.png", "/products/headphones_alt.png"],
    "rating": 4.8,
    "numReviews": 25
  },
  {
    "title": "Cotton Blend T-Shirt",
    "brand": "FashionHub",
    "description": "Comfortable everyday wear t-shirt in various colors.",
    "price": 19.99,
    "discountPercentage": 0,
    "category": "Fashion",
    "stockCount": 200,
    "images": ["/products/tshirt.png", "/products/tshirt_alt.png"],
    "rating": 4.2,
    "numReviews": 50
  },
  {
    "title": "Ergonomic Office Chair",
    "brand": "ComfortSeat",
    "description": "Adjustable chair with lumbar support for long working hours.",
    "price": 149.99,
    "discountPercentage": 5,
    "category": "Furniture",
    "stockCount": 30,
    "images": ["/products/chair.png", "/products/chair_alt.png"],
    "rating": 4.6,
    "numReviews": 12
  },
  {
    "title": "4K Ultra HD Smart TV",
    "brand": "ViewMaster",
    "description": "Immersive viewing experience with brilliant colors and smart features.",
    "price": 599.99,
    "discountPercentage": 20,
    "category": "Electronics",
    "stockCount": 15,
    "images": ["/products/tv.png", "/products/tv_alt.png"],
    "rating": 4.7,
    "numReviews": 18
  }
];

products.push(...existingProducts);

for (let i = 1; i <= 50; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const brand = brands[category][Math.floor(Math.random() * brands[category].length)];
  const title = `${brand} ${category} ${i}`;
  const price = parseFloat((Math.random() * (1000 - 10) + 10).toFixed(2));
  const discount = Math.floor(Math.random() * 30);
  
  // Use generic names for images
  const images = [
    `/products/item_${i}_1.png`,
    `/products/item_${i}_2.png`
  ];

  products.push({
    title,
    brand,
    description: `High-quality ${title} designed for maximum efficiency and durability. Experience the best in ${category} with our latest ${brand} technology.`,
    price,
    discountPercentage: discount,
    category,
    stockCount: Math.floor(Math.random() * 100) + 5,
    images,
    rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
    numReviews: Math.floor(Math.random() * 500)
  });
}

const outputPath = path.join(__dirname, '../data/products.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`Generated ${products.length} products to ${outputPath}`);
