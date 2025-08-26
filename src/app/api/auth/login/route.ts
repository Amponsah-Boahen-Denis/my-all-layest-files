import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, rememberMe } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const refreshTokenId = crypto.randomBytes(32).toString('hex');
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      tokenId: refreshTokenId
    });

    // Store refresh token in user document
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    
    user.refreshTokens.push({
      tokenId: refreshTokenId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    });

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Set cookies for refresh token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      expiresIn: rememberMe ? '7d' : '24h'
    });

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/auth/login - Check login status (for protected routes)
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // In production, verify JWT token here
    // For now, just check if it's a mock token
    if (!token.startsWith('mock_jwt_token_')) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Extract user ID from mock token
    const tokenParts = token.split('_');
    const userId = tokenParts[tokenParts.length - 1];
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Return user info (without sensitive data)
    const { password: _, ...userResponse } = user.toObject();
    
    return NextResponse.json({
      authenticated: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during token verification' },
      { status: 500 }
    );
  }
} 