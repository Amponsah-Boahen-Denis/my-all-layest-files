# Search Component Setup Guide

## Overview
This project now includes a comprehensive search component that can find stores by product, country, and city using Google Maps API integration with intelligent product categorization, plus a full admin dashboard for store management.

## Features
- **Smart Product Search**: Advanced product categorization with 500+ keywords across 20+ categories
- **Location Detection**: Auto-detect user location or manual input with city autocomplete
- **Country & City Selection**: Dropdown for countries and intelligent autocomplete for cities
- **Store Results**: Display stores with contact info, coordinates, and relevance scoring
- **Layout Options**: Grid or list view for results
- **History Integration**: Save search results to history
- **Admin Dashboard**: Complete store management system (add, edit, delete, search)
- **Responsive Design**: Works on all device sizes

## Setup Requirements

### 1. Environment Variables
Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key_here
```

**Get your Google Maps API key from:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable the following APIs:
  - Maps JavaScript API
  - Places API
  - Geocoding API
- Create credentials (API Key)
- Restrict the key to your domain for security

### 2. Dependencies
The following packages have been installed:
- `axios` - HTTP client for API calls
- `lodash` - Utility functions (debounce)
- `sanitize-html` - XSS protection
- TypeScript types for the above packages

### 3. API Endpoints
The following API endpoints are available:
- `/api/stores` - GET (search stores with pagination), POST (create store)
- `/api/stores/[id]` - GET (get specific store), PUT (update store), DELETE (delete store)
- `/api/user-preferences` - GET/PUT (user layout preferences)
- `/api/history` - GET/POST/DELETE (search history)

## Usage

### Basic Search
1. Navigate to `/search` page
2. Enter a product name (e.g., "laptop", "shirt", "groceries")
3. Select or auto-detect country and city
4. Click "Search Stores"

### Auto-Detection
1. Click "Auto-Detect My Location"
2. Allow location access in your browser
3. Country and city will be automatically filled

### Results
- Stores are displayed in either grid or list layout
- Each store shows: name, address, type, phone, email, coordinates
- Results are sorted by relevance score
- Click "Save to History" to save interesting results

### Admin Store Management
1. Navigate to `/profile` page (admin dashboard)
2. **Add New Store**: Fill out the form with store details
3. **Edit Store**: Click "Edit" button on any store row
4. **Delete Store**: Click "Delete" button (with confirmation)
5. **Search Stores**: Use the search bar to find specific stores
6. **Pagination**: Navigate through store results

## Component Structure

```
src/
├── components/
│   ├── SearchBar.tsx          # Main search component
│   ├── CountryInput.tsx       # Country selection dropdown
│   ├── LocationAutocomplete.tsx # City input with autocomplete
│   └── search.css             # Search component styles
├── utils/
│   └── productCategories.ts   # Advanced product categorization logic
└── app/
    ├── search/
    │   ├── page.tsx           # Search page
    │   └── search.module.css  # Page styles
    ├── profile/
    │   ├── page.tsx           # Admin dashboard page
    │   └── profile.module.css # Admin dashboard styles
    └── history/
        ├── page.tsx           # History page
        └── history.module.css # History styles
