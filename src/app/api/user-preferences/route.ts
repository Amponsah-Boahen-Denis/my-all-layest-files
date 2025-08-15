import { NextRequest, NextResponse } from 'next/server';

// Mock user preferences - in a real app, this would be stored in a database
let userPreferences: Record<string, any> = {
  default: {
    layout: 'grid'
  }
};

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from the auth token
    // and fetch their specific preferences
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      // Return default preferences for unauthenticated users
      return NextResponse.json(userPreferences.default);
    }

    // For now, return default preferences
    // In a real app, you would:
    // 1. Validate the auth token
    // 2. Extract user ID
    // 3. Fetch user-specific preferences from database
    return NextResponse.json(userPreferences.default);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { layout } = body;

    // Validate layout value
    if (!layout || !['grid', 'list'].includes(layout)) {
      return NextResponse.json(
        { error: 'Invalid layout value. Must be "grid" or "list"' },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Validate the auth token
    // 2. Extract user ID
    // 3. Update user-specific preferences in database
    
    // For now, update the default preferences
    userPreferences.default.layout = layout;

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: userPreferences.default
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
} 