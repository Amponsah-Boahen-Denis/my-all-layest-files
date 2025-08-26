# 🗺️ Store Locator App

A modern, feature-rich store locator application built with Next.js, React, and MongoDB. Find stores near you with advanced search capabilities, auto-location detection, and comprehensive Google Places API integration.

## ✨ Features

### 🔍 **Advanced Search System**
- **Product-based search** with intelligent relevance scoring
- **Location autocomplete** powered by Google Places API
- **Country selection** with comprehensive country database
- **Search history** with localStorage persistence
- **Hybrid results** combining database and Google Places data

### 📍 **Smart Location Services**
- **Auto-location detection** using GPS and Google Geocoding API
- **Real-time location suggestions** with Google Places autocomplete
- **Manual location input** with country-specific validation
- **Geocoding support** for address-to-coordinate conversion

### 🏪 **Store Discovery**
- **Database integration** with MongoDB for custom store data
- **Google Places API** for real-time business information
- **Smart caching** of Google results to reduce API calls
- **Relevance scoring** for optimal result ranking
- **Store details** including ratings, photos, and contact info

### 🎨 **User Experience**
- **Responsive design** optimized for all devices
- **Modern UI** with smooth animations and transitions
- **Loading states** and progress indicators
- **Error handling** with user-friendly messages
- **Accessibility** features for inclusive design

### 🚀 **Performance & Security**
- **Rate limiting** to prevent API abuse
- **Request cancellation** for better performance
- **Error boundaries** and fallback handling
- **Input validation** and sanitization
- **Secure API key management**

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: CSS3 with modern animations and responsive design
- **Backend**: Next.js API routes with MongoDB integration
- **APIs**: Google Places API, Google Geocoding API, REST Countries API
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (optional)
- **Deployment**: Vercel, Netlify, or any Node.js hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- Google Cloud Platform account with API keys

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd store-locator-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in your project root:

```env
# Google API Configuration
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/store-locator

# Next.js Configuration
NODE_ENV=development
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Google API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Places API** - For finding nearby businesses
   - **Geocoding API** - For converting addresses to coordinates
   - **Maps JavaScript API** - For maps and location services
4. Create API key and restrict it to your domain

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📱 Usage

### Basic Search
1. Enter a product or service you're looking for
2. Use "Auto-Detect My Location" or enter manually
3. Select your country and city
4. Click "Search Stores" to find results

### Advanced Features
- **Search History**: Click on recent searches to quickly repeat them
- **Location Autocomplete**: Type in city names for instant suggestions
- **Auto-detection**: Let the app find your location automatically
- **Layout Options**: Choose between grid and list view for results

## 🔧 API Endpoints

### Search API
- `POST /api/search` - Search for stores with product and location
- `GET /api/search?type=suggestions` - Get search suggestions
- `GET /api/search?type=recent` - Get recent searches

### Store Management
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

## 🗄️ Database Schema

### Store Model
```typescript
interface Store {
  storeName: string;
  storeType: string;
  address: string;
  coordinates: { lat: number; lng: number };
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  rating?: number;
  tags: string[];
  isActive: boolean;
  source: 'database' | 'google_api';
  googlePlaceId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎯 Google API Integration

### Features Implemented
- ✅ **Google Places API** for business search and details
- ✅ **Google Geocoding API** for address-to-coordinate conversion
- ✅ **Auto-location detection** using GPS + Google services
- ✅ **Location autocomplete** with real-time suggestions
- ✅ **Store caching** to reduce API calls and costs
- ✅ **Error handling** for API failures and rate limits

### API Usage
- **Places API**: $17 per 1000 requests
- **Geocoding API**: $5 per 1000 requests
- **Maps JavaScript API**: Free for basic usage

### Best Practices
- Implement proper rate limiting
- Cache results to reduce API calls
- Use API key restrictions
- Monitor usage and costs

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- **API Key Management**: Never expose backend API keys in frontend code
- **Rate Limiting**: Implement proper rate limiting to prevent abuse
- **Input Validation**: Validate and sanitize all user inputs
- **CORS Configuration**: Configure CORS properly for production
- **Environment Variables**: Use secure environment variable management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Performance Monitoring

- **API Response Times**: Monitor Google API response times
- **Database Queries**: Track MongoDB query performance
- **User Experience**: Monitor search success rates
- **Error Rates**: Track API failures and user errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Wiki**: Check the project wiki for additional resources

## 🙏 Acknowledgments

- **Google Maps Platform** for location services
- **Next.js Team** for the amazing framework
- **MongoDB** for the database solution
- **React Team** for the UI library
- **Community Contributors** for feedback and improvements

---

**Made with ❤️ by the Store Locator Team**

*Find stores, discover places, and explore your world!*
