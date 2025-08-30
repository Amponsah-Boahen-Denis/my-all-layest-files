'use client';

import React, { useMemo, Suspense, lazy, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navigation.module.css';

// Lazy load heavy components with preloading hints
const AdminDropdown = lazy(() => import('./AdminDropdown'), {
  ssr: false // Disable SSR for admin components to improve performance
});
const UserSection = lazy(() => import('./UserSection'), {
  ssr: false // Disable SSR for user components to improve performance
});

// Memoized navigation links - static, never changes
const NavigationLinks = React.memo(() => (
  <>
    <Link href="/" className={styles.link} prefetch={false}>
              Home
            </Link>
    <Link href="/search" className={styles.link} prefetch={false}>
              Search
            </Link>
  </>
));

NavigationLinks.displayName = 'NavigationLinks';

// Memoized authenticated user links - only re-renders when auth state changes
const AuthenticatedLinks = React.memo(({ isAuthenticated }: { isAuthenticated: boolean }) => {
  if (!isAuthenticated) return null;
  
  return (
    <>
      <Link href="/history" className={styles.link} prefetch={false}>
                  History
                </Link>
      <Link href="/analytics" className={styles.link} prefetch={false}>
                  Analytics
                </Link>
      <Link href="/profile" className={styles.link} prefetch={false}>
        Profile & Stores
                      </Link>
    </>
  );
});

AuthenticatedLinks.displayName = 'AuthenticatedLinks';

// Memoized auth section - only re-renders when auth state changes
const AuthSection = React.memo(({ isAuthenticated, user }: { isAuthenticated: boolean; user: any }) => {
  if (isAuthenticated) {
    return (
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <UserSection user={user} />
      </Suspense>
    );
  }
  
  return (
    <>
      <Link href="/login" className={styles.loginLink} prefetch={false}>
                  Sign In
                </Link>
      <Link href="/register" className={styles.registerLink} prefetch={false}>
                  Sign Up
                </Link>
              </>
  );
});

AuthSection.displayName = 'AuthSection';

// Memoized logo component - static, never changes
const Logo = React.memo(() => (
  <Link href="/" className={styles.logo} prefetch={false}>
    Store Locator
  </Link>
));

Logo.displayName = 'Logo';

// Memoized links container - only re-renders when auth state changes
const LinksContainer = React.memo(({ 
  isAuthenticated, 
  user 
}: { 
  isAuthenticated: boolean; 
  user: any;
}) => {
  // Memoize admin navigation to prevent unnecessary re-renders
  const adminNavigation = useMemo(() => {
    if (!isAuthenticated || user?.role !== 'admin') return null;
    
    return (
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <AdminDropdown />
      </Suspense>
    );
  }, [isAuthenticated, user?.role]);

  return (
    <div className={styles.links}>
      <NavigationLinks />
      <AuthenticatedLinks isAuthenticated={isAuthenticated} />
      {adminNavigation}
    </div>
  );
});

LinksContainer.displayName = 'LinksContainer';

const Navigation = React.memo(() => {
  const { user, isAuthenticated } = useAuth();

  // Memoize the entire navigation structure to prevent unnecessary re-renders
  const navigationContent = useMemo(() => (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Logo />
        
        <LinksContainer isAuthenticated={isAuthenticated} user={user} />

        <div className={styles.auth}>
          <AuthSection isAuthenticated={isAuthenticated} user={user} />
          </div>
        </div>
      </nav>
  ), [isAuthenticated, user]);

  return navigationContent;
});

Navigation.displayName = 'Navigation';

export default Navigation; 