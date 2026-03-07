const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8'));
const downloadDir = path.join(__dirname, '../../frontend/public/products/');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Map product types to reliable LoremFlickr tags to avoid cats
const typeToTag = {
  "Smartphone": "mobile,phone",
  "Phone": "smartphone",
  "Mobile": "cellphone",
  "Earbuds": "headphone,earbuds",
  "TV": "television,led",
  "Console": "gaming,console",
  "Projector": "projector,video",
  "Speaker": "speaker,audio",
  "Hub": "usb,hub",
  "Mouse": "mouse,computer",
  "Keyboard": "keyboard,computer",
  "Jacket": "jacket,clothes",
  "Scarf": "scarf,fashion",
  "Denim": "jeans,denim",
  "Sneakers": "shoes,sneakers",
  "Dress": "dress,fashion",
  "Tee": "tshirt,clothing",
  "Blender": "blender,kitchen",
  "Humidifier": "humidifier,home",
  "Lock": "lock,security",
  "Lamp": "lamp,lighting",
  "Station": "coffee,maker",
  "Bedding": "bed,bedroom",
  "Purifier": "air,purifier",
  "Fridge": "refrigerator",
  "Oven": "oven,kitchen",
  "Washer": "washing,machine",
  "Dishwasher": "dishwasher",
  "Airfryer": "airfryer",
  "AC": "air,conditioner",
  "Dryer": "dryer,laundry",
  "Desk": "desk,office",
  "Sofa": "sofa,couch",
  "Bookcase": "bookshelf",
  "Armchair": "armchair,chair",
  "Bed": "bed,furniture",
  "Hammock": "hammock",
  "Space-toy": "space,shuttle,toy",
  "Robot": "robot,toy",
  "Dollhouse": "dollhouse,toy",
  "RC-car": "remote,control,car",
  "Quinoa": "grain,food",
  "Honey": "honey,jar",
  "Coffee": "coffee,beans",
  "Olive-oil": "olive,oil",
  "Salt": "salt,food",
  "Granola": "cereal,grain",
  "Mango-pulp": "mango,fruit",
  "Flour": "flour,baking"
};

const downloadImage = async (url, filepath) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.3.1 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3.1'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);
  } catch (err) {
    throw err;
  }
};

const run = async () => {
  console.log(`Starting download of ${products.length * 2} specific product images...`);
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    // Extract the type from the title (it's the last word as per our refine script)
    const titleWords = product.title.split(' ');
    const type = titleWords[titleWords.length - 1];
    const tag = typeToTag[type] || product.category.toLowerCase();
    
    for (let slot = 0; slot < 2; slot++) {
      const imagePath = product.images[slot];
      const filename = path.basename(imagePath);
      const filepath = path.join(downloadDir, filename);
      
      // Use LoremFlickr with specific tags and a lock to ensure UNIQUE images PER SLOT
      // Adding /all at the end helps it search more broadly if specific tags fail
      const sourceUrl = `https://loremflickr.com/800/800/${tag.split(',')[0]}/all?lock=${(i * 2) + slot + 1}`;

      try {
        await downloadImage(sourceUrl, filepath);
        console.log(`[${i+1}/55] Saved ${filename} (Tag: ${tag.split(',')[0]})`);
      } catch (err) {
        console.error(`Failed ${filename} (${sourceUrl}): ${err.message}`);
      }
    }
    // Tiny delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('Finished downloading all professional matched images.');
};

run();
