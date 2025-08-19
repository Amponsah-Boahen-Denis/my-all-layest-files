// Database seeding script for initial store data
// Run this to populate your database with sample stores

import connectDB from './mongodb';
import Store from '../models/Store';
import User from '../models/User';

const sampleStores = [
  {
    storeName: 'Tech Haven Electronics',
    storeType: 'electronics',
    address: '123 Tech Street, New York, NY 10001',
    phone: '+1-555-0123',
    email: 'info@techhaven.com',
    website: 'https://techhaven.com',
    country: 'United States',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    description: 'Premium electronics store offering the latest gadgets and tech accessories',
    hours: 'Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM',
    rating: 4.7,
    tags: ['electronics', 'gadgets', 'smartphones', 'laptops'],
    source: 'user_created' as const,
    isActive: true
  },
  {
    storeName: 'Fashion Forward Boutique',
    storeType: 'clothing',
    address: '456 Fashion Avenue, New York, NY 10002',
    phone: '+1-555-0456',
    email: 'style@fashionforward.com',
    website: 'https://fashionforward.com',
    country: 'United States',
    coordinates: { lat: 40.7168, lng: -73.9861 },
    description: 'Trendy clothing boutique with the latest fashion styles',
    hours: 'Mon-Sat: 10AM-9PM, Sun: 12PM-6PM',
    rating: 4.5,
    tags: ['clothing', 'fashion', 'boutique', 'trendy'],
    source: 'user_created' as const,
    isActive: true
  },
  {
    storeName: 'Fresh Market Grocery',
    storeType: 'supermarket',
    address: '789 Market Street, New York, NY 10003',
    phone: '+1-555-0789',
    email: 'fresh@freshmarket.com',
    website: 'https://freshmarket.com',
    country: 'United States',
    coordinates: { lat: 40.7295, lng: -73.9881 },
    description: 'Fresh produce and organic groceries for health-conscious shoppers',
    hours: 'Daily: 7AM-11PM',
    rating: 4.3,
    tags: ['grocery', 'organic', 'fresh', 'produce'],
    source: 'user_created' as const,
    isActive: true
  },
  {
    storeName: 'Bookworm Corner',
    storeType: 'books',
    address: '321 Library Lane, New York, NY 10004',
    phone: '+1-555-0321',
    email: 'books@bookworm.com',
    website: 'https://bookworm.com',
    country: 'United States',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    description: 'Cozy bookstore with rare books and comfortable reading areas',
    hours: 'Mon-Sat: 9AM-10PM, Sun: 10AM-8PM',
    rating: 4.8,
    tags: ['books', 'bookstore', 'reading', 'rare books'],
    source: 'user_created' as const,
    isActive: true
  },
  {
    storeName: 'Home Comfort Furniture',
    storeType: 'furniture',
    address: '654 Home Street, New York, NY 10005',
    phone: '+1-555-0654',
    email: 'comfort@homecomfort.com',
    website: 'https://homecomfort.com',
    country: 'United States',
    coordinates: { lat: 40.7421, lng: -73.9911 },
    description: 'Quality furniture for every room in your home',
    hours: 'Mon-Fri: 10AM-8PM, Sat: 10AM-6PM, Sun: 12PM-5PM',
    rating: 4.6,
    tags: ['furniture', 'home', 'comfort', 'quality'],
    source: 'user_created' as const,
    isActive: true
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Check if stores already exist
    const existingStores = await Store.countDocuments();
    if (existingStores > 0) {
      console.log(`📚 Database already has ${existingStores} stores. Skipping seeding.`);
      return;
    }
    
    // Create a default user for the stores (or use existing)
    let defaultUser;
    try {
      defaultUser = await User.findOne({ email: 'admin@storelocator.com' });
      if (!defaultUser) {
        console.log('👤 Creating default admin user...');
        defaultUser = new User({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@storelocator.com',
          password: 'admin123', // In production, use proper hashing
          businessName: 'Store Locator Admin',
          businessType: 'admin',
          acceptMarketing: false,
          isActive: true,
          role: 'admin'
        });
        await defaultUser.save();
        console.log('✅ Default admin user created');
      }
    } catch (error) {
      console.log('⚠️ Could not create default user, using string ID');
      defaultUser = 'admin_user';
    }
    
    // Create stores
    console.log('🏪 Creating sample stores...');
    const createdStores = await Promise.all(
      sampleStores.map(async (storeData) => {
        const store = new Store({
          ...storeData,
          createdBy: defaultUser._id || defaultUser
        });
        return await store.save();
      })
    );
    
    console.log(`✅ Successfully created ${createdStores.length} stores`);
    
    // Log created stores
    createdStores.forEach(store => {
      console.log(`  - ${store.storeName} (${store.storeType}) at ${store.address}`);
    });
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 