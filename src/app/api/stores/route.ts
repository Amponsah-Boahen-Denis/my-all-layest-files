import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

// GET /api/stores - List stores with pagination and search
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const storeType = searchParams.get('storeType') || '';
    const address = searchParams.get('address') || '';
    const country = searchParams.get('country') || '';

    // Build query
    let query: any = { isActive: true };

    // Apply search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Apply store type filter
    if (storeType) {
      query.storeType = storeType;
    }

    // Apply address filter
    if (address) {
      query.address = { $regex: address, $options: 'i' };
    }

    // Apply country filter
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [stores, totalStores] = await Promise.all([
      Store.find(query)
        .populate('createdBy', 'firstName lastName businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Store.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalStores / limit);

    return NextResponse.json({
      success: true,
      stores,
      totalStores,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });

  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

// POST /api/stores - Create new store
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const body = await request.json();
    const { 
      storeName, 
      storeType, 
      address, 
      phone, 
      email, 
      website, 
      country,
      coordinates,
      description,
      hours,
      rating,
      tags,
      source,
      googlePlaceId,
      createdBy
    } = body;

    // Validate required fields
    if (!storeName || !storeType || !address || !country) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Store Name, Store Type, Address, and Country are required' 
        },
        { status: 400 }
      );
    }

    // Validate coordinates if provided
    if (coordinates) {
      if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid coordinates format. Latitude and longitude must be numbers.' 
          },
          { status: 400 }
        );
      }
      
      if (coordinates.lat < -90 || coordinates.lat > 90) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Latitude must be between -90 and 90 degrees' 
          },
          { status: 400 }
        );
      }
      
      if (coordinates.lng < -180 || coordinates.lng > 180) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Longitude must be between -180 and 180 degrees' 
          },
          { status: 400 }
        );
      }
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rating must be between 0 and 5' 
        },
        { status: 400 }
      );
    }

    // Create new store
    const newStore = new Store({
      storeName: storeName.trim(),
      storeType: storeType.trim(),
      address: address.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      website: website?.trim() || null,
      country: country.trim(),
      coordinates: coordinates || { lat: 0, lng: 0 },
      description: description?.trim() || null,
      hours: hours?.trim() || null,
      rating: rating || 0,
      tags: tags || [],
      isActive: true,
      source: source || 'user_created',
      googlePlaceId: googlePlaceId || null,
      createdBy: createdBy || 'user123' // Fallback for development mode
    });

    // Save to database
    await newStore.save();

    // Populate creator info
    await newStore.populate('createdBy', 'firstName lastName businessName');

    return NextResponse.json(
      { 
        success: true,
        message: 'Store created successfully', 
        store: newStore 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating store:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false,
          error: validationErrors.join(', ') 
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { 
          success: false,
          error: `${field} already exists. Please use a different value.` 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create store' 
      },
      { status: 500 }
    );
  }
}

// Note: PUT and DELETE operations for individual stores are handled in /api/stores/[id]/route.ts 