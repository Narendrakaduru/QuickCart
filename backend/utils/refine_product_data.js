const fs = require('fs');
const path = require('path');

const originalProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8'));

const namingData = {
  "Mobiles": [
    { title: "Nexus Quantum X1 Crystal Smartphone", brand: "Nexus", type: "Smartphone", suffix1: "transparent", suffix2: "side-profile", desc: "Revolutionary transparent display with quantum-dot technology and 72-hour battery life." },
    { title: "Vibe Horizon Edge V Infinity Phone", brand: "Vibe", type: "Phone", suffix1: "wrap-around-display", suffix2: "under-screen-camera", desc: "Seamless wrap-around display offering a truly immersive viewing experience with under-screen camera." },
    { title: "TechBrand Titan G7 Rugged Mobile", brand: "TechBrand", type: "Mobile", suffix1: "rugged-exterior", suffix2: "waterproof-test", desc: "Military-grade durability meet high-end performance. Built for the most extreme environments." },
    { title: "Connect Aura Slim Pro Titanium Phone", brand: "Connect", type: "Phone", suffix1: "slim-profile", suffix2: "titanium-finish", desc: "The world's thinnest high-performance smartphone, crafted from aerospace-grade titanium." },
    { title: "Nexus Nebula Fold 3 Duo Display Phone", brand: "Nexus", type: "Phone", suffix1: "folded", suffix2: "unfolded-display", desc: "The next generation of foldable technology with a virtually invisible hinge and ultra-thin glass." },
    { title: "Connect Sync Photon S 6G Smartphone", brand: "Connect", type: "Smartphone", suffix1: "photon-processor", suffix2: "6g-connectivity", desc: "Experience lightning-fast speeds with advanced photonic processing and 6G readiness." },
    { title: "Vibe Zenith Core Max AI Phone", brand: "Vibe", type: "Phone", suffix1: "neural-engine", suffix2: "professional-camera", desc: "Unmatched processing power with an octa-core AI neural engine for professional creators." }
  ],
  "Electronics": [
    { title: "AudioTech Sonic Wave Pro Earbuds", brand: "AudioTech", type: "Earbuds", suffix1: "white", suffix2: "charging-case", desc: "Studio-quality audio in your pocket with active spatial awareness and adaptive noise cancellation." },
    { title: "ViewMaster Onyx 8K Smart OLED TV", brand: "ViewMaster", type: "TV", suffix1: "front", suffix2: "wall-mount", desc: "Breathtaking 8K resolution with deep blacks and infinite contrast powered by OLED technology." },
    { title: "Pulse Air Console Next Gen Gaming Console", brand: "Pulse", type: "Console", suffix1: "vertical-stand", suffix2: "wireless-controller", desc: "The ultimate gaming machine with 120FPS 4k support and haptic feedback throughout the controller." },
    { title: "ViewMaster Vista Pro 4K Laser Projector", brand: "ViewMaster", type: "Projector", suffix1: "lens-detail", suffix2: "lifestyle-setup", desc: "Cinema-grade laser projection in a compact design, capable of 200-inch HDR10+ displays." },
    { title: "AudioTech Echo Master 360 Speaker", brand: "AudioTech", type: "Speaker", suffix1: "top-controls", suffix2: "living-room", desc: "360-degree high-fidelity sound that automatically tunes itself to your room's acoustics." },
    { title: "Pulse Volt Charge Hub 100W Hub", brand: "Pulse", type: "Hub", suffix1: "ports-view", suffix2: "compact-design", desc: "Universal fast-charging station for all your devices with smart power distribution and thermal safety." },
    { title: "Sonic Glide Pro Wireless Gaming Mouse", brand: "Sonic", type: "Mouse", suffix1: "sensor-bottom", suffix2: "ergonomic-grip", desc: "Precision engineering with a 30,000 DPI optical sensor and customizable ergonomic weight system." },
    { title: "Sonic Spectral RGB Mechanical Keyboard", brand: "Sonic", type: "Keyboard", suffix1: "switches-close-up", suffix2: "rgb-lighting-dark", desc: "Mechanical switches with ultra-low latency and per-key RGB lighting for peak performance." }
  ],
  "Fashion": [
    { title: "UrbanStyle Urban Nomad Techwear Jacket", brand: "UrbanStyle", type: "Jacket", suffix1: "front-model", suffix2: "pocket-details", desc: "Weather-resistant techwear with integrated heating panels and multiple concealed compartments." },
    { title: "FashionHub Silk Road Patterned Scarf", brand: "FashionHub", type: "Scarf", suffix1: "draped", suffix2: "fabric-texture", desc: "Exquisite hand-woven silk in a vibrant traditional pattern, adding elegance to any outfit." },
    { title: "DenimCo Indigo Selvedge Raw Denim", brand: "DenimCo", type: "Denim", suffix1: "folded-jean", suffix2: "selvedge-line", desc: "Premium Japanese denim that ages uniquely with every wear, featuring a timeless straight cut." },
    { title: "TrendSetter Lunar Mesh Athletic Sneakers", brand: "TrendSetter", type: "Sneakers", suffix1: "side-view", suffix2: "sole-traction", desc: "Ultra-breathable sports footwear with carbon-fiber energy return soles for peak agility." },
    { title: "FashionHub Ethereal Gala Satin Dress", brand: "FashionHub", type: "Dress", suffix1: "model-pose", suffix2: "satin-shimmer", desc: "Flowing evening wear crafted from shimmering satin, designed for unforgettable impressions." },
    { title: "UrbanStyle Summit Peak Winter Parka", brand: "UrbanStyle", type: "Jacket", suffix1: "insulated-hood", suffix2: "extreme-cold-test", desc: "Heavy-duty insulation meets modern aesthetics, keeping you warm in sub-zero temperatures." },
    { title: "DenimCo Revive Eco-Friendly Tee", brand: "DenimCo", type: "Tee", suffix1: "on-hanger", suffix2: "recycled-label", desc: "Sustainable fashion made entirely from recycled ocean plastics and organic cotton." }
  ],
  "Home": [
    { title: "ChefHat Culinary Pro High-Power Blender", brand: "ChefHat", type: "Blender", suffix1: "smoothie-action", suffix2: "blade-detail", desc: "Professional-grade power capable of milling grains and making piping hot soups in minutes." },
    { title: "PureLiving PureMist Ultrasonic Humidifier", brand: "PureLiving", type: "Humidifier", suffix1: "mist-flow", suffix2: "night-light", desc: "Whisper-quiet ultrasonic mist technology with integrated air purification and essential oil tray." },
    { title: "HomeEase SafeGuard Biometric Smart Lock", brand: "HomeEase", type: "Lock", suffix1: "fingerprint-scan", suffix2: "door-mounted", desc: "Biometric access with remote monitoring and temporary key sharing for ultimate home security." },
    { title: "HomeEase Lumina Smart Mood Lamp", brand: "HomeEase", type: "Lamp", suffix1: "warm-glow", suffix2: "color-cycling", desc: "Dynamic lighting that mimics natural sunlight cycles to prevent sleep issues and improve productivity." },
    { title: "ChefHat Grio Automatic Coffee Station", brand: "ChefHat", type: "Station", suffix1: "latte-art", suffix2: "bean-grinder", desc: "Barista-quality espresso at home with a built-in ceramic burr grinder and milk frothing system." },
    { title: "ComfortSeat Velvet Cloud Bedding Set", brand: "ComfortSeat", type: "Bedding", suffix1: "bedroom-lifestyle", suffix2: "fabric-softness", desc: "Sleep on a cloud with 1000-thread-count Egyptian cotton featuring advanced temperature regulation." },
    { title: "PureLiving Ariel HEPA Air Purifier", brand: "PureLiving", type: "Purifier", suffix1: "filter-layers", suffix2: "modern-setup", desc: "Medical-grade HEPA filtration that removes 99.9% of allergens and odors in rooms up to 500 sq ft." }
  ],
  "Appliances": [
    { title: "CoolBreeze Arctic Freeze Smart Fridge", brand: "CoolBreeze", type: "Fridge", suffix1: "smart-panel", suffix2: "internal-camera", desc: "Smart refrigeration with internal cameras and intelligent freshness zones for every food type." },
    { title: "HeatMax Vortex Steam Convection Oven", brand: "HeatMax", type: "Oven", suffix1: "roast-chicken", suffix2: "digital-display", desc: "Combined steam and convection cooking for juicy inside and perfectly crisp outside results." },
    { title: "CleanSweep Hydro Clean Smart Washer", brand: "CleanSweep", type: "Washer", suffix1: "drum-rotation", suffix2: "energy-label", desc: "Ozone-enhanced cleaning technology that removes stains and bacteria using 50% less water." },
    { title: "PureAir PureStream Eco Dishwasher", brand: "PureAir", type: "Dishwasher", suffix1: "loaded-racks", suffix2: "steam-jets", desc: "Ultra-efficient cleaning with a dedicated steam sanitize cycle and crystal-dry technology." },
    { title: "HeatMax AeroFryer Dual Basket Airfryer", brand: "HeatMax", type: "Airfryer", suffix1: "crispy-fries", suffix2: "dual-controls", desc: "Dual-basket air frying allowing you to cook two different foods at once with perfect sync." },
    { title: "CoolBreeze FrostEdge AI AC Unit", brand: "CoolBreeze", type: "AC", suffix1: "wall-mounted", suffix2: "remote-app", desc: "Energy-efficient cooling with AI-driven temperature sensing and whisper-quiet operation." },
    { title: "CleanSweep DuraCycle Advanced Dryer", brand: "CleanSweep", type: "Dryer", suffix1: "lint-filter", suffix2: "dryer-interior", desc: "Advanced sensor drying that prevents over-drying and protects delicate fabric fibers." }
  ],
  "Furniture": [
    { title: "WoodWork Nordic Oak Minimalist Desk", brand: "WoodWork", type: "Desk", suffix1: "lifestyle", suffix2: "top-view", desc: "Minimalist workspace crafted from sustainable solid oak with hidden cable management." },
    { title: "SoftRest Cloud Recliner Massage Sofa", brand: "SoftRest", type: "Sofa", suffix1: "extended", suffix2: "remote-control", desc: "Zero-gravity reclining position with integrated massage and heating for ultimate luxury relaxation." },
    { title: "ModernNest Metro Loft Steel Bookcase", brand: "ModernNest", type: "Bookcase", suffix1: "shelf-books", suffix2: "industrial-detail", desc: "Industrial-chic design with adjustable powder-coated steel shelving and solid wood accents." },
    { title: "UrbanSpace Luxe Velvet Tufted Armchair", brand: "UrbanSpace", type: "Armchair", suffix1: "velvet-close-up", suffix2: "room-corner", desc: "A statement piece for any room, featuring deep-tufted velvet upholstery and gold-finished legs." },
    { title: "WoodWork Zen Teak Platform Bed", brand: "WoodWork", type: "Bed", suffix1: "nightstand-view", suffix2: "minimalist-frame", desc: "Low-profile Japanese-inspired bed frame made from reclaimed teak with built-in artisan nightstands." },
    { title: "ModernNest Gravity Electric Standing Desk", brand: "ModernNest", type: "Desk", suffix1: "height-adjustment", suffix2: "wireless-charging", desc: "Smooth electric height adjustment with memory presets and built-in wireless charging pad." },
    { title: "SoftRest Siesta Woven Hammock Stand", brand: "SoftRest", type: "Hammock", suffix1: "garden-setup", suffix2: "fabric-weave", desc: "Portable and sturdy frame with a hand-woven cotton hammock for indoor or outdoor garden bliss." }
  ],
  "Toys": [
    { title: "MegaBlocks Galactic Explorer Space-toy", brand: "MegaBlocks", type: "Space-toy", suffix1: "station-complete", suffix2: "motorized-gears", desc: "Build a massive space station with motorized parts and interactive LED lighting circuits." },
    { title: "PlayJoy CyberBot AI Robotics Robot", brand: "PlayJoy", type: "Robot", suffix1: "arm-movement", suffix2: "coding-interface", desc: "A programmable robot that learns from its environment and can be controlled via smartphone apps." },
    { title: "KidQuest Fantasy Multi-Level Dollhouse", brand: "KidQuest", type: "Dollhouse", suffix1: "furnished-rooms", suffix2: "working-bridge", desc: "Multilevel wooden dollhouse with realistic furniture and working drawbridge mechanism." },
    { title: "FunZone Nitro RC Extreme RC-car", brand: "FunZone", type: "RC-car", suffix1: "drift-action", suffix2: "remote-controller", desc: "High-speed remote-controlled car capable of 40mph with long-range 2.4GHz control system." }
  ],
  "Grocery": [
    { title: "OrganicLife Premium Quinoa", brand: "OrganicLife", type: "Quinoa", suffix1: "bowl", suffix2: "package-display", desc: "Premium superfood blend rich in protein and fiber, sourced from sustainable high-altitude farms." },
    { title: "NatureBest Golden Wildflower Honey", brand: "NatureBest", type: "Honey", suffix1: "jar-golden", suffix2: "honeycomb", desc: "Raw, unfiltered wildflower honey harvested from protected alpine meadows in traditional jars." },
    { title: "DailyNeed Artisan Single Origin Coffee", brand: "DailyNeed", type: "Coffee", suffix1: "roasted-beans", suffix2: "brewed-cup", desc: "Single-origin Arabica coffee beans slowly roasted to bring out chocolate and cherry notes." },
    { title: "OrganicLife First Press Virgin Olive-oil", brand: "OrganicLife", type: "Olive-oil", suffix1: "bottle-oil", suffix2: "serving", desc: "First-press extra virgin olive oil with a peppery finish, perfect for dressings and dipping." },
    { title: "DailyNeed Himalayan Pink Savory Salt", brand: "DailyNeed", type: "Salt", suffix1: "salt-crystals", suffix2: "grinder", desc: "Mineral-rich salt crystals mined from ancient sea beds, providing a subtle savory depth." },
    { title: "FreshPick Wild Berry Nut Granola", brand: "FreshPick", type: "Granola", suffix1: "granola-milk", suffix2: "berry-mix", desc: "Crunchy clusters of oats, nuts, and freeze-dried berries with no added refined sugars." },
    { title: "FreshPick Pure Alphonso Mango-pulp", brand: "FreshPick", type: "Mango-pulp", suffix1: "pulp-glass", suffix2: "mango-slices", desc: "100% pure Alphonso mango puree, perfect for smoothies, desserts, and authentic lassis." },
    { title: "NatureBest Slow Milled Ancient Flour", brand: "NatureBest", type: "Flour", suffix1: "flour-dust", suffix2: "baked-bread", desc: "Slow-milled blend of Spelt, Einkorn, and Emmer for superior baking flavor and nutrition." }
  ]
};

const categoryPointers = {
  "Mobiles": 0, "Electronics": 0, "Fashion": 0, "Home": 0, "Appliances": 0, "Furniture": 0, "Toys": 0, "Grocery": 0
};

const slugify = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

const updatedProducts = originalProducts.map((p, index) => {
  const cat = p.category;
  const data = namingData[cat][categoryPointers[cat]];
  categoryPointers[cat]++;
  
  if (!data) return p;

  const baseFilename = slugify(data.title);

  return {
    ...p,
    title: data.title,
    brand: data.brand,
    description: data.desc,
    images: [
      `/products/${baseFilename}-${data.suffix1}.png`,
      `/products/${baseFilename}-${data.suffix2}.png`
    ]
  };
});

fs.writeFileSync(path.join(__dirname, '../data/products.json'), JSON.stringify(updatedProducts, null, 2));
console.log('Successfully updated 55 products with unique semantic data.');
