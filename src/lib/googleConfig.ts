// Google API Configuration
export const GOOGLE_CONFIG = {
  // Your Google API Key
  API_KEY: 'AIzaSyAUEB74DNf4PX4GvF9pkUIr0b1j4nIbB64',
  
  // Google Places API endpoints
  PLACES_API_BASE: 'https://maps.googleapis.com/maps/api/place',
  GEOCODING_API_BASE: 'https://maps.googleapis.com/maps/api/geocode',
  
  // API endpoints
  ENDPOINTS: {
    NEARBY_SEARCH: '/nearbysearch/json',
    TEXT_SEARCH: '/textsearch/json',
    PLACE_DETAILS: '/details/json',
    PHOTO: '/photo',
    GEOCODING: '/json'
  },
  
  // Default search parameters
  DEFAULT_RADIUS: 50, // km
  DEFAULT_LIMIT: 20,
  
  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 10,
    REQUESTS_PER_DAY: 1000
  },
  
  // Supported place types for business search
  SUPPORTED_TYPES: [
    'establishment',
    'store',
    'restaurant',
    'pharmacy',
    'supermarket',
    'hardware_store',
    'book_store',
    'jewelry_store',
    'car_dealer',
    'beauty_salon',
    'home_goods_store',
    'electronics_store',
    'clothing_store',
    'shoe_store',
    'sporting_goods_store',
    'toy_store',
    'pet_store',
    'garden_center',
    'furniture_store',
    'department_store',
    'convenience_store'
  ]
};

// Helper function to get Google API key
export function getGoogleApiKey(): string {
  // First try environment variable, then fall back to hardcoded key
  return process.env.GOOGLE_API_KEY || 
         process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 
         GOOGLE_CONFIG.API_KEY;
}

// Helper function to check if Google API is configured
export function isGoogleApiConfigured(): boolean {
  const apiKey = getGoogleApiKey();
  return apiKey && apiKey !== 'your_google_api_key_here' && apiKey.length > 10;
}

// Helper function to build Google API URLs
export function buildGoogleApiUrl(endpoint: string, params: Record<string, string | number>): string {
  const apiKey = getGoogleApiKey();
  const searchParams = new URLSearchParams();
  
  // Add all parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  // Add API key
  searchParams.append('key', apiKey);
  
  return `${endpoint}?${searchParams.toString()}`;
}

// Helper function to get Google Maps embed URL
export function getGoogleMapsEmbedUrl(lat: number, lng: number, zoom: number = 15): string {
  const apiKey = getGoogleApiKey();
  return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}`;
}

// Helper function to get Google Maps static image URL
export function getGoogleMapsStaticUrl(lat: number, lng: number, zoom: number = 15, size: string = '600x400'): string {
  const apiKey = getGoogleApiKey();
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&key=${apiKey}`;
}
