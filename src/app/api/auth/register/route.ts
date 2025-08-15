import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Business types mapping
const businessTypeMapping: Record<string, string> = {
  'Retail Store': 'retail',
  'Restaurant': 'restaurant',
  'Service Business': 'service',
  'Healthcare': 'healthcare',
  'Education': 'education',
  'Entertainment': 'entertainment',
  'Technology': 'technology',
  'Automotive': 'automotive',
  'Beauty & Wellness': 'beauty',
  'Home & Garden': 'home',
  'Sports & Fitness': 'sports',
  'Other': 'other'
};

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      businessName, 
      businessType, 
      acceptMarketing 
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !businessName || !businessType) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone?.trim() || null,
      businessName: businessName.trim(),
      businessType: businessTypeMapping[businessType] || businessType.toLowerCase(),
      acceptMarketing: acceptMarketing || false,
      isActive: true,
      role: 'business_owner'
    });

    // Save user to database
    await newUser.save();

    // Return success response (without password)
    const { password: _, ...userResponse } = newUser.toObject();
    
    return NextResponse.json({
      message: 'User registered successfully',
      user: userResponse,
      token: `mock_token_${Date.now()}` // Mock token for development
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}

// GET /api/auth/register - Check if email exists (for real-time validation)
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    return NextResponse.json({
      exists: !!existingUser,
      available: !existingUser
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 