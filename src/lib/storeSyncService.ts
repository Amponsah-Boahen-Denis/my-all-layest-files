// Store synchronization service
// This automatically stores Google API results into the database for future searches

import { googleApiService } from './googleApi';
import { cacheService } from './cacheService';

interface StoreData {
  storeName: string;
  storeType: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  hours?: string;
  rating?: number;
  tags?: string[];
  source: 'google_api' | 'user_created' | 'database';
  googlePlaceId?: string;
  lastUpdated: Date;
}

export class StoreSyncService {
  /**
   * Search for stores with fallback to Google API
   * This is the main method that implements the hybrid search strategy
   */
  async searchStoresWithFallback(
    query: string, 
    location: string, 
    category?: string
  ): Promise<{
    stores: StoreData[];
    source: 'database' | 'cache' | 'google_api';
    cached: boolean;
    syncedToDatabase: boolean;
  }> {
    try {
      // Step 1: Check cache first (fastest)
      const cachedResults = cacheService.get(query, location, category);
      if (cachedResults) {
        console.log('📦 Cache hit: Returning cached results');
        return {
          stores: cachedResults,
          source: 'cache',
          cached: true,
          syncedToDatabase: false
        };
      }

      // Step 2: Try to find in database (your existing stores)
      const databaseResults = await this.searchDatabase(query, location, category);
      if (databaseResults.length > 0) {
        console.log('🗄️ Database hit: Found stores in database');
        
        // Cache the database results for future fast access
        cacheService.set(query, location, databaseResults, category);
        
        return {
          stores: databaseResults,
          source: 'database',
          cached: false,
          syncedToDatabase: false
        };
      }

      // Step 3: Fallback to Google API (when database is empty)
      console.log('🔍 Database empty: Falling back to Google API');
      const googleResults = await this.searchGoogleAPI(query, location, category);
      
      if (googleResults.length > 0) {
        // Step 4: Cache Google results immediately
        cacheService.set(query, location, googleResults, category);
        
        // Step 5: Sync Google results to database for future searches
        const syncedCount = await this.syncGoogleResultsToDatabase(googleResults);
        
        console.log(`🔄 Synced ${syncedCount} stores from Google API to database`);
        
        return {
          stores: googleResults,
          source: 'google_api',
          cached: true,
          syncedToDatabase: true
        };
      }

      // No results found anywhere
      return {
        stores: [],
        source: 'database',
        cached: false,
        syncedToDatabase: false
      };

    } catch (error) {
      console.error('Store sync service error:', error);
      throw error;
    }
  }

  /**
   * Search the local database for stores
   */
  private async searchDatabase(query: string, location: string, category?: string): Promise<StoreData[]> {
    try {
      // Search your MongoDB database for stores
      const response = await fetch(`/api/stores/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&category=${encodeURIComponent(category || '')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`🗄️ Database search found ${data.stores?.length || 0} stores`);
        return data.stores || [];
      }

      console.log('🗄️ Database search returned no results');
      return [];
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  /**
   * Search Google Places API for stores
   */
  private async searchGoogleAPI(query: string, location: string, category?: string): Promise<StoreData[]> {
    try {
      if (!googleApiService.isConfigured()) {
        console.warn('⚠️ Google API not configured, returning empty results');
        return [];
      }

      // Search Google Places API
      const googleResults = await googleApiService.searchPlaces(query, location);
      
      // Transform Google results to our store format
      const transformedStores: StoreData[] = await Promise.all(
        googleResults.map(async (place) => {
          // Get additional details for each place
          const details = await googleApiService.getPlaceDetails(place.place_id);
          
          return {
            storeName: place.name,
            storeType: this.mapGoogleTypeToStoreType(place.types, category),
            address: place.formatted_address,
            phone: details.formatted_phone_number,
            email: undefined, // Google doesn't provide email
            website: details.website,
            country: this.extractCountry(place.formatted_address),
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            description: this.generateDescription(place, details),
            hours: this.formatHours(details.opening_hours),
            rating: place.rating,
            tags: place.types,
            source: 'google_api' as const,
            googlePlaceId: place.place_id,
            lastUpdated: new Date()
          };
        })
      );

      return transformedStores;
    } catch (error) {
      console.error('Google API search error:', error);
      return [];
    }
  }

  /**
   * Sync Google API results to database for future searches
   */
  private async syncGoogleResultsToDatabase(stores: StoreData[]): Promise<number> {
    try {
      let syncedCount = 0;
      
      for (const store of stores) {
        try {
          // Check if store already exists (by Google Place ID or coordinates)
          const existingStore = await this.findExistingStore(store);
          
          if (!existingStore) {
            // Store doesn't exist, create new one
            await this.createStoreInDatabase(store);
            syncedCount++;
          } else {
            // Store exists, update with fresh data
            await this.updateStoreInDatabase(existingStore.id, store);
            syncedCount++;
          }
        } catch (error) {
          console.error(`Failed to sync store ${store.storeName}:`, error);
        }
      }
      
      return syncedCount;
    } catch (error) {
      console.error('Store sync to database error:', error);
      return 0;
    }
  }

  /**
   * Find existing store in database
   */
  private async findExistingStore(store: StoreData): Promise<any> {
    try {
      // Search by Google Place ID first
      if (store.googlePlaceId) {
        const response = await fetch(`/api/stores/search?googlePlaceId=${store.googlePlaceId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.stores && data.stores.length > 0) {
            return data.stores[0];
          }
        }
      }
      
      // Search by coordinates (within small radius)
      const response = await fetch(`/api/stores/search?lat=${store.coordinates.lat}&lng=${store.coordinates.lng}&radius=100`);
      if (response.ok) {
        const data = await response.json();
        if (data.stores && data.stores.length > 0) {
          return data.stores[0];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Find existing store error:', error);
      return null;
    }
  }

  /**
   * Create new store in database
   */
  private async createStoreInDatabase(store: StoreData): Promise<void> {
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...store,
          createdBy: 'google_api_sync' // Special identifier for auto-synced stores
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create store: ${response.statusText}`);
      }
      
      console.log(`✅ Created store: ${store.storeName}`);
    } catch (error) {
      console.error('Create store in database error:', error);
      throw error;
    }
  }

  /**
   * Update existing store in database
   */
  private async updateStoreInDatabase(storeId: string, store: StoreData): Promise<void> {
    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...store,
          lastUpdated: new Date()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update store: ${response.statusText}`);
      }
      
