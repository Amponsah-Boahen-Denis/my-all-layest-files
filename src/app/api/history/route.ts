import { NextRequest, NextResponse } from 'next/server';

// Mock in-memory storage for history - in a real app this would be a database
let mockHistory: any[] = [
  {
    id: '1',
    locationId: '1',
    name: 'Tech Haven',
    address: 'New York, United States',
    type: 'Tech',
    phone: '+1-555-0123',
    email: 'info@techhaven.com',
    coordinates: { lat: 40.7128, lon: -74.0060 },
    searchQuery: 'laptop',
    savedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    locationId: '2',
    name: 'Fashion Forward',
    address: 'Los Angeles, United States',
    type: 'Apparel',
    phone: '+1-555-0456',
    email: 'contact@fashionforward.com',
    coordinates: { lat: 34.0522, lon: -118.2437 },
    searchQuery: 'shirt',
    savedAt: '2024-01-20T09:15:00Z'
  }
];

export async function GET() {
  try {
    // In a real app, this would filter by the authenticated user's ID
    return NextResponse.json({
      success: true,
      history: mockHistory,
      totalItems: mockHistory.length
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
    const body = await request.json();
    const { locationId, name, address, type, phone, email, coordinates, searchQuery } = body;

    // Validation - only name, address, type, and searchQuery are required
    if (!locationId || !name || !address || !type || !searchQuery) {
      return NextResponse.json(
        { message: 'Required fields: locationId, name, address, type, searchQuery' },
        { status: 400 }
      );
    }

    // Check if already exists in history
    const existingIndex = mockHistory.findIndex(item => 
      item.locationId === locationId && item.searchQuery === searchQuery
    );

    if (existingIndex !== -1) {
      // Update existing entry
      mockHistory[existingIndex] = {
        ...mockHistory[existingIndex],
        savedAt: new Date().toISOString()
      };
    } else {
      // Add new entry
      const newHistoryItem = {
        id: `history_${Date.now()}`,
        locationId,
        name,
        address,
        type,
        phone: phone || null,
        email: email || null,
        coordinates: coordinates || null,
        searchQuery,
        savedAt: new Date().toISOString()
      };

      mockHistory.unshift(newHistoryItem); // Add to beginning
    }

    // Limit history to 100 items
    if (mockHistory.length > 100) {
      mockHistory = mockHistory.slice(0, 100);
    }

    return NextResponse.json({
      success: true,
      message: 'Saved to history successfully',
      totalItems: mockHistory.length
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'History item ID is required' },
        { status: 400 }
      );
    }

    const initialLength = mockHistory.length;
    mockHistory = mockHistory.filter(item => item.id !== id);

    if (mockHistory.length === initialLength) {
      return NextResponse.json(
        { message: 'History item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'History item deleted successfully',
      totalItems: mockHistory.length
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