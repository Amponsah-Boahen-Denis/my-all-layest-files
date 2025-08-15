// Product category mapping utility
// Maps product names to categories and Google Places API types with comprehensive keyword matching

interface ProductInfo {
  category: string;
  googleTypes: string[];
}

export const getProductCategory = (productName: string): ProductInfo | null => {
  const categoryMap = {
    electronics: {
      keywords: ['phone', 'smartphone', 'iphone', 'android', 'mobile', 'cellphone', 'handset', 'laptop', 'notebook', 'macbook', 'chromebook', 'ultrabook', 'netbook', 'camera', 'dslr', 'mirrorless', 'camcorder', 'webcam', 'action cam', 'gopro', 'cctv', 'tv', 'television', 'monitor', 'screen', 'led', 'lcd', 'oled', 'projector', 'display', 'headphone', 'earphone', 'earbud', 'speaker', 'audio', 'soundbar', 'headset', 'microphone', 'watch', 'smartwatch', 'fitbit', 'wearable', 'fitness tracker', 'tablet', 'ipad', 'galaxy tab', 'e-reader', 'kindle', 'gaming console', 'playstation', 'xbox', 'router', 'modem', 'hard drive', 'ssd', 'usb', 'memory card', 'printer', 'scanner'],
      googleTypes: ['electronics_store', 'computer_store']
    },
    clothing: {
      keywords: ['shirt', 'tshirt', 't-shirt', 'blouse', 'top', 'polo', 'tank top', 'crop top', 'pant', 'jeans', 'trousers', 'chinos', 'shorts', 'joggers', 'leggings', 'capri', 'dress', 'gown', 'skirt', 'jumpsuit', 'saree', 'lehenga', 'kurti', 'abaya', 'shoe', 'sneaker', 'boot', 'footwear', 'sandals', 'heels', 'flip-flop', 'loafer', 'slipper', 'jacket', 'coat', 'sweater', 'hoodie', 'blazer', 'windbreaker', 'parka', 'bag', 'backpack', 'handbag', 'wallet', 'purse', 'sling', 'duffel', 'clutch', 'luggage', 'hat', 'cap', 'beanie', 'scarf', 'glove', 'belt', 'tie', 'socks', 'underwear', 'lingerie', 'swimwear', 'bikini', 'swimsuit', 'costume', 'uniform', 'suit', 'tuxedo'],
      googleTypes: ['clothing_store', 'shoe_store']
    },
    supermarket: {
      keywords: ['food', 'grocery', 'market', 'supermarket', 'groceries', 'store', 'minimart', 'milk', 'bread', 'egg', 'cheese', 'butter', 'yogurt', 'cream', 'jam', 'margarine', 'vegetable', 'fruit', 'meat', 'fish', 'chicken', 'poultry', 'beef', 'mutton', 'seafood', 'rice', 'pasta', 'noodle', 'flour', 'sugar', 'salt', 'spice', 'cereal', 'grain', 'oil', 'maize', 'corn', 'beans', 'lentils', 'snack', 'chips', 'biscuit', 'cookie', 'crackers', 'popcorn', 'candy', 'chocolate', 'nuts', 'juice', 'soda', 'soft drink', 'beverage', 'water', 'tea', 'coffee', 'energy drink', 'sauce', 'ketchup', 'mayonnaise', 'mustard', 'vinegar', 'soy sauce', 'hot sauce', 'spices', 'seasoning', 'can', 'canned', 'tin', 'canned food', 'sardine', 'corned beef', 'beans tin', 'evaporated milk', 'frozen', 'ice cream', 'frozen food', 'frozen meat', 'frozen chicken', 'frozen vegetable', 'baking', 'yeast', 'baking soda', 'baking powder', 'cake mix', 'icing', 'cocoa', 'chocolate chips'],
      googleTypes: ['supermarket', 'grocery_or_supermarket']
    },
    books: {
      keywords: ['book', 'novel', 'textbook', 'magazine', 'comics', 'journal', 'guide', 'manual', 'encyclopedia', 'dictionary'],
      googleTypes: ['book_store']
    },
    furniture: {
      keywords: ['furniture', 'chair', 'table', 'sofa', 'bed', 'cabinet', 'desk', 'dresser', 'couch', 'wardrobe', 'stool', 'bookshelf', 'mattress'],
      googleTypes: ['furniture_store']
    },
    pharmacy: {
      keywords: ['medicine', 'drug', 'pharmacy', 'chemist', 'hospital', 'pill', 'condom', 'tablet', 'syrup', 'injection', 'vitamin', 'supplement', 'protein', 'creatine', 'wellness', 'immunity', 'first aid', 'bandage'],
      googleTypes: ['pharmacy']
    },
    sports: {
      keywords: ['sport', 'gym', 'fitness', 'exercise', 'workout', 'dumbbell', 'treadmill', 'equipment', 'ball', 'football', 'basketball', 'cricket', 'tennis', 'bat', 'racket', 'volleyball', 'golf', 'hockey', 'bicycle', 'bike', 'cycling', 'skateboard', 'rollerblade', 'surfboard', 'yoga mat'],
      googleTypes: ['sporting_goods_store']
    },
    toys: {
      keywords: ['toy', 'game', 'lego', 'doll', 'puzzle', 'action figure', 'boardgame', 'playset', 'drone', 'teddy bear', 'barbie'],
      googleTypes: ['toy_store']
    },
    hardware: {
      keywords: ['hardware', 'tool', 'drill', 'hammer', 'screwdriver', 'wrench', 'saw', 'pliers', 'measuring tape', 'toolbox', 'paint', 'nails', 'screws', 'chisel', 'utility knife', 'bolt cutter', 'clamp', 'vise', 'nail gun', 'mallet', 'sledgehammer', 'crowbar', 'power drill', 'circular saw', 'grinder', 'level', 'pipe wrench', 'wire stripper', 'shovel', 'pruner', 'wheelbarrow', 'bolts', 'hinges', 'adhesive', 'safety goggles'],
      googleTypes: ['hardware_store']
    },
    automotive: {
      keywords: ['car', 'cars', 'vehicle', 'automobile', 'car oil', 'motor', 'motors', 'motorcycle', 'bike', 'scooter', 'van', 'truck', 'jeep', 'sedan', 'suv', 'pickup', 'oil', 'engine', 'tyre', 'battery', 'brake', 'wiper', 'radiator', 'headlight', 'bumper', 'mirror', 'spark plug', 'exhaust', 'toyota', 'honda', 'nissan', 'ford', 'chevrolet', 'bmw', 'mercedes', 'audi', 'volkswagen', 'vw', 'hyundai', 'kia', 'mazda', 'jeep', 'tesla', 'porsche', 'subaru', 'mitsubishi', 'renault', 'peugeot', 'fiat', 'suzuki', 'dodge', 'gmc', 'cadillac', 'infiniti', 'lincoln', 'volvo', 'jaguar', 'land rover', 'mini', 'buick', 'ram', 'isuzu', 'skoda', 'alfa romeo', 'genesis', 'chrysler', 'saab', 'lamborghini', 'ferrari', 'bentley', 'aston martin', 'rolls royce', 'bugatti'],
      googleTypes: ['car_dealer', 'car_repair', 'auto_parts_store']
    },
    beauty: {
      keywords: ['makeup', 'cosmetic', 'lipstick', 'foundation', 'skincare', 'beauty', 'eyeliner', 'mascara', 'blush', 'nail polish', 'perfume', 'fragrance', 'deodorant', 'body spray', 'cologne', 'hair care', 'shampoo', 'conditioner'],
      googleTypes: ['beauty_salon']
    },
    household: {
      keywords: ['cleaner', 'detergent', 'soap', 'shampoo', 'toothpaste', 'dishwasher', 'sanitizer', 'cleaning spray', 'broom', 'mop', 'bucket', 'vacuum', 'dustbin', 'cloth', 'scrubber', 'brush'],
      googleTypes: ['home_goods_store']
    },
    computing: {
      keywords: ['laptop bag', 'usb', 'mouse', 'keyboard', 'router', 'modem', 'charger', 'cable', 'webcam', 'power bank', 'hard disk', 'ssd', 'memory', 'ram', 'graphics card'],
      googleTypes: ['electronics_store', 'computer_store']
    },
    gardening: {
      keywords: ['plant', 'flower', 'seed', 'pot', 'fertilizer', 'shovel', 'rake', 'watering can', 'soil', 'compost', 'lawn mower', 'hedge trimmer'],
      googleTypes: ['garden_center', 'florist']
    },
    pets: {
      keywords: ['pet', 'dog', 'cat', 'pet food', 'leash', 'aquarium', 'fish', 'collar', 'kennel', 'litter', 'bird', 'hamster', 'rabbit'],
      googleTypes: ['pet_store']
    },
    baby: {
      keywords: ['baby', 'diaper', 'bottle', 'stroller', 'crib', 'baby food', 'pacifier', 'rattle', 'bib', 'car seat', 'baby clothes'],
      googleTypes: ['baby_store']
    },
    jewelry: {
      keywords: ['jewelry', 'jewellery', 'ring', 'necklace', 'bracelet', 'earrings', 'diamond', 'gold', 'silver', 'watch', 'rolex'],
      googleTypes: ['jewelry_store']
    }
  };

  const cleanedProduct = productName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !/^[0-9.,]+$/.test(word))
    .join(' ');
  const productLower = cleanedProduct.toLowerCase();

  // First pass: Exact word boundary matching (more precise)
  for (const [category, data] of Object.entries(categoryMap)) {
    if (
      data.keywords.some((keyword) => {
        const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
        return regex.test(productLower);
      })
    ) {
      return { category, googleTypes: data.googleTypes };
    }
  }

  // Second pass: Partial matching (fallback)
  for (const [category, data] of Object.entries(categoryMap)) {
    if (data.keywords.some((keyword) => productLower.includes(keyword))) {
      return { category, googleTypes: data.googleTypes };
    }
  }

  return null;
}; 