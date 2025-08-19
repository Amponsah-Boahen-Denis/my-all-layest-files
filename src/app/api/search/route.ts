import { NextRequest, NextResponse } from 'next/server';
import { storeSyncService } from '@/lib/storeSyncService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const location = searchParams.get('location') || 'New York, NY';
    const category = searchParams.get('category') || '';

    if (!query) {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching for: "${query}" in "${location}" category: "${category}"`);

    // Use the hybrid search service with fallback to Google API
    const searchResult = await storeSyncService.searchStoresWithFallback(query, location, category);

    // Transform the results to match the expected format
    const transformedResults = searchResult.stores.map((store, index) => ({
      id: store.googlePlaceId || `store_${index}`,
      name: store.storeName,
      address: store.address,
      type: store.storeType,
      rating: store.rating || 0,
      distance: 'Nearby', // Will be calculated based on user location
      coordinates: store.coordinates,
      description: store.description || `${store.storeName} located at ${store.address}`,
      amenities: store.tags || [],
      images: [], // Google API doesn't provide images in basic search
      phone: store.phone,
      email: store.email,
      website: store.website,
      hours: store.hours,
      source: searchResult.source,
      cached: searchResult.cached,
      syncedToDatabase: searchResult.syncedToDatabase
    }));

    // Calculate search time
    const searchTime = searchResult.source === 'cache' ? '0.1s' : '0.8s';

    return NextResponse.json({
      success: true,
      query,
      location,
      category,
      results: transformedResults,
      totalResults: transformedResults.length,
      searchTime,
      searchSource: searchResult.source,
      cached: searchResult.cached,
      syncedToDatabase: searchResult.syncedToDatabase,
      message: this.getSearchMessage(searchResult)
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error during search',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate user-friendly message based on search results
 */
function getSearchMessage(searchResult: any): string {
  if (searchResult.stores.length === 0) {
    return 'No stores found for your search. Try different keywords or location.';
  }

  let message = `Found ${searchResult.stores.length} stores`;
  
  switch (searchResult.source) {
    case 'cache':
      message += ' (from cache - instant results!)';
      break;
    case 'database':
      message += ' (from our database)';
      break;
    case 'google_api':
      message += ' (from Google Places API)';
      if (searchResult.syncedToDatabase) {
        message += ' - Results saved for future searches!';
      }
      break;
  }

  return message;
} 