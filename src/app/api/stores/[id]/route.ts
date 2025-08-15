import { NextRequest, NextResponse } from 'next/server';

// Mock data for development - replace with real database connection
let mockStores: any[] = [
  {
    id: '1',
    storeName: 'Tech Haven',
    storeType: 'Tech',
    address: '123 Main St, New York, United States',
    phone: '+1-555-0123',
    email: 'info@techhaven.com',
    website: 'https://techhaven.com',
    country: 'United States',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    storeName: 'Fashion Forward',
    storeType: 'Apparel',
    address: '456 Oak Ave, London, United Kingdom',
    phone: '+44-20-7946-0958',
    email: 'hello@fashionforward.co.uk',
    website: 'https://fashionforward.co.uk',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    storeName: 'Fresh Market',
    storeType: 'Grocery',
    address: '789 Pine St, Toronto, Canada',
    phone: '+1-416-555-0123',
    email: 'contact@freshmarket.ca',
    website: 'https://freshmarket.ca',
    country: 'Canada',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    createdAt: new Date().toISOString(),
  },
];

// GET /api/stores/[id] - Get specific store
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const store = mockStores.find(store => store.id === id);

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ store });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[id] - Update existing store
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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