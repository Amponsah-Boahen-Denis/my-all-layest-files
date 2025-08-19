'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TEMPORARY: Bypass authentication for frontend development
  const [user, setUser] = useState<User>({
    id: 'dev-user-123',
    firstName: 'Developer',
    lastName: 'User',
    email: 'dev@example.com',
    role: 'admin' // Set as admin for development to see admin interface
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always true for development

  // TEMPORARY: Skip all authentication checks
  useEffect(() => {
    // Set authenticated state immediately for development
    setIsAuthenticated(true);
    setUser({
      id: 'dev-user-123',
      firstName: 'Developer',
      lastName: 'User',
      email: 'dev@example.com',
      role: 'admin'
    });
    
    // Skip token validation
    console.log('🔓 Development mode: Authentication bypassed');
  }, []);

  const login = async (email: string, password: string) => {
    // TEMPORARY: Always succeed for development
    console.log('🔓 Development mode: Login bypassed');
    setIsAuthenticated(true);
    setUser({
      id: 'dev-user-123',
      firstName: 'Developer',
      lastName: 'User',
      email: email || 'dev@example.com',
      role: 'admin'
    });
  };

  const register = async (userData: any) => {
    // TEMPORARY: Always succeed for development
    console.log('🔓 Development mode: Registration bypassed');
    setIsAuthenticated(true);
    setUser({
      id: 'dev-user-123',
      firstName: userData.firstName || 'Developer',
      lastName: userData.lastName || 'User',
      email: userData.email || 'dev@example.com',
      role: 'admin'
    });
  };

  const logout = () => {
    // TEMPORARY: Don't actually logout in development mode
    console.log('🔓 Development mode: Logout bypassed');
    // Keep user authenticated for development
    setIsAuthenticated(true);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 