import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, password, adminKey } = await request.json();
    
    // Verify admin key (you should set this in your environment variables)
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'your-admin-secret-key-change-in-production';
    
    if (adminKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin key' },
        { status: 403 }
      );
    }
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin user
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin', // Set role as admin
      isActive: true
    });

    await newUser.save();

    // Remove password from response
    const { password: _, ...userResponse } = newUser.toObject();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Admin registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
