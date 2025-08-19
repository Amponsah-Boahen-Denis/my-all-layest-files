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
      { error: 'Failed to fetch stores' },
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
    if (!storeName || !storeType || !address || !country || !createdBy) {
      return NextResponse.json(
        { error: 'Store Name, Store Type, Address, Country, and Creator are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (coordinates && (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number')) {
      return NextResponse.json(
        { error: 'Invalid coordinates format' },
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
      createdBy
    });

    // Save to database
    await newStore.save();

    // Populate creator info
    await newStore.populate('createdBy', 'firstName lastName businessName');

    return NextResponse.json(
      { message: 'Store created successfully', store: newStore },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating store:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[id] - Update existing store
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { storeName, storeType, address, phone, email, website, country } = body;

    // Validate required fields
    if (!storeName || !storeType || !address || !country) {
      return NextResponse.json(
        { error: 'Store Name, Store Type, Address, and Country are required' },
        { status: 400 }
      );
    }

    // Find and update store
    const storeIndex = mockStores.findIndex(store => store.id === id);
    if (storeIndex === -1) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    mockStores[storeIndex] = {
      ...mockStores[storeIndex],
      storeName,
      storeType,
      address,
      phone: phone || null,
      email: email || null,
      website: website || null,
      country,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      message: 'Store updated successfully',
      store: mockStores[storeIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[id] - Delete store
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Find and delete store
    const storeIndex = mockStores.findIndex(store => store.id === id);
    if (storeIndex === -1) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const deletedStore = mockStores.splice(storeIndex, 1)[0];

    return NextResponse.json({
      message: 'Store deleted successfully',
      store: deletedStore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete store' },
      { status: 500 }
    );
  }
} 