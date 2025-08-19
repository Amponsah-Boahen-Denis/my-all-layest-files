import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5000';
    const googlePlaceId = searchParams.get('googlePlaceId');

    let searchCriteria: any = { isActive: true };

    // Text search across multiple fields
    if (query) {
      searchCriteria.$or = [
        { storeName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { storeType: { $regex: query, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      searchCriteria.storeType = { $regex: category, $options: 'i' };
    }

    // Location-based search
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);
      
      searchCriteria.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lngNum, latNum] // MongoDB uses [longitude, latitude]
          },
          $maxDistance: radiusNum
        }
      };
    }

    // Google Place ID search
    if (googlePlaceId) {
      searchCriteria.googlePlaceId = googlePlaceId;
    }

    // Location text search
    if (location) {
      searchCriteria.$or = searchCriteria.$or || [];
      searchCriteria.$or.push(
        { address: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } }
      );
    }

    console.log('🔍 Database search criteria:', JSON.stringify(searchCriteria, null, 2));

    // Execute the search
    const stores = await Store.find(searchCriteria)
      .sort({ rating: -1, createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`🗄️ Found ${stores.length} stores in database`);

    // Transform the results to match the expected format
    const transformedStores = stores.map(store => ({
      id: store._id.toString(),
      storeName: store.storeName,
      storeType: store.storeType,
      address: store.address,
      phone: store.phone,
      email: store.email,
      website: store.website,
      country: store.country,
      coordinates: store.coordinates,
      description: store.description,
      hours: store.hours,
      rating: store.rating,
      tags: store.tags,
      source: store.source || 'database',
      googlePlaceId: store.googlePlaceId,
      lastUpdated: store.updatedAt,
      createdAt: store.createdAt,
      isActive: store.isActive
    }));

    return NextResponse.json({
      success: true,
      stores: transformedStores,
      totalResults: transformedStores.length,
      searchCriteria: {
        query,
        location,
        category,
        coordinates: lat && lng ? { lat, lng, radius } : undefined,
        googlePlaceId
      }
    });

  } catch (error) {
    console.error('Database search error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Database search failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
