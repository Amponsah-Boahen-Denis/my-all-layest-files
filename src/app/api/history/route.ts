import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SearchHistory from '@/models/SearchHistory';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId') || 'user123'; // Fallback for development mode
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch search history from database
    const [history, totalItems] = await Promise.all([
      SearchHistory.find({ userId })
        .sort({ searchDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SearchHistory.countDocuments({ userId })
    ]);
    
    const totalPages = Math.ceil(totalItems / limit);
    
    return NextResponse.json({
      success: true,
      history: history.map(item => ({
        id: item._id,
        locationId: item._id,
        name: item.stores[0]?.name || 'Unknown Store',
        address: `${item.location}, ${item.country}`,
        type: item.productCategory,
        phone: item.stores[0]?.phone || null,
        email: item.stores[0]?.email || null,
        coordinates: {
          lat: item.coordinates.lat,
          lon: item.coordinates.lng
        },
        searchQuery: item.query,
        savedAt: item.searchDate
      })),
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch history' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { locationId, name, address, type, phone, email, coordinates, searchQuery } = body;

    // Validation - only name, address, type, and searchQuery are required
    if (!locationId || !name || !address || !type || !searchQuery) {
      return NextResponse.json(
        { message: 'Required fields: locationId, name, address, type, searchQuery' },
        { status: 400 }
      );
    }

    // Parse address to extract location and country
    const addressParts = address.split(', ');
    const location = addressParts[0] || '';
    const country = addressParts[addressParts.length - 1] || '';

    // Create new search history entry
    const newHistoryEntry = new SearchHistory({
      userId: 'user123', // Fallback for development mode
      query: searchQuery,
      country: country,
      location: location,
      productCategory: type,
      stores: [{
        id: locationId,
        name: name,
        localizedName: name,
        address: address,
        phone: phone || null,
        email: email || null,
        coordinates: {
          lat: coordinates?.lat || 0,
          lon: coordinates?.lng || 0
        },
        type: type,
        relevance: 100
      }],
      coordinates: {
        lat: coordinates?.lat || 0,
        lng: coordinates?.lng || 0
      },
      layout: 'grid',
      searchDate: new Date()
    });

    // Save to database
    await newHistoryEntry.save();

    // Get total count for this user
    const totalItems = await SearchHistory.countDocuments({ userId: 'user123' });

    return NextResponse.json({
      success: true,
      message: 'Saved to history successfully',
      totalItems
    });

  } catch (error) {
    console.error('Error saving to history:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to save to history' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'History item ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { message: 'Invalid history item ID format' },
        { status: 400 }
      );
    }

    // Delete from database
    const deletedItem = await SearchHistory.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json(
        { message: 'History item not found' },
        { status: 404 }
      );
    }

    // Get updated total count
    const totalItems = await SearchHistory.countDocuments({ userId: 'user123' });

    return NextResponse.json({
      success: true,
      message: 'History item deleted successfully',
      totalItems
    });

  } catch (error) {
    console.error('Error deleting history item:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete history item' 
      },
      { status: 500 }
    );
  }
} 