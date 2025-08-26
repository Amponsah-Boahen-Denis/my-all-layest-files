import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token required' },
        { status: 401 }
      );
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Find user and validate refresh token
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return NextResponse.json(
          { success: false, message: 'User not found or inactive' },
          { status: 401 }
        );
      }

      // Check if refresh token exists in user's refresh tokens
      const tokenExists = user.refreshTokens?.some(
        (token: any) => token.tokenId === decoded.tokenId && 
                       token.token === refreshToken &&
                       new Date(token.expiresAt) > new Date()
      );

      if (!tokenExists) {
        return NextResponse.json(
          { success: false, message: 'Invalid refresh token' },
          { status: 401 }
        );
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
