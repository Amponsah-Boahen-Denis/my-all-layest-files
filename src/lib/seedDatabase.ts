import connectDB from './mongodb';
import User from '@/models/User';
import Store from '@/models/Store';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Store.deleteMany({});
    
    console.log('🗑️ Cleared existing data');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@storelocator.com',
      password: adminPassword,
      phone: '+1-555-0000',
      businessName: 'Store Locator Admin',
      businessType: 'technology',
      acceptMarketing: false,
      isActive: true,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('👤 Created admin user');
    
    // Create sample business user
    const businessPassword = await bcrypt.hash('business123', 12);
    const businessUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@techhaven.com',
      password: businessPassword,
      phone: '+1-555-0123',
      businessName: 'Tech Haven',
      businessType: 'technology',
      acceptMarketing: true,
      isActive: true,
      role: 'business_owner'
    });
    
    await businessUser.save();
    console.log('👤 Created business user');
    
    // Create sample stores
    const sampleStores = [
      {
        storeName: 'Tech Haven',
        storeType: 'electronics',
        address: '123 Main St, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'info@techhaven.com',
        website: 'https://techhaven.com',
        country: 'United States',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        description: 'Premium electronics and computer store',
        hours: '9:00 AM - 9:00 PM',
        rating: 4.5,
        tags: ['electronics', 'computers', 'phones', 'laptops'],
        createdBy: businessUser._id
      },
      {
        storeName: 'Fashion Forward',
        storeType: 'clothing',
        address: '456 Oak Ave, London, UK SW1A 1AA',
        phone: '+44-20-7946-0958',
        email: 'hello@fashionforward.co.uk',
        website: 'https://fashionforward.co.uk',
        country: 'United Kingdom',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        description: 'Trendy clothing and accessories store',
        hours: '10:00 AM - 8:00 PM',
        rating: 4.2,
        tags: ['clothing', 'fashion', 'accessories', 'shoes'],
        createdBy: businessUser._id
      },
      {
        storeName: 'Fresh Market',
        storeType: 'supermarket',
        address: '789 Pine St, Toronto, ON M5V 2H1',
        phone: '+1-416-555-0123',
        email: 'contact@freshmarket.ca',
        website: 'https://freshmarket.ca',
        country: 'Canada',
        coordinates: { lat: 43.6532, lng: -79.3832 },
        description: 'Fresh groceries and organic foods',
        hours: '7:00 AM - 11:00 PM',
        rating: 4.7,
        tags: ['grocery', 'organic', 'fresh', 'food'],
        createdBy: businessUser._id
      },
      {
        storeName: 'Sports Central',
        storeType: 'sports',
        address: '321 Sports Blvd, Los Angeles, CA 90210',
        phone: '+1-555-0456',
        email: 'info@sportscentral.com',
        website: 'https://sportscentral.com',
        country: 'United States',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        description: 'Complete sports equipment and apparel store',
        hours: '8:00 AM - 10:00 PM',
        rating: 4.3,
        tags: ['sports', 'equipment', 'fitness', 'apparel'],
        createdBy: businessUser._id
      },
      {
        storeName: 'Book Nook',
        storeType: 'books',
        address: '654 Reading Rd, Chicago, IL 60601',
        phone: '+1-555-0789',
        email: 'hello@booknook.com',
        website: 'https://booknook.com',
        country: 'United States',
        coordinates: { lat: 41.8781, lng: -87.6298 },
        description: 'Independent bookstore with rare and new books',
        hours: '9:00 AM - 7:00 PM',
        rating: 4.8,
        tags: ['books', 'reading', 'literature', 'education'],
        createdBy: businessUser._id
      }
    ];
    
    // Insert stores
    for (const storeData of sampleStores) {
      const store = new Store(storeData);
      await store.save();
    }
    
    console.log('🏪 Created sample stores');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`🏪 Stores: ${await Store.countDocuments()}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@storelocator.com / admin123');
    console.log('Business: john@techhaven.com / business123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 