      console.log(`🔄 Updated store: ${store.storeName}`);
    } catch (error) {
      console.error('Update store in database error:', error);
      throw error;
    }
  }

  /**
   * Map Google place types to store types
   */
  private mapGoogleTypeToStoreType(googleTypes: string[], category?: string): string {
    // If user specified a category, use that
    if (category) {
      return category;
    }
    
    // Map Google types to our store types
    const typeMapping: { [key: string]: string } = {
      'electronics_store': 'electronics',
      'clothing_store': 'clothing',
      'supermarket': 'supermarket',
      'book_store': 'books',
      'furniture_store': 'furniture',
      'pharmacy': 'pharmacy',
      'sports_complex': 'sports',
      'toy_store': 'toys',
      'hardware_store': 'hardware',
      'car_dealer': 'automotive',
      'beauty_salon': 'beauty',
      'home_goods_store': 'household',
      'computer_store': 'computing',
      'garden_center': 'gardening',
      'pet_store': 'pets',
      'jewelry_store': 'jewelry',
      'restaurant': 'restaurant',
      'hospital': 'healthcare',
      'school': 'education',
      'movie_theater': 'entertainment'
    };
    
    for (const googleType of googleTypes) {
      if (typeMapping[googleType]) {
        return typeMapping[googleType];
      }
    }
    
    return 'other';
  }

  /**
   * Extract country from formatted address
   */
  private extractCountry(address: string): string {
    // Simple country extraction - in production, use a proper geocoding service
    const parts = address.split(',').map(part => part.trim());
    return parts[parts.length - 1] || 'Unknown';
  }

  /**
   * Generate store description from Google data
   */
  private generateDescription(place: any, details: any): string {
    let description = `${place.name} located at ${place.formatted_address}`;
    
    if (place.rating) {
      description += `. Rated ${place.rating}/5 stars`;
    }
    
    if (details.opening_hours?.open_now !== undefined) {
      description += details.opening_hours.open_now ? '. Currently open' : '. Currently closed';
    }
    
    return description;
  }

  /**
   * Format opening hours from Google data
   */
  private formatHours(openingHours?: any): string {
    if (!openingHours) return 'Hours not available';
    
    if (openingHours.open_now !== undefined) {
      return openingHours.open_now ? 'Open now' : 'Closed now';
    }
    
    return 'Hours available';
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Get popular searches
   */
  getPopularSearches(limit: number = 10) {
    return cacheService.getPopularSearches(limit);
  }

  /**
   * Clear cache
   */
  clearCache() {
    cacheService.clear();
  }
}

// Export singleton instance
export const storeSyncService = new StoreSyncService();
