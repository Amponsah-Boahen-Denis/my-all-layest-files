# 🚀 Google API Setup Guide for Hybrid Search

## 📋 Overview

This guide explains how to set up Google Places API integration for your store locator application. The system will automatically fall back to Google API when your database is empty and cache the results for future searches.

## 🔑 Step 1: Get Google Places API Key

### 1.1 Go to Google Cloud Console
- Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Sign in with your Google account

### 1.2 Create or Select Project
- Create a new project or select an existing one
- Give it a descriptive name like "Store Locator App"

### 1.3 Enable APIs
- Go to "APIs & Services" > "Library"
- Search for and enable these APIs:
  - **Places API** - For store/place search
  - **Geocoding API** - For address to coordinates conversion
  - **Maps JavaScript API** - For map display (optional)

### 1.4 Create Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "API Key"
- Copy your API key

### 1.5 Restrict API Key (Recommended)
- Click on your API key to edit it
- Under "Application restrictions" select "HTTP referrers"
- Add your domain(s) for security
- Under "API restrictions" select only the APIs you enabled

## ⚙️ Step 2: Configure Environment Variables

### 2.1 Create .env.local file
Create a `.env.local` file in your project root:

```bash
# Google Places API Configuration
GOOGLE_PLACES_API_KEY=your_actual_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/appstore

# Application Configuration
NODE_ENV=development
```

### 2.2 Never commit API keys
Make sure `.env.local` is in your `.gitignore` file:

```gitignore
# Environment variables
.env.local
.env.production.local
.env.development.local
```

## 🔍 Step 3: How the Hybrid Search Works

### 3.1 Search Flow
```
User Search Request
        ↓
1. Check Cache (fastest)
        ↓
2. Check Database (your stores)
        ↓
3. Fallback to Google API
        ↓
4. Cache Results
        ↓
5. Store in Database
```

### 3.2 Data Sources Priority
1. **Cache** - Instant results from previous searches
2. **Database** - Your curated store data
3. **Google API** - Real-world business data (fallback)

### 3.3 Automatic Syncing
- Google API results are automatically stored in your database
- Future searches will find these stores instantly
- No need to manually add every business

## 📊 Step 4: Cache Management

### 4.1 Cache Features
- **Automatic Expiration**: Results expire after 24 hours
- **Smart Eviction**: Removes least-used entries when full
- **Statistics**: Track cache hit rates and performance
- **Popular Searches**: Identify trending search terms

### 4.2 Cache Configuration
```typescript
// Default settings (configurable)
CACHE_TTL = 24 hours
MAX_CACHE_SIZE = 1000 entries
CLEANUP_INTERVAL = 1 hour
```

## 🎯 Step 5: Testing the Integration

### 5.1 Test Search
1. Start your development server
2. Go to the search page
3. Search for something not in your database
4. Check console logs for API calls
5. Verify results are cached and stored

### 5.2 Monitor Console
Look for these log messages:
```
🔍 Searching for: "electronics" in "New York, NY" category: ""
📦 Cache hit: Returning cached results
🗄️ Database hit: Found stores in database
🔍 Database empty: Falling back to Google API
🔄 Synced 5 stores from Google API to database
```

## 💰 Step 6: API Costs & Limits

### 6.1 Google Places API Pricing
- **Text Search**: $0.017 per request
- **Place Details**: $0.017 per request
- **Geocoding**: $0.005 per request

### 6.2 Cost Optimization
- **Caching**: Reduces API calls for repeated searches
- **Database Storage**: Stores results to avoid re-searching
- **Smart Fallback**: Only uses Google API when needed

### 6.3 Rate Limits
- **Text Search**: 100,000 requests per day
- **Place Details**: 100,000 requests per day
- **Geocoding**: 2,500 requests per day

## 🚨 Step 7: Troubleshooting

### 7.1 Common Issues

#### API Key Not Working
```
⚠️ Google Places API key not found. Set GOOGLE_PLACES_API_KEY environment variable.
```
**Solution**: Check your `.env.local` file and restart the server

#### API Quota Exceeded
```
Google Places API error: OVER_QUERY_LIMIT
```
**Solution**: Check your Google Cloud Console for quota limits

#### No Results Found
```
🔍 Database empty: Falling back to Google API
⚠️ Google API not configured, returning empty results
```
**Solution**: Ensure Google API is properly configured

### 7.2 Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
DEBUG=google-api:*
```

## 🔮 Step 8: Future Enhancements

### 8.1 Advanced Features
- **Real-time Updates**: Sync Google data periodically
- **User Reviews**: Integrate Google reviews
- **Photos**: Display business photos from Google
- **Business Hours**: Real-time open/closed status

### 8.2 Performance Optimization
- **Redis Cache**: Move from memory to Redis for production
- **CDN**: Cache popular search results globally
- **Background Sync**: Update database in background
- **Smart Caching**: Learn user patterns for better caching

## 📝 Step 9: Production Deployment

### 9.1 Environment Setup
```bash
# Production environment
GOOGLE_PLACES_API_KEY=your_production_api_key
MONGODB_URI=your_production_mongodb_uri
NODE_ENV=production
```

### 9.2 Security Considerations
- **API Key Restrictions**: Limit to your domain only
- **Rate Limiting**: Implement request throttling
- **Error Handling**: Graceful fallback when API fails
- **Monitoring**: Track API usage and costs

## 🎉 Congratulations!

You now have a **hybrid search system** that:
- ✅ Searches your database first
- ✅ Falls back to Google API when needed
- ✅ Automatically caches results
- ✅ Stores Google results in your database
- ✅ Provides instant results for future searches

This creates a **self-improving store locator** that gets better with every search!
