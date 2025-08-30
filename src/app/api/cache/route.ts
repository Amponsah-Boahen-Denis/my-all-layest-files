import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

// GET /api/cache - Get cache statistics and management info
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get cache statistics
      const totalStores = await Store.countDocuments();
      const googleStores = await Store.countDocuments({ source: 'google_api' });
      const userStores = await Store.countDocuments({ source: 'user_created' });
      const databaseStores = await Store.countDocuments({ source: 'database' });
      
      // Get recent Google updates
      const recentUpdates = await Store.find({ 
        source: 'google_api',
        lastGoogleUpdate: { $exists: true, $ne: null }
      })
      .sort({ lastGoogleUpdate: -1 })
      .limit(10)
      .select('storeName lastGoogleUpdate rating')
      .lean();

      return NextResponse.json({
        success: true,
        cacheStats: {
          total: totalStores,
          google: googleStores,
          user: userStores,
          database: databaseStores,
          googlePercentage: totalStores > 0 ? Math.round((googleStores / totalStores) * 100) : 0
        },
        recentUpdates,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'list') {
      // List cached Google stores
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const skip = (page - 1) * limit;

      const googleStores = await Store.find({ source: 'google_api' })
        .sort({ lastGoogleUpdate: -1 })
        .skip(skip)
        .limit(limit)
        .select('storeName storeType address country rating lastGoogleUpdate googlePlaceId')
        .lean();

      const total = await Store.countDocuments({ source: 'google_api' });

      return NextResponse.json({
        success: true,
        stores: googleStores,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      });
    }

    // Default: return basic cache info
    const googleStores = await Store.countDocuments({ source: 'google_api' });
    const totalStores = await Store.countDocuments();

    return NextResponse.json({
      success: true,
      message: 'Google Places Cache Management',
      cacheInfo: {
        totalStores,
        googleStores,
        googlePercentage: totalStores > 0 ? Math.round((googleStores / totalStores) * 100) : 0
      },
      endpoints: {
        stats: '/api/cache?action=stats',
        list: '/api/cache?action=list&page=1&limit=20',
        clear: '/api/cache?action=clear'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting cache info:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get cache information'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cache - Clear or manage cache
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'clear') {
      // Clear all Google API cached stores
      const result = await Store.deleteMany({ source: 'google_api' });
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${result.deletedCount} cached Google stores`,
        deletedCount: result.deletedCount,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'clear-old') {
      // Clear old Google API cached stores (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await Store.deleteMany({
        source: 'google_api',
        lastGoogleUpdate: { $lt: thirtyDaysAgo }
      });
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${result.deletedCount} old cached Google stores`,
        deletedCount: result.deletedCount,
        cutoffDate: thirtyDaysAgo.toISOString(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'refresh') {
      // Mark Google stores for refresh (set lastGoogleUpdate to null)
      const result = await Store.updateMany(
        { source: 'google_api' },
        { $unset: { lastGoogleUpdate: 1 } }
      );
      
      return NextResponse.json({
        success: true,
        message: `Marked ${result.modifiedCount} Google stores for refresh`,
        modifiedCount: result.modifiedCount,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid action. Use: clear, clear-old, or refresh'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing cache:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage cache'
      },
      { status: 500 }
    );
  }
}