```

## Advanced Product Categorization

The system now uses a sophisticated keyword-based categorization system with **500+ keywords** across **20+ categories**:

### **Electronics** (50+ keywords)
- **Devices**: phone, smartphone, iphone, android, laptop, notebook, macbook, camera, tv, monitor
- **Audio**: headphone, earphone, speaker, soundbar, microphone
- **Wearables**: smartwatch, fitbit, fitness tracker
- **Gaming**: gaming console, playstation, xbox
- **Accessories**: router, modem, hard drive, ssd, usb, printer, scanner

### **Clothing & Fashion** (60+ keywords)
- **Tops**: shirt, tshirt, blouse, polo, tank top, crop top
- **Bottoms**: pants, jeans, trousers, chinos, shorts, leggings
- **Dresses**: dress, gown, skirt, jumpsuit, saree, lehenga
- **Footwear**: shoe, sneaker, boot, sandals, heels, flip-flop
- **Outerwear**: jacket, coat, sweater, hoodie, blazer, parka
- **Accessories**: bag, backpack, handbag, wallet, hat, scarf, belt

### **Supermarket & Groceries** (80+ keywords)
- **Dairy**: milk, cheese, butter, yogurt, cream, jam
- **Produce**: vegetable, fruit, meat, fish, chicken, rice, pasta
- **Pantry**: flour, sugar, salt, spice, cereal, oil, beans
- **Snacks**: chips, biscuit, cookie, crackers, popcorn, candy
- **Beverages**: juice, soda, tea, coffee, energy drink
- **Canned Goods**: sardine, corned beef, beans, evaporated milk
- **Frozen**: ice cream, frozen food, frozen meat, frozen vegetable
- **Baking**: yeast, baking soda, cake mix, icing, cocoa

### **Books & Media** (10+ keywords)
- **Types**: book, novel, textbook, magazine, comics, journal, guide, manual

### **Furniture & Home** (15+ keywords)
- **Furniture**: chair, table, sofa, bed, cabinet, desk, dresser, couch, wardrobe

### **Pharmacy & Health** (20+ keywords)
- **Medicine**: medicine, drug, pharmacy, pill, tablet, syrup, injection
- **Wellness**: vitamin, supplement, protein, creatine, wellness, immunity
- **First Aid**: first aid, bandage, condom

### **Sports & Fitness** (25+ keywords)
- **Equipment**: dumbbell, treadmill, ball, football, basketball, cricket
- **Activities**: gym, fitness, exercise, workout, yoga, cycling, skateboarding

### **Toys & Games** (15+ keywords)
- **Toys**: toy, game, lego, doll, puzzle, action figure, boardgame, drone

### **Hardware & Tools** (40+ keywords)
- **Tools**: drill, hammer, screwdriver, wrench, saw, pliers, paint
- **Fasteners**: nails, screws, bolts, hinges
- **Safety**: safety goggles, adhesive

### **Automotive** (70+ keywords)
- **Vehicles**: car, motorcycle, bike, van, truck, jeep, sedan, suv
- **Parts**: oil, engine, tyre, battery, brake, wiper, radiator
- **Brands**: toyota, honda, nissan, ford, chevrolet, bmw, mercedes, tesla

### **Beauty & Cosmetics** (20+ keywords)
- **Makeup**: lipstick, foundation, eyeliner, mascara, blush, nail polish
- **Skincare**: skincare, beauty, perfume, fragrance, deodorant

### **Household & Cleaning** (20+ keywords)
- **Cleaning**: cleaner, detergent, soap, shampoo, toothpaste, sanitizer
- **Tools**: broom, mop, bucket, vacuum, dustbin, cloth, scrubber

### **Computing & Tech** (20+ keywords)
- **Accessories**: laptop bag, usb, mouse, keyboard, router, modem
- **Storage**: hard disk, ssd, memory, ram, graphics card

### **Gardening & Plants** (15+ keywords)
- **Plants**: plant, flower, seed, pot, fertilizer, soil, compost
- **Tools**: shovel, rake, watering can, lawn mower, hedge trimmer

### **Pets & Animals** (15+ keywords)
- **Pets**: pet, dog, cat, fish, bird, hamster, rabbit
- **Supplies**: pet food, leash, aquarium, collar, kennel, litter

### **Baby & Kids** (15+ keywords)
- **Essentials**: baby, diaper, bottle, stroller, crib, baby food
- **Accessories**: pacifier, rattle, bib, car seat, baby clothes

### **Jewelry & Watches** (15+ keywords)
- **Jewelry**: jewelry, ring, necklace, bracelet, earrings, diamond
- **Metals**: gold, silver, watch, rolex

## Smart Matching Algorithm

The categorization system uses a **two-pass matching approach**:

### **Pass 1: Exact Word Boundary Matching**
- Uses regex patterns with word boundaries (`\b`)
- Handles plural forms automatically (`keyword` matches `keywords`)
- More precise and accurate matching
- Example: "laptop computer" → matches "laptop" exactly

### **Pass 2: Partial Matching (Fallback)**
- Searches for keywords within the product name
- Less precise but catches edge cases
- Ensures maximum coverage

### **Input Cleaning**
- Removes special characters and numbers
- Filters out common words (buy, find, shop, near, etc.)
- Normalizes input for better matching

## Admin Dashboard Features

### **Store Management**
- **Add New Store**: Complete form with validation
- **Edit Store**: In-place editing with form pre-population
- **Delete Store**: Confirmation-based deletion
- **Search & Filter**: Find stores by name, address, or country
- **Pagination**: Navigate through large store lists

### **Form Validation**
- **Required Fields**: Store Name, Store Type, Address, Country
- **Optional Fields**: Phone, Email, Website
- **Input Sanitization**: XSS protection for all user inputs
- **Format Validation**: Email, phone, and website format checking

### **Data Display**
- **Responsive Table**: Clean, organized store information
- **Action Buttons**: Edit and delete for each store
- **Status Messages**: Success and error notifications
- **Loading States**: Visual feedback during operations

## Security Features
- Input sanitization to prevent XSS attacks
- API key validation
- Error handling for API failures
- Rate limiting awareness
- Form validation and sanitization

## Customization
- **Add New Categories**: Modify `productCategories.ts` to add new product types
- **Extend Keywords**: Add more keywords to existing categories
- **Update Google Types**: Modify Google Places API types for better store discovery
- **Styling**: Update CSS files to change appearance
- **API Endpoints**: Extend for additional functionality
- **Admin Features**: Customize store management capabilities

## Troubleshooting

### Common Issues
1. **"Google API key is missing"** - Check your `.env.local` file
2. **"Location not found"** - Verify the city/country combination
3. **"Too many requests"** - Google API quota exceeded, wait and try again
4. **"Unable to categorize this product"** - Try different search terms or add keywords to categories
5. **Geolocation not working** - Ensure HTTPS and user permission
6. **Store operations failing** - Check API endpoint availability and data validation

### Development Notes
- The system uses mock data for development
- Replace mock data with real database connections
- Add authentication middleware to API endpoints
- Implement proper error logging in production
- Consider adding user roles and permissions for admin access

## Performance Features
- **Intelligent Caching**: MongoDB cache for repeated searches
- **Debounced API Calls**: Prevents excessive API requests
- **Efficient Matching**: Two-pass algorithm for optimal performance
- **Result Limiting**: Returns up to 20 stores per search
- **Duplicate Removal**: Eliminates duplicate stores by name
- **Pagination**: Efficient handling of large datasets
- **Search Optimization**: Fast filtering and search capabilities

## Future Enhancements
- **Machine Learning**: AI-powered product categorization
- **User Preferences**: Personalized search history and preferences
- **Advanced Filtering**: Price, rating, distance-based filtering
- **Real-time Inventory**: Integration with store inventory systems
- **Store Photos**: Virtual tours and store images
- **Multi-language Support**: Internationalization for global users
- **Voice Search**: Speech-to-text product search
- **Image Recognition**: Search by product photos
- **Advanced Analytics**: Store performance metrics and insights
- **Bulk Operations**: Import/export store data
- **Store Chains**: Support for multi-location businesses
- **Real-time Updates**: Live store information updates 