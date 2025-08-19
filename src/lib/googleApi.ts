// Google Places API service for store locator
// This handles fallback searches when database doesn't have results

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface GoogleSearchResponse {
  results: GooglePlaceResult[];
  status: string;
  next_page_token?: string;
}

export class GoogleApiService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Google Places API key not found. Set GOOGLE_PLACES_API_KEY environment variable.');
    }
  }

  /**
   * Search for places using Google Places API
   */
  async searchPlaces(query: string, location: string, radius: number = 5000): Promise<GooglePlaceResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      // First, get coordinates for the location
      const coordinates = await this.getCoordinates(location);
      
      if (!coordinates) {
        throw new Error('Could not get coordinates for location');
      }

      // Search for places near the coordinates
      const searchUrl = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&location=${coordinates.lat},${coordinates.lng}&radius=${radius}&key=${this.apiKey}`;
      
      const response = await fetch(searchUrl);
      const data: GoogleSearchResponse = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results || [];
    } catch (error) {
      console.error('Google Places API search error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,price_level,photos,types&key=${this.apiKey}`;
      
      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Google Places API details error:', error);
      throw error;
    }
  }

  /**
   * Get coordinates for a location string
   */
  private async getCoordinates(location: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`;
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Check if API is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const googleApiService = new GoogleApiService();
