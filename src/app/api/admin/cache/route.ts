import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cacheService';
import { storeSyncService } from '@/lib/storeSyncService';

// GET /api/admin/cache - Get cache statistics and management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return getCacheStats();
      case 'popular':
        return getPopularSearches();
      case 'clear':
        return clearCache();
      default:
        return getCacheOverview();
    }
  } catch (error) {
    console.error('Cache admin error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to process cache request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/cache - Cache management actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'clear':
        cacheService.clear();
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully'
        });
      
      case 'cleanup':
        cacheService.cleanup();
        return NextResponse.json({
          success: true,
          message: 'Cache cleanup completed'
        });
      
      default:
        return NextResponse.json(
          { 
            success: false,
            message: 'Invalid cache action' 
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cache admin POST error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to process cache action',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get comprehensive cache overview
async function getCacheOverview() {
  const cacheStats = cacheService.getStats();
  const popularSearches = cacheService.getPopularSearches(10);
  
  return NextResponse.json({
    success: true,
    cache: {
      overview: cacheStats,
      popularSearches,
      status: 'active',
      lastCleanup: new Date().toISOString()
    },
    message: 'Cache overview retrieved successfully'
  });
}

// Get cache statistics
async function getCacheStats() {
  const stats = cacheService.getStats();
  
  return NextResponse.json({
    success: true,
    stats,
    message: 'Cache statistics retrieved successfully'
  });
}

// Get popular searches
async function getPopularSearches() {
  const popularSearches = cacheService.getPopularSearches(20);
  
  return NextResponse.json({
    success: true,
    popularSearches,
    message: 'Popular searches retrieved successfully'
  });
}

// Clear cache
async function clearCache() {
  cacheService.clear();
  
  return NextResponse.json({
    success: true,
    message: 'Cache cleared successfully',
    clearedAt: new Date().toISOString()
  });
}
