# 🗄️ MongoDB Database Setup Guide

## 📋 Overview

This guide explains how to connect your MongoDB database `mongodb://127.0.0.1:27017/appstore` to the store locator application and populate it with initial data.

## 🔌 Step 1: Database Connection

### 1.1 MongoDB is Already Connected
Your database connection is configured in `src/lib/mongodb.ts`:
```typescript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appstore';
```

### 1.2 Environment Variables
Create a `.env.local` file in your project root:
```bash
# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/appstore

# Google Places API (optional)
GOOGLE_PLACES_API_KEY=your_api_key_here

# Application
NODE_ENV=development
```

## 🚀 Step 2: Start MongoDB

### 2.1 Start MongoDB Service
Make sure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or start manually
mongod --dbpath /var/lib/mongodb
```

### 2.2 Verify Connection
Test your MongoDB connection:
```bash
# Connect to MongoDB shell
mongosh mongodb://127.0.0.1:27017/appstore

# List databases
show dbs

# Use your database
use appstore

# List collections
show collections
```

## 🌱 Step 3: Seed the Database

### 3.1 Run the Seeding Script
Populate your database with sample stores:

```bash
# Using npm script (recommended)
npm run seed

# Or using tsx directly
npx tsx src/lib/seedDatabase.ts
```

### 3.2 What Gets Created
The seeding script creates:
- **5 Sample Stores** with different types (electronics, clothing, grocery, books, furniture)
- **1 Admin User** for testing
- **Proper Indexes** for efficient searching

### 3.3 Sample Data Created
```
🏪 Tech Haven Electronics (electronics)
🏪 Fashion Forward Boutique (clothing)  
🏪 Fresh Market Grocery (supermarket)
🏪 Bookworm Corner (books)
🏪 Home Comfort Furniture (furniture)
```

## 🔍 Step 4: Test the Connection

### 4.1 Start Your Application
```bash
npm run dev
```

### 4.2 Test Database Search
Visit: `http://localhost:3000/api/stores/search?q=electronics`

You should see results from your database!

### 4.3 Test Hybrid Search
1. Go to the search page
2. Search for "electronics" or "clothing"
3. Check console logs for database hits
4. Results should come from your MongoDB

## 📊 Step 5: Monitor Database

### 5.1 Check Collections
```bash
# Connect to MongoDB
mongosh mongodb://127.0.0.1:27017/appstore

# View stores
db.stores.find().pretty()

# Count stores
db.stores.countDocuments()

# View users
db.users.find().pretty()
```

### 5.2 Check Indexes
```bash
# View store indexes
db.stores.getIndexes()

# View user indexes  
db.users.getIndexes()
```

## 🚨 Step 6: Troubleshooting

### 6.1 Connection Issues
```
❌ MongoDB connection failed
```
**Solutions:**
- Check if MongoDB is running
- Verify connection string
- Check firewall settings
- Ensure MongoDB port 27017 is open

### 6.2 Seeding Issues
```
❌ Database seeding failed
```
**Solutions:**
- Ensure MongoDB is running
- Check database permissions
- Verify connection string
- Check console for specific errors

### 6.3 Search Issues
```
❌ Database search returned no results
```
**Solutions:**
- Run the seeding script first
- Check if stores exist in database
- Verify search endpoint is working
- Check MongoDB logs

## 🔧 Step 7: Database Management

### 7.1 Clear Database
```bash
# Connect to MongoDB
mongosh mongodb://127.0.0.1:27017/appstore

# Clear all data
db.stores.deleteMany({})
db.users.deleteMany({})

# Re-seed
npm run seed
```

### 7.2 Backup Database
```bash
# Create backup
mongodump --db appstore --out ./backup

# Restore backup
mongorestore --db appstore ./backup/appstore
```

### 7.3 Monitor Performance
```bash
# Check database stats
db.stats()

# Check collection stats
db.stores.stats()

# Monitor slow queries
db.getProfilingStatus()
```

## 🎯 Step 8: Production Considerations

### 8.1 Security
- **Authentication**: Enable MongoDB authentication
- **Network**: Restrict network access
- **SSL**: Use SSL/TLS connections
- **Backup**: Regular automated backups

### 8.2 Performance
- **Indexes**: Ensure proper indexing
- **Connection Pooling**: Optimize connection settings
- **Monitoring**: Use MongoDB monitoring tools
- **Sharding**: For large datasets

## 🎉 Congratulations!

Your MongoDB database is now:
- ✅ **Connected** to the application
- ✅ **Populated** with sample data
- ✅ **Searchable** via the API
- ✅ **Integrated** with the hybrid search system

## 🔮 Next Steps

1. **Test Searches**: Try searching for different store types
2. **Add Google API**: Set up Google Places API for fallback searches
3. **Monitor Performance**: Watch database performance and optimize
4. **Scale Up**: Add more stores and users as needed

Your store locator now has a **real database backend** that will work seamlessly with the Google API fallback system! 