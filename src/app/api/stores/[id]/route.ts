import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

// GET /api/stores/[id] - Get specific store
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid store ID format' },
        { status: 400 }
      );
    }
    
    const store = await Store.findById(id).populate('createdBy', 'firstName lastName businessName');

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      store 
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store' },
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
    await connectDB();
    const { id } = params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid store ID format' },
        { status: 400 }
      );
    }
    
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
      tags
    } = body;

    // Validate required fields
    if (!storeName || !storeType || !address || !country) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Store Name, Store Type, Address, and Country are required' 
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

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rating must be between 0 and 5' 
        },
        { status: 400 }
      );
    }

    // Check if store exists and is active
    const existingStore = await Store.findById(id);
    if (!existingStore) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    if (!existingStore.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot update inactive store' },
        { status: 400 }
      );
    }

    // Find and update store
    const updatedStore = await Store.findByIdAndUpdate(
      id,
      {
        storeName: storeName.trim(),
        storeType: storeType.trim(),
        address: address.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        country: country.trim(),
        coordinates: coordinates || null,
        description: description?.trim() || null,
        hours: hours?.trim() || null,
        rating: rating || 0,
        tags: tags || [],
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName businessName');

    if (!updatedStore) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Store updated successfully',
      store: updatedStore,
    });
  } catch (error: any) {
    console.error('Error updating store:', error);
    
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

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { 
          success: false,
          error: `${field} already exists. Please use a different value.` 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update store' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[id] - Delete store (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid store ID format' },
        { status: 400 }
      );
    }

    // Check if store exists
    const existingStore = await Store.findById(id);
    if (!existingStore) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if store is already inactive
    if (!existingStore.isActive) {
      return NextResponse.json(
        { success: false, error: 'Store is already inactive' },
        { status: 400 }
      );
    }

    // Find and soft delete store by setting isActive to false
    const deletedStore = await Store.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!deletedStore) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully',
      store: deletedStore,
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete store' },
      { status: 500 }
    );
  }
} 