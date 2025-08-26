import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    // Test database connection
    await connectDB();
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      message: 'Backend is running properly'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    }, { status: 503 });
  }
}
