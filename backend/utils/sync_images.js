const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const categoryImages = {
  "Mobiles": ["/products/mobile_1.png", "/products/mobile_2.png", "/products/smartphone.png"],
  "Electronics": ["/products/electronics_1.png", "/products/electronics_2.png", "/products/tv.png", "/products/headphones.png"],
  "Fashion": ["/products/fashion_1.png", "/products/tshirt.png"],
  "Furniture": ["/products/chair.png"],
  "Home": ["/products/chair.png"], // Fallback
  "Appliances": ["/products/tv.png"], // Fallback
  "Toys": ["/products/mobile_2.png"], // Fallback
  "Grocery": ["/products/mobile_1.png"] // Fallback
};

products.forEach(p => {
  const imgs = categoryImages[p.category] || ["/products/smartphone.png"];
  // Randomly pick 2 distinct if possible
  const shuffled = [...imgs].sort(() => 0.5 - Math.random());
  p.images = shuffled.slice(0, 2);
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log("Updated products.json with real image paths.");
