import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user from request (if authenticated)
    const user = getUserFromRequest(request);
    
    if (user) {
      // Get refresh token from cookies
      const refreshToken = request.cookies.get('refreshToken')?.value;
      
      if (refreshToken) {
        // Find user and remove the specific refresh token
        const userDoc = await User.findById(user.userId);
        
        if (userDoc && userDoc.refreshTokens) {
          // Remove the current refresh token
          userDoc.refreshTokens = userDoc.refreshTokens.filter(
            (token: any) => token.token !== refreshToken
          );
          await userDoc.save();
        }
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  }
}
