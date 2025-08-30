import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import { GOOGLE_CONFIG, getGoogleApiKey, isGoogleApiConfigured, buildGoogleApiUrl } from '@/lib/googleConfig';

// Google Places API integration
const GOOGLE_API_KEY = getGoogleApiKey();
const GOOGLE_PLACES_API_BASE = GOOGLE_CONFIG.PLACES_API_BASE;

// Rate limiting cache (in production, use Redis or similar)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

// POST /api/search - Search for stores
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `search:${clientIP}`;
    
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: getRetryAfterTime(rateLimitKey)
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { 
      query, 
      location, 
      country, 
      productCategory,
      radius = 50, // Search radius in km
      limit = 20
    } = body;

    // Validate required fields
    if (!query || !location || !country) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Query, location, and country are required' 
        },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (query.length > 100 || location.length > 100 || country.length > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Input fields are too long. Please use shorter terms.' 
        },
        { status: 400 }
      );
    }

    // Build search query for database
    let searchQuery: any = { 
      isActive: true,
      $or: [
        { storeName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Add location filter if coordinates are provided
    if (location && typeof location === 'object' && location.lat && location.lng) {
      // For now, we'll do a simple text search on address
      // In production, you'd implement geospatial queries
      searchQuery.address = { $regex: location, $options: 'i' };
    }

    // Add country filter
    if (country) {
      searchQuery.country = { $regex: country, $options: 'i' };
    }

    // Add product category filter
    if (productCategory) {
      searchQuery.storeType = { $regex: productCategory, $options: 'i' };
    }

    // Search database stores
    const databaseResults = await Store.find(searchQuery)
      .populate('createdBy', 'firstName lastName businessName')
      .limit(limit)
      .lean();

    // Transform database results to match frontend interface
    const transformedDatabaseResults = databaseResults.map(store => ({
      id: store._id.toString(),
      name: store.storeName,
      address: store.address,
      type: store.storeType,
      phone: store.phone,
      email: store.email,
      coordinates: {
        lat: store.coordinates?.lat || 0,
        lng: store.coordinates?.lng || 0
      },
      relevance: calculateRelevance(store, query),
      rating: store.rating,
      description: store.description,
      hours: store.hours,
      website: store.website,
      tags: store.tags,
      source: 'database',
      lastUpdated: store.updatedAt || store.createdAt
    }));

    // Get Google Places API results if API key is available
    let googleResults: any[] = [];
    let googleCoordinates = null;
    let googleApiStatus = 'not_configured';
    
    if (isGoogleApiConfigured()) {
      try {
        const googleData = await searchGooglePlaces(query, location, country, radius, limit);
        googleResults = googleData.stores;
        googleCoordinates = googleData.coordinates;
        googleApiStatus = 'success';
        
        // Cache Google results in database
        if (googleResults.length > 0) {
          await cacheGoogleResults(googleResults, country, location);
        }
      } catch (error) {
        console.error('Google Places API error:', error);
        googleApiStatus = error instanceof Error ? error.message : 'unknown_error';
        // Continue with database results only
      }
    }

    // Combine and sort results by relevance
    const allResults = [...transformedDatabaseResults, ...googleResults]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    // Return formatted results
    return NextResponse.json({
      success: true,
      query,
      country,
      location,
      productCategory,
      stores: allResults,
      coordinates: googleCoordinates || location,
      layout: 'grid', // Default layout
      totalResults: allResults.length,
      databaseResults: transformedDatabaseResults.length,
      googleResults: googleResults.length,
      searchSource: googleResults.length > 0 ? 'hybrid' : 'database',
      googleApiStatus,
      searchMetadata: {
        timestamp: new Date().toISOString(),
        queryTime: Date.now(),
        radius,
        limit
      }
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to perform search',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}

// GET /api/search - Get search suggestions and recent searches
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'suggestions';

    if (type === 'suggestions') {
      // Get popular search terms from analytics
      // This would require analytics data to be populated
      const suggestions = [
        'electronics',
        'clothing',
        'restaurants',
        'pharmacies',
        'supermarkets',
        'hardware',
        'books',
        'jewelry',
        'automotive',
        'home & garden'
      ];

      return NextResponse.json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });
    }

    if (type === 'recent') {
      // Get recent searches for the user
      // This would require user authentication and search history
      const recentSearches = [
        { query: 'electronics', location: 'New York', timestamp: new Date() },
        { query: 'restaurants', location: 'Los Angeles', timestamp: new Date() }
      ];

      return NextResponse.json({
        success: true,
        recentSearches,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid search type' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error getting search data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get search data' 
      },
      { status: 500 }
    );
  }
}

// Rate limiting functions
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

function getRetryAfterTime(key: string): number {
  const record = rateLimitCache.get(key);
  if (!record) return 60;
  return Math.ceil((record.resetTime - Date.now()) / 1000);
}

// Helper function to calculate search relevance
function calculateRelevance(store: any, query: string): number {
  let relevance = 0;
  const queryLower = query.toLowerCase();
  
  // Exact name match gets highest relevance
  if (store.storeName.toLowerCase().includes(queryLower)) {
    relevance += 100;
  }
  
  // Description match
  if (store.description && store.description.toLowerCase().includes(queryLower)) {
    relevance += 50;
  }
  
  // Tag matches
  if (store.tags && store.tags.some((tag: string) => 
    tag.toLowerCase().includes(queryLower)
  )) {
    relevance += 30;
  }
  
  // Store type match
  if (store.storeType && store.storeType.toLowerCase().includes(queryLower)) {
    relevance += 20;
  }
  
  // Rating bonus
  if (store.rating) {
    relevance += store.rating * 2;
  }
  
  // Recency bonus (newer stores get slight boost)
  if (store.updatedAt || store.createdAt) {
    const daysSinceUpdate = (Date.now() - new Date(store.updatedAt || store.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) relevance += 5;
    else if (daysSinceUpdate < 90) relevance += 2;
  }
  
  return relevance;
}

// Search Google Places API
async function searchGooglePlaces(query: string, location: any, country: string, radius: number, limit: number) {
  if (!isGoogleApiConfigured()) {
    throw new Error('Google API key not configured');
  }

  try {
    // First, geocode the location to get coordinates
    const coordinates = await geocodeLocation(location, country);
    
    // Search for places using Google Places API
    const placesResponse = await fetch(
      `${GOOGLE_PLACES_API_BASE}/nearbysearch/json?` +
      `location=${coordinates.lat},${coordinates.lng}&` +
      `radius=${radius * 1000}&` + // Convert km to meters
      `keyword=${encodeURIComponent(query)}&` +
      `key=${GOOGLE_API_KEY}&` +
      `rankby=distance&` + // Rank by distance for better results
      `type=establishment` // Search for businesses/establishments
    );

    if (!placesResponse.ok) {
      throw new Error(`Google Places API HTTP error: ${placesResponse.status}`);
    }

    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK') {
      throw new Error(`Google Places API error: ${placesData.status}`);
    }

    // Transform Google Places results to match our format
    const stores = placesData.results.slice(0, limit).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address,
      type: place.types?.[0] || 'store',
      phone: place.formatted_phone_number || null,
      email: null, // Google doesn't provide email
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      relevance: calculateGoogleRelevance(place, query),
      rating: place.rating || 0,
      description: `${place.name} - ${place.types?.join(', ') || 'store'}`,
      hours: place.opening_hours?.open_now ? 'Open now' : null,
      website: place.website || null,
      tags: place.types || [],
      source: 'google_api',
      googlePlaceId: place.place_id,
      photos: place.photos?.slice(0, 3).map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
      ) || [],
      priceLevel: place.price_level || null,
      userRatingsTotal: place.user_ratings_total || 0
    }));

    return {
      stores,
      coordinates
    };

  } catch (error) {
    console.error('Google Places search error:', error);
    throw error;
  }
}

