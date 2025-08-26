'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  fallback 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    // Check role requirements if specified
    if (requiredRole && user && user.role !== requiredRole) {
      // Redirect to unauthorized page or show error
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['loading-spinner']}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className={styles['auth-required']}>
        <div className={styles['auth-message']}>
          <h2>Authentication Required</h2>
          <p>Please log in to access this page.</p>
          <button onClick={() => router.push('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && user && user.role !== requiredRole) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles['unauthorized-message']}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button onClick={() => router.push('/profile')}>
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
