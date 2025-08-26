import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from '@/lib/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Middleware to protect API routes
export const withAuth = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Access token required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      try {
        const decoded = verifyAccessToken(token);
        
        // Add user info to request
        (request as AuthenticatedRequest).user = decoded;
        
        // Continue to the actual handler
        return handler(request);
        
      } catch (error) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
};

// Middleware to check if user has specific role
export const withRole = (handler: Function, requiredRoles: string[]) => {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Access token required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = verifyAccessToken(token);
        
        // Check if user has required role
        if (!requiredRoles.includes(decoded.role)) {
          return NextResponse.json(
            { success: false, message: 'Insufficient permissions' },
            { status: 403 }
          );
        }
        
        // Add user info to request
        (request as AuthenticatedRequest).user = decoded;
        
        // Continue to the actual handler
        return handler(request);
        
      } catch (error) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
};

// Helper function to get user from request
export const getUserFromRequest = (request: NextRequest): JWTPayload | null => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return verifyAccessToken(token);
    
  } catch (error) {
    return null;
  }
};
