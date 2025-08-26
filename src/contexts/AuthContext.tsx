'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to refresh token
      await refreshToken();
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store access token
      localStorage.setItem('accessToken', data.accessToken);
      
      // Set user state
      setUser(data.user);
      setIsAuthenticated(true);

      // Set token expiration
      const expiresIn = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 24 hours
      const expiresAt = Date.now() + expiresIn;
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to invalidate refresh token
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local auth state regardless of API call result
      clearAuth();
    }
  };

  // Refresh access token
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies for refresh token
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Token refresh failed');
      }

      // Update access token
      localStorage.setItem('accessToken', data.accessToken);
      
      // Update user state
      setUser(data.user);
      setIsAuthenticated(true);

      // Update token expiration
      const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  };

  // Clear authentication state
  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiresAt');
  };

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (!expiresAt) return;

      const timeUntilExpiry = parseInt(expiresAt) - Date.now();
      
      // Refresh token 5 minutes before expiration
      if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshToken().catch(clearAuth);
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);
    checkTokenExpiration(); // Check immediately

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 