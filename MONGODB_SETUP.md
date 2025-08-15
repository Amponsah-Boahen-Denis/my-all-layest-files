# MongoDB Setup Guide for Store Locator App

## 🗄️ **Prerequisites**

1. **MongoDB Community Server** installed locally, or
2. **MongoDB Atlas** cloud database account

## 🚀 **Local MongoDB Setup**

### **Option 1: MongoDB Community Server**

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Download for your operating system
   - Install with default settings

2. **Start MongoDB Service**
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Verify Connection**
   ```bash
   mongosh
   # or
   mongo
   ```

### **Option 2: MongoDB Atlas (Cloud)**

1. **Create Atlas Account**
   - Visit: https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster**
   - Choose "FREE" tier
   - Select cloud provider & region
   - Click "Create"

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

## ⚙️ **Environment Configuration**

1. **Create `.env.local` file** in your project root:
   ```bash
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/store-locator
   
   # Google Maps API Key
   NEXT_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key_here
   
   # JWT Secret (for production)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Environment
   NODE_ENV=development
   ```

2. **For MongoDB Atlas**, use this format:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/store-locator?retryWrites=true&w=majority
   ```

## 🗂️ **Database Structure**

The app will automatically create these collections:

### **Users Collection**
```json
{
  "_id": "ObjectId",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "phone": "+1-555-0123",
  "businessName": "Tech Haven",
  "businessType": "technology",
  "acceptMarketing": true,
  "isActive": true,
  "role": "business_owner",
  "lastLoginAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Stores Collection**
```json
{
  "_id": "ObjectId",
  "storeName": "Tech Haven",
  "storeType": "electronics",
  "address": "123 Main St, New York, NY",
  "phone": "+1-555-0123",
  "email": "info@techhaven.com",
  "website": "https://techhaven.com",
  "country": "United States",
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "description": "Premium electronics store",
  "hours": "9 AM - 9 PM",
  "rating": 4.5,
  "tags": ["electronics", "computers", "phones"],
  "isActive": true,
  "createdBy": "ObjectId(user_id)",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Search History Collection**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId(user_id)",
  "query": "laptop",
  "country": "United States",
  "location": "New York",
  "productCategory": "electronics",
  "stores": [...],
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "layout": "grid",
  "searchDate": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 **Installation Steps**

1. **Install Dependencies**
   ```bash
   npm install mongodb mongoose bcryptjs
   npm install --save-dev @types/mongodb @types/bcryptjs
   ```

2. **Create Environment File**
   ```bash
   # Copy the example and fill in your values
   cp .env.local.example .env.local
   ```

3. **Start the App**
   ```bash
   npm run dev
   ```

## 🧪 **Testing the Database**

1. **Register a New User**
   - Go to `/register`
   - Fill out the form
   - Check MongoDB for the new user

2. **Login with the User**
   - Go to `/login`
   - Use your credentials
   - Verify authentication works

3. **Add Stores**
   - Login and go to `/profile`
   - Add new stores
   - Check MongoDB for store documents

## 📊 **MongoDB Compass (Optional)**

1. **Download MongoDB Compass**
   - Visit: https://www.mongodb.com/try/download/compass
   - Install the GUI tool

2. **Connect to Database**
   - Use connection string: `mongodb://localhost:27017`
   - Browse collections and documents visually

## 🚨 **Troubleshooting**

### **Connection Issues**
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod
```

### **Port Issues**
- Default MongoDB port: 27017
- Check if port is available: `netstat -an | grep 27017`

### **Authentication Issues**
- For Atlas: Ensure username/password are correct
- For local: Check if authentication is enabled

### **Database Not Found**
- MongoDB creates databases automatically
- First document insertion creates the database

## 🔒 **Security Best Practices**

1. **Environment Variables**
   - Never commit `.env.local` to git
   - Use strong, unique passwords

2. **Database Access**
   - Limit network access to MongoDB
   - Use authentication for production

3. **Password Hashing**
   - Passwords are automatically hashed with bcrypt
   - Salt rounds: 12 (configurable)

## 📈 **Performance Optimization**

1. **Indexes**
   - Text search indexes on store names
   - Geospatial indexes on coordinates
   - Compound indexes for common queries

2. **Connection Pooling**
   - Automatic connection management
   - Cached connections for performance

## 🎯 **Next Steps**

After MongoDB setup:
1. Test user registration and login
2. Add stores through the admin dashboard
3. Test search functionality
4. Monitor database performance
5. Consider adding data validation middleware

Your Store Locator app is now ready with a real MongoDB database! 🎉 