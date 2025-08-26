import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

// GET /api/stores/user - Get stores created by a specific user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user123'; // Default for development mode
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build query
    let query: any = { createdBy: userId };
    
    if (!includeInactive) {
      query.isActive = true;
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
    console.error('Error fetching user stores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user stores' },
      { status: 500 }
    );
  }
}