// Geocode location using Google Geocoding API
async function geocodeLocation(location: any, country: string) {
  if (!isGoogleApiConfigured()) {
    throw new Error('Google API key not configured');
  }

  try {
    // If location already has coordinates, use them
    if (location && typeof location === 'object' && location.lat && location.lng) {
      return location;
    }

    // Otherwise, geocode the location string
    const locationString = typeof location === 'string' ? location : `${location}, ${country}`;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(locationString)}&` +
      `key=${GOOGLE_API_KEY}&` +
      `components=country:${encodeURIComponent(country)}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.[0]) {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };

  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Calculate relevance for Google Places results
function calculateGoogleRelevance(place: any, query: string): number {
  let relevance = 0;
  const queryLower = query.toLowerCase();
  const placeName = place.name.toLowerCase();
  
  // Exact name match gets highest relevance
  if (placeName.includes(queryLower)) {
    relevance += 100;
  }
  
  // Partial name matches
  queryLower.split(' ').forEach(word => {
    if (placeName.includes(word)) {
      relevance += 20;
    }
  });
  
  // Type matches
  if (place.types && place.types.some((type: string) => 
    type.toLowerCase().includes(queryLower)
  )) {
    relevance += 30;
  }
  
  // Rating bonus
  if (place.rating) {
    relevance += place.rating * 2;
  }
  
  // Popularity bonus (more ratings = more popular)
  if (place.user_ratings_total) {
    relevance += Math.min(place.user_ratings_total / 100, 20); // Cap at 20 points
  }
  
  // Price level bonus (lower price levels get slight boost)
  if (place.price_level !== null && place.price_level !== undefined) {
    relevance += (4 - place.price_level) * 2; // 4 = most expensive, 0 = least expensive
  }
  
  return relevance;
}

// Cache Google Places results in database
async function cacheGoogleResults(stores: any[], country: string, location: string) {
  try {
    const storePromises = stores.map(async (store) => {
      // Check if store already exists
      const existingStore = await Store.findOne({ googlePlaceId: store.googlePlaceId });
      
      if (!existingStore) {
        // Create new store from Google data
        const newStore = new Store({
          storeName: store.name,
          storeType: store.type,
          address: store.address,
          phone: store.phone,
          email: store.email,
          country: country,
          coordinates: {
            lat: store.coordinates.lat,
            lng: store.coordinates.lng
          },
          description: store.description,
          hours: store.hours,
          rating: store.rating,
          tags: store.tags,
          isActive: true,
          source: 'google_api',
          googlePlaceId: store.googlePlaceId,
          createdBy: 'system', // System-created stores
          lastGoogleUpdate: new Date()
        });
        
        await newStore.save();
        console.log(`Cached Google store: ${store.name}`);
      } else {
        // Update existing store with latest Google data
        existingStore.storeName = store.name;
        existingStore.address = store.address;
        existingStore.rating = store.rating;
        existingStore.lastGoogleUpdate = new Date();
        await existingStore.save();
        console.log(`Updated cached Google store: ${store.name}`);
      }
    });

    await Promise.all(storePromises);
    console.log(`Cached/Updated ${stores.length} Google Places results`);

  } catch (error) {
    console.error('Error caching Google results:', error);
    // Don't throw error - caching failure shouldn't break search
  }
} 