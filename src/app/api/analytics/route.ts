import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SearchAnalytics from '@/models/SearchAnalytics';

// POST /api/analytics - Track search analytics
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      searchQuery, 
      location, 
      country, 
      productCategory, 
      userId, 
      searchResults, 
      searchTime, 
      searchSource,
      coordinates,
      sessionId,
      deviceType,
      browser,
      os
    } = body;

    // Validate required fields
    if (!searchQuery || !location || !country || !searchResults || !searchTime || !searchSource) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: searchQuery, location, country, searchResults, searchTime, searchSource' 
        },
        { status: 400 }
      );
    }

    // Validate searchTime
    if (typeof searchTime !== 'number' || searchTime < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Search time must be a positive number' 
        },
        { status: 400 }
      );
    }

    // Validate searchResults
    if (typeof searchResults !== 'number' || searchResults < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Search results count must be a positive number' 
        },
        { status: 400 }
      );
    }

    // Validate searchSource
    const validSources = ['cache', 'database', 'google_api'];
    if (!validSources.includes(searchSource)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid search source. Must be one of: cache, database, google_api' 
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

    // Get user agent and IP from request headers
    const userAgent = request.headers.get('user-agent') || body.userAgent;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || body.ipAddress;

    // Create analytics entry
    const analyticsEntry = new SearchAnalytics({
      searchQuery: searchQuery.trim(),
      location: location.trim(),
      country: country.trim(),
      productCategory: productCategory?.trim() || null,
      userId: userId || null,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      searchResults,
      searchTime,
      searchSource,
      coordinates: coordinates || null,
      timestamp: new Date(),
      sessionId: sessionId || `session_${Date.now()}`,
      deviceType: deviceType || 'desktop',
      browser: browser || 'Unknown',
      os: os || 'Unknown'
    });

    await analyticsEntry.save();

    return NextResponse.json(
      { 
        success: true,
        message: 'Analytics tracked successfully', 
        id: analyticsEntry._id 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error tracking analytics:', error);
    
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

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to track analytics' 
      },
      { status: 500 }
    );
  }
}

// GET /api/analytics - Get analytics data with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    const country = searchParams.get('country') || '';
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid period. Must be one of: 7d, 30d, 90d, 1y' 
        },
        { status: 400 }
      );
    }

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Limit must be between 1 and 100' 
        },
        { status: 400 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Build query
    let query: any = { timestamp: { $gte: startDate } };
    
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (category) {
      query.productCategory = { $regex: category, $options: 'i' };
    }

    // Get popular search queries
    const popularQueries = await SearchAnalytics.aggregate([
      { $match: query },
      { $group: { _id: '$searchQuery', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    // Get popular locations
    const popularLocations = await SearchAnalytics.aggregate([
      { $match: query },
      { $group: { _id: { location: '$location', country: '$country' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    // Get popular categories
    const popularCategories = await SearchAnalytics.aggregate([
      { $match: { ...query, productCategory: { $exists: true, $ne: null } } },
      { $group: { _id: '$productCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    // Get search performance metrics
    const performanceMetrics = await SearchAnalytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          avgSearchTime: { $avg: '$searchTime' },
          avgResults: { $avg: '$searchResults' },
          cacheHits: {
            $sum: { $cond: [{ $eq: ['$searchSource', 'cache'] }, 1, 0] }
          },
          databaseHits: {
            $sum: { $cond: [{ $eq: ['$searchSource', 'database'] }, 1, 0] }
          },
          googleApiHits: {
            $sum: { $cond: [{ $eq: ['$searchSource', 'google_api'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get device and browser statistics
    const deviceStats = await SearchAnalytics.aggregate([
      { $match: query },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const browserStats = await SearchAnalytics.aggregate([
      { $match: query },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get time-based trends (hourly distribution)
    const hourlyTrends = await SearchAnalytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      success: true,
      period,
      startDate,
      endDate: now,
      popularQueries,
      popularLocations,
      popularCategories,
      performanceMetrics: performanceMetrics[0] || {},
      deviceStats,
      browserStats,
      hourlyTrends
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch analytics' 
      },
      { status: 500 }
    );
  }
}
