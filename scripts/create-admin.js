const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/store-locator');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Update user to admin role
async function makeUserAdmin(email) {
  try {
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String,
      name: String
    }));

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`✅ User ${email} is now an admin!`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
}

// Main function
async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Please provide an email address');
    console.log('Usage: node scripts/create-admin.js user@example.com');
    process.exit(1);
  }

  await connectDB();
  await makeUserAdmin(email);
  
  console.log('✅ Script completed');
  process.exit(0);
}

main().catch(console.error);
