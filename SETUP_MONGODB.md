# 🚀 **MongoDB Setup for Store Locator App**

## **Quick Setup Steps**

### **1. Create Environment File**
Create a file called `.env.local` in your project root with this content:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/store-locator

# Google Maps API (optional for now)
NEXT_PUBLIC_GOOGLE_API_KEY=your_key_here
```

### **2. Install MongoDB**

**Option A: Local MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the service

**Option B: MongoDB Atlas (Cloud)**
- Go to: https://www.mongodb.com/atlas
- Create free account and cluster
- Use connection string like:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/store-locator
  ```

### **3. Seed the Database**
Run this command to create sample data:

```bash
npm run seed
```

This will create:
- Admin user: `admin@storelocator.com` / `admin123`
- Business user: `john@techhaven.com` / `business123`
- 5 sample stores

### **4. Test the App**
```bash
npm run dev
```

Visit: http://localhost:3001

## **🎯 What's Now Working**

✅ **Real MongoDB Database** instead of mock data
✅ **Secure Password Hashing** with bcrypt
✅ **User Authentication** with database storage
✅ **Store Management** with persistent data
✅ **Search History** tracking in database
✅ **Professional Database Schema** with validation

## **🔑 Login Credentials After Seeding**

- **Admin**: `admin@storelocator.com` / `admin123`
- **Business**: `john@techhaven.com` / `business123`

## **📊 Database Collections**

- **users** - User accounts and business info
- **stores** - Store listings with full details
- **searchhistories** - User search history

Your app now has a **production-ready MongoDB database**! 🎉 