'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';

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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to prevent unnecessary re-renders
  const userRef = useRef<User | null>(null);
  const isAuthenticatedRef = useRef(false);
  const isLoadingRef = useRef(true);
  
  // Batch state updates to reduce re-renders
  const updateAuthState = useCallback((updates: Partial<{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }>) => {
    if (updates.user !== undefined) {
      setUser(updates.user);
      userRef.current = updates.user;
    }
    if (updates.isAuthenticated !== undefined) {
      setIsAuthenticated(updates.isAuthenticated);
      isAuthenticatedRef.current = updates.isAuthenticated;
    }
    if (updates.isLoading !== undefined) {
      setIsLoading(updates.isLoading);
      isLoadingRef.current = updates.isLoading;
    }
  }, []);

  // Check for existing auth on mount - only once
  useEffect(() => {
    if (!isInitialized) {
      checkAuthStatus();
    }
  }, [isInitialized]);

  // Check if user is authenticated - optimized to run only once
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        updateAuthState({ isLoading: false });
        setIsInitialized(true);
        return;
      }

      // Check if token is expired before making API call
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        // Token expired, clear auth without API call
        clearAuth();
        setIsInitialized(true);
        return;
      }

      // Only refresh if token is close to expiring (within 5 minutes)
      const timeUntilExpiry = parseInt(expiresAt || '0') - Date.now();
      if (timeUntilExpiry > 5 * 60 * 1000) {
        // Token still valid, just set user state
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            updateAuthState({ user: parsedUser, isAuthenticated: true, isLoading: false });
          } catch (e) {
            // Invalid user data, clear it
            clearAuth();
          }
        } else {
          updateAuthState({ isLoading: false });
        }
        setIsInitialized(true);
        return;
      }

      // Token needs refresh
      await refreshToken();
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
    } finally {
      setIsInitialized(true);
    }
  }, [isInitialized, updateAuthState]);

  // Login function - optimized to reduce state updates
  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
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

      // Store access token and user data locally
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Batch state updates
      updateAuthState({
        user: data.user,
        isAuthenticated: true
      });

      // Set token expiration
      const expiresIn = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 24 hours
      const expiresAt = Date.now() + expiresIn;
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }, [updateAuthState]);

  // Logout function - optimized
  const logout = useCallback(async () => {
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
  }, []);

  // Refresh access token - optimized to reduce unnecessary calls
  const refreshToken = useCallback(async () => {
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
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Batch state updates
      updateAuthState({
        user: data.user,
        isAuthenticated: true
      });

      // Update token expiration
      const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());

    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }, [updateAuthState]);

  // Clear authentication state - optimized
  const clearAuth = useCallback(() => {
    updateAuthState({
      user: null,
      isAuthenticated: false
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('userData');
  }, [updateAuthState]);

  // Auto-refresh token before expiration - optimized interval
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;

    const checkTokenExpiration = () => {
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (!expiresAt) return;

      const timeUntilExpiry = parseInt(expiresAt) - Date.now();
      
      // Refresh token 5 minutes before expiration
      if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshToken().catch(clearAuth);
      }
    };

    // Check every 5 minutes instead of every minute
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    checkTokenExpiration(); // Check immediately

    return () => clearInterval(interval);
  }, [isAuthenticated, isInitialized, refreshToken, clearAuth]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    clearAuth,
  }), [user, isAuthenticated, isLoading, login, logout, refreshToken, clearAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 