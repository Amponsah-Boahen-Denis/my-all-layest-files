# 🗺️ Google Places API Setup Guide

## 🔑 **Step 1: Get Google API Key**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select an existing one
3. **Enable these APIs:**
   - **Places API** - For finding nearby businesses
   - **Geocoding API** - For converting addresses to coordinates
   - **Maps JavaScript API** - For maps and location services

4. **Create API Key:**
   - Go to "Credentials" section
   - Click "Create Credentials" → "API Key"
   - Copy your new API key

## ⚙️ **Step 2: Configure Environment Variables**

Create a `.env.local` file in your project root:

```env
# Frontend (public) - for geolocation and autocomplete
NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_api_key_here

# Backend (private) - for Places API searches
GOOGLE_API_KEY=your_actual_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/store-locator
```

## 🔒 **Step 3: Secure Your API Key**

1. **Restrict the API key:**
   - Go to Google Cloud Console → Credentials
   - Click on your API key
   - Under "Application restrictions":
     - Set to "HTTP referrers (websites)"
     - Add your domain: `localhost:3000/*` (for development)
     - Add your production domain when ready

2. **Under "API restrictions":**
   - Select "Restrict key"
   - Choose only the APIs you enabled:
     - Places API
     - Geocoding API
     - Maps JavaScript API

## 🚀 **Step 4: Test Your Integration**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Go to `/search` page**
3. **Try the "Auto-Detect My Location" button**
4. **Search for stores** - you should see results from both your database and Google Places

## 💰 **Step 5: Monitor Usage & Costs**

- **Places API**: $17 per 1000 requests
- **Geocoding API**: $5 per 1000 requests
- **Maps JavaScript API**: Free for basic usage

## 🔧 **How It Works Now**

### **Search Flow:**
1. **User searches** for stores
2. **API queries** your MongoDB database first
3. **API calls** Google Places API for additional results
4. **Results are combined** and sorted by relevance
5. **Google results are cached** in your database for future searches

### **Features:**
- ✅ **Auto-location detection** using GPS + Google Geocoding
- ✅ **Hybrid search** (database + Google Places)
- ✅ **Smart caching** of Google results
- ✅ **Relevance scoring** for better results
- ✅ **Fallback to database-only** if Google API fails

## 🚨 **Troubleshooting**

### **"Google API key is missing" error:**
- Check your `.env.local` file exists
- Verify the API key is correct
- Restart your development server

### **"Geolocation not supported" error:**
- Use HTTPS in production (required for geolocation)
- Check browser permissions for location access

### **"Google Places API error" in console:**
- Verify your API key has Places API enabled
- Check API quotas and billing
- Ensure proper API restrictions are set

## 📱 **Production Considerations**

1. **Use HTTPS** (required for geolocation)
2. **Set proper API key restrictions** to your domain
3. **Monitor API usage** and costs
4. **Implement rate limiting** if needed
5. **Add error handling** for API failures

## 🎉 **You're All Set!**

Your search system now combines the best of both worlds:
- **Fast database searches** for your stored stores
- **Comprehensive Google Places results** for real-time business data
- **Smart caching** to reduce API calls and costs
- **Auto-location detection** for better user experience

Happy searching! 🔍✨
